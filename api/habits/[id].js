const store = require('../_store');

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

  if (req.method === 'DELETE') {
    // DELETE /api/habits/[id] - Delete habit
    const success = store.deleteHabit(id);
    
    if (!success) {
      return res.status(404).json({ error: 'Habit not found' });
    }

    res.status(204).end();
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}