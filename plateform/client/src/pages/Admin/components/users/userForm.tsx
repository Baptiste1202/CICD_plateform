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
                <form onSubmit={updateForm.handleSubmit(onUpdateSubmit)} className="space-y-6">
                    <FormField
                        control={updateForm.control}
                        name="username"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t("pages.admin.users_page.form.username")}</FormLabel>
                                <FormControl><Input {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={updateForm.control}
                        name="role"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t("pages.admin.users_page.form.role")}</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="user">{t("pages.admin.users_page.form.user")}</SelectItem>
                                        <SelectItem value="admin">{t("pages.admin.users_page.form.admin")}</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormDescription>Le rôle définit les permissions d'accès au dashboard.</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button type="submit" className="w-full bg-accent" disabled={loading}>
                        {t("pages.admin.users_page.form.update")}
                    </Button>
                </form>
            </Form>
        );
    }

    if (action === "delete") {
        return (
            <Form {...deleteForm}>
                <form onSubmit={deleteForm.handleSubmit(onDeleteSubmit)} className="space-y-6">
                    <FormField
                        control={deleteForm.control}
                        name="confirmDelete"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-destructive">Action irréversible</FormLabel>
                                <FormControl><Input placeholder='Tapez "delete" pour confirmer' {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button type="submit" variant="destructive" className="w-full" disabled={loading}>
                        {t("pages.admin.users_page.form.delete")}
                    </Button>
                </form>
            </Form>
        );
    }
    return null;
};