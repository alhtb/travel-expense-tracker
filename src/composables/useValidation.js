import { EXPENSE_CATEGORIES } from '../constants/categories.js';

/**
 * useValidation Composable
 * 
 * Provides validation functions for budget and expense inputs.
 * All validation functions return { valid: boolean, error: string }.
 * 
 * Validates Requirements: 1.2, 2.2, 10.1, 10.2, 10.3
 * Properties: 2 (Budget validation boundary), 3 (Amount validation boundary)
 */
export function useValidation() {
  /**
   * Validate budget amount
   * Property 2: validateBudget(x).valid === true if and only if x >= 0
   * 
   * @param {number} budget - The budget amount to validate
   * @returns {{ valid: boolean, error: string }} Validation result
   */
  function validateBudget(budget) {
    if (budget == null || budget === '') {
      return {
        valid: false,
        error: 'Budget is required'
      };
    }

    const numBudget = Number(budget);
    
    if (isNaN(numBudget)) {
      return {
        valid: false,
        error: 'Budget must be a valid number'
      };
    }

    if (numBudget < 0) {
      return {
        valid: false,
        error: 'Budget cannot be negative'
      };
    }

    return {
      valid: true,
      error: ''
    };
  }

  /**
   * Validate expense amount
   * Property 3: validateAmount(x).valid === true if and only if x > 0
   * 
   * @param {number} amount - The expense amount to validate
   * @returns {{ valid: boolean, error: string }} Validation result
   */
  function validateAmount(amount) {
    if (amount == null || amount === '') {
      return {
        valid: false,
        error: 'Amount is required'
      };
    }

    const numAmount = Number(amount);
    
    if (isNaN(numAmount)) {
      return {
        valid: false,
        error: 'Amount must be a valid number'
      };
    }

    if (numAmount <= 0) {
      return {
        valid: false,
        error: 'Amount must be greater than 0'
      };
    }

    return {
      valid: true,
      error: ''
    };
  }

  /**
   * Validate required field
   * 
   * @param {any} value - The value to validate
   * @returns {{ valid: boolean, error: string }} Validation result
   */
  function validateRequired(value) {
    if (value == null || value === undefined) {
      return {
        valid: false,
        error: 'This field is required'
      };
    }

    // Handle strings - check for empty or whitespace-only
    if (typeof value === 'string' && value.trim() === '') {
      return {
        valid: false,
        error: 'This field is required'
      };
    }

    return {
      valid: true,
      error: ''
    };
  }

  /**
   * Validate expense category
   * 
   * @param {string} category - The category to validate
   * @returns {{ valid: boolean, error: string }} Validation result
   */
  function validateCategory(category) {
    if (!category) {
      return {
        valid: false,
        error: 'Category is required'
      };
    }

    if (!EXPENSE_CATEGORIES.includes(category)) {
      return {
        valid: false,
        error: 'Invalid category. Must be one of: ' + EXPENSE_CATEGORIES.join(', ')
      };
    }

    return {
      valid: true,
      error: ''
    };
  }

  return {
    validateBudget,
    validateAmount,
    validateRequired,
    validateCategory
  };
}
