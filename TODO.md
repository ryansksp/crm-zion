# TODO - Correção do Sistema de Meta Mensal e Nova Página de Leads

## ✅ Concluído
- [x] Corrigido o campo `comissaoEstimada` em `Configuracoes.tsx` para ser controlado (adicionado `value` e `onChange`)
- [x] Adicionado tratamento de erro na função `atualizarMetas` em `AppContext.tsx`
- [x] Modificado `moverClienteEtapa` para atualizar `vendidoNoMes` quando uma venda é ganha
- [x] Corrigido `moverClienteEtapa` para subtrair o valor quando um cliente sai de "Venda Ganha"
- [x] Criada nova página "Leads" com lista de todos os leads em potencial
- [x] Adicionada navegação para a página "Leads" no menu lateral
- [x] Integrada a nova página ao sistema de roteamento

## 🔄 Em Andamento
- [ ] Testar a funcionalidade de atualização das metas
- [ ] Verificar se as mudanças persistem no Firestore
- [ ] Confirmar que a interface atualiza corretamente após salvar
- [ ] Testar a nova página de Leads

## 📋 Próximos Passos
1. Teste a atualização das metas na interface
2. Verifique se os dados são salvos corretamente no banco de dados
3. Monitore se há erros no console durante o processo
4. Teste a funcionalidade da nova página de Leads
