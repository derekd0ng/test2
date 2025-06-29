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
        const { name } = req.body;
        if (!name) {
          return res.status(400).json({ error: 'Habit name is required' });
        }
        
        const newHabit = {
          id: nextId++,
          name,
          completions: [],
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
        // POST mark as complete
        const habit = habits.find(h => h.id === parseInt(id));
        if (!habit) {
          return res.status(404).json({ error: 'Habit not found' });
        }
        
        if (!habit.completions.includes(today)) {
          habit.completions.push(today);
        }
        res.status(200).json(habit);
        break;

      case 'uncomplete':
        // DELETE completion
        const habitToUncomplete = habits.find(h => h.id === parseInt(id));
        if (!habitToUncomplete) {
          return res.status(404).json({ error: 'Habit not found' });
        }
        
        habitToUncomplete.completions = habitToUncomplete.completions.filter(date => date !== today);
        res.status(200).json(habitToUncomplete);
        break;

      default:
        res.status(400).json({ error: 'Invalid action' });
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};