# GEMINI.md

## Project Overview

This project is a web-based journaling application that provides AI-powered insights into your entries. It features a modern, responsive user interface and a robust backend to handle data storage, user authentication, and AI analysis.

**Frontend:**

*   **Framework:** React with Vite
*   **UI:** Tailwind CSS, Radix UI
*   **State Management:** Zustand
*   **Routing:** React Router
*   **HTTP Client:** Axios

**Backend:**

*   **Framework:** Express.js
*   **Database:** MongoDB with Mongoose
*   **Authentication:** Supabase
*   **AI Features:** Sentiment analysis using `vader-sentiment`
*   **Messaging:** Kafka (for asynchronous processing of AI tasks)

## Building and Running

### Frontend

To run the frontend, navigate to the `frontend` directory and run the following commands:

```bash
npm install
npm run dev
```

This will start the development server on `http://localhost:5173`.

To build the frontend for production, run:

```bash
npm run build
```

### Backend

To run the backend, navigate to the `backend` directory and run the following commands:

```bash
npm install
npm run dev
```

This will start the development server on the port specified in your `.env` file.

To run the backend in production, use:

```bash
npm run start
```

## Development Conventions

*   **Modular Architecture:** The code is organized into modules with a clear separation of concerns. The backend follows a typical MVC-like pattern (Models, Controllers, Routes), and the frontend is built with reusable React components.
*   **ES Modules:** The project uses ES modules (`import`/`export`) for both frontend and backend code.
*   **Authentication:** User authentication is handled via Supabase, with JWTs stored in cookies to maintain session state. A `validateToken` middleware protects sensitive backend routes.
*   **AI Insights:** After a new journal entry is created, an asynchronous process is triggered to analyze the sentiment of the entry. The results are stored in a separate `AiInsights` collection in the database.
*   **State Management:** The frontend uses Zustand for a centralized and straightforward state management solution.
*   **Styling:** The UI is built with Tailwind CSS for a utility-first approach to styling, along with Radix UI for accessible and unstyled components.
