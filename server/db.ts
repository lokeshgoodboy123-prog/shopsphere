import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config({ override: true });

// Simple helper to generate unique IDs
export const generateId = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

const DATA_DIR = path.join(process.cwd(), ".data");

// Ensure data directory exists for the JSON-file database fallback
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Check if we should use Mongoose
export let isMongoDB = !!process.env.MONGODB_URI;

// Initialize MongoDB if URI is provided
export async function connectDB() {
  if (isMongoDB) {
    try {
      // Disable Mongoose commands buffering so queries fail immediately if not connected
      mongoose.set("bufferCommands", false);
      
      // Connect with a 4 second connection timeout limit
      await mongoose.connect(process.env.MONGODB_URI as string, {
        serverSelectionTimeoutMS: 4000,
      });
      console.log("🚀 Connected to MongoDB Atlas successfully.");
    } catch (error) {
      console.error("❌ MongoDB connection failed. Falling back to local JSON database.", error);
      isMongoDB = false;
    }
  } else {
    console.log("ℹ️ MONGODB_URI not provided. Running on ShopSphere JSON Database.");
  }
}

// Lightweight JSON File-based Database implementation that mirrors MongoDB/Mongoose methods
export class FileStore<T extends { _id: string }> {
  private filePath: string;

  constructor(filename: string) {
    this.filePath = path.join(DATA_DIR, `${filename}.json`);
    if (!fs.existsSync(this.filePath)) {
      fs.writeFileSync(this.filePath, JSON.stringify([], null, 2), "utf8");
    }
  }

  private read(): T[] {
    try {
      const data = fs.readFileSync(this.filePath, "utf8");
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  private write(data: T[]): void {
    fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2), "utf8");
  }

  async find(filter: Partial<T> | ((item: T) => boolean) = {}): Promise<T[]> {
    const items = this.read();
    if (typeof filter === "function") {
      return items.filter(filter);
    }
    return items.filter((item) => {
      for (const key in filter) {
        if (item[key] !== filter[key]) return false;
      }
      return true;
    });
  }

  async findOne(filter: Partial<T> | ((item: T) => boolean)): Promise<T | null> {
    const items = this.read();
    if (typeof filter === "function") {
      return items.find(filter) || null;
    }
    const found = items.find((item) => {
      for (const key in filter) {
        if (item[key] !== filter[key]) return false;
      }
      return true;
    });
    return found || null;
  }

  async findById(id: string): Promise<T | null> {
    const items = this.read();
    return items.find((item) => item._id === id) || null;
  }

  async create(data: Omit<T, "_id"> & { _id?: string }): Promise<T> {
    const items = this.read();
    const newItem = {
      ...data,
      _id: data._id || generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as unknown as T;
    items.push(newItem);
    this.write(items);
    return newItem;
  }

  async findByIdAndUpdate(id: string, update: Partial<T>): Promise<T | null> {
    const items = this.read();
    const index = items.findIndex((item) => item._id === id);
    if (index === -1) return null;
    items[index] = {
      ...items[index],
      ...update,
      updatedAt: new Date().toISOString(),
    };
    this.write(items);
    return items[index];
  }

  async findByIdAndDelete(id: string): Promise<boolean> {
    const items = this.read();
    const filtered = items.filter((item) => item._id !== id);
    if (filtered.length === items.length) return false;
    this.write(filtered);
    return true;
  }

  async updateMany(filter: Partial<T>, update: Partial<T>): Promise<number> {
    const items = this.read();
    let count = 0;
    const updated = items.map((item) => {
      let matches = true;
      for (const key in filter) {
        if (item[key] !== filter[key]) {
          matches = false;
          break;
        }
      }
      if (matches) {
        count++;
        return { ...item, ...update, updatedAt: new Date().toISOString() };
      }
      return item;
    });
    this.write(updated);
    return count;
  }

  // Force seed items (overwrite)
  seed(data: T[]): void {
    this.write(data);
  }
}
