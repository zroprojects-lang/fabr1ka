# Fabr1ka — Fábrica de Audiência

[![Deployments](https://img.shields.io/badge/Status-MVP-blue)](https://fabr1ka.vercel.app)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

Transforme **1 ideia** em **10+ formatos de conteúdo prontos** simultaneamente.

## O que é Fabr1ka?

Plataforma SaaS que utiliza IA para transformar frases, temas, produtos, serviços ou conhecimentos em dezenas de conteúdos prontos para redes sociais:

- 📊 **Carrosséis** (7 slides)
- 🎬 **Reels/Shorts** (scripts com timing)
- 📝 **Legendas** + hashtags
- #️⃣ **Hashtags** segmentadas
- 🎨 **Prompts visuais** (Midjourney, DALL-E, Canva)
- 🎤 **Narrações** (TTS-ready)
- 📅 **Calendários editoriais** (7-30 dias)

**Público-alvo:** Criadores, terapeutas, astrólogos, mentores, psicólogos, empresas, especialistas.

## Tech Stack

- **Framework:** Next.js 16 + TypeScript + Tailwind CSS v4
- **IA:** AWS Bedrock — Claude Sonnet 4.6
- **Banco:** Supabase (PostgreSQL + Auth)
- **Pagamentos:** Mercado Pago
- **Deploy:** Vercel

## Estrutura do Projeto

```
src/
├── app/
│   ├── (auth)/              — Login/Register
│   ├── (dashboard)/
│   │   ├── factory/         — Input + geração de batch
│   │   ├── outputs/         — Visualizar resultados
│   │   ├── history/         — Histórico de batches
│   │   └── pricing/         — Planos
│   ├── api/
│   │   ├── factory/generate — 🚀 Endpoint principal
│   │   ├── checkout/        — Mercado Pago
│   │   └── webhook/         — MP webhooks
│
├── lib/
│   ├── generators/          — 7 generators (carousel, reel, caption, etc)
│   ├── prompt-builder.ts    — Constrói contexto do usuário
│   ├── bedrock.ts           — Client AWS Bedrock
│   └── supabase/            — Auth, DB, Storage
```

## Database Schema

```sql
-- Batch de geração (1 input = 1 batch)
factory_batches (id, user_id, theme, context, status, total_formats, completed_formats)

-- Outputs gerados (N formatos por batch)
factory_outputs (id, batch_id, format, content JSONB, status)
```

## Como Rodar Localmente

### 1. Setup

```bash
# Clone
git clone https://github.com/zroprojects-lang/fabr1ka.git
cd fabr1ka

# Dependências
npm install

# Env vars (.env.local)
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=us-east-2
BEDROCK_MODEL_ID=us.anthropic.claude-sonnet-4-6
MP_ACCESS_TOKEN=...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2. Banco de Dados

```bash
# Apply migration
supabase migration up

# Ou manualmente copiar `supabase/migrations/001_factory_schema.sql` no Supabase Dashboard
```

### 3. Rodar

```bash
npm run dev
# http://localhost:3000
```

## API Endpoints

### `POST /api/factory/generate`

Gera múltiplos formatos em paralelo.

**Request:**
```json
{
  "theme": "Como superar procrastinação",
  "context": {
    "product": "Curso de produtividade",
    "target": "empreendedores"
  },
  "formats": ["carousel", "reel", "caption", "hashtags"]
}
```

**Response:**
```json
{
  "ok": true,
  "batch_id": "uuid",
  "outputs": [
    { "format": "carousel", "status": "completed" },
    { "format": "reel", "status": "completed" }
  ],
  "success_count": 4
}
```

## Rate Limiting por Plano

| Plano | Batches/hora | Máx. formatos | Preço |
|-------|---|---|---|
| **Free** | 2 | 3 | R$ 0 |
| **Básico** | 10 | 5 | R$ 47/mês |
| **Pro** | 30 | 10 | R$ 97/mês |
| **Premium** | Ilimitado | 20 | R$ 197/mês |

## Roadmap

### MVP (Now) ✅
- [x] 7 generators (carousel, reel, caption, hashtags, visual-prompt, narration, calendar)
- [x] Geração síncrona paralela
- [x] Rate limiting por plano
- [x] Endpoint `/api/factory/generate`

### Fase 2
- [ ] UI `/factory` (input + seleção formatos)
- [ ] UI `/outputs/[batchId]` (visualizar resultados)
- [ ] Onboarding adaptado (remover astral, adicionar business fields)
- [ ] Geração de imagens automática (FLUX)

### Fase 3
- [ ] Geração de vídeos (RunwayML/Pika)
- [ ] TTS integrado (Polly/ElevenLabs)
- [ ] Agendamento de posts (Meta API/Buffer)
- [ ] A/B testing (múltiplas variações)
- [ ] Sistema de filas (BullMQ + Redis)

## Contribuindo

1. Fork o repo
2. Crie uma branch (`git checkout -b feature/xyz`)
3. Commit (`git commit -am 'Add xyz'`)
4. Push (`git push origin feature/xyz`)
5. Abra um Pull Request

## License

MIT — veja [LICENSE](LICENSE)

## Contato

- 📧 Email: dev@zroprojects.com
- 💼 GitHub: [@zroprojects-lang](https://github.com/zroprojects-lang)

---

**Made with ❤️ by Claude Code | Powered by Bedrock + Next.js**
