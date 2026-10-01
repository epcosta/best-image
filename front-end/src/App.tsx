import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
} from "react";

import {
  Download,
  Image as ImageIcon,
  LoaderCircle,
  Sparkles,
  Upload,
  X,
} from "lucide-react";

type Dimensoes = {
  largura: number;
  altura: number;
};

type Usage = {
  input_tokens: number;
  output_tokens: number;
  total_tokens: number;

  input_tokens_details?: {
    image_tokens: number;
    text_tokens: number;
  };

  output_tokens_details?: {
    image_tokens: number;
    text_tokens: number;
  };
};

function App() {
  const inputRef = useRef<HTMLInputElement>(null);

  const [arquivo, setArquivo] = useState<File | null>(null);

  const [imagemOriginal, setImagemOriginal] = useState("");
  const [imagemMelhorada, setImagemMelhorada] = useState("");

  const [dimensaoOriginal, setDimensaoOriginal] = useState<Dimensoes | null>(
    null,
  );

  const [dimensaoMelhorada, setDimensaoMelhorada] = useState<Dimensoes | null>(
    null,
  );

  const [tamanhoMelhorada, setTamanhoMelhorada] = useState<number | null>(null);

  const [usage, setUsage] = useState<Usage | null>(null);

  const [processando, setProcessando] = useState(false);
  const [erro, setErro] = useState("");

  function formatarTamanho(bytes: number) {
    if (bytes < 1024) {
      return `${bytes} B`;
    }

    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(2)} KB`;
    }

    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  }

  function carregarArquivo(file: File) {
    const tiposPermitidos = ["image/png", "image/jpeg", "image/webp"];

    if (!tiposPermitidos.includes(file.type)) {
      setErro("Utilize uma imagem PNG, JPG ou WEBP.");
      return;
    }

    if (imagemOriginal) {
      URL.revokeObjectURL(imagemOriginal);
    }

    if (imagemMelhorada) {
      URL.revokeObjectURL(imagemMelhorada);
    }

    const url = URL.createObjectURL(file);

    setArquivo(file);
    setImagemOriginal(url);

    setImagemMelhorada("");
    setDimensaoMelhorada(null);
    setTamanhoMelhorada(null);
    setUsage(null);
    setErro("");
  }

  function selecionarImagem(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (file) {
      carregarArquivo(file);
    }
  }

  function arrastarImagem(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
  }

  function soltarImagem(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();

    const file = event.dataTransfer.files?.[0];

    if (file) {
      carregarArquivo(file);
    }
  }

  function removerImagem() {
    if (imagemOriginal) {
      URL.revokeObjectURL(imagemOriginal);
    }

    if (imagemMelhorada) {
      URL.revokeObjectURL(imagemMelhorada);
    }

    setArquivo(null);
    setImagemOriginal("");
    setImagemMelhorada("");
    setDimensaoOriginal(null);
    setDimensaoMelhorada(null);
    setTamanhoMelhorada(null);
    setUsage(null);
    setErro("");

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  async function melhorarImagem() {
    if (!arquivo) {
      setErro("Selecione uma imagem.");
      return;
    }

    try {
      setProcessando(true);
      setErro("");

      const formData = new FormData();

      formData.append("imagem", arquivo);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/melhorar-imagem`,
        {
          method: "POST",
          body: formData,
        },
      );
      //################ REMOVER DEPOIS DE TESTES ################
      console.log("STATUS:", response.status);
      console.log("OK:", response.ok);
      console.log("CONTENT-TYPE:", response.headers.get("content-type"));
      console.log("CONTENT-LENGTH:", response.headers.get("content-length"));
      //###########################################################

      if (!response.ok) {
        const data = await response.json();

        throw new Error(data.msg || "Erro ao melhorar imagem.");
      }

      const usageHeader = response.headers.get("X-OpenAI-Usage");

      if (usageHeader) {
        setUsage(JSON.parse(usageHeader));
      }

      const blob = await response.blob();

      if (imagemMelhorada) {
        URL.revokeObjectURL(imagemMelhorada);
      }

      //################ REMOVER DEPOIS DE TESTES ################
      console.log("BLOB:", blob);
      console.log("BLOB SIZE:", blob.size);
      console.log("BLOB TYPE:", blob.type);
      //###########################################################

      const url = URL.createObjectURL(blob);

      setImagemMelhorada(url);
      setTamanhoMelhorada(blob.size);
    } catch (error) {
      console.error(error);

      setErro(
        error instanceof Error ? error.message : "Erro ao processar imagem.",
      );
    } finally {
      setProcessando(false);
    }
  }

  function baixarImagem() {
    if (!imagemMelhorada) {
      return;
    }

    const link = document.createElement("a");

    link.href = imagemMelhorada;
    link.download = "imagem-melhorada.png";

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);
  }

  useEffect(() => {
    return () => {
      if (imagemOriginal) {
        URL.revokeObjectURL(imagemOriginal);
      }

      if (imagemMelhorada) {
        URL.revokeObjectURL(imagemMelhorada);
      }
    };
  }, [imagemOriginal, imagemMelhorada]);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      {/* HEADER */}

      <header className="border-b border-slate-800 bg-slate-900">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-6 py-5">
          <div className="rounded-xl bg-indigo-600 p-2">
            <Sparkles size={24} />
          </div>

          <div>
            <h1 className="text-xl font-bold">Best Image</h1>

            <p className="text-sm text-slate-400">Melhoria de imagens com IA</p>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-10">
        {/* TÍTULO */}

        <section className="mb-8">
          <h2 className="text-3xl font-bold">Melhore sua imagem</h2>

          <p className="mt-2 text-slate-400">
            Aumente a qualidade, nitidez e definição utilizando inteligência
            artificial.
          </p>
        </section>

        {/* UPLOAD */}

        {!arquivo && (
          <div
            onDragOver={arrastarImagem}
            onDrop={soltarImagem}
            onClick={() => inputRef.current?.click()}
            className="
              flex cursor-pointer flex-col items-center
              justify-center rounded-2xl border-2
              border-dashed border-slate-700
              bg-slate-900 px-6 py-16
              transition hover:border-indigo-500
              hover:bg-slate-900/70
            "
          >
            <div className="mb-4 rounded-full bg-slate-800 p-4">
              <Upload size={32} className="text-indigo-400" />
            </div>

            <p className="font-semibold">Arraste uma imagem para cá</p>

            <p className="mt-1 text-sm text-slate-400">
              ou clique para selecionar
            </p>

            <p className="mt-4 text-xs text-slate-500">PNG, JPG ou WEBP</p>
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={selecionarImagem}
          className="hidden"
        />

        {/* ERRO */}

        {erro && (
          <div className="mt-5 rounded-xl border border-red-800 bg-red-950/50 p-4 text-red-300">
            {erro}
          </div>
        )}

        {/* IMAGENS */}

        {arquivo && (
          <>
            <div className="grid gap-6 md:grid-cols-2">
              {/* ORIGINAL */}

              <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
                <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
                  <div className="flex items-center gap-2">
                    <ImageIcon size={18} className="text-slate-400" />

                    <h3 className="font-semibold">Original</h3>
                  </div>

                  <button
                    onClick={removerImagem}
                    disabled={processando}
                    className="cursor-pointer text-slate-400 transition hover:text-red-400"
                    title="Remover imagem"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="flex min-h-[400px] items-center justify-center bg-black/30 p-5">
                  <img
                    src={imagemOriginal}
                    alt="Imagem original"
                    className="max-h-[500px] max-w-full object-contain"
                    onLoad={(event) => {
                      setDimensaoOriginal({
                        largura: event.currentTarget.naturalWidth,
                        altura: event.currentTarget.naturalHeight,
                      });
                    }}
                  />
                </div>

                <div className="border-t border-slate-800 px-5 py-4 text-sm text-slate-400">
                  <p>{arquivo.name}</p>

                  <div className="mt-1 flex gap-4">
                    <span>{formatarTamanho(arquivo.size)}</span>

                    {dimensaoOriginal && (
                      <span>
                        {dimensaoOriginal.largura} × {dimensaoOriginal.altura}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* MELHORADA */}

              <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
                <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
                  <div className="flex items-center gap-2">
                    <Sparkles size={18} className="text-indigo-400" />

                    <h3 className="font-semibold">Melhorada</h3>
                  </div>

                  {imagemMelhorada && (
                    <button
                      onClick={baixarImagem}
                      className="flex cursor-pointer items-center gap-2 text-sm text-indigo-400 transition hover:text-indigo-300"
                    >
                      <Download size={17} />
                      Baixar
                    </button>
                  )}
                </div>

                <div className="flex min-h-[400px] items-center justify-center bg-black/30 p-5">
                  {processando ? (
                    <div className="text-center">
                      <LoaderCircle
                        size={42}
                        className="mx-auto animate-spin text-indigo-400"
                      />

                      <p className="mt-4 font-medium">
                        Melhorando sua imagem...
                      </p>

                      <p className="mt-2 text-sm text-slate-500">
                        Esse processo pode levar alguns segundos.
                      </p>
                    </div>
                  ) : imagemMelhorada ? (
                    <img
                      src={imagemMelhorada}
                      alt="Imagem melhorada"
                      className="max-h-[500px] max-w-full object-contain"
                      onLoad={(event) => {
                        setDimensaoMelhorada({
                          largura: event.currentTarget.naturalWidth,
                          altura: event.currentTarget.naturalHeight,
                        });
                      }}
                    />
                  ) : (
                    <div className="text-center text-slate-600">
                      <Sparkles size={42} className="mx-auto" />

                      <p className="mt-3">A imagem melhorada aparecerá aqui.</p>
                    </div>
                  )}
                </div>

                <div className="min-h-[77px] border-t border-slate-800 px-5 py-4 text-sm text-slate-400">
                  {imagemMelhorada && (
                    <div className="flex gap-4">
                      {tamanhoMelhorada && (
                        <span>{formatarTamanho(tamanhoMelhorada)}</span>
                      )}

                      {dimensaoMelhorada && (
                        <span>
                          {dimensaoMelhorada.largura} ×{" "}
                          {dimensaoMelhorada.altura}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* BOTÃO */}

            <div className="mt-7 flex justify-center">
              <button
                onClick={melhorarImagem}
                disabled={processando}
                className="
                  flex cursor-pointer items-center gap-2
                  rounded-xl bg-indigo-600 px-7 py-3
                  font-semibold transition
                  hover:bg-indigo-500
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                {processando ? (
                  <>
                    <LoaderCircle size={20} className="animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>
                    <Sparkles size={20} />
                    Melhorar imagem
                  </>
                )}
              </button>
            </div>

            {/* USAGE */}

            {usage && (
              <div className="mx-auto mt-8 max-w-xl rounded-xl border border-slate-800 bg-slate-900 p-5">
                <h3 className="mb-4 font-semibold">
                  Informações do processamento (tokens)
                </h3>

                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-xl font-bold">{usage.input_tokens}</p>

                    <p className="text-xs text-slate-500">Entrada</p>
                  </div>

                  <div>
                    <p className="text-xl font-bold">{usage.output_tokens}</p>

                    <p className="text-xs text-slate-500">Saída</p>
                  </div>

                  <div>
                    <p className="text-xl font-bold">{usage.total_tokens}</p>

                    <p className="text-xs text-slate-500">Total</p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}

export default App;
