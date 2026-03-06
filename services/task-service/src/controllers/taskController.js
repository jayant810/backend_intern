const Task = require('../models/Task');
const User = require('../models/User');
const redis = require('redis');

let redisClient;
if (process.env.REDIS_URL) {
  redisClient = redis.createClient({ url: process.env.REDIS_URL });
  redisClient.connect().catch(err => console.error('Redis Connection Error:', err));
}

// Helper to clear all task-related caches
const clearTaskCache = async () => {
  if (!redisClient || !redisClient.isOpen) return;
  try {
    const keys = await redisClient.keys('tasks_*');
    if (keys.length > 0) {
      await redisClient.del(keys);
      console.log('All task caches cleared');
    }
  } catch (err) {
    console.error('Redis Cache Clear Error:', err);
  }
};

// @desc    Get all tasks
// @route   GET /api/v1/tasks
// @access  Private
exports.getTasks = async (req, res) => {
  try {
    const cacheKey = `tasks_${req.user.id}_${req.user.role}`;
    
    if (redisClient && redisClient.isOpen) {
      const cachedTasks = await redisClient.get(cacheKey);
      if (cachedTasks) {
        console.log(`Serving tasks from cache for user ${req.user.id}`);
        const data = JSON.parse(cachedTasks);
        return res.status(200).json({ 
          success: true, 
          count: data.length, 
          data: data, 
          source: 'cache' 
        });
      }
    }

    let tasks;

    // If user is admin, they can see all tasks, else only their own
    if (req.user.role === 'admin') {
      tasks = await Task.findAll({ 
        include: { model: User, attributes: ['name', 'email'] },
        order: [['createdAt', 'DESC']]
      });
    } else {
      tasks = await Task.findAll({ 
        where: { userId: req.user.id },
        order: [['createdAt', 'DESC']]
      });
    }

    if (redisClient && redisClient.isOpen) {
      await redisClient.setEx(cacheKey, 60, JSON.stringify(tasks));
    }

    console.log(`Serving tasks from database for user ${req.user.id}`);
    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks,
      source: 'database'
    });
  } catch (err) {
    console.error('Get Tasks Error:', err);
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
    
    console.log(`Creating task for user ${req.user.id}: ${title}`);

    const task = await Task.create({
      title,
      description,
      status: status || 'pending',
      userId: req.user.id
    });

    // Clear all task caches
    await clearTaskCache();

    res.status(201).json({
      success: true,
      data: task
    });
  } catch (err) {
    console.error('Create Task Error:', err);
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Update task
// @route   PUT /api/v1/tasks/:id
// @access  Private
exports.updateTask = async (req, res) => {
  try {
    console.log(`Update request for task ${req.params.id} from user ${req.user.id}`);
    console.log('Update body:', req.body);

    let task = await Task.findByPk(req.params.id);

    if (!task) {
      console.log('Task not found for update');
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    // Make sure user is task owner or admin
    if (task.userId !== req.user.id && req.user.role !== 'admin') {
      console.log(`User ${req.user.id} not authorized to update task ${task.id}`);
      return res.status(401).json({ success: false, message: 'Not authorized to update this task' });
    }

    // Update the task
    task = await task.update(req.body);
    console.log('Task updated in database:', task.toJSON());
    
    // Clear all task caches
    await clearTaskCache();

    // Re-fetch with associations if admin to maintain UI consistency
    if (req.user.role === 'admin') {
      task = await Task.findByPk(task.id, {
        include: { model: User, attributes: ['name', 'email'] }
      });
    }

    res.status(200).json({ success: true, data: task });
  } catch (err) {
    console.error('Update Task Error:', err);
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
    
    // Clear all task caches
    await clearTaskCache();

    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    console.error('Delete Task Error:', err);
    res.status(400).json({ success: false, message: err.message });
  }
};
