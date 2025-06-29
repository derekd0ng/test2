// Shared in-memory data store for all API functions
// Note: This will still reset on deployment, but will persist during a session

let habits = [];
let nextId = 1;

function getHabits() {
  return habits;
}

function addHabit(name) {
  const newHabit = {
    id: nextId++,
    name,
    completions: [],
    createdAt: new Date().toISOString()
  };
  habits.push(newHabit);
  return newHabit;
}

function findHabit(id) {
  return habits.find(h => h.id === parseInt(id));
}

function deleteHabit(id) {
  const habitIndex = habits.findIndex(h => h.id === parseInt(id));
  if (habitIndex !== -1) {
    habits.splice(habitIndex, 1);
    return true;
  }
  return false;
}

function addCompletion(id, date) {
  const habit = findHabit(id);
  if (habit && !habit.completions.includes(date)) {
    habit.completions.push(date);
  }
  return habit;
}

function removeCompletion(id, date) {
  const habit = findHabit(id);
  if (habit) {
    habit.completions = habit.completions.filter(d => d !== date);
  }
  return habit;
}

module.exports = {
  getHabits,
  addHabit,
  findHabit,
  deleteHabit,
  addCompletion,
  removeCompletion
};