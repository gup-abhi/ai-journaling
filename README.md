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
*   **Messaging:** Kafka (for asynchronous processing of AI tasks)

## Getting Started

### Prerequisites

*   Node.js
*   npm
*   MongoDB
*   Supabase Account
*   Kafka

### Installation

1.  Clone the repository:

    ```bash
    git clone https://github.com/your-username/ai-journaling.git
    ```

2.  Install frontend dependencies:

    ```bash
    cd frontend
    npm install
    ```

3.  Install backend dependencies:

    ```bash
    cd ../backend
    npm install
    ```

4.  Create a `.env` file in the `backend` directory and add the following environment variables:

    ```
    PORT=your-port
    MONGO_URI=your-mongo-uri
    SUPABASE_URL=your-supabase-url
    SUPABASE_KEY=your-supabase-key
    KAFKA_BROKERS=your-kafka-brokers
    ```

## Usage

### Frontend

To run the frontend, navigate to the `frontend` directory and run the following command:

```bash
npm run dev
```

This will start the development server on `http://localhost:5173`.

To build the frontend for production, run:

```bash
npm run build
```

### Backend

To run the backend, navigate to the `backend` directory and run the following command:

```bash
npm run dev
```

This will start the development server on the port specified in your `.env` file.

To run the backend in production, use:

```bash
npm run start
```

## Contributing

Contributions are welcome! Please feel free to submit a pull request.

## License

This project is licensed under the MIT License.
