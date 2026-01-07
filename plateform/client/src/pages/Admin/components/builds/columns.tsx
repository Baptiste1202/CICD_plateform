import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, EllipsisVertical, RotateCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { TFunction } from "i18next";
import { BuildInterface } from "@/interfaces/Build";

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
      const variants: Record<string, "secondary" | "default" | "outline" | "destructive"> = {
        pending: "secondary",
        running: "default",
        success: "outline",
        failed: "destructive",
      };

      return (
          <Badge variant={variants[value] || "default"}>
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
        <Button variant="ghost" className="font-bold px-0 hover:bg-transparent" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          {t("pages.admin.build_page.created_at")}
          <ArrowUpDown className="w-4 h-4 ml-2" />
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
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <EllipsisVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => (table.options.meta as any)?.callback("restart", build)}>
                <RotateCcw className="w-4 h-4 mr-2" />
                {t("pages.admin.build_page.restart")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
      );
    },
  },
];