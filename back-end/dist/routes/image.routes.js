import { Router } from "express";
import { upload } from "../middlewares/upload.js";
import { melhorarImagem } from "../controllers/image.controller.js";
const router = Router();
router.post("/melhorar-imagem", upload.single("imagem"), melhorarImagem);
export default router;
