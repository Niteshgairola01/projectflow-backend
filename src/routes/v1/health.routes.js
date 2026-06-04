import { Router } from "express";
import { HTTP_STATUS } from "../../constants/httpStatus";

const router = Router();

router.get("/", (req, res) => {
    res.status(HTTP_STATUS.OK).json({
        success: true,
        message: "Server running"
    });
});

export default router;