'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { 
  Droplet, 
  Home, 
  GraduationCap, 
  FolderGit, 
  Briefcase, 
  Users, 
  LogIn,
  UserPlus,
  User,
  MenuIcon,
  Navigation,
  LayoutDashboard
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Navbar = () => {
  const [isOpenUser, setIsOpenUser] = useState(false);
  const [isOpenMenu, setIsOpenMenu] = useState(false);
  const path = usePathname().split('/');
  const currentPath = path[1];

  const navLinks = [
    { name: "Dashboard", icon: LayoutDashboard, href: "/admin/dashboard" },
    { name: "Learning Paths", icon: GraduationCap, href: "/learning-paths" },
    { name: "Projects", icon: FolderGit, href: "/projects" },
    { name: "Opportunities", icon: Briefcase, href: "/opportunities" },
    { name: "Community", icon: Users, href: "/community" }
  ];

  // Motion variants for dropdown items
  const dropdownItemVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.2 } }
  };

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-30 shadow-gray-300">
      <div className="mx-auto max-w-full px-4 md:px-6  h-16 flex items-center justify-between">
        {/* Logo */}
       <Link href="/" className="flex items-center gap-2">
  <Navigation size={24} className="text-blue-600 hover:text-blue-500 transition-colors duration-200" />
  <span className="text-lg font-bold text-primary hover:text-primary-hover">Guidfy</span>
</Link>


        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-3 lg:gap-5">
          {navLinks.map((link) => {
            const IconComponent = link.icon;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`flex items-center relative py-4 gap-1 text-sm 
                  ${currentPath === link.href.split('/')[1] ? 'text-primary' : 'text-gray-600'} 
                  hover:text-primary transition-colors duration-200 group
                  after:content-[''] after:absolute after:bottom-2 after:block
                  
                   after:w-0 after:h-0.5 after:bg-primary after:transition-all after:duration-300
                  ${currentPath === link.href.split('/')[1] ? 'after:w-full' : 'hover:after:w-full'}
                `}
              >
                <IconComponent 
                  size={18} 
                  className={`hidden lg:inline-block mr-2 ${currentPath === link.href.split('/')[1] ? 'text-primary' : 'text-gray-500'} group-hover:text-primary transition-colors duration-200`} 
                />
                <span className=''>{link.name}</span>
              </Link>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className='relative flex items-center gap-4'>
          <div className="hidden md:flex items-center gap-4 ">
            {/* Register */}
            <Link href="/register" className="group px-4 py-2 bg-gray-100 hover:bg-primary-active text-primary hover:text-white text-sm font-medium rounded-lg flex items-center gap-2 transition-all duration-300">
              <motion.div
                initial={{ x: 0, rotate: 0 }}
                whileHover={{ x: 6, rotate: 12, scale: 1.1, transition: { duration: 0.3, ease: "easeOut" } }}
                className="group-hover:rotate-25 group-hover:scale-110  transition-all duration-300"
              >
                <UserPlus className="w-4 h-4"/>
              </motion.div>
              <span className="hidden lg:block">Register</span>
            </Link>

            {/* Login */}
            <Link href="/login" className="group px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg flex items-center gap-2 transition-all duration-300 shadow-sm hover:shadow-md">
              <motion.div
                initial={{ x: 0, rotate: 0 }}
                whileHover={{ x: 6, rotate: 12, scale: 1.1, transition: { duration: 0.3, ease: "easeOut" } }}
                className=" group-hover:rotate-25 group-hover:scale-110  transition-all duration-300"
              >
                <LogIn className="w-4 h-4"/>
              </motion.div>
              <span className="hidden lg:block">Login</span>
            </Link>
           <Link href="/profile" className="group px-4 py-2 bg-amber-400  text-white text-sm font-medium rounded-lg flex items-center gap-2 transition-all duration-300 shadow-sm hover:shadow-md">
              <motion.div
                initial={{ x: 0, rotate: 0 }}
                whileHover={{ x: 6, rotate: 12, scale: 1.1, transition: { duration: 0.3, ease: "easeOut" } }}
                className=" group-hover:rotate-25 group-hover:scale-110  transition-all duration-300"
              >
                <User className="w-4 h-4"/>
              </motion.div>
              <span className="hidden lg:block">Profile</span>
            </Link>
          </div>

          {/* Mobile User Icon */}
          <div 
            onMouseEnter={() => setIsOpenUser(true)}
            onMouseLeave={() => setIsOpenUser(false)}
            className='md:hidden relative w-10 h-10 p-2 flex items-center justify-center rounded-full hover:bg-blue-200 cursor-pointer'>
            <User className="w-6 h-6 text-gray-600 group-hover:text-primary"/>
           
            <AnimatePresence>
              { isOpenUser && (
                
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0, transition: { staggerChildren: 0.05 } }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  className="absolute flex z-9999 top-12 right-0 bg-white shadow-lg rounded-md overflow-hidden"
                >
                  <motion.div variants={dropdownItemVariants} className="flex flex-col">
                    <Link href="/login" className='px-4 py-2 hover:bg-blue-100 flex items-center gap-2 text-gray-700'>
                      <LogIn className='w-4 h-4'/> Login
                    </Link>
                    <Link href="/register" className='px-4 py-2  hover:bg-blue-100 flex items-center gap-2 text-gray-700'>
                      <UserPlus className='w-4 h-4'/> Register
                    </Link>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Mobile Menu Icon */}
          <div 
            onMouseEnter={() => setIsOpenMenu(true)}
            onMouseLeave={() => setIsOpenMenu(false)}
            className='md:hidden relative w-10 h-10 p-2 flex items-center justify-center rounded-full hover:bg-blue-200 cursor-pointer'>
            <MenuIcon className="w-6 h-6 text-blue-600"/>
            <AnimatePresence mode='wait'>
              {isOpenMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0, transition: { staggerChildren: 0.05 } }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  className="absolute top-12 right-0 bg-white shadow-lg rounded-md overflow-hidden"
                >
                  {navLinks.map((link) => {
                    const IconComponent = link.icon;
                    return (
                      <motion.div key={link.name} variants={dropdownItemVariants}>
                        <Link href={link.href} className='px-4 py-2 whitespace-nowrap hover:bg-blue-100 flex items-center gap-2 text-gray-700'>
                          <IconComponent size={18}/> {link.name}
                        </Link>
                      </motion.div>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
