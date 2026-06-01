import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        const connection = await mongoose.connect(process.env.DB_URL);
        console.log(`DB connected: ${connection.connection.host}`);
    } catch {
        console.log("DB connection failed");
        process.exit(1);
    }
}