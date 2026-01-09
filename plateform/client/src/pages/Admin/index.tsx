import { Outlet, useLocation, Link } from "react-router-dom";
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import React from "react";
import { useTranslation } from "react-i18next";

export const Index = () => {
    const { t } = useTranslation();
    const location = useLocation();

    const pathSegments = location.pathname.split("/").filter(Boolean);
    const filteredSegments = pathSegments.filter(segment => segment.toLowerCase() !== "dashboard");

    return (
        <div className="flex flex-col gap-4 p-4 min-h-full bg-background transition-colors duration-500">
            <div className="px-4 py-2 border-2 border-border rounded-xl bg-card/30 w-fit shrink-0 hover:border-primary/30 transition-colors duration-300">
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <Link
                                to="/dashboard"
                                className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-colors"
                            >
                                {t("pages.admin.dashboard") || "DASHBOARD"}
                            </Link>
                        </BreadcrumbItem>

                        {filteredSegments.map((segment, index) => {
                            const href = "/" + pathSegments.slice(0, pathSegments.indexOf(segment) + 1).join("/");
                            const isLast = index === filteredSegments.length - 1;

                            return (
                                <React.Fragment key={href}>
                                    <BreadcrumbSeparator className="opacity-30 text-muted-foreground" />
                                    <BreadcrumbItem>
                                        {isLast ? (
                                            <BreadcrumbPage className="text-[9px] font-black uppercase tracking-[0.2em] text-primary italic">
                                                {t(`pages.admin.${segment}`) || segment.toUpperCase()}
                                            </BreadcrumbPage>
                                        ) : (
                                            <Link
                                                to={href}
                                                className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-colors"
                                            >
                                                {t(`pages.admin.${segment}`) || segment.toUpperCase()}
                                            </Link>
                                        )}
                                    </BreadcrumbItem>
                                </React.Fragment>
                            );
                        })}
                    </BreadcrumbList>
                </Breadcrumb>
            </div>

            <div className="flex-1 min-h-0 overflow-hidden rounded-xl">
                <Outlet />
            </div>
        </div>
    );
};