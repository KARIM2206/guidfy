'use client';
import React from 'react';
import { 
  Droplet, 
  Home, 
  GraduationCap, 
  FolderGit, 
  Briefcase, 
  Users, 
  LogIn
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import NavLink from './TrackNavbar';

const Navbar = () => {
  const path = usePathname().split('/');
const currentPath=path[1];
  console.log('Current Path:', currentPath);
  
  const navLinks = [
    { 
      name: "Home", 
      icon: Home,
      href: "/"
    },
    { 
      name: "Learning Paths", 
      icon: GraduationCap,
      href: "/learning-paths"
    },
    { 
      name: "Projects", 
      icon: FolderGit,
      href: "/projects"
    },
    { 
      name: "Opportunities", 
      icon: Briefcase,
      href: "/opportunities"
    },
    { 
      name: "Community", 
      icon: Users,
      href: "/community"
    }
  ];

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50 shadow-gray-300">
      <div className="mx-auto max-w-[1200px] px-6 h-16 flex items-center justify-between">
        {/* Logo Section */}
        <Link href={"/"} className="flex items-center gap-3">
          <Droplet 
            size={24} 
            color="#3b82f6" 
            className="text-primary hover:text-primary-hover transition-colors duration-200"
          />
          <span className="text-lg font-semibold text-primary hover:text-primary-hover transition-colors duration-200">
            Guidfy
          </span>
        </Link >

        {/* Navigation Links - Hidden on mobile, visible on medium+ screens */}
        <div className="hidden md:flex items-center gap-7">
          {navLinks.map((link) => {
            const IconComponent = link.icon;
            console.log(currentPath==link.href.split('/')[1]);
            
            return (
             
   <Link
                key={link?.name}
                href={link?.href}
                className={`flex items-center relative py-4 
                  cursor-pointer
                gap-2 text-sm text-gray-600 hover:text-primary 
                transition-colors duration-200 group
                after:content-['']
                after:absolute
                after:bottom-0
                after:block after:w-0 after:h-0.5
                after:duration-300 after:transition-all
                hover:after:w-full hover:after:bg-primary${currentPath == link?.href?.split('/')[1]?
                   'after:w-full after:bg-primary text-primary  ' : ''}`}
              >
                <IconComponent 
                  size={18} 
                  className={`"text-gray-500 hidden lg:inline-block mr-2 group-hover:text-primary transition-colors duration-200"${currentPath == link.href.split('/')[1]?'text-primary  ' : ''}`} 
                />
                <span className=''>{link.name}</span>
                
              </Link>             
            );
          })}
        </div>

        {/* Action Button */}
        <button className="px-4 py-2 bg-primary hover:bg-primary-active
         text-white text-sm font-medium rounded-md flex items-center gap-2 transition-colors duration-200">
      <LogIn className='w-4 h-4  '/>   <span className='hidden lg:block'>Login with University Email</span>  
        </button>
      </div>
    </nav>
  );
}

export default Navbar;