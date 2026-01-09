import { axiosConfig } from "@/config/axiosConfig";
import { useState } from "react";
import { toast } from "sonner";
import { getColumns } from "./columns";
import { DataTable } from "@/components/customs/dataTable";
import { useTranslation } from "react-i18next";
import {Hammer} from "lucide-react";

export const Builds = () => {
  const [builds, setBuilds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [buildCount, setBuildCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 5 });

  const { t } = useTranslation();

  async function fetchAllBuilds(page: number = pagination.pageIndex, size: number = pagination.pageSize, search: string = searchTerm) {
    setLoading(true);
    setPagination({ pageIndex: page, pageSize: size });

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
      toast.loading(t("pages.admin.build_page.redeploying") || "Redéploiement...");
      await axiosConfig.post(`/deploy/redeploy/${build._id}`);
      toast.dismiss();
      toast.success(t("pages.admin.build_page.redeploy_success"));
      fetchAllBuilds(pagination.pageIndex, pagination.pageSize, searchTerm);
    } catch (error: any) {
      toast.dismiss();
      toast.error(t(error.response?.data?.error || "Error"));
    }
  }

  async function handleDelete(build: any) {
    if (!confirm(t("pages.admin.build_page.confirm_delete"))) return;

    try {
      await axiosConfig.delete(`/builds/${build._id}`);
      toast.success(t("pages.admin.build_page.delete_success"));

      // Calcul : si on supprime le dernier élément de la page 3, on doit passer à la page 2
      const isLastItemOnPage = builds.length === 1 && pagination.pageIndex > 0;
      const newPage = isLastItemOnPage ? pagination.pageIndex - 1 : pagination.pageIndex;

      // 1. On met à jour l'objet de pagination immédiatement
      const updatedPagination = { ...pagination, pageIndex: newPage };
      setPagination(updatedPagination);

      // 2. On appelle le fetch avec ces valeurs exactes
      fetchAllBuilds(updatedPagination.pageIndex, updatedPagination.pageSize, searchTerm);

    } catch (error: any) {
      toast.error(t(error.response?.data?.error || "Error"));
    }
  }

  function callback(action: string, data: any) {
    if (action === "redeploy") handleRedeploy(data);
    else if (action === "delete") handleDelete(data);
  }

  return (
      <div className="flex flex-1 flex-col gap-8 p-8 bg-background">
        <div className="flex items-center justify-between border-b-2 border-border pb-6">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-black uppercase tracking-tight italic">
                {t("pages.admin.builds")}
              </h1>
              <Hammer className="w-6 h-6 text-primary" />
            </div>
            <p className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em] mt-1">
              {t("pages.admin.build_page.subtitle") || "Manage your project deployments"}
            </p>
          </div>
        </div>
        <div className="rounded-xl border-2 border-border bg-card overflow-hidden transition-all">
          <DataTable
              columns={getColumns(t, callback)}
              data={builds}
              isLoading={loading}
              dataCount={buildCount}
              fetchData={fetchAllBuilds}
              pageIndex={pagination.pageIndex}
              pageSize={pagination.pageSize}
              onPaginationChange={setPagination}
              searchElement="globalSearch"
              callback={callback}
          />
        </div>
      </div>
  );
};