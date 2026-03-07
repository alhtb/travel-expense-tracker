<script setup>
import { ref, onMounted } from 'vue';
import { useBudget } from './composables/useBudget.js';
import { useExpenses } from './composables/useExpenses.js';
import BudgetSummary from './components/BudgetSummary.vue';
import ExpenseForm from './components/ExpenseForm.vue';
import ExpenseList from './components/ExpenseList.vue';
import CategoryChart from './components/CategoryChart.vue';

// Composables
const { budget, destination, loadConfig } = useBudget();
const { 
  expenses, 
  totalSpent, 
  remainingBudget, 
  categoryTotals, 
  addExpense, 
  updateExpense, 
  deleteExpense, 
  loadExpenses 
} = useExpenses(budget);

// State for tracking edit mode
const editingExpense = ref(null);

// Load initial data on mount
onMounted(() => {
  loadConfig();
  loadExpenses();
});

// Handle expense submission (add or update)
function handleExpenseSubmit(expenseData) {
  if (editingExpense.value) {
    // Update existing expense
    updateExpense(expenseData.id, expenseData);
    editingExpense.value = null;
  } else {
    // Add new expense
    addExpense(expenseData);
  }
}

// Handle edit button click
function handleEdit(expense) {
  editingExpense.value = expense;
}

// Handle cancel button click
function handleCancel() {
  editingExpense.value = null;
}

// Handle delete button click
function handleDelete(id) {
  deleteExpense(id);
}
</script>

<template>
  <div class="app">
    <main class="app-main">
      <BudgetSummary 
        :budget="budget"
        :totalSpent="totalSpent"
        :remainingBudget="remainingBudget"
        :categoryTotals="categoryTotals"
        :isEmpty="expenses.length === 0"
      />
      
      <div class="bottom-dashboard-grid">
        
        <div class="expense-list-wrapper">
          <ExpenseList
            :expenses="expenses"
            @edit="handleEdit"
            @delete="handleDelete"
          />
        </div>

        <ExpenseForm
          :editingExpense="editingExpense"
          @submit="handleExpenseSubmit"
          @cancel="handleCancel"
        />
      </div>
    </main>
  </div>
</template>

<style scoped>
.app {
  min-height: 100vh;
}

.app-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2rem;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.app-header h1 {
  margin: 0;
  font-size: 2rem;
  font-weight: 600;
}

.destination {
  margin-top: 0.5rem;
  font-size: 1.1rem;
  opacity: 0.9;
}

.app-main {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

@media (max-width: 768px) {
  .app-header h1 {
    font-size: 1.5rem;
  }
  
  .app-main {
    padding: 1rem;
  }
}

.bottom-dashboard-grid {
  display: grid;
  grid-template-columns: 1fr 1fr; 
  gap: 2rem; 
  align-items: stretch; /* Form dictates height, wrapper stretches to match */
}

.expense-list-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
}

@media (max-width: 800px) {
  .bottom-dashboard-grid {
    grid-template-columns: 1fr; 
  }
  
  /* On mobile, they stack, so we give the list a fixed height to scroll in */
  .expense-list-wrapper {
    height: 500px; 
  }
}
</style>
