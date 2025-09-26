# TODO - Melhorias no Funil de Vendas e Controle de Usuários

## ✅ Concluído
- [x] Adicionar `userId` ao tipo `Simulacao` em `src/types/index.ts`
- [x] Atualizar `adicionarSimulacao` em `src/contexts/AppContext.tsx` para definir `userId`
- [x] Permitir acesso de Gerentes ao Controle de Usuários em `src/contexts/AppContext.tsx`
- [x] Corrigir cálculo de simulações em `src/components/ControleUsuarios.tsx` para filtrar por `clienteId` dos clientes do usuário
- [x] Adicionar logs de debug no console para investigar mismatch de userId e cálculo de métricas
- [x] Corrigir uso de userId para docSnap.id (ID do documento) em vez de data.uid, garantindo match com client.userId
- [x] Adicionar nome do vendedor no Funil de Vendas (exibido em cada cliente)
- [x] Adicionar métricas "Total Vendido" (soma valorCredito de Venda Ganha) e "Perdidos" (contagem de Venda Perdida) no Controle de Usuários
- [x] Adicionar filtro segmentado por vendedor no Funil de Vendas (dropdown com nomes de usuários)

## Próximos Passos
- [ ] Usuário testar app: verificar filtro por vendedor no Funil, métricas no Controle de Usuários
- [ ] Se OK, remover logs de debug se ainda presentes
- [ ] Testar acesso de Gerente ao Controle de Usuários
- [ ] Verificar métricas para outros usuários e simulações
- [ ] Teste de adição de nova simulação para confirmar userId salvo
- [ ] Casos de borda: usuários sem dados, busca, recarregamento
