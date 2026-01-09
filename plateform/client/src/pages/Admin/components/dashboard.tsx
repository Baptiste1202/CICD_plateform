import { useEffect, useState } from "react";
import { axiosConfig } from "@/config/axiosConfig";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PipelineView } from "@/pages/Admin/components/pipeline/PipelineView";
import { useSocketContext } from "@/contexts/socketContext";
import { Activity, Users, LayoutDashboard, Loader2 } from "lucide-react";

export const Dashboard = () => {
    const { socket } = useSocketContext();

    // 1. Initialisation avec TOUTES les clés nécessaires
    const [stats, setStats] = useState({
        users: 0,
        totalBuilds: 0,
        successRate: 0,
        failedRate: 0,
        runningRate: 0,
        pausedRate: 0
    });
    const [loading, setLoading] = useState(true);

    const fetchStats = async () => {
        try {
            const [userRes, buildRes] = await Promise.all([
                axiosConfig.get("/users"),
                // On retire le fallback .rate ici pour utiliser les nouvelles clés
                axiosConfig.get("/builds/stats")
            ]);

            const usersCount = userRes.data.count ?? (Array.isArray(userRes.data.users) ? userRes.data.users.length : 0);

            // 2. Mapping précis des données reçues du Backend
            setStats({
                users: usersCount,
                totalBuilds: buildRes.data.total || 0,
                successRate: buildRes.data.successRate || 0,
                failedRate: buildRes.data.failedRate || 0,
                runningRate: buildRes.data.runningRate || 0,
                pausedRate: buildRes.data.pausedRate || 0
            });
        } catch (err: any) {
            console.error("Erreur fetchStats:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    useEffect(() => {
        if (!socket) return;
        socket.on("pipeline-finished", () => {
            fetchStats();
        });
        return () => {
            socket.off("pipeline-finished");
        };
    }, [socket]);

    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="flex flex-1 flex-col gap-8 p-8 bg-background h-full overflow-hidden">

            <div className="flex items-center justify-between border-b-2 border-border pb-6 shrink-0">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-black uppercase tracking-tight italic">
                            Dashboard CI/CD
                        </h1>
                        <LayoutDashboard className="w-6 h-6 text-primary" />
                    </div>
                    <p className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em] mt-1">
                        Real-time system performance and pipeline status
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1 min-h-0">
                <div className="lg:col-span-4 flex flex-col gap-6 shrink-0">
                    <Card className="border-2 border-border shadow-none rounded-xl bg-card overflow-hidden">
                        <CardHeader className="p-4 pb-0 space-y-0 flex flex-row items-center justify-between">
                            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                Utilisateurs Totaux
                            </CardTitle>
                            <Users className="w-4 h-4 opacity-50" />
                        </CardHeader>
                        <CardContent className="p-4 pt-2">
                            <p className="text-3xl font-black italic tracking-tighter">{stats.users}</p>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase mt-1 tracking-tight">
                                Membres enregistrés
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-2 border-border shadow-none rounded-xl bg-card overflow-hidden">
                        <CardHeader className="p-4 pb-0 space-y-0 flex flex-row items-center justify-between">
                            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                Historique Builds
                            </CardTitle>
                            <Activity className="w-4 h-4 opacity-50" />
                        </CardHeader>
                        <CardContent className="p-4 pt-2">
                            <p className="text-3xl font-black italic tracking-tighter">{stats.totalBuilds}</p>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase mt-1 tracking-tight">
                                Exécutions totales
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-2 border-border shadow-none rounded-xl bg-card overflow-hidden">
                        <CardHeader className="p-4 pb-0 flex flex-row items-center justify-between">
                            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                État des Pipelines (%)
                            </CardTitle>
                            <Activity className="w-4 h-4 opacity-50" />
                        </CardHeader>
                        <CardContent className="p-4 pt-4 space-y-4">
                            <div className="space-y-1">
                                <div className="flex justify-between text-[10px] font-black uppercase">
                                    <span className="text-green-500">Succès</span>
                                    <span>{stats.successRate}%</span>
                                </div>
                                <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
                                    <div className="bg-green-500 h-full transition-all duration-1000" style={{ width: `${stats.successRate}%` }} />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <div className="flex justify-between text-[10px] font-black uppercase">
                                    <span className="text-red-500">Échecs</span>
                                    <span>{stats.failedRate}%</span>
                                </div>
                                <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
                                    <div className="bg-red-500 h-full transition-all duration-1000" style={{ width: `${stats.failedRate}%` }} />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <div className="flex justify-between text-[10px] font-black uppercase">
                                    <span className="text-blue-500">En cours</span>
                                    <span>{stats.runningRate}%</span>
                                </div>
                                <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
                                    <div className="bg-blue-500 h-full transition-all duration-1000" style={{ width: `${stats.runningRate}%` }} />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <div className="flex justify-between text-[10px] font-black uppercase">
                                    <span className="text-amber-500">En attente</span>
                                    <span>{stats.pausedRate}%</span>
                                </div>
                                <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
                                    <div className="bg-amber-500 h-full transition-all duration-1000" style={{ width: `${stats.pausedRate}%` }} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-8 flex flex-col gap-4 min-h-0">
                    <h2 className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground italic shrink-0">
                        Live Pipelines
                    </h2>
                    <div className="flex-1 min-h-0 overflow-y-auto pr-2 custom-scrollbar">
                        <PipelineView />
                    </div>
                </div>
            </div>
        </div>
    );
};