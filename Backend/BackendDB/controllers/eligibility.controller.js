import User from "../models/user.model.js";
import Scheme from "../models/scheme.model.js";
import { checkEligibility, getEligibleSchemes } from "../utils/eligibilityChecker.js";

// Get all eligible schemes for a specific user
export const getUserEligibleSchemes = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    const allSchemes = await Scheme.find({ isActive: true });
    const eligibleSchemes = await getEligibleSchemes(user, allSchemes);

    res.status(200).json({
      success: true,
      data: {
        user: {
          name: user.name,
          age: user.age,
          category: user.category,
        },
        eligibleSchemes,
        totalEligible: eligibleSchemes.length,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching eligible schemes",
      error: error.message,
    });
  }
};

// Check eligibility for a specific scheme
export const checkSchemeEligibility = async (req, res) => {
  try {
    const { userId, schemeId } = req.params;

    const user = await User.findById(userId);
    const scheme = await Scheme.findById(schemeId);

    if (!user || !scheme) {
      return res.status(404).json({
        success: false,
        message: "User or Scheme not found",
      });
    }

    const eligibility = checkEligibility(user, scheme);

    res.status(200).json({
      success: true,
      data: {
        user: {
          name: user.name,
          age: user.age,
        },
        scheme: {
          name: scheme.name,
          benefitAmount: scheme.benefitAmount,
          benefitType: scheme.benefitType,
        },
        eligibility,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error checking eligibility",
      error: error.message,
    });
  }
};

// Get all schemes with eligibility status for a user
export const getAllSchemesWithEligibility = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const allSchemes = await Scheme.find({ isActive: true });
    
    const schemesWithEligibility = allSchemes.map(scheme => {
      const eligibility = checkEligibility(user, scheme);
      return {
        ...scheme.toObject(),
        eligibility,
      };
    });

    res.status(200).json({
      success: true,
      data: {
        user: {
          name: user.name,
          age: user.age,
        },
        schemes: schemesWithEligibility,
        totalSchemes: allSchemes.length,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching schemes",
      error: error.message,
    });
  }
};