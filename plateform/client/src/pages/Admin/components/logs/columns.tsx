import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { LevelBadge } from "@/components/customs/tables/levelBadge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowUpDown, Copy, EllipsisVertical, Trash, Play, Settings } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { AvatarWithStatusCell } from "@/components/customs/tables/avatarStatusCell";
import { LogInterface } from "@/interfaces/Log";
import { TFunction } from "i18next";
import { cn } from "@/lib/utils";

export const getColumns = (deleteLog: (id: string) => void, t: TFunction<"translation">, role: string = 'user'): ColumnDef<LogInterface | any>[] => [
  {
    accessorKey: "level",
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="font-bold px-2 -ml-2 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        {t("pages.admin.log_page.level")}
        <ArrowUpDown className="w-4 h-4 ml-2" />
      </Button>
    ),
    cell: ({ row }) => {
      const type = row.original.type;
      const value = row.getValue("level");

      if (type === 'build') {
        return <Badge variant="outline" className="border-foreground/20">Pipeline</Badge>;
      }
      return <LevelBadge level={value as any} />;
    },
  },
  {
    accessorKey: "user",
    header: () => <span className="font-bold">{t("pages.admin.log_page.user")}</span>,
    cell: ({ row }) => {
      const user = row.original.user;
      if (!user) {
        return <span className="italic text-muted-foreground opacity-50"> {t("pages.admin.log_page.unknow_user")}</span>;
      }
      return (
        <div className="flex items-center gap-4">
          <AvatarWithStatusCell user={user} />
          <div className="flex flex-col">
            <span className="font-bold tracking-tight">
              {user.forename}
            </span>
            <span className="text-xs font-mono text-muted-foreground">{user.username}</span>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "message",
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="font-bold px-2 -ml-2 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        {t("pages.admin.log_page.message")}
        <ArrowUpDown className="w-4 h-4 ml-2" />
      </Button>
    ),
    cell: ({ row }) => {
      const type = row.original.type;
      if (type === 'build') {
        return <div className="max-w-[500px] truncate font-medium flex items-center gap-2">
          <span className="font-bold">{row.original.projectName}</span>
          <span className="text-muted-foreground text-xs">({row.original.image})</span>
        </div>
      }
      return <div className="max-w-[500px] truncate font-medium">{row.getValue("message")}</div>
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="font-bold px-2 -ml-2 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        {t("pages.admin.log_page.date")}
        <ArrowUpDown className="w-4 h-4 ml-2" />
      </Button>
    ),
    cell: ({ row }) => {
      const value = row.getValue("createdAt");
      const formatted = format(new Date(value as Date), "dd/MM/yyyy HH:mm");
      return <div className="text-muted-foreground text-sm font-medium">{formatted}</div>;
    },
  },
  {
    id: "actions",
    enableHiding: false,
    header: () => <span className="font-bold">{t("pages.admin.log_page.actions")}</span>,
    cell: ({ row }) => {
      const item = row.original;
      const type = item.type;

      if (type === 'build') {
        if (role === 'admin') {
          return (
            <Button asChild variant="outline" size="sm" className="h-8 border-border hover:bg-black hover:text-white transition-all">
              <Link to={`/pipeline/${item._id}`}>
                <Settings className="w-4 h-4 mr-2" />
                {t("Modifier")}
              </Link>
            </Button>
          );
        }
        return (
          <Button asChild variant="outline" size="sm" className="h-8 border-border hover:bg-black hover:text-white transition-all">
            <Link to={`/pipeline/${item._id}`}>
              <Play className="w-4 h-4 mr-2" />
              {t("Voir")}
            </Link>
          </Button>
        );
      }

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-8 h-8 p-0 rounded-full border-border hover:bg-black hover:text-white transition-all">
              <EllipsisVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="rounded-xl border-2 border-border bg-card">
            <DropdownMenuItem
              className="flex gap-4 font-bold cursor-pointer focus:bg-black focus:text-white dark:focus:bg-white dark:focus:text-black"
              onClick={() => {
                navigator.clipboard.writeText(item._id);
                toast.success(t("pages.admin.log_page.copy_id_success"));
              }}
            >
              <Copy className="w-4 h-4" /> {t("pages.admin.log_page.copy_id")}
            </DropdownMenuItem>
            {role === 'admin' && (
              <DropdownMenuItem
                className="flex gap-4 text-destructive font-bold cursor-pointer focus:bg-destructive focus:text-destructive-foreground"
                onClick={() => deleteLog(item._id)}
              >
                <Trash className="w-4 h-4 " />
                <span> {t("pages.admin.log_page.delete_log")}</span>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];