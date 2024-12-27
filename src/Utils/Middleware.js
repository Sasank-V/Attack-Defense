const fs = require('fs');
const path = require('path');
const rateLimit = require("express-rate-limit");
const { promises: fsPromises } = fs;

const logFilePath = path.join(__dirname, '../attack_logs.json');

// Ensure log file exists
if (!fs.existsSync(logFilePath)) {
    fs.writeFileSync(logFilePath, JSON.stringify([])); // Create an empty log file
}

const writeQueue = [];
let isWriting = false;

// Process the write queue
const processQueue = async () => {
    if (isWriting || writeQueue.length === 0) return;
    isWriting = true;

    const { logEntry, resolve, reject } = writeQueue.shift();
    try {
        let logs = [];
        const data = await fsPromises.readFile(logFilePath, 'utf-8');
        logs = data.length ? JSON.parse(data) : [];
        logs.push(logEntry);
        await fsPromises.writeFile(logFilePath, JSON.stringify(logs, null, 2));
        resolve();
    } catch (error) {
        reject(error);
    } finally {
        isWriting = false;
        processQueue();
    }
};

// Function to add log entries to the queue
const queueLogActivity = (logEntry) => {
    return new Promise((resolve, reject) => {
        writeQueue.push({ logEntry, resolve, reject });
        processQueue();
    });
};

// Function to log activity
const logActivity = async (type, details) => {
    const logEntry = {
        timestamp: new Date().toISOString(),
        type,
        details,
    };
    try {
        await queueLogActivity(logEntry);
    } catch (error) {
        console.error("Error logging activity:", error);
    }
};

module.exports.log = (req, res, next) => {
    logActivity("Normal", {
        source: req.ip,
        method: req.method,
        target: `${req.originalUrl}`,
    });
    next();
};

module.exports.loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 10 login requests per window
    message: {
        success: false,
        message: "Too many login attempts, please try again later.",
    }
});

module.exports.logActivity = logActivity;

// Function to get all logs
module.exports.getLogs = () => {
    return new Promise((resolve, reject) => {
        fs.readFile(logFilePath, 'utf-8', (err, data) => {
            if (err) return reject(new Error("Error reading logs."));
            try {
                const logs = data.length ? JSON.parse(data) : [];
                resolve(logs);
            } catch (parseError) {
                console.error("Corrupted log file detected. Resetting file.");
                fs.writeFileSync(logFilePath, JSON.stringify([])); // Reset file
                resolve([]); // Return an empty array
            }
        });
    });
};

