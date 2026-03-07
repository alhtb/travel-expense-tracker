<template>
  <div class="expense-list">
    <h2>Expenses</h2>
    
    <div v-if="expenses.length === 0" class="empty-state">
      No expenses yet. Add your first expense above.
    </div>
    
    <div v-else class="expense-items">
      <div v-for="expense in sortedExpenses" :key="expense.id" class="expense-item">
        
        <div class="expense-left">
          <span class="description">{{ expense.description }}</span>
          <div class="expense-meta">
            <span class="category">{{ expense.category }}</span>
            <span class="date">{{ formatDate(expense.date) }}</span>
          </div>
        </div>
        <div class="expense-right">
          <span class="amount">₱{{ expense.amount.toFixed(2) }}</span>
          <div class="expense-actions">
            <button @click="$emit('edit', expense)" class="btn-edit">Edit</button>
            <button @click="handleDelete(expense.id)" class="btn-delete">Delete</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  expenses: {
    type: Array,
    required: true
  }
});

const emit = defineEmits(['edit', 'delete']);

const sortedExpenses = computed(() => {
  return [...props.expenses].sort((a, b) => {
    return new Date(b.date) - new Date(a.date);
  });
});

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

function handleDelete(id) {
  if (confirm('Are you sure you want to delete this expense?')) {
    emit('delete', id);
  }
}
</script>

<style scoped>
.expense-list {
  background: #fff;
  padding: 2rem;
  border-radius: 20px;
  border: 3px solid #9A93B5;
  margin: 0;
  
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;

  display: flex;
  flex-direction: column;
}

h2 {
  font-family: 'Great Vibes', cursive; /* Updated Font */
  font-size: 3rem;
  font-weight: normal;
  text-align: center;
  margin-top: 0;
  margin-bottom: 1.5rem;
  color: #000;
}

.expense-items {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  
  flex: 1;
  overflow-y: auto;
  padding-right: 0.5rem; 
}

.expense-item {
  display: flex;
  justify-content: space-between;
  align-items: stretch; /* Stretches left and right to be same height */
  padding: 1.5rem;
  background: #E1DEEE; 
  border-radius: 8px;
}

.expense-left {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.expense-right {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-end; /* Aligns amount and buttons to the right */
  gap: 1rem;
}

/* Custom Lavender Scrollbar */
.expense-items::-webkit-scrollbar {
  width: 8px;
}
.expense-items::-webkit-scrollbar-track {
  background: #E1DEEE; 
  border-radius: 10px;
}
.expense-items::-webkit-scrollbar-thumb {
  background: #9A93B5; 
  border-radius: 10px;
}
.expense-items::-webkit-scrollbar-thumb:hover {
  background: #6E6884; 
}

.description {
  font-family: 'Great Vibes', cursive; /* Applied Great Vibes */
  font-size: 2rem; /* Script fonts need a larger size to be readable */
  color: #000;
  line-height: 1;
}

.amount {
  font-family: 'Almendra', serif;
  font-size: 1.2rem;
  font-weight: bold;
  color: #000;
}

.expense-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.category {
  padding: 0.2rem 0.8rem;
  background-color: #BAB6C8; /* Updated Category Box */
  color: #6E6884; /* Updated Category Font */
  font-family: 'Almendra', serif;
  border-radius: 4px;
  font-size: 0.9rem;
}

.date {
  color: #6E6884; /* Updated Date Font Color */
  font-family: 'Almendra', serif; /* Updated Font */
  font-size: 0.9rem;
}

.expense-actions {
  display: flex;
  gap: 0.5rem;
}

.expense-actions button {
  padding: 0.4rem 1.2rem;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  font-family: 'Almendra', serif; /* Updated Font */
  transition: opacity 0.2s;
}

.btn-edit {
  background-color: #E9E6F8; /* Updated Edit Box */
  color: #000000; /* Updated Edit Font */
}

.btn-delete {
  background-color: #6E6884; /* Updated Delete Box */
  color: #FFFFFF; /* Updated Delete Font */
}

.expense-actions button:hover {
  opacity: 0.8;
}

.empty-state {
  text-align: center;
  font-family: 'Almendra', serif;
  color: #6E6884;
}
</style>
