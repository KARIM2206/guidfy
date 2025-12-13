"use client";

import React from "react";
import { motion } from "framer-motion";
import { FileText, Book, Code, Database, Globe, Shield, Cpu, Zap } from "lucide-react";

const iconMap = { FileText, Book, Code, Database, Globe, Shield, Cpu, Zap };

const colorVariants = {
  blue: "hover:border-blue-500 hover:bg-blue-50 group-hover:text-blue-600",
  green: "hover:border-green-500 hover:bg-green-50 group-hover:text-green-600",
  purple: "hover:border-purple-500 hover:bg-purple-50 group-hover:text-purple-600",
  orange: "hover:border-orange-500 hover:bg-orange-50 group-hover:text-orange-600",
  red: "hover:border-red-500 hover:bg-red-50 group-hover:text-red-600",
  indigo: "hover:border-indigo-500 hover:bg-indigo-50 group-hover:text-indigo-600",
};

export default function References({ references = [] }) {
  const defaultReferences = [
    { title: "React Documentation", description: "Official React documentation", icon: "FileText" },
    { title: "Next.js Docs", description: "Complete guide to Next.js features", icon: "Code" },
    { title: "Tailwind CSS", description: "Utility-first CSS framework", icon: "Zap" },
    { title: "TypeScript Handbook", description: "Comprehensive TypeScript docs", icon: "Book" },
    { title: "Framer Motion", description: "Production-ready motion library", icon: "Cpu" },
    { title: "MDN Web Docs", description: "Web technology references", icon: "Globe" },
  ];

  const items = references.length ? references : defaultReferences;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <motion.h2 className="text-3xl font-bold text-center mb-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>Learning Resources</motion.h2>

      <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {defaultReferences.map((item, index) => {
          const IconComponent = iconMap[item.icon] || FileText;
          const colors = Object.keys(colorVariants);
          const colorClass = colorVariants[colors[index % colors.length]];

          return (
            <motion.div
              key={item.title}
              className={`group p-6 rounded-xl bg-white shadow-sm border-2 border-gray-100 cursor-pointer ${colorClass}`}
              whileHover={{ y: -5, scale: 1.02 }}
            >
              <div className="mb-4 flex items-center justify-center w-16 h-16 rounded-xl bg-gray-50">
                <IconComponent size={28} />
              </div>
              <h3 className="font-bold text-lg mb-2">{item.title}</h3>
              <p className="text-gray-600 text-sm">{item.description}</p>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
