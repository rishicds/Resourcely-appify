/**
 * Appwrite Database Setup Script
 * 
 * This script creates all necessary collections, attributes, indexes, and permissions
 * for the Resourcely app. Run this script once to set up your Appwrite database.
 * 
 * Usage:
 * 1. Make sure you have your Appwrite credentials set in .env
 * 2. Run: node scripts/setup-appwrite-db.js
 * 
 * Prerequisites:
 * - Appwrite project already created
 * - Database already created
 * - API key with proper permissions
 */

const { Client, Databases, Permission, Role, ID } = require('node-appwrite');
require('dotenv').config();

// Configuration
const config = {
  endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT,
  projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID,
  apiKey: process.env.APPWRITE_API_KEY, // Server API key (add this to your .env)
  databaseId: process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID,
};

// Validate configuration
if (!config.endpoint || !config.projectId || !config.apiKey || !config.databaseId) {
  console.error('❌ Missing required environment variables:');
  console.log('Required variables:');
  console.log('- EXPO_PUBLIC_APPWRITE_ENDPOINT');
  console.log('- EXPO_PUBLIC_APPWRITE_PROJECT_ID');
  console.log('- APPWRITE_API_KEY (Server API key)');
  console.log('- EXPO_PUBLIC_APPWRITE_DATABASE_ID');
  process.exit(1);
}

// Initialize Appwrite client
const client = new Client()
  .setEndpoint(config.endpoint)
  .setProject(config.projectId)
  .setKey(config.apiKey);

const databases = new Databases(client);

