import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import "dotenv/config";

const userSchema = new mongoose.Schema(
  {
    username: String,
    email: String,
    password: String,
    firstName: String,
    lastName: String,
  },
  { collection: "users" },
);

const User = mongoose.model("TestUser", userSchema);

async function createTestUser() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    // Check if test user exists
    const existingUser = await User.findOne({ email: "test@silentvoice.com" });

    if (existingUser) {
      console.log("Test user already exists:", {
        email: existingUser.email,
        username: existingUser.username,
        hasPassword: !!existingUser.password,
      });
    } else {
      // Create test user
      const hashedPassword = await bcrypt.hash("password123", 12);

      const testUser = new User({
        username: "testuser",
        email: "test@silentvoice.com",
        password: hashedPassword,
        firstName: "Test",
        lastName: "User",
      });

      await testUser.save();
      console.log("Test user created:", {
        email: testUser.email,
        username: testUser.username,
        password: "password123",
      });
    }

    // List all users
    const allUsers = await User.find({}).limit(5);
    console.log(
      "Sample users in database:",
      allUsers.map((u) => ({
        email: u.email,
        username: u.username,
        hasPassword: !!u.password,
      })),
    );
  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    await mongoose.disconnect();
  }
}

createTestUser();
