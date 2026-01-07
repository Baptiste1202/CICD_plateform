export type BuildStatus = 'pending' | 'running' | 'success' | 'failed';

export interface BuildInterface {
    _id: string;
    projectName: string;
    status: BuildStatus;
    image: string;
    createdAt: string;
    user?: {
        _id: string;
        username: string;
        avatar?: string;
    };
}