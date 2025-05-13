from dataclasses import dataclass


@dataclass
class Text2SpeechRequest:
    language: str = "vi"
    input_text: str = "Xin chào bạn, tôi là model"
    sex: str = "nam"
    emotion: str = "truyen-cam"
    normalize_text: bool = True
    verbose: bool = True
    audio_background: str = "/home/azureuser/caotien/Synsere_TTS/backend/src/assets/audio_background/horror-background.mp3"


@dataclass
class Text2SpeechResponse:
    audio_file: str
    message: str
