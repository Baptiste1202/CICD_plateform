import { type LucideIcon } from "lucide-react";
import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar";
import { useLocation, useNavigate } from "react-router-dom";
import { useConfigContext } from "@/contexts/configContext";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function NavMain({items,}: {
  items: {
    title: string;
    icon: LucideIcon;
    isActive?: boolean;
    url: string;
  }[];
}) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { isMobile, setOpenMobile } = useSidebar();

  const isLinkActive = (path: string) => {
    if (path === "/") return pathname === "/";
    return pathname.startsWith(path);
  };

  const { getConfigValue } = useConfigContext();
  const [configValues, setConfigValues] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchConfigValues = async () => {
      const values = await getConfigValue(["APP_NAME"]);
      setConfigValues(values);
    };
    fetchConfigValues();
  }, [getConfigValue]);

  function handleClick(url: string) {
    if (isMobile) {
      setOpenMobile(false);
    }
    navigate(url);
  }

  return (
      <SidebarGroup>
        <SidebarGroupLabel className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/50 mb-4 px-4 italic">
          {configValues["APP_NAME"] || "CI/CD Platform"}
        </SidebarGroupLabel>
        <SidebarMenu className="gap-2 px-2">
          {items.map((item) => {
            const active = isLinkActive(item.url);
            return (
                <SidebarMenuItem key={item.url} onClick={() => handleClick(item.url)}>
                  <SidebarMenuButton
                      tooltip={item.title}
                      className={cn(
                          "cursor-pointer h-11 px-4 transition-all duration-200 uppercase tracking-widest text-[10px] font-black",
                          active
                              ? "bg-foreground text-background rounded-xl shadow-lg translate-x-1"
                              : "bg-transparent text-muted-foreground rounded-xl hover:bg-muted/80 hover:text-foreground"
                      )}
                  >
                    {item.icon && (
                        <item.icon
                            className={cn(
                                "w-4 h-4 transition-all",
                                active ? "scale-110 opacity-100" : "opacity-40"
                            )}
                        />
                    )}
                    <span className="ml-3 tracking-tighter">{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroup>
  );
}