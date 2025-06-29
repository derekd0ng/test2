// Goals API endpoint with Postgres database
import { 
  initializeDatabase,
  getGoals,
  createGoal,
  addSubtask,
  toggleSubtask,
  deleteSubtask,
  deleteGoal
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

  const { action, id, subtaskId } = req.query;

  try {
    // Initialize database on first request
    await initializeDatabase();

    switch (action) {
      case 'list':
        const goals = await getGoals();
        return res.status(200).json(goals);

      case 'create':
        const { name, description, targetDate } = req.body;
        if (!name) {
          return res.status(400).json({ error: 'Goal name is required' });
        }

        const newGoal = await createGoal({
          name,
          description,
          targetDate,
        });

        return res.status(201).json(newGoal);

      case 'add-subtask':
        const goalId = parseInt(id);
        if (!goalId) {
          return res.status(400).json({ error: 'Invalid goal ID' });
        }

        const { name: subtaskName } = req.body;
        if (!subtaskName) {
          return res.status(400).json({ error: 'Subtask name is required' });
        }

        await addSubtask(goalId, subtaskName);
        const updatedGoals = await getGoals();
        const updatedGoal = updatedGoals.find(g => g.id === goalId);
        return res.status(201).json(updatedGoal || { message: 'Subtask added' });

      case 'toggle-subtask':
        const toggleGoalId = parseInt(id);
        const toggleSubtaskId = parseInt(subtaskId);
        
        if (!toggleGoalId || !toggleSubtaskId) {
          return res.status(400).json({ error: 'Invalid goal or subtask ID' });
        }

        await toggleSubtask(toggleGoalId, toggleSubtaskId);
        const toggledGoals = await getGoals();
        const toggledGoal = toggledGoals.find(g => g.id === toggleGoalId);
        return res.status(200).json(toggledGoal || { message: 'Subtask toggled' });

      case 'delete-subtask':
        const deleteGoalId = parseInt(id);
        const deleteSubtaskId = parseInt(subtaskId);
        
        if (!deleteGoalId || !deleteSubtaskId) {
          return res.status(400).json({ error: 'Invalid goal or subtask ID' });
        }

        await deleteSubtask(deleteGoalId, deleteSubtaskId);
        const deletedSubtaskGoals = await getGoals();
        const deletedSubtaskGoal = deletedSubtaskGoals.find(g => g.id === deleteGoalId);
        return res.status(200).json(deletedSubtaskGoal || { message: 'Subtask deleted' });

      case 'delete':
        const deleteId = parseInt(id);
        if (!deleteId) {
          return res.status(400).json({ error: 'Invalid goal ID' });
        }

        await deleteGoal(deleteId);
        return res.status(200).json({ message: 'Goal deleted successfully' });

      default:
        return res.status(400).json({ error: 'Invalid action' });
    }
  } catch (error) {
    console.error('Error in goals API:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};