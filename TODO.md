# TODO: Sistema de Rastreamento de Pagamentos

## Passos para Implementar
- [x] Atualizar interface Cliente em src/types/index.ts para incluir campo pagamentos
- [x] Modificar src/components/ClientesAtivos.tsx para adicionar UI de edição de pagamentos
- [x] Testar a funcionalidade de edição e salvamento de pagamentos
- [x] Verificar se as datas são válidas e em ordem crescente (opcional: adicionar validação para datas em ordem)
- [x] Criar nova página Pagamentos.tsx separada
- [x] Adicionar aba Pagamentos no sidebar
- [x] Configurar permissões para a nova aba
- [x] Remover seção de pagamentos de ClientesAtivos.tsx
- [x] Adicionar resumo geral de pagamentos no topo da página (parcelas pagas, pendentes, em atraso, próximas)
- [x] Adicionar campo diaVencimentoPadrao para definir dia padrão de vencimento
- [x] Implementar notificações de vencimento 10 dias antes
- [x] Implementar função para salvar o dia de vencimento padrão junto com os pagamentos
- [x] Substituir checkbox por select com opções "Pendente", "Pago" e "Atrasado" para maior clareza
- [x] Atualizar permissões para serem modulares por aba (canViewDashboard, canViewFunil, etc.)
