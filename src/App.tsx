import { useEffect, useState } from "react";
import "./App.css";
import {
  addJob,
  changeJobStatus,
  editJob,
  getJobs,
  removeJob,
} from "./services/jobService";
import type { NewJob } from "./services/jobService";
import type { Job, JobStatus } from "./types/job";

const EMPTY_FORM = {
  title: "",
  company: "",
  status: "not_sent" as JobStatus,
  description: "",
  url: "",
};

function App() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadJobs() {
      try {
        setError("");
        setJobs(await getJobs());
      } catch {
        setError("Не удалось загрузить вакансии. Проверь работу backend.");
      } finally {
        setLoading(false);
      }
    }

    void loadJobs();
  }, []);

  function handleChange(
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function resetForm() {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setError("");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const title = form.title.trim();
    const company = form.company.trim();

    if (!title || !company) {
      setError("Название вакансии и компания обязательны.");
      return;
    }

    const description = form.description.trim();
    const url = form.url.trim();

    const payload: NewJob = {
      title,
      company,
      status: form.status,
      description: description || null,
      url: url || null,
    };

    try {
      setSaving(true);
      setError("");

      if (editingId !== null) {
        const updatedJobs = await editJob(editingId, payload);
        setJobs(updatedJobs);
      } else {
        const newJob = await addJob(payload);
        setJobs((current) => [newJob, ...current]);
      }

      resetForm();
    } catch {
      setError("Не удалось сохранить вакансию. Попробуй ещё раз.");
    } finally {
      setSaving(false);
    }
  }

  function startEditing(job: Job) {
    setEditingId(job.id);
    setForm({
      title: job.title,
      company: job.company,
      status: job.status,
      description: job.description ?? "",
      url: job.url ?? "",
    });
    setError("");
  }

  async function handleStatusChange(job: Job, status: JobStatus) {
    try {
      setError("");
      const updatedJobs = await changeJobStatus(job.id, status);
      setJobs(updatedJobs);
    } catch {
      setError(`Не удалось обновить статус вакансии «${job.title}».`);
    }
  }

  async function handleDelete(job: Job) {
    const confirmed = window.confirm(
      `Удалить вакансию «${job.title}» из ${job.company}?`,
    );

    if (!confirmed) return;

    try {
      setError("");
      const updatedJobs = await removeJob(job.id);
      setJobs(updatedJobs);

      if (editingId === job.id) {
        resetForm();
      }
    } catch {
      setError(`Не удалось удалить вакансию «${job.title}».`);
    }
  }

  return (
    <main className="app">
      <header className="app-header">
        <h1>Job Tracker</h1>
        <p>Отслеживай вакансии и этапы поиска работы.</p>
      </header>

      {error && (
        <div className="error-message" role="alert">
          {error}
        </div>
      )}

      <section className="job-form-section">
        <h2>
          {editingId !== null
            ? "Редактировать вакансию"
            : "Добавить вакансию"}
        </h2>

        <form onSubmit={handleSubmit}>
          <label>
            Название вакансии *
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Junior Node.js Developer"
              required
            />
          </label>

          <label>
            Компания *
            <input
              name="company"
              value={form.company}
              onChange={handleChange}
              placeholder="Название компании"
              required
            />
          </label>

          <label>
            Статус
            <select name="status" value={form.status} onChange={handleChange}>
              <option value="not_sent">Не отправлено</option>
              <option value="pending">На рассмотрении</option>
              <option value="rejected">Отказ</option>
              <option value="accepted">Принято</option>
            </select>
          </label>

          <label>
            Ссылка на вакансию
            <input
              name="url"
              type="url"
              value={form.url}
              onChange={handleChange}
              placeholder="https://example.com/job"
            />
          </label>

          <label>
            Описание
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Требования, заметки и детали"
              rows={4}
            />
          </label>

          <div className="form-actions">
            <button type="submit" disabled={saving}>
              {saving
                ? "Сохранение..."
                : editingId !== null
                  ? "Сохранить изменения"
                  : "Добавить вакансию"}
            </button>

            {editingId !== null && (
              <button type="button" onClick={resetForm} disabled={saving}>
                Отмена
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="jobs-section">
        <h2>Мои вакансии ({jobs.length})</h2>

        {loading ? (
          <p>Загрузка вакансий...</p>
        ) : jobs.length === 0 ? (
          <p>Пока нет вакансий. Добавь первую через форму выше.</p>
        ) : (
          <div className="jobs-list">
            {jobs.map((job) => (
              <article className="job-card" key={job.id}>
                <div className="job-card-header">
                  <div>
                    <h3>{job.title}</h3>
                    <p>{job.company}</p>
                  </div>

                  <select
                    aria-label={`Статус вакансии ${job.title}`}
                    value={job.status}
                    onChange={(event) =>
                      void handleStatusChange(
                        job,
                        event.target.value as JobStatus,
                      )
                    }
                  >
                    <option value="not_sent">Не отправлено</option>
                    <option value="pending">На рассмотрении</option>
                    <option value="rejected">Отказ</option>
                    <option value="accepted">Принято</option>
                  </select>
                </div>

                {job.description && <p>{job.description}</p>}

                {job.url && (
                  <p>
                    <a href={job.url} target="_blank" rel="noreferrer">
                      Открыть вакансию
                    </a>
                  </p>
                )}

                <div className="job-card-footer">
                  <small>
                    Создана: {new Date(job.createdAt).toLocaleDateString()}
                  </small>

                  <div className="job-actions">
                    <button type="button" onClick={() => startEditing(job)}>
                      Редактировать
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleDelete(job)}
                    >
                      Удалить
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default App;
