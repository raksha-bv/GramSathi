import mongoose from "mongoose";

// User Model for Village Community App
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    age: {
      type: Number,
      required: [true, "Age is required"],
      min: [1, "Age must be at least 1"],
      max: [120, "Age cannot exceed 120"],
    },
    gender: {
      type: String,
      required: [true, "Gender is required"],
      enum: {
        values: ["Male", "Female", "Other"],
        message: "Gender must be Male, Female, or Other",
      },
    },
    occupation: {
      type: String,
      required: [true, "Occupation is required"],
      enum: {
        values: [
          "Farmer",
          "Cattle Farmer",
          "Shopkeeper",
          "Teacher",
          "Healthcare Worker",
          "Artisan",
          "Labor",
          "Government Employee",
          "Business Owner",
          "Student",
          "Manual Scavenger",
          "Other",
        ],
        message: "Please select a valid occupation",
      },
    },
    cropsGrown: [
      {
        type: String,
        trim: true,
      },
    ],
    phoneNumber: {
      type: String,
      required: [true, "Phone number is required"],
      unique: true,
      trim: true,
      match: [/^[6-9]\d{9}$/, "Please enter a valid Indian phone number"],
    },
    language: {
      type: String,
      required: [true, "Language is required"],
      enum: {
        values: [
          "Hindi",
          "Bengali",
          "Telugu",
          "Marathi",
          "Tamil",
          "Gujarati",
          "Kannada",
          "Odia",
          "Malayalam",
          "Punjabi",
          "Other",
        ],
        message: "Please select a valid language",
      },
    },
    village: {
      type: String,
      required: [true, "Village is required"],
      trim: true,
    },
    district: {
      type: String,
      required: [true, "District is required"],
      trim: true,
    },
    state: {
      type: String,
      required: [true, "State is required"],
      trim: true,
    },
    farmSize: {
      type: Number, // in acres
      default: null,
    },
    // Simple eligibility fields
    category: {
      type: String,
      enum: {
        values: ["General", "SC", "ST", "OBC"],
        message: "Category must be General, SC, ST, or OBC",
      },
      required: [true, "Category is required"],
    },
    isBPL: {
      type: Boolean,
      default: false,
    },
    isDisabled: {
      type: Boolean,
      default: false,
    },
    isWidow: {
      type: Boolean,
      default: false,
    },
    hasShelter: {
      type: Boolean,
      default: true,
    },
    profilePic: {
      type: String,
      default: null,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    joinedDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Only require crops if occupation is farmer
userSchema.pre("validate", function (next) {
  if (
    this.occupation === "Farmer" &&
    (!this.cropsGrown || this.cropsGrown.length === 0)
  ) {
    this.invalidate("cropsGrown", "Crops grown is required for farmers");
  }
  next();
});

const User = mongoose.model("User", userSchema);
export default User;
