from dataclasses import dataclass
import os
import subprocess


from huggingface_hub import hf_hub_download, snapshot_download
from loguru import logger
from underthesea import sent_tokenize
from pydub import AudioSegment
import torchaudio
import torch


from TTS.TTS.tts.configs.xtts_config import XttsConfig
from TTS.TTS.tts.models.xtts import Xtts
from utils.helpers import normalize_vietnamese_text, calculate_keep_len, get_file_name

@dataclass
class ViXTTS_custom:
    XTTS_MODEL: Xtts = None
    SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
    AUDIO_BACKGROUND_DIR = os.path.join(SCRIPT_DIR, "audio_background")
    OUTPUT_DIR = os.path.join(SCRIPT_DIR, "output")
    FILTER_SUFFIX: str = "_DeepFilterNet3.wav"
    checkpoint_dir: str = "model_registry"
    repo_id: str ="capleaf/viXTTS"
    required_files = ["model.pth", "config.json", "vocab.json", "speakers_xtts.pth"]
    tts_language: str = "vi"
    speaker_reference_audio: str = ""
    filter_cache = {}
    cache_queue = []
    conditioning_latents_cache = {}

    def invalidate_cache(self, cache_limit=50):
        """Invalidate the cache for the oldest key"""
        if len(self.cache_queue) > cache_limit:
            key_to_remove = self.cache_queue.pop(0)
            logger.info("Invalidating cache: ", key_to_remove)
            if os.path.exists(key_to_remove):
                os.remove(key_to_remove)
            if os.path.exists(key_to_remove.replace(".wav", "_DeepFilterNet3.wav")):
                os.remove(key_to_remove.replace(".wav", "_DeepFilterNet3.wav"))
            if key_to_remove in self.filter_cache:
                del self.filter_cache[key_to_remove]
            if key_to_remove in self.conditioning_latents_cache:
                del self.conditioning_latents_cache[key_to_remove]

    async def init_and_load_model(self, use_deepspeed=False):
        """Init and load ViXTTS model"""
        os.makedirs(self.OUTPUT_DIR, exist_ok=True)
        os.makedirs(self.checkpoint_dir, exist_ok=True)
        files_in_dir = os.listdir(self.checkpoint_dir)
        if not all(file in files_in_dir for file in self.required_files):
            yield f"Missing model files! Downloading from {self.repo_id}..."
            snapshot_download(
                repo_id=self.repo_id,
                repo_type="model",
                local_dir=self.checkpoint_dir,
            )
            hf_hub_download(
                repo_id="coqui/XTTS-v2",
                filename="speakers_xtts.pth",
                local_dir=self.checkpoint_dir,
            )
            yield f"Model download finished..."

        xtts_config = os.path.join(self.checkpoint_dir, "config.json")
        config = XttsConfig()
        config.load_json(xtts_config)
        self.XTTS_MODEL = Xtts.init_from_config(config)
        yield "Loading model..."
        self.XTTS_MODEL.load_checkpoint(
            config, 
            checkpoint_dir=self.checkpoint_dir, 
            use_deepspeed=use_deepspeed
        )
        #TODO: Check if GPU is available and move model to GPU
        # if torch.cuda.is_available():
        #     XTTS_MODEL.cuda()

        yield "Model Loaded!"

    def find_speaker_audio_file(self, sex: str, emotion: str):
        """Find speaker audio file based on sex and emotion"""
        if sex == "male" or sex == "Nam":
            sex = "nam"
        elif sex == "female" or sex == "Nữ":
            sex = "nu"
        if emotion == "Vui vẻ" or emotion == "happy":
            emotion = "nhanh"
        elif emotion == "Buồn bã" or emotion == "sad":
            emotion = "cham"
        elif emotion == "Tự tin" or emotion == "confident" or emotion == "Truyền Cảm":
            if sex == "nam":
                emotion = "truyen-cam"
            else:
                emotion = "luu-loat"
        elif emotion == "Nhút nhát" or emotion == "shy":
            emotion = "calm"
            
        return os.path.join(self.checkpoint_dir, "samples", f"{sex}-{emotion}.wav")

    async def inference(
        self,
        input_text: str = "",
        sex: str = "nam",
        emotion: str = "truyen-cam",
        normalize_text: bool = True,
        use_filter: bool = True,
        audio_background: str = "",
    ):
        """Convert text to speech using ViXTTS model"""
        if self.XTTS_MODEL is None:
            raise ValueError("Model not loaded. Call init_and_load_model() first.")
        if not input_text:
            raise ValueError("Input text is empty.")
        self.speaker_reference_audio = self.find_speaker_audio_file(sex, emotion)
        logger.debug(f"Speaker audio key 1: {self.speaker_reference_audio}")
        logger.debug(f"Cache queue: {self.cache_queue}")
        logger.debug(f"Filter cache: {self.filter_cache}")
        speaker_audio_file = self.speaker_reference_audio
        if not speaker_audio_file in self.cache_queue:
            self.cache_queue.append(speaker_audio_file)
            self.invalidate_cache()
        if speaker_audio_file in self.filter_cache:
            logger.info("Using filter cache...")
            speaker_audio_file = self.filter_cache[speaker_audio_file]
        subprocess.run(
            [
                "deepFilter",
                speaker_audio_file,
                "-o",
                os.path.dirname(speaker_audio_file),
            ]
        )
        self.filter_cache[speaker_audio_file] = speaker_audio_file.replace(
            ".wav", self.FILTER_SUFFIX
        )
        speaker_audio_file = self.filter_cache[speaker_audio_file]
        logger.debug(f"Speaker audio file: {speaker_audio_file}")
        # Check if conditioning latents are cached
        cache_key = (
            speaker_audio_file,
            self.XTTS_MODEL.config.gpt_cond_len,
            self.XTTS_MODEL.config.max_ref_len,
            self.XTTS_MODEL.config.sound_norm_refs,
        )
        logger.debug(f"Cache key: {cache_key}")
        if cache_key in self.conditioning_latents_cache:
            logger.info("Using conditioning latents cache...")
            gpt_cond_latent, speaker_embedding = self.conditioning_latents_cache[cache_key]
        else:
            logger.info("Computing conditioning latents .....")
            gpt_cond_latent, speaker_embedding = self.XTTS_MODEL.get_conditioning_latents(
                audio_path=speaker_audio_file,
                gpt_cond_len=self.XTTS_MODEL.config.gpt_cond_len,
                max_ref_length=self.XTTS_MODEL.config.max_ref_len,
                sound_norm_refs=self.XTTS_MODEL.config.sound_norm_refs,
            )
            self.conditioning_latents_cache[cache_key] = (gpt_cond_latent, speaker_embedding)

        if normalize_text and self.tts_language == "vi":
            tts_text = normalize_vietnamese_text(text=input_text)

        # Split text by sentence
        if self.tts_language in ["ja", "zh-cn"]:
            sentences = tts_text.split("。")
        else:
            sentences = sent_tokenize(tts_text)

        from pprint import pprint

        pprint(sentences)

        wav_chunks = []
        for sentence in sentences:
            if sentence.strip() == "":
                continue
            wav_chunk = self.XTTS_MODEL.inference(
                text=sentence,
                language=self.tts_language,
                gpt_cond_latent=gpt_cond_latent,
                speaker_embedding=speaker_embedding,
                # The following values are carefully chosen for viXTTS
                temperature=0.3,
                length_penalty=1.0,
                repetition_penalty=10.0,
                top_k=30,
                top_p=0.85,
                enable_text_splitting=True,
            )

            keep_len = calculate_keep_len(sentence, self.tts_language)
            wav_chunk["wav"] = wav_chunk["wav"][:keep_len]

            wav_chunks.append(torch.tensor(wav_chunk["wav"]))

        out_wav = torch.cat(wav_chunks, dim=0).unsqueeze(0)
        gr_audio_id = os.path.basename(os.path.dirname(speaker_audio_file))
        out_path = os.path.join(self.OUTPUT_DIR, f"{get_file_name(tts_text)}_{gr_audio_id}.wav")
        logger.info(f"Saving output to {out_path}")
        torchaudio.save(out_path, out_wav, 24000)
        audio_background_path = os.path.join(self.AUDIO_BACKGROUND_DIR, audio_background)
        wind_backgroud = AudioSegment.from_file(audio_background_path)
        voice = AudioSegment.from_file(out_path)
        final_audio = voice.overlay(wind_backgroud)
        final_path = os.path.join(self.OUTPUT_DIR, f"{get_file_name(tts_text)}_{gr_audio_id}_final.wav")
        final_audio.export(final_path, format='wav')
        return final_path

vixtts_custom = ViXTTS_custom()