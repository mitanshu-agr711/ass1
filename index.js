import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import { con } from "./db.js";

dotenv.config();

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));

app.use(express.json());


app.listen(process.env.PORT || 8000, () => {
    console.log(`Server is running on port ${process.env.PORT || 8000}`);
});

(async () => {
    try {
        const connection = await con.getConnection();
        await connection.query('SELECT 1');
        console.log("Connected successfully to the database");
        connection.release();  
    } catch (error) {
        console.error("Error connecting to the database:", error);
    }
})();

export { app };
