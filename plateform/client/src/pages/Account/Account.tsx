import React, { useState } from "react";
import { Loading } from "@/components/customs/loading";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAuthContext } from "@/contexts/authContext";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { zodResolver } from "@hookform/resolvers/zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { getUpdateAccountSchema } from "@/lib/zod/schemas/account/zod";
import { toast } from "sonner";
import { axiosConfig } from "@/config/axiosConfig";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { InputFile } from "@/components/customs/forms/inputFile";
import { Dialog } from "@/components/ui/dialog";
import { EllipsisVertical, Trash } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DeleteAccountForm } from "./components/deleteAccountForm";
import { useTranslation } from "react-i18next";

export const Account = () => {
    const { authUser, setAuthUser, loading } = useAuthContext();
    const { t } = useTranslation();

    const [updateLoading, setUpdateLoading] = useState(false);
    const [openDeleteAccountDialog, setOpenDeleteAccountDialog] = useState(false);

    const updateAccountSchema = getUpdateAccountSchema(t);

    const updateForm = useForm<z.infer<typeof updateAccountSchema>>({
        resolver: zodResolver(updateAccountSchema),
        defaultValues: {
            name: authUser?.name || "",
            forename: authUser?.forename || "",
            username: authUser?.username || "",
        },
    });

    const onUpdateSubmit: SubmitHandler<z.infer<typeof updateAccountSchema>> = async (values) => {
        try {
            setUpdateLoading(true);
            const response = await axiosConfig.put(`/users/${authUser?._id}`, values);
            toast.success(t(response.data.message));
            setAuthUser(response.data.user);
        } catch (error: any) {
            toast.error(t(error.response?.data?.error || "Error"));
        } finally {
            setUpdateLoading(false);
        }
    };

    const updateProfilePic = async (e: React.ChangeEvent<HTMLInputElement>) => {
        setUpdateLoading(true);
        const file = e.target.files?.[0];

        if (!file) return setUpdateLoading(false);

        if (!file.type.includes("image")) {
            toast.error(t("pages.account.errors.invalid_file_type"));
            setUpdateLoading(false);
            return;
        }

        const formData = new FormData();
        formData.append("avatar", file);

        try {
            const response = await axiosConfig.post(`/uploads/avatar/${authUser?._id}`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            toast.success(t(response.data.message));
            setAuthUser(response.data.user);
        } catch (error: any) {
            toast.error(t(error.response?.data?.error));
        } finally {
            setUpdateLoading(false);
        }
    };

    return loading ? (
        <Loading />
    ) : (
        <div className="flex justify-center p-8">
            <Card className="w-full max-w-4xl shadow-xl rounded-2xl border-none bg-white dark:bg-slate-950">
                <CardHeader className="flex flex-row items-center justify-between border-b pb-6">
                    <div>
                        <CardTitle className="text-2xl font-bold">{t("pages.account.account_settings_title")}</CardTitle>
                        <CardDescription>{t("pages.account.account_settings_description")}</CardDescription>
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <EllipsisVertical className="w-5 h-5" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>{t("pages.account.actions")}</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive focus:bg-destructive/10" onClick={() => setOpenDeleteAccountDialog(true)}>
                                <Trash className="w-4 h-4 mr-2" />
                                {t("pages.account.delete_account")}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </CardHeader>

                <CardContent className="pt-8">
                    <div className="flex flex-col items-center gap-6 mb-10">
                        <Avatar className="w-32 h-32 border-4 border-primary/10 shadow-lg">
                            <AvatarImage src={authUser?.avatar} className="object-cover" />
                        </Avatar>
                        <InputFile buttonText={t("pages.account.choose_image")} id="profile-picture" disabled={updateLoading} onChange={updateProfilePic} />
                    </div>

                    <Form {...updateForm}>
                        <form onSubmit={updateForm.handleSubmit(onUpdateSubmit)} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={updateForm.control}
                                    name="forename"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t("pages.account.forename_label")}</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={updateForm.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t("pages.account.name_label")}</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={updateForm.control}
                                name="username"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t("pages.account.username_label")}</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <CardFooter className="px-0">
                                <Button type="submit" disabled={updateLoading} className="w-full mt-4">
                                    {updateLoading && <Loading className="w-4 h-4 mr-2" />}
                                    {t("global.buttons.update")}
                                </Button>
                            </CardFooter>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            <Dialog open={openDeleteAccountDialog} onOpenChange={setOpenDeleteAccountDialog}>
                <DeleteAccountForm setOpen={setOpenDeleteAccountDialog} />
            </Dialog>
        </div>
    );
};