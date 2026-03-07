# Design Document: Travel Expense Tracker

## Overview

The Travel Expense Tracker is a Vue 3 single-page application that manages travel expenses against a budget. The architecture follows a composable-based design where all business logic resides in composables, and components remain purely presentational. Data persists in localStorage with no backend dependency.

## Architecture

### Component Structure

```
App.vue (Root)
├── BudgetSummary.vue (Display budget, spent, remaining)
├── ExpenseForm.vue (Add/Edit expense form)
├── ExpenseList.vue (List of expenses with edit/delete)
└── CategoryChart.vue (Pie chart visualization)
```

### Composables (Business Logic Layer)

1. **useExpenses**: Manages expense CRUD operations
2. **useBudget**: Manages budget and destination configuration
3. **useStorage**: Handles localStorage persistence
4. **useValidation**: Provides input validation logic

### Data Models

```javascript
// Expense
{
  id: string,           // UUID
  description: string,
  amount: number,       // > 0, 2 decimal places
  category: string,     // From EXPENSE_CATEGORIES
  date: string          // ISO date format
}

// Trip Configuration
{
  budget: number,       // >= 0
  destination: string
}

// Storage Structure
{
  tripConfig: { budget, destination },
  expenses: [Expense]
}
```

### Constants

```javascript
// EXPENSE_CATEGORIES
const EXPENSE_CATEGORIES = [
  'Food',
  'Transport',
  'Accommodation',
  'Entertainment',
  'Shopping',
  'Other'
];
```

## Detailed Design

### 1. useStorage Composable

**Purpose**: Abstract localStorage operations with serialization/deserialization

**Interface**:
```javascript
function useStorage() {
  const STORAGE_KEY = 'travel-expense-tracker';
  
  function loadData(): { tripConfig, expenses }
  function saveData(tripConfig, expenses): void
  
  return { loadData, saveData };
}
```

**Implementation Details**:
- Uses `localStorage.getItem()` and `localStorage.setItem()`
- Serializes data to JSON
- Returns default structure if no data exists
- Handles JSON parse errors gracefully

**Properties**:
- **Property 1: Round-trip consistency** (Validates Requirement 8.4)
  - For all valid data D, `loadData(saveData(D)) === D`

### 2. useValidation Composable

**Purpose**: Centralize validation logic for budget and expense inputs

**Interface**:
```javascript
function useValidation() {
  function validateBudget(budget: number): { valid: boolean, error: string }
  function validateAmount(amount: number): { valid: boolean, error: string }
  function validateRequired(value: any): { valid: boolean, error: string }
  function validateCategory(category: string): { valid: boolean, error: string }
  
  return { 
    validateBudget, 
    validateAmount, 
    validateRequired,
    validateCategory 
  };
}
```

**Validation Rules**:
- Budget: Must be >= 0
- Amount: Must be > 0
- Required: Must not be empty/null/undefined
- Category: Must be in EXPENSE_CATEGORIES

**Properties**:
- **Property 2: Budget validation boundary** (Validates Requirement 1.2, 10.1)
  - `validateBudget(x).valid === true` if and only if `x >= 0`
- **Property 3: Amount validation boundary** (Validates Requirement 2.2, 10.2)
  - `validateAmount(x).valid === true` if and only if `x > 0`

### 3. useBudget Composable

**Purpose**: Manage trip configuration (budget and destination)

**Interface**:
```javascript
function useBudget() {
  const budget = ref(0);
  const destination = ref('');
  
  function setBudget(amount: number): void
  function setDestination(name: string): void
  function loadConfig(): void
  function saveConfig(): void
  
  return { 
    budget, 
    destination, 
    setBudget, 
    setDestination,
    loadConfig,
    saveConfig
  };
}
```

**Implementation Details**:
- Uses useStorage for persistence
- Uses useValidation for budget validation
- Reactive refs for budget and destination
- Auto-saves on changes

**Properties**:
- **Property 4: Budget non-negativity** (Validates Requirement 1.2)
  - After `setBudget(x)` with valid x, `budget.value >= 0`

### 4. useExpenses Composable

**Purpose**: Manage expense CRUD operations and calculations

