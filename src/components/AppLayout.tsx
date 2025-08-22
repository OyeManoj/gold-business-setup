import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { useState } from "react";
import { LanguageToggle, Language } from "@/components/LanguageToggle";

export function AppLayout() {
  const [language, setLanguage] = useState<Language>('en');

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="h-14 flex items-center justify-between px-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="h-8 w-8" />
              <div className="hidden sm:block">
                <h1 className="font-semibold text-lg">Gold Transaction Management</h1>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <LanguageToggle
                currentLanguage={language}
                onLanguageChange={setLanguage}
              />
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}