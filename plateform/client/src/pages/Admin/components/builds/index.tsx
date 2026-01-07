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
      toast.error(t(error.response.data.error));
    } finally {
      setLoading(false);
    }
  }

  async function createBuild(projectName: string, image: string) {
    try {
      const response = await axiosConfig.post("/builds", { projectName, image });
      toast.success("Build created successfully");
      fetchAllBuilds();
      setIsCreateDialogOpen(false);
    } catch (error: any) {
      toast.error(t(error.response.data.error));
    }
  }

  async function restartBuild(buildId: string) {
    try {
      const response = await axiosConfig.post(`/builds/restart/${buildId}`);
      toast.success("Build restarted successfully");
      fetchAllBuilds();
    } catch (error: any) {
      toast.error(t(error.response.data.error));
    }
  }

  function callback(action: string, data: any) {
    switch (action) {
      case "restart":
        restartBuild(data.id);
        break;
      default:
        break;
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t("pages.admin.builds")}</h1>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          {t("pages.admin.build_page.create_build")}
        </Button>
      </div>

      <DataTable
          columns={getColumns(t)}
          data={builds}
          isLoading={loading}
          dataCount={buildCount}
          fetchData={fetchAllBuilds}
          callback={callback}
          searchElement="projectName"
      />
      <CreateBuildDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onCreate={createBuild}
      />
    </div>
  );
};