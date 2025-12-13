import Link from 'next/link'
import React from 'react'

const NavLink = ({link, IconComponent, currentPath}) => {
  return (
   <Link
                key={link?.name}
                href={link?.href}
                className={`"flex items-center relative py-4 
                gap-2 text-sm text-gray-600 hover:text-primary 
                transition-colors duration-200 group
                after:content-['']
                after:absolute
                after:bottom-0
                after:block after:w-0 after:h-0.5
                after:duration-300 after:transition-all
                hover:after:w-full hover:after:bg-primary" ${currentPath == link?.href?.split('/')[1]?
                   'after:w-full after:bg-primary text-primary  ' : ''}`}
              >
                <IconComponent 
                  size={18} 
                  className={`"text-gray-500 hidden lg:inline-block mr-2 group-hover:text-primary transition-colors duration-200"${currentPath == link.href.split('/')[1]?'text-primary  ' : ''}`} 
                />
                <span className=''>{link.name}</span>
                
              </Link>
  )
}

export default NavLink
