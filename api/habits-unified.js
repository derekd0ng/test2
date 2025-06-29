// Unified API endpoint for all habit operations
// Keeps all data in the same function context

let habits = [];
let nextId = 1;

module.exports = function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { action, id } = req.query;
  const today = new Date().toISOString().split('T')[0];

  try {
    switch (action) {
      case 'list':
        // GET all habits
        res.status(200).json(habits);
        break;

      case 'create':
        // POST create new habit
        const { name, type, goal } = req.body;
        if (!name) {
          return res.status(400).json({ error: 'Habit name is required' });
        }
        
        const newHabit = {
          id: nextId++,
          name,
          type: type || 'simple', // 'simple' or 'counter'
          goal: type === 'counter' ? (goal || 1) : null,
          completions: [], // For simple habits: ['2024-01-01']
          counterData: {}, // For counter habits: {'2024-01-01': 25}
          createdAt: new Date().toISOString()
        };
        habits.push(newHabit);
        res.status(201).json(newHabit);
        break;

      case 'delete':
        // DELETE habit
        const habitIndex = habits.findIndex(h => h.id === parseInt(id));
        if (habitIndex === -1) {
          return res.status(404).json({ error: 'Habit not found' });
        }
        habits.splice(habitIndex, 1);
        res.status(204).end();
        break;

      case 'complete':
        // POST mark as complete (simple habits only)
        const habit = habits.find(h => h.id === parseInt(id));
        if (!habit) {
          return res.status(404).json({ error: 'Habit not found' });
        }
        
        if (habit.type === 'simple' && !habit.completions.includes(today)) {
          habit.completions.push(today);
        }
        res.status(200).json(habit);
        break;

      case 'uncomplete':
        // DELETE completion (simple habits only)
        const habitToUncomplete = habits.find(h => h.id === parseInt(id));
        if (!habitToUncomplete) {
          return res.status(404).json({ error: 'Habit not found' });
        }
        
        if (habitToUncomplete.type === 'simple') {
          habitToUncomplete.completions = habitToUncomplete.completions.filter(date => date !== today);
        }
        res.status(200).json(habitToUncomplete);
        break;

      case 'update-counter':
        // POST update counter value
        const { count } = req.body;
        const counterHabit = habits.find(h => h.id === parseInt(id));
        if (!counterHabit) {
          return res.status(404).json({ error: 'Habit not found' });
        }
        
        if (counterHabit.type === 'counter') {
          counterHabit.counterData[today] = parseInt(count) || 0;
          
          // Mark as completed if goal is reached
          if (counterHabit.counterData[today] >= counterHabit.goal) {
            if (!counterHabit.completions.includes(today)) {
              counterHabit.completions.push(today);
            }
          } else {
            // Remove completion if goal is no longer met
            counterHabit.completions = counterHabit.completions.filter(date => date !== today);
          }
        }
        res.status(200).json(counterHabit);
        break;

      default:
        res.status(400).json({ error: 'Invalid action' });
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};