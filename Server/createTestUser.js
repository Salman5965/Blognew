import User from "./models/User.js";
import connectDB from "./config/database.js";

async function createTestUser() {
  try {
    await connectDB();

    // Check if test user already exists
    const existingUser = await User.findByEmail("test@example.com");
    if (existingUser) {
      console.log("Test user already exists:", existingUser.email);
      process.exit(0);
    }

    // Create test user
    const testUser = new User({
      username: "testuser",
      email: "test@example.com",
      password: "password123",
      firstName: "Test",
      lastName: "User",
      bio: "Test user for debugging",
    });

    await testUser.save();
    console.log("✅ Test user created successfully!");
    console.log("📧 Email: test@example.com");
    console.log("🔑 Password: password123");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error creating test user:", error.message);
    process.exit(1);
  }
}

createTestUser();
