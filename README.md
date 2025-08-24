# AI Journaling App

This is a web-based journaling application that provides AI-powered insights into your entries. It features a modern, responsive user interface and a robust backend to handle data storage, user authentication, and AI analysis.

## Features

*   **User Authentication:** Secure user authentication using Supabase.
*   **Journaling:** Create, read, update, and delete journal entries.
*   **AI Insights:** Get sentiment analysis of your journal entries.
*   **Goal Tracking:** Set and track your goals.
*   **Journal Templates:** Use templates to get started with your journal entries.
*   **Trends:** Visualize your sentiment trends over time.

## Tech Stack

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

## Getting Started

### Prerequisites

*   Node.js
*   npm
*   MongoDB
*   Supabase Account

### Installation

1.  Clone the repository:

    ```bash
    git clone https://github.com/your-username/ai-journaling.git
    ```

2.  Install dependencies:

    ```bash
    npm install
    ```

3.  Create a `.env` file in the `backend` directory and add the following environment variables:

    ```
    PORT=your-port
    MONGO_URI=your-mongo-uri
    SUPABASE_URL=your-supabase-url
    SUPABASE_KEY=your-supabase-key
    ```

## Usage

### Development

To run the frontend and backend development servers concurrently, run the following commands in separate terminals:

```bash
npm run frontend-dev
```

```bash
npm run backend-dev
```

### Production

To build and run the application in production, run the following command:

```bash
npm start
```

This will build the frontend, and then start the backend server, which will also serve the frontend.

## Contributing

Contributions are welcome! Please feel free to submit a pull request.

## License

This project is licensed under the MIT License.
