## Secure Authentication and SQL Injection Prevention Project

# Overview

    This project demonstrates the implementation of secure authentication mechanisms, brute-force attack prevention, and SQL injection detection and mitigation. The system is designed using Node.js and MySQL, with a focus on secure coding practices.

# Features

    1. Authentication

User Signup: Securely adds a new user to the database with username and password.

Safe Login: Implements brute-force attack prevention and account lockout after multiple failed attempts.

Unsafe Login: Demonstrates a vulnerable login endpoint to highlight risks.

    2. Brute-Force Protection

Rate Limiting: Limits login attempts per IP to prevent automated brute-force attacks.

Account Lockout: Temporarily locks user accounts after a configurable number of failed attempts.

    3. SQL Injection Prevention

Unsafe Profile Endpoint: Demonstrates a vulnerable endpoint that is susceptible to SQL injection.

Safe Profile Endpoint: Uses parameterized queries and detects potential SQL injection attempts.

    4. Activity Logging

Logs brute-force and SQL injection attempts in a JSON file (attack_logs.json).

Logs normal requests with source IP, method, and target.

# Folder Structure

project/
|-- src/
|   |-- Utils/
|   |   |-- Database.js         # Database initialization and helper functions
|      |-- Middleware.js       # Logging and rate-limiting logic
|   |-- Client.js               # Client-side script to test endpoints
|   |-- Server.js               # Main server logic
|   |-- .env                        # Environment variables
|   |-- attack_logs.json            # JSON file to log malicious activities

# Technologies Used

    Backend: Node.js, Express.js

    Database: MySQL

    Middleware: express-rate-limit

    Testing: Client.js (manual testing script)

# Installation

    1.Clone the repository:

        git clone https://github.com/Sasank-V/Attack-Defense.git

    2 .Install dependencies:

        npm install
        

    3.Set up the .env file with your MySQL credentials:

        DB_NAME=your_database_name
        DB_PASS=your_password

    4.Initialize the database and create required tables (e.g., users).
        Install mysql and create a database
        Create a table called "users" with schema ( name varchar(50) , pass int)
# Usage

    1.Start the Server : node src/Server.js
    2. Go to Client.js and uncomment the  particular function to test them

# Endpoints

    1.Authentication

        Signup

            URL: /signup

            Method: POST

            Body: { "name": "username", "pass": "password" }

        Unsafe Login

            URL: /unsafe-login

            Method: POST

            Body: { "name": "username", "pass": "password" }

        Safe Login

            URL: /safe-login

            Method: POST

            Body: { "name": "username", "pass": "password" }

    2.SQL Injection

        Unsafe Profile

            URL: /unsafe-profile/:name

            Method: GET

        Safe Profile

            URL: /safe-profile/:name

            Method: GET

    3.Logs

        URL: /logs

        Method: GET

        Response: JSON containing logs of detected malicious activities and normal requests.



# Security Features

1. Parameterized Queries: Prevent SQL injection by using placeholders.

2. Rate Limiting: Prevent brute-force attacks by limiting requests per IP.

3. Account Lockout: Lock accounts after repeated failed login attempts.

4. Activity Logging: Log details of brute-force and SQL injection attempts.

# Future Improvements

    Hashing passwords using libraries like bcrypt.

    Implementing user roles and permissions.

    Using an ORM like Sequelize for database interactions.

    Deploying the application securely with HTTPS.

# Acknowledgments

Inspired by common security vulnerabilities and practices in web development.

Utilized @faker-js/faker for generating dummy data.

