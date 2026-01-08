import {UserInterface} from "@/interfaces/User";

export type BuildStatus = 'pending' | 'running' | 'success' | 'failed';

export interface BuildInterface {
    _id: string;
    projectName: string;
    status: BuildStatus;
    image: string;
    images?: string[];
    deploymentId?: string;
    logs?: string[];
    createdAt: string;
    updatedAt?: string;
    user: UserInterface;
}