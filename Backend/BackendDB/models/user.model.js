import mongoose from "mongoose";

// User Model for Village Community App
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    gender: {
      type: String,
      required: true,
      enum: ["Male", "Female", "Other"],
    },
    occupation: {
      type: String,
      required: true,
      enum: [
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
        "Other",
      ],
    },
    cropsGrown: [
      {
        type: String,
        trim: true,
      },
    ],
    phoneNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      match: [/^[6-9]\d{9}$/, "Please enter a valid Indian phone number"],
    },
    language: {
      type: String,
      required: true,
      enum: [
        "Hindi",
        "Bengali",
        "Telugu",
        "Marathi",
        "Tamil",
        "Gujarati",
        "Urdu",
        "Kannada",
        "Odia",
        "Malayalam",
        "Punjabi",
        "Assamese",
        "Other",
      ],
    },
    village: {
      type: String,
      required: true,
      trim: true,
    },
    district: {
      type: String,
      required: true,
      trim: true,
    },
    state: {
      type: String,
      required: true,
      trim: true,
    },
    farmSize: {
      type: Number, // in acres
      default: null,
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
