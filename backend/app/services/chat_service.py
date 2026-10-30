from typing import List, Optional
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from fastapi import HTTPException, status

from app.models.chat import Conversation, Message
from app.models.chart import Chart
from app.schemas.chat import MessageCreate, ConversationCreate, SourceReference
from app.services.gemini_service import gemini_service
from app.services.rag_service import rag_service
from app.core.logging import logger


class ChatService:
    @staticmethod
    async def create_conversation(
        db: AsyncSession,
        user_id: str,
        conv_in: ConversationCreate
    ) -> Conversation:
        # If chart_id provided, verify ownership
        if conv_in.chart_id:
            stmt = select(Chart).where(Chart.id == conv_in.chart_id, Chart.user_id == user_id)
            chart = (await db.execute(stmt)).scalar_one_or_none()
            if not chart:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Chart not found or access denied."
                )

        conversation = Conversation(
            user_id=user_id,
            chart_id=conv_in.chart_id,
            title=conv_in.title or "Astrology Consultation",
            preferred_language=conv_in.preferred_language or "en"
        )
        db.add(conversation)
        await db.commit()
        await db.refresh(conversation)

        # Welcome message based on language
        welcome_content = (
            "नमस्ते! मैं वेदविकी हूँ, आपका वैदिक ज्योतिष सहायक। "
            "आप अपनी कुंडली, ग्रहों की स्थिति, भावों और दशाओं के बारे में कुछ भी पूछ सकते हैं।"
            if conversation.preferred_language == "hi" else
            "Namaste! I am VedViki, your Vedic astrology companion. "
            "I'm here to help you explore and understand your birth chart, planetary placements, and traditional Vedic principles."
        )

        welcome_msg = Message(
            conversation_id=conversation.id,
            sender="assistant",
            content=welcome_content,
            sources=[]
        )
        db.add(welcome_msg)
        await db.commit()
        await db.refresh(conversation)

        logger.info(f"Created conversation {conversation.id} for user {user_id}.")
        return conversation

    @staticmethod
    async def list_conversations(db: AsyncSession, user_id: str) -> List[Conversation]:
        stmt = (
            select(Conversation)
            .where(Conversation.user_id == user_id)
            .order_by(Conversation.updated_at.desc())
        )
        result = await db.execute(stmt)
        return list(result.scalars().all())

    @staticmethod
    async def get_conversation(db: AsyncSession, conversation_id: str, user_id: str) -> Conversation:
        stmt = (
            select(Conversation)
            .where(Conversation.id == conversation_id, Conversation.user_id == user_id)
        )
        result = await db.execute(stmt)
        conv = result.scalar_one_or_none()
        if not conv:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Conversation not found or access denied."
            )
        return conv

    @staticmethod
    async def process_user_message(
        db: AsyncSession,
        conversation_id: str,
        user_id: str,
        msg_in: MessageCreate
    ) -> Message:
        conversation = await ChatService.get_conversation(db, conversation_id, user_id)

        # Fetch chart if linked
        chart_summary = None
        if conversation.chart_id:
            stmt = select(Chart).where(Chart.id == conversation.chart_id, Chart.user_id == user_id)
            chart = (await db.execute(stmt)).scalar_one_or_none()
            if chart:
                chart_summary = {
                    "title": chart.title,
                    "chart_type": chart.chart_type,
                    "ascendant_sign": chart.ascendant_sign,
                    "ascendant_degree": chart.ascendant_degree,
                    "is_confirmed": chart.is_confirmed,
                    "placements": [
                        {
                            "planet": p.planet,
                            "sign": p.sign,
                            "house": p.house,
                            "degree": p.degree,
                            "nakshatra": p.nakshatra,
                            "is_retrograde": p.is_retrograde,
                            "is_combust": p.is_combust
                        }
                        for p in chart.placements
                    ]
                }

        # 1. Save user message to database
        user_msg = Message(
            conversation_id=conversation.id,
            sender="user",
            content=msg_in.content.strip(),
            sources=[]
        )
        db.add(user_msg)
        await db.commit()

        # 2. Retrieve RAG reference passages
        rag_passages = rag_service.retrieve_relevant_passages(msg_in.content, top_k=3)

        # 3. Retrieve conversation history for context
        history_msgs = [
            {"sender": m.sender, "content": m.content}
            for m in conversation.messages[-6:]
        ]

        user_content = msg_in.content.strip()
        # Auto-detect language if Hindi Devanagari script is present
        has_devanagari = any('\u0900' <= char <= '\u097F' for char in user_content)
        language = "hi" if has_devanagari else (msg_in.language or conversation.preferred_language or "en")

        # 4. Generate grounded AI response
        ai_reply_text, sources = await gemini_service.generate_chat_response(
            user_message=msg_in.content,
            conversation_history=history_msgs,
            chart_summary=chart_summary,
            rag_passages=rag_passages,
            language=language
        )

        # 5. Persist assistant message
        sources_dicts = [s.model_dump() for s in sources]
        assistant_msg = Message(
            conversation_id=conversation.id,
            sender="assistant",
            content=ai_reply_text,
            sources=sources_dicts
        )
        db.add(assistant_msg)

        conversation.updated_at = datetime.now(timezone.utc)
        await db.commit()
        await db.refresh(assistant_msg)

        logger.info(f"Generated reply in conversation {conversation.id} with {len(sources)} sources.")
        return assistant_msg

    @staticmethod
    async def delete_conversation(db: AsyncSession, conversation_id: str, user_id: str) -> bool:
        conversation = await ChatService.get_conversation(db, conversation_id, user_id)
        await db.delete(conversation)
        await db.commit()
        logger.info(f"Deleted conversation {conversation_id} by user {user_id}.")
        return True
