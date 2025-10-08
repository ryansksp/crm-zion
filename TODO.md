# TODO: Implementar Reatribuição de Leads

## Tarefas Pendentes
- [x] Modificar Leads.tsx para adicionar funcionalidade de reatribuição no modal de detalhes
- [x] Atualizar CadastroLeads.tsx para permitir diretores atribuírem leads para qualquer usuário
- [ ] Testar a funcionalidade de reatribuição
- [ ] Verificar permissões de reatribuição (apenas diretores podem reatribuir)

## Detalhes da Implementação
- Adicionar dropdown de usuários no modal de detalhes do lead
- Botão "Reatribuir" que chama reatribuirLead do contexto
- Para diretores, mostrar todos os usuários no dropdown de atribuição
- Garantir que apenas usuários com permissão possam reatribuir leads
