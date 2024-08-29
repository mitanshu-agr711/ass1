import express from "express";
import { con } from "./db.js";

const router = express.Router();

router.post("/addSchool", async (req, res) => {
    const { name, address, latitude, longitude } = req.body;

    if (!name || typeof name !== "string" || name.trim() === "") {
        return res.status(400).json({ error: "Invalid or missing 'name'." });
    }

    if (!address || typeof address !== "string" || address.trim() === "") {
        return res.status(400).json({ error: "Invalid or missing 'address'." });
    }

    const lat = parseFloat(latitude);
    if (isNaN(lat) || lat < -90 || lat > 90) {
        return res.status(400).json({ error: "Invalid 'latitude'. Must be a number between -90 and 90." });
    }

    const lon = parseFloat(longitude);
    if (isNaN(lon) || lon < -180 || lon > 180) {
        return res.status(400).json({ error: "Invalid 'longitude'. Must be a number between -180 and 180." });
    }

 
    try {
        const connection = await con.getConnection();
        const [result] = await connection.query(
            "INSERT INTO schools (name, address, latitude, longitude) VALUES (?, ?, ?, ?)",
            [name.trim(), address.trim(), lat, lon]
        );
        connection.release();

        res.status(201).json({
            message: "School added successfully",
            schoolId: result.insertId
        });
    } catch (error) {
        console.error("Error inserting school:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

export default router;
