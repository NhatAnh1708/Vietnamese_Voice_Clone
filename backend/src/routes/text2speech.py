from fastapi import APIRouter




router = APIRouter()

@router.post("/text-to-speech")
async def text_to_speech(text: str):
    """
    Convert text to speech using a TTS model.
    """
