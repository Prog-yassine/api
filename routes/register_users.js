const express = require("express");
const router = express.Router();
const fs = require("fs");
const csv = require("csv-parser");
const multer = require("multer");
const supabase = require("../config/supabase/supabase");

// Configure multer for file uploads
const upload = multer({ dest: "uploads/" });

// Function to register a single user
async function registerUser(user, defaultPassword, universityuuid) {
    try {
        console.log(`Registering user: ${JSON.stringify(user)}`);

        // Vérifier que l'email est valide
        if (!user.email || !user.email.includes("@")) {
            console.error(`Invalid email detected: ${user.email}`);
            return { success: false, error: "Invalid email format" };
        }

        // Inscription de l'utilisateur dans Supabase Auth
        const { data, error } = await supabase.auth.signUp({
            email: user.email,
            password: defaultPassword,
        });

        if (error) {
            console.error(`Error registering ${user.email}:`, error.message);
            return { success: false, error: error.message };
        }

        // Vérifier si `data.user` existe
        if (!data || !data.user) {
            console.error(`No user data returned for ${user.email}`);
            return { success: false, error: "User registration failed" };
        }

        // Insérer les détails de l'utilisateur dans la table `user_data`
        const { error: dbError } = await supabase.from("user_data").insert([
            {
                uuid: data.user.id, // Utiliser l'ID de l'utilisateur créé
                email: user.email,
                university_uuid: universityuuid,
                birthday: user.birthday,
                first_name: user.first_name, // Correction de "fist_name"
                last_name: user.last_name,
                role: user.role,
                group: [user.group],
            },
        ]);

        if (dbError) {
            console.error(`Error inserting user ${user.email} into DB:`, dbError.message);
            return { success: false, error: dbError.message };
        }

        return { success: true, user: data.user };
    } catch (err) {
        console.error(`Unexpected error for ${user.email}:`, err);
        return { success: false, error: "Internal server error" };
    }
}

// Route to bulk register users from CSV
router.post("/", upload.single("file"), async (req, res) => {
    if (!req.file || !req.body.defaultPassword) {
        return res.status(400).json({ error: "CSV file and default password are required" });
    }
    
    const filePath = req.file.path;
    const defaultPassword = req.body.defaultPassword;
    let users = [];
    
    // Read CSV file
    fs.createReadStream(filePath)
        .pipe(csv())
        .on("data", (row) => {
            users.push(row);
        })
        .on("end", async () => {
            let results = [];
            for (let user of users) {
                let result = await registerUser(user, defaultPassword);
                results.push({ email: user.email, status: result.success ? "Registered" : result.error });
            }
            fs.unlinkSync(filePath); // Delete the uploaded file after processing
            res.json({ message: "Bulk registration completed", results });
        })
        .on("error", (error) => {
            console.error("CSV Read Error:", error);
            res.status(500).json({ error: "Error reading CSV file" });
        });
});

module.exports = router;