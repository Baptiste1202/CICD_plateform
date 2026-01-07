import { axiosConfig } from "@/config/axiosConfig";
import { useState } from "react";
import { toast } from "sonner";
import { getColumns } from "./columns";
import { DataTable } from "@/components/customs/dataTable";
import { useTranslation } from "react-i18next";

export const Builds = () => {
  const [builds, setBuilds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [buildCount, setBuildCount] = useState(0);

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

  function callback(action: string, data: any) {
    // No actions implemented for now
    console.log(action, data);
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
      </div>

      <div className="rounded-xl border-2 border-border bg-card overflow-hidden">
        <DataTable
          columns={getColumns(t)}
          data={builds}
          isLoading={loading}
          dataCount={buildCount}
          fetchData={fetchAllBuilds}
          searchElement="projectName"
          callback={callback}
        />
      </div>
    </div>
  );
};