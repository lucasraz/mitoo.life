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
- **RLS (Row Level Security)**: Crítico para garantir o anonimato. O `user_id` real nunca deve vazar em queries anônimas.
- **Proteção de Alias**: A tabela `anon_identities` é protegida e nunca exposta publicamente.
- **Sanitização**: Validação rigorosa de inputs nos relatos e comentários.

---

## 📂 Estrutura do Projeto (Planejada)
```text
mitoo.life/
├── .agent/             # Regras de engenharia
├── assets/             # Recursos visuais e fontes
├── supabase/           # Configurações, Migrations e Edge Functions
├── src/
│   ├── core/           # Regras de negócio (Domain)
│   ├── features/       # Módulos do App (Feed, Diary, Auth)
│   ├── ui/             # Componentes, Temas e Animações
│   ├── hooks/          # Hooks customizados (useTheme, useSupabase)
│   └── store/          # Zustand (Global State)
├── tests/              # Testes Automatizados (Jest - Configurado)
└── ANTIGRAVITY.md      # Este documento
```

---

## 🚀 Roadmap (Sprint 1: Fundação)
- [x] **Setup Supabase**: Criar projeto, tabelas (`users`, `posts`, `mitoos`, `comments`) e habilitar RLS.
- [x] **Módulo Diário (Fundação)**: Tabelas `diaries`, `diary_entries`, `diary_reactions` criadas com RLS.
- [x] **Auth Context**: Implementar fluxo de Login/Registro com Supabase Auth (Validado com tratamento de e-mail).
- [ ] **Diary Details**: Tela de leitura de entradas individuais e comentários de diário.
- [ ] **Social Interactions**: Lógica de "Seguir Diário" e reações em tempo real.
- [x] **Theme Engine**: Hook para detecção de período e aplicação de cores dinâmicas criado.
- [x] **Comments Core**: Repositório e UI de comentários para posts e diário integrados.
- [x] **Profile Images**: Integração com Supabase Storage e seletor de fotos no perfil.
- [x] **Test Infrastructure**: Ambiente Jest configurado e testes de Core passando.
- [x] **Git Repository**: Conectado e sincronizado em: https://github.com/lucasraz/mitoo.life

