# Local Heritage Trail Explorer

### A Role-Based Heritage Discovery and Storytelling Backend

## 1. Project Overview

**Local Heritage Trail Explorer** is a backend application designed to help visitors discover heritage places, explore curated trails, read historical stories, and interact with an AI-powered heritage chatbot.

The system supports different user roles, including Visitors, Curators, Guides, and Administrators. It uses role-based access control and an approval workflow to help maintain the quality and reliability of published heritage content.

The backend exposes REST APIs that can be tested independently using Postman and integrated with a frontend in the future.

## 2. Problem Statement

Information about local heritage sites is often scattered across different sources. Visitors may find it difficult to discover connected heritage locations, follow curated trails, and access historical information in one place.

Additionally, user-submitted historical content needs a review process before becoming publicly available.

This project addresses these challenges through a centralized heritage discovery API, curated trails, a story management workflow, and an AI-assisted conversational interface.

## 3. Project Objectives

- Provide APIs for discovering heritage places and trails.
- Make approved historical stories available to visitors.
- Support role-based content creation and administration.
- Require administrative review before publishing submitted content.
- Provide an AI-powered chatbot for heritage-related questions.
- Return relevant source citations when supported information is available.
- Restrict unauthorized actions using authentication and authorization middleware.

## 4. Technology Stack

| Technology         | Purpose                                            |
| ------------------ | -------------------------------------------------- |
| Node.js            | JavaScript runtime for the backend                 |
| Express.js         | REST API framework                                 |
| MongoDB Atlas      | Cloud database                                     |
| Mongoose           | MongoDB models and database operations             |
| Zod                | Request data validation                            |
| bcryptjs           | Password hashing                                   |
| Express sessions   | Session-based authentication                       |
| express-rate-limit | API request rate limiting                          |
| Ollama             | Local language model inference                     |
| LangChain          | AI application integration                         |
| nomic-embed-text   | Text embedding model for semantic-search workflows |
| Postman            | API testing                                        |
| Git and GitHub     | Version control and source-code hosting            |

**Architecture:** REST APIs → Express routes and middleware → Mongoose models → MongoDB Atlas. The chatbot route integrates with the locally running Ollama service.

## 5. System Architecture

```text
             API Client / Postman
                      |
                      v
              Express.js Server
                      |
           Authentication Middleware
                      |
          Role-Based Authorization
                      |
             API Route Handlers
          /       |       |       \
         v        v       v        v
      Places    Trails  Stories   Chat
         \        |       /        |
          \       |      /         v
             MongoDB Atlas       Ollama
```

The backend validates incoming requests, checks authentication and role permissions where required, performs database operations, and returns JSON responses.

## 6. User Roles and Permissions

### Visitor

- Register and log in.
- Discover publicly approved heritage places.
- Browse available heritage trails.
- Read approved public stories.
- Ask heritage-related questions through the chatbot.
- Cannot create or approve editorial content.

### Curator

- Create and submit heritage place information.
- Contribute content for administrative review.
- Cannot approve their own submissions unless separately authorized by the application's rules.

### Guide

- Submit historical stories and related heritage information.
- Associate stories with relevant heritage places.
- Cannot approve or publish their own submissions.

### Administrator

- Review submitted content.
- Approve or reject eligible submissions.
- Control which editorial content becomes publicly available.

**Authorization principle:** Registering through the public registration endpoint creates a Visitor account. Elevated roles must be assigned through a trusted administrative process, not through a user-controlled registration field.

## 7. Core Features

### Heritage Place Management

- Retrieve approved public places.
- Support place-based discovery.
- Allow authorized users to submit places for review.
- Restrict review operations to authorized administrators.

### Curated Heritage Trails

- Retrieve available trail information through a REST API.
- Organize heritage discovery around curated routes and locations.

### Historical Story Management

- Retrieve approved public stories.
- Associate stories with heritage places.
- Allow authorized Guides and Curators to submit stories.
- Keep new submissions pending until review.
- Publish approved content and keep rejected content out of public results.

### Authentication and Authorization

- Visitor registration and login.
- Password hashing with bcryptjs.
- Session-based authentication.
- Logout support.
- Role-based access checks.
- Rejection of unauthorized operations.

### AI Heritage Chatbot

- Accept heritage-related questions through the chat API.
- Use Ollama for local language-model inference.
- Retrieve relevant heritage information where supported by the configured implementation.
- Return citations for relevant sources when available.
- Use a safe fallback when a reliable answer cannot be established.

## 8. API Documentation

Base URL for local development:

