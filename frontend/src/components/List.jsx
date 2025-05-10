import { useState } from 'react';
import { Droppable } from 'react-beautiful-dnd';
import Task from './Task';
import { updateList, deleteList } from '../services/api';

const List = ({ list, tasks, onAddTask, onDeleteList, onTasksChange }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(list.title);
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');

  const handleTitleChange = async () => {
    if (title.trim() === '') return;
    
    try {
      await updateList(list._id, { title });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating list title:', error);
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
    <div className="list">
      <div className="list-header">
        {isEditing ? (
          <div className="list-title-edit">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleTitleChange}
              onKeyPress={(e) => e.key === 'Enter' && handleTitleChange()}
              autoFocus
            />
          </div>
        ) : (
          <h3 className="list-title" onClick={() => setIsEditing(true)}>
            {list.title}
          </h3>
        )}
        <button className="delete-list-btn" onClick={handleDeleteList}>
          &times;
        </button>
      </div>
      
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
