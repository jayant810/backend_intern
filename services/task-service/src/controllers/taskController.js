const Task = require('../models/Task');
const User = require('../models/User');
const redis = require('redis');

let redisClient;
if (process.env.REDIS_URL) {
  redisClient = redis.createClient({ url: process.env.REDIS_URL });
  redisClient.connect().catch(console.error);
}

// @desc    Get all tasks
// @route   GET /api/v1/tasks
// @access  Private
exports.getTasks = async (req, res) => {
  try {
    const cacheKey = `tasks_${req.user.id}_${req.user.role}`;
    
    if (redisClient) {
      const cachedTasks = await redisClient.get(cacheKey);
      if (cachedTasks) {
        return res.status(200).json({ success: true, count: JSON.parse(cachedTasks).length, data: JSON.parse(cachedTasks), source: 'cache' });
      }
    }

    let tasks;

    // If user is admin, they can see all tasks, else only their own
    if (req.user.role === 'admin') {
      tasks = await Task.findAll({ include: { model: User, attributes: ['name', 'email'] } });
    } else {
      tasks = await Task.findAll({ where: { userId: req.user.id } });
    }

    if (redisClient) {
      await redisClient.setEx(cacheKey, 60, JSON.stringify(tasks)); // Cache for 60 seconds
    }

    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks,
      source: 'database'
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Get single task
// @route   GET /api/v1/tasks/:id
// @access  Private
exports.getTask = async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    // Make sure user is task owner or admin
    if (task.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Not authorized to access this task' });
    }

    res.status(200).json({ success: true, data: task });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Create new task
// @route   POST /api/v1/tasks
// @access  Private
exports.createTask = async (req, res) => {
  try {
    const { title, description, status } = req.body;
    
    const task = await Task.create({
      title,
      description,
      status,
      userId: req.user.id
    });

    res.status(201).json({
      success: true,
      data: task
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Update task
// @route   PUT /api/v1/tasks/:id
// @access  Private
exports.updateTask = async (req, res) => {
  try {
    let task = await Task.findByPk(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    // Make sure user is task owner or admin
    if (task.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Not authorized to update this task' });
    }

    task = await task.update(req.body);

    res.status(200).json({ success: true, data: task });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Delete task
// @route   DELETE /api/v1/tasks/:id
// @access  Private
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    // Make sure user is task owner or admin
    if (task.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Not authorized to delete this task' });
    }

    await task.destroy();

    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
