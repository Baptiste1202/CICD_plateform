import { Outlet, useLocation, Link } from "react-router-dom";
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import React from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

export const Index = () => {
    const { t } = useTranslation();
    const location = useLocation();
    const pathSegments = location.pathname.split("/").filter(Boolean);

    return (
        <div className="flex flex-col gap-4 p-4 min-h-full bg-background transition-colors duration-500">
            <div className="px-4 py-2 border-2 border-border rounded-xl bg-card/30 w-fit shrink-0 hover:border-primary/30 transition-colors duration-300">
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <Link
                                to="/"
                                className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-colors"
                            >
                                {t("pages.admin.home") || "ACCUEIL"}
                            </Link>
                        </BreadcrumbItem>

                        {pathSegments.map((segment, index) => {
                            const href = "/" + pathSegments.slice(0, index + 1).join("/");
                            const isLast = index === pathSegments.length - 1;

                            return (
                                <React.Fragment key={href}>
                                    <BreadcrumbSeparator className="opacity-30 text-muted-foreground" />
                                    <BreadcrumbItem>
                                        {isLast ? (
                                            <BreadcrumbPage className="text-[9px] font-black uppercase tracking-[0.2em] text-primary italic">
                                                {t(`pages.admin.${segment}`)}
                                            </BreadcrumbPage>
                                        ) : (
                                            <Link
                                                to={href}
                                                className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-colors"
                                            >
                                                {t(`pages.admin.${segment}`)}
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