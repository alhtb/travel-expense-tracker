import { ref, watch } from 'vue';
import { useStorage } from './useStorage.js';
import { useValidation } from './useValidation.js';

/**
 * useBudget Composable
 * 
 * Manages trip configuration (budget and destination).
 * Uses useStorage for persistence and useValidation for budget validation.
 * Auto-saves on changes using watch.
 * 
 * Validates Requirements: 1.1, 1.2, 1.3, 1.4
 * Property 4: Budget non-negativity - After setBudget(x) with valid x, budget.value >= 0
 */

// Shared state (singleton pattern)
const budget = ref(0);
const destination = ref('');
let isWatchSetup = false;

export function useBudget() {
  const { loadData, saveData } = useStorage();
  const { validateBudget } = useValidation();
  
  /**
   * Set budget with validation
   * Property 4: Ensures budget.value >= 0 after setting valid budget
   * 
   * @param {number} amount - The budget amount to set
   * @throws {Error} If budget validation fails
   */
  function setBudget(amount) {
    const validation = validateBudget(amount);
    
    if (!validation.valid) {
      throw new Error(validation.error);
    }
    
    budget.value = Number(amount);
  }
  
  /**
   * Set destination
   * 
   * @param {string} name - The destination name
   */
  function setDestination(name) {
    destination.value = name || '';
  }
  
  /**
   * Load configuration from localStorage
   */
  function loadConfig() {
    const data = loadData();
    budget.value = data.tripConfig.budget;
    destination.value = data.tripConfig.destination;
  }
  
  /**
   * Save configuration to localStorage
   */
  function saveConfig() {
    const data = loadData();
    saveData(
      {
        budget: budget.value,
        destination: destination.value
      },
      data.expenses
    );
  }
  
  // Auto-save on budget or destination changes (only set up once)
  if (!isWatchSetup) {
    watch([budget, destination], () => {
      saveConfig();
    });
    isWatchSetup = true;
  }
  
  return {
    budget,
    destination,
    setBudget,
    setDestination,
    loadConfig,
    saveConfig
  };
}
