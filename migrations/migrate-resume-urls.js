#!/usr/bin/env node

/**
 * Migration Script
 *
 * This script updates all resume URLs in the database from S3 to CloudFront URLs
 *
 * - From: https://mockverse.s3.ap-south-1.amazonaws.com/resume/...
 * - To:   https://d1t9c3vxhbazdo.cloudfront.net/resume/...
 */
import mongoose from "mongoose";

// Configuration
const S3_DOMAIN = "teest";
const CLOUDFRONT_DOMAIN = "test";
const MONGODB_URI = "test";
/**
 * Connect to MongoDB
 */
const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      serverApi: { version: "1", strict: true, deprecationErrors: true },
    });
    console.log("✅ Connected to MongoDB");
    return mongoose.connection.db;
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
};

/**
 * Migrate resume URLs from S3 to CloudFront
 */
const migrateResumeUrls = async () => {
  try {
    console.log("🔎 Finding resumes with S3 URLs...");

    const db = await connectDB();
    const resumeCollection = db.collection("resumes");

    // Find all resumes with S3 URLs
    const s3Pattern = `https://${S3_DOMAIN}/resume/`;
    const resumes = await resumeCollection
      .find({
        url: { $regex: s3Pattern },
      })
      .toArray();

    console.log(`📊 Found ${resumes.length} resumes with S3 URLs`);

    if (resumes.length === 0) {
      console.log("✅ No resumes to migrate");
      return;
    }

    // Process each resume
    let successCount = 0;
    let errorCount = 0;

    for (const resume of resumes) {
      try {
        // Replace S3 domain with CloudFront domain
        const oldUrl = resume.url;
        const newUrl = oldUrl.replace(S3_DOMAIN, CLOUDFRONT_DOMAIN);

        // Update the document
        await resumeCollection.updateOne(
          { _id: resume._id },
          { $set: { url: newUrl } }
        );

        console.log(`✅ Migrated: ${oldUrl} → ${newUrl}`);
        successCount++;
      } catch (err) {
        console.error(`❌ Error updating resume ${resume._id}:`, err);
        errorCount++;
      }
    }

    console.log("\n📈 Migration Summary:");
    console.log(`Total Processed: ${resumes.length}`);
    console.log(`Successful: ${successCount}`);
    console.log(`Failed: ${errorCount}`);
  } catch (error) {
    console.error("❌ Migration failed:", error);
  }
};

/**
 * Main execution function
 */
const main = async () => {
  try {
    // Validate environment variables
    if (!MONGODB_URI) {
      console.error("❌ MONGODB_URI environment variable is not set");
      process.exit(1);
    }

    // Run the migration
    await migrateResumeUrls();

    // Close the connection
    console.log("👋 Closing MongoDB connection...");
    await mongoose.disconnect();
    console.log("✅ Migration completed successfully");
  } catch (error) {
    console.error("❌ Error in migration script:", error);
  } finally {
    process.exit(0);
  }
};

// Execute the script
main();
