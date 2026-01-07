import { Outlet, useLocation, Link } from "react-router-dom";
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import React from "react";
import { useTranslation } from "react-i18next";

export const Index = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const pathSegments = location.pathname.split("/").filter(Boolean);

  return (
      <div className="flex flex-col gap-4">
        <Breadcrumb className="mb-4">
          <BreadcrumbList>
            <BreadcrumbItem>
              <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
                {t("pages.admin.home")}
              </Link>
            </BreadcrumbItem>
            {pathSegments.map((segment, index) => {
              const href = "/" + pathSegments.slice(0, index + 1).join("/");
              const isLast = index === pathSegments.length - 1;

              return (
                  <React.Fragment key={href}>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      {isLast ? (
                          <BreadcrumbPage>{t(`pages.admin.${segment}`)}</BreadcrumbPage>
                      ) : (
                          <Link to={href} className="text-sm text-muted-foreground hover:text-foreground">
                            {t(`pages.admin.${segment}`)}
                          </Link>
                      )}
                    </BreadcrumbItem>
                  </React.Fragment>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex-1">
          <Outlet />
        </div>
      </div>
  );
};