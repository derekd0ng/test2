import { neon } from '@neondatabase/serverless';

// Types
export interface Habit {
  id: number;
  name: string;
  type: 'simple' | 'counter';
  goal?: number;
  completions: string[];
  counterData?: { [date: string]: number };
  createdAt: string;
}

export interface Goal {
  id: number;
  name: string;
  description?: string;
  subtasks: Subtask[];
  createdAt: string;
  targetDate?: string;
  completed: boolean;
  completedAt?: string;
}

export interface Subtask {
  id: number;
  name: string;
  completed: boolean;
  completedAt?: string;
}

// Initialize Neon connection
const sql = neon(process.env.DATABASE_URL!);

// Database initialization
export async function initializeDatabase() {
  try {
    // Check if tables exist, if not create them
    await sql`
      CREATE TABLE IF NOT EXISTS habits (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL CHECK (type IN ('simple', 'counter')),
        goal INTEGER DEFAULT 1,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS habit_completions (
        id SERIAL PRIMARY KEY,
        habit_id INTEGER NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
        completion_date DATE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(habit_id, completion_date)
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS habit_counter_data (
        id SERIAL PRIMARY KEY,
        habit_id INTEGER NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
        date DATE NOT NULL,
        count INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(habit_id, date)
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS goals (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        target_date DATE,
        completed BOOLEAN DEFAULT FALSE,
        completed_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS subtasks (
        id SERIAL PRIMARY KEY,
        goal_id INTEGER NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        completed BOOLEAN DEFAULT FALSE,
        completed_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;

    // Create indexes for better performance
    await sql`CREATE INDEX IF NOT EXISTS idx_habit_completions_habit_id ON habit_completions(habit_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_habit_completions_date ON habit_completions(completion_date)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_habit_counter_data_habit_id ON habit_counter_data(habit_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_habit_counter_data_date ON habit_counter_data(date)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_subtasks_goal_id ON subtasks(goal_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_goals_completed ON goals(completed)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_habits_type ON habits(type)`;

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

// Habit functions
export async function getHabits(): Promise<Habit[]> {
  try {
    // Get all habits
    const habitsResult = await sql`
      SELECT id, name, type, goal, created_at 
      FROM habits 
      ORDER BY created_at DESC
    `;

    const habits: Habit[] = [];

    for (const habit of habitsResult) {
      // Get completions for simple habits
      const completionsResult = await sql`
        SELECT completion_date 
        FROM habit_completions 
        WHERE habit_id = ${habit.id}
        ORDER BY completion_date DESC
      `;

      // Get counter data for counter habits
      const counterResult = await sql`
        SELECT date, count 
        FROM habit_counter_data 
        WHERE habit_id = ${habit.id}
        ORDER BY date DESC
      `;

      const completions = completionsResult.map(row => row.completion_date);
      const counterData: { [date: string]: number } = {};
      
      counterResult.forEach(row => {
        counterData[row.date] = row.count;
      });

      habits.push({
        id: habit.id,
        name: habit.name,
        type: habit.type,
        goal: habit.goal,
        completions,
        counterData: Object.keys(counterData).length > 0 ? counterData : undefined,
        createdAt: habit.created_at,
      });
    }

    return habits;
  } catch (error) {
    console.error('Error fetching habits:', error);
    throw error;
  }
}

export async function createHabit(habitData: {
  name: string;
  type: 'simple' | 'counter';
  goal?: number;
}): Promise<Habit> {
  try {
    const result = await sql`
      INSERT INTO habits (name, type, goal)
      VALUES (${habitData.name}, ${habitData.type}, ${habitData.goal || 1})
      RETURNING id, name, type, goal, created_at
    `;

    const habit = result[0];
    return {
      id: habit.id,
      name: habit.name,
      type: habit.type,
      goal: habit.goal,
      completions: [],
      counterData: undefined,
      createdAt: habit.created_at,
    };
  } catch (error) {
    console.error('Error creating habit:', error);
    throw error;
  }
}

export async function completeHabit(habitId: number): Promise<void> {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    await sql`
      INSERT INTO habit_completions (habit_id, completion_date)
      VALUES (${habitId}, ${today})
      ON CONFLICT (habit_id, completion_date) DO NOTHING
    `;
  } catch (error) {
    console.error('Error completing habit:', error);
    throw error;
  }
}

export async function uncompleteHabit(habitId: number): Promise<void> {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    await sql`
      DELETE FROM habit_completions 
      WHERE habit_id = ${habitId} AND completion_date = ${today}
    `;
  } catch (error) {
    console.error('Error uncompleting habit:', error);
    throw error;
  }
}

export async function updateHabitCounter(habitId: number, count: number): Promise<void> {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    await sql`
      INSERT INTO habit_counter_data (habit_id, date, count, updated_at)
      VALUES (${habitId}, ${today}, ${count}, NOW())
      ON CONFLICT (habit_id, date) 
      DO UPDATE SET count = ${count}, updated_at = NOW()
    `;
  } catch (error) {
    console.error('Error updating habit counter:', error);
    throw error;
  }
}

export async function deleteHabit(habitId: number): Promise<void> {
  try {
    await sql`DELETE FROM habits WHERE id = ${habitId}`;
  } catch (error) {
    console.error('Error deleting habit:', error);
    throw error;
  }
}

// Goal functions
export async function getGoals(): Promise<Goal[]> {
  try {
    const goalsResult = await sql`
      SELECT id, name, description, target_date, completed, completed_at, created_at
      FROM goals 
      ORDER BY created_at DESC
    `;

    const goals: Goal[] = [];

    for (const goal of goalsResult) {
      const subtasksResult = await sql`
        SELECT id, name, completed, completed_at
        FROM subtasks 
        WHERE goal_id = ${goal.id}
        ORDER BY created_at ASC
      `;

      const subtasks: Subtask[] = subtasksResult.map(row => ({
        id: row.id,
        name: row.name,
        completed: row.completed,
        completedAt: row.completed_at,
      }));

      goals.push({
        id: goal.id,
        name: goal.name,
        description: goal.description,
        targetDate: goal.target_date,
        completed: goal.completed,
        completedAt: goal.completed_at,
        subtasks,
        createdAt: goal.created_at,
      });
    }

    return goals;
  } catch (error) {
    console.error('Error fetching goals:', error);
    throw error;
  }
}

export async function createGoal(goalData: {
  name: string;
  description?: string;
  targetDate?: string;
}): Promise<Goal> {
  try {
    const result = await sql`
      INSERT INTO goals (name, description, target_date)
      VALUES (${goalData.name}, ${goalData.description || null}, ${goalData.targetDate || null})
      RETURNING id, name, description, target_date, completed, completed_at, created_at
    `;

    const goal = result[0];
    return {
      id: goal.id,
      name: goal.name,
      description: goal.description,
      targetDate: goal.target_date,
      completed: goal.completed,
      completedAt: goal.completed_at,
      subtasks: [],
      createdAt: goal.created_at,
    };
  } catch (error) {
    console.error('Error creating goal:', error);
    throw error;
  }
}

export async function addSubtask(goalId: number, name: string): Promise<void> {
  try {
    await sql`
      INSERT INTO subtasks (goal_id, name)
      VALUES (${goalId}, ${name})
    `;
  } catch (error) {
    console.error('Error adding subtask:', error);
    throw error;
  }
}

export async function toggleSubtask(goalId: number, subtaskId: number): Promise<void> {
  try {
    // Toggle the subtask
    await sql`
      UPDATE subtasks 
      SET completed = NOT completed,
          completed_at = CASE 
            WHEN NOT completed THEN NOW() 
            ELSE NULL 
          END
      WHERE id = ${subtaskId} AND goal_id = ${goalId}
    `;

    // Check if all subtasks are completed and update goal status
    const subtasksResult = await sql`
      SELECT COUNT(*) as total, COUNT(CASE WHEN completed THEN 1 END) as completed_count
      FROM subtasks 
      WHERE goal_id = ${goalId}
    `;

    const { total, completed_count } = subtasksResult[0];
    const allCompleted = total > 0 && total === completed_count;

    await sql`
      UPDATE goals 
      SET completed = ${allCompleted},
          completed_at = CASE 
            WHEN ${allCompleted} THEN NOW() 
            ELSE NULL 
          END
      WHERE id = ${goalId}
    `;
  } catch (error) {
    console.error('Error toggling subtask:', error);
    throw error;
  }
}

export async function deleteSubtask(goalId: number, subtaskId: number): Promise<void> {
  try {
    await sql`
      DELETE FROM subtasks 
      WHERE id = ${subtaskId} AND goal_id = ${goalId}
    `;

    // Recheck goal completion after subtask deletion
    const subtasksResult = await sql`
      SELECT COUNT(*) as total, COUNT(CASE WHEN completed THEN 1 END) as completed_count
      FROM subtasks 
      WHERE goal_id = ${goalId}
    `;

    const { total, completed_count } = subtasksResult[0];
    const allCompleted = total > 0 && total === completed_count;

    await sql`
      UPDATE goals 
      SET completed = ${allCompleted},
          completed_at = CASE 
            WHEN ${allCompleted} THEN NOW() 
            ELSE NULL 
          END
      WHERE id = ${goalId}
    `;
  } catch (error) {
    console.error('Error deleting subtask:', error);
    throw error;
  }
}

export async function deleteGoal(goalId: number): Promise<void> {
  try {
    await sql`DELETE FROM goals WHERE id = ${goalId}`;
  } catch (error) {
    console.error('Error deleting goal:', error);
    throw error;
  }
}