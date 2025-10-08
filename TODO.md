# TODO List for Simulador Modifications

## Task: Lock value list until category is selected and filter by category

### Information Gathered:
- The Simulador component has a category select ("Categoria") and a value select ("Valor do Crédito").
- The value select is already disabled when no category is selected (`disabled={!selectedCategoria}`).
- The `uniqueCredits` array is filtered by `selectedCategoria`, showing only credits for the selected category.
- When a plan is selected from "Plano Embracon", it populates the form fields but does not set `selectedCategoria`, causing the value select to be disabled even though `valorCredito` is set, leading to inconsistent UI.
- Categories are 'automovel' or 'imovel' from the plan data.

### Plan:
1. Modify the category select's `onChange` to reset `selectedPlano` to null when category is changed, ensuring manual category selection takes precedence.
2. Update the `useEffect` for `selectedPlano` to set `selectedCategoria` based on the selected plan's category, and reset it when no plan is selected.
3. Ensure the value select remains disabled until a category is selected (either manually or via plan).

### Dependent Files to be edited:
- `src/components/Simulador.tsx`: Update the category onChange and the selectedPlano useEffect.

### Followup steps:
- Test the simulator to ensure category selection enables the value list and filters correctly.
- Verify that selecting a plan sets the category and enables the value list with appropriate options.
- Confirm no value is pre-selected until category is chosen.
