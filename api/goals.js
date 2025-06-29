let goals = [];
let nextGoalId = 1;
let nextSubtaskId = 1;

export default function handler(req, res) {
  const { action, id, subtaskId } = req.query;

  try {
    switch (action) {
      case 'list':
        return res.status(200).json(goals);

      case 'create':
        const { name, description, targetDate } = req.body;
        if (!name) {
          return res.status(400).json({ error: 'Goal name is required' });
        }

        const newGoal = {
          id: nextGoalId++,
          name,
          description: description || '',
          targetDate: targetDate || null,
          subtasks: [],
          createdAt: new Date().toISOString(),
          completed: false,
          completedAt: null,
        };

        goals.push(newGoal);
        return res.status(201).json(newGoal);

      case 'add-subtask':
        const goalId = parseInt(id);
        const goal = goals.find(g => g.id === goalId);
        
        if (!goal) {
          return res.status(404).json({ error: 'Goal not found' });
        }

        const { name: subtaskName } = req.body;
        if (!subtaskName) {
          return res.status(400).json({ error: 'Subtask name is required' });
        }

        const newSubtask = {
          id: nextSubtaskId++,
          name: subtaskName,
          completed: false,
          completedAt: null,
        };

        goal.subtasks.push(newSubtask);
        return res.status(201).json(goal);

      case 'toggle-subtask':
        const toggleGoalId = parseInt(id);
        const toggleSubtaskId = parseInt(subtaskId);
        const toggleGoal = goals.find(g => g.id === toggleGoalId);
        
        if (!toggleGoal) {
          return res.status(404).json({ error: 'Goal not found' });
        }

        const subtask = toggleGoal.subtasks.find(s => s.id === toggleSubtaskId);
        if (!subtask) {
          return res.status(404).json({ error: 'Subtask not found' });
        }

        subtask.completed = !subtask.completed;
        subtask.completedAt = subtask.completed ? new Date().toISOString() : null;

        // Check if all subtasks are completed and mark goal as completed
        const allCompleted = toggleGoal.subtasks.length > 0 && 
                           toggleGoal.subtasks.every(s => s.completed);
        
        if (allCompleted && !toggleGoal.completed) {
          toggleGoal.completed = true;
          toggleGoal.completedAt = new Date().toISOString();
        } else if (!allCompleted && toggleGoal.completed) {
          toggleGoal.completed = false;
          toggleGoal.completedAt = null;
        }

        return res.status(200).json(toggleGoal);

      case 'delete-subtask':
        const deleteGoalId = parseInt(id);
        const deleteSubtaskId = parseInt(subtaskId);
        const deleteGoal = goals.find(g => g.id === deleteGoalId);
        
        if (!deleteGoal) {
          return res.status(404).json({ error: 'Goal not found' });
        }

        const subtaskIndex = deleteGoal.subtasks.findIndex(s => s.id === deleteSubtaskId);
        if (subtaskIndex === -1) {
          return res.status(404).json({ error: 'Subtask not found' });
        }

        deleteGoal.subtasks.splice(subtaskIndex, 1);

        // Recheck goal completion after subtask deletion
        const allStillCompleted = deleteGoal.subtasks.length > 0 && 
                                 deleteGoal.subtasks.every(s => s.completed);
        
        if (!allStillCompleted && deleteGoal.completed) {
          deleteGoal.completed = false;
          deleteGoal.completedAt = null;
        }

        return res.status(200).json(deleteGoal);

      case 'delete':
        const deleteId = parseInt(id);
        const goalIndex = goals.findIndex(g => g.id === deleteId);
        
        if (goalIndex === -1) {
          return res.status(404).json({ error: 'Goal not found' });
        }

        goals.splice(goalIndex, 1);
        return res.status(200).json({ message: 'Goal deleted successfully' });

      default:
        return res.status(400).json({ error: 'Invalid action' });
    }
  } catch (error) {
    console.error('Error in goals API:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}