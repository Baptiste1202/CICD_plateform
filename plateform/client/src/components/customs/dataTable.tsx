import {
    ColumnDef,
    ColumnFiltersState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    SortingState,
    useReactTable,
    VisibilityState,
} from "@tanstack/react-table";
import { useEffect, useState } from "react";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
    DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EllipsisVertical, Plus, RefreshCw, Trash } from "lucide-react";
import { Input } from "../ui/input";
import { DialogHeader, DialogFooter, Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    dataCount: number;
    fetchData: (pageIndex: number, pageSize: number) => void;
    isLoading: boolean;
    callback: (action: string, data: any) => void;
    searchElement: string;
    actions?: string[];
    // Props obligatoires pour que Builds.tsx fonctionne
    pageIndex: number;
    pageSize: number;
    onPaginationChange: (pagination: { pageIndex: number; pageSize: number }) => void;
}

export function DataTable<TData, TValue>({
                                             columns,
                                             data,
                                             dataCount,
                                             fetchData,
                                             isLoading,
                                             callback,
                                             searchElement,
                                             actions = [],
                                             pageIndex,          // Ajouté ici
                                             pageSize,           // Ajouté ici
                                             onPaginationChange, // Ajouté ici
                                         }: DataTableProps<TData, TValue>) {
    const [openModal, setOpenModal] = useState(false);
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

    const { t } = useTranslation();

    // On fetch les données quand la pagination change côté parent
    useEffect(() => {
        fetchData(pageIndex, pageSize);
    }, [pageIndex, pageSize]);

    const table = useReactTable({
        data,
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getFilteredRowModel: getFilteredRowModel(),
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            pagination: { pageIndex, pageSize },
        },
        manualPagination: true,
        pageCount: Math.ceil(dataCount / pageSize),
    });

    return (
        <div className="overflow-hidden border rounded-md">
            <div className="flex flex-col p-4 gap-4 md:flex-row md:items-center md:justify-between">
                <div className="w-full md:flex md:flex-row md:items-center md:justify-start md:gap-4">
                    <Input
                        placeholder={t(`components.dataTable.filters.${searchElement}`)}
                        value={(table.getColumn(searchElement)?.getFilterValue() as string) ?? ""}
                        onChange={(event) => table.getColumn(searchElement)?.setFilterValue(event.target.value)}
                        className="w-full md:w-auto md:max-w-xs"
                    />

                    <div className="hidden md:flex md:items-center md:gap-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline">{t("components.dataTable.columns")}</Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                {table
                                    .getAllColumns()
                                    .filter((column) => column.getCanHide())
                                    .map((column) => (
                                        <DropdownMenuCheckboxItem
                                            key={column.id}
                                            checked={column.getIsVisible()}
                                            onCheckedChange={(value) => column.toggleVisibility(!!value)}
                                        >
                                            {t(`components.dataTable.columns_list.${column.id}`)}
                                        </DropdownMenuCheckboxItem>
                                    ))}
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <Button variant="outline" onClick={() => fetchData(pageIndex, pageSize)} disabled={isLoading}>
                            <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
                        </Button>
                    </div>
                </div>

                {/* VERSION MOBILE / TABLETTE RECTIFIÉE */}
                <div className="flex justify-center items-center gap-2 md:hidden flex-wrap">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline">{t("components.dataTable.columns")}</Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {table
                                .getAllColumns()
                                .filter((column) => column.getCanHide())
                                .map((column) => (
                                    <DropdownMenuCheckboxItem
                                        key={column.id}
                                        className="capitalize"
                                        checked={column.getIsVisible()}
                                        onCheckedChange={(value) => column.toggleVisibility(!!value)}
                                    >
                                        {t(`components.dataTable.columns_list.${column.id}`)}
                                    </DropdownMenuCheckboxItem>
                                ))}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <Button variant="outline" onClick={() => fetchData(pageIndex, pageSize)} disabled={isLoading}>
                        <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
                    </Button>

                    {actions.length !== 0 && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline">
                                    <EllipsisVertical />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                {actions.includes("create") && (
                                    <DropdownMenuItem className="flex gap-4" onClick={() => callback("create", null)}>
                                        <Plus className="w-4 h-4" />
                                        <span>{t("components.dataTable.create_entity")}</span>
                                    </DropdownMenuItem>
                                )}
                                {actions.includes("deleteAll") && (
                                    <DropdownMenuItem className="flex gap-4 text-destructive" onClick={() => setOpenModal(true)}>
                                        <Trash className="w-4 h-4" />
                                        <span>{t("components.dataTable.delete_entity")}</span>
                                    </DropdownMenuItem>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>
            </div>

            <Separator />

            <div className="overflow-x-auto relative border-b">
                <div className="h-[35vh] overflow-y-auto scrollbar-thin">
                    <Table>
                        <TableHeader className={cn(pageSize > 5 && "sticky top-0 bg-background z-20 shadow-sm")}>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => (
                                        <TableHead key={header.id} className="font-extrabold text-left bg-background">
                                            {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody className="relative">
                            {isLoading ? (
                                <>
                                    <tr className="absolute top-0 left-0 z-10 w-full h-1 overflow-hidden">
                                        <td colSpan={columns.length} className="p-0">
                                            <div className="w-full h-full bg-primary animate-pulse" />
                                        </td>
                                    </tr>
                                    {Array.from({ length: pageSize }).map((_, idx) => (
                                        <TableRow key={`loading-row-${idx}`} className="animate-pulse">
                                            {table.getAllLeafColumns().map((column) => (
                                                <TableCell key={column.id}>
                                                    <div className="w-3/4 h-8 rounded bg-muted" />
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    ))}
                                </>
                            ) : table.getRowModel().rows.length > 0 ? (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow key={row.id}>
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={columns.length} className="h-24 text-center">
                                        <div className="text-muted-foreground">{t("components.dataTable.no_data")}</div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            <Separator />

            <div className="flex flex-col items-center justify-between gap-4 p-4 md:flex-row">
                <div className="text-sm">
                    {t("components.dataTable.footer.page")} <strong>{pageIndex + 1}</strong>{" "}
                    {t("components.dataTable.footer.of")} <strong>{table.getPageCount()}</strong> • {dataCount}{" "}
                    {t("components.dataTable.footer.total")} {t("components.dataTable.footer.entries")}
                </div>
                <div className="flex flex-col items-center sm:flex-row sm:items-start gap-4">
                    <div className="flex items-center space-x-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onPaginationChange({ pageIndex: 0, pageSize })}
                            disabled={pageIndex === 0}
                        >
                            {t("components.dataTable.footer.first")}
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onPaginationChange({ pageIndex: pageIndex - 1, pageSize })}
                            disabled={pageIndex === 0}
                        >
                            {t("components.dataTable.footer.previous")}
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onPaginationChange({ pageIndex: pageIndex + 1, pageSize })}
                            disabled={(pageIndex + 1) * pageSize >= dataCount}
                        >
                            {t("components.dataTable.footer.next")}
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                                onPaginationChange({
                                    pageSize,
                                    pageIndex: Math.max(0, Math.ceil(dataCount / pageSize) - 1),
                                })
                            }
                            disabled={(pageIndex + 1) * pageSize >= dataCount}
                        >
                            {t("components.dataTable.footer.last")}
                        </Button>
                    </div>
                    <Select
                        value={String(pageSize)}
                        onValueChange={(value) => {
                            const newSize = value === "all" ? dataCount : Number(value);
                            onPaginationChange({
                                pageSize: newSize,
                                pageIndex: 0,
                            });
                        }}
                    >
                        <SelectTrigger className="w-36">
                            <SelectValue placeholder="Rows">
                                {pageSize === dataCount
                                    ? `${t("components.dataTable.footer.all")}`
                                    : pageSize + ` ${t("components.dataTable.footer.per_page")}`}
                            </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                            {[5, 10, 25, 50].map((size) => (
                                <SelectItem key={size} value={String(size)}>
                                    {size} {t("components.dataTable.footer.per_page")}
                                </SelectItem>
                            ))}
                            <SelectItem value="all"> {t("components.dataTable.footer.all")}</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {openModal && (
                <Dialog open={openModal} onOpenChange={setOpenModal}>
                    <DialogContent className="sm:max-w-[450px]">
                        <DialogHeader>
                            <DialogTitle>{t("components.dataTable.delete_title")}</DialogTitle>
                            <DialogDescription>{t("components.dataTable.delete_description")}</DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setOpenModal(false)}>
                                {t("global.buttons.cancel")}
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={() => {
                                    callback("deleteAll", null);
                                    setOpenModal(false);
                                }}
                            >
                                {t("global.buttons.delete")}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
}