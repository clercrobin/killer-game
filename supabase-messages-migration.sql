-- Messages table migration for Killer Game
-- Run this in your Supabase SQL Editor AFTER running supabase-schema.sql

-- Messages table for player-admin communication
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  sender VARCHAR(10) NOT NULL CHECK (sender IN ('player', 'admin')),
  text TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_messages_game_id ON messages(game_id);
CREATE INDEX idx_messages_player_id ON messages(player_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);

-- Enable Row Level Security
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Messages are viewable by everyone" ON messages FOR SELECT USING (true);
CREATE POLICY "Messages are insertable by everyone" ON messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Messages are updatable by everyone" ON messages FOR UPDATE USING (true);
CREATE POLICY "Messages are deletable by everyone" ON messages FOR DELETE USING (true);

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
