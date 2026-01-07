import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, EllipsisVertical, RotateCcw } from "lucide-react";
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
  {
    id: "actions",
    header: t("pages.admin.build_page.actions"),
    cell: ({ row, table }) => {
      const build = row.original;

      return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-8 w-8 p-0 rounded-full border-border hover:bg-black hover:text-white transition-colors">
                <EllipsisVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl border-2 border-border bg-card">
              <DropdownMenuItem
                  className="font-bold cursor-pointer focus:bg-black focus:text-white dark:focus:bg-white dark:focus:text-black"
                  onClick={() => (table.options.meta as any)?.callback("restart", build)}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                {t("pages.admin.build_page.restart")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
      );
    },
  },
];