# Basic Authentication System

This repository contains a basic authentication system built with Node.js, designed to handle user registration, login, password management, and secure post creation and retrieval.

## Key Features & Benefits

*   **User Authentication:** Securely register and authenticate users with email verification.
*   **Password Management:** Features include password reset functionality.
*   **JWT-Based Security:** Uses JSON Web Tokens (JWT) for secure session management and authorization.
*   **Middleware Validation:** Implements middleware for validating user inputs and authenticating requests.
*   **Post Management:** Allows authenticated users to create, read, update, and delete posts.

## What is JWT?

JSON Web Tokens (JWT) are an open standard for securely transmitting information between parties. In this project, JWTs are used to:

* Maintain user sessions
* Verify user authentication state
* Pass user information securely between requests

JWT Structure:

* **Header** - Algorithm & token type
* **Payload** - User data & claims
* **Signature** - Ensures data integrity

## Installation & Setup Instructions

Follow these steps to set up the project locally:

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/Sayan0361/basic-auth.git
    cd basic-auth
    ```

2.  **Install dependencies:**

    Using npm:

    ```bash
    npm install
    ```

    Or using yarn:

    ```bash
    yarn install
    ```

3.  **Configure Environment Variables:**

    Create a `.env` file in the root directory of the project and add the following environment variables:

    ```env
    PORT=8000
    MONGO_URI=your_mongodb_connection_string
    TOKEN_SECRET=your_jwt_secret_key
    NODE_CODE_SENDING_EMAIL_ADDRESS=your_email@gmail.com
    NODE_CODE_SENDING_EMAIL_PASSWORD=your_email_app_password
    HMAC_VERIFICATION_CODE_SECRET=your_verification_code_secret
    ```

    *   `PORT`: The port on which the server will run (default: 8000)
    *   `MONGO_URI`: The connection string for your MongoDB database
    *   `TOKEN_SECRET`: A secret key used to sign and verify JWT tokens. Keep this secret
    *   `NODE_CODE_SENDING_EMAIL_ADDRESS`: Your email address used for sending verification emails
    *   `NODE_CODE_SENDING_EMAIL_PASSWORD`: Your email app password for sending emails
    *   `HMAC_VERIFICATION_CODE_SECRET`: Secret key for hashing verification codes

4.  **Start the server:**

    ```bash
    npm start
    ```

    Or using yarn:

    ```bash
    yarn start
    ```

    The server should now be running on `http://localhost:8000`.

## API Documentation

### Authentication Endpoints

#### **`POST /auth/signup`**
Register a new user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Signup successful",
  "result": {
    "email": "user@example.com",
    "_id": "user_id",
    "verified": false
  }
}
```

---

#### **`POST /auth/signin`**
Sign in an existing user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Signed-in successfully",
  "token": "jwt_token_here"
}
```

**Note:** The JWT token is also set as an HTTP-only cookie named "Authorization".

---

#### **`POST /auth/signout`**
Sign out the current user. Requires authentication.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

#### **`PATCH /auth/send-verification-code`**
Send email verification code. Requires authentication.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Verification code has been sent to your email"
}
```

---

#### **`PATCH /auth/verify-verification-code`**
Verify the email verification code. Requires authentication.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "providedCode": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Your account has been verified"
}
```

---

#### **`PATCH /auth/change-password`**
Change user password. Requires authentication and verified account.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "oldPassword": "currentPassword",
  "newPassword": "newSecurePassword"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password updated"
}
```

---

#### **`PATCH /auth/send-forgot-password-code`**
Send forgot password verification code.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Forgot password code has been sent to your email"
}
```

---

#### **`PATCH /auth/verify-forgot-password-code`**
Verify forgot password code and reset password.

**Request Body:**
```json
{
  "email": "user@example.com",
  "providedCode": "123456",
  "newPassword": "newSecurePassword"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Your forgot password code has been verified & your password has also been changed"
}
```

### Posts Endpoints

#### **`GET /posts/all-posts`**
Retrieve all posts with pagination.

**Query Parameters:**
- `page` (optional): Page number for pagination (default: 1)

**Example:**
```bash
GET /posts/all-posts?page=1
```

**Response:**
```json
{
  "success": true,
  "message": "Posts",
  "data": [
    {
      "_id": "post_id",
      "title": "Post Title",
      "description": "Post content...",
      "userId": {
        "email": "author@example.com"
      },
      "createdAt": "2023-01-01T00:00:00.000Z"
    }
  ]
}
```

---

#### **`GET /posts/single-post`**
Retrieve a single post by ID.

**Query Parameters:**
- `_id`: The ID of the post to retrieve

**Example:**
```bash
GET /posts/single-post?_id=507f1f77bcf86cd799439011
```

**Response:**
```json
{
  "success": true,
  "message": "Single Post",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Post Title",
    "description": "Post content...",
    "userId": {
      "email": "author@example.com"
    },
    "createdAt": "2023-01-01T00:00:00.000Z"
  }
}
```

---

#### **`POST /posts/create-post`**
Create a new post. Requires authentication.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "title": "My New Post",
  "description": "This is the content of my new post..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Your post has been created",
  "data": {
    "_id": "post_id",
    "title": "My New Post",
    "description": "This is the content of my new post...",
    "userId": "user_id",
    "createdAt": "2023-01-01T00:00:00.000Z"
  }
}
```

---

#### **`PUT /posts/update-post`**
Update an existing post. Requires authentication and post ownership.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- `_id`: The ID of the post to update

**Request Body:**
```json
{
  "title": "Updated Post Title",
  "description": "Updated post content..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Your post has been updated",
  "data": {
    "_id": "post_id",
    "title": "Updated Post Title",
    "description": "Updated post content...",
    "userId": "user_id",
    "createdAt": "2023-01-01T00:00:00.000Z"
  }
}
```

---

#### **`DELETE /posts/delete-post`**
Delete a post. Requires authentication and post ownership.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- `_id`: The ID of the post to delete

**Response:**
```json
{
  "success": true,
  "message": "Your post has been deleted",
  "deletedPost": {
    "_id": "post_id",
    "title": "Post Title",
    "description": "Post content...",
    "userId": "user_id"
  }
}
```

## Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

The token is automatically set as an HTTP-only cookie after successful signin and contains the following payload:
```json
{
  "userId": "user_id",
  "email": "user@example.com",
  "verified": true/false
}
```

## Error Responses

All endpoints follow a consistent error response format:

```json
{
  "success": false,
  "message": "Error description"
}
```

Common HTTP status codes:
- `200`: Success
- `201`: Created (for new resources)
- `400`: Bad Request (validation errors)
- `401`: Unauthorized (authentication required/invalid)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found
- `500`: Internal Server Error

## Getting Your Environment Variables

### MongoDB Connection String
1. Create a MongoDB Atlas account or use a local MongoDB instance
2. Get your connection string from MongoDB Atlas dashboard or use `mongodb://localhost:27017/basicAuth` for local development

### Email Configuration
1. Use a Gmail account and enable 2-factor authentication
2. Generate an app password for your application
3. Use the app password in `NODE_CODE_SENDING_EMAIL_PASSWORD`

### Secret Keys
Generate strong random strings for:
- `TOKEN_SECRET` (min 32 characters)
- `HMAC_VERIFICATION_CODE_SECRET` (min 32 characters)


## Code Verification Features
- Verification codes expire after 5 minutes
- Codes are hashed using HMAC for security
- Email verification is required for certain operations
- Password strength validation is enforced