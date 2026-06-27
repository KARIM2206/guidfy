"use client";

import NavigationGrid from "@/app/components/learning-path/NavigationGrid";
import React, { use } from "react";
import { ArrowLeft, BookOpen, FileText, Briefcase, Folder, Route } from "lucide-react";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import HeaderSection from "@/app/components/learning-path/HeaderSection";
import { TabsProvider } from "@/app/CONTEXT/LearningProvider";
import PageContent from "./PageContent";
import { LessonProvider } from "@/app/CONTEXT/LessonProvider";
import { ProjectProvider } from "@/app/CONTEXT/ProjectContext";

const Layout = ({ params, children }) => {
  const resolvedParams = use(params);
  const { title } = resolvedParams;
  const navLinks = [
    {
      name: "Roadmap",
      href: "/roadmap",
      icon: Route,
      color: "#10B981",
    },
    { name: "Jobs", href: "/jobs", icon: Briefcase, color: "#F59E0B" },
  ];
  return (
    <ProjectProvider>
      <LessonProvider>
        <TabsProvider>
          <PageContent
            title={title}
            navLinks={navLinks}
          >
            {children}
          </PageContent>
        </TabsProvider>
      </LessonProvider>
    </ProjectProvider>
  );
};

export default Layout;
