from dataclasses import dataclass


@dataclass
class Text2SpeechRequest:
    language: str = "vi"
    input_text: str = "Xin chào bạn, tôi là model"
    sex: str = "nam"
    emotion: str = "truyen-cam"
    voice_path: str = ""
    normalize_text: bool = True
    use_parameters: bool = False
    verbose: bool = True
    use_voice_path: bool = False
    audio_background: str = "/home/azureuser/caotien/Synsere_TTS/backend/src/assets/audio_background/horror-background.mp3"


@dataclass
class Text2SpeechResponse:
    audio_file: str
    message: str
