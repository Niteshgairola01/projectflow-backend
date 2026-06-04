import { Router } from "express";
import { login, logout, me, refreshToken, register } from "../../controllers/auth.controller.js";
import { validate } from "../../middlewares/validate.js";
import { loginSchema, registerSchema } from "../../validations/auth.validation.js";
import { authenticateUser } from "../../middlewares/auth.js";

const router = Router();

router.post("/register",
    validate(registerSchema),
    register
);

router.post("/login",
    validate(loginSchema),
    login
);

router.post("/refresh", refreshToken);

router.post("/logout", logout);

router.get("/me", authenticateUser, me);

export default router;