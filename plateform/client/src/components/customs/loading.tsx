import { cn } from "@/lib/utils";

interface LoadingProps {
    className?: string;
}

export const Loading = ({ className }: LoadingProps) => {
    return (
        <div className={cn("flex flex-col items-center justify-center w-full min-h-screen gap-8", className)}>
            <svg
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-10 h-10 animate-spin"
            >
                <circle
                    cx="12"
                    cy="12"
                    r="10"
                    className="stroke-slate-200 dark:stroke-slate-800"
                    strokeWidth="4"
                    fill="none"
                />
                <path
                    d="M12 2C6.477 2 2 6.477 2 12"
                    className="stroke-blue-600"
                    strokeWidth="4"
                    strokeLinecap="round"
                    fill="none"
                />
            </svg>
        </div>
    );
};