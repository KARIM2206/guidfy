"use client";
import { createContext, useContext, useEffect, useState } from "react";

const TabsContext = createContext(null);

export function TabsProvider({ children }) {
  const [currentTab, setCurrentTab] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("currentTab") || "Blog";
    }
    return "Blog";
  });

  /* ✅ save to localStorage */
  useEffect(() => {
    localStorage.setItem("currentTab", currentTab);
  }, [currentTab]);

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
