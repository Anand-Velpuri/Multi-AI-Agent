from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from app.core.ai_agent import get_response_from_ai_agents
from app.config.settings import settings
from app.common.logger import get_logger
from app.common.custom_exception import CustomException
from fastapi.responses import StreamingResponse
from app.core.ai_agent_with_streaming import generate_agent_responses

logger = get_logger(__name__)

app = FastAPI(title="Multi-Agent AI API")

class RequestState(BaseModel):
    model_name: str
    system_prompt: str
    messages: List[str]
    allow_search: bool
    checkpointer_id: Optional[str] = None


@app.post("/chat")
def chat_endpoint(request: RequestState):
    logger.info(f"Received request with model: {request.model_name}")

    if request.model_name not in settings.ALLOWED_MODEL_NAMES:
        logger.warning("Invalid model name provided")
        raise HTTPException(status_code=400, detail="Invalid model name")
    
    try:
        response = get_response_from_ai_agents(
            llm_id=request.model_name,
            query=request.messages,
            allow_search=request.allow_search,
            system_prompt=request.system_prompt
        )
        logger.info("Successfully processed request")
        return {"response": response.content}
    except Exception as e:
        logger.error(f"Error processing request: {e}")
        raise HTTPException(status_code=500, detail=str(CustomException("Failed to get AI response", error_detail=e)))


@app.post("/chat/stream")
async def chat_stream(request: RequestState):

    if request.model_name not in settings.ALLOWED_MODEL_NAMES:
        raise HTTPException(
            status_code=400,
            detail="Invalid model name"
        )
    
    try:
        logger.info(f"Starting streaming response for model: {request.model_name}")
    
        return StreamingResponse(
                    generate_agent_responses(
                        llm_id=request.model_name,
                        query=request.messages,
                        allow_search=request.allow_search,
                        system_prompt=request.system_prompt,
                        checkpointer_id=request.checkpointer_id
                    ),
                    media_type="text/event-stream",
                    headers={
                        "Cache-Control": "no-cache",
                        "Connection": "keep-alive",
                        "X-Accel-Buffering": "no"
                    }
                )
    except Exception as e:
        logger.error(f"Error during streaming response: {e}")
        raise HTTPException(
            status_code=500,
            detail=str(CustomException("Failed to stream AI response", error_detail=e))
        )