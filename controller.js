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

    const lon = parseFloat(longitude);//isNaN() function is used to check if the value is a number or not.
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

// Function to calculate distance between two coordinates (Haversine formula)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const toRadians = (degrees) => degrees * (Math.PI / 180);
    const R = 6371; // Earth’s radius in kilometers

    const distanceLatitude = toRadians(lat2 - lat1);
    const distanceLongitude = toRadians(lon2 - lon1);
    const a = 
        Math.sin(distanceLatitude / 2) ** 2 +
        Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
        Math.sin(distanceLongitude / 2) ** 2;

    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
};

router.get("/listSchools", async (req, res) => {
    const { latitude, longitude } = req.query;
    const userLat = parseFloat(latitude);
    const userLon = parseFloat(longitude);

    // Simple validation
    if (![userLat, userLon].every(coord => !isNaN(coord) && coord !== null)) {
        return res.status(400).json({ error: "Invalid latitude or longitude." });
    }

    try {
        const [schools] = await con.query("SELECT id, name, address, latitude, longitude FROM schools");

        const sortedSchools = schools
            .map(school => ({
                ...school,
                distance: calculateDistance(userLat, userLon, school.latitude, school.longitude)
            }))
            .sort((a, b) => a.distance - b.distance);

        res.status(200).json(sortedSchools);
    } catch (error) {
        console.error("Error fetching schools:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});





export default router;
