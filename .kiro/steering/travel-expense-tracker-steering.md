---
inclusion: always
---
---
inclusion: always
---

# Travel Expense Tracker - Project Guidelines

## Tech Stack
- Vue 3 with Composition API (script setup syntax)
- Vite for build tooling
- ES modules (type: "module")

## Code Style

### Vue Components
- Use `<script setup>` syntax for all components
- Prefer Composition API over Options API
- Use single-file components (.vue files)
- Keep template, script, and style sections in that order

### JavaScript
- Use ES6+ features (const/let, arrow functions, destructuring)
- Prefer named exports for utilities and composables
- Use async/await over promise chains

### Styling
- Use scoped styles in components to prevent style leakage
- Keep component-specific styles in the component file
- Global styles go in src/style.css

## Architecture Patterns

### Component Organization
- Place reusable components in src/components/
- Keep component files focused on single responsibility
- Extract shared logic into composables (src/composables/)

### State Management
- Start with component-local state using ref/reactive
- Consider Pinia if global state management is needed
- Avoid prop drilling beyond 2-3 levels

### Data Structure
- Expense objects should include: id, date, category, amount, description, currency
- Use ISO date format for consistency
- Validate currency amounts to 2 decimal places

## Development Workflow
- Run `npm run dev` to start development server
- Run `npm run build` to create production build
- Test builds with `npm run preview`

## Best Practices
- Keep components under 200 lines when possible
- Use semantic HTML elements
- Ensure forms have proper validation
- Handle loading and error states explicitly
- Make UI accessible (ARIA labels, keyboard navigation)
- Store expense data in localStorage for persistenceashboard with totals, list of expenses, and a category pie chart.

## Non-Goals
- No authentication
- No backend or API
- No cloud deployment
- No multi-trip support
- No currency conversion
- No tasks related testing (unit tests, integration testing)

## Tech Stack
- Vue 3 (Composition API)
- Vite
- JavaScript
- localStorage for persistence
- Chart.js for pie chart visualization

## Architecture Rules
- All business logic must be placed inside composables.
- Components should remain as presentational as possible.
- Expense data must be stored in localStorage.
- No Vue Router; use conditional rendering instead.
- Use a constant list for expense categories.

## Quality Rules
- Expense amount must be greater than 0.
- Budget must not be negative.
- Handle empty states properly.
- Confirm before deleting an expense.
- Avoid hardcoded duplicate logic.