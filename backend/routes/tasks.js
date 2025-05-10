const express = require('express');
const router = express.Router();
const { updateTask, deleteTask, moveTask } = require('../controllers/taskController');
const { protect } = require('../middleware/auth');

// Protect all routes
router.use(protect);

// Task routes
router.route('/:id')
  .put(updateTask)
  .delete(deleteTask);

router.route('/:id/move')
  .put(moveTask);

module.exports = router;
