import "dotenv/config";
import { NodeSDK } from "@opentelemetry/sdk-node";
import { LangfuseSpanProcessor } from "@langfuse/otel";
import { startActiveObservation, propagateAttributes } from "@langfuse/tracing";

const hasKeys =
  process.env.LANGFUSE_PUBLIC_KEY?.startsWith("pk-lf-") &&
  process.env.LANGFUSE_SECRET_KEY?.startsWith("sk-lf-") &&
  !process.env.LANGFUSE_PUBLIC_KEY.includes("...") &&
  !process.env.LANGFUSE_SECRET_KEY.includes("...");

if (!hasKeys) {
  console.log("⚠️  Configure suas chaves no arquivo .env antes de enviar traces reais.");
  console.log("   1. Copie .env.example para .env");
  console.log("   2. Pegue suas chaves gratuitas em https://cloud.langfuse.com");
  console.log("   Executando em modo de demonstração local (sem envio remoto)...\n");
}

// 1. Inicializa o processador do Langfuse + OpenTelemetry apenas quando há chaves válidas
const langfuseSpanProcessor = hasKeys ? new LangfuseSpanProcessor() : null;
const sdk = langfuseSpanProcessor
  ? new NodeSDK({ spanProcessors: [langfuseSpanProcessor] })
  : null;
sdk?.start();

async function simularAtendimento(perguntaUsuario) {
  // 2. Define metadados globais do Trace (usuário, sessão, tags)
  return propagateAttributes(
    {
      userId: "usuario-demo-01",
      sessionId: "sessao-prototipo",
      tags: ["prototipo", "demo"],
    },
    async () => {
      // 3. Trace principal (fluxo completo)
      return startActiveObservation("atendimento-ia", async (trace) => {
        trace.update({ input: { pergunta: perguntaUsuario } });

        // 4. Span: etapa intermediária (ex: busca em base de conhecimento / RAG)
        const contexto = await startActiveObservation(
          "buscar-base-conhecimento",
          async (span) => {
            span.update({ input: { query: perguntaUsuario } });
            const docEncontrado = "O horário de atendimento é de segunda a sexta, das 9h às 18h.";
            span.update({ output: { documento: docEncontrado } });
            return docEncontrado;
          }
        );

        // 5. Generation: chamada simulada ao LLM (registra modelo, prompt, resposta e tokens)
        const resposta = await startActiveObservation(
          "chamada-llm",
          async (generation) => {
            const mensagens = [
              { role: "system", content: `Use o contexto: ${contexto}` },
              { role: "user", content: perguntaUsuario },
            ];

            generation.update({
              asType: "generation",
              model: "gpt-4o-mini",
              input: mensagens,
            });

            // Simulação da resposta do modelo (substitua por OpenAI/Gemini/etc. quando quiser)
            const textoGerado = "Nosso atendimento funciona de segunda a sexta-feira, das 9h às 18h.";

            generation.update({
              output: { role: "assistant", content: textoGerado },
              usageDetails: { input: 34, output: 16 },
            });

            return textoGerado;
          }
        );

        trace.update({ output: { resposta } });
        return resposta;
      });
    }
  );
}

async function main() {
  const pergunta = "Qual o horário de atendimento?";
  console.log(`Pergunta: ${pergunta}`);

  const resposta = await simularAtendimento(pergunta);
  console.log(`Resposta: ${resposta}`);

  // 6. Garante o envio dos dados antes de encerrar o script
  if (langfuseSpanProcessor) {
    await langfuseSpanProcessor.forceFlush();
    await sdk.shutdown();
    console.log("\n✅ Trace enviado ao Langfuse! Confira na aba 'Tracing' do painel.");
  }
}

main().catch((err) => {
  console.error("Erro:", err);
  process.exit(1);
});
