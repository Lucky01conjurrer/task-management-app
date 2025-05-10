# Task Management Application (MERN Stack)

A simplified task management application built with the MERN stack (MongoDB, Express, React, Node.js).

## Features

### User Authentication
- User registration with email and password
- User login with JWT-based authentication
- Logout functionality

### List Management
- Create new lists with titles (e.g., "To Do", "In Progress", "Done")
- Edit list titles
- Delete lists

### Task Management
- Create tasks with title and optional description
- Move tasks between lists (drag and drop)
- Edit task details
- Delete tasks

## Technology Stack

### Frontend
- React.js for UI components
- React Router for navigation
- Axios for API requests
- React Beautiful DND for drag-and-drop functionality

### Backend
- Node.js runtime environment
- Express.js for API framework
- MongoDB for database
- Mongoose for object modeling
- JSON Web Tokens for authentication
- Bcrypt for password hashing

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas account)

### Installation

1. Clone the repository
```
git clone <repository-url>
cd task-management-app
```

2. Install backend dependencies
```
cd backend
npm install
```

3. Set up environment variables
Create a `.env` file in the backend directory with the following variables:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/trello-clone
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=30d
```

4. Install frontend dependencies
```
cd ../frontend
npm install
```

### Running the Application

1. Start the backend server
```
cd backend
npm run dev
```

2. Start the frontend development server
```
cd frontend
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

## API Endpoints

### Authentication API
- POST /api/auth/register - Register a new user
- POST /api/auth/login - Login user
- POST /api/auth/logout - Logout user

### List API
- GET /api/lists - Get all lists
- POST /api/lists - Create a new list
- PUT /api/lists/:id - Update a list
- DELETE /api/lists/:id - Delete a list

### Task API
- GET /api/lists/:id/tasks - Get all tasks for a list
- POST /api/lists/:id/tasks - Create a new task in a list
- PUT /api/tasks/:id - Update a task
- DELETE /api/tasks/:id - Delete a task
- PUT /api/tasks/:id/move - Move a task to a different list

## Data Models

### User Model
```
{
  _id: ObjectId,
  email: String (required, unique),
  password: String (hashed, required),
  name: String (required),
  createdAt: Date,
  updatedAt: Date
}
```

### List Model
```
{
  _id: ObjectId,
  title: String (required),
  position: Number,
  user: ObjectId (ref: User),
  createdAt: Date,
  updatedAt: Date
}
```

### Task Model
```
{
  _id: ObjectId,
  title: String (required),
  description: String,
  list: ObjectId (ref: List),
  position: Number,
  createdBy: ObjectId (ref: User),
  createdAt: Date,
  updatedAt: Date
}
```
