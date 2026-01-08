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
  const [searchTerm, setSearchTerm] = useState("");

  const { t } = useTranslation();

  async function fetchAllBuilds(page: number = 0, size: number = 5, search: string = "") {
    setLoading(true);
    try {
      const response = await axiosConfig.get(`/builds?page=${page}&size=${size}&search=${search}`);

      setBuilds(response.data.builds);
      setBuildCount(response.data.count);
    } catch (error: any) {
      toast.error(t(error.response?.data?.error || "Error fetching builds"));
    } finally {
      setLoading(false);
    }
  }

  async function handleRedeploy(build: any) {
    try {
      toast.loading(t("pages.admin.build_page.redeploying") || "Redéploiement en cours...");
      await axiosConfig.post(`/deploy/redeploy/${build._id}`);
      toast.success(t("pages.admin.build_page.redeploy_success") || "Redéploiement lancé avec succès");
      fetchAllBuilds(0, 5, searchTerm);
    } catch (error: any) {
      toast.error(t(error.response?.data?.error || "Error redeploying build"));
    }
  }

  async function handleDelete(build: any) {
    if (!confirm(t("pages.admin.build_page.confirm_delete") || "Voulez-vous vraiment supprimer ce build ?")) {
      return;
    }
    try {
      await axiosConfig.delete(`/builds/${build._id}`);
      toast.success(t("pages.admin.build_page.delete_success") || "Build supprimé avec succès");
      fetchAllBuilds(0, 5, searchTerm);
    } catch (error: any) {
      toast.error(t(error.response?.data?.error || "Error deleting build"));
    }
  }

  function callback(action: string, data: any) {
    if (action === "redeploy") {
      handleRedeploy(data);
    } else if (action === "delete") {
      handleDelete(data);
    }
  }

  return (
      <div className="flex flex-1 flex-col gap-8 p-8 bg-background">
        <div className="flex items-center justify-between border-b-2 border-border pb-6">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tight">
              {t("pages.admin.builds")}
            </h1>
            <p className="text-muted-foreground text-sm font-medium italic">
              {t("pages.admin.build_page.subtitle") || "Manage your project deployments"}
            </p>
          </div>
        </div>

        <div className="rounded-xl border-2 border-border bg-card overflow-hidden shadow-none transition-all">
          <DataTable
              columns={getColumns(t, callback)}
              data={builds}
              isLoading={loading}
              dataCount={buildCount}
              fetchData={fetchAllBuilds}
              searchElement="globalSearch"
              callback={callback}
          />
        </div>
      </div>
  );
};