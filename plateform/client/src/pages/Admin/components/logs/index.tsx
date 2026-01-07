import { axiosConfig } from "@/config/axiosConfig";
import { useState } from "react";
import { toast } from "sonner";
import { getColumns } from "./columns";
import { DataTable } from "@/components/customs/dataTable";
import { useTranslation } from "react-i18next";

export const Logs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [logCount, setLogCount] = useState(0);

  const { t } = useTranslation();

  async function fetchAllLogs(page: number = 0, size: number = 10) {
    setLoading(true);
    try {
      const response = await axiosConfig.get("/logs?page=" + page + "&size=" + size);
      setLogs(response.data.logs);
      setLogCount(response.data.count);
    } catch (error: any) {
      toast.error(t(error.response?.data?.error || "Error fetching logs"));
    } finally {
      setLoading(false);
    }
  }

  async function deleteLog(logId: string) {
    try {
      const response = await axiosConfig.delete(`/logs/${logId}`);
      toast.success(t(response.data.message));
      fetchAllLogs();
    } catch (error: any) {
      toast.error(t(error.response?.data?.error || "Error deleting log"));
    }
  }

  async function deleteAllLogs() {
    try {
      const response = await axiosConfig.delete(`/logs`);
      toast.success(t(response.data.message));
      fetchAllLogs();
    } catch (error: any) {
      toast.error(t(error.response?.data?.error || "Error clearing logs"));
    }
  }

  function callback(action: string, data: any) {
    switch (action) {
      case "deleteAll":
        deleteAllLogs();
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
              {t("pages.admin.logs")}
            </h1>
            <p className="text-muted-foreground text-sm font-medium">
              {t("pages.admin.log_page.subtitle") || "Track all system activities and user actions"}
            </p>
          </div>
        </div>

        <div className="rounded-xl border-2 border-border bg-card overflow-hidden">
          <DataTable
              columns={getColumns(deleteLog, t)}
              data={logs}
              dataCount={logCount}
              fetchData={fetchAllLogs}
              isLoading={loading}
              callback={callback}
              searchElement="message"
              actions={["deleteAll"]}
          />
        </div>
      </div>
  );
};