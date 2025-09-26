# TODO: Fix Save Button for Meta and Remove Comissao Estimada

## Steps to Complete:

1. **Update Configuracoes.tsx - Add Error Handling**  
   - Add try-catch block in `handleAtualizarMetas` to catch errors from `atualizarMetas`.  
   - Ensure `setSalvando(false)` is called in both success and error cases.  
   - Optionally, show an error message if the save fails.

2. **Update Configuracoes.tsx - Remove Comissao Estimada**  
   - Remove `comissaoEstimada` state and `setComissaoEstimada`.  
   - Remove the input field for "Comissão Estimada".  
   - Update `handleAtualizarMetas` to only pass `mensal` to `atualizarMetas`.  
   - Remove `setComissaoEstimada` from useEffect.

3. **Update PainelDesempenho.tsx - Remove Comissao Estimada Reference**  
   - In the default metas object for `metasPorUsuario[userId]`, remove `comissaoEstimada: 0`.  
   - Ensure no other references to `comissaoEstimada` remain.

4. **Verify types/index.ts**  
   - Confirm `Meta` interface does not include `comissaoEstimada` (no change needed).  
   - If needed, update the interface to remove it, but it's already absent.

5. **Update AppContext.tsx if Necessary**  
   - Check if `atualizarMetas` or initial state references `comissaoEstimada`.  
   - Remove any references to ensure consistency.

6. **Test the Changes**  
   - Run the app and test saving metas in Configuracoes.tsx.  
   - Verify the button completes (no longer stuck on "Salvando...").  
   - Confirm the commission field is removed and no errors occur.  
   - Check PainelDesempenho.tsx displays correctly without the field.

Progress:
- [x] Step 1
- [x] Step 2
- [x] Step 3
- [x] Step 4
- [x] Step 5
- [ ] Step 6
