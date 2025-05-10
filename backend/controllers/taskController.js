const Task = require('../models/Task');
const List = require('../models/List');

// @desc    Get all tasks for a list
// @route   GET /api/lists/:id/tasks
// @access  Private
const getTasksByList = async (req, res) => {
  try {
    const list = await List.findById(req.params.id);
    
    if (!list) {
      return res.status(404).json({ message: 'List not found' });
    }

    // Check if list belongs to user
    if (list.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to access this list' });
    }

    const tasks = await Task.find({ list: req.params.id }).sort({ position: 1 });
    res.json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Create a new task
// @route   POST /api/lists/:id/tasks
// @access  Private
const createTask = async (req, res) => {
  try {
    const { title, description, position } = req.body;
    const list = await List.findById(req.params.id);
    
    if (!list) {
      return res.status(404).json({ message: 'List not found' });
    }

    // Check if list belongs to user
    if (list.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to add tasks to this list' });
    }

    // Find the highest position if not provided
    let taskPosition = position;
    if (taskPosition === undefined) {
      const lastTask = await Task.findOne({ list: req.params.id }).sort({ position: -1 });
      taskPosition = lastTask ? lastTask.position + 1 : 0;
    }

    const task = await Task.create({
      title,
      description,
      list: req.params.id,
      position: taskPosition,
      createdBy: req.user._id
    });

    res.status(201).json(task);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update a task
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res) => {
  try {
    const { title, description, position } = req.body;
    const task = await Task.findById(req.params.id).populate('list');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check if task belongs to user
    if (task.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this task' });
    }

    task.title = title || task.title;
    task.description = description !== undefined ? description : task.description;
    if (position !== undefined) {
      task.position = position;
    }

    const updatedTask = await task.save();
    res.json(updatedTask);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check if task belongs to user
    if (task.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this task' });
    }

    await task.deleteOne();
    res.json({ message: 'Task removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Move a task to a different list
// @route   PUT /api/tasks/:id/move
// @access  Private
const moveTask = async (req, res) => {
  try {
    const { destinationListId, position } = req.body;
    
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check if task belongs to user
    if (task.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to move this task' });
    }

    // Check if destination list exists and belongs to user
    if (destinationListId) {
      const destinationList = await List.findById(destinationListId);
      if (!destinationList) {
        return res.status(404).json({ message: 'Destination list not found' });
      }

      if (destinationList.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to move to this list' });
      }

      task.list = destinationListId;
    }

    if (position !== undefined) {
      task.position = position;
    }

    const updatedTask = await task.save();
    res.json(updatedTask);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getTasksByList,
  createTask,
  updateTask,
  deleteTask,
  moveTask
};
