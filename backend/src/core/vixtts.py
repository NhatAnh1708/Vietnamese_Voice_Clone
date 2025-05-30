from dataclasses import dataclass
import os
import subprocess
import librosa
from typing import Dict, List, Tuple, Optional, Any, AsyncGenerator

from huggingface_hub import hf_hub_download, snapshot_download
from loguru import logger
from underthesea import sent_tokenize
from pydub import AudioSegment
import torchaudio
import torch

from TTS.tts.configs.xtts_config import XttsConfig
from TTS.tts.models.xtts import Xtts
from utils.helpers import normalize_vietnamese_text, calculate_keep_len, get_file_name

class ViXTTS:
    """Vietnamese Text-to-Speech service using XTTS model."""
    
    def __init__(
        self,
        input_voice_path: str = os.path.join(os.path.dirname(os.path.abspath(__file__)), "audio_voice_input"),
        checkpoint_dir: str = "model_registry",
        repo_id: str = "capleaf/viXTTS",
        tts_language: str = "vi",
        filter_suffix: str = "_DeepFilterNet3.wav",
        cache_limit: int = 50
    ):
        """Initialize ViXTTS service.
        
        Args:
            checkpoint_dir: Directory for model checkpoints
            repo_id: Hugging Face repo ID for the model
            tts_language: Language code for TTS (default: Vietnamese)
            filter_suffix: Suffix for filtered audio files
            cache_limit: Maximum size of cache queue
        """
        # Model and directories
        self._model = None
        self._input_voice_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "audio_voice_input")
        self._script_dir = os.path.dirname(os.path.abspath(__file__))
        self._audio_background_dir = os.path.join(self._script_dir, "audio_background")
        self._output_dir = os.path.join(self._script_dir, "output")
        
        # Configuration
        self._checkpoint_dir = checkpoint_dir
        self._repo_id = repo_id
        self._required_files = ["model.pth", "config.json", "vocab.json", "speakers_xtts.pth"]
        self._tts_language = tts_language
        self._filter_suffix = filter_suffix
        self._cache_limit = cache_limit
        
        # Caching
        self._filter_cache: Dict[str, str] = {}
        self._cache_queue: List[str] = []
        self._conditioning_latents_cache: Dict[Tuple, Tuple] = {}
        self._speaker_reference_audio = ""
        
        # Create necessary directories
        os.makedirs(self._output_dir, exist_ok=True)
        os.makedirs(self._checkpoint_dir, exist_ok=True)
        os.makedirs(self._audio_background_dir, exist_ok=True)

    @property
    def model(self) -> Optional[Xtts]:
        """Get the XTTS model."""
        return self._model
    
    @property
    def is_model_loaded(self) -> bool:
        """Check if the model is loaded."""
        return self._model is not None

    def _invalidate_cache(self) -> None:
        """Invalidate the cache for the oldest key if cache limit is reached."""
        if len(self._cache_queue) > self._cache_limit:
            key_to_remove = self._cache_queue.pop(0)
            logger.info(f"Invalidating cache: {key_to_remove}")
            
            # Remove files if they exist
            if os.path.exists(key_to_remove):
                os.remove(key_to_remove)
                
            filtered_path = key_to_remove.replace(".wav", self._filter_suffix)
            if os.path.exists(filtered_path):
                os.remove(filtered_path)
                
            # Remove from caches
            if key_to_remove in self._filter_cache:
                del self._filter_cache[key_to_remove]
                
            if key_to_remove in self._conditioning_latents_cache:
                del self._conditioning_latents_cache[key_to_remove]

    async def init_and_load_model(self, use_deepspeed: bool = False) -> AsyncGenerator[str, None]:
        """Initialize and load the ViXTTS model.
        
        Args:
            use_deepspeed: Whether to use DeepSpeed optimization
            
        Yields:
            Status messages during model loading
        """
        # Check if required files exist, download if missing
        files_in_dir = os.listdir(self._checkpoint_dir)
        if not all(file in files_in_dir for file in self._required_files):
            yield f"Missing model files! Downloading from {self._repo_id}..."
            snapshot_download(
                repo_id=self._repo_id,
                repo_type="model",
                local_dir=self._checkpoint_dir,
            )
            hf_hub_download(
                repo_id="coqui/XTTS-v2",
                filename="speakers_xtts.pth",
                local_dir=self._checkpoint_dir,
            )
            yield "Model download finished..."

        # Load model configuration and initialize model
        xtts_config = os.path.join(self._checkpoint_dir, "config.json")
        config = XttsConfig()
        config.load_json(xtts_config)
        
        self._model = Xtts.init_from_config(config)
        yield "Loading model..."
        
        self._model.load_checkpoint(
            config, 
            checkpoint_dir=self._checkpoint_dir, 
            use_deepspeed=use_deepspeed
        )
        
        #TODO: Check if GPU is available and move model to GPU
        # if torch.cuda.is_available():
        #     self._model.cuda()

        yield "Model Loaded!"

    def _find_speaker_audio_file(self, voice_name: str) -> str:
        """Find speaker audio file based on sex and emotion.
        
        Args:
            voice_name: Speaker name
            
        Returns:
            Path to the speaker audio file
        """
        # Normalize sex parameter
        if voice_name == "nguyen-ngoc-ngan":
            return os.path.join(self._input_voice_path, "nguyen-ngoc-ngan.wav")
        if voice_name == "dinh-soan" or voice_name == "đinh-soan":
            return os.path.join(self._input_voice_path, "dinh-soan.wav")
        if voice_name == "bao-linh":
            return os.path.join(self._input_voice_path, "bao-linh.wav")
        if voice_name == "hong-nhung":
            return os.path.join(self._input_voice_path, "hong-nhung.wav")
        return None

    def _apply_deep_filter(self, audio_path: str) -> str:
        """Apply deepFilter to an audio file.
        
        Args:
            audio_path: Path to the audio file
            
        Returns:
            Path to the filtered audio file
        """
        # Check if filtered version is already cached
        logger.info(f"Audio path debug: {audio_path}")
        if audio_path in self._filter_cache:
            logger.info("Using filter cache...")
            return self._filter_cache[audio_path]
            
        # Apply deepFilter
        subprocess.run(
            [
                "deepFilter",
                audio_path,
                "-o",
                os.path.dirname(audio_path),
            ]
        )
        
        # Cache and return filtered path
        filtered_path = audio_path.replace(".wav", self._filter_suffix)
        self._filter_cache[audio_path] = filtered_path
        return filtered_path

    def _get_conditioning_latents(self, audio_path: str) -> Tuple[Any, Any]:
        """Get conditioning latents for the audio file.
        
        Args:
            audio_path: Path to the audio file
            
        Returns:
            Tuple of (gpt_cond_latent, speaker_embedding)
        """
        if not self.is_model_loaded:
            raise ValueError("Model not loaded. Call init_and_load_model() first.")
            
        # Create cache key based on audio path and model config
        cache_key = (
            audio_path,
            self._model.config.gpt_cond_len,
            self._model.config.max_ref_len,
            self._model.config.sound_norm_refs,
        )
        
        logger.debug(f"Cache key: {cache_key}")
        
        # Return cached latents if available
        if cache_key in self._conditioning_latents_cache:
            logger.info("Using conditioning latents cache...")
            return self._conditioning_latents_cache[cache_key]
        
        # Compute new latents
        logger.info("Computing conditioning latents...")
        gpt_cond_latent, speaker_embedding = self._model.get_conditioning_latents(
            audio_path=audio_path,
            gpt_cond_len=self._model.config.gpt_cond_len,
            max_ref_length=self._model.config.max_ref_len,
            sound_norm_refs=self._model.config.sound_norm_refs,
        )
        
        # Cache and return latents
        self._conditioning_latents_cache[cache_key] = (gpt_cond_latent, speaker_embedding)
        return gpt_cond_latent, speaker_embedding

    def _prepare_text(self, input_text: str, normalize_text: bool) -> str:
        """Prepare text for TTS processing.
        
        Args:
            input_text: Raw input text
            normalize_text: Whether to normalize Vietnamese text
            
        Returns:
            Processed text ready for TTS
        """
        # Apply Vietnamese normalization if needed
        if normalize_text and self._tts_language == "vi":
            return normalize_vietnamese_text(text=input_text)
        return input_text

    def _split_into_sentences(self, text: str) -> List[str]:
        """Split text into sentences based on language.
        
        Args:
            text: Text to split
            
        Returns:
            List of sentence strings
        """
        if self._tts_language in ["ja", "zh-cn"]:
            return [s for s in text.split("。") if s.strip()]
        else:
            return [s for s in sent_tokenize(text) if s.strip()]

    def _generate_speech_for_text(
        self, 
        text: str, 
        gpt_cond_latent: Any, 
        speaker_embedding: Any,
        pitch: float = 0.0,
        speed: float = 0.0,
        stability: float = 0.0,
        use_parameters: bool = False
    ) -> torch.Tensor:
        """Generate speech for the given text.
        
        Args:
            text: Text to synthesize
            gpt_cond_latent: GPT conditioning latent
            speaker_embedding: Speaker embedding
            pitch: Voice pitch adjustment (-1.0 to 1.0)
            speed: Voice speed adjustment (0.5 to 2.0)
            stability: Voice stability adjustment (0.0 to 1.0)
            use_parameters: Whether to use advanced parameters
        Returns:
            Generated audio waveform as tensor
        """
        # Split text into sentences
        sentences = self._split_into_sentences(text)
        
        from pprint import pprint
        pprint(sentences)
        
        # Process each sentence
        wav_chunks = []
        for sentence in sentences:
            if not sentence.strip():
                continue
                
            # Generate speech for the sentence
            wav_chunk = self._model.inference(
                text=sentence,
                language=self._tts_language,
                gpt_cond_latent=gpt_cond_latent,
                speaker_embedding=speaker_embedding,
                # The following values are carefully chosen for viXTTS
                temperature=0.3 * (1 + stability),  # Adjust stability (0.15 to 0.6)
                length_penalty=1.0,
                repetition_penalty=10.0,
                top_k=30,
                top_p=0.85,
                enable_text_splitting=True,
            )

            # Trim waveform based on text length
            keep_len = calculate_keep_len(sentence, self._tts_language)
            wav_chunk["wav"] = wav_chunk["wav"][:keep_len]
            
            if use_parameters:
                logger.info(f"Using parameters: pitch={pitch}, speed={speed}, stability={stability}")
                # Apply speed adjustment if needed
                if speed != 1.0:
                    # Speed adjustment affects the length of the audio
                    wav_data = wav_chunk["wav"]
                    wav_data = librosa.effects.time_stretch(wav_data, rate=speed)
                    wav_chunk["wav"] = wav_data
                    
                # Apply pitch adjustment if needed
                if pitch != 0.0:
                    wav_data = wav_chunk["wav"]
                    wav_data = librosa.effects.pitch_shift(wav_data, sr=24000, n_steps=pitch * 12)
                    wav_chunk["wav"] = wav_data
                
            wav_chunks.append(torch.tensor(wav_chunk["wav"]))

        # Combine all sentence chunks
        if not wav_chunks:
            raise ValueError("No valid sentences to synthesize")
            
        return torch.cat(wav_chunks, dim=0).unsqueeze(0)

    def _process_audio_with_background(
        self, 
        audio_waveform: torch.Tensor, 
        output_basename: str,
        background_path: str
    ) -> str:
        """Process audio with background and save to files.
        
        Args:
            audio_waveform: Audio tensor
            output_basename: Base filename for output
            background_path: Path to background audio file
            
        Returns:
            Path to the final processed audio file
        """
        # Save raw synthesized audio
        logger.debug(f"Background path: {background_path}")
        if background_path is None or background_path == "":
            final_path = os.path.join(self._output_dir, f"{output_basename}.wav")
            torchaudio.save(final_path, audio_waveform, 24000)
            return final_path
        if not background_path.endswith(".mp3"):
            background_path = f"{background_path}.mp3"
        background_file_path = os.path.join(self._audio_background_dir, background_path)
        logger.info(f"Background file path: {background_file_path}")
        out_path = os.path.join(self._output_dir, f"{output_basename}.wav")
        logger.info(f"Saving output to {out_path}")
        torchaudio.save(out_path, audio_waveform, 24000)
        if "0.mp3" in background_file_path:
            final_path = os.path.join(self._output_dir, f"{output_basename}.wav")
            torchaudio.save(final_path, audio_waveform, 24000)
            return final_path
        # Add background audio
        voice = AudioSegment.from_file(out_path)
        wind_background = AudioSegment.from_file(background_file_path)
        
        # Reduce background volume by -10dB (about 50% quieter)
        wind_background = wind_background - 30
        
        # Ensure background is not longer than voice
        if len(wind_background) > len(voice):
            wind_background = wind_background[:len(voice)]
        
        final_audio = voice.overlay(wind_background)
        
        # Save final audio
        final_path = os.path.join(self._output_dir, f"{output_basename}_final.wav")
        final_audio.export(final_path, format='wav')
        
        return final_path

    async def _ensure_model_loaded(self) -> None:
        """Ensure the model is loaded, loading it if necessary."""
        if not self.is_model_loaded:
            async for message in self.init_and_load_model():
                logger.info(message)
            if not self.is_model_loaded:
                raise ValueError("Failed to load model")

    def _add_to_cache_queue(self, audio_path: str) -> None:
        """Add an audio path to the cache queue and manage cache size.
        
        Args:
            audio_path: Path to add to cache
        """
        if audio_path not in self._cache_queue:
            self._cache_queue.append(audio_path)
            self._invalidate_cache()

    async def inference_with_voice_path(
        self,
        input_text: str = "",
        voice_path: str = "",
        normalize_text: bool = True,
        use_filter: bool = True,
        audio_background: str = None,
        pitch: float = 0.0,
        speed: float = 0.0,
        stability: float = 0.0,
        ambient_sound: str = "",
        use_parameters: bool = False
    ) -> str:
        """Convert text to speech using ViXTTS model with a specific voice.
        
        Args:
            input_text: Text to convert to speech
            voice_path: Path to voice reference audio file
            normalize_text: Whether to normalize Vietnamese text
            use_filter: Whether to use deepFilter
            audio_background: Background audio to mix with speech
            pitch: Voice pitch adjustment (-1.0 to 1.0)
            speed: Voice speed adjustment (0.5 to 2.0)
            stability: Voice stability adjustment (0.0 to 1.0)
            ambient_sound: Alternative background sound (takes precedence over audio_background)
            use_parameters: Whether to use advanced parameters
        Returns:
            Path to the generated audio file
        """
        # Validation
        await self._ensure_model_loaded()
        if not voice_path:
            raise ValueError("Voice path is empty.")
        if not input_text:
            raise ValueError("Input text is empty.")
            
        # Set reference and manage cache
        self._speaker_reference_audio = voice_path
        logger.debug(f"Speaker audio key: {self._speaker_reference_audio}")
        self._add_to_cache_queue(voice_path)
        # Apply filter if needed
        if use_filter:
            voice_path = self._apply_deep_filter(self._speaker_reference_audio)
        
        logger.debug(f"Speaker audio file: {voice_path}")
        
        # Get conditioning latents
        gpt_cond_latent, speaker_embedding = self._get_conditioning_latents(voice_path)
        
        # Process text
        tts_text = self._prepare_text(input_text, normalize_text)
        
        # Generate speech with advanced parameters
        out_wav = self._generate_speech_for_text(
            tts_text, 
            gpt_cond_latent, 
            speaker_embedding,
            pitch=pitch,
            speed=speed,
            stability=stability,
            use_parameters=use_parameters
        )
        
        # Build output filename
        gr_audio_id = os.path.basename(os.path.dirname(voice_path))
        output_basename = f"{get_file_name(tts_text)}_{gr_audio_id}"
        
        # Use ambient_sound if provided, otherwise use audio_background
        background = ambient_sound if ambient_sound else audio_background
        
        return self._process_audio_with_background(out_wav, output_basename, background)

    async def inference(
        self,
        input_text: str = "",
        voice_name: str = "nguyen-ngoc-ngan",
        normalize_text: bool = True,
        use_filter: bool = True,
        audio_background: str = "",
        pitch: float = 0.0,
        speed: float = 0.0,
        stability: float = 0.0,
        ambient_sound: str = "",
        use_parameters: bool = False
    ) -> str:
        """Convert text to speech using predefined voice characteristics.
        
        Args:
            input_text: Text to convert to speech
            voice_name: Name of the predefined voice
            normalize_text: Whether to normalize Vietnamese text
            use_filter: Whether to use deepFilter
            audio_background: Background audio file to mix with speech
            pitch: Voice pitch adjustment (-1.0 to 1.0)
            speed: Voice speed adjustment (0.5 to 2.0)
            stability: Voice stability adjustment (0.0 to 1.0)
            ambient_sound: Alternative background sound (takes precedence over audio_background)
            use_parameters: Whether to use advanced parameters
        Returns:
            Path to the generated audio file
        """
        # Validation
        await self._ensure_model_loaded()
        if not input_text:
            raise ValueError("Input text is empty.")
            
        # Find appropriate speaker audio file
        speaker_audio_file = self._find_speaker_audio_file(voice_name)
        logger.debug(f"Speaker audio file DEBUG: {speaker_audio_file}")
        self._speaker_reference_audio = speaker_audio_file
        
        # Use the voice path inference method with found speaker file
        return await self.inference_with_voice_path(
            input_text=input_text,
            voice_path=speaker_audio_file,
            normalize_text=normalize_text,
            use_filter=use_filter,
            audio_background=audio_background,
            pitch=pitch,
            speed=speed,
            stability=stability,
            ambient_sound=ambient_sound,
            use_parameters=use_parameters
        )

# Create an instance for global use
vixtts_custom = ViXTTS()