//src/components/auth/NetworkStatus.js
import React, { memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ActivityIndicator,
} from 'react-native';
import useNetworkStatus from '../../hooks/useNetworkStatus';

/**
 * NetworkStatus Component
 * Displays real-time connectivity status with visual indicators
 * Provides user feedback about network availability
 */
const NetworkStatus = ({ 
  style,
  showDetails = false,
  showRefreshButton = false,
  onRefresh,
  compact = false,
  theme = 'light' 
}) => {
  const {
    isOnline,
    isConnected,
    isInitialized,
    type,
    connectionQuality,
    getConnectionStatus,
    refreshNetworkStatus,
    shouldShowOfflineMessage,
    isCheckingConnection
  } = useNetworkStatus();

  const [refreshing, setRefreshing] = React.useState(false);
  const fadeAnim = React.useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    // Animate status changes
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0.7,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isOnline, connectionQuality]);

  const handleRefresh = async () => {
    if (refreshing) return;
    
    setRefreshing(true);
    try {
      await refreshNetworkStatus();
      if (onRefresh) {
        await onRefresh();
      }
    } catch (error) {
      console.warn('Error refreshing network status:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const getStatusColor = () => {
    if (isCheckingConnection) return colors[theme].checking;
    if (!isOnline) return colors[theme].offline;
    
    switch (connectionQuality) {
      case 'excellent':
      case 'good':
        return colors[theme].good;
      case 'fair':
        return colors[theme].fair;
      case 'poor':
        return colors[theme].poor;
      default:
        return colors[theme].unknown;
    }
  };

  const getStatusIcon = () => {
    if (isCheckingConnection) return '⟳';
    if (!isConnected) return '⚠';
    if (!isOnline) return '⚠';
    
    switch (connectionQuality) {
      case 'excellent':
        return '●●●●';
      case 'good':
        return '●●●○';
      case 'fair':
        return '●●○○';
      case 'poor':
        return '●○○○';
      default:
        return '●';
    }
  };

  const getNetworkTypeIcon = () => {
    switch (type) {
      case 'wifi':
        return '📶';
      case 'cellular':
        return '📱';
      case 'ethernet':
        return '🔌';
      case 'other':
        return '🌐';
      default:
        return '❓';
    }
  };

  if (!shouldShowOfflineMessage && !showDetails && compact) {
    return null;
  }

  const statusColor = getStatusColor();
  const statusText = getConnectionStatus();
  const statusIcon = getStatusIcon();

  if (compact) {
    return (
      <Animated.View 
        style={[
          styles.compactContainer,
          { backgroundColor: statusColor },
          style
        ]}
        opacity={fadeAnim}
      >
        <Text style={[styles.compactIcon, { color: colors[theme].text }]}>
          {statusIcon}
        </Text>
      </Animated.View>
    );
  }

  return (
    <Animated.View 
      style={[
        styles.container,
        theme === 'dark' && styles.darkContainer,
        style
      ]}
      opacity={fadeAnim}
    >
      <View style={styles.statusRow}>
        <View style={[styles.statusIndicator, { backgroundColor: statusColor }]}>
          <Text style={styles.statusIcon}>{statusIcon}</Text>
        </View>
        
        <View style={styles.statusContent}>
          <Text style={[
            styles.statusText,
            theme === 'dark' && styles.darkText
          ]}>
            {statusText}
          </Text>
          
          {showDetails && isInitialized && (
            <View style={styles.detailsRow}>
              <Text style={[
                styles.detailText,
                theme === 'dark' && styles.darkDetailText
              ]}>
                {getNetworkTypeIcon()} {type || 'Unknown'} • {connectionQuality}
              </Text>
            </View>
          )}
        </View>

        {showRefreshButton && (
          <TouchableOpacity 
            onPress={handleRefresh}
            style={styles.refreshButton}
            disabled={refreshing}
          >
            {refreshing ? (
              <ActivityIndicator 
                size="small" 
                color={colors[theme].primary} 
              />
            ) : (
              <Text style={[
                styles.refreshIcon,
                theme === 'dark' && styles.darkText
              ]}>
                ⟳
              </Text>
            )}
          </TouchableOpacity>
        )}
      </View>

      {!isOnline && isInitialized && (
        <View style={styles.offlineMessage}>
          <Text style={[
            styles.offlineText,
            theme === 'dark' && styles.darkOfflineText
          ]}>
            {!isConnected 
              ? 'Some features may be unavailable offline' 
              : 'Limited functionality - no internet access'
            }
          </Text>
        </View>
      )}
    </Animated.View>
  );
};

const colors = {
  light: {
    good: '#4CAF50',
    fair: '#FF9800',
    poor: '#F44336',
    offline: '#9E9E9E',
    unknown: '#607D8B',
    checking: '#2196F3',
    primary: '#1976D2',
    text: '#212121',
    detailText: '#757575',
    offlineText: '#F44336',
    background: '#FFFFFF',
    border: '#E0E0E0'
  },
  dark: {
    good: '#66BB6A',
    fair: '#FFB74D',
    poor: '#EF5350',
    offline: '#BDBDBD',
    unknown: '#90A4AE',
    checking: '#42A5F5',
    primary: '#64B5F6',
    text: '#FFFFFF',
    detailText: '#BDBDBD',
    offlineText: '#EF5350',
    background: '#121212',
    border: '#2C2C2C'
  }
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.light.background,
    borderRadius: 8,
    padding: 12,
    marginVertical: 4,
    borderWidth: 1,
    borderColor: colors.light.border,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  darkContainer: {
    backgroundColor: colors.dark.background,
    borderColor: colors.dark.border,
  },
  compactContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statusIcon: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  compactIcon: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  statusContent: {
    flex: 1,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.light.text,
  },
  darkText: {
    color: colors.dark.text,
  },
  detailsRow: {
    marginTop: 2,
  },
  detailText: {
    fontSize: 12,
    color: colors.light.detailText,
  },
  darkDetailText: {
    color: colors.dark.detailText,
  },
  refreshButton: {
    padding: 4,
    borderRadius: 4,
  },
  refreshIcon: {
    fontSize: 16,
    color: colors.light.primary,
  },
  offlineMessage: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.light.border,
  },
  offlineText: {
    fontSize: 12,
    color: colors.light.offlineText,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  darkOfflineText: {
    color: colors.dark.offlineText,
  },
});

export default memo(NetworkStatus);
