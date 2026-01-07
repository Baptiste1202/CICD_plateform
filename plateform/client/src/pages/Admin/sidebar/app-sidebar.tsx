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
            title: t("pages.admin.dashboard").toUpperCase(),
            icon: Presentation,
            url: "/admin/dashboard"
        },
        {
            title: t("pages.admin.users").toUpperCase(),
            icon: UsersIcon,
            url: "/admin/users"
        },
        {
            title: t("pages.admin.logs").toUpperCase(),
            icon: NotebookText,
            url: "/admin/logs"
        },
        {
            title: t("pages.admin.builds").toUpperCase(),
            icon: Cog,
            url: "/admin/builds"
        },
        {
            title: t("pages.admin.settings").toUpperCase(),
            icon: Settings,
            url: "/admin/settings"
        },
    ];

    const userMenus = [
        {
            title: t("navbar.home").toUpperCase(),
            icon: LayoutDashboard,
            url: "/"
        },
        {
            title: t("pages.admin.builds").toUpperCase(),
            icon: Box,
            url: "/pipelines"
        },
        {
            title: t("navbar.account").toUpperCase(),
            icon: Settings,
            url: "/account"
        },
    ];

    const menuToDisplay = authUser?.role === "admin" ? adminMenus : userMenus;

    return (
        <Sidebar collapsible="icon" className="border-r-2 border-border shadow-none" {...props}>
            <SidebarHeader
                className="border-b-2 border-border h-16 flex items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => navigate("/")}
            >
                <div className="flex items-center gap-2 px-2">
                    <div className="bg-foreground text-background p-1.5 rounded-none border-2 border-foreground">
                        <Box className="w-5 h-5" />
                    </div>
                    <span className="font-black text-sm tracking-tighter uppercase italic group-data-[collapsible=icon]:hidden">
                        CI/CD Platform
                    </span>
                </div>
            </SidebarHeader>
            <SidebarContent className="bg-background pt-4">
                <NavMain items={menuToDisplay} />
            </SidebarContent>
            <SidebarFooter className="border-t-2 border-border p-4 space-y-4 bg-background">
                <div className="flex items-center justify-around group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:gap-4 border-2 border-border py-2 rounded-xl">
                    <ThemeChanger />
                    <LanguageChanger />
                </div>
                <div className="border-2 border-border rounded-xl p-1">
                    <NavUser user={authUser} />
                </div>
            </SidebarFooter>
        </Sidebar>
    );
}