from fastapi import APIRouter
from loguru import logger

router = APIRouter()


@router.get("/health", tags=["Heath check"])
async def health_check():
    """Health check endpoint.

    Returns:
        dict: Health status information.
    """
    logger.info("health_check_called")
    return {"status": "healthy", "version": "1.0.0"}
