import { useEffect, useState } from "react";
import { axiosConfig } from "@/config/axiosConfig";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PipelineView } from "@/pages/Admin/components/pipeline/PipelineView";
import { useSocketContext } from "@/contexts/socketContext";
import { Activity, Users, LayoutDashboard, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export const Dashboard = () => {
    const { socket } = useSocketContext();
    const [stats, setStats] = useState({ users: 0, activeBuilds: 0 });
    const [loading, setLoading] = useState(true);

    const fetchStats = async () => {
        try {
            const res = await axiosConfig.get("/users");
            const usersCount = res.data.count ?? (Array.isArray(res.data.users) ? res.data.users.length : 0);
            setStats({ users: usersCount, activeBuilds: 0 });
        } catch (err: any) {
            console.error(err);
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
            setStats(prev => ({ ...prev, activeBuilds: Math.max(0, prev.activeBuilds - 1) }));
        });
        return () => {
            socket.off("pipeline-update");
            socket.off("pipeline-finished");
        };
    }, [socket]);

    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-foreground" />
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full max-h-screen overflow-hidden bg-background p-4 gap-4">
            <div className="flex items-center justify-between border-b-2 border-border pb-2 shrink-0">
                <div className="flex items-center gap-2">
                    <LayoutDashboard className="w-5 h-5" />
                    <h1 className="text-3xl font-black uppercase tracking-tighter">Dashboard CI/CD</h1>
                </div>
            </div>

            <div className="grid gap-4 grid-cols-2 lg:grid-cols-3 shrink-0">
                <Card className="border-2 border-border shadow-none rounded-xl">
                    <CardHeader className="p-3 pb-0 space-y-0 flex flex-row items-center justify-between">
                        <CardTitle className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Utilisateurs Totaux</CardTitle>
                        <Users className="w-3.5 h-3.5" />
                    </CardHeader>
                    <CardContent className="p-3 pt-1">
                        <p className="text-2xl font-black">{stats.users}</p>
                            <p className="text-xs text-muted-foreground mt-1">Membres enregistrés</p>
                    </CardContent>
                </Card>

                <Card className={cn("border-2 shadow-none rounded-xl", stats.activeBuilds > 0 ? "bg-black text-white" : "bg-card")}>
                    <CardHeader className="p-3 pb-0 space-y-0 flex flex-row items-center justify-between">
                        <CardTitle className="text-[9px] font-black uppercase tracking-widest opacity-70">Builds Actifs</CardTitle>
                        <Activity className="w-3.5 h-3.5" />
                    </CardHeader>
                    <CardContent className="p-3 pt-1">
                        <div className="text-2xl font-black">{stats.activeBuilds}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {stats.activeBuilds > 0 ? "Processus en cours" : "Aucune activité"}
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="flex-1 min-h-0 border-t-2 border-border pt-4 flex flex-col overflow-hidden">
                <div className="mb-2 shrink-0">
                    <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                        Live Pipeline Monitor
                    </h2>
                </div>
                <div className="flex-1 min-h-0 pb-2">
                    <PipelineView />
                </div>
            </div>
        </div>
    );
};