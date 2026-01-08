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
    header: () => <span className="font-bold text-xs uppercase tracking-widest">{t("pages.admin.users_page.user")}</span>,
    cell: ({ row }) => {
      const user = row.original;
      return (
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9 border-2 border-border shadow-sm">
              <AvatarImage src={user.avatar} alt={user.username} />
              <AvatarFallback className="bg-muted font-black text-[10px] uppercase">
                {user.username.substring(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="font-bold text-sm tracking-tight leading-none mb-1">
                {user.forename} {user.name}
              </span>
              <span className="text-[10px] font-mono text-muted-foreground tracking-tighter italic">
                @{user.username}
              </span>
            </div>
          </div>
      );
    },
  },
  {
    accessorKey: "role",
    header: ({ column }) => (
        <Button
            variant="ghost"
            className="font-bold px-2 -ml-2 hover:bg-primary hover:text-primary-foreground transition-all duration-200 uppercase text-[11px] tracking-tight"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {t("pages.admin.users_page.role")} <ArrowUpDown className="w-4 h-4 ml-2" />
        </Button>
    ),
    cell: ({ row }) => <UserRoleBadge role={row.getValue("role") as any} />,
  },
  {
    accessorKey: "email",
    header: () => <span className="font-bold text-xs uppercase tracking-widest">{t("pages.admin.users_page.email")}</span>,
    cell: ({ row }) => <div className="text-sm font-medium italic opacity-80">{row.getValue("email")}</div>,
  },
  {
    accessorKey: "createdAt",
    header: () => <span className="font-bold text-xs uppercase tracking-widest">{t("pages.admin.users_page.joined")}</span>,
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"));
      return <div className="text-xs text-muted-foreground font-bold tracking-tighter">{format(date, "dd/MM/yyyy")}</div>;
    },
  },
  {
    id: "actions",
    header: () => <span className="font-bold text-xs uppercase tracking-widest">{t("pages.admin.users_page.actions")}</span>,
    cell: ({ row }) => {
      const user = row.original;
      return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-8 h-8 p-0 rounded-full border-border hover:border-primary hover:text-primary transition-all">
                <EllipsisVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl border-2 border-border bg-card p-2 shadow-xl">
              <DropdownMenuItem
                  className="font-bold cursor-pointer rounded-lg focus:bg-primary focus:text-primary-foreground transition-colors"
                  onClick={() => {
                    navigator.clipboard.writeText(user._id);
                    toast.success(t("pages.admin.users_page.copy_id_success"));
                  }}
              >
                <Copy className="w-4 h-4 mr-2" /> {t("pages.admin.users_page.copy_id")}
              </DropdownMenuItem>
              <DropdownMenuItem
                  className="font-bold cursor-pointer rounded-lg focus:bg-primary focus:text-primary-foreground transition-colors"
                  onClick={() => callback("update", user._id)}
              >
                <Pencil className="w-4 h-4 mr-2" /> {t("pages.admin.users_page.update_user")}
              </DropdownMenuItem>
              <DropdownMenuItem
                  className="text-destructive font-bold cursor-pointer rounded-lg focus:bg-destructive focus:text-destructive-foreground transition-colors"
                  onClick={() => callback("delete", user._id)}
              >
                <Trash className="w-4 h-4 mr-2" /> {t("pages.admin.users_page.delete_user")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
      );
    },
  },
];