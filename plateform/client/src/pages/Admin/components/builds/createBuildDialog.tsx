import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

interface CreateBuildDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (projectName: string, image: string) => void;
}

export const CreateBuildDialog = ({ open, onOpenChange, onCreate }: CreateBuildDialogProps) => {
  const [projectName, setProjectName] = useState("");
  const [image, setImage] = useState("");
  const { t } = useTranslation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (projectName && image) {
      onCreate(projectName, image);
      setProjectName("");
      setImage("");
    }
  };

  return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px] border-2 border-border bg-background rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold tracking-tight">
              {t("pages.admin.build_page.create_build")}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {t("pages.admin.build_page.create_build_description")}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <div className="grid gap-6 py-6">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="projectName" className="text-right font-semibold text-sm">
                  {t("pages.admin.build_page.project_name")}
                </Label>
                <Input
                    id="projectName"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    className="col-span-3 rounded-md border-2 border-border focus-visible:ring-foreground transition-all"
                    placeholder={t("pages.admin.build_page.project_name_placeholder") || "Project X"}
                    required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="image" className="text-right font-semibold text-sm">
                  {t("pages.admin.build_page.image")}
                </Label>
                <Input
                    id="image"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    className="col-span-3 rounded-md border-2 border-border focus-visible:ring-foreground transition-all font-mono text-xs"
                    placeholder="e.g., node:18-alpine"
                    required
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                  type="submit"
                  className="w-full sm:w-auto bg-foreground text-background hover:bg-foreground/90 font-bold px-8 rounded-md transition-all active:scale-95"
              >
                {t("global.buttons.save")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
  );
};