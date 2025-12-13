"use client";

import NavigationGrid from "@/app/components/learning-path/NavigationGrid";
import React, { use } from "react";
import { ArrowLeft, BookOpen, FileText, Briefcase, Folder } from "lucide-react";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import HeaderSection from "@/app/components/learning-path/HeaderSection";
import { TabsProvider } from "@/app/CONTEXT/LearningProvider";
import PageContent from "./PageContent";

const Layout = ({ params, children }) => {
  const resolvedParams = use(params);
  const { title } = resolvedParams;
  const navLinks = [
    { name: "Blog", href: "/blog", icon: BookOpen, color: "#3B82F6" },
    {
      name: "References",
      href: "/referances",
      icon: FileText,
      color: "#10B981",
    },
    { name: "Jobs", href: "/jobs", icon: Briefcase, color: "#F59E0B" },
    { name: "Projects", href: "/projects", icon: Folder, color: "#8B5CF6" },
  ];
  return (
    <TabsProvider>
      <PageContent
        title={title}
        navLinks={navLinks}
      >
        {children}
      </PageContent>
    </TabsProvider>
  );
};

export default Layout;
