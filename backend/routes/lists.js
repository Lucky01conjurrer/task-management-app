const express = require('express');
const router = express.Router();
const { getLists, createList, updateList, deleteList } = require('../controllers/listController');
const { getTasksByList, createTask } = require('../controllers/taskController');
const { protect } = require('../middleware/auth');

// Protect all routes
router.use(protect);

// List routes
router.route('/')
  .get(getLists)
  .post(createList);

router.route('/:id')
  .put(updateList)
  .delete(deleteList);

// Task routes related to lists
router.route('/:id/tasks')
  .get(getTasksByList)
  .post(createTask);

module.exports = router;
