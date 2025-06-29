const store = require('./_store');

module.exports = function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    // GET /api/habits - Get all habits
    res.status(200).json(store.getHabits());
  } else if (req.method === 'POST') {
    // POST /api/habits - Create new habit
    const { name } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Habit name is required' });
    }

    const newHabit = store.addHabit(name);
    res.status(201).json(newHabit);
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}