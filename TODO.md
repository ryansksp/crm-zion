# TODO: Revisão e Otimização do Projeto CRM Zion

## Etapas a Completar

### 1. Remover arquivos .jsx não utilizados
- [x] Deletar `src/components/Calculator.jsx`
- [x] Deletar `src/components/CalculatorForm.jsx`
- [x] Deletar `src/components/ComparisonSummary.jsx`
- [x] Deletar `src/components/ConsortiumResults.jsx`
- [x] Deletar `src/components/FinancingResults.jsx`

### 2. Remover funções não utilizadas no AppContext
- [x] Funções `obterLeads` e `obterClientesPerdidos` não estavam presentes no arquivo (já removidas ou não existiam)

### 3. Otimizar performance em ClientesAtivos
- [x] Otimizar `useEffect` em `src/components/ClientesAtivos.tsx` para evitar re-renders desnecessários

### 4. Refatoração MVC
- [x] Criar serviços para separar lógica de negócio (clienteService, planoService, simulacaoService)
- [x] Refatorar AppContext para usar os serviços
- [x] Atualizar imports nos componentes

### 5. Correção da funcionalidade de cotas e grupo
- [x] Corrigir campos de grupo e cotas em ClientesAtivos.tsx
- [x] Implementar estado local para edição do grupo (editingGroups)
- [x] Permitir adicionar/remover múltiplas cotas
- [x] Salvar cotas e grupo corretamente no cliente

### 6. Testes e verificações finais
- [ ] Executar o projeto e verificar se tudo funciona
- [ ] Verificar se não há imports quebrados
- [ ] Confirmar que textos estão em pt-br e código em inglês
