import React, { useState } from "react";
import { Loading } from "@/components/customs/loading";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAuthContext } from "@/contexts/authContext";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { getUpdateAccountSchema } from "@/lib/zod/schemas/account/zod";
import { toast } from "sonner";
import { axiosConfig } from "@/config/axiosConfig";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Dialog } from "@/components/ui/dialog";
import { Trash, UserIcon} from "lucide-react";
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
        defaultValues: { username: authUser?.username || "" },
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

    if (loading) return <Loading />;

    return (
        <div className="flex flex-1 flex-col gap-8 p-8 bg-background max-h-screen">
            {/* HEADER TECHNIQUE */}
            <div className="flex items-center justify-between border-b-2 border-border pb-6">
                <div>
                    <h1 className="text-3xl font-black uppercase tracking-tight italic flex items-center gap-3">
                        {t("pages.account.account_settings_title")}
                        <span className="text-primary opacity-50">/</span>
                        <span className="text-sm not-italic font-mono text-muted-foreground">ID_{authUser?._id.slice(-6)}</span>
                    </h1>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex flex-col items-end">
                        <span className="text-[10px] font-black uppercase tracking-widest text-primary">Auth Method</span>
                        <span className="text-xs font-bold font-mono">{authUser?.auth_type}</span>
                    </div>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setOpenDeleteAccountDialog(true)}
                        className="rounded-xl border-2 border-border hover:border-destructive hover:text-destructive transition-all"
                    >
                        <Trash className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-6xl">
                <div className="lg:col-span-4 space-y-6">
                    <div className="rounded-2xl border-2 border-border bg-card p-8 flex flex-col items-center text-center">
                        <div className="relative mb-6">
                            <Avatar className="w-32 h-32 border-4 border-primary shadow-[0_0_30px_rgba(var(--primary),0.15)]">
                                <AvatarImage src={authUser?.avatar} className="object-cover" />
                            </Avatar>
                            <div className="absolute -bottom-2 right-0 left-0 flex justify-center">
                                <span className="bg-primary text-primary-foreground text-[10px] font-black px-3 py-1 rounded-full border-2 border-background uppercase tracking-tighter">
                                    {authUser?.role}
                                </span>
                            </div>
                        </div>
                        <h2 className="text-xl font-black uppercase tracking-tight mb-1">{authUser?.forename} {authUser?.name}</h2>
                        <p className="text-xs font-bold text-muted-foreground font-mono">{authUser?.email}</p>
                    </div>

                    <div className="rounded-2xl border-2 border-border bg-muted/20 p-6 space-y-4">
                        <div className="flex justify-between items-center border-b border-border pb-2">
                            <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Metadata</span>
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        </div>
                        <div className="space-y-4">
                            <div>
                                <p className="text-[9px] font-black uppercase text-primary">Created At</p>
                                <p className="text-sm font-bold">{new Date(authUser?.createdAt || "").toLocaleDateString()}</p>
                            </div>
                            <div>
                                <p className="text-[9px] font-black uppercase text-primary">Account Status</p>
                                <p className="text-sm font-bold italic">Synchronized via Google</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-8">
                    <div className="rounded-2xl border-2 border-border bg-card p-8 h-full">
                        <div className="mb-8">
                            <h3 className="text-lg font-black uppercase italic tracking-tight">Modification du profil</h3>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Les informations synchronisées ne peuvent pas être modifiées ici.</p>
                        </div>

                        <Form {...updateForm}>
                            <form onSubmit={updateForm.handleSubmit(onUpdateSubmit)} className="space-y-8">
                                <FormField
                                    control={updateForm.control}
                                    name="username"
                                    render={({ field }) => (
                                        <FormItem className="max-w-md">
                                            <FormLabel className="text-xs font-black uppercase tracking-[0.2em] text-primary italic">
                                                {t("pages.account.username_label")}
                                            </FormLabel>
                                            <FormControl>
                                                <div className="relative group">
                                                    <Input
                                                        {...field}
                                                        className="h-14 rounded-xl border-2 border-border bg-background px-4 font-black text-lg transition-all focus:ring-primary focus:border-transparent group-hover:border-primary/50"
                                                    />
                                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-20">
                                                        <UserIcon className="w-5 h-5" />
                                                    </div>
                                                </div>
                                            </FormControl>
                                            <FormMessage className="font-bold text-destructive text-[10px] uppercase" />
                                        </FormItem>
                                    )}
                                />

                                <div className="pt-8 border-t-2 border-border mt-auto">
                                    <Button
                                        type="submit"
                                        disabled={updateLoading}
                                        className="h-12 px-12 rounded-xl bg-primary text-primary-foreground font-black uppercase tracking-[0.2em] text-[11px] shadow-[0_5px_15px_rgba(var(--primary),0.3)] transition-all active:scale-95 disabled:opacity-50"
                                    >
                                        {updateLoading ? <Loading className="w-4 h-4 mr-2" /> : t("global.buttons.update")}
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    </div>
                </div>
            </div>

            <Dialog open={openDeleteAccountDialog} onOpenChange={setOpenDeleteAccountDialog}>
                <DeleteAccountForm setOpen={setOpenDeleteAccountDialog} />
            </Dialog>
        </div>
    );
};