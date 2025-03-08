import mongoose from "mongoose";
/**
 * Connect to MongoDB database
 * @returns MongoDB database connection or null
 */
declare const connectDB: () => Promise<mongoose.mongo.Db | null>;
export default connectDB;
