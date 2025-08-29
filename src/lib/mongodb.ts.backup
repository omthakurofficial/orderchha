import { MongoClient, Db, Collection } from 'mongodb'

const uri = process.env.MONGODB_URI

if (!uri) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local')
}

const client = new MongoClient(uri)
let cachedDb: Db | null = null

export async function connectToDatabase(): Promise<Db> {
  if (cachedDb) {
    return cachedDb
  }

  try {
    await client.connect()
    const db = client.db('orderchha')
    cachedDb = db
    console.log('Connected to MongoDB')
    return db
  } catch (error) {
    console.error('MongoDB connection error:', error)
    throw error
  }
}

// Database helpers
export const database = {
  // Get collection
  collection: async (name: string): Promise<Collection> => {
    const db = await connectToDatabase()
    return db.collection(name)
  },
  
  // Create document
  create: async (collectionName: string, document: any) => {
    const collection = await database.collection(collectionName)
    const result = await collection.insertOne(document)
    return result
  },
  
  // Find documents
  find: async (collectionName: string, query = {}) => {
    const collection = await database.collection(collectionName)
    const documents = await collection.find(query).toArray()
    return documents
  },
  
  // Find one document
  findOne: async (collectionName: string, query: any) => {
    const collection = await database.collection(collectionName)
    const document = await collection.findOne(query)
    return document
  },
  
  // Update document
  update: async (collectionName: string, query: any, update: any) => {
    const collection = await database.collection(collectionName)
    const result = await collection.updateOne(query, { $set: update })
    return result
  },
  
  // Delete document
  delete: async (collectionName: string, query: any) => {
    const collection = await database.collection(collectionName)
    const result = await collection.deleteOne(query)
    return result
  },
  
  // Watch changes (for real-time updates)
  watch: async (collectionName: string, callback: (change: any) => void) => {
    const collection = await database.collection(collectionName)
    const changeStream = collection.watch()
    
    changeStream.on('change', callback)
    
    return () => changeStream.close()
  }
}

export default client
