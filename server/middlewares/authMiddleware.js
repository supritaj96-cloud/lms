import { clerkClient, getAuth } from "@clerk/express";

// Protect Educator Routes
export const protectEducator = async (req, res, next) => {
  try {
    // Get authenticated user
    const { userId } = getAuth(req);

    console.log("========== AUTH MIDDLEWARE ==========");
    console.log("Authorization Header:", req.headers.authorization);
    console.log("User ID:", userId);
    console.log("req.auth:", req.auth);

    // User not logged in
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    // Get Clerk User
    const user = await clerkClient.users.getUser(userId);

    // Check educator role
    
    if (user.publicMetadata?.role !== "educator") {
      return res.status(403).json({
        success: false,
        message: "Unauthorized Access",
      });
    }

    next();
  } catch (error) {
    console.error("Protect Educator Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};