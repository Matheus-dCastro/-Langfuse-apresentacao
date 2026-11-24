import os
from contextlib import nullcontext
from dotenv import load_dotenv
from langfuse import Langfuse, propagate_attributes

load_dotenv()

public_key = os.getenv("LANGFUSE_PUBLIC_KEY", "")
secret_key = os.getenv("LANGFUSE_SECRET_KEY", "")

has_keys = (
    public_key.startswith("pk-lf-")
    and secret_key.startswith("sk-lf-")
    and "..." not in public_key
    and "..." not in secret_key
)

if not has_keys:
    print("  Configure suas chaves no arquivo .env antes de enviar traces reais.")
    print("   1. Copie .env.example para .env")
    print("   2. Pegue suas chaves gratuitas em https://cloud.langfuse.com")
    print("   Executando em modo de demonstração local (sem envio remoto)...\n")

# 1. Inicializa o cliente do Langfuse apenas quando há chaves válidas
langfuse = Langfuse() if has_keys else None


def obs(name: str, **kwargs):
    """Abre uma observação no Langfuse ou um bloco vazio no modo local."""
    if langfuse is None:
        return nullcontext()
    return langfuse.start_as_current_observation(name=name, **kwargs)


def simular_atendimento(pergunta_usuario: str) -> str:
    # 2. Define metadados globais do Trace (usuário, sessão, tags)
    attrs = (
        propagate_attributes(
            user_id="usuario-demo-01",
            session_id="sessao-prototipo",
            tags=["prototipo", "demo"],
        )
        if langfuse is not None
        else nullcontext()
    )

    with attrs:
        # 3. Trace principal (fluxo completo)
        with obs("atendimento-ia", input={"pergunta": pergunta_usuario}) as trace:
            # 4. Span: etapa intermediária (ex: busca em base de conhecimento / RAG)
            with obs("buscar-base-conhecimento", input={"query": pergunta_usuario}) as span:
                doc_encontrado = "O horário de atendimento é de segunda a sexta, das 9h às 18h."
                if span is not None:
                    span.update(output={"documento": doc_encontrado})

            # 5. Generation: chamada simulada ao LLM (registra modelo, prompt, resposta e tokens)
            mensagens = [
                {"role": "system", "content": f"Use o contexto: {doc_encontrado}"},
                {"role": "user", "content": pergunta_usuario},
            ]
            with obs(
                "chamada-llm",
                as_type="generation",
                model="gpt-4o-mini",
                input=mensagens,
            ) as generation:
                # Simulação da resposta do modelo (substitua por OpenAI/Gemini/etc. quando quiser)
                texto_gerado = "Nosso atendimento funciona de segunda a sexta-feira, das 9h às 18h."
                if generation is not None:
                    generation.update(
                        output={"role": "assistant", "content": texto_gerado},
                        usage_details={"input": 34, "output": 16},
                    )

            if trace is not None:
                trace.update(output={"resposta": texto_gerado})

            return texto_gerado


def main() -> None:
    pergunta = "Qual o horário de atendimento?"
    print(f"Pergunta: {pergunta}")

    resposta = simular_atendimento(pergunta)
    print(f"Resposta: {resposta}")

    # 6. Garante o envio dos dados antes de encerrar o script
    if langfuse is not None:
        langfuse.flush()
        langfuse.shutdown()
        print("\n Trace enviado ao Langfuse! Confira na aba 'Tracing' do painel.")


if __name__ == "__main__":
    main()
