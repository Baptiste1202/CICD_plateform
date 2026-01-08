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

            // Extract buildId from log message
            if (data.includes("Build créé avec ID:")) {
                const match = data.match(/Build créé avec ID:\s*(\S+)/);
                if (match) {
                    setBuildId(match[1]);
                }
            }

            if (data.includes("git pull")) setCurrentStepIndex(0);
            if (data.includes("mvn test") || data.includes("Tests run:")) setCurrentStepIndex(1);
            if (data.includes("sonarQ") || data.includes("SonarQube") || data.includes("ANALYSIS SUCCESSFUL")) setCurrentStepIndex(2);
            if (data.includes("docker-compose") && data.includes("build")) setCurrentStepIndex(4);
            if (data.includes("docker save")) setCurrentStepIndex(4);
            if (data.includes("docker compose") && data.includes("up")) setCurrentStepIndex(5);
            if (data.includes("succès")) {
                setCurrentStepIndex(steps.length);
                setStatus("success");
            }
            if (data.includes("cancelled")) {
                setStatus("cancelled");
                setLoading(false);
            }
            if (data.includes("paused")) {
                setIsPaused(true);
            }
            if (data.includes("resumed")) {
                setIsPaused(false);
            }
        };

        socket.on('deploy-log', handleLog);

        return () => {
            socket.off('deploy-log', handleLog);
        };
    }, [socket]);

    async function startDeploy() {
        if (loading) return;

        setLoading(true);
        setStatus("running");
        setCurrentStepIndex(0);
        setLogs([`[${new Date().toLocaleTimeString()}] > INITIALIZING DEPLOYMENT...\n`]);

        const toastId = toast.loading("Déploiement en cours sur le serveur...");

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

    async function cancelDeploy() {
        if (!buildId) {
            toast.error("No active deployment to cancel");
            return;
        }

        if (!confirm("Are you sure you want to cancel this deployment?")) {
            return;
        }

        try {
            await axios.post(
                `${import.meta.env.VITE_API_URL}/api/deploy/cancel/${buildId}`,
                {},
                {
                    withCredentials: true,
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                    },
                }
            );
            toast.success("Pipeline cancelled");
            setStatus("cancelled");
            setLoading(false);
        } catch (error: any) {
            console.error(error);
            const message = error.response?.data?.error || "Failed to cancel pipeline";
            toast.error(message);
        }
    }

    async function pauseDeploy() {
        if (!buildId) {
            toast.error("No active deployment to pause");
            return;
        }

        try {
            await axios.post(
                `${import.meta.env.VITE_API_URL}/api/deploy/pause/${buildId}`,
                {},
                {
                    withCredentials: true,
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                    },
                }
            );
            toast.success("Pipeline paused");
            setIsPaused(true);
        } catch (error: any) {
            console.error(error);
            const message = error.response?.data?.error || "Failed to pause pipeline";
            toast.error(message);
        }
    }

    async function resumeDeploy() {
        if (!buildId) {
            toast.error("No active deployment to resume");
            return;
        }

        try {
            await axios.post(
                `${import.meta.env.VITE_API_URL}/api/deploy/resume/${buildId}`,
                {},
                {
                    withCredentials: true,
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                    },
                }
            );
            toast.success("Pipeline resumed");
            setIsPaused(false);
        } catch (error: any) {
            console.error(error);
            const message = error.response?.data?.error || "Failed to resume pipeline";
            toast.error(message);
        }
    }

    return (
        <Card className="h-full border-2 border-border bg-card rounded-xl overflow-hidden shadow-none flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between border-b-2 border-border bg-muted/20 p-3 shrink-0">
                <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4" />
                    <CardTitle className="text-[10px] font-black uppercase tracking-tight italic">Console de Déploiement</CardTitle>
                </div>
                <div className="flex gap-2">
                    <Button
                        onClick={startDeploy}
                        disabled={loading}
                        className="h-8 text-[9px] px-4 font-bold uppercase tracking-widest bg-black text-white hover:opacity-90 transition-all"
                    >
                        {loading ? <Loader2 className="animate-spin h-3 w-3 mr-1" /> : <Play className="h-3 w-3 mr-1 fill-current" />}
                        {loading ? "Running..." : "Execute"}
                    </Button>
                    {loading && buildId && !isPaused && (
                        <Button
                            onClick={pauseDeploy}
                            variant="outline"
                            className="h-8 text-[9px] px-4 font-bold uppercase tracking-widest"
                        >
                            <Pause className="h-3 w-3 mr-1" />
                            Pause
                        </Button>
                    )}
                    {loading && buildId && isPaused && (
                        <Button
                            onClick={resumeDeploy}
                            variant="outline"
                            className="h-8 text-[9px] px-4 font-bold uppercase tracking-widest"
                        >
                            <Play className="h-3 w-3 mr-1" />
                            Resume
                        </Button>
                    )}
                    {loading && buildId && (
                        <Button
                            onClick={cancelDeploy}
                            variant="destructive"
                            className="h-8 text-[9px] px-4 font-bold uppercase tracking-widest"
                        >
                            <XCircle className="h-3 w-3 mr-1" />
                            Cancel
                        </Button>
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
                                    <div className={cn("absolute left-[13px] top-8 w-[1px] h-8 transition-colors duration-500", isDone ? "bg-black" : "bg-muted")} />
                                )}
                                <div className={cn("w-7 h-7 rounded-full flex items-center justify-center border-2 text-[10px] transition-all duration-500 z-10 bg-background",
                                    isDone ? "bg-black border-black text-white" : isCurrent ? "border-black animate-pulse" : "border-muted text-muted")}>
                                    {isDone ? <CheckCircle className="w-4 h-4" /> : idx + 1}
                                </div>
                                <span className={cn("text-[11px] font-black uppercase tracking-widest", isCurrent || isDone ? "text-foreground" : "text-muted-foreground/40")}>
                                    {step.label}
                                </span>
                            </div>
                        );
                    })}
                </div>

                <div className="md:col-span-8 flex flex-col min-w-0">
                    <span className="text-[8px] font-black uppercase mb-2 opacity-50 italic shrink-0">
                        Live Terminal Output
                    </span>
                    <div
                        ref={scrollRef}
                        className={cn(
                            "h-[300px] bg-black text-green-400 p-5 rounded-xl font-mono text-[10px]",
                            "overflow-y-auto overflow-x-hidden border-2 border-border shadow-2xl",
                            "leading-relaxed whitespace-pre-wrap scrollbar-thin scrollbar-thumb-white/20"
                        )}
                    >
                        {logs.map((log, i) => (
                            <div key={i} className="mb-1 border-l border-white/10 pl-3 break-words">
                                {log}
                            </div>
                        ))}
                        {loading && <div className="animate-pulse text-white mt-1">_</div>}
                        <div className="h-2" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};