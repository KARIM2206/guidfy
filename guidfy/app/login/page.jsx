// "use client";

// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import Link from "next/link";
// import { motion, AnimatePresence } from "framer-motion";
// import { toast, ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import {
//   Mail,
//   Lock,
//   Eye,
//   EyeOff,
//   LogIn,
//   Sparkles,
//   ArrowRight,
//   Github,
//   Loader2,
//   Chrome,
// } from "lucide-react";
// import { useAuth } from "../CONTEXT/AuthProvider";

// export default function Login() {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [showPassword, setShowPassword] = useState(false);
//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [isHovered, setIsHovered] = useState(false);
//   const { fetchLogin, loadingForLogin, user } = useAuth();
//   const router = useRouter();
// const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';
//   const containerVariants = {
//     hidden: { opacity: 0 },
//     visible: {
//       opacity: 1,
//       transition: {
//         staggerChildren: 0.1,
//         delayChildren: 0.2,
//       },
//     },
//   };

//   const itemVariants = {
//     hidden: { y: 20, opacity: 0 },
//     visible: {
//       y: 0,
//       opacity: 1,
//       transition: { type: "spring", stiffness: 100 },
//     },
//   };

//  const handleSubmit = async (e) => {
//   e.preventDefault();
//   try {
//     await fetchLogin(email, password);
//     console.log(user.role,'user role');
    
   
//   } catch (err) {
//     console.error("handleSubmit error:", err);
//   }
// };

//   return (
//    <>
//   <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100 px-4 py-8">
//     <motion.div
//       initial={{ opacity: 0, scale: 0.5, y: 100 }}
//       animate={{ opacity: 1, y: 0, scale: 1 }}
//       transition={{ duration: 1.2, ease: "easeOut" }}
//       className="w-full max-w-md"
//     >
//       <div className="relative backdrop-blur-sm bg-white/80 border shadow-2xl rounded-3xl p-8 space-y-8">
//         <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-blue-600 rounded-3xl blur opacity-20 -z-10" />

//         {/* Header */}
//         <div className="text-center space-y-2">
//           <div className="mx-auto w-16 h-16 flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg">
//             <Sparkles className="w-8 h-8 text-white" />
//           </div>
//           <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
//             Welcome Back
//           </h1>
//           <p className="text-gray-600">Sign in to your account</p>
//         </div>

//         {/* Error */}
//         <AnimatePresence>
//           {error && (
//             <motion.div
//               initial={{ opacity: 0, height: 0 }}
//               animate={{ opacity: 1, height: "auto" }}
//               exit={{ opacity: 0, height: 0 }}
//               className="p-4 bg-red-50 border border-red-200 rounded-xl"
//             >
//               <p className="text-red-600 text-sm text-center">{error}</p>
//             </motion.div>
//           )}
//         </AnimatePresence>

//         {/* Form */}
//         <motion.form
//           variants={containerVariants}
//           initial="hidden"
//           animate="visible"
//           onSubmit={handleSubmit}
//           className="space-y-6"
//         >
//           {/* Email */}
//           <motion.div variants={itemVariants} className="relative">
//             <input
//               type="email"
//               id="email"
//               placeholder=" "
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               className="
//                 peer w-full px-12 py-4
//                 border border-gray-300 rounded-xl
//                 bg-transparent
//                 focus:outline-none focus:border-blue-500
//                 focus:ring-2 focus:ring-blue-200
//                 transition-all duration-300
//               "
//             />

//             <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 peer-focus:text-blue-500 transition-colors" />

//             <label
//               htmlFor="email"
//               className="
//                 absolute left-12 top-1/2 -translate-y-1/2
//                 px-2 rounded-md
//                 bg-inherit backdrop-blur-sm
//                 text-gray-500 pointer-events-none
//                 transition-all duration-300

//                 peer-placeholder-shown:text-base
//                 peer-focus:top-0 peer-focus:text-sm peer-focus:text-blue-600
//                 peer-not-placeholder-shown:top-0 peer-not-placeholder-shown:text-sm
//               "
//             >
//               Email address
//             </label>
//           </motion.div>

//           {/* Password */}
//           <motion.div variants={itemVariants} className="relative">
//             <input
//               type={showPassword ? "text" : "password"}
//               id="password"
//               placeholder=" "
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               className="
//                 peer w-full px-12 pr-12 py-4
//                 border border-gray-300 rounded-xl
//                 bg-transparent
//                 focus:outline-none focus:border-blue-500
//                 focus:ring-2 focus:ring-blue-200
//                 transition-all duration-300
//               "
//             />

