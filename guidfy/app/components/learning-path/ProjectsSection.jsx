"use client";

import React from 'react';
import ProjectCard from './ProjectCard';

const ProjectsSection = () => {
  const projects = [
    {
      title: "Portfolio Website",
      description: "A personal portfolio website built with Next.js and Tailwind CSS",
      image: "/thumb-8.png",
      technologies: ["Next.js", "Tailwind", "React"],
      githubUrl: "https://github.com/username/portfolio",
      demoUrl: "https://portfolio.example.com",
      likes: 120,
      isFeatured: true,
    },
    {
      title: "E-commerce App",
      description: "Full-stack e-commerce application with cart, payment and admin panel",
      image: "/thumb-8.png",
      technologies: ["React", "Node.js", "MongoDB", "Stripe"],
      githubUrl: "https://github.com/username/ecommerce",
      demoUrl: "https://ecommerce.example.com",
      likes: 98,
    },
    {
      title: "Chat Application",
      description: "Real-time chat app with WebSockets and notifications",
      image: "/thumb-8.png",
      technologies: ["React", "Socket.io", "Express"],
      githubUrl: "https://github.com/username/chatapp",
      demoUrl: "https://chatapp.example.com",
      likes: 76,
    },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 md:py-12">
      <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
        Projects
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {projects.map((project, index) => (
          <ProjectCard key={index} project={project} />
        ))}
      </div>
    </div>
  );
};

export default ProjectsSection;
