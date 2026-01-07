import { useEffect, useState } from "react";
import { axiosConfig } from "@/config/axiosConfig";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PipelineView } from "@/pages/Admin/components/pipeline/PipelineView";
import { useSocketContext } from "@/contexts/socketContext";
import { Activity, Users, LayoutDashboard, Loader2 } from "lucide-react";

export const Dashboard = () => {
  const { socket } = useSocketContext();
  const [stats, setStats] = useState({ users: 0, activeBuilds: 0 });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const res = await axiosConfig.get("/users");

      const usersCount = res.data.count ?? res.data.users ?? 0;

      setStats({
        users: usersCount,
        activeBuilds: 0
      });
    } catch (err: any) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on("pipeline-update", (data: any) => {
      if (data.index === 0) {
        setStats(prev => ({ ...prev, activeBuilds: prev.activeBuilds + 1 }));
      }
    });

    socket.on("pipeline-finished", () => {
      setStats(prev => ({
        ...prev,
        activeBuilds: Math.max(0, prev.activeBuilds - 1)
      }));
    });

    return () => {
      socket.off("pipeline-update");
      socket.off("pipeline-finished");
    };
  }, [socket]);

  if (loading) {
    return (
        <div className="flex h-screen w-full items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-accent" />
        </div>
    );
  }

  return (
      <div className="flex flex-col gap-6 p-4 md:p-8">
        <div className="flex items-center gap-2">
          <LayoutDashboard className="w-6 h-6 text-accent" />
          <h1 className="text-2xl font-bold italic">Dashboard CI/CD</h1>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Carte Utilisateurs - Devrait afficher +5 maintenant */}
          <Card className="shadow-md border-b-2 border-transparent hover:border-blue-500 transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Utilisateurs Totaux
              </CardTitle>
              <Users className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.users}</div>
              <p className="text-xs text-muted-foreground mt-1">Membres enregistrés</p>
            </CardContent>
          </Card>

          {/* Carte Builds Actifs */}
          <Card className="shadow-md border-b-2 border-accent hover:bg-accent/5 transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Builds Actifs
              </CardTitle>
              <Activity className="w-4 h-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.activeBuilds}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.activeBuilds > 0 ? "Processus en cours" : "Aucune activité"}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-4">
          <PipelineView />
        </div>
      </div>
  );
};