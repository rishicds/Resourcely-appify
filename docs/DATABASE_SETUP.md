# Appwrite Database Setup

This document explains how to set up your Appwrite database for the Resourcely app using the automated setup script.

## Prerequisites

1. **Appwrite Project**: You must have an Appwrite project already created
2. **Database**: A database must be created in your Appwrite project  
3. **API Key**: You need a server API key with database permissions

## Step 1: Get Your Server API Key

1. Go to your Appwrite Console
2. Navigate to **Settings** → **API Keys**
3. Click **Create API Key**
4. Name it something like "Database Setup"
5. Set the scopes to include:
   - `databases.read`
   - `databases.write`
   - `collections.read`
   - `collections.write`
   - `attributes.read`
   - `attributes.write`
   - `indexes.read`
   - `indexes.write`
6. Copy the generated API key

## Step 2: Update Environment Variables

Add these variables to your `.env` file:

```env
# Existing variables (you should already have these)
EXPO_PUBLIC_APPWRITE_ENDPOINT=https://your-appwrite-endpoint/v1
EXPO_PUBLIC_APPWRITE_PROJECT_ID=your-project-id
EXPO_PUBLIC_APPWRITE_DATABASE_ID=your-database-id

# New variable for setup script
APPWRITE_API_KEY=your-server-api-key

# Collection IDs (these will be created by the script)
EXPO_PUBLIC_APPWRITE_USER_COLLECTION_ID=users
EXPO_PUBLIC_APPWRITE_ROOMS_COLLECTION_ID=rooms
EXPO_PUBLIC_APPWRITE_ROOM_MEMBERS_COLLECTION_ID=room_members
EXPO_PUBLIC_APPWRITE_REQUESTS_COLLECTION_ID=requests
EXPO_PUBLIC_APPWRITE_BROADCASTS_COLLECTION_ID=broadcasts
```

## Step 3: Install Dependencies

```bash
npm install
# or
yarn install
```

## Step 4: Run the Setup Script

```bash
npm run setup-db
# or
yarn setup-db
```

The script will:
- ✅ Create all necessary collections
- ✅ Add all required attributes to each collection
- ✅ Create indexes for efficient querying
- ✅ Set up proper permissions
- ✅ Handle existing collections gracefully (won't overwrite)

## What Gets Created

### Collections

1. **users** - User profiles and authentication data
2. **rooms** - Collaboration rooms/spaces
3. **room_members** - Many-to-many relationship between users and rooms
4. **requests** - Help requests within rooms
5. **broadcasts** - Announcements and urgent help broadcasts

### Key Features

- **Full-text search** on names, skills, tools
- **Efficient indexing** for fast queries
- **Proper relationships** between collections
- **Flexible permissions** for collaborative features
- **Extensible schema** for future features

## Troubleshooting

### Common Issues

**❌ "Missing required environment variables"**
- Make sure all environment variables are set in your `.env` file
- Ensure your `.env` file is in the project root

**❌ "Invalid API key"**
- Verify your server API key is correct
- Check that the API key has the required scopes
- Make sure you're using a server API key, not a client API key

**❌ "Collection already exists"**
- This is normal! The script handles existing collections gracefully
- It will only create missing attributes and indexes

**❌ "Database not found"**
- Ensure your database exists in the Appwrite console
- Verify the `EXPO_PUBLIC_APPWRITE_DATABASE_ID` is correct

### Manual Verification

After running the script, you can verify the setup in your Appwrite Console:

1. Go to **Databases** → Your Database
2. Check that all 5 collections exist
3. Click on each collection to verify:
   - All attributes are present
   - Indexes are created
   - Permissions are set correctly

## Schema Details

### Users Collection
- Profile information (name, email, avatar)
- Skills and tools arrays
- Availability status
- Help score tracking
- Full-text search on name, skills, tools

### Rooms Collection  
- Room metadata (name, description)
- Creator and member management
- Join codes for easy access
- Activity tracking
- Full-text search capabilities

### Room Members Collection
- User-room relationships
- Role management (admin/member)
- Join timestamps
- Unique constraints to prevent duplicates

### Requests Collection
- Help request lifecycle (pending → accepted → completed)
- Skill requirements
- Requester and helper tracking
- Full-text search on required skills

### Broadcasts Collection
- Urgent announcements
- Type categorization (help/collaboration/announcement)
- Response tracking
- Expiration support

## Next Steps

After successful setup:

1. **Test the collections** by creating some sample data
2. **Run your app** and try the room features
3. **Monitor performance** using Appwrite's dashboard
4. **Scale as needed** by adjusting indexes and permissions

## Support

If you encounter issues:

1. Check the Appwrite Console for error messages
2. Verify your API key permissions
3. Ensure your database and project IDs are correct
4. Review the script output for specific error details

The setup script is idempotent - you can run it multiple times safely!