**Interface**:
```javascript
function useExpenses() {
  const expenses = ref([]);
  const totalSpent = computed(() => number);
  const remainingBudget = computed((budget) => number);
  const categoryTotals = computed(() => Record<string, number>);
  
  function addExpense(expense: Omit<Expense, 'id'>): void
  function updateExpense(id: string, expense: Partial<Expense>): void
  function deleteExpense(id: string): void
  function loadExpenses(): void
  function saveExpenses(): void
  
  return {
    expenses,
    totalSpent,
    remainingBudget,
    categoryTotals,
    addExpense,
    updateExpense,
    deleteExpense,
    loadExpenses,
    saveExpenses
  };
}
```

**Implementation Details**:
- Uses useStorage for persistence
- Uses useValidation for expense validation
- Generates UUID for new expenses
- Auto-saves after mutations
- Computed properties for derived data

**Calculations**:
- `totalSpent = sum(expenses.map(e => e.amount))`
- `remainingBudget = budget - totalSpent`
- `categoryTotals = expenses.reduce((acc, e) => { acc[e.category] += e.amount })`

**Properties**:
- **Property 5: Total spent accuracy** (Validates Requirement 5.1)
  - `totalSpent === sum of all expense amounts`
- **Property 6: Remaining budget calculation** (Validates Requirement 5.2)
  - `remainingBudget === budget - totalSpent`
- **Property 7: Expense persistence** (Validates Requirement 2.5, 8.1)
  - After `addExpense(e)`, expense with matching data exists in storage
- **Property 8: Expense uniqueness** (Validates Requirement 2.4)
  - All expense IDs are unique

### 5. App.vue (Root Component)

**Purpose**: Application shell and state orchestration

**Responsibilities**:
- Initialize composables
- Manage view state (add vs edit mode)
- Coordinate data flow between components
- Load initial data on mount

**Template Structure**:
```vue
<template>
  <div class="app">
    <header>
      <h1>Travel Expense Tracker</h1>
      <div>{{ destination }}</div>
    </header>
    
    <BudgetSummary 
      :budget="budget"
      :totalSpent="totalSpent"
      :remainingBudget="remainingBudget"
    />
    
    <ExpenseForm
      :editingExpense="editingExpense"
      @submit="handleExpenseSubmit"
      @cancel="handleCancel"
    />
    
    <ExpenseList
      :expenses="expenses"
      @edit="handleEdit"
      @delete="handleDelete"
    />
    
    <CategoryChart
      :categoryTotals="categoryTotals"
      :isEmpty="expenses.length === 0"
    />
  </div>
</template>
```

**State Management**:
- `editingExpense`: Tracks expense being edited (null for add mode)
- Passes data down via props
- Handles events up from children

### 6. BudgetSummary.vue

**Purpose**: Display budget configuration and spending summary

**Props**:
- `budget: number`
- `totalSpent: number`
- `remainingBudget: number`

**Template**:
```vue
<template>
  <div class="budget-summary">
    <div class="budget-input">
      <label>Budget</label>
      <input type="number" v-model="localBudget" @blur="updateBudget" />
      <span v-if="budgetError" class="error">{{ budgetError }}</span>
    </div>
    
    <div class="budget-input">
      <label>Destination</label>
      <input type="text" v-model="localDestination" @blur="updateDestination" />
    </div>
    
    <div class="summary">
      <div class="stat">
        <span>Total Spent</span>
        <span class="amount">${{ totalSpent.toFixed(2) }}</span>
      </div>
      <div class="stat">
        <span>Remaining</span>
        <span class="amount">${{ remainingBudget.toFixed(2) }}</span>
      </div>
    </div>
  </div>
</template>
```

**Behavior**:
- Uses useBudget composable
- Validates budget input on blur
- Displays validation errors inline
- Formats currency to 2 decimal places

### 7. ExpenseForm.vue

**Purpose**: Form for adding/editing expenses

**Props**:
- `editingExpense: Expense | null`

**Emits**:
- `submit(expense)`: When form is submitted with valid data
- `cancel()`: When edit is cancelled

