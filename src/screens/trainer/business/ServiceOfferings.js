import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  RefreshControl,
  Alert,
  StatusBar,
  Animated,
  Vibration,
  Dimensions,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { 
  Card,
  Button,
  Text,
  Chip,
  IconButton,
  Searchbar,
  Surface,
  ProgressBar,
  Portal,
  Modal,
  Divider,
  Switch,
  FAB,
  Menu,
  Avatar,
} from 'react-native-paper';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from '../../../components/shared/BlurView';

// Import your design system constants
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const { width } = Dimensions.get('window');

const ServiceOfferings = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  
  // State management
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [showMenuId, setShowMenuId] = useState(null);
  
  // Animation values
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(50))[0];
  const fabScale = useState(new Animated.Value(0))[0];

  // Form states for add/edit service
  const [serviceForm, setServiceForm] = useState({
    title: '',
    description: '',
    price: '',
    duration: '',
    category: 'personal',
    difficulty: 'beginner',
    groupSize: '1',
    location: 'gym',
    features: [],
    isActive: true,
    discount: '',
  });

  // Mock data - replace with actual Redux state
  const [services, setServices] = useState([
    {
      id: '1',
      title: 'Personal Training Session',
      description: 'One-on-one personalized workout session focusing on your specific goals and fitness level.',
      price: 75,
      originalPrice: 85,
      duration: 60,
      category: 'personal',
      difficulty: 'all',
      groupSize: 1,
      location: 'gym',
      features: ['Personalized workout', 'Form correction', 'Progress tracking', 'Nutrition tips'],
      isActive: true,
      bookings: 45,
      rating: 4.8,
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
      discount: 12,
      popular: true,
    },
    {
      id: '2',
      title: 'Group Fitness Class',
      description: 'High-energy group workout sessions designed to motivate and challenge participants together.',
      price: 25,
      duration: 45,
      category: 'group',
      difficulty: 'intermediate',
      groupSize: 12,
      location: 'studio',
      features: ['Group motivation', 'Fun atmosphere', 'Varied workouts', 'Community building'],
      isActive: true,
      bookings: 120,
      rating: 4.6,
      image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400',
    },
    {
      id: '3',
      title: 'Nutrition Consultation',
      description: 'Comprehensive nutrition assessment and meal planning to support your fitness goals.',
      price: 95,
      duration: 90,
      category: 'consultation',
      difficulty: 'all',
      groupSize: 1,
      location: 'online',
      features: ['Dietary assessment', 'Custom meal plans', 'Supplement advice', 'Follow-up support'],
      isActive: true,
      bookings: 28,
      rating: 4.9,
      image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400',
      new: true,
    },
    {
      id: '4',
      title: 'Online Training Program',
      description: '12-week structured online program with video demonstrations and progress tracking.',
      price: 149,
      originalPrice: 199,
      duration: 0, // Self-paced
      category: 'online',
      difficulty: 'beginner',
      groupSize: 0, // Unlimited
      location: 'online',
      features: ['Video workouts', 'Progress tracking', 'Community support', 'Mobile app access'],
      isActive: true,
      bookings: 89,
      rating: 4.7,
      image: 'https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=400',
      discount: 25,
    },
    {
      id: '5',
      title: 'Strength Training Bootcamp',
      description: 'Intensive 6-week bootcamp focusing on building strength and muscle definition.',
      price: 180,
      duration: 45,
      category: 'bootcamp',
      difficulty: 'advanced',
      groupSize: 8,
      location: 'gym',
      features: ['Progressive overload', 'Strength assessments', 'Equipment training', 'Results tracking'],
      isActive: false,
      bookings: 15,
      rating: 4.5,
      image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=400',
    },
  ]);

  const categories = [
    { key: 'all', label: 'All Services', icon: 'fitness-center' },
    { key: 'personal', label: 'Personal Training', icon: 'person' },
    { key: 'group', label: 'Group Classes', icon: 'groups' },
    { key: 'online', label: 'Online Programs', icon: 'laptop' },
    { key: 'consultation', label: 'Consultations', icon: 'chat' },
    { key: 'bootcamp', label: 'Bootcamps', icon: 'military-tech' },
  ];

  const difficultyLevels = ['beginner', 'intermediate', 'advanced', 'all'];
  const locationTypes = ['gym', 'studio', 'outdoor', 'online', 'home'];
  const availableFeatures = [
    'Personalized workout', 'Form correction', 'Progress tracking', 'Nutrition tips',
    'Video workouts', 'Community support', 'Equipment training', 'Meal planning',
    'Supplement advice', 'Follow-up support', 'Mobile app access', 'Group motivation'
  ];

  const serviceStats = {
    totalServices: services.length,
    activeServices: services.filter(s => s.isActive).length,
    totalBookings: services.reduce((sum, s) => sum + s.bookings, 0),
    averagePrice: Math.round(services.reduce((sum, s) => sum + s.price, 0) / services.length),
    averageRating: (services.reduce((sum, s) => sum + (s.rating || 0), 0) / services.length).toFixed(1),
  };

  useEffect(() => {
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
      Animated.spring(fabScale, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    loadServices();
  }, []);

  const loadServices = useCallback(async () => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      // In real app: dispatch(fetchServices(user.id));
    } catch (error) {
      Alert.alert('Error', 'Failed to load services. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadServices();
    setRefreshing(false);
    Vibration.vibrate(50);
  }, [loadServices]);

  const handleAddService = () => {
    setServiceForm({
      title: '',
      description: '',
      price: '',
      duration: '',
      category: 'personal',
      difficulty: 'beginner',
      groupSize: '1',
      location: 'gym',
      features: [],
      isActive: true,
      discount: '',
    });
    setShowAddModal(true);
    Vibration.vibrate(50);
  };

  const handleEditService = (service) => {
    setSelectedService(service);
    setServiceForm({
      title: service.title,
      description: service.description,
      price: service.price.toString(),
      duration: service.duration.toString(),
      category: service.category,
      difficulty: service.difficulty,
      groupSize: service.groupSize.toString(),
      location: service.location,
      features: [...service.features],
      isActive: service.isActive,
      discount: service.discount?.toString() || '',
    });
    setShowEditModal(true);
    setShowMenuId(null);
    Vibration.vibrate(50);
  };

  const handleDeleteService = (serviceId) => {
    Alert.alert(
      'Delete Service',
      'Are you sure you want to delete this service? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setServices(prev => prev.filter(s => s.id !== serviceId));
            setShowMenuId(null);
            Alert.alert('Success', 'Service deleted successfully! 🗑️');
            Vibration.vibrate([100, 50, 100]);
          }
        }
      ]
    );
  };

  const handleToggleService = (serviceId) => {
    setServices(prev => prev.map(service => 
      service.id === serviceId 
        ? { ...service, isActive: !service.isActive }
        : service
    ));
    setShowMenuId(null);
    Vibration.vibrate(50);
  };

  const saveService = async () => {
    if (!serviceForm.title.trim() || !serviceForm.description.trim() || !serviceForm.price) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      
      const serviceData = {
        ...serviceForm,
        id: selectedService?.id || Date.now().toString(),
        price: parseFloat(serviceForm.price),
        duration: parseInt(serviceForm.duration) || 0,
        groupSize: parseInt(serviceForm.groupSize) || 1,
        discount: parseFloat(serviceForm.discount) || 0,
        bookings: selectedService?.bookings || 0,
        rating: selectedService?.rating || 0,
        image: selectedService?.image || 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
      };

      if (selectedService) {
        // Update existing service
        setServices(prev => prev.map(s => s.id === selectedService.id ? serviceData : s));
      } else {
        // Add new service
        setServices(prev => [...prev, serviceData]);
      }

      setShowAddModal(false);
      setShowEditModal(false);
      Alert.alert('Success', `Service ${selectedService ? 'updated' : 'created'} successfully! 🎉`);
      Vibration.vibrate([100, 50, 100]);
    } catch (error) {
      Alert.alert('Error', 'Failed to save service. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner': return COLORS.success;
      case 'intermediate': return '#FFA500';
      case 'advanced': return COLORS.error;
      default: return COLORS.primary;
    }
  };

  const filteredServices = services.filter(service => {
    const matchesSearch = service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const renderServiceCard = (service) => (
    <Animated.View
      key={service.id}
      style={{
        transform: [{ translateY: slideAnim }],
        opacity: fadeAnim,
        marginBottom: SPACING.md,
      }}
    >
      <Card style={{ 
        backgroundColor: 'white', 
        elevation: 3,
        opacity: service.isActive ? 1 : 0.6 
      }}>
        {/* Service Image & Status */}
        <View style={{ position: 'relative' }}>
          <Card.Cover 
            source={{ uri: service.image }} 
            style={{ height: 150, backgroundColor: '#f0f0f0' }}
          />
          
          {/* Status Badges */}
          <View style={{ 
            position: 'absolute', 
            top: SPACING.sm, 
            left: SPACING.sm,
            flexDirection: 'row',
          }}>
            {service.popular && (
              <Chip
                mode="flat"
                compact
                style={{ backgroundColor: '#FF6B6B', marginRight: SPACING.xs }}
                textStyle={{ color: 'white', fontSize: 10 }}
              >
                🔥 Popular
              </Chip>
            )}
            {service.new && (
              <Chip
                mode="flat"
                compact
                style={{ backgroundColor: COLORS.success }}
                textStyle={{ color: 'white', fontSize: 10 }}
              >
                ✨ New
              </Chip>
            )}
          </View>

          {/* Menu Button */}
          <View style={{ position: 'absolute', top: SPACING.sm, right: SPACING.sm }}>
            <Menu
              visible={showMenuId === service.id}
              onDismiss={() => setShowMenuId(null)}
              anchor={
                <IconButton
                  icon="dots-vertical"
                  size={20}
                  iconColor="white"
                  style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
                  onPress={() => setShowMenuId(service.id)}
                />
              }
            >
              <Menu.Item
                leadingIcon="edit"
                title="Edit"
                onPress={() => handleEditService(service)}
              />
              <Menu.Item
                leadingIcon={service.isActive ? "visibility-off" : "visibility"}
                title={service.isActive ? "Deactivate" : "Activate"}
                onPress={() => handleToggleService(service.id)}
              />
              <Divider />
              <Menu.Item
                leadingIcon="delete"
                title="Delete"
                titleStyle={{ color: COLORS.error }}
                onPress={() => handleDeleteService(service.id)}
              />
            </Menu>
          </View>
        </View>

        <Card.Content style={{ padding: SPACING.md }}>
          {/* Service Header */}
          <View style={{ 
            flexDirection: 'row', 
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: SPACING.sm 
          }}>
            <View style={{ flex: 1 }}>
              <Text style={[TEXT_STYLES.heading, { fontSize: 18, marginBottom: 4 }]}>
                {service.title}
              </Text>
              <Text style={[TEXT_STYLES.body, { color: '#666', lineHeight: 20 }]} numberOfLines={2}>
                {service.description}
              </Text>
            </View>
          </View>

          {/* Service Details */}
          <View style={{ 
            flexDirection: 'row', 
            flexWrap: 'wrap', 
            marginBottom: SPACING.sm 
          }}>
            <Chip
              mode="outlined"
              compact
              style={{ 
                marginRight: SPACING.xs, 
                marginBottom: SPACING.xs,
                borderColor: getDifficultyColor(service.difficulty),
              }}
              textStyle={{ color: getDifficultyColor(service.difficulty), fontSize: 11 }}
            >
              {service.difficulty.charAt(0).toUpperCase() + service.difficulty.slice(1)}
            </Chip>
            
            {service.duration > 0 && (
              <Chip
                mode="outlined"
                compact
                style={{ marginRight: SPACING.xs, marginBottom: SPACING.xs }}
                textStyle={{ fontSize: 11 }}
              >
                ⏱️ {service.duration}min
              </Chip>
            )}
            
            <Chip
              mode="outlined"
              compact
              style={{ marginRight: SPACING.xs, marginBottom: SPACING.xs }}
              textStyle={{ fontSize: 11 }}
            >
              📍 {service.location}
            </Chip>

            {service.groupSize > 0 && (
              <Chip
                mode="outlined"
                compact
                style={{ marginBottom: SPACING.xs }}
                textStyle={{ fontSize: 11 }}
              >
                👥 {service.groupSize === 1 ? '1-on-1' : `Max ${service.groupSize}`}
              </Chip>
            )}
          </View>

          {/* Features */}
          <View style={{ marginBottom: SPACING.sm }}>
            <Text style={[TEXT_STYLES.caption, { fontWeight: '600', marginBottom: SPACING.xs }]}>
              What's included:
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {service.features.slice(0, 3).map((feature, index) => (
                <Text key={index} style={[TEXT_STYLES.caption, { 
                  color: '#666',
                  marginRight: SPACING.sm,
                  marginBottom: 2 
                }]}>
                  ✓ {feature}
                </Text>
              ))}
              {service.features.length > 3 && (
                <Text style={[TEXT_STYLES.caption, { color: COLORS.primary }]}>
                  +{service.features.length - 3} more
                </Text>
              )}
            </View>
          </View>

          {/* Stats Row */}
          <View style={{ 
            flexDirection: 'row', 
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: SPACING.sm,
            borderTopWidth: 1,
            borderTopColor: '#f0f0f0',
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              {service.rating > 0 && (
                <>
                  <Icon name="star" size={16} color="#FFD700" />
                  <Text style={[TEXT_STYLES.caption, { marginLeft: 4, marginRight: SPACING.sm }]}>
                    {service.rating}
                  </Text>
                </>
              )}
              <Text style={[TEXT_STYLES.caption, { color: '#666' }]}>
                {service.bookings} bookings
              </Text>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              {service.originalPrice && service.originalPrice > service.price && (
                <Text style={[
                  TEXT_STYLES.caption, 
                  { 
                    textDecorationLine: 'line-through', 
                    color: '#999',
                    marginRight: SPACING.xs 
                  }
                ]}>
                  ${service.originalPrice}
                </Text>
              )}
              <Text style={[TEXT_STYLES.heading, { color: COLORS.primary, fontSize: 20 }]}>
                ${service.price}
              </Text>
              {service.discount > 0 && (
                <Surface style={{
                  backgroundColor: COLORS.error,
                  borderRadius: 12,
                  paddingHorizontal: 6,
                  paddingVertical: 2,
                  marginLeft: SPACING.xs,
                }}>
                  <Text style={[TEXT_STYLES.caption, { color: 'white', fontSize: 10 }]}>
                    -{service.discount}%
                  </Text>
                </Surface>
              )}
            </View>
          </View>

          {/* Status Indicator */}
          {!service.isActive && (
            <Surface style={{
              backgroundColor: '#FFE0E0',
              padding: SPACING.xs,
              borderRadius: 6,
              marginTop: SPACING.sm,
            }}>
              <Text style={[TEXT_STYLES.caption, { color: COLORS.error, textAlign: 'center' }]}>
                ⚠️ Service is currently inactive
              </Text>
            </Surface>
          )}
        </Card.Content>
      </Card>
    </Animated.View>
  );

  const renderServiceForm = () => (
    <ScrollView style={{ maxHeight: '80%' }}>
      <Text style={[TEXT_STYLES.heading, { marginBottom: SPACING.md }]}>
        {selectedService ? '✏️ Edit Service' : '➕ Add New Service'}
      </Text>

      {/* Basic Info */}
      <Surface style={{ padding: SPACING.md, borderRadius: 8, marginBottom: SPACING.md }}>
        <Text style={[TEXT_STYLES.body, { fontWeight: '600', marginBottom: SPACING.sm }]}>
          Basic Information
        </Text>
        
        <TextInput
          placeholder="Service title"
          value={serviceForm.title}
          onChangeText={(text) => setServiceForm(prev => ({ ...prev, title: text }))}
          style={{
            borderWidth: 1,
            borderColor: '#E0E0E0',
            borderRadius: 8,
            padding: SPACING.sm,
            marginBottom: SPACING.sm,
            fontSize: 16,
          }}
        />
        
        <TextInput
          placeholder="Service description"
          value={serviceForm.description}
          onChangeText={(text) => setServiceForm(prev => ({ ...prev, description: text }))}
          multiline
          numberOfLines={3}
          style={{
            borderWidth: 1,
            borderColor: '#E0E0E0',
            borderRadius: 8,
            padding: SPACING.sm,
            marginBottom: SPACING.sm,
            fontSize: 16,
            textAlignVertical: 'top',
          }}
        />
      </Surface>

      {/* Pricing & Duration */}
      <Surface style={{ padding: SPACING.md, borderRadius: 8, marginBottom: SPACING.md }}>
        <Text style={[TEXT_STYLES.body, { fontWeight: '600', marginBottom: SPACING.sm }]}>
          Pricing & Duration
        </Text>
        
        <View style={{ flexDirection: 'row', marginBottom: SPACING.sm }}>
          <TextInput
            placeholder="Price ($)"
            value={serviceForm.price}
            onChangeText={(text) => setServiceForm(prev => ({ ...prev, price: text }))}
            keyboardType="numeric"
            style={{
              borderWidth: 1,
              borderColor: '#E0E0E0',
              borderRadius: 8,
              padding: SPACING.sm,
              fontSize: 16,
              flex: 1,
              marginRight: SPACING.sm,
            }}
          />
          
          <TextInput
            placeholder="Duration (min)"
            value={serviceForm.duration}
            onChangeText={(text) => setServiceForm(prev => ({ ...prev, duration: text }))}
            keyboardType="numeric"
            style={{
              borderWidth: 1,
              borderColor: '#E0E0E0',
              borderRadius: 8,
              padding: SPACING.sm,
              fontSize: 16,
              flex: 1,
            }}
          />
        </View>
        
        <TextInput
          placeholder="Discount % (optional)"
          value={serviceForm.discount}
          onChangeText={(text) => setServiceForm(prev => ({ ...prev, discount: text }))}
          keyboardType="numeric"
          style={{
            borderWidth: 1,
            borderColor: '#E0E0E0',
            borderRadius: 8,
            padding: SPACING.sm,
            fontSize: 16,
          }}
        />
      </Surface>

      {/* Service Details */}
      <Surface style={{ padding: SPACING.md, borderRadius: 8, marginBottom: SPACING.md }}>
        <Text style={[TEXT_STYLES.body, { fontWeight: '600', marginBottom: SPACING.sm }]}>
          Service Details
        </Text>
        
        <View style={{ marginBottom: SPACING.sm }}>
          <Text style={[TEXT_STYLES.caption, { marginBottom: SPACING.xs }]}>Category:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {categories.slice(1).map((category) => (
              <Chip
                key={category.key}
                mode={serviceForm.category === category.key ? 'flat' : 'outlined'}
                selected={serviceForm.category === category.key}
                onPress={() => setServiceForm(prev => ({ ...prev, category: category.key }))}
                style={{ marginRight: SPACING.xs }}
              >
                {category.label}
              </Chip>
            ))}
          </ScrollView>
        </View>
        
        <View style={{ marginBottom: SPACING.sm }}>
          <Text style={[TEXT_STYLES.caption, { marginBottom: SPACING.xs }]}>Difficulty:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {difficultyLevels.map((level) => (
              <Chip
                key={level}
                mode={serviceForm.difficulty === level ? 'flat' : 'outlined'}
                selected={serviceForm.difficulty === level}
                onPress={() => setServiceForm(prev => ({ ...prev, difficulty: level }))}
                style={{ 
                  marginRight: SPACING.xs,
                  backgroundColor: serviceForm.difficulty === level ? getDifficultyColor(level) : 'white',
                }}
                textStyle={{
                  color: serviceForm.difficulty === level ? 'white' : getDifficultyColor(level),
                }}
              >
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </Chip>
            ))}
          </ScrollView>
        </View>
        
        <View style={{ flexDirection: 'row', marginBottom: SPACING.sm }}>
          <View style={{ flex: 1, marginRight: SPACING.sm }}>
            <Text style={[TEXT_STYLES.caption, { marginBottom: SPACING.xs }]}>Group Size:</Text>
            <TextInput
              placeholder="Max participants"
              value={serviceForm.groupSize}
              onChangeText={(text) => setServiceForm(prev => ({ ...prev, groupSize: text }))}
              keyboardType="numeric"
              style={{
                borderWidth: 1,
                borderColor: '#E0E0E0',
                borderRadius: 8,
                padding: SPACING.sm,
                fontSize: 16,
              }}
            />
          </View>
          
          <View style={{ flex: 1 }}>
            <Text style={[TEXT_STYLES.caption, { marginBottom: SPACING.xs }]}>Location:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {locationTypes.map((location) => (
                <Chip
                  key={location}
                  mode={serviceForm.location === location ? 'flat' : 'outlined'}
                  selected={serviceForm.location === location}
                  onPress={() => setServiceForm(prev => ({ ...prev, location }))}
                  style={{ marginRight: SPACING.xs }}
                  compact
                >
                  {location}
                </Chip>
              ))}
            </ScrollView>
          </View>
        </View>
      </Surface>

      {/* Active Status */}
      <Surface style={{ 
        padding: SPACING.md, 
        borderRadius: 8, 
        marginBottom: SPACING.lg,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <View>
          <Text style={[TEXT_STYLES.body, { fontWeight: '600' }]}>Service Status</Text>
          <Text style={[TEXT_STYLES.caption, { color: '#666' }]}>
            {serviceForm.isActive ? 'Clients can book this service' : 'Service is hidden from clients'}
          </Text>
        </View>
        <Switch
          value={serviceForm.isActive}
          onValueChange={(value) => setServiceForm(prev => ({ ...prev, isActive: value }))}
          color={COLORS.primary}
        />
      </Surface>

      {/* Action Buttons */}
      <View style={{ 
        flexDirection: 'row', 
        justifyContent: 'space-between',
        marginBottom: SPACING.lg 
      }}>
        <Button
          mode="outlined"
          onPress={() => {
            setShowAddModal(false);
            setShowEditModal(false);
          }}
          style={{ flex: 0.45 }}
        >
          Cancel
        </Button>
        <Button
          mode="contained"
          onPress={saveService}
          loading={loading}
          style={{ flex: 0.45, backgroundColor: COLORS.primary }}
        >
          {selectedService ? 'Update' : 'Create'} Service
        </Button>
      </View>
    </ScrollView>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#F5F5F5' }}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      {/* Header */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={{
          paddingTop: 50,
          paddingBottom: SPACING.lg,
          paddingHorizontal: SPACING.lg,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View>
            <Text style={[TEXT_STYLES.heading, { color: 'white', fontSize: 24 }]}>
              Service Offerings
            </Text>
            <Text style={[TEXT_STYLES.body, { color: 'white', opacity: 0.9 }]}>
              💼 {serviceStats.activeServices}/{serviceStats.totalServices} active • ${serviceStats.averagePrice} avg
            </Text>
          </View>
          <IconButton
            icon="analytics"
            size={28}
            iconColor="white"
            onPress={() => Alert.alert('Analytics', 'Detailed service analytics coming soon! 📊')}
          />
        </View>
      </LinearGradient>

      {/* Quick Stats */}
      <View style={{
        flexDirection: 'row',
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.md,
        justifyContent: 'space-between',
      }}>
        <Surface style={{
          padding: SPACING.sm,
          borderRadius: 8,
          alignItems: 'center',
          flex: 1,
          marginRight: SPACING.xs,
          backgroundColor: COLORS.primary + '20',
        }}>
          <Text style={[TEXT_STYLES.body, { fontWeight: '600', color: COLORS.primary }]}>
            {serviceStats.totalBookings}
          </Text>
          <Text style={[TEXT_STYLES.caption, { color: COLORS.primary }]}>Total Bookings</Text>
        </Surface>
        
        <Surface style={{
          padding: SPACING.sm,
          borderRadius: 8,
          alignItems: 'center',
          flex: 1,
          marginHorizontal: SPACING.xs,
          backgroundColor: COLORS.success + '20',
        }}>
          <Text style={[TEXT_STYLES.body, { fontWeight: '600', color: COLORS.success }]}>
            ${serviceStats.averagePrice}
          </Text>
          <Text style={[TEXT_STYLES.caption, { color: COLORS.success }]}>Avg Price</Text>
        </Surface>
        
        <Surface style={{
          padding: SPACING.sm,
          borderRadius: 8,
          alignItems: 'center',
          flex: 1,
          marginLeft: SPACING.xs,
          backgroundColor: '#FFD700' + '20',
        }}>
          <Text style={[TEXT_STYLES.body, { fontWeight: '600', color: '#B8860B' }]}>
            {serviceStats.averageRating}⭐
          </Text>
          <Text style={[TEXT_STYLES.caption, { color: '#B8860B' }]}>Avg Rating</Text>
        </Surface>
      </View>

      {/* Search and Categories */}
      <View style={{ paddingHorizontal: SPACING.lg, marginBottom: SPACING.md }}>
        <Searchbar
          placeholder="Search services..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={{ backgroundColor: 'white', elevation: 2, marginBottom: SPACING.sm }}
          iconColor={COLORS.primary}
        />
        
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingRight: SPACING.lg }}
        >
          {categories.map((category) => (
            <Chip
              key={category.key}
              mode={selectedCategory === category.key ? 'flat' : 'outlined'}
              selected={selectedCategory === category.key}
              onPress={() => setSelectedCategory(category.key)}
              icon={category.icon}
              style={{
                marginRight: SPACING.sm,
                backgroundColor: selectedCategory === category.key ? COLORS.primary : 'white',
              }}
              textStyle={{
                color: selectedCategory === category.key ? 'white' : COLORS.primary,
              }}
            >
              {category.label}
            </Chip>
          ))}
        </ScrollView>
      </View>

      {/* Services List */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ 
          paddingHorizontal: SPACING.lg,
          paddingBottom: 100 
        }}
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
        {loading && !refreshing ? (
          <View style={{ alignItems: 'center', paddingVertical: SPACING.xl }}>
            <ProgressBar 
              indeterminate 
              style={{ width: '60%' }} 
              color={COLORS.primary}
            />
            <Text style={[TEXT_STYLES.body, { marginTop: SPACING.sm, color: '#666' }]}>
              Loading services...
            </Text>
          </View>
        ) : filteredServices.length === 0 ? (
          <View style={{ alignItems: 'center', paddingVertical: SPACING.xl }}>
            <Icon name="work-outline" size={60} color="#CCC" />
            <Text style={[TEXT_STYLES.heading, { color: '#999', marginTop: SPACING.md }]}>
              No Services Found
            </Text>
            <Text style={[TEXT_STYLES.body, { color: '#666', textAlign: 'center', marginTop: SPACING.sm }]}>
              {searchQuery || selectedCategory !== 'all' 
                ? 'Try adjusting your search or filter' 
                : 'Create your first service offering to start attracting clients'}
            </Text>
            {(!searchQuery && selectedCategory === 'all') && (
              <Button
                mode="contained"
                onPress={handleAddService}
                style={{ marginTop: SPACING.md, backgroundColor: COLORS.primary }}
              >
                Create First Service
              </Button>
            )}
          </View>
        ) : (
          filteredServices.map(renderServiceCard)
        )}
      </ScrollView>

      {/* Floating Action Button */}
      <Animated.View
        style={{
          position: 'absolute',
          bottom: 20,
          right: 20,
          transform: [{ scale: fabScale }],
        }}
      >
        <FAB
          icon="add"
          onPress={handleAddService}
          style={{ backgroundColor: COLORS.primary }}
        />
      </Animated.View>

      {/* Add/Edit Service Modal */}
      <Portal>
        <Modal 
          visible={showAddModal || showEditModal} 
          onDismiss={() => {
            setShowAddModal(false);
            setShowEditModal(false);
          }}
          contentContainerStyle={{
            backgroundColor: 'white',
            margin: SPACING.lg,
            padding: SPACING.lg,
            borderRadius: 12,
            maxHeight: '90%',
          }}
        >
          {renderServiceForm()}
        </Modal>
      </Portal>
    </View>
  );
};

export default ServiceOfferings;