// Collection schemas
const collections = {
  users: {
    id: 'users',
    name: 'Users',
    attributes: [
      { key: 'name', type: 'string', size: 100, required: true },
      { key: 'email', type: 'string', size: 255, required: true },
      { key: 'avatar', type: 'string', size: 500, required: false },
      { key: 'skills', type: 'string', size: 20, array: true, required: false },
      { key: 'tools', type: 'string', size: 20, array: true, required: false },
      { key: 'isAvailable', type: 'boolean', required: false, default: true },
      { key: 'hasCompletedOnboarding', type: 'boolean', required: false, default: false },
      { key: 'lastActive', type: 'datetime', required: false },
      { key: 'helpScore', type: 'integer', required: false, default: 0 },
    ],
    indexes: [
      { key: 'name_search', type: 'fulltext', attributes: ['name'] },
      { key: 'skills_search', type: 'key', attributes: ['skills'] },
      { key: 'tools_search', type: 'key', attributes: ['tools'] },
      { key: 'email_unique', type: 'unique', attributes: ['email'] },
      { key: 'availability', type: 'key', attributes: ['isAvailable'] },
    ]
  },
  
  rooms: {
    id: 'rooms',
    name: 'Rooms',
    attributes: [
      { key: 'name', type: 'string', size: 100, required: true },
      { key: 'description', type: 'string', size: 1000, required: true },
      { key: 'tools', type: 'string', size: 20, array: true, required: false },
      { key: 'skills', type: 'string', size: 20, array: true, required: false },
      { key: 'createdBy', type: 'string', size: 20, required: true },
      { key: 'memberCount', type: 'integer', required: false, default: 0 },
      { key: 'isPublic', type: 'boolean', required: false, default: true },
      { key: 'joinCode', type: 'string', size: 20, required: false },
      { key: 'isActive', type: 'boolean', required: false, default: true },
      { key: 'lastActivity', type: 'datetime', required: false },
    ],
    indexes: [
      { key: 'name_search', type: 'fulltext', attributes: ['name'] },
      { key: 'skills_search', type: 'key', attributes: ['skills'] },
      { key: 'tools_search', type: 'key', attributes: ['tools'] },
      { key: 'join_code', type: 'unique', attributes: ['joinCode'] },
      { key: 'creator', type: 'key', attributes: ['createdBy'] },
      { key: 'public_rooms', type: 'key', attributes: ['isPublic'] },
      { key: 'active_rooms', type: 'key', attributes: ['isActive'] },
    ]
  },

  room_members: {
    id: 'room_members',
    name: 'Room Members',
    attributes: [
      { key: 'roomId', type: 'string', size: 20, required: true },
      { key: 'userId', type: 'string', size: 20, required: true },
      { key: 'joinedAt', type: 'datetime', required: false },
      { key: 'role', type: 'string', size: 20, required: false, default: 'member' }, // admin, member
    ],
    indexes: [
      { key: 'room_members', type: 'key', attributes: ['roomId'] },
      { key: 'user_rooms', type: 'key', attributes: ['userId'] },
      { key: 'room_admins', type: 'key', attributes: ['roomId', 'role'] },
    ]
  },

  requests: {
    id: 'requests',
    name: 'Help Requests',
    attributes: [
      { key: 'title', type: 'string', size: 200, required: true },
      { key: 'description', type: 'string', size: 2000, required: true },
      { key: 'requesterId', type: 'string', size: 20, required: true },
      { key: 'helperId', type: 'string', size: 20, required: false },
      { key: 'roomId', type: 'string', size: 20, required: true },
      { key: 'skillsNeeded', type: 'string', size: 20, array: true, required: false },
      { key: 'status', type: 'string', size: 20, required: false, default: 'pending' }, // pending, accepted, completed, cancelled
      { key: 'createdAt', type: 'datetime', required: false },
      { key: 'acceptedAt', type: 'datetime', required: false },
      { key: 'completedAt', type: 'datetime', required: false },
    ],
    indexes: [
      { key: 'room_requests', type: 'key', attributes: ['roomId'] },
      { key: 'requester', type: 'key', attributes: ['requesterId'] },
      { key: 'helper', type: 'key', attributes: ['helperId'] },
      { key: 'status_index', type: 'key', attributes: ['status'] },
      { key: 'created_date', type: 'key', attributes: ['createdAt'], orders: ['desc'] },
      { key: 'room_status', type: 'key', attributes: ['roomId', 'status'] },
      { key: 'skills_search', type: 'key', attributes: ['skillsNeeded'] },
    ]
  },

  broadcasts: {
    id: 'broadcasts',
    name: 'Broadcasts',
    attributes: [
      { key: 'title', type: 'string', size: 200, required: true },
      { key: 'description', type: 'string', size: 2000, required: true },
      { key: 'type', type: 'string', size: 20, required: false }, // help, collaboration, announcement
      { key: 'authorId', type: 'string', size: 20, required: true },
      { key: 'roomId', type: 'string', size: 20, required: true },
      { key: 'isActive', type: 'boolean', required: false, default: true },
      { key: 'responses', type: 'integer', required: false, default: 0 },
      { key: 'createdAt', type: 'datetime', required: false },
      { key: 'expiresAt', type: 'datetime', required: false },
    ],
    indexes: [
      { key: 'room_broadcasts', type: 'key', attributes: ['roomId'] },
      { key: 'author', type: 'key', attributes: ['authorId'] },
      { key: 'active_broadcasts', type: 'key', attributes: ['isActive'] },
      { key: 'broadcast_type', type: 'key', attributes: ['type'] },
      { key: 'created_date', type: 'key', attributes: ['createdAt'], orders: ['desc'] },
      { key: 'room_active', type: 'key', attributes: ['roomId', 'isActive'] },
      { key: 'expires_date', type: 'key', attributes: ['expiresAt'] },
    ]
  }
};

