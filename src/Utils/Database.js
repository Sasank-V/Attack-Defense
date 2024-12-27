const mysql = require('mysql2');
const dotenv = require("dotenv");
const { faker } = require('@faker-js/faker');
dotenv.config();


// Create the connection to database
module.exports.initDB = () => {
    const connection = mysql.createConnection({
      host: 'localhost',
      user: 'root',
      database: process.env.DB_NAME,
      password: process.env.DB_PASS
    });
    return connection;

}
console.log("MySQL Connected");

// Insert admin user
module.exports.createAdmin = (connection) => {
    try {
        connection.query(
            "INSERT INTO users (name, pass) VALUES (?, ?)",
            ["admin", "1234"],
            (err, result) => {
                if (err) throw err;
                console.log("Admin created:", result);
            }
        );
    } catch (e) {
        console.log("DB Error: ", e);
    }
};

module.exports.insertRandomUsers = (count = 100, connection) => {
    try {
        const data = [];
        for (let i = 0; i < count; i++) {
            data.push(createRandomUser()); // Generate random users
        }

        connection.query("INSERT INTO users (name, pass) VALUES ?", [data], (err, result) => {
            if (err) throw err;
            console.log(`${count} random users inserted!`, result);
        });
    } catch (e) {
        console.log("DB Error: ", e);
    }
};

// Generate a random user
function createRandomUser() {
    const username = faker.internet.username().substring(0, 50); // Ensure username is max 50 characters
    const password = Math.floor(1000 + Math.random() * 9000); // Generate a 4-digit password
    return [username, password.toString()]; // Return username and password as an array
}

// Call functions
// createAdmin();
// insertRandomUsers();

