import mongoose from "mongoose";

export const validateUserId = (req, res, next) => {
  const { userId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid user ID format",
    });
  }

  next();
};

export const validateSchemeId = (req, res, next) => {
  const { schemeId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(schemeId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid scheme ID format",
    });
  }

  next();
};