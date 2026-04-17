'use client'
import BlogSection from '@/app/components/learning-path/BlogSection'
import JobsSection from '@/app/components/learning-path/Jobs'
import ProjectsSection from '@/app/components/learning-path/ProjectsSection'

import CoursePage from '@/app/components/learning-path/RoadmapSection'

import { useTabs } from '@/app/CONTEXT/LearningProvider'
import { useLearningPaths } from '@/app/hooks/useLearningPath'
import { useRoadmaps } from '@/app/hooks/useRoadmaps'
import { useParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'

const page = () => {
  const {currentTab, setCurrentTab}=useTabs()
const {title}=useParams()
 const{ fetchStudentRoadmaps,
    studentRoadmaps}=useRoadmaps()
    const {fetchLearningPathByTitle,currentLearningPath}=useLearningPaths()
  // const [filters, setFilters] = useState({ page: 1, limit: 10 });
const [loading, setLoading] = useState(true);

useEffect(() => {
  const fetch = async () => {
    await fetchStudentRoadmaps(title);
    setLoading(false);
  };
  fetch();
}, [title]);


if (loading) return <p>Loading...</p>;


  
  return (
    <div>
   {
   (( currentTab == 'blog' || currentTab == 'Blog')&&
   <BlogSection/>)||
(currentTab === 'roadmap' || currentTab === 'Roadmap') && (
  <CoursePage learningPath={studentRoadmaps} />
)
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
