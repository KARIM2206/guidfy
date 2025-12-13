"use client";
import { createContext, useContext, useEffect, useState } from "react";

const TabsContext = createContext(null);

export function TabsProvider({ children }) {
  const [currentTab, setCurrentTab] = useState("Blog");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("currentTab");
    if (saved) setCurrentTab(saved);
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem("currentTab", currentTab);
    }
  }, [currentTab, mounted]);

  return (
    <TabsContext.Provider value={{ currentTab, setCurrentTab }}>
      {children}
    </TabsContext.Provider>
  );
}

export function useTabs() {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error("useTabs must be used within TabsProvider");
  }
  return context;
}
