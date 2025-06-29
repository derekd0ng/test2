# Habit Tracker - Vercel Ready

A minimal single-page habit tracking web application built with React frontend and Vercel serverless functions backend.

## Features

- Add new habits
- Mark habits as complete for today
- View current streak and total completions
- Delete habits
- Responsive design
- Serverless architecture (Vercel)

## Tech Stack

- **Frontend**: React with TypeScript
- **Backend**: Vercel Serverless Functions
- **Storage**: In-memory (resets on each deployment)
- **Styling**: CSS
- **Deployment**: Vercel

## Project Structure

```
/
├── src/               # React app source
├── public/            # Static assets
├── api/               # Vercel serverless functions
│   ├── habits.js      # GET/POST /api/habits
│   └── habits/
│       ├── [id].js    # DELETE /api/habits/[id]
│       └── [id]/
│           └── complete.js  # POST/DELETE /api/habits/[id]/complete
├── vercel.json        # Vercel configuration
└── package.json       # Dependencies and scripts
```

## Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Open http://localhost:3000**

## Deployment to Vercel

### Option 1: Vercel CLI (Recommended)

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   vercel
   ```

### Option 2: GitHub Integration

1. Push your code to GitHub
2. Connect your repository to Vercel at https://vercel.com
3. Vercel will automatically deploy on every push

## API Endpoints

- `GET /api/habits` - Get all habits
- `POST /api/habits` - Create a new habit
  - Body: `{ "name": "Habit name" }`
- `POST /api/habits/[id]/complete` - Mark habit as complete for today
- `DELETE /api/habits/[id]/complete` - Remove today's completion
- `DELETE /api/habits/[id]` - Delete a habit

## Important Notes

- **Data persistence**: Uses in-memory storage that resets on each deployment
- **For production**: Consider adding a database (Vercel KV, PostgreSQL, etc.)
- **Serverless functions**: Each API call is stateless
- **CORS**: Enabled for all origins in API functions

## Development vs Production

- **Local**: React dev server + mock API functions
- **Vercel**: Static React build + real serverless functions