# TODO - Sistema de Permissões e Correções

## ✅ Concluído (Tarefas Anteriores)
- [x] Corrigido o campo `comissaoEstimada` em `Configuracoes.tsx` para ser controlado
- [x] Adicionado tratamento de erro na função `atualizarMetas` em `AppContext.tsx`
- [x] Modificado `moverClienteEtapa` para atualizar `vendidoNoMes` quando uma venda é ganha
- [x] Corrigido `moverClienteEtapa` para subtrair o valor quando um cliente sai de "Venda Ganha"
- [x] Criada nova página "Leads" com lista de todos os leads em potencial
- [x] Adicionada navegação para a página "Leads" no menu lateral
- [x] Integrada a nova página ao sistema de roteamento

## 🔄 Em Andamento
- [x] Implementar sistema de permissões baseado em níveis de acesso
- [x] Restringir mudanças de permissões apenas para usuários Diretor
- [x] Bloquear operadores de mudarem para Gerente ou Diretor
- [x] Corrigir visibilidade de dados para usuários Diretor
- [x] Adicionar controle de acesso baseado em papéis no App.tsx
- [ ] Criar interface de gerenciamento de usuários para Diretores

## 📋 Próximos Passos
1. Implementar verificações de permissão no Profile.tsx
2. Adicionar controle de acesso no App.tsx
3. Testar visibilidade de dados para diferentes níveis
4. Verificar se as restrições funcionam corretamente
