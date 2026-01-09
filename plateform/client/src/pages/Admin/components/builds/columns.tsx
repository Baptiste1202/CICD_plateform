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
                className="font-bold px-0 hover:bg-transparent uppercase text-[11px] tracking-widest"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
                {t("pages.admin.build_page.project_name")}
                <ArrowUpDown className="w-4 h-4 ml-2" />
            </Button>
        ),
        cell: ({ row }) => (
            <div className="h-12 flex items-center">
                <span className="font-bold tracking-tighter italic">
                    {row.getValue("projectName")}
                </span>
            </div>
        ),
    },
    {
        accessorKey: "user",
        header: ({ column }) => (
            <Button
                variant="ghost"
                className="font-bold px-0 hover:bg-transparent uppercase text-[11px] tracking-widest"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
                {t("pages.admin.log_page.user")}
                <ArrowUpDown className="w-4 h-4 ml-2" />
            </Button>
        ),
        cell: ({ row }) => {
            const user = row.original.user;
            if (!user) {
                return (
                    <div className="h-12 flex items-center">
                        <span className="italic text-muted-foreground opacity-50 text-[10px] uppercase font-black">
                            {t("pages.admin.log_page.unknow_user")}
                        </span>
                    </div>
                );
            }
            return (
                <div className="flex items-center gap-3 h-12">
                    <AvatarWithStatusCell user={user} />
                    <div className="flex flex-col">
                        <span className="font-bold text-sm tracking-tight leading-none mb-1">
                            {user.forename} {user.name}
                        </span>
                        <span className="text-[10px] font-mono text-muted-foreground italic tracking-tighter">
                            @{user.username}
                        </span>
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
                className="font-bold px-0 hover:bg-transparent uppercase text-[11px] tracking-widest"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
                {t("pages.admin.build_page.status")}
                <ArrowUpDown className="w-4 h-4 ml-2" />
            </Button>
        ),
        cell: ({ row }) => {
            const value = row.getValue("status") as string;
            const isDeployed = row.original.isDeployed;

            const badgeStyles: Record<string, string> = {
                paused: "bg-muted text-muted-foreground border-none",
                running: "bg-primary text-primary-foreground animate-pulse shadow-[0_0_10px_rgba(var(--primary),0.2)]",
                success: "border-2 border-primary bg-transparent text-foreground font-black",
                failed: "bg-destructive text-destructive-foreground",
            };

            return (
                <div className="flex items-center gap-2 h-12">
                    <Badge className={cn("rounded-md px-2 py-0.5 uppercase text-[10px] tracking-widest transition-colors font-black", badgeStyles[value])}>
                        {t(`pages.admin.build_page.status_${value}`)}
                    </Badge>
                    {isDeployed && (
                        <Badge className="rounded-md px-2 py-0.5 uppercase text-[10px] tracking-widest bg-success text-success-foreground border-none font-black">
                            {t("pages.admin.build_page.deployed")}
                        </Badge>
                    )}
                </div>
            );
        },
    },
    {
        accessorKey: "image",
        header: ({ column }) => (
            <Button
                variant="ghost"
                className="font-bold px-0 hover:bg-transparent uppercase text-[11px] tracking-widest"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
                {t("pages.admin.build_page.image")}
                <ArrowUpDown className="w-4 h-4 ml-2" />
            </Button>
        ),
        cell: ({ row }) => (
            <div className="h-12 flex items-center">
                <span className="text-[10px] font-mono text-muted-foreground tracking-tighter bg-muted/50 px-2 py-1 rounded border border-border">
                    {row.getValue("image")}
                </span>
            </div>
        ),
    },
    {
        accessorKey: "createdAt",
        header: ({ column }) => (
            <Button
                variant="ghost"
                className="font-bold px-0 hover:bg-transparent uppercase text-[11px] tracking-widest"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
                {t("pages.admin.log_page.date")}
                <ArrowUpDown className="w-4 h-4 ml-2" />
            </Button>
        ),
        cell: ({ row }) => {
            const date = new Date(row.getValue("createdAt"));
            return (
                <div className="h-12 flex items-center">
                    <span className="text-muted-foreground font-black text-[10px] uppercase tracking-tighter">
                        {format(date, "dd/MM/yyyy HH:mm")}
                    </span>
                </div>
            );
        },
    },
    {
        id: "actions",
        header: () => (
            <div className="text-right font-bold uppercase text-[11px] tracking-widest pr-4">
                {t("pages.admin.build_page.actions")}
            </div>
        ),
        cell: ({ row }) => {
            const build = row.original;
            const isDeployed = build.isDeployed;
            const isRunning = build.status === "running";

            return (
                <div className="flex justify-end gap-2 h-12 items-center">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => callback("redeploy", build)}
                        disabled={isRunning || isDeployed}
                        className="gap-2 h-8 rounded-lg border-2 font-black uppercase text-[10px] tracking-tighter hover:bg-primary hover:text-primary-foreground transition-all"
                    >
                        <RotateCw className="w-3 h-3" />
                        {t("pages.admin.build_page.redeploy")}
                    </Button>
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => callback("delete", build)}
                        disabled={isDeployed}
                        className="h-8 w-8 p-0 flex justify-center items-center rounded-lg shadow-sm active:scale-90 transition-transform"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                </div>
            );
        },
    },
];