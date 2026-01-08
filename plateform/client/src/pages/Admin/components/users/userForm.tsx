import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { axiosConfig } from "@/config/axiosConfig";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { UserInterface } from "@/interfaces/User";
import { useTranslation } from "react-i18next";
import { getUpdateUserSchema, getDeleteUserSchema } from "@/lib/zod/schemas/admin/zod";
import { cn } from "@/lib/utils";

interface UserFormProps {
    dialog: (isOpen: boolean) => void;
    refresh: () => void;
    action: string;
    user?: UserInterface;
}

export const UserForm = ({ dialog, refresh, action, user }: UserFormProps) => {
    const [loading, setLoading] = useState(false);
    const { t } = useTranslation();

    const updateSchema = getUpdateUserSchema(t);
    const deleteSchema = getDeleteUserSchema(t);

    const updateForm = useForm<z.infer<typeof updateSchema>>({
        resolver: zodResolver(updateSchema),
        defaultValues: {
            username: user?.username || "",
            role: user?.role || "user",
        },
    });

    const deleteForm = useForm<z.infer<typeof deleteSchema>>({
        resolver: zodResolver(deleteSchema),
        defaultValues: { confirmDelete: "" },
    });

    const onUpdateSubmit = async (values: z.infer<typeof updateSchema>) => {
        try {
            setLoading(true);
            const response = await axiosConfig.put(`/users/${user?._id}`, values);
            toast.success(t(response.data.message));
            dialog(false);
            refresh();
        } catch (error: any) {
            toast.error(t(error.response?.data?.error || "Error"));
        } finally {
            setLoading(false);
        }
    };

    const onDeleteSubmit = async (values: z.infer<typeof deleteSchema>) => {
        if (values.confirmDelete.toLowerCase() === "delete") {
            try {
                setLoading(true);
                await axiosConfig.delete(`/users/${user?._id}`);
                toast.success(t("pages.admin.users_page.delete_success"));
                dialog(false);
                refresh();
            } catch (error: any) {
                toast.error(t(error.response?.data?.error || "Error"));
            } finally {
                setLoading(false);
            }
        }
    };

    if (action === "update") {
        return (
            <Form {...updateForm}>
                <form onSubmit={updateForm.handleSubmit(onUpdateSubmit)} className="space-y-6 pt-4">
                    <FormField
                        control={updateForm.control}
                        name="username"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="font-black uppercase tracking-widest text-[10px]">
                                    {t("pages.admin.users_page.form.username")}
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        {...field}
                                        className="border-2 border-border focus-visible:ring-primary focus-visible:border-transparent rounded-xl font-mono font-bold"
                                    />
                                </FormControl>
                                <FormMessage className="text-xs font-bold text-destructive" />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={updateForm.control}
                        name="role"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="font-black uppercase tracking-widest text-[10px]">
                                    {t("pages.admin.users_page.form.role")}
                                </FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger className="border-2 border-border focus:ring-primary rounded-xl font-bold">
                                            <SelectValue />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent className="border-2 border-border rounded-xl">
                                        <SelectItem value="user" className="font-bold focus:bg-primary focus:text-primary-foreground cursor-pointer">
                                            {t("pages.admin.users_page.form.user")}
                                        </SelectItem>
                                        <SelectItem value="admin" className="font-bold focus:bg-primary focus:text-primary-foreground cursor-pointer">
                                            {t("pages.admin.users_page.form.admin")}
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormDescription className="text-[10px] italic leading-tight opacity-70">
                                    {t("pages.admin.users_page.form.role_description")}
                                </FormDescription>
                                <FormMessage className="text-xs font-bold text-destructive" />
                            </FormItem>
                        )}
                    />
                    <Button
                        type="submit"
                        className="w-full bg-primary text-primary-foreground hover:opacity-90 font-black uppercase tracking-widest py-6 rounded-xl transition-all active:scale-95 shadow-[0_10px_20px_rgba(var(--primary),0.2)]"
                        disabled={loading}
                    >
                        {loading ? <span className="animate-pulse">...</span> : t("pages.admin.users_page.form.update")}
                    </Button>
                </form>
            </Form>
        );
    }

    if (action === "delete") {
        return (
            <Form {...deleteForm}>
                <form onSubmit={deleteForm.handleSubmit(onDeleteSubmit)} className="space-y-6 pt-4">
                    <FormField
                        control={deleteForm.control}
                        name="confirmDelete"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="font-black uppercase tracking-widest text-[10px] text-destructive">
                                    {t("pages.admin.users_page.form.danger_zone") || "Action irréversible"}
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder='Type "delete"'
                                        {...field}
                                        className="border-2 border-destructive/20 focus-visible:ring-destructive rounded-xl font-mono font-bold text-destructive"
                                    />
                                </FormControl>
                                <FormDescription className="text-[10px] font-bold">
                                    {t("Confirmation requise")}
                                </FormDescription>
                                <FormMessage className="text-xs font-bold" />
                            </FormItem>
                        )}
                    />
                    <Button
                        type="submit"
                        variant="destructive"
                        className="w-full font-black uppercase tracking-widest py-6 rounded-xl transition-all active:scale-95"
                        disabled={loading}
                    >
                        {t("pages.admin.users_page.form.delete")}
                    </Button>
                </form>
            </Form>
        );
    }
    return null;
};