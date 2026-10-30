from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.schemas.chat import (
    ConversationCreate, ConversationResponse,
    MessageCreate, MessageResponse
)
from app.services.chat_service import ChatService

router = APIRouter(prefix="/chats", tags=["Chat & Conversations"])


@router.post("", response_model=ConversationResponse, status_code=status.HTTP_201_CREATED)
async def create_conversation(
    conv_in: ConversationCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Creates a new conversation session associated with the user and an optional chart.
    """
    conv = await ChatService.create_conversation(db, current_user.id, conv_in)
    return ConversationResponse.model_validate(conv)


@router.get("", response_model=List[ConversationResponse])
async def list_conversations(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Lists all authorized conversations for the current user.
    """
    convs = await ChatService.list_conversations(db, current_user.id)
    return [ConversationResponse.model_validate(c) for c in convs]


@router.get("/{chat_id}", response_model=ConversationResponse)
async def get_conversation(
    chat_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Retrieves full conversation with message history and associated chart info.
    """
    conv = await ChatService.get_conversation(db, chat_id, current_user.id)
    return ConversationResponse.model_validate(conv)


@router.get("/{chat_id}/messages", response_model=List[MessageResponse])
async def get_conversation_messages(
    chat_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Retrieves message history for the authorized conversation.
    """
    conv = await ChatService.get_conversation(db, chat_id, current_user.id)
    return [MessageResponse.model_validate(m) for m in conv.messages]


@router.post("/{chat_id}/messages", response_model=MessageResponse)
async def send_message(
    chat_id: str,
    msg_in: MessageCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Asks a question in natural language (English or Hindi).
    Validates input, retrieves chart context, queries RAG vector store,
    prompts Gemini, and returns the response with citations.
    """
    assistant_msg = await ChatService.process_user_message(
        db=db,
        conversation_id=chat_id,
        user_id=current_user.id,
        msg_in=msg_in
    )
    return MessageResponse.model_validate(assistant_msg)


@router.delete("/{chat_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_conversation(
    chat_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Deletes user-owned conversation.
    """
    await ChatService.delete_conversation(db, chat_id, current_user.id)
    return None
