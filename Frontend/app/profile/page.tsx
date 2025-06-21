"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../../store/authStore";
import {
  Bot,
  Phone,
  MapPin,
  User,
  Calendar,
  Briefcase,
  Languages,
  Shield,
  Home,
  Heart,
  Accessibility,
  Users,
  Camera,
  Edit,
  Save,
  X,
  LogOut,
  CheckCircle,
  AlertCircle,
  Globe,
  Wheat,
  Crown,
  Clock,
  Menu,
} from "lucide-react";
import Link from "next/link";

const ProfilePage: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState(user);
  const [loading, setLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    setEditedUser(user);
  }, [user]);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const handleEdit = () => {
    setIsEditing(true);
    if (!user) return;
    setEditedUser({
      ...user,
      name: user.name ?? "",
      age: user.age ?? 0,
      gender: user.gender ?? "Male",
      phoneNumber: user.phoneNumber ?? "",
      occupation: user.occupation ?? "",
      village: user.village ?? "",
      district: user.district ?? "",
      state: user.state ?? "",
      language: user.language ?? "",
      category: user.category ?? "",
      isBPL: user.isBPL ?? false,
      hasShelter: user.hasShelter ?? false,
      isDisabled: user.isDisabled ?? false,
      isWidow: user.isWidow ?? false,
      cropsGrown: user.cropsGrown ?? [],
      farmSize: user.farmSize ?? 0,
      profilePic: user.profilePic ?? "",
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedUser(user);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Here you would typically make an API call to update the user
      // await updateUser(editedUser);
      setIsEditing(false);
      // Show success message
    } catch (error) {
      console.error("Failed to update profile:", error);
      // Show error message
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setEditedUser((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        [field]: value,
        name: prev.name ?? "",
        age: prev.age ?? 0,
        gender: prev.gender ?? "Male",
      };
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-green-50 flex items-center justify-center p-4">
        <div className="bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-sm border border-yellow-200 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading profile...</p>
        </div>
      </div>
    );
  }

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getCategoryBadgeColor = (category: string) => {
    switch (category) {
      case "General":
        return "bg-blue-100 text-blue-800";
      case "SC":
        return "bg-purple-100 text-purple-800";
      case "ST":
        return "bg-green-100 text-green-800";
      case "OBC":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-green-50">
      {/* Header - Responsive */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-yellow-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="bg-yellow-200 p-2 rounded-full">
                <Bot className="w-5 h-5 sm:w-6 sm:h-6 text-gray-800" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                  GramSathi
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">
                  Profile Settings
                </p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-6">
              <Link
                href="/"
                className="text-lg font-semibold text-gray-900 hover:text-gray-700 transition-all duration-300 hover:scale-105"
              >
                Home
              </Link>
              <Link
                href="/dashboard"
                className="text-lg font-semibold text-gray-900 hover:text-gray-700 transition-all duration-300 hover:scale-105"
              >
                Dashboard
              </Link>
              <Link
                href="/chat"
                className="text-lg font-semibold text-gray-900 hover:text-gray-700 transition-all duration-300 hover:scale-105"
              >
                Chat
              </Link>
              <Link
                href="/assistant"
                className="text-lg font-semibold text-gray-900 hover:text-gray-700 transition-all duration-300 hover:scale-105"
              >
                Assistant
              </Link>
              <button
                onClick={handleLogout}
                className="bg-red-100 hover:bg-red-200 text-red-700 px-6 py-2 rounded-full font-semibold text-lg shadow-sm hover:shadow-md transform hover:scale-105 transition-all duration-300 flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="lg:hidden flex items-center gap-2">
              <button
                onClick={handleLogout}
                className="bg-red-100 hover:bg-red-200 text-red-700 p-2 rounded-full shadow-sm hover:shadow-md transition-all duration-300"
              >
                <LogOut className="w-4 h-4" />
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Menu className="w-5 h-5 text-gray-700" />
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="lg:hidden border-t border-yellow-200 py-4">
              <div className="flex flex-col space-y-2">
                <Link
                  href="/"
                  className="px-4 py-2 text-gray-900 hover:bg-yellow-50 rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Home
                </Link>
                <Link
                  href="/dashboard"
                  className="px-4 py-2 text-gray-900 hover:bg-yellow-50 rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  href="/chat"
                  className="px-4 py-2 text-gray-900 hover:bg-yellow-50 rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Chat
                </Link>
                <Link
                  href="/assistant"
                  className="px-4 py-2 text-gray-900 hover:bg-yellow-50 rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Assistant
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Profile Header - Responsive */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm border border-yellow-200 p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6 w-full sm:w-auto">
              <div className="relative">
                <div className="h-20 w-20 sm:h-24 sm:w-24 bg-gradient-to-br from-yellow-200 to-yellow-300 rounded-full flex items-center justify-center shadow-sm">
                  {user.profilePic ? (
                    <img
                      src={user.profilePic}
                      alt="Profile"
                      className="h-20 w-20 sm:h-24 sm:w-24 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-3xl sm:text-4xl">👤</span>
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-green-400 rounded-full border-2 border-white flex items-center justify-center">
                  {user.gender ? (
                    <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                  ) : (
                    <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                  )}
                </div>
                <button className="absolute -top-2 -right-2 bg-yellow-400 hover:bg-yellow-500 p-1.5 rounded-full shadow-sm transition-colors duration-200">
                  <Camera className="w-3 h-3 sm:w-4 sm:h-4 text-gray-700" />
                </button>
              </div>
              <div className="text-center sm:text-left">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                  {user.name}
                </h2>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-4 mb-3">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${getCategoryBadgeColor(
                      user.category
                    )}`}
                  >
                    {user.category}
                  </span>
                  {user.gender && (
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" />
                      Verified
                    </span>
                  )}
                </div>
                <p className="text-gray-600 flex items-center justify-center sm:justify-start gap-2 text-sm sm:text-base">
                  <MapPin className="w-4 h-4" />
                  {user.village}, {user.district}, {user.state}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-center sm:justify-end">
              {!isEditing ? (
                <button
                  onClick={handleEdit}
                  className="bg-yellow-400 hover:bg-yellow-500 text-gray-800 px-4 sm:px-6 py-2 rounded-lg font-semibold transition-colors duration-200 flex items-center gap-2 text-sm sm:text-base"
                >
                  <Edit className="w-4 h-4" />
                  Edit Profile
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="bg-green-500 hover:bg-green-600 text-white px-3 sm:px-4 py-2 rounded-lg font-semibold transition-colors duration-200 flex items-center gap-2 text-sm sm:text-base"
                  >
                    <Save className="w-4 h-4" />
                    {loading ? "Saving..." : "Save"}
                  </button>
                  <button
                    onClick={handleCancel}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-3 sm:px-4 py-2 rounded-lg font-semibold transition-colors duration-200 flex items-center gap-2 text-sm sm:text-base"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Profile Information Grid - Responsive */}
        <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
          {/* Personal Information */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm border border-yellow-200 overflow-hidden">
            <div className="bg-gradient-to-r from-yellow-200 to-yellow-300 p-3 sm:p-4">
              <h3 className="text-gray-900 font-semibold flex items-center gap-2 text-sm sm:text-base">
                <User className="w-4 h-4 sm:w-5 sm:h-5" />
                Personal Information
              </h3>
            </div>
            <div className="p-4 sm:p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedUser?.name || ""}
                      onChange={(e) =>
                        handleInputChange("name", e.target.value)
                      }
                      className="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent text-sm sm:text-base"
                    />
                  ) : (
                    <p className="mt-1 text-gray-900 font-medium text-sm sm:text-base">
                      {user.name}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Age
                  </label>
                  {isEditing ? (
                    <input
                      type="number"
                      value={editedUser?.age || ""}
                      onChange={(e) =>
                        handleInputChange("age", parseInt(e.target.value))
                      }
                      className="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent text-sm sm:text-base"
                    />
                  ) : (
                    <p className="mt-1 text-gray-900 font-medium text-sm sm:text-base">
                      {user.age} years
                    </p>
                  )}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Gender
                </label>
                {isEditing ? (
                  <select
                    value={editedUser?.gender || ""}
                    onChange={(e) =>
                      handleInputChange("gender", e.target.value)
                    }
                    className="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent text-sm sm:text-base"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                ) : (
                  <p className="mt-1 text-gray-900 font-medium text-sm sm:text-base">
                    {user.gender}
                  </p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Phone Number
                </label>
                <p className="mt-1 text-gray-900 font-medium flex items-center gap-2 text-sm sm:text-base">
                  <Phone className="w-4 h-4" />
                  {user.phoneNumber}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Language
                </label>
                {isEditing ? (
                  <select
                    value={editedUser?.language || ""}
                    onChange={(e) =>
                      handleInputChange("language", e.target.value)
                    }
                    className="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent text-sm sm:text-base"
                  >
                    <option value="Hindi">Hindi</option>
                    <option value="Bengali">Bengali</option>
                    <option value="Telugu">Telugu</option>
                    <option value="Marathi">Marathi</option>
                    <option value="Tamil">Tamil</option>
                    <option value="Gujarati">Gujarati</option>
                    <option value="Kannada">Kannada</option>
                    <option value="Odia">Odia</option>
                    <option value="Malayalam">Malayalam</option>
                    <option value="Punjabi">Punjabi</option>
                    <option value="Other">Other</option>
                  </select>
                ) : (
                  <p className="mt-1 text-gray-900 font-medium flex items-center gap-2 text-sm sm:text-base">
                    <Languages className="w-4 h-4" />
                    {user.language}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Location Information */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm border border-yellow-200 overflow-hidden">
            <div className="bg-gradient-to-r from-green-200 to-green-300 p-3 sm:p-4">
              <h3 className="text-gray-900 font-semibold flex items-center gap-2 text-sm sm:text-base">
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
                Location Details
              </h3>
            </div>
            <div className="p-4 sm:p-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Village
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedUser?.village || ""}
                    onChange={(e) =>
                      handleInputChange("village", e.target.value)
                    }
                    className="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent text-sm sm:text-base"
                  />
                ) : (
                  <p className="mt-1 text-gray-900 font-medium text-sm sm:text-base">
                    {user.village}
                  </p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">
                  District
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedUser?.district || ""}
                    onChange={(e) =>
                      handleInputChange("district", e.target.value)
                    }
                    className="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent text-sm sm:text-base"
                  />
                ) : (
                  <p className="mt-1 text-gray-900 font-medium text-sm sm:text-base">
                    {user.district}
                  </p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">
                  State
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedUser?.state || ""}
                    onChange={(e) => handleInputChange("state", e.target.value)}
                    className="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent text-sm sm:text-base"
                  />
                ) : (
                  <p className="mt-1 text-gray-900 font-medium text-sm sm:text-base">
                    {user.state}
                  </p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Full Address
                </label>
                <p className="mt-1 text-gray-700 bg-gray-50 p-3 rounded-lg text-sm sm:text-base">
                  {user.village}, {user.district}, {user.state}, India
                </p>
              </div>
            </div>
          </div>

          {/* Occupation Information */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm border border-yellow-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-200 to-blue-300 p-3 sm:p-4">
              <h3 className="text-gray-900 font-semibold flex items-center gap-2 text-sm sm:text-base">
                <Briefcase className="w-4 h-4 sm:w-5 sm:h-5" />
                Occupation Details
              </h3>
            </div>
            <div className="p-4 sm:p-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Occupation
                </label>
                {isEditing ? (
                  <select
                    value={editedUser?.occupation || ""}
                    onChange={(e) =>
                      handleInputChange("occupation", e.target.value)
                    }
                    className="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent text-sm sm:text-base"
                  >
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
                ) : (
                  <p className="mt-1 text-gray-900 font-medium text-sm sm:text-base">
                    {user.occupation}
                  </p>
                )}
              </div>
              {user.occupation === "Farmer" && (
                <>
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Crops Grown
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedUser?.cropsGrown?.join(", ") || ""}
                        onChange={(e) =>
                          handleInputChange(
                            "cropsGrown",
                            e.target.value
                              .split(", ")
                              .filter((crop) => crop.trim())
                          )
                        }
                        placeholder="Rice, Wheat, Sugarcane (comma separated)"
                        className="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent text-sm sm:text-base"
                      />
                    ) : (
                      <div className="mt-1 flex flex-wrap gap-2">
                        {user.cropsGrown && user.cropsGrown.length > 0 ? (
                          user.cropsGrown.map((crop, index) => (
                            <span
                              key={index}
                              className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs sm:text-sm font-medium flex items-center gap-1"
                            >
                              <Wheat className="w-3 h-3" />
                              {crop}
                            </span>
                          ))
                        ) : (
                          <p className="text-gray-500 text-sm">
                            No crops specified
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Farm Size
                    </label>
                    {isEditing ? (
                      <input
                        type="number"
                        step="0.1"
                        value={editedUser?.farmSize || ""}
                        onChange={(e) =>
                          handleInputChange(
                            "farmSize",
                            parseFloat(e.target.value)
                          )
                        }
                        placeholder="Farm size in acres"
                        className="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent text-sm sm:text-base"
                      />
                    ) : (
                      <p className="mt-1 text-gray-900 font-medium text-sm sm:text-base">
                        {user.farmSize
                          ? `${user.farmSize} acres`
                          : "Not specified"}
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Eligibility Information */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm border border-yellow-200 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-200 to-purple-300 p-3 sm:p-4">
              <h3 className="text-gray-900 font-semibold flex items-center gap-2 text-sm sm:text-base">
                <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
                Eligibility Status
              </h3>
            </div>
            <div className="p-4 sm:p-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600 mr-10">
                  Category
                </label>
                {isEditing ? (
                  <select
                    value={editedUser?.category || ""}
                    onChange={(e) =>
                      handleInputChange("category", e.target.value)
                    }
                    className="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent text-sm sm:text-base"
                  >
                    <option value="General">General</option>
                    <option value="SC">SC</option>
                    <option value="ST">ST</option>
                    <option value="OBC">OBC</option>
                  </select>
                ) : (
                  <span
                    className={`mt-1 inline-block px-3 py-1 rounded-full text-sm font-semibold ${getCategoryBadgeColor(
                      user.category
                    )}`}
                  >
                    {user.category}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">
                    Below Poverty Line (BPL)
                  </span>
                  {isEditing ? (
                    <input
                      type="checkbox"
                      checked={editedUser?.isBPL || false}
                      onChange={(e) =>
                        handleInputChange("isBPL", e.target.checked)
                      }
                      className="w-4 h-4 text-yellow-600 border-gray-300 rounded focus:ring-yellow-500"
                    />
                  ) : (
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.isBPL
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {user.isBPL ? "Yes" : "No"}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">
                    Has Shelter
                  </span>
                  {isEditing ? (
                    <input
                      type="checkbox"
                      checked={editedUser?.hasShelter || false}
                      onChange={(e) =>
                        handleInputChange("hasShelter", e.target.checked)
                      }
                      className="w-4 h-4 text-yellow-600 border-gray-300 rounded focus:ring-yellow-500"
                    />
                  ) : (
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                        user.hasShelter
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      <Home className="w-3 h-3" />
                      {user.hasShelter ? "Yes" : "No"}
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">
                    Physically Disabled
                  </span>
                  {isEditing ? (
                    <input
                      type="checkbox"
                      checked={editedUser?.isDisabled || false}
                      onChange={(e) =>
                        handleInputChange("isDisabled", e.target.checked)
                      }
                      className="w-4 h-4 text-yellow-600 border-gray-300 rounded focus:ring-yellow-500"
                    />
                  ) : (
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                        user.isDisabled
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      <Accessibility className="w-3 h-3" />
                      {user.isDisabled ? "Yes" : "No"}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">
                    Widow
                  </span>
                  {isEditing ? (
                    <input
                      type="checkbox"
                      checked={editedUser?.isWidow || false}
                      onChange={(e) =>
                        handleInputChange("isWidow", e.target.checked)
                      }
                      className="w-4 h-4 text-yellow-600 border-gray-300 rounded focus:ring-yellow-500"
                    />
                  ) : (
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                        user.isWidow
                          ? "bg-purple-100 text-purple-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      <Heart className="w-3 h-3" />
                      {user.isWidow ? "Yes" : "No"}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

      </div>    
  </div>
    </div>
  );
};

export default ProfilePage;

export interface User {
  id?: string;
  _id?: string;
  name: string;
  age: number;
  gender: string;
  phoneNumber?: string;
  occupation?: string;
  village?: string;
  district?: string;
  state?: string;
  language?: string;
  category?: string;
  joinedDate?: string;
  isVerified?: boolean;
  isBPL?: boolean;
  hasShelter?: boolean;
  isDisabled?: boolean;
  isWidow?: boolean;
  cropsGrown?: string[];
  farmSize?: number;
  profilePic?: string;
}