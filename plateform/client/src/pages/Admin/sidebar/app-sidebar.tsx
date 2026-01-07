import * as React from "react";
import { Home, NotebookText, Presentation, Settings, UsersIcon, Cog, LayoutDashboard, Box } from "lucide-react";
import { NavMain } from "./nav-main";
import { NavUser } from "./nav-user";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader } from "@/components/ui/sidebar";
import { useAuthContext } from "@/contexts/authContext";
import { useNavigate } from "react-router-dom";
import { LanguageChanger } from "@/components/Navbar/languageChanger";
import { ThemeChanger } from "@/components/Navbar/themeChanger";
import { useTranslation } from "react-i18next";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const { authUser } = useAuthContext();
    const navigate = useNavigate();
    const { t } = useTranslation();

    const adminMenus = [
        {
            title: t("pages.admin.dashboard"),
            icon: Presentation,
            url: "/admin/dashboard"
        },
        {
            title: t("pages.admin.users"), // "Utilisateurs"
            icon: UsersIcon,
            url: "/admin/users"
        },
        {
            title: t("pages.admin.logs"),
            icon: NotebookText,
            url: "/admin/logs"
        },
        {
            title: t("pages.admin.builds"),
            icon: Cog,
            url: "/admin/builds"
        },
        {
            title: t("pages.admin.settings"),
            icon: Settings,
            url: "/admin/settings"
        },
    ];

    const userMenus = [
        {
            title: t("navbar.home"),
            icon: LayoutDashboard,
            url: "/"
        },
        {
            title: t("pages.admin.builds"),
            icon: Box,
            url: "/pipelines"
        },
        {
            title: t("navbar.account"),
            icon: Settings,
            url: "/account"
        },
    ];

    const menuToDisplay = authUser?.role === "admin" ? adminMenus : userMenus;

    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader className="border-b h-16 flex items-center justify-center cursor-pointer" onClick={() => navigate("/")}>
                <div className="flex items-center gap-2 px-2">
                    <div className="bg-primary text-primary-foreground p-1.5 rounded-lg">
                        <Box className="w-6 h-6" />
                    </div>
                    <span className="font-bold text-lg tracking-tight group-data-[collapsible=icon]:hidden">
                CI/CD Platform
            </span>
                </div>
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={menuToDisplay} />
            </SidebarContent>
            <SidebarFooter className="border-t p-4 space-y-4">
                <div className="flex items-center justify-around group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:gap-4">
                    <ThemeChanger />
                    <LanguageChanger />
                </div>
                <NavUser user={authUser} />
            </SidebarFooter>
        </Sidebar>
    );
}