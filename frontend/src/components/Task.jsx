import { useState } from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { updateTask, deleteTask } from '../services/api';

const Task = ({ task, index, onTasksChange }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');

  const handleSaveTask = async () => {
    if (title.trim() === '') return;

    try {
      const updatedTask = await updateTask(task._id, {
        title,
        description
      });

      onTasksChange(updatedTask);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleDeleteTask = async () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteTask(task._id);
        onTasksChange(null, task._id);
      } catch (error) {
        console.error('Error deleting task:', error);
      }
    }
  };

  return (
    <Draggable draggableId={task._id} index={index}>
      {(provided) => (
        <div
          className="task"
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          {isEditing ? (
            <div className="task-edit">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Task title"
                autoFocus
              />
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description (optional)"
              />
              <div className="task-edit-actions">
                <button
                  className="btn btn-primary"
                  onClick={handleSaveTask}
                >
                  Save
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="task-content" onClick={() => setIsEditing(true)}>
              <div className="task-header">
                <h4 className="task-title">{task.title}</h4>
                <button
                  className="delete-task-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteTask();
                  }}
                >
                  &times;
                </button>
              </div>
              {task.description && (
                <p className="task-description">{task.description}</p>
              )}
            </div>
          )}
        </div>
      )}
    </Draggable>
  );
};

export default Task;
