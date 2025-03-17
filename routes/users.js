const express = require("express");
const router = express.Router();
const supabase = require("../config/supabase/supabase");

// Route pour récupérer un utilisateur avec ses modules associés et son emploi du temps
router.get("/:uuid", async (req, res) => {
    const { uuid } = req.params;

    console.log(`Recherche de l'utilisateur avec l'UUID: ${uuid}`);

    // 1️⃣ Récupérer l'utilisateur avec son rôle
    const { data: user, error: userError } = await supabase
        .from("user_data")
        .select("*")
        .eq("uuid", uuid)
        .single();

    if (userError) {
        console.error("Erreur Supabase (User):", userError.message);
        return res.status(400).json({ error: userError.message });
    }

    console.log(`Utilisateur trouvé:`, user);

    let modules = [];
    let schedule = [];

    if (user.role === "student" && user.group) {
        // 🎓 Étudiant → récupérer les modules par groupe
        console.log(`Groupe de l'utilisateur:`, user.group);

        const { data: studentModules, error: studentModulesError } = await supabase
            .from("modules")
            .select("*")
            .filter("metadata", "cs", `["${user.group}"]`);

        if (studentModulesError) {
            console.error("Erreur Supabase (Modules Étudiant):", studentModulesError.message);
            return res.status(400).json({ error: studentModulesError.message });
        }

        modules = studentModules;

        // 🎓 Récupérer l'emploi du temps par groupe
        const { data: studentSchedule, error: studentScheduleError } = await supabase
            .from("schedule")
            .select("*")
            .filter("group", "cs", `["${user.group}"]`);

        if (studentScheduleError) {
            console.error("Erreur Supabase (Emploi du temps Étudiant):", studentScheduleError.message);
            return res.status(400).json({ error: studentScheduleError.message });
        }

        schedule = studentSchedule;

    } else if (user.role === "teacher") {
        // 👨‍🏫 Enseignant → récupérer les modules par teacher_uuid
        console.log(`L'utilisateur est un enseignant, récupération des modules`);

        const { data: teacherModules, error: teacherModulesError } = await supabase
            .from("modules")
            .select("*")
            .filter("teacher_uuid", "cs", `"${user.uuid}"`);

        if (teacherModulesError) {
            console.error("Erreur Supabase (Modules Enseignant):", teacherModulesError.message);
            return res.status(400).json({ error: teacherModulesError.message });
        }

        modules = teacherModules;

        // 👨‍🏫 Récupérer l'emploi du temps par teacher_uuid
        const { data: teacherSchedule, error: teacherScheduleError } = await supabase
            .from("schedule")
            .select("*")
            .eq("teacher_uuid", user.uuid);

        if (teacherScheduleError) {
            console.error("Erreur Supabase (Emploi du temps Enseignant):", teacherScheduleError.message);
            return res.status(400).json({ error: teacherScheduleError.message });
        }

        schedule = teacherSchedule;
    }

    // 4️⃣ Retourner les données
    res.json({ user, modules, schedule });
});

module.exports = router;