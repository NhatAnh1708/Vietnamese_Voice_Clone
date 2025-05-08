import time
import os

from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import FileResponse
from loguru import logger



from core.vixtts import vixtts_custom
from schemas.text2speech import Text2SpeechRequest, Text2SpeechResponse

router = APIRouter(prefix="/api", tags=["text-to-speech"])


@router.get("/load-model")
async def load_model():
    """
    Load the TTS model.
    """
    logger.info("Loading model...")
    if not vixtts_custom.XTTS_MODEL:
        async for message in vixtts_custom.init_and_load_model():
            logger.info(message)
    logger.info("Model loaded!")
    return HTTPException(status_code=200, detail="Model loaded!")


@router.post("/text-to-speech")
async def text_to_speech(item: Text2SpeechRequest):
    """
    Convert text to speech using a TTS model.
    """
    try:
        start_time = time.time()
        logger.info(item)
        logger.info("Starting inference...")
        audio_file = await vixtts_custom.inference(
            input_text=item.input_text,
            normalize_text=item.normalize_text,
            use_filter=item.verbose,
            speaker_audio_file=item.reference_audio,
        )
        logger.info(f"Ended inference in {time.time() - start_time:.2f} seconds")
        return {"audio_file": audio_file}
    except ValueError as e:
        logger.error(f"Error during inference: {e}")
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/test-audio-file")
async def test_audio_file(audio_file: str):
    """
    Test the audio file.
    """
    return FileResponse(
        audio_file,
        media_type="audio/wav",
        filename=audio_file.split("/")[-1],
    )

@router.get("/audio/{filename}")
async def get_audio_file(filename: str):
    # Đường dẫn thư mục chứa file output
    audio_dir = "/home/azureuser/caotien/Synsere_TTS/backend/src/core/output"
    file_path = os.path.join(audio_dir, filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(
        file_path,
        media_type="audio/wav",
        filename=filename
    )

