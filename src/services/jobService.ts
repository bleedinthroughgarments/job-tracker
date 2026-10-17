
import type { Job, JobStatus } from "../types/job";

export type NewJob = Omit<Job, "id" | "createdAt"> & {
    description?: string | null;
    url?: string | null;
};

const API_URL = "/api/jobs";

async function request<T>(url: string, options?: RequestInit): Promise<T> {
    const response = await fetch(url, {
        headers: {
            "Content-Type": "application/json",
        },
        ...options,
    });

    if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
    }

    return response.json();
}

export async function getJobs(): Promise<Job[]> {
    return request<Job[]>(API_URL);
}

export async function addJob(job: NewJob): Promise<Job> {
    const response = await request<{ data: Job }>(API_URL, {
        method: "POST",
        body: JSON.stringify(job),
    });

    return response.data;
}

export async function changeJobStatus(
    id: string,
    status: JobStatus
): Promise<Job[]> {
    await request<{ data: Job }>(`${API_URL}/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
    });

    return getJobs();
}

export async function removeJob(id: string): Promise<Job[]> {
    await request<{ message: string }>(`${API_URL}/${id}`, {
        method: "DELETE",
    });

    return getJobs();
}

export async function editJob(
    id: string,
    updates: NewJob
): Promise<Job[]> {
    await request<{ data: Job }>(`${API_URL}/${id}`, {
        method: "PATCH",
        body: JSON.stringify(updates),
    });

    return getJobs();
}
