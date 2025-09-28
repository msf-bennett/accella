import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  RefreshControl,
  Alert,
  Animated,
  Dimensions,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { 
  Card,
  Title,
  Paragraph,
  Button,
  Chip,
  Surface,
  IconButton,
  ProgressBar,
  Searchbar,
  Portal,
  Modal,
  Text,
  Divider,
  Avatar,
} from 'react-native-paper';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/LinearGradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';
import { TYPOGRAPHY } from '../../../styles/typography';
import { LAYOUT } from '../../../styles/layout';

// Design System Constants
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#f44336',
  background: '#f5f5f5',
  surface: '#ffffff',
  text: '#333333',
  textSecondary: '#666666',
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

const TEXT_STYLES = {
  h1: { fontSize: 28, fontWeight: 'bold' },
  h2: { fontSize: 24, fontWeight: 'bold' },
  h3: { fontSize: 20, fontWeight: '600' },
  body: { fontSize: 16 },
  caption: { fontSize: 12 },
};

const { width } = Dimensions.get('window');

const WeatherIntegration = ({ navigation }) => {
  // State Management
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [trainingRecommendations, setTrainingRecommendations] = useState([]);
  
  // Animations
  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(50);

  // Redux
  const dispatch = useDispatch();
  const userLocation = useSelector(state => state.user.location);
  const coachProfile = useSelector(state => state.coach.profile);
  const upcomingSessions = useSelector(state => state.sessions.upcoming);

  // Mock weather data
  const mockWeatherData = {
    location: 'Nairobi, Kenya',
    current: {
      temperature: 24,
      condition: 'Partly Cloudy',
      icon: 'partly-sunny',
      humidity: 65,
      windSpeed: 12,
      uvIndex: 6,
      visibility: 10,
      pressure: 1013,
      feelsLike: 26,
    },
    hourly: [
      { time: '14:00', temp: 25, condition: 'sunny', precipitation: 0 },
      { time: '15:00', temp: 26, condition: 'partly-cloudy', precipitation: 10 },
      { time: '16:00', temp: 24, condition: 'cloudy', precipitation: 20 },
      { time: '17:00', temp: 22, condition: 'light-rain', precipitation: 60 },
      { time: '18:00', temp: 21, condition: 'rain', precipitation: 80 },
    ],
    daily: [
      { day: 'Today', high: 26, low: 18, condition: 'partly-cloudy', precipitation: 20 },
      { day: 'Tomorrow', high: 28, low: 19, condition: 'sunny', precipitation: 5 },
      { day: 'Monday', high: 24, low: 17, condition: 'rain', precipitation: 85 },
      { day: 'Tuesday', high: 25, low: 18, condition: 'partly-cloudy', precipitation: 15 },
      { day: 'Wednesday', high: 27, low: 20, condition: 'sunny', precipitation: 0 },
    ]
  };

  const mockRecommendations = [
    {
      id: 1,
      type: 'outdoor',
      title: 'Perfect Weather for Outdoor Training 🌤️',
      description: 'Great conditions for football practice. Light breeze will keep players cool.',
      confidence: 95,
      timeWindow: '2:00 PM - 5:00 PM',
      activities: ['Football Practice', 'Running Drills', 'Agility Training'],
      icon: 'sports-soccer',
      priority: 'high'
    },
    {
      id: 2,
      type: 'warning',
      title: 'Rain Expected After 5 PM ⛈️',
      description: 'Move evening sessions indoors or reschedule to avoid heavy rain.',
      confidence: 80,
      timeWindow: '5:00 PM - 8:00 PM',
      activities: ['Indoor Gym Work', 'Strategy Sessions', 'Recovery Work'],
      icon: 'warning',
      priority: 'medium'
    },
    {
      id: 3,
      type: 'optimization',
      title: 'Optimal Training Window Tomorrow 🌅',
      description: 'Sunny conditions with low humidity. Perfect for intense training sessions.',
      confidence: 90,
      timeWindow: '6:00 AM - 9:00 AM',
      activities: ['Cardio Training', 'Sprint Work', 'Skill Development'],
      icon: 'wb-sunny',
      priority: 'high'
    }
  ];

  // Effects
  useEffect(() => {
    initializeScreen();
  }, []);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Functions
  const initializeScreen = async () => {
    try {
      setLoading(true);
      await loadWeatherData();
      generateTrainingRecommendations();
      checkWeatherAlerts();
    } catch (error) {
      Alert.alert('Error', 'Failed to load weather data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadWeatherData = async () => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setWeatherData(mockWeatherData);
    setForecast(mockWeatherData.daily);
  };

  const generateTrainingRecommendations = () => {
    setTrainingRecommendations(mockRecommendations);
  };

  const checkWeatherAlerts = () => {
    const weatherAlerts = [];
    
    if (mockWeatherData.current.uvIndex > 7) {
      weatherAlerts.push({
        type: 'warning',
        message: 'High UV Index - Consider indoor training or provide extra sun protection',
        icon: 'wb-sunny'
      });
    }
    
    if (mockWeatherData.hourly.some(h => h.precipitation > 70)) {
      weatherAlerts.push({
        type: 'info',
        message: 'Heavy rain expected - Have backup indoor plans ready',
        icon: 'grain'
      });
    }

    setAlerts(weatherAlerts);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadWeatherData();
    generateTrainingRecommendations();
    checkWeatherAlerts();
    setRefreshing(false);
  }, []);

  const getWeatherIcon = (condition) => {
    const iconMap = {
      'sunny': 'wb-sunny',
      'partly-cloudy': 'partly-sunny',
      'cloudy': 'cloud',
      'rain': 'grain',
      'light-rain': 'grain',
      'storm': 'flash-on',
    };
    return iconMap[condition] || 'wb-sunny';
  };

  const getConditionColor = (condition) => {
    const colorMap = {
      'sunny': COLORS.warning,
      'partly-cloudy': COLORS.primary,
      'cloudy': COLORS.textSecondary,
      'rain': COLORS.primary,
      'light-rain': COLORS.primary,
      'storm': COLORS.error,
    };
    return colorMap[condition] || COLORS.primary;
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return COLORS.success;
      case 'medium': return COLORS.warning;
      case 'low': return COLORS.textSecondary;
      default: return COLORS.primary;
    }
  };

  const handleLocationSearch = () => {
    Alert.alert(
      'Location Search',
      'This feature is under development. You can search for different locations to get weather forecasts for away games or training camps.',
      [{ text: 'OK' }]
    );
  };

  const handleViewDetails = (recommendation) => {
    setSelectedLocation(recommendation);
    setModalVisible(true);
  };

  const handleScheduleAdjustment = () => {
    Alert.alert(
      'Schedule Adjustment',
      'This feature will automatically suggest schedule changes based on weather conditions. Coming soon!',
      [{ text: 'OK' }]
    );
  };

  // Render Components
  const renderCurrentWeather = () => (
    <Card style={styles.weatherCard}>
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        style={styles.weatherGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.currentWeatherContent}>
          <View style={styles.weatherHeader}>
            <Icon name="location-on" size={20} color="white" />
            <Text style={[styles.locationText, { color: 'white', marginLeft: SPACING.xs }]}>
              {weatherData?.location}
            </Text>
            <IconButton
              icon="search"
              iconColor="white"
              size={20}
              onPress={handleLocationSearch}
              style={styles.searchButton}
            />
          </View>
          
          <View style={styles.temperatureRow}>
            <Icon
              name={getWeatherIcon(weatherData?.current.icon)}
              size={64}
              color="white"
            />
            <View style={styles.temperatureInfo}>
              <Text style={styles.temperature}>{weatherData?.current.temperature}°C</Text>
              <Text style={styles.condition}>{weatherData?.current.condition}</Text>
              <Text style={styles.feelsLike}>Feels like {weatherData?.current.feelsLike}°C</Text>
            </View>
          </View>

          <View style={styles.weatherDetails}>
            <View style={styles.detailItem}>
              <Icon name="opacity" size={16} color="white" />
              <Text style={styles.detailText}>{weatherData?.current.humidity}%</Text>
            </View>
            <View style={styles.detailItem}>
              <Icon name="air" size={16} color="white" />
              <Text style={styles.detailText}>{weatherData?.current.windSpeed} km/h</Text>
            </View>
            <View style={styles.detailItem}>
              <Icon name="wb-sunny" size={16} color="white" />
              <Text style={styles.detailText}>UV {weatherData?.current.uvIndex}</Text>
            </View>
            <View style={styles.detailItem}>
              <Icon name="visibility" size={16} color="white" />
              <Text style={styles.detailText}>{weatherData?.current.visibility} km</Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    </Card>
  );

  const renderHourlyForecast = () => (
    <Card style={styles.card}>
      <Card.Content>
        <Title style={styles.sectionTitle}>Hourly Forecast</Title>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.hourlyScroll}>
          {weatherData?.hourly.map((hour, index) => (
            <Surface key={index} style={styles.hourlyItem}>
              <Text style={styles.hourlyTime}>{hour.time}</Text>
              <Icon
                name={getWeatherIcon(hour.condition)}
                size={32}
                color={getConditionColor(hour.condition)}
                style={styles.hourlyIcon}
              />
              <Text style={styles.hourlyTemp}>{hour.temp}°</Text>
              <View style={styles.precipitationBar}>
                <ProgressBar
                  progress={hour.precipitation / 100}
                  color={COLORS.primary}
                  style={styles.precipitationProgress}
                />
                <Text style={styles.precipitationText}>{hour.precipitation}%</Text>
              </View>
            </Surface>
          ))}
        </ScrollView>
      </Card.Content>
    </Card>
  );

  const renderWeatherAlerts = () => (
    alerts.length > 0 && (
      <Card style={[styles.card, styles.alertCard]}>
        <Card.Content>
          <Title style={[styles.sectionTitle, { color: COLORS.warning }]}>
            <Icon name="warning" size={20} color={COLORS.warning} /> Weather Alerts
          </Title>
          {alerts.map((alert, index) => (
            <Surface key={index} style={styles.alertItem}>
              <Icon name={alert.icon} size={24} color={COLORS.warning} />
              <Text style={styles.alertText}>{alert.message}</Text>
            </Surface>
          ))}
        </Card.Content>
      </Card>
    )
  );

  const renderTrainingRecommendations = () => (
    <Card style={styles.card}>
      <Card.Content>
        <Title style={styles.sectionTitle}>
          🤖 AI Training Recommendations
        </Title>
        <Paragraph style={styles.sectionSubtitle}>
          Weather-optimized suggestions for your training sessions
        </Paragraph>
        
        {trainingRecommendations.map((recommendation) => (
          <Surface key={recommendation.id} style={styles.recommendationCard}>
            <View style={styles.recommendationHeader}>
              <View style={styles.recommendationTitleRow}>
                <Icon
                  name={recommendation.icon}
                  size={24}
                  color={getPriorityColor(recommendation.priority)}
                />
                <Text style={styles.recommendationTitle}>{recommendation.title}</Text>
              </View>
              <Chip
                textStyle={{ fontSize: 10 }}
                style={[styles.confidenceChip, { backgroundColor: getPriorityColor(recommendation.priority) + '20' }]}
              >
                {recommendation.confidence}% confidence
              </Chip>
            </View>
            
            <Text style={styles.recommendationDescription}>
              {recommendation.description}
            </Text>
            
            <View style={styles.recommendationDetails}>
              <View style={styles.timeWindow}>
                <Icon name="schedule" size={16} color={COLORS.textSecondary} />
                <Text style={styles.timeWindowText}>{recommendation.timeWindow}</Text>
              </View>
              
              <View style={styles.activities}>
                {recommendation.activities.map((activity, index) => (
                  <Chip
                    key={index}
                    textStyle={{ fontSize: 10 }}
                    style={styles.activityChip}
                  >
                    {activity}
                  </Chip>
                ))}
              </View>
            </View>
            
            <View style={styles.recommendationActions}>
              <Button
                mode="outlined"
                onPress={() => handleViewDetails(recommendation)}
                style={styles.detailsButton}
                contentStyle={{ height: 32 }}
                labelStyle={{ fontSize: 12 }}
              >
                View Details
              </Button>
              <Button
                mode="contained"
                onPress={handleScheduleAdjustment}
                style={styles.applyButton}
                contentStyle={{ height: 32 }}
                labelStyle={{ fontSize: 12 }}
              >
                Apply to Schedule
              </Button>
            </View>
          </Surface>
        ))}
      </Card.Content>
    </Card>
  );

  const renderWeeklyForecast = () => (
    <Card style={styles.card}>
      <Card.Content>
        <Title style={styles.sectionTitle}>7-Day Forecast</Title>
        {forecast.map((day, index) => (
          <Surface key={index} style={styles.forecastDay}>
            <View style={styles.forecastDayContent}>
              <Text style={styles.dayName}>{day.day}</Text>
              <View style={styles.forecastCondition}>
                <Icon
                  name={getWeatherIcon(day.condition)}
                  size={24}
                  color={getConditionColor(day.condition)}
                />
                <View style={styles.precipitationInfo}>
                  <Icon name="grain" size={12} color={COLORS.primary} />
                  <Text style={styles.precipitationPercent}>{day.precipitation}%</Text>
                </View>
              </View>
              <View style={styles.temperatures}>
                <Text style={styles.highTemp}>{day.high}°</Text>
                <Text style={styles.lowTemp}>{day.low}°</Text>
              </View>
            </View>
          </Surface>
        ))}
      </Card.Content>
    </Card>
  );

  const renderQuickActions = () => (
    <Card style={styles.card}>
      <Card.Content>
        <Title style={styles.sectionTitle}>Quick Actions</Title>
        <View style={styles.quickActionsGrid}>
          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => Alert.alert('Feature Coming Soon', 'Weather-based session rescheduling will be available soon!')}
          >
            <Surface style={styles.quickActionButton}>
              <Icon name="event" size={32} color={COLORS.primary} />
              <Text style={styles.quickActionText}>Reschedule Sessions</Text>
            </Surface>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => Alert.alert('Feature Coming Soon', 'Send weather alerts to your team!')}
          >
            <Surface style={styles.quickActionButton}>
              <Icon name="notifications" size={32} color={COLORS.warning} />
              <Text style={styles.quickActionText}>Send Alert</Text>
            </Surface>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => Alert.alert('Feature Coming Soon', 'View weather history and patterns!')}
          >
            <Surface style={styles.quickActionButton}>
              <Icon name="analytics" size={32} color={COLORS.success} />
              <Text style={styles.quickActionText}>Weather History</Text>
            </Surface>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => Alert.alert('Feature Coming Soon', 'Configure weather notifications!')}
          >
            <Surface style={styles.quickActionButton}>
              <Icon name="settings" size={32} color={COLORS.textSecondary} />
              <Text style={styles.quickActionText}>Settings</Text>
            </Surface>
          </TouchableOpacity>
        </View>
      </Card.Content>
    </Card>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Surface style={styles.loadingSurface}>
          <Icon name="wb-cloudy" size={64} color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading Weather Data...</Text>
          <ProgressBar indeterminate color={COLORS.primary} style={styles.loadingProgress} />
        </Surface>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <Animated.View style={[styles.animatedContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
        >
          {renderCurrentWeather()}
          {renderWeatherAlerts()}
          {renderHourlyForecast()}
          {renderTrainingRecommendations()}
          {renderWeeklyForecast()}
          {renderQuickActions()}
        </ScrollView>
      </Animated.View>

      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Card style={styles.modalCard}>
            <Card.Content>
              <Title>Recommendation Details</Title>
              {selectedLocation && (
                <View>
                  <Text style={styles.modalText}>{selectedLocation.title}</Text>
                  <Text style={styles.modalDescription}>{selectedLocation.description}</Text>
                  <Divider style={styles.modalDivider} />
                  <Text style={styles.modalSubtitle}>Suggested Activities:</Text>
                  {selectedLocation.activities?.map((activity, index) => (
                    <Text key={index} style={styles.modalActivity}>• {activity}</Text>
                  ))}
                </View>
              )}
            </Card.Content>
            <Card.Actions>
              <Button onPress={() => setModalVisible(false)}>Close</Button>
            </Card.Actions>
          </Card>
        </Modal>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  animatedContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: SPACING.xl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingSurface: {
    padding: SPACING.xl,
    alignItems: 'center',
    borderRadius: 16,
    elevation: 4,
  },
  loadingText: {
    ...TEXT_STYLES.h3,
    marginVertical: SPACING.md,
    color: COLORS.text,
  },
  loadingProgress: {
    width: 200,
    marginTop: SPACING.md,
  },
  card: {
    margin: SPACING.md,
    borderRadius: 16,
    elevation: 4,
  },
  weatherCard: {
    margin: SPACING.md,
    borderRadius: 16,
    elevation: 8,
    overflow: 'hidden',
  },
  weatherGradient: {
    padding: 0,
  },
  currentWeatherContent: {
    padding: SPACING.lg,
  },
  weatherHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  locationText: {
    ...TEXT_STYLES.body,
    flex: 1,
  },
  searchButton: {
    margin: 0,
  },
  temperatureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  temperatureInfo: {
    marginLeft: SPACING.lg,
    flex: 1,
  },
  temperature: {
    ...TEXT_STYLES.h1,
    fontSize: 48,
    color: 'white',
    fontWeight: '300',
  },
  condition: {
    ...TEXT_STYLES.body,
    color: 'white',
    opacity: 0.9,
  },
  feelsLike: {
    ...TEXT_STYLES.caption,
    color: 'white',
    opacity: 0.8,
  },
  weatherDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.3)',
  },
  detailItem: {
    alignItems: 'center',
  },
  detailText: {
    ...TEXT_STYLES.caption,
    color: 'white',
    marginTop: SPACING.xs,
  },
  alertCard: {
    backgroundColor: '#FFF3E0',
    borderLeftWidth: 4,
    borderLeftColor: COLORS.warning,
  },
  alertItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    marginVertical: SPACING.xs,
    borderRadius: 8,
  },
  alertText: {
    ...TEXT_STYLES.body,
    marginLeft: SPACING.md,
    flex: 1,
    color: COLORS.text,
  },
  sectionTitle: {
    ...TEXT_STYLES.h3,
    marginBottom: SPACING.sm,
    color: COLORS.text,
  },
  sectionSubtitle: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  hourlyScroll: {
    paddingVertical: SPACING.sm,
  },
  hourlyItem: {
    alignItems: 'center',
    padding: SPACING.md,
    marginHorizontal: SPACING.xs,
    borderRadius: 12,
    minWidth: 80,
    elevation: 2,
  },
  hourlyTime: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  hourlyIcon: {
    marginVertical: SPACING.xs,
  },
  hourlyTemp: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  precipitationBar: {
    alignItems: 'center',
    width: '100%',
  },
  precipitationProgress: {
    width: 40,
    height: 4,
  },
  precipitationText: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  recommendationCard: {
    padding: SPACING.md,
    marginVertical: SPACING.sm,
    borderRadius: 12,
    elevation: 2,
  },
  recommendationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  recommendationTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: SPACING.sm,
  },
  recommendationTitle: {
    ...TEXT_STYLES.h3,
    fontSize: 16,
    marginLeft: SPACING.sm,
    color: COLORS.text,
    flex: 1,
  },
  confidenceChip: {
    height: 24,
  },
  recommendationDescription: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  recommendationDetails: {
    marginBottom: SPACING.md,
  },
  timeWindow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  timeWindowText: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    marginLeft: SPACING.xs,
  },
  activities: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  activityChip: {
    marginRight: SPACING.xs,
    marginBottom: SPACING.xs,
    height: 24,
  },
  recommendationActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  detailsButton: {
    marginRight: SPACING.sm,
  },
  applyButton: {
    backgroundColor: COLORS.primary,
  },
  forecastDay: {
    padding: SPACING.md,
    marginVertical: SPACING.xs,
    borderRadius: 8,
    elevation: 1,
  },
  forecastDayContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dayName: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    color: COLORS.text,
    width: 80,
  },
  forecastCondition: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  precipitationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: SPACING.sm,
  },
  precipitationPercent: {
    ...TEXT_STYLES.caption,
    color: COLORS.primary,
    marginLeft: SPACING.xs,
  },
  temperatures: {
    alignItems: 'flex-end',
    width: 60,
  },
  highTemp: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    color: COLORS.text,
  },
  lowTemp: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickAction: {
    width: '48%',
    marginBottom: SPACING.md,
  },
