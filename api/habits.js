// Simple in-memory storage (resets on each deployment)
let habits = [];
let nextId = 1;

export default function handler(req, res) {
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
    res.status(200).json(habits);
  } else if (req.method === 'POST') {
    // POST /api/habits - Create new habit
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
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}