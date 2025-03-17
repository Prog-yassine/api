const express = require("express");
const router = express.Router();
const supabase = require("../config/supabase/supabase");

// Route for user registration
router.post("/register", async (req, res) => {
    const { email, password, company_name } = req.body;

    if (!email || !password || !company_name) {
        return res.status(400).json({ error: "Email, password, and full name are required" });
    }

    try {
        // Create user with Supabase authentication
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
        });

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        const user_id = data.user.id;

        // Insert additional user details into user_data table
        const { error: insertError } = await supabase
            .from("user_data")
            .insert([{ user_id, email, company_name }]);

        if (insertError) {
            return res.status(500).json({ error: "Failed to insert user data" });
        }

        res.status(201).json({ message: "User registered successfully", user: data.user });
    } catch (err) {
        console.error("Registration error:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;