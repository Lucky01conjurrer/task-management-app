const List = require('../models/List');
const Task = require('../models/Task');

// @desc    Get all lists for a user
// @route   GET /api/lists
// @access  Private
const getLists = async (req, res) => {
  try {
    const lists = await List.find({ user: req.user._id }).sort({ position: 1 });
    res.json(lists);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Create a new list
// @route   POST /api/lists
// @access  Private
const createList = async (req, res) => {
  try {
    const { title, position } = req.body;

    // Find the highest position if not provided
    let listPosition = position;
    if (!listPosition) {
      const lastList = await List.findOne({ user: req.user._id }).sort({ position: -1 });
      listPosition = lastList ? lastList.position + 1 : 0;
    }

    const list = await List.create({
      title,
      position: listPosition,
      user: req.user._id
    });

    res.status(201).json(list);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update a list
// @route   PUT /api/lists/:id
// @access  Private
const updateList = async (req, res) => {
  try {
    const { title, position } = req.body;
    const list = await List.findById(req.params.id);

    if (!list) {
      return res.status(404).json({ message: 'List not found' });
    }

    // Check if list belongs to user
    if (list.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this list' });
    }

    list.title = title || list.title;
    if (position !== undefined) {
      list.position = position;
    }

    const updatedList = await list.save();
    res.json(updatedList);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete a list
// @route   DELETE /api/lists/:id
// @access  Private
const deleteList = async (req, res) => {
  try {
    const list = await List.findById(req.params.id);

    if (!list) {
      return res.status(404).json({ message: 'List not found' });
    }

    // Check if list belongs to user
    if (list.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this list' });
    }

    // Delete all tasks in the list
    await Task.deleteMany({ list: list._id });
    
    // Delete the list
    await list.deleteOne();

    res.json({ message: 'List removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getLists,
  createList,
  updateList,
  deleteList
};
