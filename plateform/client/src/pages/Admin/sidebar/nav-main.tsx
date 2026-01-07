import { type LucideIcon } from "lucide-react";
import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar";
import { useLocation, useNavigate } from "react-router-dom";
import { useConfigContext } from "@/contexts/configContext";
import { useEffect, useState } from "react";

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
        <SidebarGroupLabel>{configValues["APP_NAME"] || "CI/CD Platform"}</SidebarGroupLabel>
        <SidebarMenu>
          {items.map((item) => (
              <SidebarMenuItem key={item.url} onClick={() => handleClick(item.url)}>
                <SidebarMenuButton
                    tooltip={item.title}
                    className={`cursor-pointer transition-all duration-200 ${
                        isLinkActive(item.url)
                            ? "bg-primary text-primary-foreground shadow-sm font-semibold"
                            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    }`}
                >
                  {item.icon && (
                      <item.icon
                          className={`w-5 h-5 transition-transform ${
                              isLinkActive(item.url) ? "scale-110" : ""
                          }`}
                      />
                  )}
                  <span className="ml-2">{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroup>
  );
}