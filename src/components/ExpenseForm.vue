<template>
  <form @submit.prevent="handleSubmit" class="expense-form">
    <h2>{{ isEditing ? 'Edit Expense' : 'Add Expense' }}</h2>
    
    <div class="form-field">
      <label for="description">Description</label>
      <input 
        id="description"
        type="text" 
        v-model="form.description" 
        required 
      />
      <span v-if="errors.description" class="error">{{ errors.description }}</span>
    </div>
    
    <div class="form-field">
      <label for="amount">Amount</label>
      <input 
        id="amount"
        type="number" 
        step="0.01" 
        v-model.number="form.amount" 
        required 
      />
      <span v-if="errors.amount" class="error">{{ errors.amount }}</span>
    </div>
    
    <div class="form-field">
      <label for="category">Category</label>
      <select id="category" v-model="form.category" required>
        <option v-for="cat in EXPENSE_CATEGORIES" :key="cat" :value="cat">
          {{ cat }}
        </option>
      </select>
      <span v-if="errors.category" class="error">{{ errors.category }}</span>
    </div>
    
    <div class="form-field">
      <label for="date">Date</label>
      <input 
        id="date"
        type="date" 
        v-model="form.date" 
        required 
      />
    </div>
    
    <div class="form-actions">
      <button type="submit">{{ isEditing ? 'Update' : 'Add' }}</button>
      <button type="button" @click="handleCancel" v-if="isEditing">Cancel</button>
    </div>
  </form>
</template>

<script setup>
import { reactive, computed, watch } from 'vue';
import { useValidation } from '../composables/useValidation.js';
import { EXPENSE_CATEGORIES } from '../constants/categories.js';

// Props
const props = defineProps({
  editingExpense: {
    type: Object,
    default: null
  }
});

// Emits
const emit = defineEmits(['submit', 'cancel']);

// Composables
const { validateAmount, validateRequired, validateCategory } = useValidation();

// Form state
const form = reactive({
  description: '',
  amount: 0,
  category: 'Food',
  date: new Date().toISOString().split('T')[0]
});

// Errors state
const errors = reactive({
  description: '',
  amount: '',
  category: ''
});

// Computed
const isEditing = computed(() => props.editingExpense !== null);

// Watch for editingExpense changes to populate form
watch(() => props.editingExpense, (expense) => {
  if (expense) {
    form.description = expense.description;
    form.amount = expense.amount;
    form.category = expense.category;
    form.date = expense.date;
  } else {
    resetForm();
  }
}, { immediate: true });

// Methods
function handleSubmit() {
  // Clear previous errors
  errors.description = '';
  errors.amount = '';
  errors.category = '';
  
  // Validate all fields
  let isValid = true;
  
  const descValidation = validateRequired(form.description);
  if (!descValidation.valid) {
    errors.description = descValidation.error;
    isValid = false;
  }
  
  const amountValidation = validateAmount(form.amount);
  if (!amountValidation.valid) {
    errors.amount = amountValidation.error;
    isValid = false;
  }
  
  const categoryValidation = validateCategory(form.category);
  if (!categoryValidation.valid) {
    errors.category = categoryValidation.error;
    isValid = false;
  }
  
  // If validation passes, emit submit event
  if (isValid) {
    const expenseData = {
      description: form.description,
      amount: form.amount,
      category: form.category,
      date: form.date
    };
    
    // Include id if editing
    if (isEditing.value) {
      expenseData.id = props.editingExpense.id;
    }
    
    emit('submit', expenseData);
    
    // Reset form only if adding (not editing)
    if (!isEditing.value) {
      resetForm();
    }
  }
}

function handleCancel() {
  emit('cancel');
  resetForm();
}

function resetForm() {
  form.description = '';
  form.amount = 0;
  form.category = 'Food';
  form.date = new Date().toISOString().split('T')[0];
  errors.description = '';
  errors.amount = '';
  errors.category = '';
}
</script>

<style scoped>
.expense-form {
  background: #fff;
  padding: 2rem;
  border-radius: 20px;
  border: 3px solid #9A93B5;
  margin-bottom: 0;
  
  height: 100%;
  display: flex;
  flex-direction: column;
}

.expense-form h2 {
  font-family: 'Great Vibes', cursive; /* Updated Font */
  font-size: 3rem;
  font-weight: normal;
  text-align: center;
  margin-top: 0;
  margin-bottom: 1.5rem;
  color: #000;
}

.form-field {
  margin-bottom: 1rem;
}

.form-field label {
  display: block;
  margin-bottom: 0.5rem;
  font-family: 'Great Vibes', cursive; /* Changed to Great Vibes */
  font-size: 2rem; /* Increased size for script font readability */
  font-style: normal; /* Removed italic so it renders properly */
  color: #000;
}

.form-field input,
.form-field select {
  width: 100%;
  padding: 0.75rem;
  background-color: #E1DEEE; /* Updated Input Box */
  border: none;
  border-radius: 8px;
  font-family: 'Almendra', serif; /* Updated Font */
  font-size: 1rem;
  box-sizing: border-box;
  outline: none;
}

.form-field input:focus,
.form-field select:focus {
  outline: 2px solid #9A93B5;
}

.form-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
  
  margin-top: auto; 
  padding-top: 1.5rem;
}

.form-actions button {
  padding: 0.5rem 2rem;
  border: none;
  border-radius: 20px;
  font-family: 'Almendra', serif; /* Updated Font */
  font-size: 1.1rem;
  cursor: pointer;
  transition: opacity 0.2s;
}

.form-actions button[type="submit"] {
  background-color: #6E6884; /* Updated Save Box */
  color: #FFFFFF; /* Updated Save Font */
}

.form-actions button[type="button"] {
  background-color: #E9E6F8; /* Cancel/Clear equivalent */
  color: #000000;
}

.form-actions button:hover {
  opacity: 0.8;
}

.error {
  color: #e74c3c;
  font-size: 0.85rem;
  font-family: 'Almendra', serif;
  margin-top: 0.25rem;
  display: block;
}
</style>
