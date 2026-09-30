import "dotenv/config";

import express from "express";
import cors from "cors";

import imageRoutes from "./routes/image.routes.js";

const app = express();

const PORT = Number(process.env.PORT) || 3000;

app.use(
  cors({
    origin: "http://localhost:5173",
    exposedHeaders: ["X-OpenAI-Usage"],
  }),
);

app.use(express.json());

app.use(imageRoutes);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
