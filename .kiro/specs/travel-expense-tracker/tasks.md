# Implementation Plan: Travel Expense Tracker

## Overview

This implementation plan breaks down the Travel Expense Tracker into discrete coding tasks. The approach follows a bottom-up strategy: build foundational composables first, then create presentational components, and finally integrate everything. Each task builds incrementally to ensure the application remains functional at every step.

## Tasks

- [x] 1. Project setup and constants
  - Install Chart.js dependency (`npm install chart.js`)
  - Create `src/constants/categories.js` with EXPENSE_CATEGORIES array
  - _Requirements: 9.1, 9.2_

- [x] 2. Implement useStorage composable
  - [x] 2.1 Create `src/composables/useStorage.js` with loadData and saveData functions
    - Implement localStorage get/set with JSON serialization
    - Define STORAGE_KEY constant
    - Return default structure when no data exists
    - Handle JSON parse errors gracefully
    - _Requirements: 8.1, 8.2, 8.3_

- [x] 3. Implement useValidation composable
  - [x] 3.1 Create `src/composables/useValidation.js` with validation functions
    - Implement validateBudget (budget >= 0)
    - Implement validateAmount (amount > 0)
    - Implement validateRequired (not empty/null/undefined)
    - Implement validateCategory (must be in EXPENSE_CATEGORIES)
    - Each function returns { valid: boolean, error: string }
    - _Requirements: 1.2, 2.2, 10.1, 10.2, 10.3_

- [x] 4. Implement useBudget composable
  - [x] 4.1 Create `src/composables/useBudget.js` with budget management
    - Create reactive refs for budget and destination
    - Implement setBudget with validation using useValidation
    - Implement setDestination
    - Implement loadConfig using useStorage
    - Implement saveConfig using useStorage
    - Auto-save on budget/destination changes
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [x] 5. Implement useExpenses composable
  - [x] 5.1 Create `src/composables/useExpenses.js` with expense CRUD operations
    - Create reactive ref for expenses array
    - Implement addExpense with UUID generation and validation
    - Implement updateExpense with validation
    - Implement deleteExpense
    - Implement loadExpenses using useStorage
    - Implement saveExpenses using useStorage
    - Auto-save after mutations
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.2, 3.3, 4.1, 4.2_

  - [x] 5.2 Add computed properties to useExpenses
    - Implement totalSpent computed (sum of all expense amounts)
    - Implement remainingBudget computed (budget - totalSpent)
    - Implement categoryTotals computed (aggregate by category)
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 7.1_

- [x] 6. Checkpoint - Verify composables work independently
  - Test composables in isolation by importing them in App.vue
  - Verify localStorage persistence works
  - Verify computed properties calculate correctly
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Create BudgetSummary component
  - [x] 7.1 Create `src/components/BudgetSummary.vue` with budget display and inputs
    - Define props: budget, totalSpent, remainingBudget
    - Use useBudget composable for budget/destination management
    - Create input fields for budget and destination
    - Implement validation on blur using useValidation
    - Display validation errors inline
    - Display total spent and remaining budget with currency formatting
    - Use scoped styles
    - _Requirements: 1.1, 1.2, 1.4, 5.3, 5.4, 10.1, 10.4_

- [x] 8. Create ExpenseForm component
  - [x] 8.1 Create `src/components/ExpenseForm.vue` with add/edit form
    - Define props: editingExpense (Expense | null)
    - Define emits: submit, cancel
    - Create reactive form state (description, amount, category, date)
    - Create reactive errors state
    - Import EXPENSE_CATEGORIES for category dropdown
    - Implement form validation on submit using useValidation
    - Populate form when editingExpense changes
    - Reset form after successful submit
    - Display validation errors inline
    - Use scoped styles
    - _Requirements: 2.1, 2.2, 2.3, 3.1, 3.2, 9.3, 10.2, 10.3, 10.4_

- [x] 9. Create ExpenseList component
  - [x] 9.1 Create `src/components/ExpenseList.vue` with expense display
    - Define props: expenses (array)
    - Define emits: edit, delete
    - Display all expenses sorted by date (newest first)
    - Show description, amount, category, date for each expense
    - Format currency to 2 decimal places
    - Format dates for display
    - Add Edit and Delete buttons for each expense
    - Implement delete confirmation dialog
    - Display empty state message when no expenses
    - Use scoped styles
    - _Requirements: 4.1, 6.1, 6.2, 6.3, 6.4_

- [x] 10. Create CategoryChart component
  - [x] 10.1 Create `src/components/CategoryChart.vue` with Chart.js pie chart
    - Define props: categoryTotals (object), isEmpty (boolean)
    - Import Chart.js
    - Create canvas ref for chart
    - Implement chart creation in onMounted
    - Configure pie chart with category labels and totals
    - Filter out categories with 0 total
    - Use predefined color palette for segments
    - Implement chart update in watch when categoryTotals changes
    - Destroy chart in onUnmounted
    - Display empty state when isEmpty is true
    - Use scoped styles
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 11. Integrate components in App.vue
  - [x] 11.1 Wire all components together in App.vue
    - Import all composables (useBudget, useExpenses)
    - Import all components (BudgetSummary, ExpenseForm, ExpenseList, CategoryChart)
    - Create editingExpense ref for tracking edit mode
    - Call loadConfig and loadExpenses on mount
    - Implement handleExpenseSubmit (add or update based on editingExpense)
    - Implement handleEdit (set editingExpense)
    - Implement handleCancel (clear editingExpense)
    - Implement handleDelete (call deleteExpense)
    - Pass data to components via props
    - Handle events from components
    - Display destination in header
    - Use scoped styles for layout
    - _Requirements: All requirements integrated_

- [x] 12. Add global styles and polish
  - [x] 12.1 Create `src/style.css` with global styles
    - Define CSS variables for colors, spacing, typography
    - Set base styles for body, headings, buttons, inputs
    - Ensure responsive layout
    - Ensure accessible color contrast
    - Add mobile-friendly styles
    - _Requirements: Accessibility and UX_

- [x] 13. Final checkpoint - End-to-end validation
  - Test complete user flow: set budget, add expenses, edit, delete
  - Verify localStorage persistence across page reloads
  - Verify all calculations are correct
  - Verify empty states display properly
  - Verify validation errors display correctly
  - Verify chart updates when expenses change
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- All business logic resides in composables; components are purely presentational
- No testing tasks included per project steering guidelines
- Each task builds incrementally to maintain working state
- Checkpoints ensure validation at key milestones
- All tasks reference specific requirements for traceability
- Use Vue 3 Composition API with <script setup> syntax throughout
- Use localStorage for persistence (no backend)
- Use Chart.js for pie chart visualization
