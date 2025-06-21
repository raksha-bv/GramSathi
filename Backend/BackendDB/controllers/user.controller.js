import User from "../models/user.model.js";

// Register new user
export const registerUser = async (req, res) => {
  try {
    console.log("Received registration data:", req.body);
    
    const userData = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ phoneNumber: userData.phoneNumber });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this phone number already exists"
      });
    }

    // Create new user
    const user = new User(userData);
    await user.save();

    // Convert to object and transform _id to id
    const userResponse = user.toObject();
    userResponse.id = userResponse._id.toString();
    delete userResponse._id;
    delete userResponse.__v;

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: userResponse,
      token: "dummy-token-for-now"
    });

  } catch (error) {
    console.error("Registration error:", error);
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationErrors,
        receivedData: req.body
      });
    }

    res.status(500).json({
      success: false,
      message: "Error creating user",
      error: error.message
    });
  }
};

// Login user
export const loginUser = async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    const user = await User.findOne({ phoneNumber });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found. Please register first."
      });
    }

    // Convert to object and transform _id to id
    const userResponse = user.toObject();
    userResponse.id = userResponse._id.toString();
    delete userResponse._id;
    delete userResponse.__v;

    res.status(200).json({
      success: true,
      message: "Login successful",
      user: userResponse,
      token: "dummy-token-for-now"
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error logging in",
      error: error.message
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