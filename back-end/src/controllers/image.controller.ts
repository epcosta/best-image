import type { Request, Response } from "express";

import { melhorarImagem as melhorarImagemService } from "../services/image.service.js";

export async function melhorarImagem(req: Request, res: Response) {
  try {
    if (!req.file) {
      res.status(400).json({
        msg: "Nenhuma imagem foi enviada.",
      });
      return;
    }

    console.log("Imagem recebida:");
    console.log("Nome:", req.file.originalname);
    console.log("Tipo:", req.file.mimetype);
    console.log("Tamanho:", req.file.size);

    console.log("Enviando imagem para OpenAI...");
    console.time("TEMPO OPENAI");

    const resultado = await melhorarImagemService(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype,
    );
    console.timeEnd("TEMPO OPENAI");
    console.log("Imagem processada com sucesso.");

    console.log("Tamanho imagem original:", req.file.size);

    console.log("Tamanho imagem melhorada:", resultado.buffer.length);

    console.log("Consumo OpenAI:");
    console.log(resultado.usage);

    res.setHeader("Content-Type", "image/png");

    res.setHeader(
      "Content-Disposition",
      'inline; filename="imagem-melhorada.png"',
    );
    if (resultado.usage) {
      res.setHeader("X-OpenAI-Usage", JSON.stringify(resultado.usage));
    }

    res.status(200).send(resultado.buffer);
  } catch (error) {
    console.error("ERRO AO MELHORAR IMAGEM:");
    console.error(error);

    res.status(500).json({
      msg: "Erro ao melhorar a imagem.",
      error: error instanceof Error ? error.message : "Erro desconhecido",
    });
  }
}