**Template**:
```vue
<template>
  <form @submit.prevent="handleSubmit" class="expense-form">
    <h2>{{ isEditing ? 'Edit Expense' : 'Add Expense' }}</h2>
    
    <div class="form-field">
      <label>Description</label>
      <input type="text" v-model="form.description" required />
      <span v-if="errors.description" class="error">{{ errors.description }}</span>
    </div>
    
    <div class="form-field">
      <label>Amount</label>
      <input type="number" step="0.01" v-model.number="form.amount" required />
      <span v-if="errors.amount" class="error">{{ errors.amount }}</span>
    </div>
    
    <div class="form-field">
      <label>Category</label>
      <select v-model="form.category" required>
        <option v-for="cat in EXPENSE_CATEGORIES" :key="cat" :value="cat">
          {{ cat }}
        </option>
      </select>
    </div>
    
    <div class="form-field">
      <label>Date</label>
      <input type="date" v-model="form.date" required />
    </div>
    
    <div class="form-actions">
      <button type="submit">{{ isEditing ? 'Update' : 'Add' }}</button>
      <button type="button" @click="handleCancel" v-if="isEditing">Cancel</button>
    </div>
  </form>
</template>
```

**Behavior**:
- Uses useValidation composable
- Populates form when editingExpense changes
- Validates on submit
- Resets form after successful submit
- Emits events to parent

**Form State**:
```javascript
const form = reactive({
  description: '',
  amount: 0,
  category: 'Food',
  date: new Date().toISOString().split('T')[0]
});

const errors = reactive({
  description: '',
  amount: ''
});
```

### 8. ExpenseList.vue

**Purpose**: Display list of expenses with edit/delete actions

**Props**:
- `expenses: Expense[]`

**Emits**:
- `edit(expense)`: When edit button clicked
- `delete(id)`: When delete confirmed

**Template**:
```vue
<template>
  <div class="expense-list">
    <h2>Expenses</h2>
    
    <div v-if="expenses.length === 0" class="empty-state">
      No expenses yet. Add your first expense above.
    </div>
    
    <div v-else class="expense-items">
      <div v-for="expense in sortedExpenses" :key="expense.id" class="expense-item">
        <div class="expense-info">
          <div class="expense-header">
            <span class="description">{{ expense.description }}</span>
            <span class="amount">${{ expense.amount.toFixed(2) }}</span>
          </div>
          <div class="expense-meta">
            <span class="category">{{ expense.category }}</span>
            <span class="date">{{ formatDate(expense.date) }}</span>
          </div>
        </div>
        <div class="expense-actions">
          <button @click="$emit('edit', expense)">Edit</button>
          <button @click="handleDelete(expense.id)">Delete</button>
        </div>
      </div>
    </div>
  </div>
</template>
```

**Behavior**:
- Sorts expenses by date (newest first)
- Formats dates for display
- Confirms before delete
- Shows empty state when no expenses

**Delete Confirmation**:
```javascript
function handleDelete(id) {
  if (confirm('Are you sure you want to delete this expense?')) {
    emit('delete', id);
  }
}
```

### 9. CategoryChart.vue

**Purpose**: Visualize expense breakdown by category using Chart.js

**Props**:
- `categoryTotals: Record<string, number>`
- `isEmpty: boolean`

**Template**:
```vue
<template>
  <div class="category-chart">
    <h2>Spending by Category</h2>
    
    <div v-if="isEmpty" class="empty-state">
      No expenses to display
    </div>
    
    <canvas v-else ref="chartCanvas"></canvas>
  </div>
</template>
```

**Behavior**:
- Uses Chart.js Pie chart
- Filters out categories with 0 total
- Updates chart when categoryTotals changes
- Destroys and recreates chart on updates
- Shows empty state when no data

**Chart Configuration**:
```javascript
const chartConfig = {
  type: 'pie',
  data: {
    labels: Object.keys(categoryTotals),
    datasets: [{
      data: Object.values(categoryTotals),
      backgroundColor: [
        '#FF6384',
        '#36A2EB',
        '#FFCE56',
        '#4BC0C0',
        '#9966FF',
        '#FF9F40'
      ]
    }]
  },
  options: {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom'
      }
    }
  }
};
```

## Data Flow

### Adding an Expense

1. User fills ExpenseForm and submits
2. ExpenseForm validates input using useValidation
3. ExpenseForm emits 'submit' event to App.vue
4. App.vue calls useExpenses.addExpense()
5. useExpenses generates UUID, adds to expenses array
6. useExpenses calls useStorage.saveData()
7. Computed properties (totalSpent, categoryTotals) update
8. BudgetSummary and CategoryChart re-render with new data

