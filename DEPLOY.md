# Deploy Fabr1ka no Vercel

## Pré-requisitos

- GitHub account conectada ao Vercel
- AWS credenciais (Bedrock)
- Supabase URL + keys

## Passo 1: Criar projeto no Vercel

1. Vá em https://vercel.com/new
2. Selecione o repositório `fabr1ka`
3. Clique "Import"

## Passo 2: Configurar Environment Variables

Na página de configuração do Vercel, adicione:

```
NEXT_PUBLIC_SUPABASE_URL=https://uktaphunnucamktzkgbt.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=us-east-2
BEDROCK_MODEL_ID=us.anthropic.claude-sonnet-4-6
NEXT_PUBLIC_APP_URL=https://fabr1ka.vercel.app
```

## Passo 3: Deploy

1. Clique "Deploy"
2. Aguarde build completar (~2-3 min)
3. Pronto! Estará em `https://fabr1ka.vercel.app`

## Passo 4: Configurar domínio customizado (opcional)

Se quiser domínio próprio:
1. Vá em Vercel Dashboard → fabr1ka → Settings → Domains
2. Adicione `fabr1ka.com` ou similar
3. Configure DNS conforme Vercel instruir

## Passo 5: Aplicar migration no Supabase

```sql
-- Executar em: https://supabase.com/dashboard → SQL Editor
-- Copiar conteúdo de: supabase/migrations/001_factory_schema.sql
```

## Passo 6: Testar

1. Acesse https://fabr1ka.vercel.app
2. Faça login (ou registro)
3. Complete onboarding
4. Vá para `/factory` e gere um conteúdo!

## Troubleshooting

### Build fails com erro AWS

- Verificar `AWS_ACCESS_KEY_ID` e `AWS_SECRET_ACCESS_KEY` estão corretos
- Verificar role tem permissão em Bedrock

### Supabase connection error

- Verificar `NEXT_PUBLIC_SUPABASE_URL` e keys
- Verificar RLS policies na tabela `profiles`

### Rate limiting error

- Verificar `rate-limit.ts` está usando `in-memory`
- Para produção, migrar para Redis depois

## Próximos passos

- [ ] Testar geração de conteúdos
- [ ] Validar emails (se Mercado Pago estiver ativo)
- [ ] Monitorar performance no Vercel Analytics
- [ ] Setup CI/CD automático
