import mongoose from "mongoose";

// Create a logger function as a fallback until we migrate the logger
const loggerFallback = {
  info: (...args: any[]) => console.log(...args),
  error: (...args: any[]) => console.error(...args),
};

const uri = process.env.MONGODB_URI || "";

/**
 * Connect to MongoDB database
 * @returns MongoDB database connection or null
 */
const connectDB = async (): Promise<mongoose.mongo.Db | null> => {
  try {
    // Define options with correct types
    const clientOptions: mongoose.ConnectOptions = {
      serverApi: { version: "1" } as any, // Type assertion since mongoose types don't exactly match our usage
    };

    await mongoose.connect(uri, clientOptions);

    if (!mongoose.connection.db) {
      throw new Error("Database connection failed - no database object");
    }

    await mongoose.connection.db.admin().command({ ping: 1 });

    loggerFallback.info(
      "🍀 Pinged your deployment. You successfully connected to MongoDB!"
    );
    return mongoose.connection.db;
  } catch (error) {
    loggerFallback.error("Database connection error:", error);
    throw new Error("Database connection failed");
  }
};

export default connectDB;