### Editing an Expense

1. User clicks Edit in ExpenseList
2. ExpenseList emits 'edit' event to App.vue
3. App.vue sets editingExpense state
4. ExpenseForm populates with expense data
5. User modifies and submits
6. ExpenseForm emits 'submit' event
7. App.vue calls useExpenses.updateExpense()
8. useExpenses updates expense in array
9. useExpenses calls useStorage.saveData()
10. All dependent components re-render

### Deleting an Expense

1. User clicks Delete in ExpenseList
2. ExpenseList shows confirmation dialog
3. On confirm, ExpenseList emits 'delete' event
4. App.vue calls useExpenses.deleteExpense()
5. useExpenses removes expense from array
6. useExpenses calls useStorage.saveData()
7. All dependent components re-render

### Initial Load

1. App.vue mounts
2. useBudget.loadConfig() called
3. useExpenses.loadExpenses() called
4. useStorage.loadData() retrieves from localStorage
5. Data populates reactive state
6. All components render with loaded data

## Error Handling

### Validation Errors
- Display inline error messages below invalid fields
- Prevent form submission when validation fails
- Clear errors when user corrects input

### Storage Errors
- Catch JSON parse errors in useStorage
- Return default empty structure on error
- Log errors to console for debugging

### Empty States
- ExpenseList shows "No expenses yet" message
- CategoryChart shows "No expenses to display" message
- Handle division by zero in calculations

## Styling Approach

- Scoped styles in each component
- Global styles in src/style.css
- Responsive layout using flexbox/grid
- Consistent spacing and typography
- Accessible color contrast
- Mobile-friendly design

## Correctness Properties

### Property 1: Round-trip consistency
**Validates**: Requirement 8.4
**Statement**: For all valid data D, storing then loading produces equivalent data
**Test Strategy**: Property-based test with random expense data

### Property 2: Budget validation boundary
**Validates**: Requirements 1.2, 10.1
**Statement**: validateBudget(x).valid === true iff x >= 0
**Test Strategy**: Property-based test with random numbers

### Property 3: Amount validation boundary
**Validates**: Requirements 2.2, 10.2
**Statement**: validateAmount(x).valid === true iff x > 0
**Test Strategy**: Property-based test with random numbers

### Property 4: Budget non-negativity
**Validates**: Requirement 1.2
**Statement**: After setBudget(x) with valid x, budget.value >= 0
**Test Strategy**: Property-based test with valid budget values

### Property 5: Total spent accuracy
**Validates**: Requirement 5.1
**Statement**: totalSpent equals sum of all expense amounts
**Test Strategy**: Property-based test with random expense lists

### Property 6: Remaining budget calculation
**Validates**: Requirement 5.2
**Statement**: remainingBudget === budget - totalSpent
**Test Strategy**: Property-based test with random budgets and expenses

### Property 7: Expense persistence
**Validates**: Requirements 2.5, 8.1
**Statement**: After addExpense(e), expense exists in storage
**Test Strategy**: Property-based test with random expenses

### Property 8: Expense uniqueness
**Validates**: Requirement 2.4
**Statement**: All expense IDs are unique
**Test Strategy**: Property-based test generating multiple expenses

## Implementation Notes

### Vue 3 Composition API
- Use `<script setup>` syntax for all components
- Use `ref()` for primitive reactive values
- Use `reactive()` for object reactive values
- Use `computed()` for derived state
- Use `watch()` for side effects

### Chart.js Integration
- Install: `npm install chart.js`
- Import: `import { Chart } from 'chart.js/auto'`
- Create chart in `onMounted()`
- Destroy chart in `onUnmounted()`
- Update chart in `watch()` on data changes

### localStorage Best Practices
- Use single storage key for all data
- Serialize entire state as JSON
- Handle quota exceeded errors
- Provide fallback for private browsing

### Accessibility
- Use semantic HTML elements
- Provide labels for all inputs
- Ensure keyboard navigation works
- Use ARIA labels where needed
- Maintain focus management

## Future Enhancements (Out of Scope)

- Multi-trip support
- Currency conversion
- Receipt photo uploads
- Export to CSV/PDF
- Backend synchronization
- User authentication
- Expense search/filtering
- Budget alerts/notifications
