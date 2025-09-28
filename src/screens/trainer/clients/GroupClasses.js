import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  StatusBar,
  RefreshControl,
  Animated,
  Vibration,
  Dimensions,
  Platform,
  FlatList,
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
  TextInput,
  RadioButton,
  Divider,
  Badge,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { BlurView } from '../../../components/shared/BlurView';

// Import your established design system
import { COLORS, SPACING, TEXT_STYLES } from '../styles/theme';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const GroupClasses = ({ navigation, route }) => {
  // Redux state management
  const dispatch = useDispatch();
  const { user, classes, clients, bookings, loading } = useSelector(state => ({
    user: state.auth.user,
    classes: state.classes.data,
    clients: state.clients.data,
    bookings: state.bookings.data,
    loading: state.classes.loading,
  }));

  // Local state
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState('upcoming'); // upcoming, past, all
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showClassDetail, setShowClassDetail] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [newClass, setNewClass] = useState({
    name: '',
    description: '',
    type: 'fitness',
    capacity: 10,
    duration: 60,
    price: 0,
    date: '',
    time: '',
    level: 'beginner',
    equipment: [],
  });
  const [showParticipants, setShowParticipants] = useState(false);
  const [viewMode, setViewMode] = useState('card'); // card, calendar, list

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  // Class types and levels
  const classTypes = [
    { id: 'fitness', name: 'General Fitness', icon: 'fitness-center', color: '#3498db' },
    { id: 'yoga', name: 'Yoga', icon: 'self-improvement', color: '#9b59b6' },
    { id: 'hiit', name: 'HIIT', icon: 'local-fire-department', color: '#e74c3c' },
    { id: 'strength', name: 'Strength Training', icon: 'sports-gymnastics', color: '#2c3e50' },
    { id: 'cardio', name: 'Cardio', icon: 'directions-run', color: '#f39c12' },
    { id: 'pilates', name: 'Pilates', icon: 'accessibility', color: '#1abc9c' },
    { id: 'boxing', name: 'Boxing', icon: 'sports-mma', color: '#e67e22' },
    { id: 'dance', name: 'Dance Fitness', icon: 'music-note', color: '#e91e63' },
  ];

  const levelOptions = [
    { value: 'beginner', label: 'Beginner', color: '#2ecc71' },
    { value: 'intermediate', label: 'Intermediate', color: '#f39c12' },
    { value: 'advanced', label: 'Advanced', color: '#e74c3c' },
    { value: 'all', label: 'All Levels', color: '#9b59b6' },
  ];

  // Mock data - replace with Redux state
  const mockClasses = [
    {
      id: '1',
      name: 'Morning HIIT Blast',
      type: 'hiit',
      date: '2025-08-20',
      time: '07:00',
      duration: 45,
      capacity: 15,
      enrolled: 12,
      price: 25,
      level: 'intermediate',
      description: 'High-intensity interval training to kickstart your day',
      status: 'upcoming',
      participants: [
        { id: '1', name: 'Sarah Johnson', avatar: 'SJ', status: 'confirmed' },
        { id: '2', name: 'Mike Chen', avatar: 'MC', status: 'confirmed' },
        { id: '3', name: 'Emma Davis', avatar: 'ED', status: 'waitlist' },
      ],
      equipment: ['Mat', 'Dumbbells', 'Resistance Bands'],
    },
    {
      id: '2',
      name: 'Zen Yoga Flow',
      type: 'yoga',
      date: '2025-08-20',
      time: '18:30',
      duration: 60,
      capacity: 20,
      enrolled: 18,
      price: 20,
      level: 'all',
      description: 'Relaxing yoga session to unwind after work',
      status: 'upcoming',
      participants: [],
      equipment: ['Yoga Mat', 'Blocks', 'Strap'],
    },
    {
      id: '3',
      name: 'Strength & Power',
      type: 'strength',
      date: '2025-08-19',
      time: '19:00',
      duration: 75,
      capacity: 12,
      enrolled: 10,
      price: 30,
      level: 'advanced',
      description: 'Heavy lifting session for experienced lifters',
      status: 'completed',
      participants: [],
      equipment: ['Barbell', 'Plates', 'Rack'],
    },
  ];

  // Effects
  useEffect(() => {
    StatusBar.setBarStyle('light-content', true);
    StatusBar.setTranslucent(true);
    
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
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();

    // Load classes data
    loadClasses();
  }, []);

  // Handlers
  const loadClasses = useCallback(async () => {
    try {
      // Dispatch action to load classes
      // dispatch(loadClassesAction());
      console.log('Loading group classes...');
    } catch (error) {
      console.error('Error loading classes:', error);
      Alert.alert('Error', 'Failed to load classes. Please try again.');
    }
  }, [dispatch]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadClasses();
    setRefreshing(false);
  }, [loadClasses]);

  const createClass = useCallback(async () => {
    try {
      if (!newClass.name || !newClass.date || !newClass.time) {
        Alert.alert('Validation Error', 'Please fill in all required fields.');
        return;
      }

      // Dispatch create class action
      // dispatch(createClassAction(newClass));
      
      Vibration.vibrate(50);
      setShowCreateModal(false);
      setNewClass({
        name: '',
        description: '',
        type: 'fitness',
        capacity: 10,
        duration: 60,
        price: 0,
        date: '',
        time: '',
        level: 'beginner',
        equipment: [],
      });

      Alert.alert(
        '🎉 Class Created!',
        'Your group class has been successfully created and is now available for bookings.',
        [
          { text: 'OK', onPress: () => console.log('Class created') }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to create class. Please try again.');
    }
  }, [newClass]);

  const cancelClass = useCallback((classItem) => {
    Alert.alert(
      'Cancel Class',
      `Are you sure you want to cancel "${classItem.name}"? This will notify all participants.`,
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: () => {
            // Dispatch cancel class action
            // dispatch(cancelClassAction(classItem.id));
            Vibration.vibrate(100);
            Alert.alert('Class Cancelled', 'Participants have been notified.');
          }
        }
      ]
    );
  }, []);

  const duplicateClass = useCallback((classItem) => {
    const duplicatedClass = {
      ...classItem,
      name: `${classItem.name} (Copy)`,
      date: '',
      time: '',
      enrolled: 0,
      participants: [],
    };
    setNewClass(duplicatedClass);
    setShowCreateModal(true);
    Vibration.vibrate(30);
  }, []);

  const getFilteredClasses = useCallback(() => {
    let filtered = mockClasses;

    // Filter by tab
    if (selectedTab === 'upcoming') {
      filtered = filtered.filter(c => c.status === 'upcoming');
    } else if (selectedTab === 'past') {
      filtered = filtered.filter(c => c.status === 'completed');
    }

    // Filter by search
    if (searchQuery) {
      filtered = filtered.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.type.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered.sort((a, b) => new Date(`${a.date} ${a.time}`) - new Date(`${b.date} ${b.time}`));
  }, [selectedTab, searchQuery]);

  const getClassTypeInfo = (type) => {
    return classTypes.find(t => t.id === type) || classTypes[0];
  };

  const getLevelInfo = (level) => {
    return levelOptions.find(l => l.value === level) || levelOptions[0];
  };

  const formatDateTime = (date, time) => {
    const dateObj = new Date(`${date} ${time}`);
    return {
      date: dateObj.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      }),
      time: dateObj.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
    };
  };

  const getOccupancyColor = (enrolled, capacity) => {
    const percentage = (enrolled / capacity) * 100;
    if (percentage >= 90) return COLORS.error;
    if (percentage >= 70) return COLORS.warning;
    return COLORS.success;
  };

  const renderTabBar = () => (
    <View style={{
      flexDirection: 'row',
      marginBottom: SPACING.lg,
      backgroundColor: COLORS.surface,
      borderRadius: 8,
      padding: SPACING.xs,
    }}>
      {[
        { id: 'upcoming', label: 'Upcoming', count: mockClasses.filter(c => c.status === 'upcoming').length },
        { id: 'past', label: 'Past', count: mockClasses.filter(c => c.status === 'completed').length },
        { id: 'all', label: 'All', count: mockClasses.length },
      ].map((tab) => (
        <TouchableOpacity
          key={tab.id}
          onPress={() => {
            setSelectedTab(tab.id);
            Vibration.vibrate(30);
          }}
          style={{
            flex: 1,
            paddingVertical: SPACING.sm,
            paddingHorizontal: SPACING.md,
            borderRadius: 6,
            backgroundColor: selectedTab === tab.id ? COLORS.primary : 'transparent',
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'center',
          }}
        >
          <Text style={[
            TEXT_STYLES.buttonText,
            { color: selectedTab === tab.id ? 'white' : COLORS.text.secondary }
          ]}>
            {tab.label}
          </Text>
          <Badge
            style={{
              backgroundColor: selectedTab === tab.id ? 'rgba(255,255,255,0.3)' : COLORS.primary + '20',
              marginLeft: SPACING.xs,
            }}
            size={18}
          >
            {tab.count}
          </Badge>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderClassCard = ({ item: classItem }) => {
    const typeInfo = getClassTypeInfo(classItem.type);
    const levelInfo = getLevelInfo(classItem.level);
    const dateTime = formatDateTime(classItem.date, classItem.time);
    const occupancyPercentage = (classItem.enrolled / classItem.capacity) * 100;

    return (
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
          marginBottom: SPACING.lg,
        }}
      >
        <Card style={{ elevation: 4, borderRadius: 16, overflow: 'hidden' }}>
          <LinearGradient
            colors={[typeInfo.color + '15', typeInfo.color + '05']}
            style={{ padding: SPACING.lg }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm }}>
                  <MaterialIcons name={typeInfo.icon} size={24} color={typeInfo.color} />
                  <Text style={[TEXT_STYLES.h3, { marginLeft: SPACING.sm, flex: 1 }]}>
                    {classItem.name}
                  </Text>
                  {classItem.status === 'upcoming' && (
                    <Chip
                      mode="flat"
                      compact
                      style={{ backgroundColor: COLORS.success + '20' }}
                      textStyle={{ color: COLORS.success, fontSize: 12 }}
                    >
                      Upcoming
                    </Chip>
                  )}
                </View>
                
                <Text style={[TEXT_STYLES.caption, { marginBottom: SPACING.md }]}>
                  {classItem.description}
                </Text>
                
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: SPACING.md }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: SPACING.lg, marginBottom: SPACING.xs }}>
                    <MaterialIcons name="schedule" size={16} color={COLORS.text.secondary} />
                    <Text style={[TEXT_STYLES.caption, { marginLeft: SPACING.xs }]}>
                      {dateTime.date} at {dateTime.time}
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: SPACING.lg, marginBottom: SPACING.xs }}>
                    <MaterialIcons name="timer" size={16} color={COLORS.text.secondary} />
                    <Text style={[TEXT_STYLES.caption, { marginLeft: SPACING.xs }]}>
                      {classItem.duration} min
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.xs }}>
                    <MaterialIcons name="attach-money" size={16} color={COLORS.text.secondary} />
                    <Text style={[TEXT_STYLES.caption, { marginLeft: SPACING.xs }]}>
                      ${classItem.price}
                    </Text>
                  </View>
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.md }}>
                  <Chip
                    mode="outlined"
                    compact
                    style={{ marginRight: SPACING.sm }}
                    textStyle={{ color: levelInfo.color }}
                  >
                    {levelInfo.label}
                  </Chip>
                  <Chip
                    mode="outlined"
                    compact
                    textStyle={{ color: typeInfo.color }}
                  >
                    {typeInfo.name}
                  </Chip>
                </View>

                {/* Occupancy */}
                <View style={{ marginBottom: SPACING.md }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.xs }}>
                    <Text style={TEXT_STYLES.caption}>
                      Participants: {classItem.enrolled}/{classItem.capacity}
                    </Text>
                    <Text style={[TEXT_STYLES.caption, { color: getOccupancyColor(classItem.enrolled, classItem.capacity) }]}>
                      {occupancyPercentage.toFixed(0)}% Full
                    </Text>
                  </View>
                  <ProgressBar
                    progress={occupancyPercentage / 100}
                    color={getOccupancyColor(classItem.enrolled, classItem.capacity)}
                    style={{ height: 6, borderRadius: 3 }}
                  />
                </View>

                {/* Action Buttons */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Button
                    mode="contained"
                    onPress={() => {
                      setSelectedClass(classItem);
                      setShowClassDetail(true);
                    }}
                    style={{ flex: 1, marginRight: SPACING.sm }}
                    contentStyle={{ paddingVertical: SPACING.xs }}
                    icon="visibility"
                  >
                    View Details
                  </Button>
                  <IconButton
                    icon="people"
                    size={20}
                    onPress={() => {
                      setSelectedClass(classItem);
                      setShowParticipants(true);
                    }}
                    style={{ backgroundColor: COLORS.surface }}
                  />
                  <IconButton
                    icon="dots-vertical"
                    size={20}
                    onPress={() => showClassActions(classItem)}
                    style={{ backgroundColor: COLORS.surface }}
                  />
                </View>
              </View>
            </View>
          </LinearGradient>
        </Card>
      </Animated.View>
    );
  };

  const showClassActions = (classItem) => {
    Alert.alert(
      'Class Actions',
      `What would you like to do with "${classItem.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Edit Class', onPress: () => editClass(classItem) },
        { text: 'Duplicate Class', onPress: () => duplicateClass(classItem) },
        classItem.status === 'upcoming' && {
          text: 'Cancel Class',
          style: 'destructive',
          onPress: () => cancelClass(classItem)
        },
      ].filter(Boolean)
    );
  };

  const editClass = (classItem) => {
    setNewClass({...classItem});
    setShowCreateModal(true);
  };

  const renderCreateClassModal = () => (
    <Portal>
      <Modal
        visible={showCreateModal}
        onDismiss={() => setShowCreateModal(false)}
        contentContainerStyle={{
          backgroundColor: COLORS.background,
          margin: SPACING.lg,
          borderRadius: 16,
          maxHeight: '90%',
        }}
      >
        <ScrollView style={{ padding: SPACING.lg }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.lg }}>
            <Text style={TEXT_STYLES.h2}>Create New Class</Text>
            <IconButton
              icon="close"
              size={24}
              onPress={() => setShowCreateModal(false)}
            />
          </View>

          <TextInput
            mode="outlined"
            label="Class Name"
            value={newClass.name}
            onChangeText={(text) => setNewClass(prev => ({...prev, name: text}))}
            style={{ marginBottom: SPACING.md }}
            right={<TextInput.Icon icon="fitness-center" />}
          />

          <TextInput
            mode="outlined"
            label="Description"
            value={newClass.description}
            onChangeText={(text) => setNewClass(prev => ({...prev, description: text}))}
            multiline
            numberOfLines={3}
            style={{ marginBottom: SPACING.md }}
          />

          <View style={{ flexDirection: 'row', marginBottom: SPACING.md }}>
            <TextInput
              mode="outlined"
              label="Capacity"
              value={newClass.capacity.toString()}
              onChangeText={(text) => setNewClass(prev => ({...prev, capacity: parseInt(text) || 0}))}
              keyboardType="numeric"
              style={{ flex: 1, marginRight: SPACING.sm }}
              right={<TextInput.Icon icon="people" />}
            />
            <TextInput
              mode="outlined"
              label="Duration (min)"
              value={newClass.duration.toString()}
              onChangeText={(text) => setNewClass(prev => ({...prev, duration: parseInt(text) || 0}))}
              keyboardType="numeric"
              style={{ flex: 1, marginLeft: SPACING.sm }}
              right={<TextInput.Icon icon="timer" />}
            />
          </View>

          <TextInput
            mode="outlined"
            label="Price ($)"
            value={newClass.price.toString()}
            onChangeText={(text) => setNewClass(prev => ({...prev, price: parseFloat(text) || 0}))}
            keyboardType="numeric"
            style={{ marginBottom: SPACING.md }}
            right={<TextInput.Icon icon="attach-money" />}
          />

          <View style={{ flexDirection: 'row', marginBottom: SPACING.md }}>
            <TextInput
              mode="outlined"
              label="Date (YYYY-MM-DD)"
              value={newClass.date}
              onChangeText={(text) => setNewClass(prev => ({...prev, date: text}))}
              placeholder="2025-08-20"
              style={{ flex: 1, marginRight: SPACING.sm }}
              right={<TextInput.Icon icon="calendar-today" />}
            />
            <TextInput
              mode="outlined"
              label="Time (HH:MM)"
              value={newClass.time}
              onChangeText={(text) => setNewClass(prev => ({...prev, time: text}))}
              placeholder="07:00"
              style={{ flex: 1, marginLeft: SPACING.sm }}
              right={<TextInput.Icon icon="schedule" />}
            />
          </View>

          <Text style={[TEXT_STYLES.h4, { marginBottom: SPACING.md }]}>Class Type</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: SPACING.lg }}>
            {classTypes.map((type) => (
              <TouchableOpacity
                key={type.id}
                onPress={() => setNewClass(prev => ({...prev, type: type.id}))}
                style={{
                  alignItems: 'center',
                  marginRight: SPACING.md,
                  padding: SPACING.sm,
                  borderRadius: 8,
                  backgroundColor: newClass.type === type.id ? type.color + '20' : COLORS.surface,
                  borderWidth: newClass.type === type.id ? 2 : 1,
                  borderColor: newClass.type === type.id ? type.color : COLORS.border,
                }}
              >
                <MaterialIcons name={type.icon} size={32} color={type.color} />
                <Text style={[TEXT_STYLES.caption, { marginTop: SPACING.xs, textAlign: 'center' }]}>
                  {type.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={[TEXT_STYLES.h4, { marginBottom: SPACING.md }]}>Difficulty Level</Text>
          <RadioButton.Group
            onValueChange={(value) => setNewClass(prev => ({...prev, level: value}))}
            value={newClass.level}
          >
            {levelOptions.map((option) => (
              <View key={option.value} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm }}>
                <RadioButton value={option.value} />
                <Text style={[TEXT_STYLES.body, { color: option.color }]}>{option.label}</Text>
              </View>
            ))}
          </RadioButton.Group>

          <View style={{ flexDirection: 'row', marginTop: SPACING.lg }}>
            <Button
              mode="outlined"
              onPress={() => setShowCreateModal(false)}
              style={{ flex: 1, marginRight: SPACING.sm }}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={createClass}
              style={{ flex: 1, marginLeft: SPACING.sm }}
              icon="add"
            >
              Create Class
            </Button>
          </View>
        </ScrollView>
      </Modal>
    </Portal>
  );

  const renderParticipantsModal = () => (
    <Portal>
      <Modal
        visible={showParticipants}
        onDismiss={() => setShowParticipants(false)}
        contentContainerStyle={{
          backgroundColor: COLORS.background,
          margin: SPACING.lg,
          borderRadius: 16,
          maxHeight: '80%',
        }}
      >
        <View style={{ padding: SPACING.lg }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.lg }}>
            <Text style={TEXT_STYLES.h2}>Class Participants</Text>
            <IconButton
              icon="close"
              size={24}
              onPress={() => setShowParticipants(false)}
            />
          </View>

          {selectedClass?.participants?.length > 0 ? (
            <FlatList
              data={selectedClass.participants}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <Card style={{ marginBottom: SPACING.sm, elevation: 2 }}>
                  <Card.Content style={{ padding: SPACING.md }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Avatar.Text size={40} label={item.avatar} />
                      <View style={{ flex: 1, marginLeft: SPACING.md }}>
                        <Text style={TEXT_STYLES.h4}>{item.name}</Text>
                        <Chip
                          mode="flat"
                          compact
                          style={{
                            backgroundColor: item.status === 'confirmed' ? COLORS.success + '20' : COLORS.warning + '20',
                            alignSelf: 'flex-start',
                            marginTop: SPACING.xs,
                          }}
                          textStyle={{
                            color: item.status === 'confirmed' ? COLORS.success : COLORS.warning,
                            fontSize: 12,
                          }}
                        >
                          {item.status === 'confirmed' ? 'Confirmed' : 'Waitlist'}
                        </Chip>
                      </View>
                      <IconButton
                        icon="message"
                        size={20}
                        onPress={() => {
                          Alert.alert('Feature Coming Soon', 'Messaging participants will be available soon!');
                        }}
                      />
                    </View>
                  </Card.Content>
                </Card>
              )}
            />
          ) : (
            <View style={{ alignItems: 'center', padding: SPACING.xl }}>
              <MaterialIcons name="people-outline" size={64} color={COLORS.text.secondary} />
              <Text style={[TEXT_STYLES.h3, { marginTop: SPACING.md, textAlign: 'center' }]}>
                No Participants Yet
              </Text>
              <Text style={[TEXT_STYLES.body, { textAlign: 'center', marginTop: SPACING.sm }]}>
                Participants will appear here once they book this class
              </Text>
            </View>
          )}
        </View>
      </Modal>
    </Portal>
  );

  const filteredClasses = getFilteredClasses();

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={{ paddingTop: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight + 20 }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', padding: SPACING.lg }}>
          <IconButton
            icon="arrow-back"
            size={24}
            iconColor="white"
            onPress={() => navigation.goBack()}
          />
          <Text style={[TEXT_STYLES.h1, { color: 'white', flex: 1, marginLeft: SPACING.sm }]}>
            Group Classes 🏃‍♀️
          </Text>
          <IconButton
            icon="calendar-today"
            size={24}
            iconColor="white"
            onPress={() => {
              Alert.alert('Feature Coming Soon', 'Calendar view will be available in the next update!');
            }}
          />
        </View>
      </LinearGradient>

      <View style={{ flex: 1, padding: SPACING.lg }}>
        <Searchbar
          placeholder="Search classes..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={{ marginBottom: SPACING.lg, elevation: 2 }}
          icon="search"
        />

        {renderTabBar()}

        <ScrollView
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
          {/* Quick Stats */}
          <Surface style={{ 
            padding: SPACING.lg, 
            borderRadius: 12, 
            marginBottom: SPACING.lg,
            elevation: 2 
          }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
              <View style={{ alignItems: 'center' }}>
                <Text style={[TEXT_STYLES.h2, { color: COLORS.primary }]}>
                  {mockClasses.filter(c => c.status === 'upcoming').length}
                </Text>
                <Text style={[TEXT_STYLES.caption, { color: COLORS.text.secondary }]}>
                  Upcoming
                </Text>
              </View>
              <Divider style={{ width: 1, height: 40 }} />
              <View style={{ alignItems: 'center' }}>
                <Text style={[TEXT_STYLES.h2, { color: COLORS.success }]}>
                  {mockClasses.reduce((sum, c) => sum + c.enrolled, 0)}
                </Text>
                <Text style={[TEXT_STYLES.caption, { color: COLORS.text.secondary }]}>
                  Total Enrolled
                </Text>
              </View>
              <Divider style={{ width: 1, height: 40 }} />
              <View style={{ alignItems: 'center' }}>
                <Text style={[TEXT_STYLES.h2, { color: COLORS.warning }]}>
                  ${mockClasses.reduce((sum, c) => sum + (c.enrolled * c.price), 0)}
                </Text>
                <Text style={[TEXT_STYLES.caption, { color: COLORS.text.secondary }]}>
                  Revenue
                </Text>
              </View>
            </View>
          </Surface>

          {/* Classes List */}
          {filteredClasses.length > 0 ? (
            filteredClasses.map((classItem, index) => (
              <View key={classItem.id}>
                {renderClassCard({ item: classItem })}
              </View>
            ))
          ) : (
            <Surface style={{ 
              padding: SPACING.xl, 
              borderRadius: 12, 
              alignItems: 'center',
              marginTop: SPACING.xl 
            }}>
              <MaterialIcons name="event-busy" size={64} color={COLORS.text.secondary} />
              <Text style={[TEXT_STYLES.h3, { marginTop: SPACING.md, textAlign: 'center' }]}>
                No Classes Found
              </Text>
              <Text style={[TEXT_STYLES.body, { textAlign: 'center', marginTop: SPACING.sm }]}>
                {searchQuery 
                  ? 'Try adjusting your search terms' 
                  : selectedTab === 'upcoming' 
                    ? 'Create your first group class to get started'
                    : 'No classes in this category yet'
                }
              </Text>
              {!searchQuery && selectedTab === 'upcoming' && (
                <Button
                  mode="contained"
                  onPress={() => setShowCreateModal(true)}
                  style={{ marginTop: SPACING.lg }}
                  icon="add"
                >
                  Create First Class
                </Button>
              )}
            </Surface>
          )}
        </ScrollView>
      </View>

      {/* Class Detail Modal */}
      <Portal>
        <Modal
          visible={showClassDetail}
          onDismiss={() => setShowClassDetail(false)}
          contentContainerStyle={{
            backgroundColor: COLORS.background,
            margin: SPACING.lg,
            borderRadius: 16,
            maxHeight: '90%',
          }}
        >
          {selectedClass && (
            <ScrollView style={{ padding: SPACING.lg }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.lg }}>
                <Text style={TEXT_STYLES.h2}>Class Details</Text>
                <IconButton
                  icon="close"
                  size={24}
                  onPress={() => setShowClassDetail(false)}
                />
              </View>

              <LinearGradient
                colors={[getClassTypeInfo(selectedClass.type).color + '20', getClassTypeInfo(selectedClass.type).color + '10']}
                style={{ padding: SPACING.lg, borderRadius: 12, marginBottom: SPACING.lg }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.md }}>
                  <MaterialIcons 
                    name={getClassTypeInfo(selectedClass.type).icon} 
                    size={32} 
                    color={getClassTypeInfo(selectedClass.type).color} 
                  />
                  <Text style={[TEXT_STYLES.h2, { marginLeft: SPACING.md, flex: 1 }]}>
                    {selectedClass.name}
                  </Text>
                </View>
                <Text style={[TEXT_STYLES.body, { marginBottom: SPACING.md }]}>
                  {selectedClass.description}
                </Text>
                
                <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                  <Chip mode="flat" compact style={{ margin: SPACING.xs }}>
                    📅 {formatDateTime(selectedClass.date, selectedClass.time).date}
                  </Chip>
                  <Chip mode="flat" compact style={{ margin: SPACING.xs }}>
                    🕐 {formatDateTime(selectedClass.date, selectedClass.time).time}
                  </Chip>
                  <Chip mode="flat" compact style={{ margin: SPACING.xs }}>
                    ⏱️ {selectedClass.duration} min
                  </Chip>
                  <Chip mode="flat" compact style={{ margin: SPACING.xs }}>
                    💰 ${selectedClass.price}
                  </Chip>
                </View>
              </LinearGradient>

              {/* Participants Overview */}
              <Card style={{ marginBottom: SPACING.lg, elevation: 2 }}>
                <Card.Content style={{ padding: SPACING.lg }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md }}>
                    <Text style={TEXT_STYLES.h3}>Participants</Text>
                    <Chip mode="flat" compact>
                      {selectedClass.enrolled}/{selectedClass.capacity}
                    </Chip>
                  </View>
                  
                  <ProgressBar
                    progress={(selectedClass.enrolled / selectedClass.capacity)}
                    color={getOccupancyColor(selectedClass.enrolled, selectedClass.capacity)}
                    style={{ height: 8, borderRadius: 4, marginBottom: SPACING.md }}
                  />

                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Button
                      mode="outlined"
                      onPress={() => {
                        setShowClassDetail(false);
                        setShowParticipants(true);
                      }}
                      style={{ flex: 1, marginRight: SPACING.sm }}
                      icon="people"
                    >
                      View All
                    </Button>
                    <Button
                      mode="contained"
                      onPress={() => {
                        Alert.alert('Feature Coming Soon', 'Adding participants manually will be available soon!');
                      }}
                      style={{ flex: 1, marginLeft: SPACING.sm }}
                      icon="person-add"
                    >
                      Add Participant
                    </Button>
                  </View>
                </Card.Content>
              </Card>

              {/* Equipment Needed */}
              {selectedClass.equipment && selectedClass.equipment.length > 0 && (
                <Card style={{ marginBottom: SPACING.lg, elevation: 2 }}>
                  <Card.Content style={{ padding: SPACING.lg }}>
                    <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md }]}>
                      Equipment Needed
                    </Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                      {selectedClass.equipment.map((item, index) => (
                        <Chip
                          key={index}
                          mode="outlined"
                          compact
                          style={{ margin: SPACING.xs }}
                          icon="fitness-center"
                        >
                          {item}
                        </Chip>
                      ))}
                    </View>
                  </Card.Content>
                </Card>
              )}

              {/* Class Actions */}
              <View style={{ flexDirection: 'row', marginTop: SPACING.lg }}>
                <Button
                  mode="outlined"
                  onPress={() => editClass(selectedClass)}
                  style={{ flex: 1, marginRight: SPACING.sm }}
                  icon="edit"
                >
                  Edit Class
                </Button>
                <Button
                  mode="contained"
                  onPress={() => duplicateClass(selectedClass)}
                  style={{ flex: 1, marginLeft: SPACING.sm }}
                  icon="content-copy"
                >
                  Duplicate
                </Button>
              </View>

              {selectedClass.status === 'upcoming' && (
                <Button
                  mode="outlined"
                  onPress={() => cancelClass(selectedClass)}
                  style={{ marginTop: SPACING.md }}
                  icon="cancel"
                  textColor={COLORS.error}
                >
                  Cancel Class
                </Button>
              )}
            </ScrollView>
          )}
        </Modal>
      </Portal>

      {renderParticipantsModal()}
      {renderCreateClassModal()}

      {/* Floating Action Button */}
      <FAB
        icon="add"
        style={{
          position: 'absolute',
          margin: SPACING.lg,
          right: 0,
          bottom: 0,
          backgroundColor: COLORS.primary,
        }}
        onPress={() => {
          setShowCreateModal(true);
          Vibration.vibrate(50);
        }}
      />
    </View>
  );
};

export default GroupClasses;