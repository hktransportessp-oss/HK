# Ponto de retomada - fluxo de averbação HK

## Data
2026-09-18

## Contexto
- O projeto já está com uso da Gmail API para leitura de e-mails.
- O Supabase já possui tabelas criadas.
- O fluxo real do negócio é:
  1. receber NF-e por e-mail do remetente fixo;
  2. ler chave/protocolo/emitente/valor;
  3. salvar a NF-e;
  4. o motorista recebe o romaneio do gerente;
  5. o motorista acessa o portal;
  6. confirma as NF-es e documentos da operação;
  7. a HK emite o CT-e;
  8. a HK emite o MDF-e;
  9. envia a operação ao AverbePorto;
  10. grava protocolo e pendência.

## Regras do negócio
- Remetente principal das NF-e: relatorio@quataalimentos.com.br.
- A leitura deve ser feita por remetente fixo e por conteúdo da mensagem.
- Não é “nota isolada”; é operação documental completa.
- O vínculo deve existir entre:
  - motorista
  - veículo
  - romaneio
  - NF-e
  - CT-e
  - MDF-e
  - apólice

## Próximo passo de execução
1. Revisar as tabelas existentes no Supabase.
2. Mapear colunas e campos relevantes para:
   - email_recebido
   - nf_e
   - motorista
   - veiculo
   - romaneio
   - cte
   - mdfe
   - apolice
   - averbacao_envio
   - averbacao_protocolo
3. Validar como os XMLs entram e como são salvos.
4. Definir a pipeline de parsing do e-mail para dados estruturados.
5. Definir a vinculação de NF-e ao romaneio e ao motorista.
6. Definir a criação do CT-e e MDF-e após a operação.
7. Definir a integração com o AverbePorto.

## Arquivos de referência
- SQL de averbação enviado anteriormente.
- Repositório local de apoio: HK_repo_observe.

## Observação importante
- Nenhuma alteração funcional foi aplicada até este ponto.
- Este arquivo serve como ponto de salvamento e retomada.

## Próximo retorno
- Após confirmar esse ponto, seguimos para revisão das tabelas do Supabase e a definição do fluxo de ingestão do Gmail.
