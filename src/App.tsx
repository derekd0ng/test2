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

function App() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitType, setNewHabitType] = useState<'simple' | 'counter'>('simple');
  const [newHabitGoal, setNewHabitGoal] = useState<number>(1);

  useEffect(() => {
    fetchHabits();
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

  return (
    <div className="App">
      <header className="App-header">
        <h1>Habit Tracker</h1>
        
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
      </header>
    </div>
  );
}

export default App;
