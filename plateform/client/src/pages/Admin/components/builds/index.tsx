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

  const handleRedeploy = (build: any) => {
    toast(t("pages.admin.build_page.confirm_redeploy") || "Relancer ce déploiement ?", {
      description: `${build.projectName} - ${build.image}`,
      action: {
        label: t("common.confirm") || "Confirmer",
        onClick: async () => {
          const toastId = toast.loading(t("pages.admin.build_page.redeploying") || "Redéploiement...");
          try {
            await axiosConfig.post(`/deploy/redeploy/${build._id}`);
            toast.success(t("pages.admin.build_page.redeploy_success"), { id: toastId });
            fetchAllBuilds(pagination.pageIndex, pagination.pageSize, searchTerm);
          } catch (error: any) {
            toast.error(t(error.response?.data?.error || "Error"), { id: toastId });
          }
        },
      },
    });
  };

  const handleDelete = (build: any) => {
    toast(t("pages.admin.build_page.confirm_delete"), {
      description: t("pages.admin.build_page.delete_warning"),
      actionButtonStyle: {
        backgroundColor: '#ef4444',
        color: 'white'
      },
      action: {
        label: t("common.delete"),
        onClick: async () => {
          const toastId = toast.loading(t("common.deleting"));
          try {
            await axiosConfig.delete(`/builds/${build._id}`);
            toast.success(t("pages.admin.build_page.delete_success"), { id: toastId });
            fetchAllBuilds();
          } catch (error: any) {
            toast.error("Erreur", { id: toastId });
          }
        },
      },
      cancel: {
        label: t("common.cancel") || "Annuler",
        onClick: () => console.log("Suppression annulée")
      },
    });
  };

  function callback(action: string, data: any) {
    switch (action) {
      case "redeploy":
        handleRedeploy(data);
        break;
      case "delete":
        handleDelete(data);
        break;
      default:
        console.warn("Unknown action:", action);
    }
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
            <p className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em] mt-1 italic">
              {t("pages.admin.build_page.subtitle") || "Gestion et monitoring des builds serveurs"}
            </p>
          </div>
        </div>

        <div className="rounded-xl border-2 border-border bg-card overflow-hidden shadow-sm transition-all">
          <DataTable
              columns={getColumns(t, callback)}
              data={builds}
              isLoading={loading}
              dataCount={buildCount}
              fetchData={fetchAllBuilds}
              pageIndex={pagination.pageIndex}
              pageSize={pagination.pageSize}
              onPaginationChange={(newPagination) => {
                setPagination(newPagination);
              }}
              searchElement="globalSearch"
              callback={callback}
          />
        </div>
      </div>
  );
};