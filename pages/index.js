import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../context/authContext";
import Link from "next/link";
import { FaTrashAlt } from 'react-icons/fa';

const Home = () => {
  const { user, loading, error } = useAuth();
  
  const [task, setTask] = useState("");
  const [time, setTime] = useState(new Date().toISOString().split('T')[0]); // Set today's date as default
  const [priority, setPriority] = useState("Low");
  const [tasks, setTasks] = useState([]);
  const [message, setMessage] = useState("");
  const [view, setView] = useState("add");

  const taskInputRef = useRef(null);
  
  const router = useRouter();

  // Fetch tasks when the user is logged in
  useEffect(() => {
    if (user) {
      fetchTasks();
    }
  }, [user]);

  // Function to fetch tasks
  const fetchTasks = async () => {
    try {
      const response = await fetch(`http://localhost:5000/tasks?userId=${user.id}`);
      const tasksData = await response.json();
      setTasks(tasksData);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  // Function to add a new task
  const handleAddTask = async (e) => {
    e.preventDefault();

    if (task.trim() === "") {
      setMessage("Task cannot be empty.");
      return;
    }

    if (tasks.some(t => t.text === task && t.time === time && t.priority === priority && !t.completed)) {
      setMessage("Task with the same information already exists.");
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId: user.id, text: task, time, priority, completed: false })
      });

      const newTask = await response.json();
      setTasks([...tasks, newTask]);

      setTask("");
      setTime(new Date().toISOString().split('T')[0]); // Reset to today's date
      setPriority("Low");
      setMessage("");

      // Focus back to the new task input window
      taskInputRef.current.focus();

    } catch (error) {
      console.error("Error adding task:", error);
    }
  };

  // Function to mark a task as complete
  const handleCompleteTask = async (taskId) => {
    const taskElement = document.getElementById(`task-${taskId}`);
    taskElement.classList.add('task-complete');

    // Update the state immediately
    setTasks(tasks.map(task => task.id === taskId ? { ...task, completed: true } : task));

    try {
      // Send the PATCH request to update the backend
      await fetch(`http://localhost:5000/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ completed: true })
      });
    } catch (error) {
      console.error("Error completing task:", error);
    }

    // Remove the animation class after the animation completes
    setTimeout(() => {
      taskElement.classList.remove('task-complete');
    }, 1000); // Matches the duration of the complete animation
  };

  // Function to delete a task
  const handleDeleteTask = async (taskId) => {
    const taskElement = document.getElementById(`task-${taskId}`);
    taskElement.classList.add('fade-out');

    setTimeout(async () => {
      try {
        await fetch(`http://localhost:5000/tasks/${taskId}`, { method: 'DELETE' });
        setTasks(tasks.filter(task => task.id !== taskId));
      } catch (error) {
        console.error("Error deleting task:", error);
      }
    }, 500); // Matches the duration of the fade-out animation
  };

  // Filter tasks by different timeframes
  const filterTasksByTimeframe = (timeframe) => {
    const now = new Date();
    let filteredTasks = [];

    switch (timeframe) {
      case "today":
        filteredTasks = tasks.filter(task => new Date(task.time).toDateString() === now.toDateString());
        break;
      case "tomorrow":
        const tomorrow = new Date(now);
        tomorrow.setDate(now.getDate() + 1);
        filteredTasks = tasks.filter(task => new Date(task.time).toDateString() === tomorrow.toDateString());
        break;
      case "thisWeek":
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1)); // Start from Monday
        startOfWeek.setHours(0, 0, 0, 0);
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);
        filteredTasks = tasks.filter(task => {
          const taskDate = new Date(task.time);
          return taskDate >= startOfWeek && taskDate <= endOfWeek;
        });
        break;
      case "thisMonth":
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        filteredTasks = tasks.filter(task => {
          const taskDate = new Date(task.time);
          return taskDate >= startOfMonth && taskDate <= endOfMonth;
        });
        break;
      case "thisYear":
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        const endOfYear = new Date(now.getFullYear(), 11, 31);
        filteredTasks = tasks.filter(task => {
          const taskDate = new Date(task.time);
          return taskDate >= startOfYear && taskDate <= endOfYear;
        });
        break;
      default:
        filteredTasks = tasks;
        break;
    }

    return filteredTasks;
  };

  // Group tasks by date and sort them by priority within each date
  const groupTasksByDate = (tasks) => {
    const priorityOrder = { "High": 1, "Medium": 2, "Low": 3 };

    const groupedTasks = tasks.reduce((acc, task) => {
      const date = new Date(task.time).toDateString();
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(task);
      return acc;
    }, {});

    // Sort tasks within each date by priority and completion status
    Object.keys(groupedTasks).forEach(date => {
      groupedTasks[date].sort((a, b) => {
        if (a.completed === b.completed) {
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        }
        return a.completed - b.completed;
      });
    });

    return Object.keys(groupedTasks)
      .sort((a, b) => new Date(a) - new Date(b)) // Sort dates in ascending order
      .reduce((acc, key) => {
        acc[key] = groupedTasks[key];
        return acc;
      }, {});
  };

  // Loading state
  if (loading) return <div className="flex justify-center items-center h-screen"><span className="loader"></span></div>;

  // Error state
  if (error) return <div className="flex justify-center items-center h-screen">Error: {error.message}</div>;

  // If not logged in, show login/signup prompt
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-gray-900">
        <div className="container mx-auto p-4 bg-white shadow-lg rounded-md text-center">
          <h1 className="text-4xl mb-4 text-gray-900">Welcome to Task Manager</h1>
          <p className="mb-4 text-lg text-gray-700">
            Please <Link href="/login"><a className="text-blue-500 hover:underline">login</a></Link> or <Link href="/signup"><a className="text-blue-500 hover:underline">sign up</a></Link> to manage your tasks.
          </p>
        </div>
      </div>
    );
  }

  // Display tasks based on the selected view
  const displayedTasks = view === "add" ? tasks : filterTasksByTimeframe(view);
  const groupedByDateTasks = groupTasksByDate(displayedTasks);

  return (
    <div className="flex flex-col lg:flex-row flex-grow h-full">
      {/* Side menu for views */}
      <div className="flex flex-col w-full h-full lg:w-1/5 p-4 bg-white shadow-lg">
        <div className="flex flex-row justify-between">
        <h2 className="text-xl font-bold mb-4">Views</h2>
        <button onClick={() => setView("add")} className={`p-2 mb-2 hover:bg-blue-900 ${view === "add" ? "text-white bg-blue-700" : "text-white bg-blue-700"}`}>+ Add Tasks</button>
        </div>
        <button onClick={() => setView("today")} className={`p-2 mb-2 ${view === "today" ? "bg-blue-500 text-white" : "bg-gray-200"}`}>Tasks Today</button>
        <button onClick={() => setView("tomorrow")} className={`p-2 mb-2 ${view === "tomorrow" ? "bg-blue-500 text-white" : "bg-gray-200"}`}>Tasks Tomorrow</button>
        <button onClick={() => setView("thisWeek")} className={`p-2 mb-2 ${view === "thisWeek" ? "bg-blue-500 text-white" : "bg-gray-200"}`}>This Week</button>
        <button onClick={() => setView("thisMonth")} className={`p-2 mb-2 ${view === "thisMonth" ? "bg-blue-500 text-white" : "bg-gray-200"}`}>This Month</button>
        <button onClick={() => setView("thisYear")} className={`p-2 mb-2 ${view === "thisYear" ? "bg-blue-500 text-white" : "bg-gray-200"}`}>This Year</button>
      </div>

      <div className="flex flex-col items-center justify-center flex-grow py-8 bg-gray-50">
        <div className="container mx-auto p-4 bg-white shadow-lg rounded-md w-full max-w-lg">
          <h1 className="text-4xl mb-6 text-gray-900 text-center">Daily Tasks</h1>
          {view === "add" && (
            <form onSubmit={handleAddTask} className="mb-4 flex flex-col space-y-4">
              <input
                type="text"
                placeholder="New task"
                value={task}
                onChange={(e) => setTask(e.target.value)}
                className="p-2 border rounded border-gray-300"
                ref={taskInputRef}
              />
              <input
                type="date"
                placeholder="Due date"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="p-2 border rounded border-gray-300"
                min={new Date().toISOString().split('T')[0]} // Set min attribute to today's date
              />

              <div className="flex justify-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="priority"
                    value="Low"
                    checked={priority === "Low"}
                    onChange={(e) => setPriority(e.target.value)}
                    className="hidden"
                  />
                  <span className={`p-2 border-2 rounded cursor-pointer ${priority === "Low" ? "bg-green-500 text-white" : "border-green-500"}`}>
                    Low
                  </span>
                </label>

                <label className="flex items-center">
                  <input
                    type="radio"
                    name="priority"
                    value="Medium"
                    checked={priority === "Medium"}
                    onChange={(e) => setPriority(e.target.value)}
                    className="hidden"
                  />
                  <span className={`p-2 border-2 rounded cursor-pointer ${priority === "Medium" ? "bg-yellow-500 text-white" : "border-yellow-500"}`}>
                    Medium
                  </span>
                </label>

                <label className="flex items-center">
                  <input
                    type="radio"
                    name="priority"
                    value="High"
                    checked={priority === "High"}
                    onChange={(e) => setPriority(e.target.value)}
                    className="hidden"
                  />
                  <span className={`p-2 border-2 rounded cursor-pointer ${priority === "High" ? "bg-red-500 text-white" : "border-red-500"}`}>
                    High
                  </span>
                </label>
              </div>

              <button type="submit" className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                Add Task
              </button>
            </form>
          )}

          {message && <p className="text-center text-red-500 mb-4">{message}</p>}

          {Object.keys(groupedByDateTasks).map((date) => (
            <div key={date} className="mb-6">
              <h2 className="text-lg mb-2">{date}</h2>
              <ul>
                {groupedByDateTasks[date].map((task) => (
                  <li id={`task-${task.id}`} key={task.id} className={`mb-2 p-2 border rounded flex justify-between items-center shadow-lg ${task.completed ? 'bg-gray-200' : 'bg-white'}`}>
                    <div>
                      <p className={`font-bold ${task.completed ? "line-through text-gray-500" : "text-gray-900"}`}>{task.text}</p>
                      {task.priority && <p className="text-sm text-gray-600">Priority: {task.priority}</p>}
                      {task.time && <p className="text-sm text-gray-500">{new Date(task.time).toLocaleDateString()}</p>}
                      {task.completed && <p className="text-sm text-green-500">Done</p>}
                    </div>
                    <div className="flex items-center space-x-2">
                      {!task.completed && (
                        <button
                          onClick={() => handleCompleteTask(task.id)}
                          className="p-2 bg-green-500 text-white rounded hover:bg-green-400"
                        >
                          Task Complete
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="icon-button"
                      >
                        <FaTrashAlt className="icon text-gray-700 hover:text-red-500" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
