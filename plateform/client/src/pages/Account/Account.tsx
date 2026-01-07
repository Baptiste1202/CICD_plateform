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

    return loading ? (
        <Loading />
    ) : (
        <div className="flex justify-center p-8 bg-background">
            <Card className="w-full max-w-4xl rounded-2xl border border-border bg-card shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between border-b pb-6">
                    <div>
                        <CardTitle className="text-2xl font-bold tracking-tight">
                            {t("pages.account.account_settings_title")}
                        </CardTitle>
                        <CardDescription className="text-muted-foreground">
                            {t("pages.account.account_settings_description")}
                        </CardDescription>
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="outline"
                                size="icon"
                                className="rounded-full border-border hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all active:scale-95"
                            >
                                <EllipsisVertical className="w-5 h-5" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-xl border border-border">
                            <DropdownMenuLabel>{t("pages.account.actions")}</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                className="text-destructive focus:bg-destructive/10 cursor-pointer font-medium"
                                onClick={() => setOpenDeleteAccountDialog(true)}
                            >
                                <Trash className="w-4 h-4 mr-2" />
                                {t("pages.account.delete_account")}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </CardHeader>

                <CardContent className="pt-8">
                    <div className="flex flex-col items-center gap-4 mb-10">
                        <Avatar className="w-32 h-32 border border-border shadow-md">
                            <AvatarImage src={authUser?.avatar} className="object-cover" />
                        </Avatar>
                    </div>

                    <Form {...updateForm}>
                        <form onSubmit={updateForm.handleSubmit(onUpdateSubmit)} className="space-y-6">

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-foreground">{t("pages.account.forename_label")}</label>
                                    <Input
                                        value={(authUser as any)?.forename || ""}
                                        disabled
                                        className="rounded-md border border-border bg-muted/30 cursor-not-allowed"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-foreground">{t("pages.account.name_label")}</label>
                                    <Input
                                        value={(authUser as any)?.name || ""}
                                        disabled
                                        className="rounded-md border border-border bg-muted/30 cursor-not-allowed"
                                    />
                                </div>
                            </div>

                            <FormField
                                control={updateForm.control}
                                name="username"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-sm font-semibold">
                                            {t("pages.account.username_label")}
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                placeholder="Pseudo"
                                                className="rounded-md border border-border focus-visible:ring-1 focus-visible:ring-foreground"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <CardFooter className="px-0 pt-4">
                                <Button
                                    type="submit"
                                    disabled={updateLoading}
                                    className="w-full h-10 rounded-md bg-foreground text-background hover:opacity-90 transition-all font-bold"
                                >
                                    {updateLoading ? <Loading className="w-4 h-4 mr-2" /> : t("global.buttons.update")}
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