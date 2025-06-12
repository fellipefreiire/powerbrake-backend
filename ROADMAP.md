# 🧭 Projeto Backend — Roadmap Técnico

Este roadmap define todas as etapas de implementação, testes, automações e boas práticas previstas para que o projeto alcance alta robustez, performance e escalabilidade.

---

## ✅ Implementado

- [x] Autenticação com access/refresh token
- [x] Auditoria baseada em eventos de domínio
- [x] Módulo de avatar com upload
- [x] Módulo de endereços reutilizável (`shared/address`)
- [x] CASL para RBAC
- [x] Testes unitários e e2e com cobertura sólida
- [x] Parallel Routes no frontend
- [x] DTOs com Swagger e exemplos

---

## 🧪 Testes

### 🔹 Qualidade de Código

- [x] Static analysis (TypeScript estrito, ESLint)
- [x] Mutation testing

### 🔹 Testes Automatizados

- [x] Unitários com InMemory
- [x] E2E com banco real e truncamento
- [ ] [ ] Teste de troca de senha via token
- [ ] [ ] Testes e2e para exportação de logs
- [ ] [ ] Testes e2e para auditoria com paginação

### 🔹 Performance

- [ ] Smoke test
- [ ] Load test
- [ ] Stress test
- [ ] Spike test
- [ ] Soak test

### 🔹 Segurança

- [ ] Injeção SQL
- [ ] XSS
- [ ] Rate limit com bypass
- [ ] Testes com tokens inválidos/expirados

### 🔹 Recuperação

- [ ] Chaos test (banco indisponível, Redis fora do ar)
- [ ] Circuit breaker test

---

## 🐳 Docker & Ambientes

- [ ] Docker Compose para local simulando Railway (512MB RAM, 1vCPU)
- [ ] Configs de Docker separadas para:
  - [x] `local`
  - [ ] `dev`
  - [ ] `staging`
  - [ ] `prod`
- [ ] Seeders automáticos por ambiente
- [ ] Script para desligar ambiente inativo por mais de 1 hora

---

## 📈 Observabilidade & Monitoramento

- [ ] Prometheus para métricas
- [ ] Loki para logs
- [ ] OpenTelemetry para tracing
- [ ] Grafana para dashboards
- [ ] Health check completo (Redis, banco, email, storage, etc.)
- [ ] Alertas automáticos para:
  - Latência
  - Falha de login
  - Falhas 5xx por rota

---

## 🔐 Segurança Avançada

- [ ] Headers seguros via `helmet`
- [ ] CSP configurado
- [ ] Rate limiting por IP + rota
- [ ] CSRF token (caso frontend full SSR ou SPA com cookies)
- [ ] Logs de acesso indevido
- [ ] Detectar comportamentos anômalos

---

## ⚙️ CI/CD & Automação

- [ ] GitHub Actions:
  - [x] Teste unitário
  - [x] Lint
  - [ ] Threshold de coverage (ex: 80%)
  - [ ] Smoke test no deploy
- [ ] Pré-commit hooks (lint, test, format)
- [ ] Rollback automático de migration
- [ ] Script para:
  - [ ] Rodar seeds por ambiente
  - [ ] Rodar rollback
  - [ ] Desligar dev/staging se ocioso

---

## ✨ Extra

- [ ] Exportação de audit logs (CSV/JSON)
- [ ] Fila para eventos assíncronos (BullMQ, Redis Streams)
- [ ] Previews automáticos por PR
- [ ] CLI personalizado (`pnpm cli`)
- [ ] Feature Flags (ex: `enableNewPasswordFlow`)
- [ ] Versionamento por rota: `/v1/version` retornando git hash + data

---

## 📚 Documentação & Organização

- [ ] `docs/architecture.md` com:
  - Estrutura de módulos
  - Regras de domínio
  - Padrões de testes
- [ ] `docs/scripts.md` com:
  - Como rodar rollback, seeds, stress test
- [ ] `docs/contributing.md` com:
  - Checklist para revisão de PR
  - Estrutura de commits e branches
