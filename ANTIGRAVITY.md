# 🛸 ANTIGRAVITY.md - Mitoo.Life

Este é o documento vivo do projeto **Mitoo.Life**. Ele contém a definição da nossa stack tecnológica, padrões de design, variáveis de ambiente e a estrutura do projeto, baseada no **Workflow de Planejamento Completo**.

**MANTRA**: O humano é o freio. Pequenas entregas. TDD. Refatoração contínua. Segurança em primeiro lugar.

---

## 🌟 Visão Geral
**Mitoo.life** é uma rede social de sentimentos focada em solidariedade emocional, relatos espontâneos e anonimato poético.

### Pilares:
- **Feed de Relatos**: Categorizado por humor.
- **Diário Público**: Entradas sequenciais seguidáveis.
- **Anonimato Poético**: Alias fixo gerado no cadastro (Ex: *Lua Cinzenta*).
- **Tema Dinâmico**: Muda conforme o horário (Manhã, Tarde, Noite).
- **Botão Mitoo**: Reação especial de solidariedade.

---

## 🛠️ Tech Stack
-   **Frontend**: React Native + Expo (iOS/Android).
-   **Navegação**: Expo Router.
-   **Backend**: Supabase (Postgres + Auth + Storage).
-   **Lógica Server**: Supabase Edge Functions (Deno).
-   **Realtime**: Supabase Realtime (WebSockets).
-   **Estado**: Zustand / Context API.
-   **Animações**: Reanimated 3.
-   **Design**: Temas dinâmicos baseados no horário e paleta de humor.
-   **Testes**: Jest + React Native Testing Library (Configurado).

---

## 🏛️ Arquitetura (Clean Code)
Seguimos o modelo de 3 Camadas (`AGENTS.md`):
1.  **Intenção (Core)**: Regras de negócio, lógica de humor e anonimato.
2.  **Estrutura (Features)**: Organização dos módulos (Feed, Diário, Perfil).
3.  **Implementação (Infra/UI)**: Integração com Supabase, componentes visuais e animações.

---

## 🛡️ Segurança (Security First)
- **RLS (Row Level Security)**: O `user_id` real nunca vaza em queries anônimas.
- **Proteção de Alias**: A tabela `anon_identities` é protegida e nunca exposta publicamente.
- **Avatar Anônimo Protegido**: `avatar_url` retorna `null` para comentários anônimos *(fix crítico 2026-04-16)*.
- **Enums de Domínio**: `mood_types.ts` define os únicos valores legais de `mood` e `period`, com guards em runtime que protegem o banco.
- **Validação em Dupla Camada**: Frontend valida + banco tem `CHECK constraints` (posts ≤ 1000 chars, comentários ≤ 500).
- **Search Sanitization**: `searchQuery` truncado em 100 chars antes de ir ao banco.
- **Logger Silencioso**: Nenhum log em produção — stack traces nunca chegam ao console do browser.
- **Git History Verificado**: `.env` nunca foi commitado. Chaves do Supabase seguras *(verificado 2026-04-16)*.

---

## 📂 Estrutura do Projeto
```text
mitoo.life/
├── .agent/             # Regras de engenharia
├── assets/             # Recursos visuais e fontes
├── supabase/           # Configurações, Migrations e Edge Functions
├── src/
│   ├── core/           # Regras de negócio (Domain)
│   │   ├── mood_types.ts       # Enums de humor e período (fonte única de verdade)
│   │   ├── comments_repository.ts
│   │   ├── posts_repository.ts
│   │   └── ...
│   ├── features/       # Módulos do App (Feed, Diary, Auth)
│   ├── ui/             # Componentes, Temas e Animações
│   ├── hooks/          # Hooks customizados (useTheme, useSupabase)
│   └── store/          # Zustand (Global State)
├── tests/              # Testes Automatizados (Jest - 21 testes passando)
└── ANTIGRAVITY.md      # Este documento
```

---

## 🚀 Roadmap (Sprint 1: Fundação)
- [x] **Setup Supabase**: Criar projeto, tabelas (`users`, `posts`, `mitoos`, `comments`) e habilitar RLS.
- [x] **Módulo Diário (Fundação)**: Tabelas `diaries`, `diary_entries`, `diary_reactions` criadas com RLS.
- [x] **Auth Context**: Implementar fluxo de Login/Registro com Supabase Auth (Validado com tratamento de e-mail).
- [x] **Diary Details**: Tela de leitura de entradas individuais e comentários de diário.
- [x] **Social Interactions**: Lógica de "Seguir Diário" e reações em tempo real *(2026-04-16)*.
- [x] **Theme Engine**: Hook para detecção de período e aplicação de cores dinâmicas criado.
- [x] **Comments Core**: Repositório e UI de comentários para posts e diário integrados.
- [x] **Profile Images**: Integração com Supabase Storage e seletor de fotos no perfil.
- [x] **Test Infrastructure**: Ambiente Jest configurado e testes de Core passando (32 testes).
- [x] **Multi-language Support**: Implementado suporte a PT/EN com tela de intro e logos dinâmicos.
- [x] **New Visual Assets**: Logos primários, secundários e "M" integrados na estrutura.
- [x] **Git Repository**: Conectado e sincronizado em: https://github.com/lucasraz/mitoo.life
- [x] **Deployment Config**: Vercel/Cloudflare Pages configurados com redirecionamento de SPA.
- [x] **Security Audit**: Varredura completa executada. CVEs corrigidos. Histórico Git verificado *(2026-04-16)*.
- [x] **Diary Details**: Tela `diary/[id]` (lista de entradas) e `diary/entry/[entryId]` (leitura + comentários) implementadas *(2026-04-16)*.
