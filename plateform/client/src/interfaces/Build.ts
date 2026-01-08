export type BuildStatus = 'pending' | 'running' | 'success' | 'failed';

export interface BuildInterface {
    _id: string;
    projectName: string;
    status: BuildStatus;
    image: string;
    images?: string[]; // Liste des images déployées
    deploymentId?: string; // ID unique du déploiement
    logs?: string[]; // Logs du déploiement
    createdAt: string;
    updatedAt?: string;
    user?: {
        _id: string;
        username: string;
        avatar?: string;
    };
}