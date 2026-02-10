'use client'
import BlogSection from '@/app/components/learning-path/BlogSection'
import JobsSection from '@/app/components/learning-path/Jobs'
import ProjectsSection from '@/app/components/learning-path/ProjectsSection'

import CoursePage from '@/app/components/learning-path/RoadmapSection'

import { useTabs } from '@/app/CONTEXT/LearningProvider'
import React from 'react'

const page = () => {
  const {currentTab, setCurrentTab}=useTabs()

  console.log('currentTab in page.jsx:', currentTab);
  
  return (
    <div>
   {
   (( currentTab == 'blog' || currentTab == 'Blog')&&
   <BlogSection/>)||
   (currentTab == 'roadmap' || currentTab == 'Roadmap'&&
   <CoursePage  />)
   ||
   (currentTab == 'jobs' || currentTab == 'Jobs'&&
   <JobsSection />)
   ||
   (currentTab == 'projects' || currentTab == 'Projects'&&
   <ProjectsSection />)
   }
      
    </div>
  )
}

export default page
