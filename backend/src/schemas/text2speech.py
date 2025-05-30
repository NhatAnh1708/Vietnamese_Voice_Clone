from dataclasses import dataclass


@dataclass
class Text2SpeechRequest:
    language: str = "vi"
    input_text: str = "Xin chào bạn, tôi là làm việc với bạn"
    voice_name: str = "nguyen-ngoc-ngan"
    emotion: str = "truyen-cam"
    voice_path: str = ""
    normalize_text: bool = True
    use_parameters: bool = False
    verbose: bool = True
    use_voice_path: bool = False
    audio_background: str = ""
    pitch: float = 0.0
    speed: float = 0.0
    ambient_sound: float = 0.0


@dataclass
class Text2SpeechResponse:
    audio_file: str
    message: str
