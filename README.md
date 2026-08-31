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
