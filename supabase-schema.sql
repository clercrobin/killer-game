-- Supabase Schema for Killer Game
-- Run this in your Supabase SQL Editor

-- Games table
CREATE TABLE games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(10) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL DEFAULT 'Killer Game',
  admin_password VARCHAR(255) NOT NULL,
  spread_factor DECIMAL(3,2) DEFAULT 0.7,
  started BOOLEAN DEFAULT FALSE,
  started_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Groups table
CREATE TABLE groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  color VARCHAR(7) NOT NULL DEFAULT '#4CAF50',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Players table
CREATE TABLE players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Challenges table
CREATE TABLE challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Couples/Constraints table
CREATE TABLE couples (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  player1_id UUID REFERENCES players(id) ON DELETE CASCADE,
  player2_id UUID REFERENCES players(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(game_id, player1_id, player2_id)
);

-- Assignments table
CREATE TABLE assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  target_id UUID REFERENCES players(id) ON DELETE CASCADE,
  challenge_id UUID REFERENCES challenges(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  ring_order INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(game_id, player_id)
);

-- Indexes for performance
CREATE INDEX idx_games_code ON games(code);
CREATE INDEX idx_groups_game_id ON groups(game_id);
CREATE INDEX idx_players_game_id ON players(game_id);
CREATE INDEX idx_players_group_id ON players(group_id);
CREATE INDEX idx_challenges_game_id ON challenges(game_id);
CREATE INDEX idx_couples_game_id ON couples(game_id);
CREATE INDEX idx_assignments_game_id ON assignments(game_id);
CREATE INDEX idx_assignments_player_id ON assignments(player_id);

-- Enable Row Level Security
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE couples ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;

-- Policies: Allow all operations for now (public game)
-- In production, you'd want more restrictive policies

CREATE POLICY "Games are viewable by everyone" ON games FOR SELECT USING (true);
CREATE POLICY "Games are insertable by everyone" ON games FOR INSERT WITH CHECK (true);
CREATE POLICY "Games are updatable by everyone" ON games FOR UPDATE USING (true);
CREATE POLICY "Games are deletable by everyone" ON games FOR DELETE USING (true);

CREATE POLICY "Groups are viewable by everyone" ON groups FOR SELECT USING (true);
CREATE POLICY "Groups are insertable by everyone" ON groups FOR INSERT WITH CHECK (true);
CREATE POLICY "Groups are updatable by everyone" ON groups FOR UPDATE USING (true);
CREATE POLICY "Groups are deletable by everyone" ON groups FOR DELETE USING (true);

CREATE POLICY "Players are viewable by everyone" ON players FOR SELECT USING (true);
CREATE POLICY "Players are insertable by everyone" ON players FOR INSERT WITH CHECK (true);
CREATE POLICY "Players are updatable by everyone" ON players FOR UPDATE USING (true);
CREATE POLICY "Players are deletable by everyone" ON players FOR DELETE USING (true);

CREATE POLICY "Challenges are viewable by everyone" ON challenges FOR SELECT USING (true);
CREATE POLICY "Challenges are insertable by everyone" ON challenges FOR INSERT WITH CHECK (true);
CREATE POLICY "Challenges are updatable by everyone" ON challenges FOR UPDATE USING (true);
CREATE POLICY "Challenges are deletable by everyone" ON challenges FOR DELETE USING (true);

CREATE POLICY "Couples are viewable by everyone" ON couples FOR SELECT USING (true);
CREATE POLICY "Couples are insertable by everyone" ON couples FOR INSERT WITH CHECK (true);
CREATE POLICY "Couples are deletable by everyone" ON couples FOR DELETE USING (true);

CREATE POLICY "Assignments are viewable by everyone" ON assignments FOR SELECT USING (true);
CREATE POLICY "Assignments are insertable by everyone" ON assignments FOR INSERT WITH CHECK (true);
CREATE POLICY "Assignments are updatable by everyone" ON assignments FOR UPDATE USING (true);
CREATE POLICY "Assignments are deletable by everyone" ON assignments FOR DELETE USING (true);

-- Enable realtime for assignments (so players see updates)
ALTER PUBLICATION supabase_realtime ADD TABLE assignments;
