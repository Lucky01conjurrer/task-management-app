import { useState, useEffect } from 'react';
import { DragDropContext } from 'react-beautiful-dnd';
import { useAuth } from '../context/AuthContext';
import List from '../components/List';
import {
  getLists,
  createList,
  getTasksByList,
  createTask,
  moveTask
} from '../services/api';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [lists, setLists] = useState([]);
  const [tasks, setTasks] = useState({});
  const [newListTitle, setNewListTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch lists and tasks
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const listsData = await getLists();
        setLists(listsData);

        // Fetch tasks for each list
        const tasksData = {};
        for (const list of listsData) {
          const listTasks = await getTasksByList(list._id);
          tasksData[list._id] = listTasks;
        }
        setTasks(tasksData);
      } catch (err) {
        setError('Failed to load data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAddList = async (e) => {
    e.preventDefault();
    
    if (newListTitle.trim() === '') return;
    
    try {
      const newList = await createList({ title: newListTitle });
      setLists([...lists, newList]);
      setTasks({ ...tasks, [newList._id]: [] });
      setNewListTitle('');
    } catch (error) {
      console.error('Error adding list:', error);
    }
  };

  const handleDeleteList = (listId) => {
    setLists(lists.filter(list => list._id !== listId));
    const newTasks = { ...tasks };
    delete newTasks[listId];
    setTasks(newTasks);
  };

  const handleAddTask = async (listId, taskData) => {
    try {
      const newTask = await createTask(listId, taskData);
      setTasks({
        ...tasks,
        [listId]: [...tasks[listId], newTask]
      });
      return newTask;
    } catch (error) {
      console.error('Error adding task:', error);
      throw error;
    }
  };

  const handleTasksChange = (updatedTask, deletedTaskId) => {
    if (deletedTaskId) {
      // Handle task deletion
      const newTasks = { ...tasks };
      Object.keys(newTasks).forEach(listId => {
        newTasks[listId] = newTasks[listId].filter(task => task._id !== deletedTaskId);
      });
      setTasks(newTasks);
    } else if (updatedTask) {
      // Handle task update
      const newTasks = { ...tasks };
      Object.keys(newTasks).forEach(listId => {
        const taskIndex = newTasks[listId].findIndex(task => task._id === updatedTask._id);
        if (taskIndex !== -1) {
          newTasks[listId][taskIndex] = updatedTask;
        }
      });
      setTasks(newTasks);
    }
  };

  const handleDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

    // If dropped outside a droppable area
    if (!destination) return;

    // If dropped in the same position
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // Get the task that was moved
    const task = tasks[source.droppableId].find(task => task._id === draggableId);

    // Create new tasks state
    const newTasks = { ...tasks };
    
    // Remove task from source list
    newTasks[source.droppableId] = newTasks[source.droppableId].filter(
      task => task._id !== draggableId
    );
    
    // Add task to destination list
    const updatedTask = { ...task, list: destination.droppableId };
    newTasks[destination.droppableId] = [
      ...newTasks[destination.droppableId].slice(0, destination.index),
      updatedTask,
      ...newTasks[destination.droppableId].slice(destination.index)
    ];
    
    // Update state optimistically
    setTasks(newTasks);
    
    // Update in the backend
    try {
      await moveTask(draggableId, {
        destinationListId: destination.droppableId,
        position: destination.index
      });
    } catch (error) {
      console.error('Error moving task:', error);
      // Revert to previous state on error
      setTasks(tasks);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Task Management</h1>
        <div className="user-info">
          <span>Welcome, {user.name}</span>
          <button onClick={logout} className="logout-btn">
            Logout
          </button>
        </div>
      </header>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="board">
          {lists.map(list => (
            <List
              key={list._id}
              list={list}
              tasks={tasks[list._id] || []}
              onAddTask={handleAddTask}
              onDeleteList={handleDeleteList}
              onTasksChange={handleTasksChange}
            />
          ))}

          <div className="add-list">
            <form onSubmit={handleAddList}>
              <input
                type="text"
                placeholder="Add a new list"
                value={newListTitle}
                onChange={(e) => setNewListTitle(e.target.value)}
              />
              <button type="submit" className="btn btn-primary">
                Add List
              </button>
            </form>
          </div>
        </div>
      </DragDropContext>
    </div>
  );
};

export default Dashboard;
