import * as React from "react";
import {NotebookText, UsersIcon, Cog, LayoutDashboard, Box, User, Settings, Hammer} from "lucide-react";
import { NavMain } from "./nav-main";
import { NavUser } from "./nav-user";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader } from "@/components/ui/sidebar";
import { useAuthContext } from "@/contexts/authContext";
import { useNavigate } from "react-router-dom";
import { LanguageChanger } from "@/components/Sidebar/languageChanger";
import { ThemeChanger } from "@/components/Sidebar/themeChanger";
import { useTranslation } from "react-i18next";
import { useConfigContext } from "@/contexts/configContext";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const { authUser } = useAuthContext();
    const navigate = useNavigate();
    const { t } = useTranslation();

    const { configValues, getConfigValue } = useConfigContext();

    React.useEffect(() => {
        getConfigValue(["APP_NAME", "ACCENT_COLOR"]);
    }, [getConfigValue]);

    const adminMenus = [
        { title: t("pages.admin.dashboard").toUpperCase(), icon: LayoutDashboard, url: "/dashboard" },
        { title: t("pages.admin.users").toUpperCase(), icon: UsersIcon, url: "/users" },
        { title: t("pages.admin.logs").toUpperCase(), icon: NotebookText, url: "/logs" },
        { title: t("pages.admin.builds").toUpperCase(), icon: Hammer, url: "/builds" },
        { title: t("pages.admin.settings").toUpperCase(), icon: Settings, url: "/settings" },
    ];

    const userMenus = [
        { title: t("pages.admin.dashboard").toUpperCase(), icon: LayoutDashboard, url: "/dashboard" },
        { title: t("pages.admin.logs").toUpperCase(), icon: NotebookText, url: "/logs" },
        { title: t("navbar.account").toUpperCase(), icon: User, url: "/account" },
    ];

    const menuToDisplay = authUser?.role === "admin" ? adminMenus : userMenus;

    return (
        <Sidebar collapsible="icon" className="border-r-2 border-border shadow-none" {...props}>
            <SidebarHeader
                className="border-b-2 border-border h-16 flex items-center justify-center cursor-pointer hover:bg-muted/30 transition-all duration-300"
                onClick={() => navigate("/dashboard")}
            >
                <div className="flex items-center gap-3 px-2 group-data-[collapsible=icon]:justify-center">
                    <div className="bg-primary text-primary-foreground p-1.5 rounded-lg border-2 border-primary shadow-[0_0_10px_rgba(var(--primary),0.3)] transition-all duration-500">
                        <Box className="w-5 h-5" />
                    </div>
                    <span className="font-black text-sm tracking-tighter uppercase italic group-data-[collapsible=icon]:hidden whitespace-nowrap">
                        {configValues["APP_NAME"] || "CI/CD PLATFORM"}
                    </span>
                </div>
            </SidebarHeader>

            <SidebarContent className="bg-background pt-4 px-2">
                <NavMain items={menuToDisplay} />
            </SidebarContent>

            <SidebarFooter className="border-t-2 border-border p-4 space-y-4 bg-background group-data-[collapsible=icon]:p-2 transition-all duration-300">
                <div className="flex items-center justify-around border-2 border-border py-2 rounded-xl bg-muted/10 group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:border-0 group-data-[collapsible=icon]:py-0 group-data-[collapsible=icon]:gap-4">
                    <ThemeChanger />
                    <LanguageChanger />
                </div>

                <div className="border-2 border-border rounded-xl p-1 hover:border-primary transition-colors duration-300 group-data-[collapsible=icon]:border-0 group-data-[collapsible=icon]:p-0">
                    <NavUser user={authUser} />
                </div>
            </SidebarFooter>
        </Sidebar>
    );
}
