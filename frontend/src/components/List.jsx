import { useState, useEffect } from 'react';
import { Droppable } from 'react-beautiful-dnd';
import Task from './Task';
import { deleteList } from '../services/api';

const List = ({ list, tasks, onAddTask, onUpdateList, onDeleteList, onTasksChange }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(list.title);
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [showListOptions, setShowListOptions] = useState(false);
  const [listColor, setListColor] = useState(list.color || '#f4f5f7');

  // Update local state when list prop changes
  useEffect(() => {
    setTitle(list.title);
    setListColor(list.color || '#f4f5f7');
  }, [list.title, list.color]);

  const handleTitleChange = async () => {
    if (title.trim() === '') return;

    try {
      await onUpdateList(list._id, { title });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating list title:', error);
    }
  };

  const handleColorChange = async (color) => {
    try {
      await onUpdateList(list._id, { color });
      setListColor(color);
      setShowListOptions(false);
    } catch (error) {
      console.error('Error updating list color:', error);
    }
  };

  const handleTitleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleTitleChange();
    } else if (e.key === 'Escape') {
      setTitle(list.title); // Reset to original title
      setIsEditing(false);
    }
  };

  const handleDeleteList = async () => {
    if (window.confirm('Are you sure you want to delete this list?')) {
      try {
        await deleteList(list._id);
        onDeleteList(list._id);
      } catch (error) {
        console.error('Error deleting list:', error);
      }
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();

    if (newTaskTitle.trim() === '') return;

    try {
      const newTask = await onAddTask(list._id, {
        title: newTaskTitle,
        description: newTaskDescription
      });

      setNewTaskTitle('');
      setNewTaskDescription('');
      setShowAddTask(false);
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  return (
    <div className="list" style={{ backgroundColor: listColor }}>
      <div className="list-header">
        {isEditing ? (
          <div className="list-title-edit">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleTitleChange}
              onKeyDown={handleTitleKeyDown}
              autoFocus
            />
          </div>
        ) : (
          <h3 className="list-title" onClick={() => setIsEditing(true)}>
            {list.title}
          </h3>
        )}
        <div className="list-header-actions">
          <button
            className="list-options-btn"
            onClick={() => setShowListOptions(!showListOptions)}
          >
            ⋮
          </button>
          <button className="delete-list-btn" onClick={handleDeleteList}>
            &times;
          </button>
        </div>
      </div>

      {showListOptions && (
        <div className="list-options">
          <div className="list-options-header">List Options</div>
          <div className="color-picker">
            <div className="color-picker-label">Change List Color:</div>
            <div className="color-options">
              <button
                className="color-option"
                style={{ backgroundColor: '#f4f5f7' }}
                onClick={() => handleColorChange('#f4f5f7')}
              ></button>
              <button
                className="color-option"
                style={{ backgroundColor: '#faf3dc' }}
                onClick={() => handleColorChange('#faf3dc')}
              ></button>
              <button
                className="color-option"
                style={{ backgroundColor: '#e8f5fa' }}
                onClick={() => handleColorChange('#e8f5fa')}
              ></button>
              <button
                className="color-option"
                style={{ backgroundColor: '#ebf5ee' }}
                onClick={() => handleColorChange('#ebf5ee')}
              ></button>
              <button
                className="color-option"
                style={{ backgroundColor: '#f9e9e7' }}
                onClick={() => handleColorChange('#f9e9e7')}
              ></button>
            </div>
          </div>
        </div>
      )}

      <Droppable droppableId={list._id}>
        {(provided) => (
          <div
            className="task-list"
            ref={provided.innerRef}
            {...provided.droppableProps}
          >
            {tasks.map((task, index) => (
              <Task
                key={task._id}
                task={task}
                index={index}
                onTasksChange={onTasksChange}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>

      {showAddTask ? (
        <div className="add-task-form">
          <form onSubmit={handleAddTask}>
            <input
              type="text"
              placeholder="Task title"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              autoFocus
            />
            <textarea
              placeholder="Description (optional)"
              value={newTaskDescription}
              onChange={(e) => setNewTaskDescription(e.target.value)}
            />
            <div className="add-task-actions">
              <button type="submit" className="btn btn-primary">
                Add
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowAddTask(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : (
        <button
          className="add-task-btn"
          onClick={() => setShowAddTask(true)}
        >
          + Add Task
        </button>
      )}
    </div>
  );
};

export default List;
