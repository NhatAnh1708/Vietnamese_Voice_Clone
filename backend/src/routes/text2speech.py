import time
import os
import shutil
from uuid import uuid4

from fastapi import APIRouter, HTTPException, Depends, File, UploadFile
from fastapi.responses import FileResponse
from loguru import logger

from routes.auth import get_production_user, get_current_user
from core.vixtts import vixtts_custom
from schemas.text2speech import Text2SpeechRequest

router = APIRouter(prefix="/api", tags=["text-to-speech"])


@router.get("/load-model")
async def load_model(current_user = Depends(get_production_user)):
    """
    Load the TTS model.
    """
    if not vixtts_custom.is_model_loaded:
        async for message in vixtts_custom.init_and_load_model():
            logger.info(message)
    logger.info("Model loaded!")
    return HTTPException(status_code=200, detail="Model loaded!")


@router.post("/text-to-speech")
async def text_to_speech(item: Text2SpeechRequest, current_user = Depends(get_current_user)):
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
                logger.info("Using advanced parameters")
                audio_file = await vixtts_custom.inference_with_voice_path(
                    input_text=item.input_text,
                    voice_path=item.voice_path,
                    normalize_text=item.normalize_text,
                    use_filter=item.verbose,
                    audio_background=item.audio_background,
                    pitch=item.pitch,
                    speed=item.speed,
                    stability=item.stability,
                    ambient_sound=item.ambient_sound,
                    use_parameters=item.use_parameters
                )
            else:
                audio_file = await vixtts_custom.inference_with_voice_path(
                    input_text=item.input_text,
                    voice_path=item.voice_path,
                    normalize_text=item.normalize_text,
                    use_filter=item.verbose,
                    audio_background=item.audio_background,
                    use_parameters=item.use_parameters
                )
        else:
            if item.use_parameters:
                logger.info("Using advanced parameters")
                audio_file = await vixtts_custom.inference(
                    input_text=item.input_text,
                    voice_name=item.voice_name,
                    normalize_text=item.normalize_text,
                    use_filter=item.verbose,
                    audio_background=item.audio_background,
                    pitch=item.pitch,
                    speed=item.speed,
                    stability=item.stability,
                    ambient_sound=item.ambient_sound,
                    use_parameters=item.use_parameters
                )
            else:
                audio_file = await vixtts_custom.inference(
                    input_text=item.input_text,
                    voice_name=item.voice_name,
                    normalize_text=item.normalize_text,
                    use_filter=item.verbose,
                    audio_background=item.audio_background,
                    use_parameters=item.use_parameters
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
async def get_audio_file(filename: str, token: str = None):
    """
    Get audio file by filename.
    Accepts authentication either through token in URL or Bearer token in header.
    """
    # Only validate token in production mode
    if os.environ.get('PRODUCTION_MODE', 'false').lower() == 'true' and token is None:
        # If no token in URL, let the dependency handle it
        return await get_audio_file_with_auth(filename)
        
    # Đường dẫn thư mục chứa file output
    audio_dir = vixtts_custom._output_dir
    file_path = os.path.join(audio_dir, filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")
    
    return FileResponse(
        file_path,
        media_type="audio/wav",
        filename=filename
    )

# Protected version that requires authentication
@router.get("/audio-protected/{filename}")
async def get_audio_file_with_auth(filename: str, current_user = Depends(get_production_user)):
    """
    Get audio file by filename with authentication.
    """
    # Đường dẫn thư mục chứa file output
    audio_dir = vixtts_custom._output_dir
    file_path = os.path.join(audio_dir, filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")
    
    return FileResponse(
        file_path,
        media_type="audio/wav",
        filename=filename
    )

# Add upload-voice endpoint
@router.post("/upload-voice")
async def upload_voice_file(
    file: UploadFile = File(...),
    current_user = Depends(get_current_user)
):
    """
    Upload a voice file to be used as reference for TTS.
    Only accepts MP3 files.
    """
    try:
        # Check file type
        if not file.content_type.startswith("audio/mpeg"):
            raise HTTPException(status_code=400, detail="Only MP3 files are allowed")
        
        # Create user directory if it doesn't exist
        user_id = str(current_user["_id"])
        user_upload_dir = os.path.join(vixtts_custom._input_voice_path, user_id)
        os.makedirs(user_upload_dir, exist_ok=True)
        
        # Generate unique filename with UUID to prevent conflicts
        file_uuid = str(uuid4())
        filename = f"{file_uuid}_{file.filename}"
        file_path = os.path.join(user_upload_dir, filename)
        
        # Save uploaded file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        logger.info(f"Voice file uploaded: {file_path}")
        
        return {
            "message": "Voice file uploaded successfully",
            "file_path": file_path,
            "filename": filename
        }
    except Exception as e:
        logger.error(f"Error uploading voice file: {e}")
        raise HTTPException(status_code=500, detail=str(e))

