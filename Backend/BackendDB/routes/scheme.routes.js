import express from "express";
import {
  getAllSchemes,
  getSchemeById,
  createScheme,
} from "../controllers/scheme.controller.js";
import { validateSchemeId } from "../middleware/validateUser.js";

const router = express.Router();

// Get all schemes
router.get("/", getAllSchemes);

// Get scheme by ID
router.get("/:id", validateSchemeId, getSchemeById);

// Create new scheme
router.post("/", createScheme);

export default router;
