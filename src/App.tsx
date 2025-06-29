import React, { useState, useEffect } from 'react';
import './App.css';

interface Habit {
  id: number;
  name: string;
  type: 'simple' | 'counter';
  goal?: number;
  completions: string[];
  counterData?: { [date: string]: number };
  createdAt: string;
}

interface Subtask {
  id: number;
  name: string;
  completed: boolean;
  completedAt?: string;
}

interface Goal {
  id: number;
  name: string;
  description?: string;
  subtasks: Subtask[];
  createdAt: string;
  targetDate?: string;
  completed: boolean;
  completedAt?: string;
}

function App() {
  const [activeTab, setActiveTab] = useState<'habits' | 'goals'>('habits');
  const [habits, setHabits] = useState<Habit[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitType, setNewHabitType] = useState<'simple' | 'counter'>('simple');
  const [newHabitGoal, setNewHabitGoal] = useState<number>(1);
  const [newGoalName, setNewGoalName] = useState('');
  const [newGoalDescription, setNewGoalDescription] = useState('');
  const [newGoalTargetDate, setNewGoalTargetDate] = useState('');

  useEffect(() => {
    fetchHabits();
    fetchGoals();
  }, []);

  const fetchHabits = async () => {
    try {
      const response = await fetch('/api/habits-unified?action=list');
      const data = await response.json();
      setHabits(data);
    } catch (error) {
      console.error('Error fetching habits:', error);
    }
  };

  const addHabit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitName.trim()) return;

    try {
      const habitData = {
        name: newHabitName.trim(),
        type: newHabitType,
        ...(newHabitType === 'counter' && { goal: newHabitGoal })
      };

      const response = await fetch('/api/habits-unified?action=create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(habitData),
      });
      
      if (response.ok) {
        setNewHabitName('');
        setNewHabitType('simple');
        setNewHabitGoal(1);
        fetchHabits();
      }
    } catch (error) {
      console.error('Error adding habit:', error);
    }
  };

  const toggleHabitCompletion = async (habitId: number, isCompleted: boolean) => {
    try {
      const action = isCompleted ? 'uncomplete' : 'complete';
      const url = `/api/habits-unified?action=${action}&id=${habitId}`;
      
      const response = await fetch(url, { method: 'POST' });
      
      if (response.ok) {
        fetchHabits();
      }
    } catch (error) {
      console.error('Error toggling habit completion:', error);
    }
  };

  const deleteHabit = async (habitId: number) => {
    try {
      const response = await fetch(`/api/habits-unified?action=delete&id=${habitId}`, {
        method: 'POST',
      });
      
      if (response.ok) {
        fetchHabits();
      }
    } catch (error) {
      console.error('Error deleting habit:', error);
    }
  };

  const updateCounter = async (habitId: number, count: number) => {
    try {
      const response = await fetch(`/api/habits-unified?action=update-counter&id=${habitId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ count }),
      });
      
      if (response.ok) {
        fetchHabits();
      }
    } catch (error) {
      console.error('Error updating counter:', error);
    }
  };

  const isCompletedToday = (completions: string[]) => {
    const today = new Date().toISOString().split('T')[0];
    return completions.includes(today);
  };

  const getTodayCount = (habit: Habit) => {
    const today = new Date().toISOString().split('T')[0];
    return habit.counterData?.[today] || 0;
  };

  const getStreak = (completions: string[]) => {
    if (completions.length === 0) return 0;
    
    const sortedDates = completions.sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    const today = new Date();
    let streak = 0;
    
    for (let i = 0; i < sortedDates.length; i++) {
      const date = new Date(sortedDates[i]);
      const daysDiff = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === i) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  };

  // Goals functions
  const fetchGoals = async () => {
    try {
      const response = await fetch('/api/goals?action=list');
      const data = await response.json();
      setGoals(data);
    } catch (error) {
      console.error('Error fetching goals:', error);
    }
  };

  const addGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalName.trim()) return;

    try {
      const goalData = {
        name: newGoalName.trim(),
        description: newGoalDescription.trim(),
        targetDate: newGoalTargetDate || undefined,
      };

      const response = await fetch('/api/goals?action=create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(goalData),
      });
      
      if (response.ok) {
        setNewGoalName('');
        setNewGoalDescription('');
        setNewGoalTargetDate('');
        fetchGoals();
      }
    } catch (error) {
      console.error('Error adding goal:', error);
    }
  };

  const addSubtask = async (goalId: number, subtaskName: string) => {
    if (!subtaskName.trim()) return;

    try {
      const response = await fetch(`/api/goals?action=add-subtask&id=${goalId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: subtaskName.trim() }),
      });
      
      if (response.ok) {
        fetchGoals();
      }
    } catch (error) {
      console.error('Error adding subtask:', error);
    }
  };

  const toggleSubtask = async (goalId: number, subtaskId: number) => {
    try {
      const response = await fetch(`/api/goals?action=toggle-subtask&id=${goalId}&subtaskId=${subtaskId}`, {
        method: 'POST',
      });
      
      if (response.ok) {
        fetchGoals();
      }
    } catch (error) {
      console.error('Error toggling subtask:', error);
    }
  };

  const deleteGoal = async (goalId: number) => {
    try {
      const response = await fetch(`/api/goals?action=delete&id=${goalId}`, {
        method: 'POST',
      });
      
      if (response.ok) {
        fetchGoals();
      }
    } catch (error) {
      console.error('Error deleting goal:', error);
    }
  };

  const deleteSubtask = async (goalId: number, subtaskId: number) => {
    try {
      const response = await fetch(`/api/goals?action=delete-subtask&id=${goalId}&subtaskId=${subtaskId}`, {
        method: 'POST',
      });
      
      if (response.ok) {
        fetchGoals();
      }
    } catch (error) {
      console.error('Error deleting subtask:', error);
    }
  };

  const getGoalProgress = (goal: Goal) => {
    if (goal.subtasks.length === 0) return 0;
    const completedCount = goal.subtasks.filter(subtask => subtask.completed).length;
    return (completedCount / goal.subtasks.length) * 100;
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Habit & Goal Tracker</h1>
        
        <div className="tab-navigation">
          <button 
            className={`tab-button ${activeTab === 'habits' ? 'active' : ''}`}
            onClick={() => setActiveTab('habits')}
          >
            Habits
          </button>
          <button 
            className={`tab-button ${activeTab === 'goals' ? 'active' : ''}`}
            onClick={() => setActiveTab('goals')}
          >
            Goals
          </button>
        </div>

        {activeTab === 'habits' ? (
          <>
            <form onSubmit={addHabit} className="add-habit-form">
          <div className="form-row">
            <input
              type="text"
              value={newHabitName}
              onChange={(e) => setNewHabitName(e.target.value)}
              placeholder="Enter new habit"
              className="habit-input"
            />
          </div>
          
          <div className="form-row">
            <div className="input-group">
              <label className="form-label">Type:</label>
              <select 
                value={newHabitType} 
                onChange={(e) => setNewHabitType(e.target.value as 'simple' | 'counter')}
                className="habit-select"
              >
                <option value="simple">Simple (Done/Not Done)</option>
                <option value="counter">Counter (Track Numbers)</option>
              </select>
            </div>
            
            {newHabitType === 'counter' && (
              <div className="input-group">
                <label className="form-label">Daily Goal:</label>
                <input
                  type="number"
                  value={newHabitGoal}
                  onChange={(e) => setNewHabitGoal(parseInt(e.target.value) || 1)}
                  min="1"
                  className="goal-input"
                />
              </div>
            )}
          </div>
          
          <button type="submit" className="add-button">Add Habit</button>
        </form>

        <div className="habits-list">
          {habits.map((habit) => {
            const completed = isCompletedToday(habit.completions);
            const streak = getStreak(habit.completions);
            const todayCount = getTodayCount(habit);
            
            return (
              <div key={habit.id} className={`habit-item ${completed ? 'completed' : ''} ${habit.type}`}>
                <div className="habit-info">
                  <h3>{habit.name}</h3>
                  <div className="habit-type-badge">{habit.type === 'counter' ? 'Counter' : 'Simple'}</div>
                  
                  {habit.type === 'simple' ? (
                    <>
                      <p>Streak: {streak} days</p>
                      <p>Total completions: {habit.completions.length}</p>
                    </>
                  ) : (
                    <>
                      <p>Today: {todayCount} / {habit.goal} {habit.goal === 1 ? 'rep' : 'reps'}</p>
                      <p>Streak: {streak} days</p>
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{ width: `${Math.min((todayCount / (habit.goal || 1)) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </>
                  )}
                </div>
                
                <div className="habit-actions">
                  {habit.type === 'simple' ? (
                    <button
                      onClick={() => toggleHabitCompletion(habit.id, completed)}
                      className={`complete-button ${completed ? 'completed' : ''}`}
                    >
                      {completed ? '✓ Done Today' : 'Mark Complete'}
                    </button>
                  ) : (
                    <div className="counter-controls">
                      <div className="counter-input-group">
                        <button 
                          onClick={() => updateCounter(habit.id, Math.max(0, todayCount - 1))}
                          className="counter-btn minus"
                          disabled={todayCount <= 0}
                        >
                          -
                        </button>
                        <input
                          type="number"
                          value={todayCount}
                          onChange={(e) => updateCounter(habit.id, parseInt(e.target.value) || 0)}
                          className="counter-input"
                          min="0"
                        />
                        <button 
                          onClick={() => updateCounter(habit.id, todayCount + 1)}
                          className="counter-btn plus"
                        >
                          +
                        </button>
                      </div>
                      {completed && <div className="goal-achieved">🎯 Goal Reached!</div>}
                    </div>
                  )}
                  
                  <button
                    onClick={() => deleteHabit(habit.id)}
                    className="delete-button"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>

            {habits.length === 0 && (
              <p className="no-habits">No habits yet. Add one to get started!</p>
            )}
          </>
        ) : (
          <>
            <form onSubmit={addGoal} className="add-habit-form">
              <div className="form-row">
                <input
                  type="text"
                  value={newGoalName}
                  onChange={(e) => setNewGoalName(e.target.value)}
                  placeholder="Enter goal name"
                  className="habit-input"
                />
              </div>
              
              <div className="form-row">
                <div className="input-group">
                  <label className="form-label">Description (optional):</label>
                  <input
                    type="text"
                    value={newGoalDescription}
                    onChange={(e) => setNewGoalDescription(e.target.value)}
                    placeholder="Goal description"
                    className="habit-input"
                  />
                </div>
                
                <div className="input-group">
                  <label className="form-label">Target Date (optional):</label>
                  <input
                    type="date"
                    value={newGoalTargetDate}
                    onChange={(e) => setNewGoalTargetDate(e.target.value)}
                    className="habit-select"
                  />
                </div>
              </div>
              
              <button type="submit" className="add-button">Add Goal</button>
            </form>

            <div className="habits-list">
              {goals.map((goal) => {
                const progress = getGoalProgress(goal);
                const isCompleted = goal.completed;
                
                return (
                  <GoalItem 
                    key={goal.id} 
                    goal={goal} 
                    progress={progress}
                    isCompleted={isCompleted}
                    onAddSubtask={addSubtask}
                    onToggleSubtask={toggleSubtask}
                    onDeleteSubtask={deleteSubtask}
                    onDeleteGoal={deleteGoal}
                  />
                );
              })}
            </div>

            {goals.length === 0 && (
              <p className="no-habits">No goals yet. Add one to get started!</p>
            )}
          </>
        )}
      </header>
    </div>
  );
}

const GoalItem: React.FC<{
  goal: Goal;
  progress: number;
  isCompleted: boolean;
  onAddSubtask: (goalId: number, subtaskName: string) => void;
  onToggleSubtask: (goalId: number, subtaskId: number) => void;
  onDeleteSubtask: (goalId: number, subtaskId: number) => void;
  onDeleteGoal: (goalId: number) => void;
}> = ({ goal, progress, isCompleted, onAddSubtask, onToggleSubtask, onDeleteSubtask, onDeleteGoal }) => {
  const [newSubtaskName, setNewSubtaskName] = useState('');
  const [showAddSubtask, setShowAddSubtask] = useState(false);

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskName.trim()) return;
    
    onAddSubtask(goal.id, newSubtaskName);
    setNewSubtaskName('');
    setShowAddSubtask(false);
  };

  return (
    <div className={`habit-item goal-item ${isCompleted ? 'completed' : ''}`}>
      <div className="habit-info goal-info">
        <h3>{goal.name}</h3>
        <div className="habit-type-badge">Goal</div>
        
        {goal.description && <p className="goal-description">{goal.description}</p>}
        
        {goal.targetDate && (
          <p className="goal-target-date">Target: {new Date(goal.targetDate).toLocaleDateString()}</p>
        )}
        
        <p>Progress: {goal.subtasks.filter(t => t.completed).length} / {goal.subtasks.length} tasks completed</p>
        
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        <div className="subtasks-section">
          <h4>Subtasks:</h4>
          {goal.subtasks.map((subtask) => (
            <div key={subtask.id} className={`subtask-item ${subtask.completed ? 'completed' : ''}`}>
              <label className="subtask-label">
                <input
                  type="checkbox"
                  checked={subtask.completed}
                  onChange={() => onToggleSubtask(goal.id, subtask.id)}
                  className="subtask-checkbox"
                />
                <span className={`subtask-name ${subtask.completed ? 'completed-text' : ''}`}>
                  {subtask.name}
                </span>
              </label>
              <button
                onClick={() => onDeleteSubtask(goal.id, subtask.id)}
                className="delete-subtask-btn"
              >
                ×
              </button>
            </div>
          ))}
          
          {showAddSubtask ? (
            <form onSubmit={handleAddSubtask} className="add-subtask-form">
              <input
                type="text"
                value={newSubtaskName}
                onChange={(e) => setNewSubtaskName(e.target.value)}
                placeholder="New subtask"
                className="subtask-input"
                autoFocus
              />
              <div className="subtask-form-buttons">
                <button type="submit" className="add-subtask-btn">Add</button>
                <button 
                  type="button" 
                  onClick={() => {
                    setShowAddSubtask(false);
                    setNewSubtaskName('');
                  }}
                  className="cancel-subtask-btn"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setShowAddSubtask(true)}
              className="add-subtask-trigger"
            >
              + Add Subtask
            </button>
          )}
        </div>
        
        {progress === 100 && !isCompleted && (
          <div className="goal-achieved">🎯 Goal Complete! All tasks finished!</div>
        )}
      </div>
      
      <div className="habit-actions">
        <button
          onClick={() => onDeleteGoal(goal.id)}
          className="delete-button"
        >
          Delete Goal
        </button>
      </div>
    </div>
  );
};

export default App;
