import express from "express";
import cors from "cors";
import v1Router from "./routes/v1/index.js";

const app = express();

// cors
app.use(
    cors({
        origin: process.env.CLIENT_URL,
        credentials: true
    })
);

app.use(express.json());

// routes
app.use("/api/v1", v1Router)

export default app;