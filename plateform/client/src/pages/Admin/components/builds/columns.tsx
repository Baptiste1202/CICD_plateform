import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { TFunction } from "i18next";
import { BuildInterface } from "@/interfaces/Build";
import { cn } from "@/lib/utils";

export const getColumns = (t: TFunction<"translation">): ColumnDef<BuildInterface>[] => [
  {
    accessorKey: "projectName",
    header: ({ column }) => (
      <Button variant="ghost" className="font-bold px-0 hover:bg-transparent" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        {t("pages.admin.build_page.project_name")}
        <ArrowUpDown className="w-4 h-4 ml-2" />
      </Button>
    ),
    cell: ({ row }) => <span className="font-medium">{row.getValue("projectName")}</span>,
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <Button variant="ghost" className="font-bold px-0 hover:bg-transparent" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        {t("pages.admin.build_page.status")}
        <ArrowUpDown className="w-4 h-4 ml-2" />
      </Button>
    ),
    cell: ({ row }) => {
      const value = row.getValue("status") as string;
      const badgeStyles: Record<string, string> = {
        pending: "bg-muted text-muted-foreground border-none",
        running: "bg-black text-white dark:bg-white dark:text-black",
        success: "border-2 border-black dark:border-white bg-transparent text-foreground font-bold",
        failed: "bg-destructive text-destructive-foreground",
      };

      return (
        <Badge className={cn("rounded-md px-2 py-0.5 uppercase text-[10px] tracking-widest", badgeStyles[value])}>
          {t(`pages.admin.build_page.status_${value}`)}
        </Badge>
      );
    },
  },
  {
    accessorKey: "image",
    header: t("pages.admin.build_page.image"),
    cell: ({ row }) => <span className="text-sm text-muted-foreground font-mono">{row.getValue("image")}</span>,
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="font-bold px-2 -ml-2 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        {t("pages.admin.build_page.project_name")}
        <ArrowUpDown className="w-3 h-3 ml-2 opacity-50" />
      </Button>
    ),
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"));
      return <span className="text-muted-foreground">{format(date, "dd/MM/yyyy HH:mm")}</span>;
    },
  },
];