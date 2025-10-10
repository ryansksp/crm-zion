# TODO: Fix Dark Mode Issues in Components

## Components to Fix
- [x] ControleUsuarios.tsx
- [x] Configuracoes.tsx
- [x] PainelDesempenho.tsx
- [x] Pagamentos.tsx
- [x] ClientesAtivos.tsx
- [x] PlanComparisonPopup.tsx
- [x] FunilVendas.tsx
- [x] CadastroLeads.tsx
- [x] Leads.tsx
- [x] Profile.tsx

## Changes Needed
- Add `dark:bg-gray-800` to `bg-white`
- Add `dark:text-white` to `text-gray-900`
- Add `dark:text-gray-400` to `text-gray-600`
- Add `dark:border-gray-700` to `border-gray-200`
- Add `dark:bg-gray-700` to `bg-gray-50`
- Add dark variants to colored backgrounds (e.g., `bg-green-50 dark:bg-green-900`)
- Update inputs: add `dark:bg-gray-700 dark:border-gray-600 dark:text-white`
- Update modals and popups
- Update buttons and hover states if needed

## Additional Fixes
- [x] Fix flash of dashboard before pending approval screen for new users

## Testing
- [ ] Switch to dark mode and check each component for white parts
- [ ] Ensure readability and contrast in dark mode
- [ ] Test new user login flow to ensure no flash of dashboard
