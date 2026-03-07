/**
 * useStorage composable
 * Handles localStorage persistence for trip configuration and expenses
 */

const STORAGE_KEY = 'travel-expense-tracker';

/**
 * Load data from localStorage
 * @returns {Object} Object containing tripConfig and expenses
 */
export function loadData() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    
    if (!stored) {
      return getDefaultData();
    }
    
    const parsed = JSON.parse(stored);
    return parsed;
  } catch (error) {
    console.error('Error loading data from localStorage:', error);
    return getDefaultData();
  }
}

/**
 * Save data to localStorage
 * @param {Object} tripConfig - Trip configuration object with budget and destination
 * @param {Array} expenses - Array of expense objects
 */
export function saveData(tripConfig, expenses) {
  try {
    const data = {
      tripConfig,
      expenses
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving data to localStorage:', error);
  }
}

/**
 * Get default data structure
 * @returns {Object} Default data structure
 */
function getDefaultData() {
  return {
    tripConfig: {
      budget: 0,
      destination: ''
    },
    expenses: []
  };
}

export function useStorage() {
  return {
    loadData,
    saveData
  };
}
