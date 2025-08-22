import { Home, ArrowLeftRight, History, Settings, LogOut, User, TrendingUp } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const { user, logout, hasPermission } = useAuth();
  const currentPath = location.pathname;
  const collapsed = state === "collapsed";

  const isActive = (path: string) => currentPath === path;
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive 
      ? "bg-gradient-to-r from-primary/20 to-primary/10 text-primary font-medium border-r-2 border-primary" 
      : "hover:bg-accent/50 hover:text-accent-foreground transition-all duration-200";

  const mainItems = [
    { title: "Dashboard", url: "/", icon: Home, description: "Overview & Analytics" },
    { title: "New Transaction", url: "/transaction/exchange", icon: ArrowLeftRight, description: "Create Transaction", badge: "Quick" },
  ];

  const adminItems = [
    { title: "Transaction History", url: "/history", icon: History, description: "View All Records" },
    { title: "Business Settings", url: "/business-profile", icon: Settings, description: "Manage Profile" },
  ];

  return (
    <Sidebar className={collapsed ? "w-16" : "w-64"} collapsible="icon">
      <SidebarHeader className="p-6 border-b bg-gradient-to-r from-primary/5 to-primary/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg">
            <TrendingUp className="text-primary-foreground h-5 w-5" />
          </div>
          {!collapsed && (
            <div>
              <h2 className="font-bold text-xl bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                AMBIKA GOLD
              </h2>
              <p className="text-xs text-muted-foreground font-medium">Transaction Management</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="group">
                    <NavLink to={item.url} end className={getNavCls}>
                      <div className="flex items-center gap-3 flex-1">
                        <item.icon className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
                        {!collapsed && (
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="font-medium">{item.title}</span>
                              {item.badge && (
                                <Badge variant="secondary" className="ml-2 text-xs">
                                  {item.badge}
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5 truncate">
                              {item.description}
                            </p>
                          </div>
                        )}
                      </div>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {hasPermission('history') && (
          <SidebarGroup>
            <SidebarGroupLabel>Management</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild className="group">
                      <NavLink to={item.url} className={getNavCls}>
                        <div className="flex items-center gap-3 flex-1">
                          <item.icon className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
                          {!collapsed && (
                            <div className="flex-1 min-w-0">
                              <span className="font-medium">{item.title}</span>
                              <p className="text-xs text-muted-foreground mt-0.5 truncate">
                                {item.description}
                              </p>
                            </div>
                          )}
                        </div>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="p-4 border-t bg-gradient-to-r from-accent/5 to-accent/10">
        <div className="space-y-3">
          {/* User Info */}
          <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl border border-primary/20">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-primary-foreground" />
            </div>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-sm truncate">{user?.name}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {user?.role?.toUpperCase()} • ID: {user?.userId}
                </p>
              </div>
            )}
          </div>

          {/* Logout Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={logout}
            className="w-full justify-start gap-3 border-destructive/30 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-all duration-200 hover:scale-105"
          >
            <LogOut className="h-4 w-4" />
            {!collapsed && <span className="font-medium">Sign Out</span>}
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}