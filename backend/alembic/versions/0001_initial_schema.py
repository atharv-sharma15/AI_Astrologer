"""Initial schema for users, charts, placements, conversations, messages, and document metadata

Revision ID: 0001_initial_schema
Revises: 
Create Date: 2026-10-30 12:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '0001_initial_schema'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Users table
    op.create_table(
        'users',
        sa.Column('id', sa.String(length=36), primary_key=True),
        sa.Column('email', sa.String(length=255), nullable=True),
        sa.Column('hashed_password', sa.String(length=255), nullable=True),
        sa.Column('is_guest', sa.Boolean(), nullable=False, server_default=sa.text('1')),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)

    # Charts table
    op.create_table(
        'charts',
        sa.Column('id', sa.String(length=36), primary_key=True),
        sa.Column('user_id', sa.String(length=36), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('chart_type', sa.String(length=50), nullable=False),
        sa.Column('ascendant_sign', sa.String(length=50), nullable=True),
        sa.Column('ascendant_degree', sa.Float(), nullable=True),
        sa.Column('detected_language', sa.String(length=20), nullable=False),
        sa.Column('raw_evidence', sa.Text(), nullable=True),
        sa.Column('uncertain_fields', sa.JSON(), nullable=False),
        sa.Column('review_flags', sa.JSON(), nullable=False),
        sa.Column('is_confirmed', sa.Boolean(), nullable=False, server_default=sa.text('0')),
        sa.Column('confirmed_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('calculation_engine', sa.String(length=100), nullable=False),
        sa.Column('original_filename', sa.String(length=255), nullable=True),
        sa.Column('stored_file_path', sa.String(length=500), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index(op.f('ix_charts_user_id'), 'charts', ['user_id'], unique=False)

    # Placements table
    op.create_table(
        'placements',
        sa.Column('id', sa.String(length=36), primary_key=True),
        sa.Column('chart_id', sa.String(length=36), sa.ForeignKey('charts.id', ondelete='CASCADE'), nullable=False),
        sa.Column('planet', sa.String(length=50), nullable=False),
        sa.Column('sign', sa.String(length=50), nullable=False),
        sa.Column('house', sa.Integer(), nullable=False),
        sa.Column('degree', sa.Float(), nullable=True),
        sa.Column('nakshatra', sa.String(length=100), nullable=True),
        sa.Column('nakshatra_pada', sa.Integer(), nullable=True),
        sa.Column('is_retrograde', sa.Boolean(), nullable=False, server_default=sa.text('0')),
        sa.Column('is_combust', sa.Boolean(), nullable=False, server_default=sa.text('0')),
        sa.Column('notes', sa.String(length=255), nullable=True),
    )
    op.create_index(op.f('ix_placements_chart_id'), 'placements', ['chart_id'], unique=False)

    # Conversations table
    op.create_table(
        'conversations',
        sa.Column('id', sa.String(length=36), primary_key=True),
        sa.Column('user_id', sa.String(length=36), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('chart_id', sa.String(length=36), sa.ForeignKey('charts.id', ondelete='SET NULL'), nullable=True),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('preferred_language', sa.String(length=10), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index(op.f('ix_conversations_user_id'), 'conversations', ['user_id'], unique=False)
    op.create_index(op.f('ix_conversations_chart_id'), 'conversations', ['chart_id'], unique=False)

    # Messages table
    op.create_table(
        'messages',
        sa.Column('id', sa.String(length=36), primary_key=True),
        sa.Column('conversation_id', sa.String(length=36), sa.ForeignKey('conversations.id', ondelete='CASCADE'), nullable=False),
        sa.Column('sender', sa.String(length=20), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('sources', sa.JSON(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index(op.f('ix_messages_conversation_id'), 'messages', ['conversation_id'], unique=False)

    # DocumentMetadata table
    op.create_table(
        'document_metadata',
        sa.Column('id', sa.String(length=36), primary_key=True),
        sa.Column('source_file', sa.String(length=255), nullable=False, unique=True),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('category', sa.String(length=50), nullable=False),
        sa.Column('chunk_count', sa.Integer(), nullable=False, server_default=sa.text('0')),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
    )


def downgrade() -> None:
    op.drop_table('document_metadata')
    op.drop_table('messages')
    op.drop_table('conversations')
    op.drop_table('placements')
    op.drop_table('charts')
    op.drop_table('users')
