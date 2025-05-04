from dataclasses import dataclass



@dataclass
class Text2SpeechRequest:
    language: str
    input_text: str
    reference_audio: str
    normalize_text: bool
    verbose: bool
    output_chunks: bool

