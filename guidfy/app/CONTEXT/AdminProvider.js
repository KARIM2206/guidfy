"use client";
import { createContext, useContext, useEffect, useState } from "react";
const AdminContext = createContext();
export const AdminProvider = ({ children }) => {
  const [adminData, setAdminData] = useState(null);
  const [openSidebar, setOpenSidebar] = useState(false);

  useEffect(() => {
    const fetchAdminData = async () => {
      const response = await fetch('/api/admin');
      const data = await response.json();
      setAdminData(data);
    };

    fetchAdminData();
  }, []);

  return (
    <AdminContext.Provider value={{ adminData, openSidebar, setOpenSidebar }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdminContext = () => {
  return useContext(AdminContext);
};