`http://localhost:4000`

All request and response bodies use JSON where applicable.

| Method | Endpoint                  | Purpose                                       |
| ------ | ------------------------- | --------------------------------------------- |
| GET    | `/api/health`             | Check server health                           |
| POST   | `/api/auth/register`      | Register a Visitor                            |
| POST   | `/api/auth/login`         | Log in                                        |
| POST   | `/api/auth/logout`        | Log out                                       |
| GET    | `/api/auth/me`            | Retrieve the current session's user           |
| GET    | `/api/places`             | Retrieve approved public places               |
| GET    | `/api/trails`             | Retrieve public trails                        |
| GET    | `/api/stories`            | Retrieve approved public stories              |
| POST   | `/api/stories`            | Submit a story; requires an authorized role   |
| PATCH  | `/api/stories/:id/review` | Approve or reject a story; Administrator only |
| POST   | `/api/chat`               | Ask the heritage chatbot a question           |

Additional place-management endpoints are implemented in the places route. Consult the source code for their exact paths and request schemas.

### Example: Health Check

**Request**

```http
GET /api/health
```

**Expected result:** A successful response indicating that the backend is running.

### Example: Visitor Registration

**Request**

```http
POST /api/auth/register
Content-Type: application/json
```

```json
{
  "name": "Demo Visitor",
  "email": "visitor@example.com",
  "password": "ReplaceWithAStrongTestPassword"
}
```

Use the exact validation rules implemented in the authentication route when testing. Registration should assign the Visitor role automatically.

### Example: Story Submission

**Request**

```http
POST /api/stories
Content-Type: application/json
```

```json
{
  "title": "History of a Heritage Site",
  "body": "A detailed historical account with enough information to meet the story validation requirements.",
  "sourceTitle": "Example Historical Reference",
  "sourceUrl": "https://example.com/history"
}
```

This example demonstrates the request structure. Use a real, appropriate reference when submitting actual historical content. The `place` field may be supplied when associating the story with an existing place.

An authorized Guide or Curator should receive a successful creation response with the new story in `pending` status and `editorial` visibility.

### Example: Review a Story

**Request**

```http
PATCH /api/stories/STORY_ID/review
Content-Type: application/json
```

```json
{
  "status": "approved"
}
```

Replace `STORY_ID` with the actual story ID.

Only an Administrator should be allowed to perform this action. A Guide or Visitor attempting it should receive `403 Forbidden`.

## 9. Prerequisites

Install or prepare the following before running the project:

- Node.js and npm.
- A MongoDB Atlas account and database cluster.
- Ollama installed and running locally.
- The required Ollama models.
- Git, if cloning the repository.
- Postman or another HTTP API client.

## 10. Installation and Setup Guide

### Step 1: Open the project

Open a terminal in the project directory:

```powershell
cd "C:\Users\varan\OneDrive\Desktop\heritage-backend"
```

If you cloned the project from GitHub instead, navigate to the directory where you cloned it.

### Step 2: Install dependencies

```powershell
npm install
```

This installs the packages specified in `package.json`.

### Step 3: Configure environment variables

Create a `.env` file in the project root, alongside `server.js` and `package.json`.

Use the existing `.env.example` file as your template. Configure the required variables, including:

```dotenv
PORT=4000
MONGODB_URI=your_mongodb_atlas_connection_string
SESSION_SECRET=replace_with_a_long_random_secret_of_at_least_32_characters
```

Keep any additional variables required by the current project configuration, such as Ollama settings.

**Security requirements:**

- Never commit `.env` to Git.
- Never put database credentials or session secrets in source code.
- Use a strong, randomly generated session secret.
- Use a MongoDB database user with appropriately restricted permissions.
- Restrict Atlas network access to trusted addresses wherever possible.
- Use HTTPS and secure cookie settings in production.

### Step 4: Configure MongoDB Atlas

1. Create or select a MongoDB Atlas cluster.
2. Create a database user with the required permissions.
3. Configure network access for your development environment.
4. Copy the connection string from Atlas.
5. Put the connection string in `MONGODB_URI` in your local `.env` file.
6. Confirm that the database name and connection options are correct.

Do not share your actual connection string in screenshots, public repositories, or project documentation.

### Step 5: Start Ollama

Ensure Ollama is installed and running.

Check the installed models:

```powershell
ollama list
```

The project has used these models during development:

```powershell
ollama pull gemma3:1b
ollama pull nomic-embed-text
```

Start or keep the Ollama service running before testing chatbot functionality. The application must be configured to reach the Ollama service at the correct local address.

