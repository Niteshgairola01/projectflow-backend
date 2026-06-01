import express from "express";
import cors from "cors";

const app = express();

// cors
app.use(
    cors({
        origin: process.env.CLIENT_URL,
        credentials: true
    })
);

app.use(express.json());

export default app;