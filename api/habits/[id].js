// Simple in-memory storage (shared with habits.js - in production use a database)
let habits = [];

module.exports = function handler(req, res) {
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

  if (req.method === 'DELETE') {
    // DELETE /api/habits/[id] - Delete habit
    const habitIndex = habits.findIndex(h => h.id === habitId);
    
    if (habitIndex === -1) {
      return res.status(404).json({ error: 'Habit not found' });
    }

    habits.splice(habitIndex, 1);
    res.status(204).end();
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}