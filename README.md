# Protótipo Simples — Langfuse (`mlops-apresentacao`)

Protótipo mínimo em **Python** (com alternativa em Node.js) para demonstrar o funcionamento do **Langfuse** (observabilidade de IA: Traces, Spans, Generations e contagem de tokens).

> **Vai apresentar o projeto?** Veja o passo a passo completo em [GUIA-APRESENTACAO.md](./GUIA-APRESENTACAO.md).

## Como rodar (Python)

1. Crie uma conta gratuita em [cloud.langfuse.com](https://cloud.langfuse.com) (ou use sua instância local).
2. Copie `.env.example` para `.env` e preencha `LANGFUSE_PUBLIC_KEY` e `LANGFUSE_SECRET_KEY`:
   ```powershell
   Copy-Item .env.example .env
   ```
3. Instale as dependências (caso ainda não tenha criado a `.venv`):
   ```powershell
   python -m venv .venv
   .\.venv\Scripts\python.exe -m pip install -r requirements.txt
   ```
4. Execute o protótipo:
   ```powershell
   .\.venv\Scripts\python.exe main.py
   ```
5. Acesse a aba **Tracing** no painel do Langfuse para visualizar o trace `atendimento-ia` com:
   - **Span** `buscar-base-conhecimento`
   - **Generation** `chamada-llm` (com modelo, mensagens e tokens)

## Alternativa em Node.js

```powershell
npm start
```