The embedding model is relevant only to workflows that actually invoke embeddings; installing it alone does not mean a vector-search pipeline is fully configured.

### Step 6: Start the backend

For development:

```powershell
npm run dev
```

For normal startup:

```powershell
npm start
```

These commands use the project's configured npm scripts. Keep the terminal open while testing the local server.

### Step 7: Verify the server

Open Postman and send:

```http
GET http://localhost:4000/api/health
```

A successful response confirms that the health endpoint is reachable. Also check the terminal for database connection errors or application startup failures.

## 11. Testing with Postman

Use the following checklist to verify the main workflows.

- [ ] Health endpoint returns a successful response.
- [ ] Visitor registration works.
- [ ] Duplicate registration is rejected appropriately.
- [ ] Login succeeds with valid credentials.
- [ ] Login fails with invalid credentials.
- [ ] The current-user endpoint recognizes the authenticated session.
- [ ] Logout works.
- [ ] Public places return only approved content.
- [ ] Public trails endpoint responds successfully.
- [ ] Public stories return only approved, public stories.
- [ ] A Guide can submit a story.
- [ ] A newly submitted story remains pending.
- [ ] A Guide cannot approve a story.
- [ ] An Administrator can review eligible submissions.
- [ ] The chatbot responds to a known heritage question.
- [ ] The chatbot uses a safe fallback for unsupported or fictional places.

For session-based authentication, preserve the `heritage_session` cookie between requests that require the logged-in user. Use separate Postman sessions or clear cookies when testing different roles.

Expected authorization behavior includes `403 Forbidden` for authenticated users who lack permission. An unauthenticated request to a protected route may instead return `401 Unauthorized`.

Check the actual HTTP status code and response body together. For example, story creation is expected to use `201 Created`; an unexpected code should be investigated even if the response body contains a pending story.

## 12. Project Structure

```text
heritage-backend/
├── server.js
├── package.json
├── package-lock.json
├── .env
├── .env.example
├── README.md
├── scripts/
│   ├── seed.js
│   └── seedWonders.js
└── src/
    ├── models/
    ├── routes/
    └── middleware/
```

This is a simplified overview. The exact contents of `src/` may include additional route files, models, utilities, and middleware.

- `server.js`: Application startup and server configuration.
- `src/models/`: Mongoose data models.
- `src/routes/`: API endpoints and request handling.
- `src/middleware/`: Shared request-processing and authorization logic.
- `scripts/`: Database seeding and development utilities.
- `.env`: Local secrets and configuration; never commit it.
- `.env.example`: Safe template for required configuration.
- `README.md`: Project description and setup instructions.

## 13. Security and Data Integrity

The backend incorporates several important security practices:

- Passwords are hashed instead of stored as plaintext.
- Elevated permissions are checked by server-side middleware.
- Request payloads are validated before processing.
- Editorial submissions follow an approval workflow.
- Public endpoints filter content by publication status and visibility.
- Rate limiting helps reduce excessive API requests.
- Environment variables separate sensitive configuration from application code.

Further production hardening should include secure session-cookie configuration, session expiration and store management, appropriate CORS restrictions, HTTPS, logging and monitoring, and a review of authorization checks across every protected endpoint.

## 14. Current Scope and Limitations

The project focuses on the backend APIs, role permissions, editorial review, heritage discovery, and AI-assisted question answering.

Features such as a complete frontend, automated email verification, password-reset emails, and a fully deployed production vector-search pipeline should not be considered implemented unless they are present and tested in the current codebase.

AI-generated responses may be incomplete or inaccurate. Citations and source data should be reviewed before relying on answers for academic or historical publication.

## 15. Future Enhancements

- Add a visitor-facing web interface.
- Expand curator and guide content-management tools.
- Add richer trail filtering and search.
- Implement a verified semantic-search and retrieval pipeline.
- Improve source attribution and historical fact verification.
- Add automated integration tests and API documentation generation.
- Add monitoring, audit logs, and production deployment automation.

## 16. Conclusion

Local Heritage Trail Explorer demonstrates how a Node.js and Express backend can combine REST APIs, MongoDB persistence, role-based authorization, editorial approval workflows, and local AI integration in a heritage-discovery application.

The project emphasizes controlled content publication and API-level separation of responsibilities while providing a foundation for future heritage exploration features.

---

**Project:** Local Heritage Trail Explorer
**Backend:** Node.js, Express.js, MongoDB Atlas
**AI integration:** Ollama
**API testing:** Postman
**Status:** Development prototype
