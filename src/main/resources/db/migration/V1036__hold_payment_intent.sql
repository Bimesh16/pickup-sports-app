-- V1036: Add payment intent tracking for holds and participants
ALTER TABLE game_hold ADD COLUMN payment_intent_id TEXT;
ALTER TABLE game_participants ADD COLUMN payment_intent_id TEXT;
