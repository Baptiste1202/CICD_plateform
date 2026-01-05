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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t("pages.admin.builds.create_build")}</DialogTitle>
          <DialogDescription>
            {t("pages.admin.builds.create_build_description")}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="projectName" className="text-right">
                {t("pages.admin.builds.project_name")}
              </Label>
              <Input
                id="projectName"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="image" className="text-right">
                {t("pages.admin.builds.image")}
              </Label>
              <Input
                id="image"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                className="col-span-3"
                placeholder="e.g., node:18-alpine"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">{t("pages.admin.builds.create")}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};