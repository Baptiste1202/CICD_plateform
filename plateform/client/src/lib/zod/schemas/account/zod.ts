import { z } from "zod";

export const getUpdateAccountSchema = (t: (key: string) => string) =>
    z.object({
        username: z
            .string()
            .min(2, { message: t("pages.account.errors.username_min") })
            .max(25, { message: t("pages.account.errors.username_max") })
            .regex(/^[^A-Z\s]+$/, { message: t("pages.account.errors.username_no_spaces") }),
    });

export const getDeleteAccountSchema = (t: (key: string) => string) =>
    z.object({
        checkApproval: z.boolean().refine((val) => val === true, {
            message: t("pages.account.errors.check_approval"),
        }),
    });