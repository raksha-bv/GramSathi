import mongoose from "mongoose";
import Scheme from "./models/scheme.model.js";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/gramsathi";

const sampleSchemes = [
  {
    name: "Pradhan Mantri Awas Yojana (PMAY)",
    description: "Housing scheme for homeless and inadequate housing",
    benefitAmount: 120000,
    benefitType: "One-time",
    minAge: 18,
    maxAge: 120,
    forGender: ["Any"],
    forCategory: ["Any"],
    requiresBPL: false,
    forDisabled: false,
    forWidows: false,
    forHomeless: true,
    forOccupation: ["Any"],
    isActive: true,
  },
  {
    name: "Indira Gandhi National Old Age Pension Scheme",
    description: "Monthly pension for elderly BPL citizens",
    benefitAmount: 200,
    benefitType: "Monthly",
    minAge: 60,
    maxAge: 120,
    forGender: ["Any"],
    forCategory: ["Any"],
    requiresBPL: true,
    forDisabled: false,
    forWidows: false,
    forHomeless: false,
    forOccupation: ["Any"],
    isActive: true,
  },
  {
    name: "Indira Gandhi National Widow Pension Scheme",
    description: "Monthly pension for widows",
    benefitAmount: 300,
    benefitType: "Monthly",
    minAge: 40,
    maxAge: 120,
    forGender: ["Female"],
    forCategory: ["Any"],
    requiresBPL: true,
    forDisabled: false,
    forWidows: true,
    forHomeless: false,
    forOccupation: ["Any"],
    isActive: true,
  },
  {
    name: "Indira Gandhi National Disability Pension Scheme",
    description: "Monthly pension for disabled persons",
    benefitAmount: 300,
    benefitType: "Monthly",
    minAge: 18,
    maxAge: 120,
    forGender: ["Any"],
    forCategory: ["Any"],
    requiresBPL: true,
    forDisabled: true,
    forWidows: false,
    forHomeless: false,
    forOccupation: ["Any"],
    isActive: true,
  },
  {
    name: "Prime Minister Employment Generation Programme",
    description: "Financial assistance for new enterprises",
    benefitAmount: 1000000,
    benefitType: "Loan",
    minAge: 18,
    maxAge: 60,
    forGender: ["Any"],
    forCategory: ["Any"],
    requiresBPL: false,
    forDisabled: false,
    forWidows: false,
    forHomeless: false,
    forOccupation: ["Any"],
    isActive: true,
  },
];

async function seedSchemes() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    // Clear existing schemes
    console.log("Clearing existing schemes...");
    await Scheme.deleteMany({});

    // Insert sample schemes
    console.log("Inserting sample schemes...");
    const insertedSchemes = await Scheme.insertMany(sampleSchemes);
    console.log(`Successfully inserted ${insertedSchemes.length} schemes`);

    // Display inserted schemes
    insertedSchemes.forEach((scheme, index) => {
      console.log(`${index + 1}. ${scheme.name} - ₹${scheme.benefitAmount} ${scheme.benefitType}`);
    });

    console.log("Seeding completed successfully!");
  } catch (error) {
    console.error("Error seeding schemes:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

seedSchemes();