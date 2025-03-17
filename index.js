const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// Importer les routes
const userRoutes = require("./routes/users");
const uploadRoutes = require("./routes/uploads")
const workRoutes = require("./routes/works")

const loginRoutes = require("./routes/login")
const registerUserRoutes = require("./routes/register_users")
const registerUnivRoutes = require("./routes/register_univ")


app.use("/api/users", userRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api/works", workRoutes);
app.use("/api/login", loginRoutes);
app.use("/api/registerusers", registerUserRoutes);
app.use("/api/registeruniv", registerUnivRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
