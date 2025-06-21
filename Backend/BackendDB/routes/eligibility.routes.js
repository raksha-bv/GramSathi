import express from "express";
import {
  getUserEligibleSchemes,
  checkSchemeEligibility,
  getAllSchemesWithEligibility,
} from "../controllers/eligibility.controller.js";
import {
  validateUserId,
  validateSchemeId,
} from "../middleware/validateUser.js";

const router = express.Router();

// Get all eligible schemes for a user
router.get("/user/:userId/eligible", validateUserId, getUserEligibleSchemes);

// Check specific scheme eligibility for a user
router.get(
  "/user/:userId/scheme/:schemeId",
  validateUserId,
  validateSchemeId,
  checkSchemeEligibility
);

// Get all schemes with eligibility status for a user
router.get(
  "/user/:userId/all-schemes",
  validateUserId,
  getAllSchemesWithEligibility
);

export default router;
