"use client";

import React from 'react';

import JobCard from './JobCard';

const JobsSection = () => {
  const jobs = [
    {
      title: "Frontend Developer",
      company: "TechCorp",
      location: "Remote",
      postedAt: Date.now() - 1000 * 60 * 60 * 24, // 1 day ago
      description: "Work on modern React apps with Tailwind CSS and Next.js",
    },
    {
      title: "Backend Engineer",
      company: "DataSoft",
      location: "New York, USA",
      postedAt: Date.now() - 1000 * 60 * 60 * 48, // 2 days ago
      description: "Build scalable APIs with Node.js and Express",
    },
    {
      title: "Fullstack Developer",
      company: "WebWorks",
      location: "London, UK",
      postedAt: Date.now() - 1000 * 60 * 60 * 72, // 3 days ago
      description: "Create end-to-end applications using Next.js and MongoDB",
    },
    {
      title: "React Native Developer",
      company: "Appify",
      location: "Remote",
      postedAt: Date.now() - 1000 * 60 * 60 * 96, // 4 days ago
      description: "Develop mobile apps using React Native and TypeScript",
    },
    {
      title: "DevOps Engineer",
      company: "Cloudify",
      location: "Berlin, Germany",
      postedAt: Date.now() - 1000 * 60 * 60 * 120, // 5 days ago
      description: "Manage CI/CD pipelines and cloud infrastructure",
    },
    {
      title: "UI/UX Designer",
      company: "CreativeLabs",
      location: "Remote",
      postedAt: Date.now() - 1000 * 60 * 60 * 144, // 6 days ago
      description: "Design user interfaces and experiences for web apps",
    },
  ];

  return (
    <div className='my-12 flex flex-col gap-6 w-full'>
      <div className='flex flex-col gap-6 md:grid md:grid-cols-2 lg:grid-cols-3'>
        {jobs.map((job, index) => (
          <JobCard key={index} job={job} />
        ))}
      </div>
    </div>
  );
}

export default JobsSection;
