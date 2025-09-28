import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  RefreshControl,
  ScrollView,
  TouchableOpacity,
  Alert,
  StatusBar,
} from 'react-native';
import { Card, Surface, IconButton } from 'react-native-paper';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';

// Design system imports (assumed to be available in your project)
import { COLORS, SPACING, TEXT_STYLES } from '../../../constants/theme';

const WeatherInfo = ({ navigation }) => {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDay, setSelectedDay] = useState('today');
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  
  const dispatch = useDispatch();
  const userLocation = useSelector(state => state.user.location);
  const trainingSchedule = useSelector(state => state.training.upcomingSessions);

  useEffect(() => {
    StatusBar.setTranslucent(true);
    StatusBar.setBarStyle('light-content');
    
    loadWeatherData();
    
    // Entrance animations
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

  const loadWeatherData = async () => {
    try {
      setLoading(true);
      
      // Simulated weather data - in real implementation, this would fetch from weather API
      const mockWeatherData = {
        current: {
          temperature: 24,
          condition: 'sunny',
          humidity: 65,
          windSpeed: 12,
          uvIndex: 6,
          visibility: 10,
          feelsLike: 27,
          icon: 'wb-sunny',
          description: 'Perfect for outdoor training! ☀️'
        },
        hourly: [
          { time: '09:00', temp: 22, condition: 'sunny', icon: 'wb-sunny' },
          { time: '12:00', temp: 26, condition: 'sunny', icon: 'wb-sunny' },
          { time: '15:00', temp: 28, condition: 'partly-cloudy', icon: 'cloud' },
          { time: '18:00', temp: 25, condition: 'partly-cloudy', icon: 'cloud' },
        ],
        forecast: [
          { day: 'Today', high: 28, low: 18, condition: 'sunny', icon: 'wb-sunny', trainingSuitability: 'excellent' },
          { day: 'Tomorrow', high: 25, low: 16, condition: 'cloudy', icon: 'cloud', trainingSuitability: 'good' },
          { day: 'Wednesday', high: 22, low: 14, condition: 'rainy', icon: 'grain', trainingSuitability: 'indoor' },
          { day: 'Thursday', high: 26, low: 17, condition: 'sunny', icon: 'wb-sunny', trainingSuitability: 'excellent' },
          { day: 'Friday', high: 24, low: 15, condition: 'partly-cloudy', icon: 'cloud', trainingSuitability: 'good' },
        ],
        trainingRecommendations: {
          hydration: 'High - Drink water every 15 minutes',
          clothing: 'Light, breathable fabrics recommended',
          timing: 'Best training windows: 7-9 AM, 6-8 PM',
          sunProtection: 'SPF 30+ sunscreen required'
        }
      };
      
      setWeatherData(mockWeatherData);
    } catch (error) {
      console.error('Error loading weather data:', error);
      Alert.alert(
        'Weather Update',
        'Unable to load current weather data. Please check your internet connection.',
        [{ text: 'OK', style: 'default' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadWeatherData();
    setRefreshing(false);
  };

  const getTrainingSuitabilityColor = (suitability) => {
    switch (suitability) {
      case 'excellent': return COLORS.success;
      case 'good': return COLORS.primary;
      case 'indoor': return COLORS.secondary;
      default: return COLORS.textSecondary;
    }
  };

  const getTrainingSuitabilityIcon = (suitability) => {
    switch (suitability) {
      case 'excellent': return 'fitness-center';
      case 'good': return 'directions-run';
      case 'indoor': return 'home';
      default: return 'help';
    }
  };

  const renderCurrentWeather = () => {
    if (!weatherData?.current) return null;

    const { current } = weatherData;
    
    return (
      <Card style={styles.currentWeatherCard} elevation={4}>
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={styles.currentWeatherGradient}
        >
          <View style={styles.currentWeatherContent}>
            <View style={styles.mainWeatherInfo}>
              <Icon name={current.icon} size={64} color="#fff" />
              <View style={styles.temperatureContainer}>
                <Text style={styles.temperature}>{current.temperature}°</Text>
                <Text style={styles.feelsLike}>Feels like {current.feelsLike}°</Text>
              </View>
            </View>
            
            <Text style={styles.weatherDescription}>{current.description}</Text>
            
            <View style={styles.weatherDetailsGrid}>
              <View style={styles.weatherDetail}>
                <Icon name="water-drop" size={20} color="#fff" />
                <Text style={styles.detailLabel}>Humidity</Text>
                <Text style={styles.detailValue}>{current.humidity}%</Text>
              </View>
              
              <View style={styles.weatherDetail}>
                <Icon name="air" size={20} color="#fff" />
                <Text style={styles.detailLabel}>Wind</Text>
                <Text style={styles.detailValue}>{current.windSpeed} km/h</Text>
              </View>
              
              <View style={styles.weatherDetail}>
                <Icon name="wb-sunny" size={20} color="#fff" />
                <Text style={styles.detailLabel}>UV Index</Text>
                <Text style={styles.detailValue}>{current.uvIndex}</Text>
              </View>
              
              <View style={styles.weatherDetail}>
                <Icon name="visibility" size={20} color="#fff" />
                <Text style={styles.detailLabel}>Visibility</Text>
                <Text style={styles.detailValue}>{current.visibility} km</Text>
              </View>
            </View>
          </View>
        </LinearGradient>
      </Card>
    );
  };

  const renderHourlyForecast = () => {
    if (!weatherData?.hourly) return null;

    return (
      <Card style={styles.forecastCard} elevation={2}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Today's Forecast</Text>
          <Icon name="schedule" size={20} color={COLORS.primary} />
        </View>
        
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.hourlyScrollContent}
        >
          {weatherData.hourly.map((hour, index) => (
            <View key={index} style={styles.hourlyItem}>
              <Text style={styles.hourlyTime}>{hour.time}</Text>
              <Icon name={hour.icon} size={32} color={COLORS.primary} />
              <Text style={styles.hourlyTemp}>{hour.temp}°</Text>
            </View>
          ))}
        </ScrollView>
      </Card>
    );
  };

  const renderWeeklyForecast = () => {
    if (!weatherData?.forecast) return null;

    return (
      <Card style={styles.forecastCard} elevation={2}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>5-Day Training Forecast</Text>
          <Icon name="event" size={20} color={COLORS.primary} />
        </View>
        
        {weatherData.forecast.map((day, index) => (
          <TouchableOpacity key={index} style={styles.dailyForecastItem}>
            <View style={styles.dailyForecastLeft}>
              <Text style={styles.dayName}>{day.day}</Text>
              <View style={styles.dailyTemps}>
                <Text style={styles.highTemp}>{day.high}°</Text>
                <Text style={styles.lowTemp}>{day.low}°</Text>
              </View>
            </View>
            
            <View style={styles.dailyForecastCenter}>
              <Icon name={day.icon} size={28} color={COLORS.primary} />
            </View>
            
            <View style={styles.dailyForecastRight}>
              <View style={[styles.suitabilityBadge, { backgroundColor: getTrainingSuitabilityColor(day.trainingSuitability) }]}>
                <Icon 
                  name={getTrainingSuitabilityIcon(day.trainingSuitability)} 
                  size={16} 
                  color="#fff" 
                />
                <Text style={styles.suitabilityText}>{day.trainingSuitability}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </Card>
    );
  };

  const renderTrainingRecommendations = () => {
    if (!weatherData?.trainingRecommendations) return null;

    const { trainingRecommendations } = weatherData;
    
    return (
      <Card style={styles.recommendationsCard} elevation={2}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Training Recommendations</Text>
          <Icon name="tips-and-updates" size={20} color={COLORS.primary} />
        </View>
        
        <View style={styles.recommendationsList}>
          <View style={styles.recommendationItem}>
            <Icon name="local-drink" size={24} color={COLORS.primary} />
            <View style={styles.recommendationText}>
              <Text style={styles.recommendationTitle}>Hydration</Text>
              <Text style={styles.recommendationDetail}>{trainingRecommendations.hydration}</Text>
            </View>
          </View>
          
          <View style={styles.recommendationItem}>
            <Icon name="checkroom" size={24} color={COLORS.primary} />
            <View style={styles.recommendationText}>
              <Text style={styles.recommendationTitle}>Clothing</Text>
              <Text style={styles.recommendationDetail}>{trainingRecommendations.clothing}</Text>
            </View>
          </View>
          
          <View style={styles.recommendationItem}>
            <Icon name="schedule" size={24} color={COLORS.primary} />
            <View style={styles.recommendationText}>
              <Text style={styles.recommendationTitle}>Optimal Timing</Text>
              <Text style={styles.recommendationDetail}>{trainingRecommendations.timing}</Text>
            </View>
          </View>
          
          <View style={styles.recommendationItem}>
            <Icon name="wb-sunny" size={24} color={COLORS.primary} />
            <View style={styles.recommendationText}>
              <Text style={styles.recommendationTitle}>Sun Protection</Text>
              <Text style={styles.recommendationDetail}>{trainingRecommendations.sunProtection}</Text>
            </View>
          </View>
        </View>
      </Card>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Icon name="cloud-download" size={48} color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading weather data...</Text>
      </View>
    );
  }

  return (
    <Animated.View 
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
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
        <View style={styles.content}>
          {renderCurrentWeather()}
          {renderHourlyForecast()}
          {renderWeeklyForecast()}
          {renderTrainingRecommendations()}
        </View>
      </ScrollView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: SPACING.md,
    paddingTop: SPACING.xl,
  },
  currentWeatherCard: {
    marginBottom: SPACING.md,
    borderRadius: 16,
    overflow: 'hidden',
  },
  currentWeatherGradient: {
    padding: SPACING.lg,
  },
  currentWeatherContent: {
    alignItems: 'center',
  },
  mainWeatherInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  temperatureContainer: {
    marginLeft: SPACING.lg,
    alignItems: 'center',
  },
  temperature: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
  },
  feelsLike: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  weatherDescription: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    marginBottom: SPACING.lg,
    fontWeight: '500',
  },
  weatherDetailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    width: '100%',
  },
  weatherDetail: {
    alignItems: 'center',
    minWidth: '22%',
    marginVertical: SPACING.xs,
  },
  detailLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: SPACING.xs,
  },
  detailValue: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  forecastCard: {
    marginBottom: SPACING.md,
    padding: SPACING.md,
    borderRadius: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  cardTitle: {
    ...TEXT_STYLES.subtitle,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  hourlyScrollContent: {
    paddingHorizontal: SPACING.xs,
  },
  hourlyItem: {
    alignItems: 'center',
    marginHorizontal: SPACING.sm,
    padding: SPACING.sm,
  },
  hourlyTime: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  hourlyTemp: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginTop: SPACING.xs,
  },
  dailyForecastItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  dailyForecastLeft: {
    flex: 1,
  },
  dayName: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },
  dailyTemps: {
    flexDirection: 'row',
    marginTop: SPACING.xs,
  },
  highTemp: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  lowTemp: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginLeft: SPACING.sm,
  },
  dailyForecastCenter: {
    flex: 1,
    alignItems: 'center',
  },
  dailyForecastRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  suitabilityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 12,
  },
  suitabilityText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
    marginLeft: SPACING.xs,
    textTransform: 'capitalize',
  },
  recommendationsCard: {
    padding: SPACING.md,
    borderRadius: 12,
    marginBottom: SPACING.lg,
  },
  recommendationsList: {
    gap: SPACING.md,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  recommendationText: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  recommendationDetail: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
});

export default WeatherInfo;