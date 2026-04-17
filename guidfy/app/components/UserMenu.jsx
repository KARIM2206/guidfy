"use client";
import { useState, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../CONTEXT/AuthProvider";
import DeleteModel from "./admin/dashboard/roadmap/DeleteModel";
import Image from "next/image";

export default function UserMenu({ avatar, name }) {
  const [open, setOpen] = useState(false);
  const [openLogout, setOpenLogout] = useState(false);
  const router = useRouter();
  const { handleLogout } = useAuth();

  const timeoutRef = useRef(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setOpen(false);
    }, 200);
  };

  return (
    <div
      className="relative flex items-center justify-center"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Avatar */}
      {avatar ? (
        <div className="w-10 h-10 rounded-full relative bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center">
          <Image
            src={`http://localhost:8000${avatar}`}
            alt={name}
            fill
            unoptimized
            className="absolute rounded-full inset-0 object-cover"
          />
        </div>
      ) : (
        <User
          size={24}
          onClick={() => router.push("/profile")}
          className="text-gray-600 hover:text-blue-500 transition-colors duration-200 cursor-pointer"
        />
      )}

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -10, opacity: 0 }}
            transition={{ duration: 0.2 }}
className="absolute top-full right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-md z-[9999]"          >
            <div className="py-2">
              <Link
                href="/profile"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Profile
              </Link>

              <button
                onClick={() => setOpenLogout(true)}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Logout
              </button>
            </div>

            <DeleteModel
              isOpen={openLogout}
              onClose={() => setOpenLogout(false)}
              confirmDelete={handleLogout}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}