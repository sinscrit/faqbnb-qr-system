# Database Setup Guide

This guide will help you set up the Supabase database for the QR Item Display System.

## Prerequisites

1. Create a Supabase account at [supabase.com](https://supabase.com)
2. Create a new project in your Supabase dashboard

## Setup Steps

### 1. Get Your Supabase Credentials

From your Supabase project dashboard:
- Go to Settings → API
- Copy your Project URL
- Copy your anon/public key
- Copy your service_role key (for admin operations)

### 2. Configure Environment Variables

Create a `.env.local` file in the root of your Next.js project:

```bash
cp .env.example .env.local
```

Fill in your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
NEXTAUTH_SECRET=your_random_secret_key
NEXTAUTH_URL=http://localhost:3000
```

### 3. Create Database Schema

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `database/schema.sql`
4. Run the query to create tables, indexes, and policies

### 4. Seed Sample Data

1. In the SQL Editor, copy and paste the contents of `database/seed-data.sql`
2. Run the query to insert sample items and links
3. Verify the data was inserted by checking the Table Editor

### 5. Verify Setup

You should now have:
- 5 sample items (washing machine, TV, coffee maker, thermostat, dishwasher)
- Multiple links for each item with different media types
- Proper database relationships and indexes

## Database Structure

### Tables

- **items**: Main items table with public_id, name, and description
- **item_links**: Links associated with each item (videos, PDFs, images, text)

### Key Features

- UUID primary keys for security
- Row Level Security (RLS) enabled
- Public read access for item display
- Automatic timestamp updates
- Cascading deletes for data integrity

## Testing the Connection

Once configured, you can test the database connection by running the Next.js development server:

```bash
npm run dev
```

The application should be able to connect to Supabase and fetch the sample data.

