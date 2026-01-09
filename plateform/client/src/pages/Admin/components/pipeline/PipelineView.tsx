import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { CheckCircle, Loader2, Play, Circle, Terminal, XCircle, Pause } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSocketContext } from "@/contexts/socketContext";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const steps = [
    { id: 'git', label: 'GIT PULL & SUBMODULES' },
    { id: 'tests', label: 'UNIT TESTS (MAVEN)' },
    { id: 'sonarQUBE', label: 'SONARQUBE ANALYSIS' },
    { id: 'maven', label: 'BUILD SERVICES' },
    { id: 'docker', label: 'DEPLOYEMENT ON SERVER' },
    { id: 'ssh', label: 'FINALISATION' }
];

export const PipelineView = () => {
    const { socket } = useSocketContext();
    const [currentStepIndex, setCurrentStepIndex] = useState(-1);
    const [status, setStatus] = useState("idle");
    const [loading, setLoading] = useState(false);
    const [logs, setLogs] = useState<string[]>(["En attente de lancement..."]);
    const [buildId, setBuildId] = useState<string | null>(null);
    const [isPaused, setIsPaused] = useState(false);
    const [activeToastId, setActiveToastId] = useState<string | number | null>(null);

    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [logs]);

    useEffect(() => {
        if (!socket) return;

        const handleLog = (data: string) => {
            setLogs((prev) => [...prev, data]);

            if (data.includes("Build créé avec ID:")) {
                const match = data.match(/Build créé avec ID:\s*(\S+)/);
                if (match) {
                    setBuildId(match[1]);
                }
            }

            if (data.includes("git pull")) setCurrentStepIndex(0);
            if (data.includes("mvn test") || data.includes("Tests run:")) setCurrentStepIndex(1);
            if (data.includes("sonarQ") || data.includes("SonarQube") || data.includes("ANALYSIS SUCCESSFUL")) setCurrentStepIndex(2);
            if (data.includes("docker-compose") && data.includes("build")) setCurrentStepIndex(3);
            if (data.includes("docker save")) setCurrentStepIndex(4);
            if (data.includes("docker compose") && data.includes("up")) setCurrentStepIndex(5);
            if (data.includes("succès")) {
                setCurrentStepIndex(steps.length);
                setStatus("success");
            }
            if (data.includes("cancelled")) {
                setStatus("cancelled");
                setLoading(false);
                if (activeToastId) toast.dismiss(activeToastId);
            }
            if (data.includes("paused")) {
                setIsPaused(true);
            }
            if (data.includes("resumed")) {
                setIsPaused(false);
            }
        };

        socket.on('deploy-log', handleLog);
        return () => { socket.off('deploy-log', handleLog); };
    }, [socket, activeToastId]);

    const confirmAction = (message: string, onConfirm: () => void) => {
        toast(message, {
            action: { label: "Confirmer", onClick: onConfirm },
            cancel: { label: "Annuler", onClick: () => {} },
        });
    };

    async function startDeploy() {
        if (loading) return;

        setLoading(true);
        setStatus("running");
        setCurrentStepIndex(0);
        setLogs([`[${new Date().toLocaleTimeString()}] > INITIALIZING DEPLOYMENT...\n`]);

        const id = toast.loading("Déploiement en cours sur le serveur...");
        setActiveToastId(id);

        try {
            const response = await axios.post(
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
            setBuildId(response.data.buildId);
            toast.success("Déploiement terminé avec succès", { id });
            setActiveToastId(null);
        } catch (error: any) {
            const message = error.response?.data?.error || "Erreur de déploiement";
            toast.error(message, { id });
            setLogs((prev) => [...prev, `\n❌ ERREUR API : ${message}`]);
            setStatus("idle");
            setLoading(false);
            setActiveToastId(null);
        }
    }

    async function cancelDeploy() {
        if (!buildId) return;

        confirmAction("Annuler le déploiement en cours ?", async () => {
            try {
                if (activeToastId) toast.dismiss(activeToastId);
                await axios.post(`${import.meta.env.VITE_API_URL}/api/deploy/cancel/${buildId}`, {}, {
                    withCredentials: true,
                    headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
                });
                toast.error("Pipeline stoppé");
                setStatus("cancelled");
                setLoading(false);
            } catch (error: any) {
                toast.error("Erreur lors de l'annulation");
            }
        });
    }

    async function pauseDeploy() {
        if (!buildId) return;
        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/api/deploy/pause/${buildId}`, {}, {
                withCredentials: true,
                headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
            });
            if (activeToastId) toast.info("Pipeline mis en pause", { id: activeToastId });
        } catch (error: any) {
            toast.error("Erreur pause");
        }
    }

    async function resumeDeploy() {
        if (!buildId) return;
        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/api/deploy/resume/${buildId}`, {}, {
                withCredentials: true,
                headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
            });
            if (activeToastId) toast.loading("Reprise du déploiement...", { id: activeToastId });
        } catch (error: any) {
            toast.error("Erreur reprise");
        }
    }

    return (
        <Card className="h-full border-2 border-border bg-card rounded-xl overflow-hidden shadow-none flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between border-b-2 border-border bg-muted/10 p-3 shrink-0">
                <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-primary" />
                    <CardTitle className="text-[10px] font-black uppercase tracking-tight italic">Console de Déploiement</CardTitle>
                </div>
                <div className="flex gap-2">
                    <Button
                        onClick={startDeploy}
                        disabled={loading}
                        className="h-8 text-[9px] px-4 font-bold uppercase tracking-widest bg-primary text-primary-foreground hover:opacity-90 transition-all active:scale-95"
                    >
                        {loading ? <Loader2 className="animate-spin h-3 w-3 mr-1" /> : <Play className="h-3 w-3 mr-1 fill-current" />}
                        {loading ? "Running..." : "Execute"}
                    </Button>

                    {loading && buildId && (
                        <div className="flex gap-2">
                            <Button
                                onClick={isPaused ? resumeDeploy : pauseDeploy}
                                variant="outline"
                                className={cn(
                                    "h-8 text-[9px] px-4 font-bold uppercase tracking-widest border-2 transition-all",
                                    isPaused ? "border-yellow-500 text-yellow-500 animate-pulse" : "border-border"
                                )}
                            >
                                {isPaused ? <Play className="h-3 w-3 mr-1" /> : <Pause className="h-3 w-3 mr-1" />}
                                {isPaused ? "Resume" : "Pause"}
                            </Button>
                            <Button
                                onClick={cancelDeploy}
                                variant="destructive"
                                className="h-8 text-[9px] px-4 font-bold uppercase tracking-widest border-2 border-destructive"
                            >
                                <XCircle className="h-3 w-3 mr-1" />
                                Cancel
                            </Button>
                        </div>
                    )}
                </div>
            </CardHeader>

            <CardContent className="p-2 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                <div className="p-4 md:col-span-4 flex flex-col space-y-8 ">
                    {steps.map((step, idx) => {
                        const isDone = idx < currentStepIndex || status === "success";
                        const isCurrent = idx === currentStepIndex && status !== "success";

                        return (
                            <div key={step.id} className="flex items-center gap-4 relative">
                                {idx !== steps.length - 1 && (
                                    <div className={cn(
                                        "absolute left-[13px] top-8 w-[1px] h-8 transition-colors duration-500",
                                        isDone ? "bg-primary" : "bg-muted"
                                    )} />
                                )}
                                <div className={cn(
                                    "w-7 h-7 rounded-full flex items-center justify-center border-2 text-[10px] transition-all duration-500 z-10 bg-background font-black",
                                    isDone ? "bg-primary border-primary text-primary-foreground shadow-[0_0_10px_rgba(var(--primary),0.4)]" :
                                        isCurrent ? "border-primary text-primary animate-pulse" :
                                            "border-muted text-muted"
                                )}>
                                    {isDone ? <CheckCircle className="w-4 h-4" /> : idx + 1}
                                </div>
                                <span className={cn(
                                    "text-[11px] font-black uppercase tracking-widest transition-colors",
                                    isCurrent ? "text-primary" : isDone ? "text-foreground" : "text-muted-foreground/40"
                                )}>
                                    {step.label}
                                </span>
                            </div>
                        );
                    })}
                </div>

                <div className="md:col-span-8 flex flex-col min-w-0">
                    <span className="text-[8px] font-black uppercase mb-2 opacity-50 italic shrink-0 flex items-center gap-2">
                        <Circle className="w-1.5 h-1.5 fill-primary animate-pulse" /> Live Terminal Output
                    </span>
                    <div
                        ref={scrollRef}
                        className={cn(
                            "h-[300px] bg-black text-green-400 p-5 rounded-xl font-mono text-[10px]",
                            "overflow-y-auto overflow-x-hidden border-2 border-border shadow-2xl transition-all",
                            "leading-relaxed whitespace-pre-wrap scrollbar-thin scrollbar-thumb-white/20",
                            loading && "border-primary/30"
                        )}
                    >
                        {logs.map((log, i) => (
                            <div key={i} className="mb-1 border-l border-white/10 pl-3 break-words">
                                <span className="text-white/30 mr-2">[{i}]</span>
                                {log}
                            </div>
                        ))}
                        {loading && !isPaused && <div className="animate-pulse text-primary mt-1">_</div>}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};