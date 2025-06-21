import mongoose from "mongoose";

const schemeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    benefitAmount: {
      type: Number,
      default: 0,
    },
    benefitType: {
      type: String,
      enum: ["Monthly", "One-time", "Loan", "Subsidy"],
      required: true,
    },
    // Simple eligibility criteria
    minAge: {
      type: Number,
      default: 0,
    },
    maxAge: {
      type: Number,
      default: 120,
    },
    forGender: [{
      type: String,
      enum: ["Male", "Female", "Other", "Any"],
    }],
    forCategory: [{
      type: String,
      enum: ["General", "SC", "ST", "OBC", "Any"],
    }],
    requiresBPL: {
      type: Boolean,
      default: false,
    },
    forDisabled: {
      type: Boolean,
      default: false,
    },
    forWidows: {
      type: Boolean,
      default: false,
    },
    forHomeless: {
      type: Boolean,
      default: false,
    },
    forOccupation: [{
      type: String,
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
        "Manual Scavenger",
        "Any",
      ],
    }],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Scheme = mongoose.model("Scheme", schemeSchema);
export default Scheme;