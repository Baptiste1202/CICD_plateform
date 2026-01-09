import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { LevelBadge } from "@/components/customs/tables/levelBadge";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowUpDown } from "lucide-react";
import { AvatarWithStatusCell } from "@/components/customs/tables/avatarStatusCell";
import { LogInterface } from "@/interfaces/Log";
import { TFunction } from "i18next";

export const getColumns = (t: TFunction<"translation">): ColumnDef<LogInterface | any>[] => [
    {
        accessorKey: "level",
        header: ({ column }) => (
            <Button
                variant="ghost"
                className="font-bold px-2 -ml-2 hover:bg-primary hover:text-primary-foreground transition-all duration-200"
                onClick={(e) => {
                    e.stopPropagation();
                    column.toggleSorting(column.getIsSorted() === "asc");
                }}
            >
                {t("pages.admin.log_page.level")}
                <ArrowUpDown className="w-4 h-4 ml-2" />
            </Button>
        ),
        cell: ({ row }) => {
            const type = row.original.type;
            const value = row.getValue("level");
            if (type === 'build') {
                return (
                    <Badge variant="outline" className="border-primary/50 text-primary uppercase text-[10px] font-black">
                        Pipeline
                    </Badge>
                );
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
                        <span className="font-bold tracking-tight">{user.forename}</span>
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
                className="font-bold px-2 -ml-2 hover:bg-primary hover:text-primary-foreground transition-all"
                onClick={(e) => {
                    e.stopPropagation();
                    column.toggleSorting(column.getIsSorted() === "asc");
                }}
            >
                {t("pages.admin.log_page.message")}
                <ArrowUpDown className="w-4 h-4 ml-2" />
            </Button>
        ),
        cell: ({ row }) => {
            const type = row.original.type;
            if (type === 'build') {
                return (
                    <div className="max-w-[500px] truncate font-medium flex items-center gap-2">
                        <span className="font-bold">{row.original.projectName}</span>
                        <span className="text-muted-foreground text-xs">({row.original.image})</span>
                    </div>
                );
            }
            return <div className="max-w-[500px] truncate font-medium">{row.getValue("message")}</div>;
        },
    },
    {
        accessorKey: "createdAt",
        header: ({ column }) => (
            <Button
                variant="ghost"
                className="font-bold px-2 -ml-2 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
                onClick={(e) => {
                    e.stopPropagation();
                    column.toggleSorting(column.getIsSorted() === "asc");
                }}
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
];