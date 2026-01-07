import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/pages/Admin/sidebar/app-sidebar";
import { useAuthContext } from "@/contexts/authContext";
import { Separator } from "@/components/ui/separator";

interface LayoutWrapperProps {
    withLayout?: boolean;
}

export const LayoutWrapper = ({ withLayout = true }: LayoutWrapperProps) => {
    const { authUser } = useAuthContext();

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

            <SidebarInset className="bg-slate-50/50 dark:bg-transparent">
                <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 bg-background transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
                    <div className="flex items-center gap-2 px-4">
                        <SidebarTrigger className="-ml-1" />
                        <Separator orientation="vertical" className="mr-2 h-4" />
                        <h1 className="text-sm font-semibold tracking-tight uppercase text-muted-foreground">
                            {authUser.role === 'admin' ? "Console Administration" : "Espace Projet"}
                        </h1>
                    </div>
                </header>

                {/* Le contenu de tes pages (Home, Account, Admin, etc.) */}
                <main className="flex flex-1 flex-col gap-4 p-4 pt-0 overflow-y-auto">
                    <div className="min-h-[100vh] flex-1 rounded-xl md:min-h-min p-4">
                        <Outlet />
                    </div>
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
};