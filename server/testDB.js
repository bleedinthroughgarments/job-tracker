const pool = require("./config/db");

pool.query("SELECT * FROM jobs;")
    .then(result => {
        console.log(result.rows)
    })
    .catch(error => {
        console.error(error.message)
    });