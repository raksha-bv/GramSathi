"use client";

import React from "react";
import {
  Cloud,
  TrendingUp,
  Heart,
  Calendar,
  FileText,
  Users,
  Sprout,
} from "lucide-react";
import Link from "next/link";

const FeaturesSection = () => {
  const features = [
    {
      title: "Farming Help",
      description:
        "Get weather updates and crop suggestions. Know current market prices and when to sell or hold your crops.",
      icon: <Sprout className="w-6 h-6 text-gray-700" />,
      available: true,
    },
    {
      title: "Women's Health",
      description:
        "Pregnancy care tips, hospital checkup reminders, and safe delivery information for mothers.",
      icon: <Heart className="w-6 h-6 text-gray-700" />,
      available: true,
    },
    {
      title: "Government Schemes",
      description:
        "Information about PM-KISAN, Ayushman Bharat and other schemes. Help with applications and eligibility.",
      icon: <FileText className="w-6 h-6 text-gray-700" />,
      available: false,
    },
    {
      title: "Agriculture Knowledge",
      description:
        "Pest control tips, crop rotation advice, and best farming practices from agricultural experts.",
      icon: <Users className="w-6 h-6 text-gray-700" />,
      available: true,
    },
  ];

  return (
    <section className="py-12 sm:py-16 lg:py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Our Services
          </h2>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-4">
            AI-powered assistance for all your rural needs
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white/60 backdrop-blur-sm p-4 sm:p-6 rounded-2xl border border-yellow-200 hover:shadow-lg transition-all duration-300"
            >
              {/* Header */}
              <div className="flex items-start space-x-3 sm:space-x-4 mb-3">
                <div className="p-2 bg-yellow-100 rounded-lg flex-shrink-0">
                  {feature.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  {feature.available ? (
                    <span className="inline-block px-2 sm:px-3 py-1 bg-green-100 text-green-700 text-xs sm:text-sm font-medium rounded-full">
                      Available
                    </span>
                  ) : (
                    <span className="inline-block px-2 sm:px-3 py-1 bg-orange-100 text-orange-700 text-xs sm:text-sm font-medium rounded-full">
                      Coming Soon
                    </span>
                  )}
                </div>
              </div>

              {/* Description */}
              <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12 sm:mt-16">
          <Link href='/chat' className="bg-yellow-300 hover:bg-yellow-400 px-6 sm:px-8 py-3 sm:py-4 rounded-full text-gray-900 font-bold text-base sm:text-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300">
            Get Started
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
