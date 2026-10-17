
import { useState, useEffect } from 'react';
import {
  getJobs,
  addJob,
  changeJobStatus,
  removeJob,
  editJob,
} from './services/jobService';
import type { Job, JobStatus } from './types/job';
import type { NewJob } from './services/jobService';
import './App.css';

function App() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [search, setSearch] = useState('');
  const [searchStatus, setSearchStatus] = useState<JobStatus | 'all'>('all');
  const [desc, setDesc] = useState('');
  const [url, setUrl] = useState('');
  const [editingJobId, setEditingJobId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function loadJobs() {
      try {
        const resultJobs = await getJobs();
        setJobs(resultJobs);
      } catch {
        setError('Не удалось загрузить вакансии. Проверь подключение к серверу.');
      } finally {
        setIsLoading(false);
      }
    }

    loadJobs();
  }, []);

  function getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }

    return 'Произошла неизвестная ошибка.';
  }

  function clearForm() {
    setTitle('');
    setCompany('');
    setDesc('');
    setUrl('');
    setEditingJobId(null);
  }

  async function handleAddJob() {
    const trimmedTitle = title.trim();
    const trimmedCompany = company.trim();

    if (!trimmedTitle || !trimmedCompany) {
      setError('Заполни название вакансии и компанию.');
      return;
    }

    const jobData: NewJob = {
      title: trimmedTitle,
      company: trimmedCompany,
      status: 'not_sent',
    };

    const trimmedDesc = desc.trim();
    const trimmedUrl = url.trim();

    if (trimmedDesc) jobData.description = trimmedDesc;
    if (trimmedUrl) jobData.url = trimmedUrl;

    setError('');
    setIsSaving(true);

    try {
      const resultJob = await addJob(jobData);
      setJobs((prevJobs) => [...prevJobs, resultJob]);
      clearForm();
    } catch (error) {
      setError(`Не удалось создать вакансию. ${getErrorMessage(error)}`);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleStatusChange(id: string, status: JobStatus) {
    setError('');

    try {
      const updatedJobs = await changeJobStatus(id, status);
      setJobs(updatedJobs);
    } catch (error) {
      setError(`Не удалось изменить статус. ${getErrorMessage(error)}`);
    }
  }

  async function handleDeleteJob(id: string) {
    setError('');

    try {
      const resultJobs = await removeJob(id);
      setJobs(resultJobs);

      if (editingJobId === id) {
        clearForm();
      }
    } catch (error) {
      setError(`Не удалось удалить вакансию. ${getErrorMessage(error)}`);
    }
  }

  function handleEditJob(job: Job) {
    setError('');
    setEditingJobId(job.id);
    setTitle(job.title);
    setCompany(job.company);
    setDesc(job.description ?? '');
    setUrl(job.url ?? '');
  }

  async function handleUpdateJob() {
    if (editingJobId === null) return;

    const trimmedTitle = title.trim();
    const trimmedCompany = company.trim();

    if (!trimmedTitle || !trimmedCompany) {
      setError('Заполни название вакансии и компанию.');
      return;
    }

    const currentJob = jobs.find((job) => job.id === editingJobId);

    if (!currentJob) {
      setError('Вакансия не найдена. Обнови страницу.');
      return;
    }

    const jobData: NewJob = {
      title: trimmedTitle,
      company: trimmedCompany,
      status: currentJob.status,
      description: desc.trim() || null,
      url: url.trim() || null,
    };

    setError('');
    setIsSaving(true);

    try {
      const updatedJobs = await editJob(editingJobId, jobData);
      setJobs(updatedJobs);
      clearForm();
    } catch (error) {
      setError(`Не удалось сохранить изменения. ${getErrorMessage(error)}`);
    } finally {
      setIsSaving(false);
    }
  }

  const normalizedSearch = search.trim().toLowerCase();

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(normalizedSearch) ||
      job.company.toLowerCase().includes(normalizedSearch);

    const matchesStatus =
      searchStatus === 'all' || searchStatus === job.status;

    return matchesSearch && matchesStatus;
  });

  return (
    <main className="app">
      <div className="app-container">
        <h1>Job Tracker</h1>

        {error && (
          <p role="alert" className="error-message">
            {error}
          </p>
        )}

        <div className="job-form">
          <input
            placeholder="Vacancy title *"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <input
            placeholder="Company name *"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
          />

          <textarea
            placeholder="Description (optional)"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
          />

          <input
            placeholder="Vacancy URL (optional)"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />

          {editingJobId === null ? (
            <button onClick={handleAddJob} disabled={isSaving}>
              {isSaving ? 'Adding...' : 'Add vacancy'}
            </button>
          ) : (
            <button onClick={handleUpdateJob} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save changes'}
            </button>
          )}

          {editingJobId !== null && (
            <button onClick={clearForm} disabled={isSaving}>
              Cancel editing
            </button>
          )}
        </div>

        <div className="job-filters">
          <input
            placeholder="Search by title or company"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            value={searchStatus}
            onChange={(e) =>
              setSearchStatus(e.target.value as JobStatus | 'all')
            }
          >
            <option value="all">All statuses</option>
            <option value="not_sent">Not Sent</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
            <option value="accepted">Accepted</option>
          </select>
        </div>

        {isLoading ? (
          <p>Loading vacancies...</p>
        ) : jobs.length === 0 ? (
          <p>No vacancies yet</p>
        ) : filteredJobs.length === 0 ? (
          <p>No matching vacancies</p>
        ) : (
          <div className="job-list">
            {filteredJobs.map((job) => (
              <div className="job-card" key={job.id}>
                <h2>{job.title}</h2>
                <p>{job.company}</p>

                {job.description && <p>{job.description}</p>}

                {job.url && (
                  <a href={job.url} target="_blank" rel="noreferrer">
                    Open vacancy
                  </a>
                )}

                <select
                  value={job.status}
                  onChange={(e) =>
                    handleStatusChange(job.id, e.target.value as JobStatus)
                  }
                >
                  <option value="not_sent">Not Sent</option>
                  <option value="pending">Pending</option>
                  <option value="rejected">Rejected</option>
                  <option value="accepted">Accepted</option>
                </select>

                <div className="job-card-actions">
                  <button onClick={() => handleEditJob(job)}>Edit</button>
                  <button onClick={() => handleDeleteJob(job.id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

export default App;
