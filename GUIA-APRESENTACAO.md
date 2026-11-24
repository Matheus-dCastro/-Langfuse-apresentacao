# Guia de Apresentação — Langfuse (MLOps / LLMOps)

Este guia foi feito para você usar o protótipo em **Python** e apresentar ao vivo de forma rápida, clara e sem complicação (duração sugerida: **3 a 5 minutos**).

---

## 1. Preparação (antes da apresentação)

1. Acesse [cloud.langfuse.com](https://cloud.langfuse.com) e faça login (ou crie uma conta gratuita).
2. Crie um projeto (ex: `mlops-demo`) e vá em **Settings → API Keys → Create new API keys**.
3. Na pasta `mlops-apresentacao`, crie o arquivo `.env` a partir do modelo:
   ```powershell
   Copy-Item .env.example .env
   ```
4. Abra o `.env` e cole suas chaves:
   ```env
   LANGFUSE_PUBLIC_KEY="pk-lf-..."
   LANGFUSE_SECRET_KEY="sk-lf-..."
   LANGFUSE_BASE_URL="https://cloud.langfuse.com"
   ```
5. *(Se ainda não tiver o ambiente Python pronto)* Crie o `.venv` e instale as dependências:
   ```powershell
   python -m venv .venv
   .\.venv\Scripts\python.exe -m pip install -r requirements.txt
   ```
6. **Teste antes de apresentar** rodando:
   ```powershell
   .\.venv\Scripts\python.exe main.py
   ```
   Verifique se aparece `✅ Trace enviado ao Langfuse!` e deixe a aba **Tracing** do navegador aberta.

---

## 2. Roteiro da Apresentação (Passo a Passo)

### Passo 1 — Contexto rápido (30 segundos)
> *"Em aplicações com IA / LLMs em produção, não basta só chamar o modelo. No contexto de MLOps (ou LLMOps), precisamos saber quanto custa cada chamada, quanto tempo cada etapa levou, o que o usuário perguntou e o que o modelo respondeu. É exatamente isso que o **Langfuse** resolve: ele funciona como um 'observability / APM' focado em IA."*

### Passo 2 — Mostrar o código simples (1 minuto)
Abra o arquivo `main.py` e aponte apenas 3 pontos principais:
1. **Inicialização (`Langfuse()`)**: conecta a aplicação ao Langfuse via OpenTelemetry com apenas as chaves do `.env`.
2. **Metadados e Fluxo (`propagate_attributes`, `atendimento-ia` e `buscar-base-conhecimento`)**: mostra que conseguimos associar usuário, sessão e tags ao trace e rastrear etapas intermediárias (como busca em banco/RAG).
3. **Generation (`chamada-llm`)**: registra exatamente o modelo (`gpt-4o-mini`), as mensagens enviadas (`system` + `user`), a resposta recebida e o consumo de tokens (`usage_details`).

### Passo 3 — Executar ao vivo (30 segundos)
No terminal, dentro da pasta `mlops-apresentacao`, rode:
```powershell
.\.venv\Scripts\python.exe main.py
```
Mostre no terminal a pergunta, a resposta e a confirmação de envio do trace.

### Passo 4 — Mostrar no Painel do Langfuse (2 minutos)
Alterne para o navegador na aba **Tracing** e clique em **Refresh** (ou atualize a página):
1. **Lista de Traces**: mostre o trace `atendimento-ia` recém-criado, com usuário (`usuario-demo-01`), sessão (`sessao-prototipo`) e tags (`prototipo`, `demo`).
2. **Árvore de Execução (Timeline)**: clique no trace para abrir os detalhes e mostre a hierarquia:
   - `atendimento-ia` (fluxo completo)
   - `buscar-base-conhecimento` (Span de busca de contexto)
   - `chamada-llm` (Generation do modelo)
3. **Input / Output e Tokens**: clique em `chamada-llm` para mostrar:
   - O prompt exato (`system` + `user`)
   - A resposta do modelo
   - A contagem de tokens (`34` input / `16` output) e o cálculo automático de custo estimado.

---

## 3. Pontos extras para responder perguntas (Q&A)

- **"Precisa usar a nuvem deles?"**
  Não. O Langfuse é *open-source* e pode rodar self-hosted via Docker na própria infraestrutura da empresa.
- **"Funciona só com Python?"**
  Não. Além do SDK oficial em Python, tem SDK para JS/TS, integrações diretas com OpenAI, LangChain, LlamaIndex, Vercel AI SDK e padrão OpenTelemetry. *(Este projeto também inclui `index.mjs` em Node.js como alternativa.)*
- **"Por que isso importa em MLOps?"**
  Permite auditar respostas em produção, identificar gargalos de latência, controlar custos de tokens por usuário/sessão e coletar exemplos reais para avaliar e melhorar prompts ou modelos.
