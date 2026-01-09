import { axiosConfig } from "@/config/axiosConfig";
import { useState } from "react";
import { toast } from "sonner";
import { getColumns } from "./columns";
import { DataTable } from "@/components/customs/dataTable";
import { useTranslation } from "react-i18next";
import { useAuthContext } from "@/contexts/authContext";
import {NotebookText} from "lucide-react";

export const Logs = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const { authUser } = useAuthContext();
  const { t } = useTranslation();

  async function fetchData(page: number = 0, size: number = 10) {
    setLoading(true);
    try {
      const requests = [];

      if (authUser?.role === 'admin') {
        requests.push(axiosConfig.get(`/logs?page=${page}&size=${size}`));
      } else {
        requests.push(Promise.resolve({ data: { logs: [], count: 0 } }));
      }

      requests.push(axiosConfig.get(`/builds?page=${page}&size=${size}`));

      const [logsRes, buildsRes] = await Promise.all(requests);

      const logsFromApi = logsRes.data.logs || [];
      const buildsFromApi = buildsRes.data.builds || [];

      const typedLogs = logsFromApi.map((l: any) => ({ ...l, type: 'log' }));
      const typedBuilds = buildsFromApi.map((b: any) => ({
        ...b,
        type: 'build',
        level: 'info',
        message: `Build ${b.projectName}`
      }));

      let mergedData = [...typedLogs, ...typedBuilds];

      mergedData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      if (authUser?.role !== 'admin') {
        mergedData = mergedData.filter(item => item.type === 'build');
      }

      setData(mergedData);
      setTotalCount((logsRes.data.count || 0) + (buildsRes.data.count || 0));
    } catch (error: any) {
      toast.error(t(error.response?.data?.error || "Error fetching data"));
    } finally {
      setLoading(false);
    }
  }

  async function deleteAllLogs() {
    try {
      const response = await axiosConfig.delete(`/logs`);
      toast.success(t(response.data.message));
      fetchData();
    } catch (error: any) {
      toast.error(t(error.response?.data?.error || "Error clearing logs"));
    }
  }

  function callback(action: string) {
    if (action === "deleteAll") {
      deleteAllLogs();
    }
  }

  return (
      <div className="flex flex-1 flex-col gap-8 p-8 bg-background">
        <div className="flex items-center justify-between border-b-2 border-border pb-6">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-black uppercase tracking-tight italic">
                {t("pages.admin.logs")}
              </h1>
              <NotebookText className="w-6 h-6 text-primary" />
            </div>
            <p className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em] mt-1">
              {t("pages.admin.log_page.subtitle") || "System and Pipeline Activity Monitoring"}
            </p>
          </div>
        </div>

        <div className="rounded-xl border-2 border-border bg-card overflow-hidden shadow-none transition-all">
          <DataTable
              columns={getColumns(t)}
              data={data}
              dataCount={totalCount}
              fetchData={fetchData}
              isLoading={loading}
              callback={callback}
              searchElement="message"
              actions={authUser?.role === 'admin' ? ["deleteAll"] : []}
          />
        </div>
      </div>
  );
};