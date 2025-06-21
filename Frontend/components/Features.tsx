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

const FeaturesSection = () => {
  const features = [
    {
      title: "Agriculture Advisor",
      description:
        "Uses weather APIs to check conditions and suggest optimal crops to grow. Scrapes web sources for real-time prices of condiments like potatoes, onions, etc. Advises whether to hold or sell based on market trends and forecasts.",
      icon: <Sprout className="w-6 h-6 text-gray-700" />,
      available: true,
    },
    {
      title: "Pregnancy & Women's Health Support",
      description:
        "Appointment reminders for antenatal care (ANC) check-ups. Nutrition tips and safe practices for pregnancy. Leverages NRHM APIs for maternal/child health data.",
      icon: <Heart className="w-6 h-6 text-gray-700" />,
      available: true,
    },
    {
      title: "Government Scheme Awareness",
      description:
        "Connects to National Portal API to inform users about relevant central/state schemes (PM-KISAN, Ayushman Bharat, etc.). Explains eligibility and helps in application processes.",
      icon: <FileText className="w-6 h-6 text-gray-700" />,
      available: false,
    },
    {
      title: "Agricultural Knowledge Integration",
      description:
        "Connects with KVK (Krishi Vigyan Kendras) and ICAR (Indian Council of Agricultural Research) databases for best practices, pest control tips, and crop rotation methods.",
      icon: <Users className="w-6 h-6 text-gray-700" />,
      available: true,
    },
  ];

  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-extrabold text-gray-900 mb-6">
            Features
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Comprehensive AI-powered assistance for rural communities across
            India
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-12">
          {features.map((feature, index) => (
            <div key={index} className="space-y-4">
              {/* Header */}
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-gray-100 rounded-lg">{feature.icon}</div>
                <div className="flex items-center space-x-3">
                  <h3 className="text-2xl font-bold text-gray-900">
                    {feature.title}
                  </h3>
                  {feature.available ? (
                    <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
                      Available
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-gray-100 text-gray-600 text-sm font-medium rounded-full">
                      Planned
                    </span>
                  )}
                </div>
              </div>

              {/* Description */}
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-20">
          <button className="bg-yellow-200 hover:bg-[#FFED70] px-8 py-4 rounded-full text-gray-900 font-semibold text-lg shadow-sm hover:shadow-md transform hover:scale-105 transition-all duration-300">
            Get Started
          </button>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
