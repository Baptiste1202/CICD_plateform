import { Button } from "@/components/ui/button";
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { axiosConfig } from "@/config/axiosConfig";
import { useAuthContext } from "@/contexts/authContext";
import { getDeleteAccountSchema } from "@/lib/zod/schemas/account/zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { Checkbox } from "@/components/ui/checkbox";
import { useTranslation } from "react-i18next";
import { Loading } from "@/components/customs/loading";

interface DeleteAccountProps {
  setOpen: (open: boolean) => void;
}

export const DeleteAccountForm = ({ setOpen }: DeleteAccountProps) => {
  const { setAuthUser } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const deleteAccountSchema = getDeleteAccountSchema(t);
  const deleteAccountForm = useForm<z.infer<typeof deleteAccountSchema>>({
    resolver: zodResolver(deleteAccountSchema),
    defaultValues: {
      checkApproval: false,
    },
  });

  const onDeleteAccountSubmit = async (values: z.infer<typeof deleteAccountSchema>) => {
    const { checkApproval, ...valuesToSend } = values;
    try {
      setLoading(true);
      const response = await axiosConfig.delete(`/users/delete/account`, { data: valuesToSend });
      toast.success(t(response.data.message));
      setAuthUser(null);
      navigate("/login");
      deleteAccountForm.reset();
    } catch (error: any) {
      toast.error(t(error.response.data.error));
    } finally {
      setLoading(false);
    }
  };

  return (
      <DialogContent className="sm:max-w-[525px] border-border">
        <Form {...deleteAccountForm}>
          <form onSubmit={deleteAccountForm.handleSubmit(onDeleteAccountSubmit)} className="space-y-6">
            <DialogHeader>
              <DialogTitle>{t("pages.account.delete_account_title")}</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                {t("pages.account.delete_account_description")}
              </DialogDescription>
            </DialogHeader>
            <FormField
                control={deleteAccountForm.control}
                name="checkApproval"
                render={({ field }) => (
                    <FormItem className="flex flex-col p-4 space-y-3 border border-border rounded-md shadow-none">
                      <div className="flex items-start space-x-3">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <div className="space-y-1">
                          <FormLabel className="cursor-pointer font-semibold">
                            {t("pages.account.accept_delete_account")}
                          </FormLabel>
                          <FormDescription>
                            {t("pages.account.accept_delete_account_description")}
                          </FormDescription>
                        </div>
                      </div>
                      <FormMessage />
                    </FormItem>
                )}
            />

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                  disabled={loading}
                  type="submit"
                  variant="destructive"
                  className="hover:opacity-90"
              >
                {loading ? <Loading className="w-4 h-4" /> : t("pages.account.delete_account_button")}
              </Button>

              <Button
                  variant="outline"
                  onClick={() => setOpen(false)}
                  type="button"
                  className="border-border hover:bg-accent hover:text-accent-foreground"
              >
                {t("global.buttons.cancel")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
  );
};
