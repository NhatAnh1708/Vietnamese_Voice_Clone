from dataclasses import dataclass


@dataclass
class Text2SpeechRequest:
    language: str = "vi"
    input_text: str = "Xin chào bạn, tôi là chatbot của DONYAI"
    reference_audio: str = "/home/azureuser/donydev/Synsere_TTS/backend/src/model_registry/samples/nam-truyen-cam.wav"
    normalize_text: bool = True
    verbose: bool = True


@dataclass
class Text2SpeechResponse:
    audio_file: str
    message: str
