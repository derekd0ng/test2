// Unified API endpoint for all habit operations with Postgres database
import { 
  initializeDatabase,
  getHabits,
  createHabit,
  completeHabit,
  uncompleteHabit,
  updateHabitCounter,
  deleteHabit
} from '../lib/db.ts';

module.exports = async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { action, id } = req.query;

  try {
    // Initialize database on first request
    await initializeDatabase();

    switch (action) {
      case 'list':
        const habits = await getHabits();
        return res.status(200).json(habits);

      case 'create':
        const { name, type, goal } = req.body;
        if (!name) {
          return res.status(400).json({ error: 'Habit name is required' });
        }

        const newHabit = await createHabit({
          name,
          type: type || 'simple',
          goal: type === 'counter' ? (goal || 1) : 1,
        });

        return res.status(201).json(newHabit);

      case 'complete':
        const habitId = parseInt(id);
        if (!habitId) {
          return res.status(400).json({ error: 'Invalid habit ID' });
        }

        await completeHabit(habitId);
        const updatedHabits = await getHabits();
        const completedHabit = updatedHabits.find(h => h.id === habitId);
        return res.status(200).json(completedHabit || { message: 'Habit completed' });

      case 'uncomplete':
        const habitIdUncomplete = parseInt(id);
        if (!habitIdUncomplete) {
          return res.status(400).json({ error: 'Invalid habit ID' });
        }

        await uncompleteHabit(habitIdUncomplete);
        const updatedHabitsUncomplete = await getHabits();
        const uncompletedHabit = updatedHabitsUncomplete.find(h => h.id === habitIdUncomplete);
        return res.status(200).json(uncompletedHabit || { message: 'Habit uncompleted' });

      case 'update-counter':
        const habitIdCounter = parseInt(id);
        if (!habitIdCounter) {
          return res.status(400).json({ error: 'Invalid habit ID' });
        }

        const { count } = req.body;
        if (count === undefined || count === null) {
          return res.status(400).json({ error: 'Count is required' });
        }

        await updateHabitCounter(habitIdCounter, count);
        
        // Get the habit to check if it meets the goal for completion
        const allHabits = await getHabits();
        const habit = allHabits.find(h => h.id === habitIdCounter);
        
        if (habit && habit.type === 'counter') {
          const today = new Date().toISOString().split('T')[0];
          const todayCount = habit.counterData?.[today] || 0;
          const goal = habit.goal || 1;
          
          if (todayCount >= goal) {
            await completeHabit(habitIdCounter);
          } else {
            await uncompleteHabit(habitIdCounter);
          }
        }

        const updatedHabitsCounter = await getHabits();
        const updatedHabit = updatedHabitsCounter.find(h => h.id === habitIdCounter);
        return res.status(200).json(updatedHabit || { message: 'Counter updated' });

      case 'delete':
        const habitIdDelete = parseInt(id);
        if (!habitIdDelete) {
          return res.status(400).json({ error: 'Invalid habit ID' });
        }

        await deleteHabit(habitIdDelete);
        return res.status(200).json({ message: 'Habit deleted successfully' });

      default:
        return res.status(400).json({ error: 'Invalid action' });
    }
  } catch (error) {
    console.error('Error in habits API:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};