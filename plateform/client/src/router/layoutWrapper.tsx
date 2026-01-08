import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/pages/Admin/sidebar/app-sidebar";
import { useAuthContext } from "@/contexts/authContext";
import { Separator } from "@/components/ui/separator";
import { useTranslation } from "react-i18next";

interface LayoutWrapperProps {
    withLayout?: boolean;
}

export const LayoutWrapper = ({ withLayout = true }: LayoutWrapperProps) => {
    const { authUser } = useAuthContext();
    const { t } = useTranslation();

    if (!withLayout || !authUser) {
        return (
            <div className="min-h-screen w-full bg-background flex flex-col justify-center items-center">
                <Outlet />
            </div>
        );
    }

    return (
        <SidebarProvider>
            <AppSidebar />

            <SidebarInset className="bg-background">
                <header className="flex h-16 shrink-0 items-center gap-2 border-b-2 border-border px-6 bg-background/80 backdrop-blur-md sticky top-0 z-50 transition-all group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-14">
                    <div className="flex items-center gap-4 w-full">
                        {/* Trigger avec effet de survol primary */}
                        <SidebarTrigger className="-ml-1 hover:text-primary transition-colors duration-300" />

                        <Separator orientation="vertical" className="h-4 bg-border w-[2px]" />

                        <div className="flex flex-col">
                            <h1 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground italic">
                                {t("pages.layout.workspace") || "Console de pilotage"}
                            </h1>
                            <span className="text-[12px] font-bold tracking-tighter">
                                {authUser.forename} {authUser.name}
                            </span>
                        </div>

                    </div>
                </header>

                <main className="flex flex-1 flex-col overflow-y-auto">
                    <div className="flex-1 min-h-0">
                        <Outlet />
                    </div>
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
};