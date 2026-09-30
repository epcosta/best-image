import OpenAI, { toFile } from "openai";
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});
export async function melhorarImagem(buffer, nomeArquivo, mimetype) {
    const imagem = await toFile(buffer, nomeArquivo, {
        type: mimetype,
    });
    console.log("Arquivo enviado para OpenAI:");
    console.log("Nome:", imagem.name);
    console.log("Tipo:", imagem.type);
    console.log("Tamanho:", imagem.size);
    const response = await openai.images.edit({
        model: "gpt-image-2.5-sunburst",
        image: imagem,
        prompt: `
      Melhore a qualidade visual desta imagem.

      Preserve fielmente o conteúdo original.

      Melhore:
      - resolução;
      - nitidez;
      - definição dos detalhes;
      - iluminação;
      - contraste;
      - redução de ruído;
      - artefatos de compressão.

      Não altere:
      - pessoas;
      - rostos;
      - objetos;
      - textos;
      - cores principais;
      - enquadramento;
      - composição da imagem.

      O resultado deve parecer uma versão de maior qualidade
      da imagem original, e não uma nova imagem.
    `,
        quality: "high",
        size: "auto",
        output_format: "png",
    });
    const imagemBase64 = response.data?.[0]?.b64_json;
    if (!imagemBase64) {
        throw new Error("A OpenAI não retornou a imagem processada.");
    }
    console.log("USAGE OPENAI:");
    console.log(response.usage);
    return {
        buffer: Buffer.from(imagemBase64, "base64"),
        usage: response.usage,
    };
}
