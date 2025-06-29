# Neon Database Setup Guide

This guide will help you set up Neon PostgreSQL for persistent data storage in your Habit & Goal Tracker app. Neon is Vercel's recommended PostgreSQL provider with seamless integration.

## Why Neon?

- ✅ **Vercel's Official Partner** - Fully integrated with Vercel
- ✅ **Serverless PostgreSQL** - Auto-scales and hibernates when not in use
- ✅ **Generous Free Tier** - 512MB storage, 3GB data transfer
- ✅ **Instant Setup** - Can be added directly from Vercel dashboard
- ✅ **Branching** - Create database branches for development
- ✅ **Performance** - Fast cold starts and connection pooling

## Setup Options

### Option 1: Direct from Vercel Dashboard (Recommended)

1. **Go to your Vercel project dashboard**
2. **Navigate to Storage tab**
3. **Click "Create Database"**
4. **Select "Neon" from the list**
5. **Choose your database name and region**
6. **Click "Create & Connect"**
7. **Vercel automatically adds environment variables to your project**

### Option 2: Manual Neon Account Setup

1. **Create Neon Account**
   - Go to [neon.tech](https://neon.tech)
   - Sign up with GitHub/Google or email
   - Create your first project

2. **Create Database**
   - Choose a project name (e.g., "habit-tracker")
   - Select your preferred region
   - Choose PostgreSQL version (latest recommended)

3. **Get Connection String**
   - Go to your project dashboard
   - Navigate to "Connection Details"
   - Copy the connection string

## Environment Variables Setup

### In Vercel Dashboard (if using Option 1):
Environment variables are automatically added. You can view them in:
- Project Settings → Environment Variables

### In Vercel Dashboard (if using Option 2):
Add these environment variables:

```
DATABASE_URL="your-neon-connection-string"
```

### For Local Development:
Create a `.env.local` file in your project root:

```env
# .env.local
DATABASE_URL="postgresql://username:password@ep-example-12345.us-east-2.aws.neon.tech/dbname?sslmode=require"
NODE_ENV="development"
```

## Dependencies Installation

The required dependency has been added to your `package.json`:

```bash
npm install @neondatabase/serverless
```

## Database Schema

The database schema is automatically created when you first make an API call. The following tables will be created:

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

## Deploy Your Changes

1. **Commit your changes:**
```bash
git add .
git commit -m "Add Neon PostgreSQL database integration"
git push origin main
```

2. **Vercel automatically deploys** the updated code

3. **First API call** will initialize the database tables

## Testing the Database

After deployment:

1. Visit your app
2. Create a new habit or goal
3. Refresh the page - data should persist
4. Check Neon dashboard to see your data

## Neon Dashboard Features

Access your database at [console.neon.tech](https://console.neon.tech):

- **SQL Editor** - Run queries directly
- **Tables View** - Browse your data
- **Metrics** - Monitor usage and performance
- **Branches** - Create development/staging databases
- **Settings** - Manage connection strings and users

## Free Tier Limits

Neon's generous free tier includes:
- **512MB storage** (plenty for personal use)
- **3GB data transfer per month**
- **100 hours of compute time**
- **Automatic hibernation** when not in use
- **Unlimited databases** in your project

## Advanced Features

### Database Branching
Create separate databases for development:
```bash
# Create a new branch
neon branches create --name development

# Get connection string for branch
neon connection-string development
```

### Connection Pooling
For high-traffic apps, use the pooled connection:
```env
DATABASE_URL="postgresql://username:password@ep-example-12345-pooler.us-east-2.aws.neon.tech/dbname?sslmode=require&pgbouncer=true"
```

### Backup and Restore
Neon automatically handles:
- **Point-in-time recovery** (up to 7 days on free tier)
- **Automatic backups**
- **Branch-based backups**

## Troubleshooting

### Common Issues

1. **Connection Timeout**
   - Check your connection string format
   - Ensure `sslmode=require` is included
   - Verify environment variables are set

2. **SSL Certificate Errors**
   - Make sure your connection string includes `sslmode=require`
   - Update to latest `@neondatabase/serverless` version

3. **Permission Errors**
   - Verify your database user has proper permissions
   - Check that tables are being created in the right schema

4. **Cold Start Issues**
   - Neon hibernates after inactivity (normal behavior)
   - First request after hibernation may be slower

### Checking Database Status

In Neon Console:
1. Go to your project dashboard
2. Check **Operations** tab for recent activity
3. View **Metrics** for performance data
4. Use **SQL Editor** to run diagnostic queries

## Migration from In-Memory Storage

The app will automatically start using Neon once environment variables are configured. No data migration needed since previous storage was temporary.

## Security Features

- **SSL/TLS encryption** by default
- **IP allowlists** (paid plans)
- **Database-level users** and permissions
- **Connection string rotation**
- **Audit logs** (paid plans)

## Monitoring and Optimization

### Query Performance
- Use Neon's **Query Performance** tab to identify slow queries
- Check connection pooling usage
- Monitor storage and compute usage

### Cost Optimization
- **Hibernation** automatically saves compute costs
- **Branching** helps manage development vs production
- **Storage optimization** through regular cleanup

## Next Steps

Consider these future enhancements:

- **User Authentication** for multi-user support
- **Database Branching** for staging environment
- **Real-time Subscriptions** (with additional tools)
- **Advanced Analytics** and reporting
- **Data Export/Import** functionality

## Support and Resources

- **Neon Documentation**: [neon.tech/docs](https://neon.tech/docs)
- **Vercel + Neon Guide**: [vercel.com/guides/neon](https://vercel.com/guides/neon)
- **Neon Discord**: [neon.tech/discord](https://neon.tech/discord)
- **GitHub Issues**: Report integration issues

## Connection String Format

Your Neon connection string follows this format:
```
postgresql://[user]:[password]@[hostname]/[database]?sslmode=require
```

Example:
```
postgresql://alex:AbC123dEf@ep-cool-darkness-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
```

That's it! Your app now has persistent, scalable PostgreSQL storage with Neon.