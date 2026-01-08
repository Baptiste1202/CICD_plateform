import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuthContext } from "@/contexts/authContext";
import { cn } from "@/lib/utils";

export function NavMain({items}: { items: any[] }) {
    const { authUser } = useAuthContext();
    const { pathname } = useLocation();
    const navigate = useNavigate();
    const { isMobile, setOpenMobile } = useSidebar();

    if (!authUser) return null;

    return (
        <SidebarGroup className="group-data-[collapsible=icon]:p-0">
            <SidebarGroupLabel className="text-[9px] font-black uppercase tracking-[0.4em] text-muted-foreground/40 mb-4 px-4 italic group-data-[collapsible=icon]:hidden">
                {authUser.role} MANAGEMENT
            </SidebarGroupLabel>

            <SidebarMenu className="gap-2 px-2 group-data-[collapsible=icon]:px-0">
                {items.map((item) => {
                    const isActive = pathname === item.url || (item.url !== "/dashboard" && pathname.startsWith(item.url));

                    return (
                        <SidebarMenuItem key={item.url} onClick={() => {
                            if (isMobile) setOpenMobile(false);
                            navigate(item.url);
                        }}>
                            <SidebarMenuButton
                                tooltip={item.title}
                                className={cn(
                                    "cursor-pointer h-12 px-4 transition-all duration-300 uppercase tracking-widest text-[10px] font-black group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0",
                                    isActive
                                        ? "bg-primary text-primary-foreground rounded-xl shadow-[0_5px_15px_rgba(var(--primary),0.3)] scale-[1.02]"
                                        : "bg-transparent text-muted-foreground rounded-xl hover:bg-muted/50 hover:text-foreground active:scale-95"
                                )}
                            >
                                <item.icon className={cn(
                                    "w-4 h-4 shrink-0 transition-transform duration-300",
                                    isActive ? "scale-110" : "group-hover:scale-110"
                                )} />

                                <span className={cn(
                                    "ml-3 tracking-tighter group-data-[collapsible=icon]:hidden",
                                    isActive ? "opacity-100" : "opacity-70"
                                )}>
                                    {item.title}
                                </span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    )
                })}
            </SidebarMenu>
        </SidebarGroup>
    );
}