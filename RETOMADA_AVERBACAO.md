# Ponto de retomada — emissão fiscal e averbação HK

## Data
2026-09-19

## Estado validado

- Repositório: `hktransportessp-oss/HK`, branch `main`.
- Último commit publicado: `e124d07`.
- Aplicação: Lovable Web App conectado ao GitHub e Supabase.
- Nenhuma credencial é registrada neste arquivo.

### Gmail

- Endpoint de leitura já validado com HTTP 200.
- Foram encontradas mensagens reais do fluxo de NF-e.
- A listagem retorna anexos XML e `attachmentId`.
- O conteúdo completo do XML ainda precisa ser baixado por uma rota segura para permitir o parsing.
- Remetente de referência: `relatorio@quataalimentos.com.br`.

### AverbePorto

- Comunicação de login validada em produção com HTTP 200 e `connected: true`.
- Endpoint de teste: `POST /api/public/v1/averbeporto/test-connection`.
- Secrets do backend:
  - `AVERBE_PORTO_API_USUARIO`
  - `AVERBE_PORTO_API_SENHA`
- Não enviar XML de averbação até CT-e e MDF-e estarem autorizados.

### Focus NFe

- Provedor escolhido para a primeira integração fiscal: Focus NFe.
- Plano inicial pretendido: Solo, R$ 89,90/mês, com 100 documentos e cobrança adicional publicada de R$ 0,10 por documento excedente.
- O plano informa emissão de CT-e e MDF-e, entre outros documentos.
- O cadastro oferece 30 dias de teste e integração exclusivamente por API.
- Usar inicialmente o ambiente de homologação, sem validade fiscal:
  - `https://homologacao.focusnfe.com.br/v2`
- Produção somente após validação e autorização formal:
  - `https://api.focusnfe.com.br/v2`
- Autenticação Focus NFe: HTTP Basic, token como usuário e senha vazia.
- Requisitos a preparar: CNPJ, inscrição estadual, regime tributário, certificado A1 PFX/P12, senha do certificado, séries, veículos, motoristas e municípios.

## Fluxo-alvo

`Gmail → XML NF-e → Supabase → motorista/veículo/romaneio → Focus NFe (CT-e) → Focus NFe (MDF-e) → SEFAZ → AverbePorto`

O motorista é vinculado à operação; a HK Transportes é a empresa emitente do CT-e/MDF-e, conforme cadastro fiscal e autorização aplicável.

## Próximos passos seguros

1. Criar conta de teste Focus NFe selecionando **Integração com a API**.
2. Obter o token de homologação e cadastrá-lo somente como Secret do backend Lovable.
3. Configurar a empresa HK e certificado conforme exigências da Focus NFe.
4. Criar rota segura para baixar o anexo Gmail pelo `attachmentId`.
5. Fazer parsing do XML e validar chave, emitente, destinatário, valor, data e itens.
6. Montar CT-e e MDF-e em modo de simulação/dry-run.
7. Enviar somente documentos de teste para homologação.
8. Consultar autorização ou receber webhook e salvar resposta sanitizada.
9. Não usar produção nem chamar AverbePorto com documentos não autorizados.

## Regras de segurança

- Nunca colocar tokens, certificado, senha ou chave no frontend, Git, logs ou tabela comum do Supabase.
- Usar Secrets do backend ou mecanismo seguro equivalente.
- Não fazer emissão fiscal real sem confirmação explícita e sem ambiente de produção validado.
- Manter idempotência por e-mail, anexo, NF-e e referência de emissão.

## Interface de liberação implementada

O app já possui uma primeira camada visual para o fluxo de liberação:

- `CARGA_LIBERADA` exibe confirmação no painel e nos detalhes da viagem.
- `AGUARDANDO_LIBERACAO` exibe espera e bloqueia o início da viagem pendente.
- `LIBERACAO_PENDENTE` e `ERRO_LIBERACAO` possuem mensagens próprias na tela de detalhes.
- A mudança para `CARGA_LIBERADA` gera uma notificação no contexto do app.

Essa camada ainda usa dados locais de demonstração. O backend/Lovable deve substituir os dados locais pelos estados persistidos no Supabase e pela resposta validada da Focus NFe/SEFAZ/AverbePorto.

## Painel administrativo implementado

Foi criada a tela `ADMIN_PENDING_TRIPS` para perfis cujo `role` contenha `ADMIN` ou `OPER`.

- Lista viagens em `AGUARDANDO_LIBERACAO`, `LIBERACAO_PENDENTE` ou `ERRO_LIBERACAO`.
- Exibe motorista, veículo, rota, NF-es e última tentativa.
- Exibe `Liberar viagem` com confirmação e justificativa obrigatória.
- Registra responsável, data/hora, protocolo manual e motivo no estado da viagem.
- Gera notificação para o motorista.
- Usa o estado separado `LIBERACAO_MANUAL`; não altera a resposta original da AverbePorto.

Essa implementação é a camada local de interface/demonstração. O backend deve validar o papel do usuário, persistir a auditoria no Supabase e aplicar a autorização real antes de aceitar a liberação.

## Migration do Supabase criada

Foi criada a migration:

- `supabase/migrations/20260919210000_create_trip_clearance_tables.sql`

Ela cria `trip_clearances` para o estado atual e `trip_clearance_audits` para o histórico. As tabelas usam RLS sem policies públicas: a leitura/escrita deve ocorrer pelo backend com service role, e o Lovable deve consumir endpoints autorizados. A migration ainda precisa ser aplicada no SQL Editor do Supabase ou por uma ferramenta de migration com acesso administrativo.

### Confirmação posterior

As tabelas foram verificadas diretamente no Supabase e estão presentes:

- `trip_clearances` — disponível via REST.
- `trip_clearance_audits` — disponível via REST.

O Lovable deve consumir essas tabelas por endpoints autorizados, usar `trip_clearances` para o estado atual e `trip_clearance_audits` para o histórico. Não deve recriar as tabelas nem acessar credenciais pelo frontend.

## Preparação para produção sem ativação

O `.env.example` agora documenta a configuração única da Focus NFe, com homologação como padrão e produção desativada. Não existe integração Focus NFe duplicada no código atual; a implementação deverá usar essa configuração quando o teste for autorizado.
