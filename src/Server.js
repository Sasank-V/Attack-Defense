const express = require("express");
const app = express();
const {
  initDB,
  createAdmin,
  insertRandomUsers,
} = require("./Utils/Database.js");
const { loginLimiter, logActivity, log, getLogs } = require("./Utils/Middleware.js");

const connection = initDB();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(log);

// createAdmin(connection);
// insertRandomUsers(100,connection);

//Signup Route
app.post("/signup", (req, res) => {
  try {
      const { name, pass } = req.body;
      const insertQuery = `INSERT INTO users (name, pass) VALUES (?, ?)`;
      connection.query(insertQuery, [name, pass], (err, result) => {
          if (err) {
              console.error("Error during signup:", err);
              return res.status(500).json({
                  success: false,
                  message: "Internal Server Error while signup",
              });
          }
          return res.status(200).json({
              success: true,
              message: "User signup successfully",
          });
      });
  } catch (err) {
      console.error(err);
      return res.status(500).json({
          success: false,
          message: "Internal Server Error while signup",
      });
  }
});


//Brute-Force Routes
app.post("/unsafe-login", (req, res) => {
  try {
    const { name, pass } = req.body;
    const checkUserQuery = `SELECT * FROM users WHERE name = ?`;
    connection.query(checkUserQuery, [name], (err, results) => {
      if (err) throw err;
      if (results.length === 0) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }
      const user = results[0];
      if (user.pass === pass) {
        // Successful login, reset failed attempts
        return res.status(200).json({
          success: true,
          message: "Login successful!",
        });
      } else {
        return res.status(200).json({
          success: false,
          message: "Incorrect password",
        });
      }
    });
  } catch (error) {}
});

//Also Implemented Request limiter for a IP 
app.post("/safe-login", loginLimiter, (req, res) => {
  try {
    const { name, pass } = req.body;

    // Fetch user details to validate and track failed attempts
    const checkUserQuery = `SELECT * FROM users WHERE name = ?`;
    connection.query(checkUserQuery, [name], (err, results) => {
      if (err) throw err;

      // Check if user exists
      if (results.length === 0) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      const user = results[0];
      const MAX_ATTEMPTS = 5; // Maximum allowed attempts
      const LOCKOUT_DURATION = 5 * 60 * 1000; // 5 minutes

      const currentTime = new Date();

      // Check if user is locked out
      if (
        user.failed_attempts >= MAX_ATTEMPTS &&
        user.last_failed_attempt &&
        currentTime - new Date(user.last_failed_attempt) < LOCKOUT_DURATION
      ) {
        //Brute Force Logging
        logActivity("Brute Force", {
          source: req.ip,
          method: req.method,
          target: "/safe-login",
          username: name,
          attempt: user.failed_attempts,
        });

        return res.status(429).json({
          success: false,
          message:
            "Account is locked due to too many failed attempts. Try again later.",
        });
      }

      // Verify password
      if (user.pass === pass) {
        // Successful login, reset failed attempts
        const resetAttemptsQuery = `UPDATE users SET failed_attempts = 0, last_failed_attempt = NULL WHERE name = ?`;
        connection.query(resetAttemptsQuery, [name], (err) => {
          if (err) throw err;

          return res.status(200).json({
            success: true,
            message: "Login successful!",
          });
        });
      } else {
        // Incorrect password, increment failed attempts
        const incrementAttemptsQuery = ` UPDATE users SET failed_attempts = failed_attempts + 1, last_failed_attempt = NOW() WHERE name = ?`;
        connection.query(incrementAttemptsQuery, [name], (err) => {
          if (err) throw err;

          return res.status(401).json({
            success: false,
            message: "Invalid credentials. Failed attempt recorded.",
          });
        });
      }
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error during login",
    });
  }
});

//SQL Injection Routes
app.get("/unsafe-profile/:name", (req, res) => {
  try {
    const { name } = req.params;
    //Vulnerable Query
    const checkUserQuery = `SELECT * FROM users WHERE name = ${name}`;
    connection.query(checkUserQuery, (err, results) => {
      if (err) throw err;

      // Check if user exists
      if (results.length === 0) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "User profile found",
        data: results,
      });
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error during getting profile ",
    });
  }
});

app.get("/safe-profile/:name", (req, res) => {
  try {
    const { name } = req.params;

    //SQL Injection Detection
    const sqlInjectionPattern = /('|;|--|\bOR\b|\bAND\b)/i; // Basic detection
    if (sqlInjectionPattern.test(name)) {
      //SQL Injection Logging
      logActivity("SQL Injection", {
        source: req.ip,
        method: req.method,
        target: `/safe-profile/${decodeURIComponent(name)}`,
        injectedQuery: `SELECT * FROM users WHERE name = ${name}`,
      });
      return res.status(400).json({
        success: false,
        message: "Malicious activity detected. Query blocked.",
      });
    }

    //Processing Query using Placeholders
    const checkUserQuery = `SELECT * FROM users WHERE name = ?`;
    connection.query(checkUserQuery, [name], (err, results) => {
      if (err) throw err;

      // Check if user exists
      if (results.length === 0) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "User profile found",
        data: results,
      });
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error during getting profile ",
    });
  }
});

//Get logs Routes
app.get("/logs", async (req, res) => {
    const logs = await getLogs();
    // console.log(logs);
    res.status(200).json({
      success:true,
      message: "Logs sent",
      logs
    });
});

//404 Not Found
app.use("/*", (req, res) => {
  connection.query("SHOW TABLES", (err, res) => {
    if (err) console.log(err);
    console.log(res);
  });
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
