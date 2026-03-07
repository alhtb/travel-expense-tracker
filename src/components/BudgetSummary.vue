<script setup>
import { ref } from 'vue';
import { useBudget } from '../composables/useBudget.js';
import { useValidation } from '../composables/useValidation.js';
import CategoryChart from './CategoryChart.vue';

const props = defineProps({
  budget: { type: Number, required: true },
  totalSpent: { type: Number, required: true },
  remainingBudget: { type: Number, required: true },
  categoryTotals: { type: Object, required: true },
  isEmpty: { type: Boolean, required: true }
});

const { budget, destination, setBudget, setDestination } = useBudget();
const { validateBudget } = useValidation();

const localBudget = ref(null);
const localDestination = ref('');
const budgetError = ref('');
const saveMessage = ref('');

function saveBudgetAndDestination() {
  budgetError.value = '';
  saveMessage.value = '';

  if (!localBudget.value && !localDestination.value) {
    budgetError.value = 'Please enter a budget or destination to update.';
    return;
  }

  if (localBudget.value) {
    const validation = validateBudget(localBudget.value);
    if (!validation.valid) {
      budgetError.value = validation.error;
      return;
    }
  }

  try {
    const tripExists = budget.value > 0 || destination.value !== '';

    if (tripExists) {
      const isNewTrip = confirm('A travel plan already exists. Are you starting a NEW trip? (Click OK to wipe old expenses, or Cancel to just update your current settings).');

      if (isNewTrip) {
        localStorage.clear();
        if (localBudget.value) setBudget(localBudget.value);
        if (localDestination.value) setDestination(localDestination.value);
        location.reload();
        return;
      }
    }

    if (localBudget.value) setBudget(localBudget.value);
    if (localDestination.value) setDestination(localDestination.value);

    saveMessage.value = 'Travel settings updated successfully!';
    localBudget.value = null;
    localDestination.value = '';

    setTimeout(() => { saveMessage.value = ''; }, 3000);
  } catch (error) {
    budgetError.value = error.message;
  }
}

function clearAllData() {
  const isSure = confirm('Are you sure you want to delete all travel data? This will wipe your budget, destination, and all recorded expenses. This cannot be undone.');
  if (isSure) {
    localStorage.clear(); 
    location.reload();    
  }
}
</script>

<template>
  <div class="top-dashboard-card">
    
    <div class="dashboard-column chart-column">
      <CategoryChart 
        :categoryTotals="categoryTotals" 
        :isEmpty="isEmpty" 
      />
    </div>

    <div class="dashboard-right-section">
      <h2 class="script-title">{{ destination || 'Destination' }}</h2>
      
      <div class="content-row">
        
        <div class="inputs-column">
          <div class="input-container">
            <label>Budget</label>
            <input type="number" step="0.01" v-model.number="localBudget" class="lavender-input" />
            <span v-if="budgetError" class="error">{{ budgetError }}</span>
          </div>
          
          <div class="input-container">
            <label>Destination</label>
            <input type="text" v-model="localDestination" class="lavender-input" />
          </div>
          
          <div class="button-row">
            <button @click="clearAllData" class="btn-clear">Clear</button>
            <button @click="saveBudgetAndDestination" class="btn-save">Save</button>
          </div>
          <span v-if="saveMessage" class="success-message">{{ saveMessage }}</span>
        </div>

        <div class="vertical-divider"></div>

        <div class="stats-column">
          <div class="stat-box">
            <span class="stat-label">Total Spent</span>
            <span class="stat-amount">₱ {{ totalSpent.toFixed(2) }}</span>
          </div>
          
          <div class="horizontal-divider"></div>
          
          <div class="stat-box">
            <span class="stat-label">Remaining</span>
            <span class="stat-amount">₱ {{ remainingBudget.toFixed(2) }}</span>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<style scoped>
/* Main Card Container */
.top-dashboard-card {
  background: white;
  border-radius: 20px;
  border: 3px solid #9A93B5;
  padding: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: stretch;
  gap: 2rem;
  margin-bottom: 2rem;
}

.chart-column {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center; 
  min-width: 250px;  
  min-height: 250px; 
}

/* Right Side Layout Wrapper */
.dashboard-right-section {
  flex: 2.5;
  display: flex;
  flex-direction: column;
}

.script-title {
  font-family: 'Great Vibes', cursive;
  font-size: 3.5rem;
  text-align: center;
  margin: 0 0 1rem 0;
  font-weight: normal;
  color: #000000;
}

/* Row that holds Inputs, Line, and Stats */
.content-row {
  display: flex;
  align-items: stretch; 
  gap: 2rem;
  flex: 1;
}

.inputs-column {
  flex: 1.5;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 1rem;
}

/* The Layout Lines */
.vertical-divider {
  width: 2px;
  background-color: #A18AB2;
  align-self: stretch; 
  min-height: 150px;
}

.stats-column {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 1.5rem;
}

.horizontal-divider {
  width: 100%;
  height: 2px;
  background-color: #A18AB2;
  margin: 1rem 0; 
}

/* Form Styles & Colors */
.input-container label {
  font-family: 'Great Vibes', cursive; 
  font-size: 2rem; 
  font-style: normal; 
  color: #000;
  margin-bottom: 0.2rem;
  display: block;
  line-height: 1;
}

.lavender-input {
  width: 100%;
  padding: 0.6rem;
  background-color: #E1DEEE;
  border: none;
  border-radius: 8px;
  font-family: 'Almendra', serif;
  font-size: 1rem;
  outline: none;
}

.lavender-input:focus {
  outline: 2px solid #9A93B5;
}

.button-row {
  display: flex;
  gap: 1rem;
  margin-top: 0.5rem;
  justify-content: center;
}

.btn-clear, .btn-save {
  padding: 0.5rem 1.5rem;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  font-family: 'Almendra', serif;
  font-size: 1.1rem;
  transition: opacity 0.2s;
}

.btn-clear {
  background-color: #E9E6F8;
  color: #000000;
}

.btn-save {
  background-color: #6E6884;
  color: #FFFFFF;
}

.btn-clear:hover, .btn-save:hover {
  opacity: 0.8;
}

/* Stat Box Styles */
.stat-box {
  text-align: center;
  width: 100%;
}

.stat-label {
  display: block;
  font-family: 'Great Vibes', cursive; 
  font-size: 2.2rem; 
  font-style: normal;
  margin-bottom: 0.5rem;
  color: #000;
  line-height: 1;
}

.stat-amount {
  font-size: 1.8rem;
  font-weight: bold;
  font-family: 'Almendra', serif;
}

.error, .success-message {
  font-size: 0.8rem;
  text-align: center;
  font-family: 'Almendra', serif;
}
.error { color: #e74c3c; }
.success-message { color: #6b6b83; }

/* Mobile Responsiveness */
@media (max-width: 800px) {
  .top-dashboard-card {
    flex-direction: column;
  }
  .content-row {
    flex-direction: column;
  }
  .vertical-divider {
    width: 100%;
    height: 2px;
    min-height: 2px;
    margin: 1.5rem 0;
  }
}
</style>