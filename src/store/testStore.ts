import { configureStore } from '@reduxjs/toolkit';

// Minimal test slice
const testSlice = {
  name: 'test',
  initialState: { value: 0 },
  reducers: {
    increment: (state: any) => {
      state.value += 1;
    },
  },
};

export const testStore = configureStore({
  reducer: {
    test: (state = testSlice.initialState, action: any) => {
      if (action.type === 'test/increment') {
        return { ...state, value: state.value + 1 };
      }
      return state;
    },
  },
});

export type TestRootState = ReturnType<typeof testStore.getState>;
export type TestAppDispatch = typeof testStore.dispatch;