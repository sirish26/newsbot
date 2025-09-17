# Chatbot Project

This project consists of a backend API and a frontend web application that together form a chatbot.

## Tech Stack

### Backend
- **Node.js**: JavaScript runtime environment.
- **Express.js**: Web application framework for Node.js.
- **Google Generative AI**: For AI capabilities.
- **Qdrant**: Vector database for similarity search.
- **Upstash**: For serverless data infrastructure.
- **Jina AI**: For multimodal AI and embeddings.

### Frontend (Newsbot)
- **React**: JavaScript library for building user interfaces.
- **TypeScript**: Superset of JavaScript that adds static typing.
- **Vite**: Next-generation frontend tooling for fast development.
- **Sass**: CSS pre-processor.

## Setup and Running the Project

Follow these steps to set up and run the backend and frontend components of the project.

### 1. Backend Setup

Navigate to the `backend` directory, install dependencies, and run the necessary scripts.

```bash
cd backend
npm install
```

#### Environment Variables
Create a `.env` file in the `backend` directory based on `.env.example` and fill in your API keys and other configurations.

#### Ingest Data
Run the ingest script to process and store data (e.g., documents, knowledge base).

```bash
npm run ingest
```

#### Upsert Data
Run the upsert script to update or insert data into the vector database.

```bash
npm run upsert
```

#### Start Backend Server
Start the backend API server.

```bash
npm start
```

### 2. Frontend Setup (Newsbot)

Open a new terminal, navigate to the `newsbot` directory, install dependencies, and start the development server.

```bash
cd newsbot
npm install
npm run dev
```

This will start the frontend development server, usually accessible at `http://localhost:5173` (or another port if 5173 is in use).

## Live Demo

You can try out the live frontend application here: [newsbot-three.vercel.app](https://newsbot-three.vercel.app)