// Helper functions
async function createAttribute(collectionId, attribute) {
  try {
    let result;
    
    switch (attribute.type) {
      case 'string':
        result = await databases.createStringAttribute(
          config.databaseId,
          collectionId,
          attribute.key,
          attribute.size,
          attribute.required,
          attribute.default,
          attribute.array
        );
        break;
        
      case 'integer':
        result = await databases.createIntegerAttribute(
          config.databaseId,
          collectionId,
          attribute.key,
          attribute.required,
          undefined, // min
          undefined, // max
          attribute.default,
          attribute.array
        );
        break;
        
      case 'boolean':
        result = await databases.createBooleanAttribute(
          config.databaseId,
          collectionId,
          attribute.key,
          attribute.required,
          attribute.default,
          attribute.array
        );
        break;
        
      case 'datetime':
        result = await databases.createDatetimeAttribute(
          config.databaseId,
          collectionId,
          attribute.key,
          attribute.required,
          attribute.default,
          attribute.array
        );
        break;
        
      default:
        throw new Error(`Unknown attribute type: ${attribute.type}`);
    }
    
    console.log(`  ✅ Created attribute: ${attribute.key}`);
    return result;
  } catch (error) {
    if (error.message.includes('already exists')) {
      console.log(`  ⚠️  Attribute ${attribute.key} already exists`);
    } else {
      console.error(`  ❌ Failed to create attribute ${attribute.key}:`, error.message);
      throw error;
    }
  }
}

async function createIndex(collectionId, index) {
  try {
    const result = await databases.createIndex(
      config.databaseId,
      collectionId,
      index.key,
      index.type,
      index.attributes,
      index.orders
    );
    
    console.log(`  ✅ Created index: ${index.key}`);
    return result;
  } catch (error) {
    if (error.message.includes('already exists')) {
      console.log(`  ⚠️  Index ${index.key} already exists`);
    } else {
      console.error(`  ❌ Failed to create index ${index.key}:`, error.message);
      throw error;
    }
  }
}

async function setupCollection(collectionSchema) {
  console.log(`\n🔄 Setting up collection: ${collectionSchema.name}`);
  
  try {
    // Create collection
    try {
      const collection = await databases.createCollection(
        config.databaseId,
        collectionSchema.id,
        collectionSchema.name,
        [
          Permission.read(Role.any()),
          Permission.create(Role.users()),
          Permission.update(Role.users()),
          Permission.delete(Role.users()),
        ]
      );
      console.log(`✅ Created collection: ${collectionSchema.name}`);
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log(`⚠️  Collection ${collectionSchema.name} already exists`);
      } else {
        throw error;
      }
    }
    
    // Wait a bit for collection to be ready
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Create attributes
    console.log(`📝 Creating attributes for ${collectionSchema.name}...`);
    for (const attribute of collectionSchema.attributes) {
      await createAttribute(collectionSchema.id, attribute);
      // Wait between attribute creations
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    // Wait for attributes to be ready
    console.log(`⏳ Waiting for attributes to be ready...`);
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Create indexes
    console.log(`🔍 Creating indexes for ${collectionSchema.name}...`);
    for (const index of collectionSchema.indexes) {
      await createIndex(collectionSchema.id, index);
      // Wait between index creations
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log(`✅ Completed setup for ${collectionSchema.name}`);
    
  } catch (error) {
    console.error(`❌ Failed to setup collection ${collectionSchema.name}:`, error.message);
    throw error;
  }
}

async function setupDatabase() {
  console.log('🚀 Starting Appwrite database setup...');
  console.log(`📊 Database ID: ${config.databaseId}`);
  console.log(`🎯 Project ID: ${config.projectId}`);
  
  try {
    // Setup collections in order (dependencies first)
    const setupOrder = ['users', 'rooms', 'room_members', 'requests', 'broadcasts'];
    
    for (const collectionId of setupOrder) {
      const collectionSchema = collections[collectionId];
      if (collectionSchema) {
        await setupCollection(collectionSchema);
      }
    }
    
    console.log('\n🎉 Database setup completed successfully!');
    console.log('\n📝 Don\'t forget to add these environment variables to your .env file:');
    console.log('EXPO_PUBLIC_APPWRITE_REQUESTS_COLLECTION_ID=requests');
    console.log('EXPO_PUBLIC_APPWRITE_BROADCASTS_COLLECTION_ID=broadcasts');
    console.log('EXPO_PUBLIC_APPWRITE_ROOM_MEMBERS_COLLECTION_ID=room_members');
    
  } catch (error) {
    console.error('\n💥 Database setup failed:', error.message);
    process.exit(1);
  }
}

// Run setup
if (require.main === module) {
  setupDatabase();
}

module.exports = { setupDatabase, collections };
