// selectors/plansSelectors.js
import { createSelector } from '@reduxjs/toolkit';

export const selectPlansState = (state) => state.plans;

export const selectPersonalizedPlans = createSelector(
  [selectPlansState],
  (plans) => plans.personalizedPlans
);

export const selectPlansLoading = createSelector(
  [selectPlansState],
  (plans) => plans.loading
);

export const selectPlansByCategory = createSelector(
  [selectPersonalizedPlans, (state, category) => category],
  (plans, category) => {
    if (category === 'all') return plans;
    return plans.filter(plan => plan.category === category);
  }
);