-- V1041: Add payment intent tracking for holds and participants
ALTER TABLE game_holds ADD COLUMN IF NOT EXISTS payment_intent_id TEXT;
ALTER TABLE game_participants ADD COLUMN IF NOT EXISTS payment_intent_id TEXT;
