import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('pending');
  const [editingId, setEditingId] = useState(null);
  const { user, logout } = useAuth();

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await api.get('/tasks');
      setTasks(res.data.data);
    } catch (err) {
      toast.error('Failed to fetch tasks');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        const res = await api.put(`/tasks/${editingId}`, { title, description, status });
        toast.success('Task updated');
        // Update local state instantly
        setTasks(tasks.map(t => t.id === editingId ? res.data.data : t));
      } else {
        const res = await api.post('/tasks', { title, description, status });
        toast.success('Task created');
        // Add to local state instantly
        setTasks([res.data.data, ...tasks]);
      }
      resetForm();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    }
  };

  const handleEdit = (task) => {
    setEditingId(task.id);
    setTitle(task.title);
    setDescription(task.description);
    setStatus(task.status);
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure?')) {
      try {
        await api.delete(`/tasks/${id}`);
        toast.success('Task deleted');
        // Update local state instantly
        setTasks(tasks.filter(t => t.id !== id));
      } catch (err) {
        toast.error('Failed to delete task');
      }
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setDescription('');
    setStatus('pending');
  };

  return (
    <div className="dashboard">
      <header>
        <h1>Welcome, {user?.name} ({user?.role})</h1>
        <button onClick={logout} className="logout-btn">Logout</button>
      </header>

      <div className="task-form">
        <h3>{editingId ? 'Edit Task' : 'Add New Task'}</h3>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="pending">Pending</option>
            <option value="in-progress">In-Progress</option>
            <option value="completed">Completed</option>
          </select>
          <div className="form-buttons">
            <button type="submit">{editingId ? 'Update Task' : 'Add Task'}</button>
            {editingId && <button type="button" onClick={resetForm}>Cancel</button>}
          </div>
        </form>
      </div>

      <div className="task-list">
        <h3>Tasks</h3>
        {tasks.length === 0 ? (
          <p>No tasks found.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Description</th>
                <th>Status</th>
                {user?.role === 'admin' && <th>User</th>}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <tr key={task.id}>
                  <td>{task.title}</td>
                  <td>{task.description}</td>
                  <td><span className={`status ${task.status}`}>{task.status}</span></td>
                  {user?.role === 'admin' && <td>{task.User?.name || 'Self'}</td>}
                  <td>
                    <button onClick={() => handleEdit(task)}>Edit</button>
                    <button onClick={() => handleDelete(task.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
