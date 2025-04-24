# Swift Assignment - Backend API

## Description

This is a backend API built using **Node.js** and **TypeScript**, designed to manage user data, including posts and comments, with data persisted in **MongoDB**. The application fetches initial data from the [JSONPlaceholder API](https://jsonplaceholder.typicode.com) and stores it locally.

---

## Features

- **Data Loading:** Fetches users, posts, and comments from JSONPlaceholder and stores them in MongoDB.
- **User Management:**
  - Retrieve a user along with their posts and comments.
  - Delete a user and their associated posts and comments.
  - Delete all users, posts, and comments.
  - Create a new user.
- **MongoDB Integration:** All data is persisted in a MongoDB database.

---

## Tech Stack

- **Node.js:** JavaScript runtime environment.
- **TypeScript:** Enables type safety and improves code maintainability.
- **MongoDB:** NoSQL database used for storing data.
- **MongoDB Atlas:** Cloud-hosted MongoDB service.
- **dotenv:** Manages environment variables.
- **http:** Used for server creation and external API requests.
- **Render:** Deployment platform.
- **Postman:** Used for API testing and development.

---

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- A `.env` file at the root of the project containing:

  ```env
  MONGO_URI=<your_mongodb_connection_string>
  DB_NAME=<your_database_name>  # e.g., swift_assignment
  PORT=<server_port>            # e.g., 4000
  JSON_PLACEHOLDER_URL=https://jsonplaceholder.typicode.com
  ```

---

## Installation

1. Clone the repository:

   ```bash
   git clone <repository_url>
   cd <repository_name>
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with your MongoDB connection string, database name, and server port.

---

## Running the Application

1. Start your MongoDB server or ensure your MongoDB Atlas cluster is active.
2. Start the application:

   ```bash
   npm start
   ```

3. Upon successful startup, you’ll see logs such as:

   ```
   Server is running on port <PORT>
   Connected successfully to MongoDB
   ```

---

## Deployment

The application is deployed on **Render** and can be accessed at:

🔗 [https://swift-kfxg.onrender.com](https://swift-kfxg.onrender.com)

---

## API Endpoints

### `GET /load` - https://swift-kfxg.onrender.com/load to get the result

- Loads users, posts, and comments from JSONPlaceholder into MongoDB.
- Returns `{}` on success.
- ⚠️ **Note:** Running this multiple times will duplicate the data.

### `DELETE /users` - https://swift-kfxg.onrender.com/users and delete method to delete

- Deletes all users, posts, and comments from the database.
- Returns **204 No Content** on success.

### `DELETE /users/:userId` -for example - https://swift-kfxg.onrender.com/users/1 and delete method to delete

- Deletes a specific user and their related posts and comments.
- **Returns:**
  - 204 No Content (success)
  - 400 Bad Request (missing ID)
  - 404 Not Found (user not found)

### `GET /users/:userId` -for example - https://swift-kfxg.onrender.com/users/1 and get method to get the all details of the user 1

- Retrieves a user with their posts and comments.
- **Returns:**
  - JSON object with user data (success)
  - 400 Bad Request (missing ID)
  - 404 Not Found (user not found)

### `PUT /users` - -for example - https://swift-kfxg.onrender.com/users and put method to create a new user

- Creates a new user. Expects a JSON payload.
- **Returns:**
  - 201 Created with a `Link` header to the new user (success)
  - 400 Bad Request (invalid JSON)
  - 409 Conflict (duplicate user)

---

## Important Considerations

- **Error Handling:** Proper error responses with relevant HTTP status codes.
- **Data Integrity:** Deleting a user also removes related posts and comments.
- **Rate Limits:** Be aware of [JSONPlaceholder usage terms](https://jsonplaceholder.typicode.com).
- **Development Tools:** Postman was used to verify endpoints.
