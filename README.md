# HK Connect - Web (React + TypeScript + Vite)

Sistema de gestão logística e controle financeiro de transporte para motoristas da **HK Transportes**.
Reescrito a partir do aplicativo original para uma experiência responsiva e de alta performance na Web.

## Principais Funcionalidades

- **Autenticação & Perfil de Motorista**: Login via CPF/Telefone com controle de acesso, dados do veículo e endpoint REST configurável.
- **Painel Operacional (Home)**: Resumo da viagem ativa, itinerário de entregas, ações rápidas e alertas de pendências documentais.
- **Gestão de Viagens & Entregas**: Listagem detalhada de rotas com filtros de status, comprovantes com fotos e janelas de atendimento.
- **Roteirização Inteligente HK**: Sequenciamento de paradas com cálculo de tempos/distâncias, restrições urbanas e integração com GPS/Maps.
- **Auditoria de Romaneios**: Upload de canhotos fiscais e acompanhamento do fluxo em 4 etapas (Envio -> OCR -> Auditoria HK -> Fechamento).
- **Leitor de Notas Fiscais (NF-e)**: Scanner de código de barras 128C, QR Code e validação manual de chaves de 44 dígitos com vínculo instantâneo.
- **Reembolso de Pedágios**: Cadastro de recibos com praça, rodovia e comprovantes fiscais.
- **Gestão Financeira**: Extratos quinzenais, cálculo de fretes líquidos, conciliação de adiantamentos e pagamentos via PIX.
- **Central de Notificações**: Alertas em tempo real sobre status de aprovação de romaneios e avisos da torre de controle.

## Execução

```bash
npm install
npm run dev
```

O servidor iniciará em `http://0.0.0.0:3000`.

## Integração fiscal preparada

O projeto já possui as tabelas de liberação operacional no Supabase:

- `trip_clearances`: estado atual da liberação;
- `trip_clearance_audits`: histórico de respostas e liberações administrativas.

Não crie tabelas duplicadas. O Lovable deve consumir esses dados por endpoints do backend autorizados.

### Focus NFe

A integração fiscal deve começar em homologação, sem validade fiscal:

- CT-e e MDF-e: `https://homologacao.focusnfe.com.br/v2`;
- autenticação: HTTP Basic, token como usuário e senha vazia;
- `FISCAL_EMISSION_ENABLED=false`;
- `FISCAL_DRY_RUN=true`.

As variáveis de produção ficam preparadas no `.env.example`, mas não devem ser preenchidas ou ativadas antes da validação fiscal e autorização da HK.

Secrets obrigatórios do backend:

- `FOCUSNFE_TOKEN_HOMOLOGACAO`;
- `FOCUSNFE_TOKEN_PRODUCAO`, somente na etapa de produção;
- certificado digital A1/PFX ou P12 e senha, somente no mecanismo seguro do provedor.

### Fluxo de ativação

1. Ler a NF-e do Gmail e obter o XML completo.
2. Relacionar NF-e, motorista, veículo, romaneio e rota.
3. Montar CT-e/MDF-e em `dry_run`.
4. Testar em homologação.
5. Consultar autorização ou webhook.
6. Atualizar `trip_clearances` e `trip_clearance_audits`.
7. Somente após aprovação formal, configurar produção e desligar o `dry_run`.

Nenhum token, certificado ou senha deve ser colocado no frontend, Git, README ou tabela comum do Supabase.
