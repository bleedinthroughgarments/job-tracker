const pool = require("../config/db");

const ALLOWED_STATUSES = [
    "not_sent",
    "pending",
    "rejected",
    "accepted"
];

async function getJobs(req, res) {
    try {
        const result = await pool.query(`
            SELECT
                id,
                title,
                company,
                description,
                url,
                status,
                created_at AS "createdAt"
            FROM jobs
            ORDER BY created_at DESC
        `);

        return res.status(200).json(result.rows);
    } catch (error) {
        console.error("Failed to fetch jobs:", error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
}

async function createJob(req, res) {
    try {
        const { title, company, url, description } = req.body;

        if (typeof title !== "string" || title.trim() === "") {
            return res.status(400).json({
                message: "Invalid title"
            });
        }

        if (typeof company !== "string" || company.trim() === "") {
            return res.status(400).json({
                message: "Invalid company"
            });
        }

        let trimmedUrl = null;
        let trimmedDesc = null;

        if (url !== undefined) {
            if (url !== null && typeof url !== "string") {
                return res.status(400).json({
                    message: "Invalid URL"
                });
            }

            trimmedUrl = url === null ? null : url.trim() || null;
        }

        if (description !== undefined) {
            if (
                description !== null &&
                typeof description !== "string"
            ) {
                return res.status(400).json({
                    message: "Invalid description"
                });
            }

            trimmedDesc =
                description === null
                    ? null
                    : description.trim() || null;
        }

        const result = await pool.query(
            `INSERT INTO jobs (title, company, description, url)
             VALUES ($1, $2, $3, $4)
             RETURNING
                id,
                title,
                company,
                description,
                url,
                status,
                created_at AS "createdAt"`,
            [
                title.trim(),
                company.trim(),
                trimmedDesc,
                trimmedUrl
            ]
        );

        return res.status(201).json({
            message: "Successfully created",
            data: result.rows[0]
        });
    } catch (error) {
        console.error("Failed to create job:", error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
}

async function updateJob(req, res) {
    try {
        const { title, company, url, description, status } = req.body;
        const { id } = req.params;
        const updateData = {};

        if (title !== undefined) {
            if (typeof title !== "string" || title.trim() === "") {
                return res.status(400).json({
                    message: "Invalid title"
                });
            }

            updateData.title = title.trim();
        }

        if (company !== undefined) {
            if (typeof company !== "string" || company.trim() === "") {
                return res.status(400).json({
                    message: "Invalid company"
                });
            }

            updateData.company = company.trim();
        }

        if (url !== undefined) {
            if (url !== null && typeof url !== "string") {
                return res.status(400).json({
                    message: "Invalid URL"
                });
            }

            updateData.url =
                url === null ? null : url.trim() || null;
        }

        if (description !== undefined) {
            if (
                description !== null &&
                typeof description !== "string"
            ) {
                return res.status(400).json({
                    message: "Invalid description"
                });
            }

            updateData.description =
                description === null
                    ? null
                    : description.trim() || null;
        }

        if (status !== undefined) {
            if (
                typeof status !== "string" ||
                !ALLOWED_STATUSES.includes(status.trim())
            ) {
                return res.status(400).json({
                    message: "Invalid status"
                });
            }

            updateData.status = status.trim();
        }

        const entries = Object.entries(updateData);

        if (entries.length === 0) {
            return res.status(400).json({
                message: "Nothing to update"
            });
        }

        const values = entries.map(([, value]) => value);

        const setClause = entries
            .map(([key], index) => `${key} = $${index + 1}`)
            .join(", ");

        const result = await pool.query(
            `UPDATE jobs
             SET ${setClause}
             WHERE id = $${values.length + 1}
             RETURNING
                id,
                title,
                company,
                description,
                url,
                status,
                created_at AS "createdAt"`,
            [...values, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Job not found"
            });
        }

        return res.status(200).json({
            message: "Successfully updated",
            data: result.rows[0]
        });
    } catch (error) {
        console.error("Failed to update job:", error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
}

async function deleteJob(req, res) {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `DELETE FROM jobs
             WHERE id = $1
             RETURNING id`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Job not found"
            });
        }

        return res.status(200).json({
            message: "Job successfully deleted"
        });
    } catch (error) {
        console.error("Failed to delete a job:", error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
}

module.exports = {
    getJobs,
    createJob,
    updateJob,
    deleteJob
};
