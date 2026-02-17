"use client";
import { createContext, useContext, useEffect, useState } from "react";

const CommunityContext = createContext(null);

export function CommunityProvider({ children }) {
  const [openSidebar, setOpenSidebar] = useState(false);

  return (
    <CommunityContext.Provider value={{ openSidebar, setOpenSidebar }}>
      {children}
    </CommunityContext.Provider>
  );
}

export function useCommunity() {
  return useContext(CommunityContext);
}
