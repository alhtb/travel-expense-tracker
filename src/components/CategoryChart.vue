<script setup>
import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue';
import { Chart } from 'chart.js/auto';

/**
 * CategoryChart Component
 * 
 * Visualizes expense breakdown by category using Chart.js pie chart.
 * Validates Requirements: 7.1, 7.2, 7.3, 7.4, 7.5
 */

// Props
const props = defineProps({
  categoryTotals: { type: Object, required: true },
  isEmpty: { type: Boolean, required: true }
});

// Chart instance and canvas ref
const chartCanvas = ref(null);
let chartInstance = null;

// Predefined color palette for chart segments
const CHART_COLORS = [
  '#B49FBA', // Dusty Mauve
  '#9DA9C4', // Slate Blue
  '#B2BFA5', // Muted Sage
  '#D4A5A5', // Vintage Rose
  '#C5B9CD', // Lilac Grey
  '#D9CDBF'  // Warm Sand
];

/**
 * Create or update the chart
 */
function createChart() {
  if (!chartCanvas.value || props.isEmpty) {
    return;
  }

  // Filter out categories with 0 total
  const filteredData = Object.entries(props.categoryTotals)
    .filter(([_, total]) => total > 0);

  if (filteredData.length === 0) {
    return;
  }

  const labels = filteredData.map(([category]) => category);
  const data = filteredData.map(([_, total]) => total);

  // Destroy existing chart if it exists
  if (chartInstance) {
    chartInstance.destroy();
  }

  // Create new chart
  chartInstance = new Chart(chartCanvas.value, {
    type: 'pie',
    data: {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: CHART_COLORS.slice(0, labels.length)
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            font: {
              family: "'Almendra', serif", // Added Almendra font here!
              size: 14
            },
            color: '#6E6884' // Matches your UI
          }
        }
      }
    }
  });
}

/**
 * Watch for changes in categoryTotals and update chart
 */
watch(() => props.categoryTotals, async () => {
  await nextTick();
  createChart();
}, { deep: true });

/**
 * Watch for changes in isEmpty state
 */
watch(() => props.isEmpty, async () => {
  if (props.isEmpty && chartInstance) {
    chartInstance.destroy();
    chartInstance = null;
  } else if (!props.isEmpty) {
    await nextTick();
    createChart();
  }
});

/**
 * Create chart on mount
 */
onMounted(() => {
  createChart();
});

/**
 * Destroy chart on unmount
 */
onUnmounted(() => {
  if (chartInstance) {
    chartInstance.destroy();
  }
});
</script>

<template>
  <div class="category-chart">
    <h2>Spending by Category</h2>
    
    <div v-if="isEmpty" class="empty-state">
      No expenses to display
    </div>
    
    <div v-else class="chart-container">
      <canvas ref="chartCanvas"></canvas>
    </div>
  </div>
</template>

<style scoped>
.category-chart {
  /* Removed all background, borders, and shadows */
  background: transparent; 
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.category-chart h2 {
  display: none; /* Hiding the title to match your wireframe */
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: #6E6884;
  font-family: 'Almendra', serif;
}

.chart-container {
  width: 100%;
  max-width: 250px; 
}

canvas {
  width: 100% !important;
  height: auto !important;
}
</style>
