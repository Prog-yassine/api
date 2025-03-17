const express = require("express");
const router = express.Router();
const supabase = require("../config/supabase/supabase");

// Route to fetch works by module_id
router.get("/:id", async (req, res) => {
    const { id } = req.params;

    try {
        // Fetch works from Supabase where module_id matches
        const { data, error } = await supabase
            .from("work") // Replace "works" with your actual table name
            .select("*")
            .eq("module_id", id);

        if (error) {
            console.error("Supabase error:", error);
            return res.status(500).json({ error: "Failed to fetch works" });
        }

        res.status(200).json(data);
    } catch (err) {
        console.error("Server error:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;