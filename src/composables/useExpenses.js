import { ref, computed } from 'vue';
import { useStorage } from './useStorage.js';
import { useValidation } from './useValidation.js';

/**
 * useExpenses Composable
 * 
 * Manages expense CRUD operations and calculations.
 * Uses useStorage for persistence and useValidation for expense validation.
 * Generates UUID for new expenses and auto-saves after mutations.
 * 
 * Validates Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.2, 3.3, 4.1, 4.2, 5.1, 5.2, 5.3, 5.4, 5.5, 7.1
 * Properties: 5 (Total spent accuracy), 6 (Remaining budget calculation), 7 (Expense persistence), 8 (Expense uniqueness)
 */

// Shared state (singleton pattern)
const expenses = ref([]);

export function useExpenses(budgetRef) {
  const { loadData, saveData } = useStorage();
  const { validateAmount, validateRequired, validateCategory } = useValidation();
  
  /**
   * Generate a UUID for new expenses
   * @returns {string} UUID string
   */
  function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
  
  /**
   * Validate expense data
   * @param {Object} expense - Expense object to validate
   * @returns {{ valid: boolean, errors: Object }} Validation result
   */
  function validateExpense(expense) {
    const errors = {};
    let valid = true;
    
    // Validate description
    const descValidation = validateRequired(expense.description);
    if (!descValidation.valid) {
      errors.description = descValidation.error;
      valid = false;
    }
    
    // Validate amount
    const amountValidation = validateAmount(expense.amount);
    if (!amountValidation.valid) {
      errors.amount = amountValidation.error;
      valid = false;
    }
    
    // Validate category
    const categoryValidation = validateCategory(expense.category);
    if (!categoryValidation.valid) {
      errors.category = categoryValidation.error;
      valid = false;
    }
    
    // Validate date
    const dateValidation = validateRequired(expense.date);
    if (!dateValidation.valid) {
      errors.date = dateValidation.error;
      valid = false;
    }
    
    return { valid, errors };
  }
  
  /**
   * Add a new expense
   * Property 7: After addExpense(e), expense exists in storage
   * Property 8: All expense IDs are unique
   * 
   * @param {Object} expense - Expense object without id (description, amount, category, date)
   * @throws {Error} If expense validation fails
   */
  function addExpense(expense) {
    const validation = validateExpense(expense);
    
    if (!validation.valid) {
      const errorMessages = Object.values(validation.errors).join(', ');
      throw new Error(`Expense validation failed: ${errorMessages}`);
    }
    
    // Generate unique ID and add to expenses
    const newExpense = {
      id: generateUUID(),
      description: expense.description,
      amount: Number(expense.amount),
      category: expense.category,
      date: expense.date
    };
    
    expenses.value.push(newExpense);
    saveExpenses();
  }
  
  /**
   * Update an existing expense
   * 
   * @param {string} id - The expense ID to update
   * @param {Object} updates - Partial expense object with fields to update
   * @throws {Error} If expense not found or validation fails
   */
  function updateExpense(id, updates) {
    const index = expenses.value.findIndex(e => e.id === id);
    
    if (index === -1) {
      throw new Error(`Expense with id ${id} not found`);
    }
    
    // Merge updates with existing expense
    const updatedExpense = {
      ...expenses.value[index],
      ...updates
    };
    
    // Validate the updated expense
    const validation = validateExpense(updatedExpense);
    
    if (!validation.valid) {
      const errorMessages = Object.values(validation.errors).join(', ');
      throw new Error(`Expense validation failed: ${errorMessages}`);
    }
    
    // Update the expense
    expenses.value[index] = {
      ...updatedExpense,
      amount: Number(updatedExpense.amount)
    };
    
    saveExpenses();
  }
  
  /**
   * Delete an expense
   * 
   * @param {string} id - The expense ID to delete
   */
  function deleteExpense(id) {
    expenses.value = expenses.value.filter(e => e.id !== id);
    saveExpenses();
  }
  
  /**
   * Load expenses from localStorage
   */
  function loadExpenses() {
    const data = loadData();
    expenses.value = data.expenses || [];
  }
  
  /**
   * Save expenses to localStorage
   */
  function saveExpenses() {
    const data = loadData();
    saveData(data.tripConfig, expenses.value);
  }
  
  /**
   * Computed: Total spent across all expenses
   * Property 5: totalSpent === sum of all expense amounts
   */
  const totalSpent = computed(() => {
    return expenses.value.reduce((sum, expense) => sum + expense.amount, 0);
  });
  
  /**
   * Computed: Remaining budget
   * Property 6: remainingBudget === budget - totalSpent
   * 
   * @param {Ref<number>} budgetRef - Optional budget ref for calculation
   */
  const remainingBudget = computed(() => {
    if (!budgetRef) {
      return 0;
    }
    return budgetRef.value - totalSpent.value;
  });
  
  /**
   * Computed: Category totals
   * Aggregates expense amounts by category
   */
  const categoryTotals = computed(() => {
    const totals = {};
    
    expenses.value.forEach(expense => {
      if (!totals[expense.category]) {
        totals[expense.category] = 0;
      }
      totals[expense.category] += expense.amount;
    });
    
    return totals;
  });
  
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
