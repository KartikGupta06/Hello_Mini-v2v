"use client";

import React, { useState } from "react";
import { Navbar, Sidebar } from "../ui";
import styles from "./DashboardLayout.module.css";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className={styles.container}>
      <Navbar onMenuToggle={toggleSidebar} />
      
      <div className={styles.mainWrapper}>
        <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
        
        <main className={styles.content}>
          <div className={styles.innerContent}>{children}</div>
        </main>
      </div>
    </div>
  );
};
