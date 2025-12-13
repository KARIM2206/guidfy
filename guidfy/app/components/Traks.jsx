import React from 'react'
import { Eye, Briefcase, Package } from 'lucide-react';
import Link from 'next/link';
const Traks = ({path}) => {
  return (
    <div className=" border bg-white dark:bg-gray-800
             border-gray-200  rounded-lg p-6 hover:shadow-lg transition-shadow duration-200">
                
                <div className='flex flex-col justify-between h-full gap-4'>
  <div className="flex items-center mb-4 justify-between px-2">
                   <div className='w-10 h-10 flex items-center justify-center
                    bg-blue-100 text-blue-500 rounded-sm '>
                    <path.icon className="w-6 h-6 " />
                    </div> 
                    <Eye className="w-6 h-6 text-blue-500 " />
                </div>
                <div className='flex flex-col gap-1'>
                    <h2 className="text-xl font-semibold mb-2">{path.title}</h2>
                     <p className="text-gray-600">{path.description}</p>
                </div>
               
          <div className="mt-4 flex flex-wrap gap-4">
  <div className="min-w-fit flex items-center gap-0.5 bg-green-100 rounded-full px-2 py-1">
    <Briefcase className="w-4 h-4 text-green-500 inline-block mr-1" />
    <span className="text-sm text-green-500">{path.jobs}+ Jobs</span>
  </div>

  <div className="min-w-fit flex items-center gap-0.5 bg-blue-100 rounded-full px-2 py-1">
    <Package className="w-4 h-4 text-blue-500 inline-block mr-1" />
    <span className="text-sm text-blue-500">{path.projects}+ Projects</span>
  </div>
</div>

                <Link href={path.link} className=" text-white bg-blue-500 px-4 py-2 
                hover:bg-blue-600 rounded-md text-center text-xl font-semibold 
                 transform hover:scale-105 transition-transform duration-600" >
                    Enter Track
                </Link>
            </div>
                </div>
  )
}

export default Traks
