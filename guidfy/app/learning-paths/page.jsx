import React from 'react'
import {
  Code,
  Laptop,
  Cpu,
  Database,
  LineChart,
  Brain,
  Shield,
  Smartphone,
  Cloud,
  Cog,
} from 'lucide-react';
import Traks from '../components/Traks';

const LearningPath = () => {
   const learningPaths = [
  {
    title: "Web Development",
    description: "Learn to build responsive websites and full web applications.",
    link: "/learning-paths/web-development",
    icon: Laptop ,
    jobs: 12000,
    projects: 12
  },
  {
    title: "Frontend Development",
    description: "Master React, Next.js, Tailwind, UI/UX, and client-side logic.",
    link: "/learning-paths/frontend",
    icon: Code ,
    jobs: 9000,
    projects: 10
  },
  {
    title: "Backend Development",
    description: "APIs, authentication, databases, caching, and system architecture.",
    link: "/learning-paths/backend",
    icon: Database ,
    jobs: 15000,
    projects: 14
  },
  {
    title: "Full Stack Development",
    description: "Become a complete engineer by mastering both frontend & backend.",
    link: "/learning-paths/fullstack",
    icon: Cog ,
    jobs: 20000,
    projects: 20
  },
  {
    title: "Mobile Development",
    description: "Flutter, React Native, Android, iOS, cross-platform apps.",
    link: "/learning-paths/mobile",
    icon: Smartphone ,
    jobs: 10000,
    projects: 8
  },
  {
    title: "AI & Machine Learning",
    description: "Deep learning, neural networks, ML models, and AI deployment.",
    link: "/learning-paths/ai-ml",
    icon: Brain ,
    jobs: 25000,
    projects: 15
  },
  {
    title: "Data Science",
    description: "Data analysis, visualization, statistics, Python, and ML basics.",
    link: "/learning-paths/data-science",
    icon: LineChart ,
    jobs: 18000,
    projects: 12
  },
  {
    title: "Cybersecurity",
    description: "Ethical hacking, penetration testing, and system protection.",
    link: "/learning-paths/cybersecurity",
    icon: Shield ,
    jobs: 11000,
    projects: 6
  },
  {
    title: "Cloud & DevOps",
    description: "AWS, Docker, Kubernetes, CI/CD, cloud architecture.",
    link: "/learning-paths/cloud-devops",
    icon: Cloud ,
    jobs: 16000,
    projects: 10
  },
  {
    title: "Embedded Systems",
    description: "Microcontrollers, IoT devices, C/C++, hardware programming.",
    link: "/learning-paths/embedded",
    icon: Cpu ,
    jobs: 7000,
    projects: 10
  }
];
  return (
    <div>
        <div>
<div className="text-center my-12">
    <h1 className="text-3xl font-bold mb-4">Your Tech Career Starts Here</h1>
    <p className="text-lg text-gray-700">Choose your track and get guided on your tech journey.</p>
</div>
<div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {learningPaths.map((path) => (
           <Traks key={path.title} path={path} />
              
        ))}
    </div>
</div>
</div>
    </div>
  )
}
export default LearningPath
