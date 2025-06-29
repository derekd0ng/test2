# Database Setup Guide - Vercel Postgres

This guide will help you set up Vercel Postgres for persistent data storage in your Habit & Goal Tracker app.

## Prerequisites

- Vercel account
- Project deployed on Vercel
- Access to Vercel dashboard

## Setup Steps

### 1. Install Dependencies

The required dependency has been added to your project:

```bash
npm install @vercel/postgres
```

### 2. Create Vercel Postgres Database

1. Go to your [Vercel Dashboard](https://vercel.com/dashboard)
2. Navigate to your project
3. Go to the **Storage** tab
4. Click **Create Database**
5. Select **Postgres**
6. Choose a database name (e.g., `habit-tracker-db`)
7. Select your preferred region
8. Click **Create**

### 3. Connect Database to Project

1. In the database dashboard, go to the **Settings** tab
2. Under **Environment Variables**, you'll see connection variables
3. Click **Show Secret** to reveal the connection string
4. Copy the environment variables

### 4. Add Environment Variables

Add these environment variables to your Vercel project:

#### In Vercel Dashboard:
1. Go to your project settings
2. Navigate to **Environment Variables**
3. Add the following variables from your database settings:

```
POSTGRES_URL="your-connection-string-here"
POSTGRES_PRISMA_URL="your-prisma-connection-string-here"
POSTGRES_URL_NON_POOLING="your-non-pooling-connection-string-here"
POSTGRES_USER="your-username"
POSTGRES_HOST="your-host"
POSTGRES_PASSWORD="your-password"
POSTGRES_DATABASE="your-database-name"
```

#### For Local Development:
Create a `.env.local` file in your project root:

```env
# .env.local
POSTGRES_URL="your-connection-string-here"
POSTGRES_PRISMA_URL="your-prisma-connection-string-here"
POSTGRES_URL_NON_POOLING="your-non-pooling-connection-string-here"
POSTGRES_USER="your-username"
POSTGRES_HOST="your-host"
POSTGRES_PASSWORD="your-password"
POSTGRES_DATABASE="your-database-name"
```

### 5. Database Schema

The database schema is automatically created when you first make an API call. The following tables will be created:

- **habits** - Stores habit information
- **habit_completions** - Tracks daily completions for simple habits
- **habit_counter_data** - Stores counter values for counter habits
- **goals** - Stores goal information
- **subtasks** - Stores subtasks for each goal

### 6. Deploy Changes

1. Commit your changes to git
2. Push to your repository
3. Vercel will automatically deploy the updated code

```bash
git add .
git commit -m "Add Vercel Postgres database integration"
git push origin main
```

### 7. Test the Database

After deployment:

1. Visit your app
2. Try creating a new habit or goal
3. Check that data persists between page refreshes
4. Data should now survive across deployments and be shared between devices

## Database Schema Details

### Tables Structure

```sql
-- Habits table
habits (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) CHECK (type IN ('simple', 'counter')),
  goal INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)

-- Habit completions (for simple habits)
habit_completions (
  id SERIAL PRIMARY KEY,
  habit_id INTEGER REFERENCES habits(id) ON DELETE CASCADE,
  completion_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(habit_id, completion_date)
)

-- Habit counter data (for counter habits)
habit_counter_data (
  id SERIAL PRIMARY KEY,
  habit_id INTEGER REFERENCES habits(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(habit_id, date)
)

-- Goals table
goals (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  target_date DATE,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)

-- Subtasks table
subtasks (
  id SERIAL PRIMARY KEY,
  goal_id INTEGER REFERENCES goals(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)
```

## Features Enabled

With the database setup, your app now supports:

✅ **Persistent Data Storage** - Data survives between sessions and deployments
✅ **Cross-Device Sync** - Access your data from any device
✅ **Data Integrity** - Proper relationships and constraints
✅ **Scalability** - Handles growing amounts of data
✅ **Backup & Recovery** - Vercel handles database backups
✅ **Performance** - Optimized queries with proper indexing

## Troubleshooting

### Common Issues

1. **Connection Errors**
   - Verify environment variables are set correctly
   - Check that the database is running in Vercel dashboard

2. **Permission Errors**
   - Ensure your Vercel project has access to the database
   - Check that environment variables are properly configured

3. **Import Errors**
   - Make sure `@vercel/postgres` is installed
   - Verify the import paths in your API files

### Checking Database Status

You can monitor your database in the Vercel dashboard:

1. Go to Storage → Your Database
2. View **Metrics** for usage statistics
3. Check **Logs** for any error messages
4. Use **Query** tab to run SQL commands directly

## Migration from In-Memory Storage

The app will automatically start using the database once environment variables are configured. No data migration is needed since the previous in-memory storage was temporary.

## Security Notes

- Environment variables are encrypted in Vercel
- Database connections use SSL by default
- Never commit `.env.local` to version control
- Regularly rotate database credentials if needed

## Next Steps

Consider adding these features in the future:

- User authentication for multi-user support
- Data export/import functionality
- Advanced analytics and reporting
- API rate limiting
- Database connection pooling optimization