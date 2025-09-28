// src/components/ErrorBoundary.tsx
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    errorId: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error: error,
      errorInfo: null,
      errorId: Date.now().toString(),
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error details
    const errorDetails = {
      error: error.toString(),
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      appName: 'Acceilla',
      version: '1.0.0', // You can get this from package.json or app config
    };

    console.error('ErrorBoundary caught an error:', errorDetails);
    
    this.setState({
      errorInfo: errorInfo,
      error: error,
    });

    // In production, you could send this to a logging service
    if (!__DEV__) {
      try {
        // Example: send to your backend logging endpoint
        // Replace with your actual logging endpoint
        fetch('https://your-logging-endpoint.com/errors', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(errorDetails)
        }).catch(err => console.log('Failed to log error:', err));
      } catch (e) {
        console.log('Failed to send error log:', e);
      }
    }
  }

  public render() {
    if (this.state.hasError) {
      // Fallback UI
      return (
        <View style={styles.container}>
          <ScrollView style={styles.scrollView}>
            <Text style={styles.title}>🏃‍♂️ Acceilla Encountered an Error</Text>
            
            <Text style={styles.subtitle}>Error ID: {this.state.errorId}</Text>
            
            <Text style={styles.message}>
              We're sorry! Something went wrong. This information will help us fix the issue.
            </Text>
            
            <Text style={styles.label}>Error Details:</Text>
            <Text style={styles.errorText}>
              {this.state.error && this.state.error.toString()}
            </Text>
            
            {__DEV__ && (
              <>
                <Text style={styles.label}>Stack Trace:</Text>
                <Text style={styles.stackText}>
                  {this.state.error && this.state.error.stack}
                </Text>
                
                <Text style={styles.label}>Component Stack:</Text>
                <Text style={styles.stackText}>
                  {this.state.errorInfo && this.state.errorInfo.componentStack}
                </Text>
              </>
            )}
            
            <Text style={styles.instructions}>
              Please screenshot this error and restart the app. If the issue persists, contact support with Error ID: {this.state.errorId}
            </Text>
          </ScrollView>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  scrollView: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 22,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 5,
    color: '#333',
  },
  errorText: {
    fontSize: 14,
    color: '#d32f2f',
    backgroundColor: '#ffebee',
    padding: 10,
    borderRadius: 8,
    fontFamily: 'monospace',
  },
  stackText: {
    fontSize: 12,
    color: '#333',
    backgroundColor: '#f5f5f5',
    padding: 10,
    borderRadius: 8,
    fontFamily: 'monospace',
    maxHeight: 200,
  },
  instructions: {
    fontSize: 14,
    color: '#666',
    marginTop: 20,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default ErrorBoundary;