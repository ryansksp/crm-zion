# TODO: Adicionar Horário de Brasília em Todas as Datas do App

## Steps to Complete:

1. **Create src/utils/date.ts - Centralized Date Formatting**  
   - Create a new utility file with `formatDateTimeBrasilia` function using `toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' })`.  
   - Export the function for use across components.

2. **Update src/components/Leads.tsx - Replace formatarData**  
   - Import `formatDateTimeBrasilia` from utils/date.ts.  
   - Replace all calls to `formatarData` with `formatDateTimeBrasilia` for dataCriacao, dataUltimaInteracao, and interacao.data in the modal and list.

3. **Update src/components/Dashboard.tsx - Update Date Displays**  
   - Import `formatDateTimeBrasilia`.  
   - Replace `toLocaleDateString('pt-BR')` with `formatDateTimeBrasilia` for dataUltimaInteracao in Atividades Recentes.

4. **Update src/components/FunilVendas.tsx - Replace formatarData**  
   - Import `formatDateTimeBrasilia`.  
   - Replace `formatarData` calls with `formatDateTimeBrasilia` for any date displays (e.g., dataUltimaInteracao).

5. **Update src/components/ClientesAtivos.tsx - Update Date Displays**  
   - Import `formatDateTimeBrasilia`.  
   - Replace `toLocaleDateString('pt-BR')` with `formatDateTimeBrasilia` for dataVenda and any other dates.

6. **Update src/components/ClientesPerdidos.tsx - Replace formatDate**  
   - Import `formatDateTimeBrasilia`.  
   - Replace `formatDate` calls with `formatDateTimeBrasilia` for dataVenda and dataPerda.

7. **Update src/components/Simulador.tsx - Add/Update Date Display**  
   - Import `formatDateTimeBrasilia`.  
   - If dataSimulacao is displayed, format it with `formatDateTimeBrasilia`; ensure it's shown in the UI if not already.

8. **Update src/components/ControleUsuarios.tsx - Format User Dates**  
   - Import `formatDateTimeBrasilia`.  
   - Format `createdAt` and `lastLogin` with `formatDateTimeBrasilia` in the user list or details.

9. **Verify and Update Other Files if Needed**  
   - Check for any other components using dates (e.g., Profile.tsx, Configuracoes.tsx) and update similarly.  
   - Ensure no breaking changes in date parsing (e.g., diasInatividade uses getTime(), which is fine).

10. **Test the Changes**  
    - Run `npm run dev`.  
    - Navigate to pages with dates: Leads, Dashboard, FunilVendas, ClientesAtivos, ClientesPerdidos, Simulador, ControleUsuarios.  
    - Verify all dates show full format (e.g., "25/10/2024 14:30:00") in Brasília time.  
    - Test creating/updating dates (e.g., move etapa) to ensure time is captured.  
    - Check for timezone conversion issues with existing ISO dates.

Progress:  
- [ ] Step 1  
- [ ] Step 2  
- [ ] Step 3  
- [ ] Step 4  
- [ ] Step 5  
- [ ] Step 6  
- [ ] Step 7  
- [ ] Step 8  
- [ ] Step 9  
- [ ] Step 10
