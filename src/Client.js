const { da } = require("@faker-js/faker");

const SERVER_URL = "http://localhost:3000";

const test = async () => {
    const res = await fetch(SERVER_URL);
    const text = await res.text();
    console.log(text);
};
// test();

const signupUser = async (name, pass) => {
    try {
        const res = await fetch(`${SERVER_URL}/signup`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name,
                pass
            })
        });

        const data = await res.json();
        if(!data.success){
            console.log("Error in signup: " ,data.message);
            return;
        }
        console.log("User signed up successfully:", data);
    } catch (err) {
        console.error("Error signing up user:", err);
    }
};

// Helper function for delays
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Function to emulate an unsafe brute-force attack
const unsafeLogin = async (name, pass) => {
    try {
        const res = await fetch(`${SERVER_URL}/unsafe-login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, pass }),
        });

        const data = await res.json();

        if (data.success) {
            console.log(`Unsafe Login Successful! Password: ${pass}`);
            return; // Stop the attack when successful
        } else {
            console.log(`Attempt with password ${pass} failed. Trying next...`);
            // Try the next password with a delay
            await delay(500); // Add 500ms delay to mimic real brute-force behavior
            unsafeLogin(name, pass + 1); // Increment password and retry
        }
    } catch (err) {
        console.error("Error during unsafe login attempt:", err);
    }
};

// Function to emulate a safe brute-force attack (respects lockout logic)
const safeLogin = async (name, pass) => {
    try {
        const res = await fetch(`${SERVER_URL}/safe-login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, pass }),
        });

        const data = await res.json();

        if (data.success) {
            console.log(`Safe Login Successful! Password: ${pass}`);
            return; // Stop the attack when successful
        } else if (data.message.includes("locked")) {
            console.log("Account locked. Waiting for lockout to expire...");
            // Wait for lockout duration (5 minutes) before retrying
            await delay(5 * 60 * 1000);
            safeLogin(name, pass + 1);
        } else {
            console.log(`Attempt with password ${pass} failed. Trying next...`);
            await delay(500); // Add 500ms delay to mimic behavior
            safeLogin(name, pass + 1);
        }
    } catch (err) {
        console.error("Error during safe login attempt:", err);
    }
};

//Function to emulate SQL injection
const unsafeProfileInjection = async (name) => {
    try {
        const res = await fetch(`${SERVER_URL}/unsafe-profile/${encodeURIComponent(name)}`,{
            method: "GET",
        })
        const data = await res.json();
        if(data.success){
            console.log("Profile Details: " ,data.data);
        }else{
            console.log("Error :" ,data.message);
        }

    } catch (error) {
        console.log("Error in getting Profile: ",error);
    }
}

//Function to emulate SQL Detection 
const safeProfileInjection = async (name) => {
    try {
        const res = await fetch(`${SERVER_URL}/safe-profile/${encodeURIComponent(name)}`,{
            method: "GET",
        })
        const data = await res.json();
        if(data.success){
            console.log("Profile Details: " ,data.data);
        }else{
            console.log("Error :" ,data.message);
        }

    } catch (error) {
        console.log("Error in getting Profile: ",error);
    }
}

//Function to get all logs
const getLogs = async () => {
    try {
        const res = await fetch(`${SERVER_URL}/logs`,{
            method: "GET",
        })
        const data = await res.json();
        if(data.success){
            // console.log(data);
            console.log("Log Details: " ,data.logs);
        }else{
            console.log("Error :" ,data.message);
        }

    } catch (error) {
        console.log("Error in getting Logs: ",error);
    }
}

//User signup
// signupUser("","")

// Start brute-force attack
// unsafeLogin("Sasank", 1000);
// safeLogin("Sasank", 1000);

//SQL Injection
// unsafeProfileInjection("'Sasank' OR '1'='1'");
// safeProfileInjection("'Sasank' OR '1'='1'");
// safeProfileInjection("Sasank");

//Get all Logs
// getLogs();



