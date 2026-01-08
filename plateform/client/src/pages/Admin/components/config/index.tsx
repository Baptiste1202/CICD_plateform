import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { axiosConfig } from "@/config/axiosConfig";
import { toast } from "sonner";
import { useConfigContext } from "@/contexts/configContext";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useTranslation } from "react-i18next";
import { Loading } from "@/components/customs/loading";
import ColorPicker from "@/components/customs/forms/colorPicker";

const configurationFormSchema = z.object({
    APP_NAME: z.string().trim(),
    ACCENT_COLOR: z.string().trim(),
});

type ConfigurationFormValues = z.infer<typeof configurationFormSchema>;

export const Config = () => {
    const { configValues, getConfigValue, updateConfigValues } = useConfigContext();
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const { t } = useTranslation();

    const form = useForm<ConfigurationFormValues>({
        resolver: zodResolver(configurationFormSchema),
        defaultValues: configValues,
    });

    useEffect(() => {
        const fetchConfigValues = async () => {
            const values = await getConfigValue(["APP_NAME", "ACCENT_COLOR"]);
            if (!form.formState.isDirty) {
                form.reset(values);
            }
            setIsLoading(false);
        };
        fetchConfigValues();
    }, [getConfigValue, form]);

    const onSubmit = async (values: ConfigurationFormValues) => {
        const keys = Object.keys(values);

        try {
            const response = await axiosConfig.put("/config", {
                keys,
                config: values
            });
            updateConfigValues(values);
            toast.success(t(`server.admin.messages.${response.data.message}`));
        } catch (error: any) {
            toast.error(t(error.response?.data?.error || "Error"));
        }
    };

    if (isLoading) return <Loading />;

    return (
        <div className="container px-4 mx-auto py-8">
            <Card className="p-8 rounded-2xl border-2 border-border bg-card shadow-none">
                <div className="mb-8 border-b-2 border-border pb-6">
                    <CardTitle className="text-3xl font-black uppercase tracking-tight italic">
                        {t("pages.admin.config_page.title")}
                    </CardTitle>
                    <CardDescription className="mt-2 text-muted-foreground font-medium uppercase text-[10px] tracking-[0.2em]">
                        {t("pages.admin.config_page.description")}
                    </CardDescription>
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">

                        <FormField
                            control={form.control}
                            name="APP_NAME"
                            render={({ field }) => (
                                <FormItem className="space-y-4">
                                    <FormLabel className="text-xs font-black uppercase tracking-widest">
                                        {t("pages.admin.config_page.app_name") || "Nom de l'application"}
                                    </FormLabel>
                                    <FormControl>
                                        <input
                                            {...field}
                                            className="flex h-12 w-full rounded-xl border-2 border-border bg-background px-4 py-2 text-sm font-bold shadow-none transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-transparent"
                                            placeholder="Ex: MY CUSTOM CI/CD"
                                        />
                                    </FormControl>
                                    <FormMessage className="font-bold text-destructive" />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="ACCENT_COLOR"
                            render={({ field }) => (
                                <FormItem className="space-y-4">
                                    <FormLabel className="text-xs font-black uppercase tracking-widest">
                                        {t("pages.admin.config_page.accent_color")}
                                    </FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <ColorPicker {...field} />
                                        </div>
                                    </FormControl>
                                    <FormDescription className="text-[10px] font-medium italic opacity-70 uppercase tracking-tight">
                                        {t("pages.admin.config_page.accent_color_description")}
                                    </FormDescription>
                                    <FormMessage className="font-bold text-destructive" />
                                </FormItem>
                            )}
                        />

                        <div className="pt-4 border-t border-border/50">
                            <Button
                                type="submit"
                                className="w-full sm:w-auto h-12 px-10 rounded-xl bg-primary text-primary-foreground hover:opacity-90 font-black uppercase tracking-[0.2em] text-[11px] transition-all active:scale-95 shadow-[0_5px_15px_rgba(var(--primary),0.2)]"
                            >
                                {t("global.buttons.save")}
                            </Button>
                        </div>
                    </form>
                </Form>
            </Card>
        </div>
    );
};