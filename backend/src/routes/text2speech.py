import time
import os

from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import FileResponse
from loguru import logger

from routes.auth import get_production_user
from core.vixtts import vixtts_custom
from schemas.text2speech import Text2SpeechRequest, Text2SpeechResponse

router = APIRouter(prefix="/api", tags=["text-to-speech"])


@router.get("/load-model")
async def load_model(current_user = Depends(get_production_user)):
    """
    Load the TTS model.
    """
    if not vixtts_custom.XTTS_MODEL:
        async for message in vixtts_custom.init_and_load_model():
            logger.info(message)
    logger.info("Model loaded!")
    return HTTPException(status_code=200, detail="Model loaded!")


@router.post("/text-to-speech")
async def text_to_speech(item: Text2SpeechRequest, current_user = Depends(get_production_user)):
    """
    Convert text to speech using a TTS model.
    """
    try:
        start_time = time.time()
        logger.info(item)
        logger.info("Starting inference...")
        audio_file = None  # Initialize audio_file variable
        
        if item.use_voice_path:
            if item.use_parameters:
                logger.info("Using parameters")
                audio_file = await vixtts_custom.inference_with_voice_path(
                    input_text=item.input_text,
                    voice_path=item.voice_path,
                    normalize_text=item.normalize_text,
                    use_filter=item.verbose,
                    audio_background=item.audio_background,
                )
            else:
                audio_file = await vixtts_custom.inference(
                    input_text=item.input_text,
                    sex=item.sex,
                    emotion=item.emotion,
                    normalize_text=item.normalize_text,
                    use_filter=item.verbose,
                    audio_background=item.audio_background,
                )
        else:
            if item.use_parameters:
                logger.info("Using parameters")
                audio_file = await vixtts_custom.inference(
                    input_text=item.input_text,
                    sex=item.sex,
                    emotion=item.emotion,
                    normalize_text=item.normalize_text,
                    use_filter=item.verbose,
                    audio_background=item.audio_background,
                )
            else:
                audio_file = await vixtts_custom.inference(
                    input_text=item.input_text,
                    sex=item.sex,
                    emotion=item.emotion,
                    normalize_text=item.normalize_text,
                    use_filter=item.verbose,
                    audio_background=item.audio_background,
                )
        
        if audio_file is None:
            raise ValueError("Failed to generate audio file")
            
        logger.info(f"Ended inference in {time.time() - start_time:.2f} seconds")
        return {"audio_file": audio_file}
    except ValueError as e:
        logger.error(f"Error during inference: {e}")
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/test-audio-file")
async def test_audio_file(audio_file: str, current_user = Depends(get_production_user)):
    """
    Test the audio file.
    """
    return FileResponse(
        audio_file,
        media_type="audio/wav",
        filename=audio_file.split("/")[-1],
    )

@router.get("/audio/{filename}")
async def get_audio_file(filename: str, token: str = None, current_user = Depends(get_production_user)):
    """
    Get audio file by filename.
    Accepts authentication either through token in URL or Bearer token in header.
    """
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

