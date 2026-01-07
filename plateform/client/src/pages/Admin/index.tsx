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
        <div className="flex flex-col gap-4 p-4 min-h-full">
            <div className="px-4 py-2 border-2 border-border rounded-xl bg-card/30 w-fit shrink-0">
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <Link to="/" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors">
                                {t("pages.admin.home") || "ACCUEIL"}
                            </Link>
                        </BreadcrumbItem>
                        {pathSegments.map((segment, index) => {
                            const href = "/" + pathSegments.slice(0, index + 1).join("/");
                            const isLast = index === pathSegments.length - 1;

                            return (
                                <React.Fragment key={href}>
                                    <BreadcrumbSeparator className="opacity-20" />
                                    <BreadcrumbItem>
                                        {isLast ? (
                                            <BreadcrumbPage className="text-[10px] font-black uppercase tracking-widest text-foreground italic">
                                                {t(`pages.admin.${segment}`)}
                                            </BreadcrumbPage>
                                        ) : (
                                            <Link to={href} className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors">
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

            <div className="flex-1 min-h-0 overflow-hidden">
                <Outlet />
            </div>
        </div>
    );
};