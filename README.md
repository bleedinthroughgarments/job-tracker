# Job Tracker

A full-stack application for tracking job applications, built with React, TypeScript, Node.js, Express, and PostgreSQL.

## Features

- Create and view job applications
- Edit company and vacancy details
- Update application statuses
- Delete applications
- Persist data in PostgreSQL
- Handle loading and API errors

## Tech Stack

**Frontend:** React, TypeScript, Vite  
**Backend:** Node.js, Express  
**Database:** PostgreSQL  
**Communication:** REST API

## Getting Started

### Prerequisites

- Node.js and npm
- PostgreSQL

### 1. Clone the repository

```bash
git clone https://github.com/bleedinthroughgarments/job-tracker.git
cd job-tracker
```

### 2. Configure the database

Create a PostgreSQL database for the application.

Create a `server/.env` file with the following variables:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=job_tracker
DB_USER=your_postgres_user
DB_PASSWORD=your_postgres_password
```

Use your own local PostgreSQL credentials. Never commit the `.env` file.

### 3. Start the backend

```bash
cd server
npm install
node server.js
```

### 4. Start the frontend

Open a second terminal in the project root:

```bash
npm install
npm run dev
```

Open the local URL printed by Vite in your terminal.

## Development

Build the frontend:

```bash
npm run build
```

Run frontend linting:

```bash
npm run lint
```

## Project Structure

```text
job-tracker/
├── server/
│   ├── config/
│   ├── controllers/
│   ├── routes/
│   └── server.js
├── src/
│   ├── services/
│   ├── types/
│   ├── App.tsx
│   └── main.tsx
├── package.json
└── README.md
```

## Status

This project is an MVP and is under active development.
