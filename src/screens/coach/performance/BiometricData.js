import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  Animated,
  RefreshControl,
  Alert,
  StatusBar,
  TouchableOpacity,
  Dimensions,
  Platform,
  Vibration,
} from 'react-native';
import { 
  Card,
  Button,
  Chip,
  ProgressBar,
  Avatar,
  IconButton,
  FAB,
  Surface,
  Searchbar,
  Portal,
  Modal,
  Divider,
  DataTable,
  Badge,
  Switch,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/LinearGradient';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { LineChart, BarChart } from 'react-native-chart-kit';

// Design System
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  background: '#f5f7fa',
  surface: '#ffffff',
  text: '#2c3e50',
  textSecondary: '#7f8c8d',
  border: '#e1e8ed',
  accent: '#3498db',
  info: '#17a2b8',
  heartRate: '#e74c3c',
  bodyComp: '#f39c12',
  recovery: '#27ae60',
  hydration: '#3498db',
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

const TEXT_STYLES = {
  h1: { fontSize: 28, fontWeight: 'bold', color: COLORS.text },
  h2: { fontSize: 24, fontWeight: '600', color: COLORS.text },
  h3: { fontSize: 20, fontWeight: '600', color: COLORS.text },
  body: { fontSize: 16, color: COLORS.text },
  caption: { fontSize: 14, color: COLORS.textSecondary },
  small: { fontSize: 12, color: COLORS.textSecondary },
};

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const BiometricData = ({ route }) => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // Redux state
  const { user, players, biometrics, devices } = useSelector((state) => ({
    user: state.auth.user,
    players: state.coach.players || [],
    biometrics: state.biometrics.data || {},
    devices: state.biometrics.devices || [],
  }));

  // Local state
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [selectedMetric, setSelectedMetric] = useState('overview');
  const [timeRange, setTimeRange] = useState('week');
  const [viewMode, setViewMode] = useState('individual'); // individual, team, comparison
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedData, setSelectedData] = useState(null);
  const [autoSync, setAutoSync] = useState(true);
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const [loading, setLoading] = useState(false);

  // Animation setup
  useFocusEffect(
    useCallback(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start();
    }, [])
  );

  // Biometric categories
  const biometricCategories = [
    { id: 'overview', name: 'Overview', icon: 'dashboard', color: COLORS.primary },
    { id: 'heartRate', name: 'Heart Rate', icon: 'favorite', color: COLORS.heartRate },
    { id: 'bodyComp', name: 'Body Comp', icon: 'accessibility', color: COLORS.bodyComp },
    { id: 'recovery', name: 'Recovery', icon: 'bedtime', color: COLORS.recovery },
    { id: 'hydration', name: 'Hydration', icon: 'water-drop', color: COLORS.hydration },
    { id: 'temperature', name: 'Temperature', icon: 'thermostat', color: COLORS.info },
    { id: 'stress', name: 'Stress', icon: 'psychology', color: COLORS.warning },
  ];

  // Sample biometric data
  const samplePlayers = [
    {
      id: 1,
      name: 'Alex Johnson',
      position: 'Quarterback',
      age: 17,
      avatar: null,
      status: 'optimal',
      lastSync: '2024-02-15T10:30:00Z',
    },
    {
      id: 2,
      name: 'Maria Rodriguez',
      position: 'Forward',
      age: 16,
      avatar: null,
      status: 'warning',
      lastSync: '2024-02-15T09:45:00Z',
    },
    {
      id: 3,
      name: 'James Smith',
      position: 'Midfielder',
      age: 18,
      avatar: null,
      status: 'critical',
      lastSync: '2024-02-15T08:20:00Z',
    },
  ];

  const biometricData = {
    heartRate: {
      resting: 58,
      max: 195,
      zones: {
        zone1: 117, // 60%
        zone2: 136, // 70%
        zone3: 156, // 80%
        zone4: 175, // 90%
        zone5: 195, // 100%
      },
      variability: 45,
      trend: 'stable',
      history: [56, 58, 60, 59, 57, 58, 59],
    },
    bodyComp: {
      weight: 185.5,
      bodyFat: 12.8,
      muscleMass: 161.2,
      boneDensity: 1.25,
      hydrationLevel: 62.5,
      trend: 'improving',
      history: [186.2, 185.8, 185.5, 185.3, 185.1, 185.2, 185.5],
    },
    recovery: {
      sleepQuality: 8.2,
      sleepDuration: 7.5,
      restingHR: 58,
      hrVariability: 45,
      stressLevel: 2.1,
      recoveryScore: 85,
      trend: 'good',
      history: [82, 84, 86, 85, 87, 86, 85],
    },
    hydration: {
      level: 62.5,
      dailyIntake: 2.8,
      target: 3.2,
      electrolytes: 'balanced',
      trend: 'stable',
      history: [61.2, 62.1, 62.8, 62.5, 61.9, 62.3, 62.5],
    },
  };

  const alerts = [
    {
      id: 1,
      type: 'warning',
      title: 'Elevated Resting HR',
      player: 'Maria Rodriguez',
      metric: 'Heart Rate',
      value: '72 bpm',
      threshold: '< 65 bpm',
      timestamp: '2024-02-15T09:45:00Z',
      severity: 'medium',
    },
    {
      id: 2,
      type: 'critical',
      title: 'Poor Sleep Quality',
      player: 'James Smith',
      metric: 'Recovery',
      value: '4.2/10',
      threshold: '> 6.0',
      timestamp: '2024-02-15T08:20:00Z',
      severity: 'high',
    },
    {
      id: 3,
      type: 'info',
      title: 'Dehydration Risk',
      player: 'Alex Johnson',
      metric: 'Hydration',
      value: '58%',
      threshold: '> 60%',
      timestamp: '2024-02-15T10:15:00Z',
      severity: 'low',
    },
  ];

  const connectedDevices = [
    { id: 1, name: 'Polar H10', type: 'Heart Rate Monitor', status: 'connected', battery: 85 },
    { id: 2, name: 'InBody 970', type: 'Body Composition', status: 'connected', battery: null },
    { id: 3, name: 'Oura Ring', type: 'Recovery Tracker', status: 'syncing', battery: 62 },
    { id: 4, name: 'Garmin Forerunner', type: 'GPS Watch', status: 'offline', battery: 45 },
  ];

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      // dispatch(fetchBiometricData());
    } catch (error) {
      console.error('Error refreshing biometric data:', error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'optimal': return COLORS.success;
      case 'warning': return COLORS.warning;
      case 'critical': return COLORS.error;
      default: return COLORS.textSecondary;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'optimal': return 'check-circle';
      case 'warning': return 'warning';
      case 'critical': return 'error';
      default: return 'help';
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return COLORS.error;
      case 'medium': return COLORS.warning;
      case 'low': return COLORS.info;
      default: return COLORS.textSecondary;
    }
  };

  const renderHeader = () => (
    <LinearGradient
      colors={[COLORS.primary, COLORS.secondary]}
      style={styles.header}
    >
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <View style={styles.headerContent}>
        <View style={styles.headerTop}>
          <IconButton
            icon="arrow-back"
            iconColor="white"
            size={24}
            onPress={() => navigation.goBack()}
          />
          <Text style={styles.headerTitle}>Biometric Data</Text>
          <IconButton
            icon="settings"
            iconColor="white"
            size={24}
            onPress={() => Alert.alert('Settings', 'Biometric settings coming soon!')}
          />
        </View>

        {/* Player Selection */}
        <TouchableOpacity
          style={styles.playerSelector}
          onPress={() => Alert.alert('Player Selection', 'Player selection feature coming soon!')}
        >
          <Avatar.Text
            size={32}
            label={selectedPlayer?.name?.charAt(0) || 'AJ'}
            style={styles.playerAvatar}
          />
          <View style={styles.playerInfo}>
            <Text style={styles.playerName}>
              {selectedPlayer?.name || 'Alex Johnson'}
            </Text>
            <View style={styles.playerStatusContainer}>
              <MaterialIcons
                name={getStatusIcon(selectedPlayer?.status || 'optimal')}
                size={16}
                color={getStatusColor(selectedPlayer?.status || 'optimal')}
              />
              <Text style={styles.playerStatus}>
                {(selectedPlayer?.status || 'optimal').charAt(0).toUpperCase() + 
                 (selectedPlayer?.status || 'optimal').slice(1)}
              </Text>
            </View>
          </View>
          <MaterialIcons name="expand-more" size={20} color="white" />
        </TouchableOpacity>

        {/* Quick Sync Status */}
        <View style={styles.syncStatus}>
          <View style={styles.syncInfo}>
            <MaterialIcons name="sync" size={16} color="rgba(255, 255, 255, 0.8)" />
            <Text style={styles.syncText}>
              Last sync: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
          <Switch
            value={autoSync}
            onValueChange={setAutoSync}
            trackColor={{ false: 'rgba(255, 255, 255, 0.2)', true: 'rgba(255, 255, 255, 0.3)' }}
            thumbColor={autoSync ? 'white' : 'rgba(255, 255, 255, 0.7)'}
          />
        </View>
      </View>
    </LinearGradient>
  );

  const renderMetricsSelector = () => (
    <View style={styles.metricsSection}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.metricsContainer}
      >
        {biometricCategories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.metricChip,
              selectedMetric === category.id && { backgroundColor: category.color }
            ]}
            onPress={() => setSelectedMetric(category.id)}
          >
            <MaterialIcons
              name={category.icon}
              size={18}
              color={selectedMetric === category.id ? 'white' : category.color}
            />
            <Text style={[
              styles.metricChipText,
              selectedMetric === category.id && { color: 'white' }
            ]}>
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderOverviewCards = () => {
    const data = biometricData;
    
    return (
      <View style={styles.overviewGrid}>
        <Surface style={[styles.overviewCard, { borderLeftColor: COLORS.heartRate }]} elevation={2}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="favorite" size={20} color={COLORS.heartRate} />
            <Text style={styles.cardTitle}>Resting HR</Text>
          </View>
          <Text style={[styles.cardValue, { color: COLORS.heartRate }]}>
            {data.heartRate.resting} bpm
          </Text>
          <Text style={styles.cardSubtext}>Target: 50-60 bpm</Text>
          <View style={styles.trendIndicator}>
            <MaterialIcons name="trending-flat" size={16} color={COLORS.textSecondary} />
            <Text style={styles.trendText}>Stable</Text>
          </View>
        </Surface>

        <Surface style={[styles.overviewCard, { borderLeftColor: COLORS.bodyComp }]} elevation={2}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="accessibility" size={20} color={COLORS.bodyComp} />
            <Text style={styles.cardTitle}>Body Fat</Text>
          </View>
          <Text style={[styles.cardValue, { color: COLORS.bodyComp }]}>
            {data.bodyComp.bodyFat}%
          </Text>
          <Text style={styles.cardSubtext}>Target: 10-15%</Text>
          <View style={styles.trendIndicator}>
            <MaterialIcons name="trending-down" size={16} color={COLORS.success} />
            <Text style={[styles.trendText, { color: COLORS.success }]}>Improving</Text>
          </View>
        </Surface>

        <Surface style={[styles.overviewCard, { borderLeftColor: COLORS.recovery }]} elevation={2}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="bedtime" size={20} color={COLORS.recovery} />
            <Text style={styles.cardTitle}>Recovery</Text>
          </View>
          <Text style={[styles.cardValue, { color: COLORS.recovery }]}>
            {data.recovery.recoveryScore}%
          </Text>
          <Text style={styles.cardSubtext}>Sleep: {data.recovery.sleepDuration}h</Text>
          <View style={styles.trendIndicator}>
            <MaterialIcons name="trending-up" size={16} color={COLORS.success} />
            <Text style={[styles.trendText, { color: COLORS.success }]}>Good</Text>
          </View>
        </Surface>

        <Surface style={[styles.overviewCard, { borderLeftColor: COLORS.hydration }]} elevation={2}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="water-drop" size={20} color={COLORS.hydration} />
            <Text style={styles.cardTitle}>Hydration</Text>
          </View>
          <Text style={[styles.cardValue, { color: COLORS.hydration }]}>
            {data.hydration.level}%
          </Text>
          <Text style={styles.cardSubtext}>
            {data.hydration.dailyIntake}L / {data.hydration.target}L
          </Text>
          <View style={styles.trendIndicator}>
            <MaterialIcons name="trending-flat" size={16} color={COLORS.textSecondary} />
            <Text style={styles.trendText}>Stable</Text>
          </View>
        </Surface>
      </View>
    );
  };

  const renderDetailedChart = () => {
    const category = biometricCategories.find(c => c.id === selectedMetric);
    if (!category || selectedMetric === 'overview') return null;

    const data = biometricData[selectedMetric];
    if (!data) return null;

    const chartData = {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [
        {
          data: data.history,
          color: (opacity = 1) => `rgba(102, 126, 234, ${opacity})`,
          strokeWidth: 2,
        },
      ],
    };

    const chartConfig = {
      backgroundColor: 'transparent',
      backgroundGradientFrom: 'white',
      backgroundGradientTo: 'white',
      decimalPlaces: 1,
      color: (opacity = 1) => category.color.replace('rgb', 'rgba').replace(')', `, ${opacity})`),
      labelColor: (opacity = 1) => `rgba(44, 62, 80, ${opacity})`,
      style: { borderRadius: 16 },
      propsForDots: {
        r: '4',
        strokeWidth: '2',
        stroke: category.color,
      },
    };

    return (
      <Card style={styles.chartCard} elevation={3}>
        <Card.Content>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>{category.name} Trends</Text>
            <IconButton
              icon="fullscreen"
              size={20}
              onPress={() => Alert.alert('Full Screen', 'Full screen charts coming soon!')}
            />
          </View>

          <LineChart
            data={chartData}
            width={screenWidth - 64}
            height={200}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
          />

          {selectedMetric === 'heartRate' && (
            <View style={styles.hrZones}>
              <Text style={styles.zonesTitle}>Heart Rate Zones</Text>
              <View style={styles.zonesList}>
                {Object.entries(data.zones).map(([zone, value], index) => (
                  <View key={zone} style={styles.zoneItem}>
                    <View style={[styles.zoneIndicator, { 
                      backgroundColor: `hsl(${index * 60}, 70%, 50%)` 
                    }]} />
                    <Text style={styles.zoneText}>
                      Zone {index + 1}: {value} bpm
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </Card.Content>
      </Card>
    );
  };

  const renderAlerts = () => (
    <Card style={styles.alertsCard} elevation={2}>
      <Card.Content>
        <View style={styles.alertsHeader}>
          <Text style={styles.sectionTitle}>Health Alerts</Text>
          <Switch
            value={alertsEnabled}
            onValueChange={setAlertsEnabled}
            trackColor={{ false: COLORS.border, true: COLORS.primary }}
            thumbColor={alertsEnabled ? COLORS.primary : COLORS.textSecondary}
          />
        </View>

        {alerts.length === 0 ? (
          <View style={styles.noAlertsContainer}>
            <MaterialIcons name="check-circle" size={48} color={COLORS.success} />
            <Text style={styles.noAlertsText}>All metrics within normal ranges</Text>
          </View>
        ) : (
          alerts.map((alert) => (
            <TouchableOpacity
              key={alert.id}
              style={styles.alertItem}
              onPress={() => {
                setSelectedData(alert);
                setModalVisible(true);
              }}
            >
              <View style={[styles.alertIcon, { backgroundColor: `${getSeverityColor(alert.severity)}20` }]}>
                <MaterialIcons
                  name={alert.type === 'critical' ? 'error' : alert.type === 'warning' ? 'warning' : 'info'}
                  size={20}
                  color={getSeverityColor(alert.severity)}
                />
              </View>

              <View style={styles.alertContent}>
                <Text style={styles.alertTitle}>{alert.title}</Text>
                <Text style={styles.alertPlayer}>{alert.player}</Text>
                <Text style={styles.alertDetails}>
                  {alert.value} (Threshold: {alert.threshold})
                </Text>
              </View>

              <View style={styles.alertMeta}>
                <Badge
                  style={[styles.severityBadge, { backgroundColor: getSeverityColor(alert.severity) }]}
                >
                  {alert.severity}
                </Badge>
                <Text style={styles.alertTime}>
                  {new Date(alert.timestamp).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </Card.Content>
    </Card>
  );

  const renderDeviceStatus = () => (
    <Card style={styles.devicesCard} elevation={2}>
      <Card.Content>
        <View style={styles.devicesHeader}>
          <Text style={styles.sectionTitle}>Connected Devices</Text>
          <Button
            mode="text"
            onPress={() => Alert.alert('Add Device', 'Device pairing feature coming soon!')}
            textColor={COLORS.primary}
          >
            Add Device
          </Button>
        </View>

        {connectedDevices.map((device) => (
          <View key={device.id} style={styles.deviceItem}>
            <View style={styles.deviceInfo}>
              <MaterialIcons
                name={
                  device.type.includes('Heart') ? 'favorite' :
                  device.type.includes('Body') ? 'accessibility' :
                  device.type.includes('Recovery') ? 'bedtime' :
                  'watch'
                }
                size={20}
                color={
                  device.status === 'connected' ? COLORS.success :
                  device.status === 'syncing' ? COLORS.warning :
                  COLORS.error
                }
              />
              <View style={styles.deviceDetails}>
                <Text style={styles.deviceName}>{device.name}</Text>
                <Text style={styles.deviceType}>{device.type}</Text>
              </View>
            </View>

            <View style={styles.deviceStatus}>
              <View style={styles.statusContainer}>
                <View style={[
                  styles.statusDot,
                  {
                    backgroundColor: 
                      device.status === 'connected' ? COLORS.success :
                      device.status === 'syncing' ? COLORS.warning :
                      COLORS.error
                  }
                ]} />
                <Text style={styles.statusText}>
                  {device.status.charAt(0).toUpperCase() + device.status.slice(1)}
                </Text>
              </View>
              {device.battery && (
                <View style={styles.batteryContainer}>
                  <MaterialIcons 
                    name="battery-std" 
                    size={16} 
                    color={device.battery > 30 ? COLORS.success : COLORS.warning} 
                  />
                  <Text style={styles.batteryText}>{device.battery}%</Text>
                </View>
              )}
            </View>
          </View>
        ))}
      </Card.Content>
    </Card>
  );

  const renderAlertDetailModal = () => (
    <Portal>
      <Modal
        visible={modalVisible}
        onDismiss={() => setModalVisible(false)}
        contentContainerStyle={styles.modalContent}
      >
        {selectedData && (
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedData.title}</Text>
              <IconButton
                icon="close"
                size={24}
                onPress={() => setModalVisible(false)}
              />
            </View>

            <Divider style={styles.modalDivider} />

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.alertDetailContent}>
                <Surface style={styles.alertSummary} elevation={1}>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Player:</Text>
                    <Text style={styles.summaryValue}>{selectedData.player}</Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Metric:</Text>
                    <Text style={styles.summaryValue}>{selectedData.metric}</Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Current Value:</Text>
                    <Text style={[styles.summaryValue, { color: getSeverityColor(selectedData.severity) }]}>
                      {selectedData.value}
                    </Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Threshold:</Text>
                    <Text style={styles.summaryValue}>{selectedData.threshold}</Text>
                  </View>
                </Surface>

                <View style={styles.recommendationsContainer}>
                  <Text style={styles.recommendationsTitle}>Recommendations</Text>
                  <Text style={styles.recommendationText}>
                    • Monitor closely over the next 24-48 hours
                  </Text>
                  <Text style={styles.recommendationText}>
                    • Consider adjusting training intensity
                  </Text>
                  <Text style={styles.recommendationText}>
                    • Schedule follow-up assessment
                  </Text>
                </View>

                <View style={styles.modalActions}>
                  <Button
                    mode="contained"
                    onPress={() => {
                      setModalVisible(false);
                      Alert.alert('Action Taken', 'Alert management feature coming soon!');
                    }}
                    style={styles.modalButton}
                  >
                    Take Action
                  </Button>
                  <Button
                    mode="outlined"
                    onPress={() => {
                      setModalVisible(false);
                      Alert.alert('Dismissed', 'Alert has been dismissed');
                    }}
                    style={styles.modalButton}
                    textColor={COLORS.primary}
                  >
                    Dismiss Alert
                  </Button>
                </View>
              </View>
            </ScrollView>
          </View>
        )}
      </Modal>
    </Portal>
  );

  return (
    <View style={styles.container}>
      {renderHeader()}
      
      <View style={styles.content}>
        {renderMetricsSelector()}

        <ScrollView
          style={styles.scrollView}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
          >
            {selectedMetric === 'overview' ? (
              <>
                {renderOverviewCards()}
                {renderAlerts()}
                {renderDeviceStatus()}
              </>
            ) : (
              renderDetailedChart()
            )}
          </Animated.View>
        </ScrollView>
      </View>

      {renderAlertDetailModal()}

      <FAB
        icon="add"
        style={styles.fab}
        onPress={() => Alert.alert('Manual Entry', 'Manual data entry feature coming soon!')}
      />
    </View>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: StatusBar.currentHeight || 44,
    paddingBottom: SPACING.lg,
  },
  headerContent: {
    paddingHorizontal: SPACING.md,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  headerTitle: {
    ...TEXT_STYLES.h2,
    color: 'white',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: SPACING.md,
  },
  playerSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  playerAvatar: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  playerInfo: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  playerName: {
    ...TEXT_STYLES.body,
    color: 'white',
    fontWeight: '600',
    marginBottom: 2,
  },
  playerStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playerStatus: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255, 255, 255, 0.8)',
    marginLeft: SPACING.xs,
  },
  syncStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: SPACING.sm,
  },
  syncInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  syncText: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255, 255, 255, 0.8)',
    marginLeft: SPACING.xs,
  },
  content: {
    flex: 1,
  },
  metricsSection: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: 'white',
    elevation: 1,
  },
  metricsContainer: {
    paddingVertical: SPACING.xs,
  },
  metricChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: 20,
    marginRight: SPACING.sm,
    elevation: 1,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  metricChipText: {
    ...TEXT_STYLES.caption,
    marginLeft: SPACING.xs,
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  overviewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: SPACING.md,
    justifyContent: 'space-between',
  },
  overviewCard: {
    width: (screenWidth - SPACING.md * 3) / 2,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderRadius: 12,
    backgroundColor: 'white',
    borderLeftWidth: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  cardTitle: {
    ...TEXT_STYLES.caption,
    marginLeft: SPACING.xs,
    fontWeight: '600',
  },
  cardValue: {
    ...TEXT_STYLES.h2,
    marginBottom: SPACING.xs,
  },
  cardSubtext: {
    ...TEXT_STYLES.small,
    marginBottom: SPACING.sm,
  },
  trendIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendText: {
    ...TEXT_STYLES.small,
    marginLeft: SPACING.xs,
    fontWeight: '500',
  },
  chartCard: {
    margin: SPACING.md,
    borderRadius: 16,
    backgroundColor: 'white',
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  chartTitle: {
    ...TEXT_STYLES.h3,
  },
  chart: {
    marginVertical: SPACING.xs,
    borderRadius: 16,
  },
  hrZones: {
    marginTop: SPACING.md,
    padding: SPACING.sm,
    backgroundColor: COLORS.background,
    borderRadius: 8,
  },
  zonesTitle: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    marginBottom: SPACING.sm,
  },
  zonesList: {
    gap: SPACING.xs,
  },
  zoneItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  zoneIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: SPACING.sm,
  },
  zoneText: {
    ...TEXT_STYLES.caption,
  },
  alertsCard: {
    margin: SPACING.md,
    marginTop: 0,
    borderRadius: 16,
    backgroundColor: 'white',
  },
  alertsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    ...TEXT_STYLES.h3,
  },
  noAlertsContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.lg,
  },
  noAlertsText: {
    ...TEXT_STYLES.body,
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
  alertItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  alertIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    marginBottom: 2,
  },
  alertPlayer: {
    ...TEXT_STYLES.caption,
    color: COLORS.primary,
    marginBottom: 2,
  },
  alertDetails: {
    ...TEXT_STYLES.small,
  },
  alertMeta: {
    alignItems: 'flex-end',
  },
  severityBadge: {
    marginBottom: SPACING.xs,
  },
  alertTime: {
    ...TEXT_STYLES.small,
  },
  devicesCard: {
    margin: SPACING.md,
    marginTop: 0,
    borderRadius: 16,
    backgroundColor: 'white',
  },
  devicesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  deviceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  deviceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  deviceDetails: {
    marginLeft: SPACING.sm,
    flex: 1,
  },
  deviceName: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
  },
  deviceType: {
    ...TEXT_STYLES.caption,
  },
  deviceStatus: {
    alignItems: 'flex-end',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: SPACING.xs,
  },
  statusText: {
    ...TEXT_STYLES.caption,
    fontWeight: '500',
  },
  batteryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  batteryText: {
    ...TEXT_STYLES.small,
    marginLeft: 2,
  },
  modalContent: {
    backgroundColor: 'white',
    margin: SPACING.md,
    borderRadius: 16,
    maxHeight: '80%',
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
  },
  modalTitle: {
    ...TEXT_STYLES.h2,
    flex: 1,
  },
  modalDivider: {
    backgroundColor: COLORS.border,
  },
  alertDetailContent: {
    padding: SPACING.md,
  },
  alertSummary: {
    padding: SPACING.md,
    borderRadius: 12,
    backgroundColor: 'white',
    marginBottom: SPACING.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
  },
  summaryLabel: {
    ...TEXT_STYLES.body,
    fontWeight: '500',
  },
  summaryValue: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
  },
  recommendationsContainer: {
    marginBottom: SPACING.lg,
  },
  recommendationsTitle: {
    ...TEXT_STYLES.h3,
    marginBottom: SPACING.sm,
  },
  recommendationText: {
    ...TEXT_STYLES.body,
    marginBottom: SPACING.xs,
    paddingLeft: SPACING.sm,
  },
  modalActions: {
    gap: SPACING.sm,
  },
  modalButton: {
    borderRadius: 12,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.md,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
};

export default BiometricData;