export type JobStatus = "not_sent" | "pending" | "rejected" | "accepted";

export interface Job {
    id: string;
    title: string;
    company: string;
    description?: string | null;
    url?: string | null;
    status: JobStatus;
    createdAt: string;
}