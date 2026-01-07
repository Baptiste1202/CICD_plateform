import { axiosConfig } from "@/config/axiosConfig";
import { useState } from "react";
import { toast } from "sonner";
import { getColumns } from "./columns";
import { DataTable } from "@/components/customs/dataTable";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { CreateBuildDialog } from "./createBuildDialog";

export const Builds = () => {
  const [builds, setBuilds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [buildCount, setBuildCount] = useState(0);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const { t } = useTranslation();

  async function fetchAllBuilds(page: number = 0, size: number = 10) {
    setLoading(true);
    try {
      const response = await axiosConfig.get("/builds?page=" + page + "&size=" + size);
      setBuilds(response.data.builds);
      setBuildCount(response.data.count);
    } catch (error: any) {
      toast.error(t(error.response?.data?.error || "Error fetching builds"));
    } finally {
      setLoading(false);
    }
  }

  async function createBuild(projectName: string, image: string) {
    try {
      const response = await axiosConfig.post("/builds", { projectName, image });
      toast.success(t("global.messages.success_create"));
      fetchAllBuilds();
      setIsCreateDialogOpen(false);
    } catch (error: any) {
      toast.error(t(error.response?.data?.error || "Error creating build"));
    }
  }

  async function restartBuild(buildId: string) {
    try {
      await axiosConfig.post(`/builds/restart/${buildId}`);
      toast.success(t("global.messages.success_restart"));
      fetchAllBuilds();
    } catch (error: any) {
      toast.error(t(error.response?.data?.error || "Error restarting build"));
    }
  }

  function callback(action: string, data: any) {
    switch (action) {
      case "restart":
        restartBuild(data._id || data.id);
        break;
      default:
        break;
    }
  }

  return (
      <div className="flex flex-1 flex-col gap-8 p-8 bg-background">
        <div className="flex items-center justify-between border-b-2 border-border pb-6">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tight">
              {t("pages.admin.builds")}
            </h1>
            <p className="text-muted-foreground text-sm font-medium">
              {t("pages.admin.build_page.subtitle") || "Manage your project deployments"}
            </p>
          </div>

          <Button
              onClick={() => setIsCreateDialogOpen(true)}
              className="rounded-full bg-foreground text-background hover:bg-foreground/90 font-bold px-6 shadow-sm transition-all active:scale-95"
          >
            <Plus className="w-5 h-5 mr-2 stroke-[3px]" />
            {t("pages.admin.build_page.create_build")}
          </Button>
        </div>

        <div className="rounded-xl border-2 border-border bg-card overflow-hidden">
          <DataTable
              columns={getColumns(t)}
              data={builds}
              isLoading={loading}
              dataCount={buildCount}
              fetchData={fetchAllBuilds}
              callback={callback}
              searchElement="projectName"
          />
        </div>

        <CreateBuildDialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
            onCreate={createBuild}
        />
      </div>
  );
};