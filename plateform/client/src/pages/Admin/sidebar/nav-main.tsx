import { type LucideIcon } from "lucide-react";
import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar";
import { useLocation, useNavigate } from "react-router-dom";
import { useConfigContext } from "@/contexts/configContext";
import { useAuthContext } from "@/contexts/authContext"; // <--- CETTE LIGNE EST OBLIGATOIRE
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function NavMain({items}: { items: any[] }) {
  const { authUser } = useAuthContext();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { isMobile, setOpenMobile } = useSidebar();

  if (!authUser) return null;

  return (
      <SidebarGroup className="group-data-[collapsible=icon]:p-0">
        <SidebarGroupLabel className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/50 mb-4 px-4 italic group-data-[collapsible=icon]:hidden">
          CONSOLE {authUser.role}
        </SidebarGroupLabel>

        <SidebarMenu className="gap-2 px-2 group-data-[collapsible=icon]:px-0">
          {items.map((item) => (
              <SidebarMenuItem key={item.url} onClick={() => {
                if (isMobile) setOpenMobile(false);
                navigate(item.url);
              }}>
                <SidebarMenuButton
                    tooltip={item.title}
                    className={cn(
                        "cursor-pointer h-11 px-4 transition-all duration-200 uppercase tracking-widest text-[10px] font-black group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0",
                        pathname.startsWith(item.url) ? "bg-foreground text-background rounded-xl shadow-lg" : "bg-transparent text-muted-foreground rounded-xl hover:bg-muted/80 hover:text-foreground"
                    )}
                >
                  <item.icon className="w-4 h-4 shrink-0" />
                  <span className="ml-3 tracking-tighter group-data-[collapsible=icon]:hidden">{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroup>
  );
}