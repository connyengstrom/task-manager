const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();

app.use(cors());
app.use(bodyParser.json());

let users = [
  { id: 1, username: 'test', password: 'test' }
];

let tasks = [];

// Login endpoint
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  
  // Find the user
  const user = users.find(u => u.username === username && u.password === password);
  
  if (user) {
    // User found, return user info
    res.json({ id: user.id, username: user.username });
  } else {
    // User not found, return error
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

// Signup endpoint
app.post('/signup', (req, res) => {
  const { username, password } = req.body;
  
  // Check if the username already exists
  if (users.find(u => u.username === username)) {
    return res.status(400).json({ error: 'Username already exists' });
  }

  // Create a new user
  const newUser = { id: users.length + 1, username, password };
  users.push(newUser);

  res.json({ id: newUser.id, username: newUser.username });
});

// Add a new task
app.post('/tasks', (req, res) => {
  const { userId, text, time, priority } = req.body;
  
  // Create a new task
  const newTask = { id: tasks.length + 1, userId, text, time, priority, completed: false };
  tasks.push(newTask);

  res.json(newTask);
});

// Get tasks for a user
app.get('/tasks', (req, res) => {
  const { userId } = req.query;
  
  // Filter tasks for the user
  const userTasks = tasks.filter(task => task.userId == userId);

  res.json(userTasks);
});

// Delete a task
app.delete('/tasks/:id', (req, res) => {
  const { id } = req.params;
  
  // Remove the task
  tasks = tasks.filter(task => task.id != id);

  res.json({ success: true });
});

// Update task completion status
app.patch('/tasks/:id', (req, res) => {
  const { id } = req.params;
  const { completed } = req.body;

  // Find the task
  const task = tasks.find(task => task.id == id);
  
  if (task) {
    // Update the task's completion status
    task.completed = completed;
    res.json(task);
  } else {
    res.status(404).json({ error: 'Task not found' });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
