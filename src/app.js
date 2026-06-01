import express from "express";
import cors from "cors";
import v1Router from "./routes/v1/index.js";
import notFound from "./middlewares/notFound.js";
import errorHandler from "./middlewares/errorHandler.js";

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


// middlewares
app.use(notFound);
app.use(errorHandler);

export default app;