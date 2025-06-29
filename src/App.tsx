import React, { useState, useEffect } from 'react';
import './App.css';

interface Habit {
  id: number;
  name: string;
  completions: string[];
  createdAt: string;
}

function App() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [newHabitName, setNewHabitName] = useState('');

  useEffect(() => {
    fetchHabits();
  }, []);

  const fetchHabits = async () => {
    try {
      const response = await fetch('/api/habits');
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
      const response = await fetch('/api/habits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newHabitName.trim() }),
      });
      
      if (response.ok) {
        setNewHabitName('');
        fetchHabits();
      }
    } catch (error) {
      console.error('Error adding habit:', error);
    }
  };

  const toggleHabitCompletion = async (habitId: number, isCompleted: boolean) => {
    try {
      const url = `/api/habits/${habitId}/complete`;
      const method = isCompleted ? 'DELETE' : 'POST';
      
      const response = await fetch(url, { method });
      
      if (response.ok) {
        fetchHabits();
      }
    } catch (error) {
      console.error('Error toggling habit completion:', error);
    }
  };

  const deleteHabit = async (habitId: number) => {
    try {
      const response = await fetch(`/api/habits/${habitId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        fetchHabits();
      }
    } catch (error) {
      console.error('Error deleting habit:', error);
    }
  };

  const isCompletedToday = (completions: string[]) => {
    const today = new Date().toISOString().split('T')[0];
    return completions.includes(today);
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
          <input
            type="text"
            value={newHabitName}
            onChange={(e) => setNewHabitName(e.target.value)}
            placeholder="Enter new habit"
            className="habit-input"
          />
          <button type="submit" className="add-button">Add Habit</button>
        </form>

        <div className="habits-list">
          {habits.map((habit) => {
            const completed = isCompletedToday(habit.completions);
            const streak = getStreak(habit.completions);
            
            return (
              <div key={habit.id} className={`habit-item ${completed ? 'completed' : ''}`}>
                <div className="habit-info">
                  <h3>{habit.name}</h3>
                  <p>Streak: {streak} days</p>
                  <p>Total completions: {habit.completions.length}</p>
                </div>
                <div className="habit-actions">
                  <button
                    onClick={() => toggleHabitCompletion(habit.id, completed)}
                    className={`complete-button ${completed ? 'completed' : ''}`}
                  >
                    {completed ? '✓ Done Today' : 'Mark Complete'}
                  </button>
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
