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
import { cn } from "@/lib/utils";

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
        const finalValues = { ...values, APP_NAME: configValues.APP_NAME };
        const keys = Object.keys(finalValues);

        try {
            const response = await axiosConfig.put("/config", {
                keys,
                config: finalValues
            });
            updateConfigValues(finalValues);
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
                    <CardTitle className="text-3xl font-black uppercase tracking-tight">
                        {t("pages.admin.config_page.title")}
                    </CardTitle>
                    <CardDescription className="mt-2 text-muted-foreground font-medium">
                        {t("pages.admin.config_page.description")}
                    </CardDescription>
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
                        <FormField
                            control={form.control}
                            name="ACCENT_COLOR"
                            render={({ field }) => (
                                <FormItem className="space-y-4">
                                    <FormLabel className="text-sm font-black uppercase tracking-widest">
                                        {t("pages.admin.config_page.accent_color")}
                                    </FormLabel>
                                    <FormControl>
                                        <div className="p-4 border-2 border-dashed border-border rounded-xl bg-muted/20">
                                            <ColorPicker {...field} />
                                        </div>
                                    </FormControl>
                                    <FormDescription className="text-xs font-medium italic">
                                        {t("pages.admin.config_page.accent_color_description")}
                                    </FormDescription>
                                    <FormMessage className="font-bold" />
                                </FormItem>
                            )}
                        />

                        <div className="pt-4">
                            <Button
                                type="submit"
                                className="w-full sm:w-auto h-12 px-10 rounded-md bg-foreground text-background hover:opacity-90 font-bold uppercase tracking-widest transition-all active:scale-95"
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