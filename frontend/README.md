# AI Journaling - Frontend

This is the React-based frontend for the AI Journaling application. It provides a modern, responsive user interface for users to create, manage, and analyze their journal entries.

## 🚀 Features

- **📝 Rich Text Editor:** A powerful and intuitive editor for writing journal entries.
- **📊 Interactive Dashboards:** Visualize sentiment trends, emotional patterns, and key themes from your journal entries.
- **🎯 Goal Tracking:** Set and manage personal goals.
- **📅 Calendar View:** Easily navigate and find past journal entries.
- **🔐 Secure Authentication:** User authentication and session management using Supabase.
- ** responsive Design:** A clean and modern UI that works on all screen sizes.

## 🛠️ Tech Stack

- **Framework:** React with Vite
- **Language:** TypeScript
- **Styling:** Tailwind CSS, Radix UI
- **State Management:** Zustand
- **Routing:** React Router
- **HTTP Client:** Axios
- **Charts:** Recharts

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

1. Navigate to the `frontend` directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the `frontend` directory and add the following environment variables:
```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
VITE_SUPABASE_URL=<your-supabase-url>
VITE_SUPABASE_ANON_KEY=<your-supabase-anon-key>
```

4. Start the development server:
```bash
npm run dev
```

5. Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/       # Reusable React components
│   │   ├── ui/           # Radix UI components
│   │   └── charts/       # Chart components
│   ├── lib/              # Utility functions and API client
│   ├── pages/            # Page components for different routes
│   ├── stores/           # Zustand state stores
│   ├── types/            # TypeScript type definitions
│   ├── styles/           # Global and component-specific styles
│   ├── App.tsx           # Main application component
│   ├── main.tsx          # Entry point
│   └── index.css         # Global styles
├── public/               # Static assets
├── package.json          # Dependencies
└── README.md             # This file
```