//             <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 peer-focus:text-blue-500 transition-colors" />

//             <button
//               type="button"
//               onClick={() => setShowPassword(!showPassword)}
//               className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-500 transition-colors"
//             >
//               {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
//             </button>

//             <label
//               htmlFor="password"
//               className="
//                 absolute left-12 top-1/2 -translate-y-1/2
//                 px-2 rounded-md
//                 bg-inherit backdrop-blur-sm
//                 text-gray-500 pointer-events-none
//                 transition-all duration-300

//                 peer-placeholder-shown:text-base
//                 peer-focus:top-0 peer-focus:text-sm peer-focus:text-blue-600
//                 peer-not-placeholder-shown:top-0 peer-not-placeholder-shown:text-sm
//               "
//             >
//               Password
//             </label>
//           </motion.div>

//           {/* Submit */}
//           <motion.button
//             variants={itemVariants}
//             type="submit"
//             disabled={loadingForLogin}
//             className="w-full bg-gradient-to-r from-blue-500 to-blue-600 cursor-pointer text-white py-4 rounded-xl flex items-center justify-center gap-3"
//           >
//             {loadingForLogin ? (
//               <>
//                 <Loader2 className="w-5 h-5 animate-spin" />
//                 Signing in...
//               </>
//             ) : (
//               <>
//                 <LogIn className="w-5 h-5" />
//                 Sign In
//               </>
//             )}
//           </motion.button>
//         </motion.form>

//         {/* Divider */}
//         <div className="flex items-center gap-3 text-gray-400 text-sm">
//           <div className="flex-1 h-px bg-gray-200" />
//           OR
//           <div className="flex-1 h-px bg-gray-200" />
//         </div>

//         {/* Social Login */}
//         <div className="grid grid-cols-2 gap-3">
//           <button className="flex items-center cursor-pointer justify-center gap-2 p-3 border rounded-xl hover:bg-blue-500 transition">
//             <Github className="w-5 h-5 " />
//             GitHub
//           </button>

//           <button className="flex items-center justify-center cursor-pointer gap-2 p-3 border rounded-xl hover:bg-blue-500 transition">
//             <Chrome className="w-5 h-5 " />
//             Google
//           </button>
//         </div>

//         {/* Signup */}
//         <p className="text-center text-sm">
//           Don't have an account?{" "}
//           <Link href="/signup" className="text-blue-600 font-semibold">
//             Sign up
//           </Link>
//         </p>
//       </div>
//     </motion.div>
//   </div>
// </>

//   );
// }


/**
 * ═══════════════════════════════════════════════════════════════════════════
 * LOGIN PAGE - REFACTORED
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * This page demonstrates:
 * - useLogin() mutation hook for authentication
 * - Zustand for auth state management
 * - No localStorage token handling (all server-side via cookies)
 * - Proper error handling with React Query
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLogin } from '@/app/hooks/useAuthMutations';
import { useAuthStore } from '@/lib/stores/authStore';
import { Loader, AlertCircle } from 'lucide-react';
import { useAuth } from '../CONTEXT/AuthProvider';

export default function LoginPage() {
  const router = useRouter();
  const { error: authError } = useAuthStore();
  const { handleLoginSuccess } = useAuth();
  const loginMutation = useLogin();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});

  // ─── Validation ─────────────────────────────────────────────────────
  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ─── Handle Submit ──────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    loginMutation.mutate(
      {
        email: formData.email,
        password: formData.password,
      },
      {
        // ✅ بعد ما السيرفر يسيت الـ cookie، نعمل refetch للـ user
        onSuccess: () => {
          handleLoginSuccess();
          router.push('/');
        },
        onError: (error) => {
          setErrors({
            general: error?.message || 'Invalid email or password',
          });
        },
      }
    );
  };
  // ─── Handle Input Change ────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // ─── Render ─────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Guidfy</h1>
            <p className="text-gray-600">Sign in to your account</p>
          </div>

          {/* Error Alert */}
          {(authError || loginMutation.error) && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-800">
                  {authError || loginMutation.error?.message || 'Login failed'}
                </p>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.password ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="w-4 h-4 rounded border-gray-300" />
                <span className="text-gray-600">Remember me</span>
              </label>
              <Link href="/forgot-password" className="text-blue-600 hover:text-blue-700">
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loginMutation.isPending && (
                <Loader className="w-4 h-4 animate-spin" />
              )}
              {loginMutation.isPending ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <Link href="/register" className="text-blue-600 hover:text-blue-700 font-medium">
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
