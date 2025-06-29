// Simple in-memory storage (shared - in production use a database)
let habits = [];

export default function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { id } = req.query;
  const habitId = parseInt(id);
  const habit = habits.find(h => h.id === habitId);
  
  if (!habit) {
    return res.status(404).json({ error: 'Habit not found' });
  }

  const today = new Date().toISOString().split('T')[0];

  if (req.method === 'POST') {
    // POST /api/habits/[id]/complete - Mark habit complete for today
    if (!habit.completions.includes(today)) {
      habit.completions.push(today);
    }
    res.status(200).json(habit);
  } else if (req.method === 'DELETE') {
    // DELETE /api/habits/[id]/complete - Remove today's completion
    habit.completions = habit.completions.filter(date => date !== today);
    res.status(200).json(habit);
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}