# TODO - Correção das Métricas no Controle de Usuários

## ✅ Concluído
- [x] Adicionar `userId` ao tipo `Simulacao` em `src/types/index.ts`
- [x] Atualizar `adicionarSimulacao` em `src/contexts/AppContext.tsx` para definir `userId`
- [x] Permitir acesso de Gerentes ao Controle de Usuários em `src/contexts/AppContext.tsx`
- [x] Corrigir cálculo de simulações em `src/components/ControleUsuarios.tsx` para filtrar por `clienteId` dos clientes do usuário

## Próximos Passos
- [ ] Testar acesso de Gerente ao Controle de Usuários
- [ ] Verificar se as métricas aparecem corretamente (clientes, leads, vendas, simulações)
- [ ] Se simulações ainda não aparecerem, investigar dados no Firestore
