import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: "Access token required" 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: "Invalid token" 
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ 
      success: false, 
      message: "Invalid or expired token" 
    });
  }
};

export const validateOccupation = (req, res, next) => {
  const { occupation, cropsGrown } = req.body;
  
  if (occupation === "Farmer" && (!cropsGrown || cropsGrown.length === 0)) {
    return res.status(400).json({
      success: false,
      message: "Crops grown is required for farmers"
    });
  }
  
  next();
};