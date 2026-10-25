import { Router } from "express";
import { resetPassword, forgotPassword, getUserById, login, logout, me, refreshToken, register } from "../../controllers/auth.controller.js";
import { validate } from "../../middlewares/validate.js";
import { resetPasswordSchema, forgotPasswordSchema, loginSchema, registerSchema } from "../../validations/auth.validation.js";
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

router.post("/forgot-password",
    validate(forgotPasswordSchema),
    forgotPassword
);

router.post("/reset-password",
    validate(resetPasswordSchema),
    resetPassword
);

router.post("/refresh", refreshToken);

router.post("/logout", logout);

router.get("/me", authenticateUser, me);

router.get("/user/:userId", authenticateUser, getUserById);

export default router;