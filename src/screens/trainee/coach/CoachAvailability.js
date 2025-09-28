import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StatusBar,
  RefreshControl,
  Alert,
  Animated,
  Vibration,
  TouchableOpacity,
} from 'react-native';
import {
  Card,
  Button,
  Chip,
  Surface,
  IconButton,
  FAB,
  Portal,
  Modal,
  TextInput,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { BlurView } from 'expo-blur';

// Import your established design system
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const CoachAvailability = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, availabilityData } = useSelector(state => state.coach);
  
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [timeSlots, setTimeSlots] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newSlotStart, setNewSlotStart] = useState('');
  const [newSlotEnd, setNewSlotEnd] = useState('');
  const [loading, setLoading] = useState(false);
  
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const daysOfWeek = [
    { key: 'monday', label: 'Mon', fullName: 'Monday' },
    { key: 'tuesday', label: 'Tue', fullName: 'Tuesday' },
    { key: 'wednesday', label: 'Wed', fullName: 'Wednesday' },
    { key: 'thursday', label: 'Thu', fullName: 'Thursday' },
    { key: 'friday', label: 'Fri', fullName: 'Friday' },
    { key: 'saturday', label: 'Sat', fullName: 'Saturday' },
    { key: 'sunday', label: 'Sun', fullName: 'Sunday' },
  ];

  useEffect(() => {
    navigation.setOptions({
      title: 'My Availability',
      headerShown: true,
      headerStyle: {
        backgroundColor: COLORS.primary,
      },
      headerTintColor: '#fff',
      headerTitleStyle: {
        ...TEXT_STYLES.h2,
        color: '#fff',
      },
    });

    // Animation on mount
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
    ]).start();

    loadAvailability();
  }, []);

  const loadAvailability = useCallback(async () => {
    try {
      setLoading(true);
      // Simulate API call - replace with actual implementation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data - replace with actual data from Redux/API
      const mockAvailability = {
        monday: [{ start: '09:00', end: '17:00', id: 1 }],
        tuesday: [{ start: '10:00', end: '18:00', id: 2 }],
        wednesday: [],
        thursday: [{ start: '08:00', end: '16:00', id: 3 }],
        friday: [{ start: '09:00', end: '17:00', id: 4 }],
        saturday: [{ start: '10:00', end: '14:00', id: 5 }],
        sunday: [],
      };
      
      // Dispatch to Redux store
      // dispatch(setAvailability(mockAvailability));
    } catch (error) {
      Alert.alert('Error', 'Failed to load availability data');
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadAvailability();
    setRefreshing(false);
  }, [loadAvailability]);

  const handleDayPress = useCallback((day) => {
    Vibration.vibrate(50);
    setSelectedDay(day);
    // Mock time slots for selected day
    const mockSlots = availabilityData?.[day.key] || [];
    setTimeSlots(mockSlots);
  }, [availabilityData]);

  const handleAddTimeSlot = useCallback(() => {
    if (!newSlotStart || !newSlotEnd) {
      Alert.alert('Validation Error', 'Please enter both start and end times');
      return;
    }
    
    if (newSlotStart >= newSlotEnd) {
      Alert.alert('Validation Error', 'Start time must be before end time');
      return;
    }

    const newSlot = {
      id: Date.now(),
      start: newSlotStart,
      end: newSlotEnd,
    };

    setTimeSlots(prev => [...prev, newSlot]);
    setNewSlotStart('');
    setNewSlotEnd('');
    setModalVisible(false);
    Vibration.vibrate(100);
    
    // TODO: Dispatch to Redux and sync with backend
    Alert.alert('Success! 🎉', 'Time slot added successfully');
  }, [newSlotStart, newSlotEnd]);

  const handleRemoveTimeSlot = useCallback((slotId) => {
    Alert.alert(
      'Remove Time Slot',
      'Are you sure you want to remove this time slot?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            setTimeSlots(prev => prev.filter(slot => slot.id !== slotId));
            Vibration.vibrate(50);
          },
        },
      ]
    );
  }, []);

  const getAvailableHours = (slots) => {
    return slots.reduce((total, slot) => {
      const start = new Date(`2024-01-01T${slot.start}:00`);
      const end = new Date(`2024-01-01T${slot.end}:00`);
      return total + (end - start) / (1000 * 60 * 60);
    }, 0);
  };

  const renderDayCard = ({ item: day }) => {
    const slots = availabilityData?.[day.key] || [];
    const isSelected = selectedDay?.key === day.key;
    const totalHours = getAvailableHours(slots);
    
    return (
      <Animated.View
        style={{
          transform: [{
            translateY: slideAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [50, 0],
            }),
          }],
          opacity: fadeAnim,
        }}
      >
        <TouchableOpacity
          onPress={() => handleDayPress(day)}
          activeOpacity={0.8}
        >
          <Card
            style={{
              margin: SPACING.xs,
              elevation: isSelected ? 8 : 4,
              backgroundColor: isSelected ? COLORS.primary : '#fff',
            }}
          >
            <LinearGradient
              colors={isSelected ? ['#667eea', '#764ba2'] : ['#fff', '#f8f9ff']}
              style={{ padding: SPACING.md, borderRadius: 8 }}
            >
              <View style={{ alignItems: 'center' }}>
                <Text style={{
                  ...TEXT_STYLES.h3,
                  color: isSelected ? '#fff' : COLORS.primary,
                  marginBottom: SPACING.xs,
                }}>
                  {day.label}
                </Text>
                <Text style={{
                  ...TEXT_STYLES.body,
                  color: isSelected ? '#fff' : COLORS.text,
                  opacity: 0.8,
                }}>
                  {slots.length} slots
                </Text>
                <Text style={{
                  ...TEXT_STYLES.caption,
                  color: isSelected ? '#fff' : COLORS.text,
                  opacity: 0.7,
                  marginTop: SPACING.xs,
                }}>
                  {totalHours}h available
                </Text>
              </View>
            </LinearGradient>
          </Card>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderTimeSlot = ({ item: slot }) => (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{
          translateX: slideAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [-50, 0],
          }),
        }],
      }}
    >
      <Surface style={{
        margin: SPACING.xs,
        padding: SPACING.md,
        borderRadius: 12,
        elevation: 2,
      }}>
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <View>
            <Text style={{ ...TEXT_STYLES.h4, color: COLORS.primary }}>
              {slot.start} - {slot.end}
            </Text>
            <Text style={{ ...TEXT_STYLES.caption, color: COLORS.text, opacity: 0.7 }}>
              Duration: {getAvailableHours([slot])}h
            </Text>
          </View>
          <IconButton
            icon="delete"
            iconColor={COLORS.error}
            onPress={() => handleRemoveTimeSlot(slot.id)}
          />
        </View>
      </Surface>
    </Animated.View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <ScrollView
        style={{ flex: 1 }}
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
        {/* Header Stats */}
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={{
            padding: SPACING.lg,
            marginBottom: SPACING.md,
          }}
        >
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-around',
            alignItems: 'center',
          }}>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ ...TEXT_STYLES.h2, color: '#fff' }}>42</Text>
              <Text style={{ ...TEXT_STYLES.caption, color: '#fff', opacity: 0.8 }}>
                Hours/Week
              </Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ ...TEXT_STYLES.h2, color: '#fff' }}>5</Text>
              <Text style={{ ...TEXT_STYLES.caption, color: '#fff', opacity: 0.8 }}>
                Active Days
              </Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ ...TEXT_STYLES.h2, color: '#fff' }}>89%</Text>
              <Text style={{ ...TEXT_STYLES.caption, color: '#fff', opacity: 0.8 }}>
                Booked
              </Text>
            </View>
          </View>
        </LinearGradient>

        {/* Days Selection */}
        <View style={{ paddingHorizontal: SPACING.md }}>
          <Text style={{
            ...TEXT_STYLES.h3,
            color: COLORS.primary,
            marginBottom: SPACING.md,
          }}>
            📅 Select Day to Manage
          </Text>
          
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingRight: SPACING.lg }}
          >
            {daysOfWeek.map((day, index) => renderDayCard({ item: day }))}
          </ScrollView>
        </View>

        {/* Selected Day Details */}
        {selectedDay && (
          <View style={{ padding: SPACING.md, marginTop: SPACING.lg }}>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: SPACING.md,
            }}>
              <Text style={{
                ...TEXT_STYLES.h3,
                color: COLORS.primary,
              }}>
                ⏰ {selectedDay.fullName} Schedule
              </Text>
              <Button
                mode="contained"
                onPress={() => setModalVisible(true)}
                style={{ backgroundColor: COLORS.primary }}
                contentStyle={{ paddingHorizontal: SPACING.md }}
              >
                Add Slot
              </Button>
            </View>

            {timeSlots.length === 0 ? (
              <Card style={{ padding: SPACING.lg, alignItems: 'center' }}>
                <Icon name="schedule" size={48} color={COLORS.primary} />
                <Text style={{
                  ...TEXT_STYLES.h4,
                  color: COLORS.text,
                  textAlign: 'center',
                  marginTop: SPACING.md,
                }}>
                  No time slots set for {selectedDay.fullName}
                </Text>
                <Text style={{
                  ...TEXT_STYLES.body,
                  color: COLORS.text,
                  opacity: 0.7,
                  textAlign: 'center',
                  marginTop: SPACING.xs,
                }}>
                  Tap "Add Slot" to set your availability
                </Text>
              </Card>
            ) : (
              timeSlots.map((slot, index) => (
                <View key={slot.id}>
                  {renderTimeSlot({ item: slot })}
                </View>
              ))
            )}
          </View>
        )}

        {/* Quick Actions */}
        <View style={{ padding: SPACING.md, marginTop: SPACING.lg }}>
          <Text style={{
            ...TEXT_STYLES.h3,
            color: COLORS.primary,
            marginBottom: SPACING.md,
          }}>
            🚀 Quick Actions
          </Text>
          
          <View style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
          }}>
            <Button
              mode="outlined"
              onPress={() => Alert.alert('Feature Coming Soon', 'Copy schedule functionality will be available soon!')}
              style={{ width: '48%', marginBottom: SPACING.md }}
              contentStyle={{ paddingVertical: SPACING.sm }}
            >
              Copy Schedule
            </Button>
            
            <Button
              mode="outlined"
              onPress={() => Alert.alert('Feature Coming Soon', 'Template functionality will be available soon!')}
              style={{ width: '48%', marginBottom: SPACING.md }}
              contentStyle={{ paddingVertical: SPACING.sm }}
            >
              Save Template
            </Button>
            
            <Button
              mode="outlined"
              onPress={() => Alert.alert('Feature Coming Soon', 'Bulk edit functionality will be available soon!')}
              style={{ width: '48%' }}
              contentStyle={{ paddingVertical: SPACING.sm }}
            >
              Bulk Edit
            </Button>
            
            <Button
              mode="outlined"
              onPress={() => Alert.alert('Feature Coming Soon', 'Clear all functionality will be available soon!')}
              style={{ width: '48%' }}
              contentStyle={{ paddingVertical: SPACING.sm }}
            >
              Clear All
            </Button>
          </View>
        </View>
        
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Add Time Slot Modal */}
      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={{
            backgroundColor: 'white',
            padding: SPACING.lg,
            margin: SPACING.lg,
            borderRadius: 16,
          }}
        >
          <BlurView
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
            }}
            blurType="light"
            blurAmount={10}
          />
          
          <View style={{ zIndex: 1 }}>
            <Text style={{
              ...TEXT_STYLES.h3,
              color: COLORS.primary,
              textAlign: 'center',
              marginBottom: SPACING.lg,
            }}>
              ➕ Add Time Slot
            </Text>

            <TextInput
              label="Start Time (HH:MM)"
              value={newSlotStart}
              onChangeText={setNewSlotStart}
              placeholder="09:00"
              mode="outlined"
              style={{ marginBottom: SPACING.md }}
              keyboardType="numeric"
            />

            <TextInput
              label="End Time (HH:MM)"
              value={newSlotEnd}
              onChangeText={setNewSlotEnd}
              placeholder="17:00"
              mode="outlined"
              style={{ marginBottom: SPACING.lg }}
              keyboardType="numeric"
            />

            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-around',
            }}>
              <Button
                mode="outlined"
                onPress={() => setModalVisible(false)}
                style={{ width: '40%' }}
              >
                Cancel
              </Button>
              
              <Button
                mode="contained"
                onPress={handleAddTimeSlot}
                style={{ width: '40%', backgroundColor: COLORS.primary }}
              >
                Add Slot
              </Button>
            </View>
          </View>
        </Modal>
      </Portal>

      {/* Floating Action Button */}
      <FAB
        icon="calendar-plus"
        style={{
          position: 'absolute',
          margin: SPACING.lg,
          right: 0,
          bottom: 0,
          backgroundColor: COLORS.primary,
        }}
        onPress={() => Alert.alert('Feature Coming Soon', 'Quick schedule templates will be available soon!')}
      />
    </View>
  );
};

export default CoachAvailability;