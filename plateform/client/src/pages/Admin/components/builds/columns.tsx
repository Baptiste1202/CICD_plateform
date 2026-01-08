import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, RotateCw, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { TFunction } from "i18next";
import { AvatarWithStatusCell } from "@/components/customs/tables/avatarStatusCell";
import { BuildInterface } from "@/interfaces/Build";
import { cn } from "@/lib/utils";

export const getColumns = (t: TFunction<"translation">, callback: (action: string, data: any) => void): ColumnDef<BuildInterface>[] => [
    {
        accessorKey: "projectName",
        header: ({ column }) => (
            <Button
                variant="ghost"
                className="font-bold px-0 hover:bg-transparent"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
                {t("pages.admin.build_page.project_name")}
                <ArrowUpDown className="w-4 h-4 ml-2" />
            </Button>
        ),
        cell: ({ row }) => <span className="font-medium">{row.getValue("projectName")}</span>,
    },
    {
        accessorKey: "user",
        accessorFn: (row) => `${row.user?.forename} ${row.user?.name} ${row.user?.username}`,
        header: ({ column }) => (
            <Button
                variant="ghost"
                className="font-bold px-0 hover:bg-transparent"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
                {t("pages.admin.log_page.user")}
                <ArrowUpDown className="w-4 h-4 ml-2" />
            </Button>
        ),
        cell: ({ row }) => {
            const user = row.original.user;
            if (!user) {
                return <span className="italic text-muted-foreground opacity-50 text-sm"> {t("pages.admin.log_page.unknow_user")}</span>;
            }
            return (
                <div className="flex items-center gap-3">
                    <AvatarWithStatusCell user={user} />
                    <div className="flex flex-col">
                        <span className="font-bold text-sm tracking-tight leading-none">
                            {user.forename} {user.name}
                        </span>
                        <span className="text-[10px] font-mono text-muted-foreground">{user.username}</span>
                    </div>
                </div>
            );
        },
    },
    {
        accessorKey: "status",
        header: ({ column }) => (
            <Button
                variant="ghost"
                className="font-bold px-0 hover:bg-transparent"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
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
        header: ({ column }) => (
            <Button
                variant="ghost"
                className="font-bold px-0 hover:bg-transparent"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
                {t("pages.admin.build_page.image")}
                <ArrowUpDown className="w-4 h-4 ml-2" />
            </Button>
        ),
        cell: ({ row }) => <span className="text-sm text-muted-foreground font-mono">{row.getValue("image")}</span>,
    },
    {
        accessorKey: "createdAt",
        header: ({ column }) => (
            <Button
                variant="ghost"
                className="font-bold px-0 hover:bg-transparent"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
                {t("pages.admin.log_page.date") || "Date"}
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
        header: () => <div className="text-right font-bold">{t("pages.admin.build_page.actions") || "Actions"}</div>,
        cell: ({ row }) => {
            const build = row.original;
            return (
                <div className="flex justify-end gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => callback("redeploy", build)}
                        disabled={build.status === "running"}
                        className="gap-1 h-8"
                    >
                        <RotateCw className="w-3 h-3" />
                        {t("pages.admin.build_page.redeploy") || "Redéployer"}
                    </Button>
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => callback("delete", build)}
                        className="gap-1h-8 w-8 p-0"
                    >
                        <Trash2 className="w-3 h-3" />
                    </Button>
                </div>
            );
        },
    },
    {
        id: "globalSearch",
        accessorFn: (row) => `${row.projectName} ${row.image} ${row.user?.forename} ${row.user?.name} ${row.user?.username}`,
        header: "",
        cell: () => null,
        enableHiding: true,
    },
];