import express from "express";
import {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  getUsersByVillage,
  getFarmersByCrop,
} from "../controllers/user.controller.js";
import {
  authenticateToken,
  validateOccupation,
} from "../middleware/auth.middleware.js";

const router = express.Router();

// Public routes
router.post("/register", validateOccupation, registerUser);
router.post("/login", loginUser);

// Protected routes
router.get("/profile", authenticateToken, getUserProfile);
router.put(
  "/profile",
  authenticateToken,
  validateOccupation,
  updateUserProfile
);
router.get("/village", authenticateToken, getUsersByVillage);
router.get("/farmers", authenticateToken, getFarmersByCrop);

export default router;