quickActionButton: {
  alignItems: 'center',
  padding: SPACING.lg,
  borderRadius: 12,
  elevation: 2,
  minHeight: 80,
  justifyContent: 'center',
},
quickActionText: {
  ...TEXT_STYLES.caption,
  color: COLORS.text,
  textAlign: 'center',
  marginTop: SPACING.sm,
  fontWeight: '600',
},
modalContainer: {
  backgroundColor: 'white',
  padding: SPACING.lg,
  margin: SPACING.lg,
  borderRadius: 16,
},
modalCard: {
  maxHeight: '80%',
},
modalText: {
  ...TEXT_STYLES.h3,
  color: COLORS.text,
  marginBottom: SPACING.sm,
},
modalDescription: {
  ...TEXT_STYLES.body,
  color: COLORS.textSecondary,
  marginBottom: SPACING.md,
},
modalDivider: {
  marginVertical: SPACING.md,
},
modalSubtitle: {
  ...TEXT_STYLES.body,
  fontWeight: '600',
  color: COLORS.text,
  marginBottom: SPACING.sm,
},
modalActivity: {
  ...TEXT_STYLES.body,
  color: COLORS.textSecondary,
  marginLeft: SPACING.md,
  marginBottom: SPACING.xs,
},
})
export default WeatherIntegration;