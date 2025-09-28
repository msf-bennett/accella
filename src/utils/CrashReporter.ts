// utils/CrashReporter.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

interface CrashReport {
  id: string;
  timestamp: string;
  error: string;
  stack?: string;
  componentStack?: string;
  appState: 'active' | 'background' | 'inactive';
  deviceInfo?: any;
}

class CrashReporter {
  private static CRASH_KEY = '@acceilla_crashes';
  
  static async reportCrash(error: Error, componentStack?: string): Promise<void> {
    try {
      const crashReport: CrashReport = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        error: error.toString(),
        stack: error.stack,
        componentStack,
        appState: 'active', // You could get this from AppState
        deviceInfo: {
          platform: 'android', // You could detect this
          version: '1.0.0',
        }
      };

      // Store crash report locally
      const existingCrashes = await this.getCrashReports();
      const updatedCrashes = [crashReport, ...existingCrashes.slice(0, 9)]; // Keep last 10 crashes
      
      await AsyncStorage.setItem(this.CRASH_KEY, JSON.stringify(updatedCrashes));
      
      console.error('Crash reported and stored:', crashReport);
      
      // In a real app, you might also send to a remote service here
      
    } catch (storageError) {
      console.error('Failed to store crash report:', storageError);
    }
  }
  
  static async getCrashReports(): Promise<CrashReport[]> {
    try {
      const crashes = await AsyncStorage.getItem(this.CRASH_KEY);
      return crashes ? JSON.parse(crashes) : [];
    } catch (error) {
      console.error('Failed to get crash reports:', error);
      return [];
    }
  }
  
  static async clearCrashReports(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.CRASH_KEY);
    } catch (error) {
      console.error('Failed to clear crash reports:', error);
    }
  }
  
  static async getLatestCrash(): Promise<CrashReport | null> {
    const crashes = await this.getCrashReports();
    return crashes.length > 0 ? crashes[0] : null;
  }
}
