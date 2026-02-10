"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  Sparkles,
  ArrowRight,
  Github,
  Loader2,
  Chrome,
} from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const router = useRouter();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 },
    },
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setError("");

    if (!email || !password) {
      toast.error("Please fill in all required fields");
      setLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      setLoading(false);
      return;
    }

    try {
      await new Promise((r) => setTimeout(r, 1500));
      toast.success("Login successful! Redirecting...");
      setTimeout(() => router.push("/dashboard"), 1000);
    } catch {
      toast.error("Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
   <>
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100 px-4 py-8">
    <motion.div
      initial={{ opacity: 0, scale: 0.5, y: 100 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 1.2, ease: "easeOut" }}
      className="w-full max-w-md"
    >
      <div className="relative backdrop-blur-sm bg-white/80 border shadow-2xl rounded-3xl p-8 space-y-8">
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-blue-600 rounded-3xl blur opacity-20 -z-10" />

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
            Welcome Back
          </h1>
          <p className="text-gray-600">Sign in to your account</p>
        </div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="p-4 bg-red-50 border border-red-200 rounded-xl"
            >
              <p className="text-red-600 text-sm text-center">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form */}
        <motion.form
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          {/* Email */}
          <motion.div variants={itemVariants} className="relative">
            <input
              type="email"
              id="email"
              placeholder=" "
              className="
                peer w-full px-12 py-4
                border border-gray-300 rounded-xl
                bg-transparent
                focus:outline-none focus:border-blue-500
                focus:ring-2 focus:ring-blue-200
                transition-all duration-300
              "
            />

            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 peer-focus:text-blue-500 transition-colors" />

            <label
              htmlFor="email"
              className="
                absolute left-12 top-1/2 -translate-y-1/2
                px-2 rounded-md
                bg-inherit backdrop-blur-sm
                text-gray-500 pointer-events-none
                transition-all duration-300

                peer-placeholder-shown:text-base
                peer-focus:top-0 peer-focus:text-sm peer-focus:text-blue-600
                peer-not-placeholder-shown:top-0 peer-not-placeholder-shown:text-sm
              "
            >
              Email address
            </label>
          </motion.div>

          {/* Password */}
          <motion.div variants={itemVariants} className="relative">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              placeholder=" "
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="
                peer w-full px-12 pr-12 py-4
                border border-gray-300 rounded-xl
                bg-transparent
                focus:outline-none focus:border-blue-500
                focus:ring-2 focus:ring-blue-200
                transition-all duration-300
              "
            />

            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 peer-focus:text-blue-500 transition-colors" />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-500 transition-colors"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>

            <label
              htmlFor="password"
              className="
                absolute left-12 top-1/2 -translate-y-1/2
                px-2 rounded-md
                bg-inherit backdrop-blur-sm
                text-gray-500 pointer-events-none
                transition-all duration-300

                peer-placeholder-shown:text-base
                peer-focus:top-0 peer-focus:text-sm peer-focus:text-blue-600
                peer-not-placeholder-shown:top-0 peer-not-placeholder-shown:text-sm
              "
            >
              Password
            </label>
          </motion.div>

          {/* Submit */}
          <motion.button
            variants={itemVariants}
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 cursor-pointer text-white py-4 rounded-xl flex items-center justify-center gap-3"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                Sign In
              </>
            )}
          </motion.button>
        </motion.form>

        {/* Divider */}
        <div className="flex items-center gap-3 text-gray-400 text-sm">
          <div className="flex-1 h-px bg-gray-200" />
          OR
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* Social Login */}
        <div className="grid grid-cols-2 gap-3">
          <button className="flex items-center cursor-pointer justify-center gap-2 p-3 border rounded-xl hover:bg-blue-500 transition">
            <Github className="w-5 h-5 " />
            GitHub
          </button>

          <button className="flex items-center justify-center cursor-pointer gap-2 p-3 border rounded-xl hover:bg-blue-500 transition">
            <Chrome className="w-5 h-5 " />
            Google
          </button>
        </div>

        {/* Signup */}
        <p className="text-center text-sm">
          Don't have an account?{" "}
          <Link href="/signup" className="text-blue-600 font-semibold">
            Sign up
          </Link>
        </p>
      </div>
    </motion.div>
  </div>
</>

  );
}
