from fastapi import APIRouter, Depends
from loguru import logger
from routes.auth import get_production_user

router = APIRouter()


@router.get("/health", tags=["Heath check"])
async def health_check(current_user = Depends(get_production_user)):
    """Health check endpoint.

    Returns:
        dict: Health status information.
    """
    logger.info("health_check_called")
    return {"status": "healthy", "version": "1.0.0"}
