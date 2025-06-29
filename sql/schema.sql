-- Vercel Postgres Database Schema for Habit & Goal Tracker

-- Habits table
CREATE TABLE IF NOT EXISTS habits (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('simple', 'counter')),
  goal INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habit completions table (for simple habits - daily completion tracking)
CREATE TABLE IF NOT EXISTS habit_completions (
  id SERIAL PRIMARY KEY,
  habit_id INTEGER NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  completion_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(habit_id, completion_date)
);

-- Habit counter data (for counter habits - daily count tracking)
CREATE TABLE IF NOT EXISTS habit_counter_data (
  id SERIAL PRIMARY KEY,
  habit_id INTEGER NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(habit_id, date)
);

-- Goals table
CREATE TABLE IF NOT EXISTS goals (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  target_date DATE,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subtasks table
CREATE TABLE IF NOT EXISTS subtasks (
  id SERIAL PRIMARY KEY,
  goal_id INTEGER NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_habit_completions_habit_id ON habit_completions(habit_id);
CREATE INDEX IF NOT EXISTS idx_habit_completions_date ON habit_completions(completion_date);
CREATE INDEX IF NOT EXISTS idx_habit_counter_data_habit_id ON habit_counter_data(habit_id);
CREATE INDEX IF NOT EXISTS idx_habit_counter_data_date ON habit_counter_data(date);
CREATE INDEX IF NOT EXISTS idx_subtasks_goal_id ON subtasks(goal_id);
CREATE INDEX IF NOT EXISTS idx_goals_completed ON goals(completed);
CREATE INDEX IF NOT EXISTS idx_habits_type ON habits(type);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for habit_counter_data updated_at
CREATE TRIGGER update_habit_counter_data_updated_at 
    BEFORE UPDATE ON habit_counter_data 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();