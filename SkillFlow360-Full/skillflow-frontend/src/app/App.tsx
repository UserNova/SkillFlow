import { Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import { Sidebar } from "./components/Layout/Sidebar";
import { TopBar } from "./components/Layout/TopBar";
import { Toaster } from "./components/ui/sonner";
import { cn } from "../lib/utils";

export default function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-lg transition-transform",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <Sidebar />
      </div>

      {/* TopBar */}
      <div
        className={cn(
          "fixed top-0 right-0 left-0 z-30 bg-white border-b transition-all",
          isSidebarOpen ? "left-64" : "left-0",
          isScrolled && "shadow-sm"
        )}
      >
        <TopBar onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
      </div>

      {/* CONTENU */}
      <main
        className={cn(
          "pt-16 transition-all",
          isSidebarOpen ? "ml-64" : "ml-0"
        )}
      >
        <div className="p-6 max-w-7xl mx-auto">
          <Outlet /> {/* 🔥 ICI les pages ADMIN / STUDENT */}
        </div>
      </main>

      <Toaster position="top-right" />
    </div>
  );
}
