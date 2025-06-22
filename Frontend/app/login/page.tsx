"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../../store/authStore";

const LoginPage: React.FC = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [showRegistration, setShowRegistration] = useState(false);
  const [registrationData, setRegistrationData] = useState({
    name: "",
    age: "",
    gender: "" as "Male" | "Female" | "Other" | "",
    occupation: "",
    cropsGrown: [] as string[],
    language: "",
    village: "",
    district: "",
    state: "",
    farmSize: "",
    // Eligibility fields with proper typing
    category: "" as "General" | "SC" | "ST" | "OBC" | "",
    isBPL: false,
    isDisabled: false,
    isWidow: false,
    hasShelter: true,
    // Job interest fields
    interestedInJob: false,
    yearsOfExperience: "",
  });

  const { login, register, isLoading, error, isAuthenticated, clearError } =
    useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    clearError();
  }, [clearError]);

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!phoneNumber || phoneNumber.length !== 10) {
      return;
    }

    try {
      // Try to login first (check if user exists)
      await login(phoneNumber);
    } catch (err) {
      // If login fails, show registration form
      setShowRegistration(true);
    }
  };

  // Update the handleRegistrationSubmit function with better debugging
  const handleRegistrationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (
      !registrationData.category ||
      !registrationData.gender ||
      !registrationData.name ||
      !registrationData.age
    ) {
      console.error("Missing required fields:", {
        category: registrationData.category,
        gender: registrationData.gender,
        name: registrationData.name,
        age: registrationData.age,
      });
      return;
    }

    // If interestedInJob is true, yearsOfExperience is required
    if (
      registrationData.interestedInJob &&
      (registrationData.yearsOfExperience === "" ||
        registrationData.yearsOfExperience === undefined ||
        registrationData.yearsOfExperience === null)
    ) {
      console.error("Years of experience required if interested in job");
      return;
    }

    const userData = {
      name: registrationData.name.trim(),
      phoneNumber: phoneNumber.trim(),
      age: Number(registrationData.age),
      gender: registrationData.gender as "Male" | "Female" | "Other",
      category: registrationData.category as "General" | "SC" | "ST" | "OBC",
      occupation: registrationData.occupation,
      language: registrationData.language,
      village: registrationData.village.trim(),
      district: registrationData.district.trim(),
      state: registrationData.state.trim(),
      cropsGrown:
        registrationData.occupation === "Farmer"
          ? registrationData.cropsGrown
          : [],
      farmSize:
        registrationData.occupation === "Farmer" && registrationData.farmSize
          ? Number(registrationData.farmSize)
          : undefined,
      // Eligibility fields
      isBPL: registrationData.isBPL,
      isDisabled: registrationData.isDisabled,
      isWidow: registrationData.isWidow,
      hasShelter: registrationData.hasShelter,
      // Job interest fields
      interestedInJob: registrationData.interestedInJob,
      yearsOfExperience: registrationData.interestedInJob
        ? Number(registrationData.yearsOfExperience)
        : undefined,
    };

    // Debug: Log the data being sent
    console.log("Sending user data:", userData);

    try {
      await register(userData);
    } catch (error) {
      console.error("Registration error:", error);
    }
  };

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, "");

    // Limit to 10 digits
    const limited = digits.slice(0, 10);

    return limited;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhoneNumber(formatted);
  };

  const handleCropChange = (crop: string) => {
    setRegistrationData((prev) => ({
      ...prev,
      cropsGrown: prev.cropsGrown.includes(crop)
        ? prev.cropsGrown.filter((c) => c !== crop)
        : [...prev.cropsGrown, crop],
    }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Please wait...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-green-50 p-4">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mt-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mx-auto h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-3xl">🌾</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">GramSathi</h1>
            <p className="text-gray-600 mt-2">
              {showRegistration
                ? "Create Your Account"
                : "Enter Your Mobile Number"}
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <p className="text-sm text-red-600">{error}</p>
                <button
                  onClick={clearError}
                  className="text-red-400 hover:text-red-600"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          {!showRegistration ? (
            /* Phone Number Form */
            <form onSubmit={handlePhoneSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  📱 Mobile Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                    <span className="text-gray-500">+91</span>
                  </div>
                  <input
                    type="tel"
                    required
                    className="w-full pl-12 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg"
                    placeholder="Enter mobile number"
                    value={phoneNumber}
                    onChange={handlePhoneChange}
                    maxLength={10}
                  />
                </div>
                {phoneNumber && phoneNumber.length !== 10 && (
                  <p className="mt-1 text-sm text-red-600">
                    Please enter 10 digits
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={!phoneNumber || phoneNumber.length !== 10}
                className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            </form>
          ) : (
            /* Registration Form */
            <form
              onSubmit={handleRegistrationSubmit}
              className="space-y-4 max-h-96 overflow-y-auto pr-2"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  👤 Your Name
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  value={registrationData.name}
                  onChange={(e) =>
                    setRegistrationData((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  🎂 Age
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max="120"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  value={registrationData.age}
                  onChange={(e) =>
                    setRegistrationData((prev) => ({
                      ...prev,
                      age: e.target.value,
                    }))
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ⚧ Gender
                </label>
                <select
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  value={registrationData.gender}
                  onChange={(e) =>
                    setRegistrationData((prev) => ({
                      ...prev,
                      gender: e.target.value as "Male" | "Female" | "Other",
                    }))
                  }
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  🏛️ Category
                </label>
                <select
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  value={registrationData.category}
                  onChange={(e) =>
                    setRegistrationData((prev) => ({
                      ...prev,
                      category: e.target.value as
                        | "General"
                        | "SC"
                        | "ST"
                        | "OBC",
                    }))
                  }
                >
                  <option value="">Select Category</option>
                  <option value="General">General</option>
                  <option value="SC">SC</option>
                  <option value="ST">ST</option>
                  <option value="OBC">OBC</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  💼 Occupation
                </label>
                <select
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  value={registrationData.occupation}
                  onChange={(e) =>
                    setRegistrationData((prev) => ({
                      ...prev,
                      occupation: e.target.value,
                    }))
                  }
                >
                  <option value="">Select Occupation</option>
                  <option value="Farmer">Farmer</option>
                  <option value="Cattle Farmer">Cattle Farmer</option>
                  <option value="Shopkeeper">Shopkeeper</option>
                  <option value="Teacher">Teacher</option>
                  <option value="Healthcare Worker">Healthcare Worker</option>
                  <option value="Artisan">Artisan</option>
                  <option value="Labor">Labor</option>
                  <option value="Government Employee">
                    Government Employee
                  </option>
                  <option value="Business Owner">Business Owner</option>
                  <option value="Student">Student</option>
                  <option value="Manual Scavenger">Manual Scavenger</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Eligibility Questions */}
              <div className="space-y-3 bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-700">
                  📋 Eligibility Information
                </h4>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isBPL"
                    checked={registrationData.isBPL}
                    onChange={(e) =>
                      setRegistrationData((prev) => ({
                        ...prev,
                        isBPL: e.target.checked,
                      }))
                    }
                    className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <label htmlFor="isBPL" className="text-sm text-gray-700">
                    I have a BPL (Below Poverty Line) card
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isDisabled"
                    checked={registrationData.isDisabled}
                    onChange={(e) =>
                      setRegistrationData((prev) => ({
                        ...prev,
                        isDisabled: e.target.checked,
                      }))
                    }
                    className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <label htmlFor="isDisabled" className="text-sm text-gray-700">
                    I have a disability
                  </label>
                </div>

                {registrationData.gender === "Female" && (
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isWidow"
                      checked={registrationData.isWidow}
                      onChange={(e) =>
                        setRegistrationData((prev) => ({
                          ...prev,
                          isWidow: e.target.checked,
                        }))
                      }
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <label htmlFor="isWidow" className="text-sm text-gray-700">
                      I am a widow
                    </label>
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="hasShelter"
                    checked={registrationData.hasShelter}
                    onChange={(e) =>
                      setRegistrationData((prev) => ({
                        ...prev,
                        hasShelter: e.target.checked,
                      }))
                    }
                    className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <label htmlFor="hasShelter" className="text-sm text-gray-700">
                    I have proper shelter/housing
                  </label>
                </div>
              </div>

              {/* Rest of the form fields... */}
              {registrationData.occupation === "Farmer" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      🌾 Crops Grown
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {/*
                        Crop options can be fetched from an API or defined in a constant array
                        For now, we are using a static list of crops
                      */}
                      {[
                        "Rice",
                        "Wheat",
                        "Maize",
                        "Potato",
                        "Tomato",
                        "Onion",
                      ].map((crop) => (
                        <label
                          key={crop}
                          className="flex items-center space-x-2"
                        >
                          <input
                            type="checkbox"
                            checked={registrationData.cropsGrown.includes(crop)}
                            onChange={() => handleCropChange(crop)}
                            className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                          />
                          <span className="text-sm">{crop}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      📏 Farm Size (acres)
                    </label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      value={registrationData.farmSize}
                      onChange={(e) =>
                        setRegistrationData((prev) => ({
                          ...prev,
                          farmSize: e.target.value,
                        }))
                      }
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  🗣️ Language
                </label>
                <select
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  value={registrationData.language}
                  onChange={(e) =>
                    setRegistrationData((prev) => ({
                      ...prev,
                      language: e.target.value,
                    }))
                  }
                >
                  <option value="">Select Language</option>
                  <option value="Hindi">Hindi</option>
                  <option value="Bengali">Bengali</option>
                  <option value="Gujarati">Gujarati</option>
                  <option value="Kannada">Kannada</option>
                  <option value="Malayalam">Malayalam</option>
                  <option value="Marathi">Marathi</option>
                  <option value="Odia">Odia</option>
                  <option value="Punjabi">Punjabi</option>
                  <option value="Tamil">Tamil</option>
                  <option value="Telugu">Telugu</option>
                  <option value="English">English</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  🏘️ Village
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  value={registrationData.village}
                  onChange={(e) =>
                    setRegistrationData((prev) => ({
                      ...prev,
                      village: e.target.value,
                    }))
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  🏛️ District
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  value={registrationData.district}
                  onChange={(e) =>
                    setRegistrationData((prev) => ({
                      ...prev,
                      district: e.target.value,
                    }))
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  🗺️ State
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  value={registrationData.state}
                  onChange={(e) =>
                    setRegistrationData((prev) => ({
                      ...prev,
                      state: e.target.value,
                    }))
                  }
                />
              </div>

              {/* Job Interest Fields */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  💼 Interested in Job Opportunities?
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="interestedInJob"
                    checked={registrationData.interestedInJob}
                    onChange={(e) =>
                      setRegistrationData((prev) => ({
                        ...prev,
                        interestedInJob: e.target.checked,
                        // Reset yearsOfExperience if unchecked
                        yearsOfExperience: e.target.checked
                          ? prev.yearsOfExperience
                          : "",
                      }))
                    }
                    className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <label
                    htmlFor="interestedInJob"
                    className="text-sm text-gray-700"
                  >
                    Yes, I am interested in job opportunities
                  </label>
                </div>
              </div>

              {registrationData.interestedInJob && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    🏆 Years of Experience
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    value={registrationData.yearsOfExperience}
                    onChange={(e) =>
                      setRegistrationData((prev) => ({
                        ...prev,
                        yearsOfExperience: e.target.value,
                      }))
                    }
                  />
                </div>
              )}

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowRegistration(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-400"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={
                    !registrationData.category ||
                    !registrationData.gender ||
                    (registrationData.interestedInJob &&
                      registrationData.yearsOfExperience === "")
                  }
                  className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Register
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Help */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            Need help? Call: 📞 1800-XXX-XXXX
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
