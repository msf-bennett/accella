// testReduxStore.js - Put this in your root directory
import { testStore } from './src/store/testStore';

console.log('Testing Redux store...');
console.log('Initial state:', testStore.getState());

testStore.dispatch({ type: 'test/increment' });
console.log('After increment:', testStore.getState());

console.log('✓ Redux store test passed');