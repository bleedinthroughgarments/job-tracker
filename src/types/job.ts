export type JobStatus = "not_sent" | "pending" | "rejected" | "accepted";

export interface Job {
    id: string;
    title: string;
    company: string;
    description?: string;
    url?: string;
    status: JobStatus;
    createdAt: string;
}