import User from "../models/user.model.js";
import jwt from "jsonwebtoken";

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// Register User
export const registerUser = async (req, res) => {
  try {
    const {
      name,
      gender,
      occupation,
      cropsGrown,
      phoneNumber,
      language,
      village,
      district,
      state,
      farmSize
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ phoneNumber });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this phone number already exists"
      });
    }

    // Create new user
    const user = new User({
      name,
      gender,
      occupation,
      cropsGrown: occupation === "Farmer" ? cropsGrown : undefined,
      phoneNumber,
      language,
      village,
      district,
      state,
      farmSize: occupation === "Farmer" ? farmSize : undefined
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        phoneNumber: user.phoneNumber,
        occupation: user.occupation,
        village: user.village,
        district: user.district,
        state: user.state,
        gender: user.gender,
        language: user.language,
        cropsGrown: user.cropsGrown,
        farmSize: user.farmSize
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Login User (simplified - just check if user exists)
export const loginUser = async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    // Find user by phone number
    const user = await User.findOne({ phoneNumber });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found with this phone number"
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        phoneNumber: user.phoneNumber,
        occupation: user.occupation,
        village: user.village,
        district: user.district,
        state: user.state,
        gender: user.gender,
        language: user.language,
        cropsGrown: user.cropsGrown,
        farmSize: user.farmSize
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get User Profile
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update User Profile
export const updateUserProfile = async (req, res) => {
  try {
    const updates = req.body;
    delete updates.phoneNumber; // Don't allow phone number update

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get Users by Village
export const getUsersByVillage = async (req, res) => {
  try {
    const { village, district, state } = req.query;
    
    const query = {};
    if (village) query.village = new RegExp(village, 'i');
    if (district) query.district = new RegExp(district, 'i');
    if (state) query.state = new RegExp(state, 'i');

    const users = await User.find(query)
      .sort({ joinedDate: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get Farmers with Specific Crops
export const getFarmersByCrop = async (req, res) => {
  try {
    const { crop } = req.query;
    
    const farmers = await User.find({
      occupation: "Farmer",
      cropsGrown: new RegExp(crop, 'i')
    });

    res.status(200).json({
      success: true,
      count: farmers.length,
      farmers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};