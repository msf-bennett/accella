// src/components/providers/ReduxProvider.js
import React, { useEffect } from 'react';
import { Provider, useDispatch } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { store, persistor } from '../../store';
import { initializeNetworkMonitoring } from '../../store/slices/networkSlice';

// Loading component for PersistGate
const PersistGateLoading = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color="#1976D2" />
    <Text style={styles.loadingText}>Loading...</Text>
  </View>
);

// Network initialization component
const NetworkInitializer = ({ children }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    // Initialize network monitoring when the app starts
    dispatch(initializeNetworkMonitoring());
  }, [dispatch]);

  return children;
};

// Main Redux Provider component
const ReduxProvider = ({ children }) => {
  return (
    <Provider store={store}>
      <PersistGate 
        loading={<PersistGateLoading />} 
        persistor={persistor}
      >
        <NetworkInitializer>
          {children}
        </NetworkInitializer>
      </PersistGate>
    </Provider>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#757575',
  },
});

export default ReduxProvider;
