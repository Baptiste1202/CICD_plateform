import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, EllipsisVertical, RotateCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { TFunction } from "i18next";

interface BuildInterface {
  _id: string;
  projectName: string;
  status: string;
  image: string;
  createdAt: string;
  user: any;
}

export const getColumns = (t: TFunction<"translation">): ColumnDef<BuildInterface>[] => [
  {
    accessorKey: "projectName",
    header: ({ column }) => (
      <Button variant="ghost" className="font-bold" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        {t("pages.admin.builds.project_name")}
        <ArrowUpDown className="w-4 h-4 ml-2" />
      </Button>
    ),
    cell: ({ row }) => {
      const value = row.getValue("projectName");
      return <span className="font-medium">{value as string}</span>;
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <Button variant="ghost" className="font-bold" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        {t("pages.admin.builds.status")}
        <ArrowUpDown className="w-4 h-4 ml-2" />
      </Button>
    ),
    cell: ({ row }) => {
      const value = row.getValue("status") as string;
      let variant: "default" | "secondary" | "destructive" | "outline" = "default";
      switch (value) {
        case "pending":
          variant = "secondary";
          break;
        case "running":
          variant = "default";
          break;
        case "success":
          variant = "outline";
          break;
        case "failed":
          variant = "destructive";
          break;
      }
      return <Badge variant={variant}>{t(`pages.admin.builds.status_${value}`)}</Badge>;
    },
  },
  {
    accessorKey: "image",
    header: t("pages.admin.builds.image"),
    cell: ({ row }) => {
      const value = row.getValue("image");
      return <span className="text-sm text-muted-foreground">{value as string}</span>;
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <Button variant="ghost" className="font-bold" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        {t("pages.admin.builds.created_at")}
        <ArrowUpDown className="w-4 h-4 ml-2" />
      </Button>
    ),
    cell: ({ row }) => {
      const value = row.getValue("createdAt") as string;
      return <span>{format(new Date(value), "dd/MM/yyyy HH:mm")}</span>;
    },
  },
  {
    id: "actions",
    header: t("pages.admin.builds.actions"),
    cell: ({ row }) => {
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
            <DropdownMenuItem onClick={() => row.table.options.meta?.callback("restart", build)}>
              <RotateCcw className="w-4 h-4 mr-2" />
              {t("pages.admin.builds.restart")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];