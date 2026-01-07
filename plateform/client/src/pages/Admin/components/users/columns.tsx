import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Copy, EllipsisVertical, Pencil, Trash } from "lucide-react";
import { toast } from "sonner";
import { UserInterface } from "@/interfaces/User";
import { Badge } from "@/components/ui/badge";
import { TFunction } from "i18next";
import { UserRoleBadge } from "@/components/customs/tables/userRoleBadge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const getColumns = (callback: (action: string, data: any) => void, t: TFunction<"translation">): ColumnDef<UserInterface>[] => [
  {
    accessorKey: "user",
    header: t("pages.admin.users_page.user"),
    cell: ({ row }) => {
      const user = row.original;
      return (
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9 border">
              <AvatarImage src={user.avatar} alt={user.username} />
              <AvatarFallback>{user.username.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
            <span className="font-medium text-sm leading-none mb-1">
              {user.fullname || `${user.forename} ${user.name}`}
            </span>
              <span className="text-xs text-muted-foreground">@{user.username}</span>
            </div>
          </div>
      );
    },
  },
  {
    accessorKey: "role",
    header: ({ column }) => (
        <Button variant="ghost" className="font-bold px-0 hover:bg-transparent" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          {t("pages.admin.users_page.role")} <ArrowUpDown className="w-4 h-4 ml-2" />
        </Button>
    ),
    cell: ({ row }) => <UserRoleBadge role={row.getValue("role") as any} />,
  },
  {
    accessorKey: "email",
    header: t("pages.admin.users_page.email"),
    cell: ({ row }) => <div className="text-sm">{row.getValue("email")}</div>,
  },
  {
    accessorKey: "createdAt",
    header: t("pages.admin.users_page.joined"),
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"));
      return <div className="text-sm text-muted-foreground">{format(date, "dd/MM/yyyy")}</div>;
    },
  },
  {
    id: "actions",
    header: t("pages.admin.users_page.actions"),
    cell: ({ row }) => {
      const user = row.original;
      return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-8 h-8 p-0">
                <EllipsisVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => {
                navigator.clipboard.writeText(user._id);
                toast.success(t("pages.admin.users_page.copy_id_success"));
              }}>
                <Copy className="w-4 h-4 mr-2" /> {t("pages.admin.users_page.copy_id")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => callback("update", user._id)}>
                <Pencil className="w-4 h-4 mr-2" /> {t("pages.admin.users_page.update_user")}
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => callback("delete", user._id)}>
                <Trash className="w-4 h-4 mr-2" /> {t("pages.admin.users_page.delete_user")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
      );
    },
  },
];