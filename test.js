const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const path = require("path");

// Function to upload a file
async function uploadFile(apiUrl, filePath, defaultPassword) {
    try {
        // Ensure file exists
        if (!fs.existsSync(filePath)) {
            console.error("Error: File not found!");
            return;
        }

        // Prepare form data
        const formData = new FormData();
        formData.append("file", fs.createReadStream(filePath));
        formData.append("defaultPassword", defaultPassword);

        // Send POST request
        const response = await axios.post(apiUrl, formData, {
            headers: {
                ...formData.getHeaders(),
            },
        });

        console.log("✅ File uploaded successfully:", response.data);
    } catch (error) {
        console.error("❌ Error uploading file:", error.response ? error.response.data : error.message);
    }
}

// Usage example
const API_URL = "http://localhost:5000/api/registerusers";  // Change this to match your API endpoint
const FILE_PATH = path.join(__dirname, "users.csv"); // Replace with the actual CSV file path
const DEFAULT_PASSWORD = "Password123";        // Replace with the desired default password
const UNIVERSITY_UUID = "";

uploadFile(API_URL, FILE_PATH, DEFAULT_PASSWORD, UNIVERSITY_UUID);