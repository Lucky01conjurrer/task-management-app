import { useState, useEffect } from 'react';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import List from '../components/List';
import {
  getLists,
  createList,
  updateList,
  getTasksByList,
  createTask,
  moveTask
} from '../services/api';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
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

  const handleUpdateList = async (listId, updatedData) => {
    try {
      const updatedList = await updateList(listId, updatedData);

      // Update the lists state with the updated list
      setLists(lists.map(list =>
        list._id === listId ? { ...list, ...updatedData } : list
      ));

      return updatedList;
    } catch (error) {
      console.error('Error updating list:', error);
      throw error;
    }
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
    const { destination, source, draggableId, type } = result;

    // If dropped outside a droppable area
    if (!destination) return;

    // If dropped in the same position
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // Handle list reordering
    if (type === 'LIST') {
      const newListOrder = Array.from(lists);
      const [movedList] = newListOrder.splice(source.index, 1);
      newListOrder.splice(destination.index, 0, movedList);

      // Update positions based on new order
      const updatedLists = newListOrder.map((list, index) => ({
        ...list,
        position: index
      }));

      // Update state optimistically
      setLists(updatedLists);

      // Update in the backend
      try {
        await handleUpdateList(movedList._id, { position: destination.index });
      } catch (error) {
        console.error('Error moving list:', error);
        // Revert to previous state on error
        setLists(lists);
      }

      return;
    }

    // Handle task movement
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
          <div className="user-actions">
            <button
              onClick={() => navigate('/profile')}
              className="profile-btn"
            >
              Profile
            </button>
            <button onClick={logout} className="logout-btn">
              Logout
            </button>
          </div>
        </div>
      </header>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="all-lists" direction="horizontal" type="LIST">
          {(provided) => (
            <div
              className="board"
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              {lists.map((list, index) => (
                <List
                  key={list._id}
                  list={list}
                  index={index}
                  tasks={tasks[list._id] || []}
                  onAddTask={handleAddTask}
                  onUpdateList={handleUpdateList}
                  onDeleteList={handleDeleteList}
                  onTasksChange={handleTasksChange}
                />
              ))}
              {provided.placeholder}

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
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

export default Dashboard;
