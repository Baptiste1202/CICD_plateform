import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { CheckCircle, Loader2, Play, Circle, Terminal } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSocketContext } from "@/contexts/socketContext";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const steps = [
    { id: 'git', label: 'GIT PULL & SUBMODULES' },
    { id: 'maven', label: 'BUILD SERVICES' },
    { id: 'docker', label: 'DOCKER COMPOSE UP' },
    { id: 'ssh', label: 'FINALISATION' }
];

export const PipelineView = () => {
    const { socket } = useSocketContext();
    const [currentStepIndex, setCurrentStepIndex] = useState(-1);
    const [status, setStatus] = useState("idle");
    const [loading, setLoading] = useState(false);
    const [logs, setLogs] = useState<string[]>(["En attente de lancement..."]);

    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll de la console
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [logs]);

    // Écoute des logs réels du serveur (Logique intégrée de ton collègue)
    useEffect(() => {
        if (!socket) return;

        const handleLog = (data: string) => {
            setLogs((prev) => [...prev, data]);

            // Mise à jour intelligente des étapes basée sur le contenu des logs
            if (data.includes("git pull")) setCurrentStepIndex(0);
            if (data.includes("submodule")) setCurrentStepIndex(1);
            if (data.includes("docker-compose")) setCurrentStepIndex(2);
            if (data.includes("succès")) {
                setCurrentStepIndex(steps.length);
                setStatus("success");
            }
        };

        socket.on('deploy-log', handleLog);

        return () => {
            socket.off('deploy-log', handleLog);
        };
    }, [socket]);

    // Fonction de déploiement réelle
    async function startDeploy() {
        if (loading) return;

        setLoading(true);
        setStatus("running");
        setCurrentStepIndex(0);
        setLogs([`[${new Date().toLocaleTimeString()}] > INITIALIZING DEPLOYMENT...\n`]);

        const toastId = toast.loading("Déploiement en cours sur le serveur...");

        try {
            await axios.post(
                import.meta.env.VITE_API_URL + "/api/deploy",
                {},
                {
                    withCredentials: true,
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                    },
                }
            );
            toast.success("Déploiement terminé avec succès", { id: toastId });
            setStatus("success");
            setCurrentStepIndex(steps.length);
        } catch (error: any) {
            console.error(error);
            const message = error.response?.data?.error || "Erreur de déploiement";
            toast.error(message, { id: toastId });
            setLogs((prev) => [...prev, `\n❌ ERREUR API : ${message}`]);
            setStatus("idle");
        } finally {
            setLoading(false);
        }
    }

    return (
        <Card className="h-full border-2 border-border bg-card rounded-xl overflow-hidden shadow-none flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between border-b-2 border-border bg-muted/20 p-3 shrink-0">
                <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4" />
                    <CardTitle className="text-[10px] font-black uppercase tracking-tight italic">Console de Déploiement</CardTitle>
                </div>
                <Button
                    onClick={startDeploy}
                    disabled={loading}
                    className="h-8 text-[9px] px-4 font-bold uppercase tracking-widest bg-black text-white hover:opacity-90 transition-all"
                >
                    {loading ? <Loader2 className="animate-spin h-3 w-3 mr-1" /> : <Play className="h-3 w-3 mr-1 fill-current" />}
                    {loading ? "Running..." : "Execute"}
                </Button>
            </CardHeader>

            <CardContent className="p-4 flex-1 min-h-0 grid grid-cols-1 md:grid-cols-2 gap-6 overflow-hidden">
                <div className="flex flex-col justify-center space-y-6 relative overflow-hidden">
                    {steps.map((step, idx) => {
                        const isDone = idx < currentStepIndex || status === "success";
                        const isCurrent = idx === currentStepIndex && status !== "success";
                        return (
                            <div key={step.id} className="flex items-center gap-4 relative">
                                {idx !== steps.length - 1 && (
                                    <div className={cn("absolute left-[13px] top-8 w-[1px] h-6 transition-colors duration-500", isDone ? "bg-black" : "bg-muted")} />
                                )}
                                <div className={cn("w-7 h-7 rounded-full flex items-center justify-center border-2 text-[10px] transition-all duration-500 z-10 bg-background",
                                    isDone ? "bg-black border-black text-white" : isCurrent ? "border-black animate-pulse" : "border-muted text-muted")}>
                                    {isDone ? <CheckCircle className="w-3.5 h-3.5" /> : idx + 1}
                                </div>
                                <span className={cn("text-[10px] font-black uppercase tracking-widest leading-none", isCurrent || isDone ? "text-foreground" : "text-muted-foreground/40")}>
                                    {step.label}
                                </span>
                            </div>
                        );
                    })}
                </div>

                <div className="flex flex-col h-full min-h-0 overflow-hidden">
                    <span className="text-[8px] font-black uppercase mb-2 opacity-50 italic shrink-0">Live Terminal Output</span>
                    <div
                        ref={scrollRef}
                        className="flex-1 min-h-0 bg-black text-green-400 p-4 rounded-xl font-mono text-[10px] overflow-y-auto border-2 border-border whitespace-pre-wrap leading-relaxed shadow-inner scrollbar-thin scrollbar-thumb-white/20"
                    >
                        {logs.map((log, i) => (
                            <div key={i} className="mb-1 border-l border-white/10 pl-3">
                                {log}
                            </div>
                        ))}
                        {loading && <div className="animate-pulse text-white mt-1">_</div>}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};