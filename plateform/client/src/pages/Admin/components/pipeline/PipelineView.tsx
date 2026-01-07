import { useEffect, useState, useRef } from "react";
import { CheckCircle, Loader2, Play, Circle, Terminal } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSocketContext } from "@/contexts/socketContext";
import { axiosConfig } from "@/config/axiosConfig";
import { toast } from "sonner";

const steps = [
    { id: 'git', label: 'Clone Git' },
    { id: 'maven', label: 'Build Maven' },
    { id: 'docker', label: 'Docker Push' },
    { id: 'ssh', label: 'Déploiement SSH' }
];

export const PipelineView = () => {
    const { socket } = useSocketContext();
    const [currentStepIndex, setCurrentStepIndex] = useState(-1);
    const [status, setStatus] = useState("idle");
    const [logs, setLogs] = useState<string[]>(["En attente de lancement..."]);

    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [logs]);

    useEffect(() => {
        if (!socket) return;

        socket.on("pipeline-update", (data: any) => {
            setStatus("running");
            setCurrentStepIndex(data.index);
            setLogs(prev => [
                ...prev,
                `[${new Date().toLocaleTimeString()}] Étape en cours : ${steps[data.index]?.label || 'Inconnue'}`
            ]);
        });

        socket.on("pipeline-finished", () => {
            setStatus("success");
            setCurrentStepIndex(steps.length);
            setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] Pipeline terminé avec succès.`]);
            toast.success("Déploiement terminé !");
        });

        return () => {
            socket.off("pipeline-update");
            socket.off("pipeline-finished");
        };
    }, [socket]);

    const startDeploy = async () => {
        try {
            setLogs([`[${new Date().toLocaleTimeString()}] Requête de déploiement envoyée...`]);
            setStatus("running");
            setCurrentStepIndex(0);

            await axiosConfig.post("/builds", {
                projectName: "Mon Projet Cloud",
                image: "webapp:latest"
            });
        } catch (error) {
            toast.error("Erreur de lancement");
            setStatus("idle");
            setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ÉCHEC du lancement.`]);
        }
    };

    return (
        <Card className="w-full border-2 shadow-xl bg-white dark:bg-slate-950">
            <CardHeader className="flex flex-row items-center justify-between border-b bg-slate-50/50 dark:bg-slate-900/50">
                <div className="flex items-center gap-2">
                    <Terminal className="w-5 h-5 text-blue-600" />
                    <CardTitle className="text-xl font-bold italic">CONTRÔLE CI/CD</CardTitle>
                </div>
                <Button
                    onClick={startDeploy}
                    disabled={status === "running"}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                    {status === "running" ? (
                        <Loader2 className="animate-spin mr-2 h-4 w-4" />
                    ) : (
                        <Play className="mr-2 h-4 w-4" />
                    )}
                    Lancer le Pipeline
                </Button>
            </CardHeader>

            <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">

                <div className="space-y-10 relative pt-4">
                    {steps.map((step, idx) => {
                        const isDone = idx < currentStepIndex || status === "success";
                        const isCurrent = idx === currentStepIndex && status !== "success";

                        return (
                            <div key={step.id} className="flex items-center gap-6 relative">

                                {idx !== steps.length - 1 && (
                                    <div className={`absolute left-[19px] top-10 w-0.5 h-10 -z-0 
                                        ${idx < currentStepIndex ? "bg-green-500" : "bg-slate-200 dark:bg-slate-800"}`}
                                    />
                                )}

                                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 z-10 transition-all duration-500 
                                    ${isDone ? "bg-green-500 border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.3)]" :
                                    isCurrent ? "bg-blue-500 border-blue-500 animate-pulse shadow-[0_0_15px_rgba(59,130,246,0.3)]" :
                                        "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-300"}`}>

                                    {isDone ? <CheckCircle className="text-white w-6 h-6" /> :
                                        isCurrent ? <Loader2 className="text-white w-6 h-6 animate-spin" /> :
                                            <Circle className="w-6 h-6" />}
                                </div>

                                <span className={`text-lg font-bold transition-colors duration-300 ${
                                    isCurrent ? "text-blue-600 dark:text-blue-400" :
                                        isDone ? "text-green-600 dark:text-green-400" :
                                            "text-slate-400"
                                }`}>
                                    {step.label}
                                </span>
                            </div>
                        );
                    })}
                </div>

                <div className="flex flex-col h-full">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold flex items-center gap-2 text-slate-500">
                            <span className={`w-2 h-2 rounded-full ${status === "running" ? "bg-green-500 animate-pulse" : "bg-slate-400"}`} />
                            Console Output
                        </span>
                        <span className="text-[10px] uppercase text-slate-400 font-mono">Live Stream</span>
                    </div>

                    <div
                        ref={scrollRef}
                        className="bg-slate-950 text-slate-300 p-4 rounded-lg font-mono text-[11px] h-[300px] overflow-y-auto border border-slate-800 shadow-inner scrollbar-thin scrollbar-thumb-slate-700"
                    >
                        {logs.map((log, i) => (
                            <div key={i} className="mb-1 border-l-2 border-blue-500/30 pl-3 py-0.5 hover:bg-white/5 transition-colors">
                                <span className="text-blue-500/80 mr-2 font-bold">
                                    {log.includes(']') ? log.split(']')[0] + ']' : ''}
                                </span>
                                <span className="text-slate-200">
                                    {log.includes(']') ? log.split(']')[1] : log}
                                </span>
                            </div>
                        ))}
                        {status === "running" && <div className="animate-pulse text-blue-400 mt-2">▋</div>}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};