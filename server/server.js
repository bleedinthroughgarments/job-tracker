const express = require("express");
const app = express();

const jobRoutes = require("./routes/jobRoutes");

app.use(express.json());

app.use("/api/jobs", jobRoutes);

app.get("/health", (req, res) => {
    res.json({ status: "ok" });
});

app.listen(3000, () => {
    console.log("server is running on http://localhost:3000");
});