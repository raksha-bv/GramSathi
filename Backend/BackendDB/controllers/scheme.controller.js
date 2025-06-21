import Scheme from "../models/scheme.model.js";

// Get all active schemes
export const getAllSchemes = async (req, res) => {
  try {
    const schemes = await Scheme.find({ isActive: true });
    
    res.status(200).json({
      success: true,
      data: schemes,
      count: schemes.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching schemes",
      error: error.message,
    });
  }
};

// Get scheme by ID
export const getSchemeById = async (req, res) => {
  try {
    const { id } = req.params;
    const scheme = await Scheme.findById(id);

    if (!scheme) {
      return res.status(404).json({
        success: false,
        message: "Scheme not found",
      });
    }

    res.status(200).json({
      success: true,
      data: scheme,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching scheme",
      error: error.message,
    });
  }
};

// Create new scheme (Admin only)
export const createScheme = async (req, res) => {
  try {
    const scheme = new Scheme(req.body);
    await scheme.save();

    res.status(201).json({
      success: true,
      message: "Scheme created successfully",
      data: scheme,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error creating scheme",
      error: error.message,
    });
  }
};