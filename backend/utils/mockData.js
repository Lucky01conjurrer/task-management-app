// Mock data for development when MongoDB is not available
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');

// In-memory storage
const users = [];
const lists = [];
const tasks = [];

// Helper to find user by email
const findUserByEmail = (email) => {
  return users.find(user => user.email === email);
};

// Helper to find user by ID
const findUserById = (id) => {
  return users.find(user => user._id === id);
};

// Helper to find list by ID
const findListById = (id) => {
  return lists.find(list => list._id === id);
};

// Helper to find task by ID
const findTaskById = (id) => {
  return tasks.find(task => task._id === id);
};

// User methods
const createUser = async (userData) => {
  const { name, email, password } = userData;
  
  // Check if user already exists
  if (findUserByEmail(email)) {
    throw new Error('User already exists');
  }
  
  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  
  // Create new user
  const newUser = {
    _id: uuidv4(),
    name,
    email,
    password: hashedPassword,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  users.push(newUser);
  return newUser;
};

const comparePassword = async (user, candidatePassword) => {
  return await bcrypt.compare(candidatePassword, user.password);
};

// List methods
const getLists = (userId) => {
  return lists.filter(list => list.user === userId).sort((a, b) => a.position - b.position);
};

const createList = (listData) => {
  const { title, position, user } = listData;
  
  // Find the highest position if not provided
  let listPosition = position;
  if (listPosition === undefined) {
    const userLists = getLists(user);
    const lastList = userLists.length > 0 ? userLists[userLists.length - 1] : null;
    listPosition = lastList ? lastList.position + 1 : 0;
  }
  
  // Create new list
  const newList = {
    _id: uuidv4(),
    title,
    position: listPosition,
    user,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  lists.push(newList);
  return newList;
};

const updateList = (id, listData) => {
  const list = findListById(id);
  if (!list) {
    throw new Error('List not found');
  }
  
  const { title, position } = listData;
  
  if (title !== undefined) {
    list.title = title;
  }
  
  if (position !== undefined) {
    list.position = position;
  }
  
  list.updatedAt = new Date();
  return list;
};

const deleteList = (id) => {
  const listIndex = lists.findIndex(list => list._id === id);
  if (listIndex === -1) {
    throw new Error('List not found');
  }
  
  // Delete all tasks in the list
  const listTasks = tasks.filter(task => task.list === id);
  listTasks.forEach(task => {
    const taskIndex = tasks.findIndex(t => t._id === task._id);
    if (taskIndex !== -1) {
      tasks.splice(taskIndex, 1);
    }
  });
  
  // Delete the list
  lists.splice(listIndex, 1);
  return { message: 'List removed' };
};

// Task methods
const getTasksByList = (listId) => {
  return tasks.filter(task => task.list === listId).sort((a, b) => a.position - b.position);
};

const createTask = (taskData) => {
  const { title, description, list, position, createdBy } = taskData;
  
  // Find the highest position if not provided
  let taskPosition = position;
  if (taskPosition === undefined) {
    const listTasks = getTasksByList(list);
    const lastTask = listTasks.length > 0 ? listTasks[listTasks.length - 1] : null;
    taskPosition = lastTask ? lastTask.position + 1 : 0;
  }
  
  // Create new task
  const newTask = {
    _id: uuidv4(),
    title,
    description,
    list,
    position: taskPosition,
    createdBy,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  tasks.push(newTask);
  return newTask;
};

const updateTask = (id, taskData) => {
  const task = findTaskById(id);
  if (!task) {
    throw new Error('Task not found');
  }
  
  const { title, description, position } = taskData;
  
  if (title !== undefined) {
    task.title = title;
  }
  
  if (description !== undefined) {
    task.description = description;
  }
  
  if (position !== undefined) {
    task.position = position;
  }
  
  task.updatedAt = new Date();
  return task;
};

const deleteTask = (id) => {
  const taskIndex = tasks.findIndex(task => task._id === id);
  if (taskIndex === -1) {
    throw new Error('Task not found');
  }
  
  tasks.splice(taskIndex, 1);
  return { message: 'Task removed' };
};

const moveTask = (id, moveData) => {
  const task = findTaskById(id);
  if (!task) {
    throw new Error('Task not found');
  }
  
  const { destinationListId, position } = moveData;
  
  if (destinationListId) {
    const destinationList = findListById(destinationListId);
    if (!destinationList) {
      throw new Error('Destination list not found');
    }
    
    task.list = destinationListId;
  }
  
  if (position !== undefined) {
    task.position = position;
  }
  
  task.updatedAt = new Date();
  return task;
};

module.exports = {
  // User methods
  findUserByEmail,
  findUserById,
  createUser,
  comparePassword,
  
  // List methods
  getLists,
  createList,
  updateList,
  deleteList,
  
  // Task methods
  getTasksByList,
  createTask,
  updateTask,
  deleteTask,
  moveTask
};
