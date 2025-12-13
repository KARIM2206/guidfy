"use client";

import { useTabs } from "@/app/CONTEXT/LearningProvider";
import { motion } from "framer-motion";

export default function NavCard({
  link,
  index,
  isActive,
  itemVariants,
  underlineVariants,
  iconVariants,

  title,
}) {
    const { currentTab, setCurrentTab } = useTabs();
  const Icon = link.icon;

  return (
    <motion.div
      key={link.name}
      variants={itemVariants}
      whileHover="hover"
      whileTap="tap"
      onClick={() => setCurrentTab(link.title)}
      className={`relative group cursor-pointer rounded-2xl p-4 md:p-6 transition-all duration-300 ${
        isActive
          ? "bg-white shadow-xl ring-2 ring-opacity-50"
          : "bg-white/80 hover:bg-white shadow-lg hover:shadow-xl"
      }`}
      style={
        isActive
          ? {
              borderLeft: `4px solid ${link.color}`,
              ringColor: link.color,
            }
          : {}
      }
      custom={index}
    >
      {isActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.1 }}
          className="absolute inset-0 rounded-2xl"
          style={{ backgroundColor: link.color }}
        />
      )}

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <motion.div
            variants={iconVariants}
            whileHover="hover"
            className={`p-2 md:p-3 rounded-xl ${
              isActive ? "bg-opacity-10" : "bg-gray-100 group-hover:bg-opacity-10"
            }`}
            style={isActive ? { backgroundColor: `${link.color}20` } : {}}
          >
            <Icon
              size={24}
              className={`transition-colors duration-300 ${
                isActive
                  ? "text-gray-800"
                  : "text-gray-500 group-hover:text-gray-800"
              }`}
              style={isActive ? { color: link.color } : {}}
            />
          </motion.div>

          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: isActive ? 1 : 0 }}
            className="w-2 h-2 md:w-3 md:h-3 rounded-full"
            style={{ backgroundColor: link.color }}
          />
        </div>

        <motion.h3
          className={`text-lg md:text-xl font-semibold mb-2 transition-colors duration-300 ${
            isActive ? "text-gray-900" : "text-gray-700 group-hover:text-gray-900"
          }`}
          layoutId={`title-${link.name}`}
        >
          {link.name}
        </motion.h3>

        <p className="text-gray-500 text-sm md:text-base mb-4">
          Explore {link.name.toLowerCase()} related to {title}
        </p>

        <motion.div
          variants={underlineVariants}
          initial="inactive"
          animate={isActive ? "active" : "inactive"}
          whileHover={!isActive ? "hover" : ""}
          className="h-0.5 rounded-full absolute bottom-0 left-0"
          style={{ backgroundColor: link.color }}
        />

        {/* Arrow */}
        <motion.div
          initial={{ x: -10, opacity: 0 }}
          animate={{
            x: isActive ? 0 : -10,
            opacity: isActive ? 1 : 0,
          }}
          whileHover={{ x: 0, opacity: 1 }}
          className="absolute bottom-4 md:bottom-6 right-4 md:right-6"
        >
          <div className="w-5 h-5 md:w-6 md:h-6 border-2 rounded-full border-gray-300 flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
