import type { Job } from "../types/job";

export async function getJobs(): Promise<Job[]> {
    const response = await fetch("/api/jobs");

    if (!response.ok) {
        throw new Error("Failed to fetch jobs");
    }

    return response.json();
}

export async function saveJobs(jobs: Job[]): Promise<void> {
    const parsedJobs = JSON.stringify(jobs);

    localStorage.setItem("jobs", parsedJobs)
}