export enum BriefStatus {
    DRAFT = 'DRAFT',
    ACTIVE = 'ACTIVE',
    CLOSED = 'CLOSED'
}

export interface Brief {
    id: number;
    title: string;
    background: string;
    ask: string;
    deliverables: string;
    budget: string;
    status: BriefStatus;
    responses: number;
    createdAt: string;
    updatedAt: string;
    creatorId: string;
}

export interface CreateBriefData {
    title: string;
    background: string;
    ask: string;
    deliverables: string;
    budget: string;
} 