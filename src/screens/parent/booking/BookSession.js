import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  Alert,
  TextInput,
  Switch,
  ActivityIndicator,
  Dimensions,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { COLORS } from '../../../styles/colors';

const { width, height } = Dimensions.get('window');

const BookSession = ({ navigation, route }) => {
  const trainer = route?.params?.trainer;

// Add a safety check
if (!trainer) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Book Session</Text>
        <View style={{ width: 24 }} />
      </View>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 16, color: '#666' }}>
          No trainer selected. Please go back and select a trainer.
        </Text>
        <TouchableOpacity 
          style={{ marginTop: 20, padding: 10, backgroundColor: COLORS.primary, borderRadius: 8 }}
          onPress={() => navigation.goBack()}
        >
          <Text style={{ color: '#fff' }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
  
  // Booking form states
  const [selectedChild, setSelectedChild] = useState(null);
  const [sessionType, setSessionType] = useState('individual'); // 'individual' or 'group'
  const [sessionDuration, setSessionDuration] = useState(60); // minutes
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [sessionGoals, setSessionGoals] = useState([]);
  const [specialRequests, setSpecialRequests] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringFrequency, setRecurringFrequency] = useState('weekly');
  const [recurringWeeks, setRecurringWeeks] = useState(4);
  const [location, setLocation] = useState('trainer_facility');
  const [customLocation, setCustomLocation] = useState('');
  
  // UI states
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [bookingStep, setBookingStep] = useState(1); // 1, 2, 3, 4
  const [totalCost, setTotalCost] = useState(0);

  // Mock data
  const children = [
    { id: '1', name: 'Alex Johnson', age: 12, sport: 'Football', avatar: 'https://via.placeholder.com/50x50' },
    { id: '2', name: 'Maya Johnson', age: 9, sport: 'Tennis', avatar: 'https://via.placeholder.com/50x50' },
  ];

  const sessionGoalOptions = [
    'Skill Development',
    'Fitness Improvement',
    'Competition Preparation',
    'Technique Correction',
    'Mental Training',
    'Injury Recovery',
    'Fun & Enjoyment',
    'Team Building'
  ];

  const timeSlots = [
    '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM',
    '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM',
    '06:00 PM', '07:00 PM'
  ];

  const sessionTypes = [
    {
      id: 'individual',
      name: 'Individual Session',
      description: 'One-on-one personalized training',
      price: trainer.sessionRate,
      duration: '60 minutes',
      icon: 'person-outline'
    },
    {
      id: 'group',
      name: 'Group Session',
      description: 'Small group training (2-6 players)',
      price: Math.round(trainer.sessionRate * 0.7),
      duration: '60-90 minutes',
      icon: 'people-outline'
    }
  ];

  const locationOptions = [
    {
      id: 'trainer_facility',
      name: "Trainer's Facility",
      description: trainer.location,
      price: 0,
      icon: 'business-outline'
    },
    {
      id: 'public_facility',
      name: 'Public Facility',
      description: 'Nearby sports centers',
      price: 200,
      icon: 'location-outline'
    },
    {
      id: 'home_visit',
      name: 'Home Visit',
      description: 'Trainer comes to you',
      price: 500,
      icon: 'home-outline'
    },
    {
      id: 'custom',
      name: 'Custom Location',
      description: 'Specify your preferred location',
      price: 300,
      icon: 'pin-outline'
    }
  ];

  useEffect(() => {
    loadAvailableSlots();
    calculateTotalCost();
  }, [selectedDate, sessionType, sessionDuration, isRecurring, recurringWeeks, location]);

  const loadAvailableSlots = async () => {
    setIsLoading(true);
    try {
      // Simulate API call to get available slots
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock available slots (randomly available)
      const mockSlots = timeSlots.filter(() => Math.random() > 0.3);
      setAvailableSlots(mockSlots);
    } catch (error) {
      Alert.alert('Error', 'Failed to load available time slots');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateTotalCost = () => {
    const sessionTypeData = sessionTypes.find(type => type.id === sessionType);
    const locationData = locationOptions.find(loc => loc.id === location);
    
    let baseCost = sessionTypeData?.price || 0;
    let locationCost = locationData?.price || 0;
    
    // Duration multiplier (base is 60 minutes)
    const durationMultiplier = sessionDuration / 60;
    baseCost *= durationMultiplier;
    
    let total = baseCost + locationCost;
    
    if (isRecurring) {
      total *= recurringWeeks;
      // Apply recurring discount
      total *= 0.9; // 10% discount for recurring sessions
    }
    
    setTotalCost(total);
  };

  const handleDateChange = (event, date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (date) {
      setSelectedDate(date);
      setSelectedTimeSlot(null); // Reset time slot when date changes
    }
  };

  const toggleGoal = (goal) => {
    setSessionGoals(prev => 
      prev.includes(goal) 
        ? prev.filter(g => g !== goal)
        : [...prev, goal]
    );
  };

  const validateBooking = () => {
    if (!selectedChild) {
      Alert.alert('Missing Information', 'Please select a child for the session');
      return false;
    }
    
    if (!selectedTimeSlot) {
      Alert.alert('Missing Information', 'Please select a time slot');
      return false;
    }
    
    if (location === 'custom' && !customLocation.trim()) {
      Alert.alert('Missing Information', 'Please specify the custom location');
      return false;
    }
    
    return true;
  };

  const handleBookSession = async () => {
    if (!validateBooking()) return;
    
    setIsLoading(true);
    
    try {
      // Simulate booking API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setShowConfirmation(true);
    } catch (error) {
      Alert.alert('Booking Failed', 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {[1, 2, 3, 4].map(step => (
        <View key={step} style={styles.stepContainer}>
          <View style={[
            styles.stepCircle,
            bookingStep >= step && styles.stepCircleActive
          ]}>
            <Text style={[
              styles.stepNumber,
              bookingStep >= step && styles.stepNumberActive
            ]}>
              {step}
            </Text>
          </View>
          <Text style={styles.stepLabel}>
            {step === 1 ? 'Child' : step === 2 ? 'Session' : step === 3 ? 'Schedule' : 'Payment'}
          </Text>
          {step < 4 && <View style={styles.stepConnector} />}
        </View>
      ))}
    </View>
  );

  const renderChildSelection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Select Child</Text>
      {children.map(child => (
        <TouchableOpacity
          key={child.id}
          style={[
            styles.childCard,
            selectedChild?.id === child.id && styles.childCardSelected
          ]}
          onPress={() => setSelectedChild(child)}
        >
          <Image source={{ uri: child.avatar }} style={styles.childAvatar} />
          <View style={styles.childInfo}>
            <Text style={styles.childName}>{child.name}</Text>
            <Text style={styles.childDetails}>{child.age} years • {child.sport}</Text>
          </View>
          <View style={[
            styles.radioButton,
            selectedChild?.id === child.id && styles.radioButtonSelected
          ]}>
            {selectedChild?.id === child.id && <View style={styles.radioButtonInner} />}
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderSessionType = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Session Type</Text>
      {sessionTypes.map(type => (
        <TouchableOpacity
          key={type.id}
          style={[
            styles.sessionTypeCard,
            sessionType === type.id && styles.sessionTypeCardSelected
          ]}
          onPress={() => setSessionType(type.id)}
        >
          <View style={styles.sessionTypeHeader}>
            <View style={styles.sessionTypeInfo}>
              <Icon name={type.icon} size={24} color={sessionType === type.id ? COLORS.primary : '#666'} />
              <View style={styles.sessionTypeText}>
                <Text style={[
                  styles.sessionTypeName,
                  sessionType === type.id && styles.sessionTypeNameSelected
                ]}>
                  {type.name}
                </Text>
                <Text style={styles.sessionTypeDescription}>{type.description}</Text>
                <Text style={styles.sessionTypeDuration}>{type.duration}</Text>
              </View>
            </View>
            <Text style={[
              styles.sessionTypePrice,
              sessionType === type.id && styles.sessionTypePriceSelected
            ]}>
              KSh {type.price}
            </Text>
          </View>
        </TouchableOpacity>
      ))}
      
      {/* Duration Selector */}
      <View style={styles.durationSection}>
        <Text style={styles.subsectionTitle}>Session Duration</Text>
        <View style={styles.durationButtons}>
          {[30, 60, 90, 120].map(duration => (
            <TouchableOpacity
              key={duration}
              style={[
                styles.durationButton,
                sessionDuration === duration && styles.durationButtonSelected
              ]}
              onPress={() => setSessionDuration(duration)}
            >
              <Text style={[
                styles.durationButtonText,
                sessionDuration === duration && styles.durationButtonTextSelected
              ]}>
                {duration} min
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

  const renderScheduling = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Schedule Session</Text>
      
      {/* Date Selection */}
      <TouchableOpacity 
        style={styles.dateButton}
        onPress={() => setShowDatePicker(true)}
      >
        <Icon name="calendar-outline" size={20} color="#666" />
        <Text style={styles.dateButtonText}>
          {selectedDate.toLocaleDateString('en-US', { 
            weekday: 'long', 
            month: 'long', 
            day: 'numeric' 
          })}
        </Text>
        <Icon name="chevron-down" size={20} color="#666" />
      </TouchableOpacity>

      {/* Time Slots */}
      <Text style={styles.subsectionTitle}>Available Time Slots</Text>
      {isLoading ? (
        <View style={styles.loadingSlots}>
          <ActivityIndicator size="small" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading available slots...</Text>
        </View>
      ) : (
        <View style={styles.timeSlots}>
          {availableSlots.map(slot => (
            <TouchableOpacity
              key={slot}
              style={[
                styles.timeSlot,
                selectedTimeSlot === slot && styles.timeSlotSelected
              ]}
              onPress={() => setSelectedTimeSlot(slot)}
            >
              <Text style={[
                styles.timeSlotText,
                selectedTimeSlot === slot && styles.timeSlotTextSelected
              ]}>
                {slot}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Recurring Sessions */}
      <View style={styles.recurringSection}>
        <View style={styles.recurringHeader}>
          <Text style={styles.subsectionTitle}>Recurring Sessions</Text>
          <Switch
            value={isRecurring}
            onValueChange={setIsRecurring}
            trackColor={{ false: '#e9ecef', true: COLORS.primary }}
            thumbColor="#fff"
          />
        </View>
        
        {isRecurring && (
          <View style={styles.recurringOptions}>
            <View style={styles.recurringRow}>
              <Text style={styles.recurringLabel}>Frequency:</Text>
              <View style={styles.frequencyButtons}>
                {['weekly', 'biweekly'].map(freq => (
                  <TouchableOpacity
                    key={freq}
                    style={[
                      styles.frequencyButton,
                      recurringFrequency === freq && styles.frequencyButtonSelected
                    ]}
                    onPress={() => setRecurringFrequency(freq)}
                  >
                    <Text style={[
                      styles.frequencyButtonText,
                      recurringFrequency === freq && styles.frequencyButtonTextSelected
                    ]}>
                      {freq === 'weekly' ? 'Weekly' : 'Bi-weekly'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            <View style={styles.recurringRow}>
              <Text style={styles.recurringLabel}>Number of weeks:</Text>
              <View style={styles.weeksSelector}>
                {[4, 8, 12, 16].map(weeks => (
                  <TouchableOpacity
                    key={weeks}
                    style={[
                      styles.weeksButton,
                      recurringWeeks === weeks && styles.weeksButtonSelected
                    ]}
                    onPress={() => setRecurringWeeks(weeks)}
                  >
                    <Text style={[
                      styles.weeksButtonText,
                      recurringWeeks === weeks && styles.weeksButtonTextSelected
                    ]}>
                      {weeks}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        )}
      </View>

      {/* Location */}
      <Text style={styles.subsectionTitle}>Location</Text>
      {locationOptions.map(loc => (
        <TouchableOpacity
          key={loc.id}
          style={[
            styles.locationCard,
            location === loc.id && styles.locationCardSelected
          ]}
          onPress={() => setLocation(loc.id)}
        >
          <Icon 
            name={loc.icon} 
            size={20} 
            color={location === loc.id ? COLORS.primary : '#666'} 
          />
          <View style={styles.locationInfo}>
            <Text style={[
              styles.locationName,
              location === loc.id && styles.locationNameSelected
            ]}>
              {loc.name}
            </Text>
            <Text style={styles.locationDescription}>{loc.description}</Text>
          </View>
          <Text style={styles.locationPrice}>
            {loc.price > 0 ? `+KSh ${loc.price}` : 'Free'}
          </Text>
        </TouchableOpacity>
      ))}
      
      {location === 'custom' && (
        <TextInput
          style={styles.customLocationInput}
          placeholder="Enter custom location address..."
          value={customLocation}
          onChangeText={setCustomLocation}
          multiline
        />
      )}
    </View>
  );

  const renderGoalsAndRequests = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Session Goals</Text>
      <View style={styles.goalsContainer}>
        {sessionGoalOptions.map(goal => (
          <TouchableOpacity
            key={goal}
            style={[
              styles.goalChip,
              sessionGoals.includes(goal) && styles.goalChipSelected
            ]}
            onPress={() => toggleGoal(goal)}
          >
            <Text style={[
              styles.goalChipText,
              sessionGoals.includes(goal) && styles.goalChipTextSelected
            ]}>
              {goal}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      
      <Text style={styles.subsectionTitle}>Special Requests</Text>
      <TextInput
        style={styles.specialRequestsInput}
        placeholder="Any special requests or notes for the trainer..."
        value={specialRequests}
        onChangeText={setSpecialRequests}
        multiline
        numberOfLines={4}
        textAlignVertical="top"
      />
    </View>
  );

  const renderBookingSummary = () => (
    <View style={styles.bookingSummary}>
      <View style={styles.summaryHeader}>
        <Text style={styles.summaryTitle}>Booking Summary</Text>
      </View>
      
      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>Trainer:</Text>
        <Text style={styles.summaryValue}>{trainer.name}</Text>
      </View>
      
      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>Child:</Text>
        <Text style={styles.summaryValue}>{selectedChild?.name}</Text>
      </View>
      
      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>Session Type:</Text>
        <Text style={styles.summaryValue}>
          {sessionTypes.find(t => t.id === sessionType)?.name}
        </Text>
      </View>
      
      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>Duration:</Text>
        <Text style={styles.summaryValue}>{sessionDuration} minutes</Text>
      </View>
      
      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>Date & Time:</Text>
        <Text style={styles.summaryValue}>
          {selectedDate.toLocaleDateString()} at {selectedTimeSlot}
        </Text>
      </View>
      
      {isRecurring && (
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Recurring:</Text>
          <Text style={styles.summaryValue}>
            {recurringFrequency} for {recurringWeeks} weeks
          </Text>
        </View>
      )}
      
      <View style={styles.summaryDivider} />
      
      <View style={styles.summaryRow}>
        <Text style={styles.summaryTotalLabel}>Total Cost:</Text>
        <Text style={styles.summaryTotalValue}>
          KSh {totalCost.toLocaleString()}
        </Text>
      </View>
      
      {isRecurring && (
        <Text style={styles.discountNote}>
          *10% discount applied for recurring sessions
        </Text>
      )}
    </View>
  );

  const ConfirmationModal = () => (
    <Modal
      visible={showConfirmation}
      animationType="slide"
      transparent={true}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.confirmationModal}>
          <Icon name="checkmark-circle" size={80} color="#4CAF50" />
          <Text style={styles.confirmationTitle}>Booking Confirmed!</Text>
          <Text style={styles.confirmationText}>
            Your session with {trainer.name} has been booked successfully.
          </Text>
          <Text style={styles.confirmationDetails}>
            {selectedDate.toLocaleDateString()} at {selectedTimeSlot}
          </Text>
          
          <View style={styles.confirmationButtons}>
            <TouchableOpacity 
              style={styles.viewBookingBtn}
              onPress={() => {
                setShowConfirmation(false);
                navigation.navigate('Schedule');
              }}
            >
              <Text style={styles.viewBookingBtnText}>View Schedule</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.backHomeBtn}
              onPress={() => {
                setShowConfirmation(false);
                navigation.navigate('ParentDashboard');
              }}
            >
              <Text style={styles.backHomeBtnText}>Back to Home</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Book Session</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Trainer Info */}
      <View style={styles.trainerInfo}>
        <Image source={{ uri: trainer.avatar }} style={styles.trainerAvatar} />
        <View style={styles.trainerDetails}>
          <Text style={styles.trainerName}>{trainer.name}</Text>
          <Text style={styles.trainerSpecialty}>{trainer.sport} • {trainer.location}</Text>
          <View style={styles.trainerRating}>
            <Icon name="star" size={14} color="#FFD700" />
            <Text style={styles.ratingText}>{trainer.rating}</Text>
          </View>
        </View>
        <TouchableOpacity 
          style={styles.chatBtn}
          onPress={() => navigation.navigate('CoachChat', { coach: trainer })}
        >
          <Icon name="chatbubble-outline" size={20} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {renderStepIndicator()}

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {renderChildSelection()}
        {renderSessionType()}
        {renderScheduling()}
        {renderGoalsAndRequests()}
        {renderBookingSummary()}
      </ScrollView>

      {/* Bottom Action */}
      <View style={styles.bottomAction}>
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalAmount}>KSh {totalCost.toLocaleString()}</Text>
        </View>
        
        <TouchableOpacity 
          style={[
            styles.bookBtn,
            (!selectedChild || !selectedTimeSlot) && styles.bookBtnDisabled
          ]}
          onPress={handleBookSession}
          disabled={isLoading || !selectedChild || !selectedTimeSlot}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.bookBtnText}>Book Now</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Date Picker */}
      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          minimumDate={new Date()}
          onChange={handleDateChange}
        />
      )}

      <ConfirmationModal />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  backBtn: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  trainerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  trainerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  trainerDetails: {
    flex: 1,
  },
  trainerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  trainerSpecialty: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  trainerRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 3,
  },
  chatBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: '#fff',
  },
  stepContainer: {
    alignItems: 'center',
    position: 'relative',
  },
  stepCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#e9ecef',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  stepCircleActive: {
    backgroundColor: COLORS.primary,
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  stepNumberActive: {
    color: '#fff',
  },
  stepLabel: {
    fontSize: 12,
    color: '#666',
  },
  stepConnector: {
    position: 'absolute',
    top: 15,
    left: 30,
    width: 50,
    height: 1,
    backgroundColor: '#e9ecef',
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: '#fff',
    marginBottom: 10,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 15,
    marginBottom: 10,
  },
  childCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
    marginBottom: 10,
  },
  childCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: '#f0f9ff',
  },
  childAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 15,
  },
  childInfo: {
    flex: 1,
  },
  childName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  childDetails: {
    fontSize: 14,
    color: '#666',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#e9ecef',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: {
    borderColor: COLORS.primary,
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
  },
  sessionTypeCard: {
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
  },
  sessionTypeCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: '#f0f9ff',
  },
  sessionTypeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  sessionTypeInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  sessionTypeText: {
    marginLeft: 15,
    flex: 1,
  },
  sessionTypeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 3,
  },
  sessionTypeNameSelected: {
    color: COLORS.primary,
  },
  sessionTypeDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  sessionTypeDuration: {
    fontSize: 12,
    color: '#999',
  },
  sessionTypePrice: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  sessionTypePriceSelected: {
    color: COLORS.primary,
  },
  durationSection: {
    marginTop: 15,
  },
  durationButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  durationButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e9ecef',
    marginRight: 10,
    marginBottom: 10,
  },
  durationButtonSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
  },
  durationButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  durationButtonTextSelected: {
    color: '#fff',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
    marginBottom: 20,
  },
  dateButtonText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    flex: 1,
    marginLeft: 10,
  },
  loadingSlots: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#666',
  },
  timeSlots: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  timeSlot: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
    marginRight: 10,
    marginBottom: 10,
    minWidth: 80,
    alignItems: 'center',
  },
  timeSlotSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
  },
  timeSlotText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  timeSlotTextSelected: {
    color: '#fff',
  },
  recurringSection: {
    marginTop: 20,
  },
  recurringHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  recurringOptions: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 15,
  },
  recurringRow: {
    marginBottom: 15,
  },
  recurringLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  frequencyButtons: {
    flexDirection: 'row',
  },
  frequencyButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
    marginRight: 10,
  },
  frequencyButtonSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
  },
  frequencyButtonText: {
    fontSize: 14,
    color: '#666',
  },
  frequencyButtonTextSelected: {
    color: '#fff',
  },
  weeksSelector: {
    flexDirection: 'row',
  },
  weeksButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
    marginRight: 10,
    minWidth: 40,
    alignItems: 'center',
  },
  weeksButtonSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
  },
  weeksButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  weeksButtonTextSelected: {
    color: '#fff',
  },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
    marginBottom: 10,
  },
  locationCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: '#f0f9ff',
  },
  locationInfo: {
    flex: 1,
    marginLeft: 15,
  },
  locationName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  locationNameSelected: {
    color: COLORS.primary,
  },
  locationDescription: {
    fontSize: 14,
    color: '#666',
  },
  locationPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  customLocationInput: {
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    color: '#333',
    marginTop: 10,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  goalsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  goalChip: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e9ecef',
    marginRight: 10,
    marginBottom: 10,
  },
  goalChipSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
  },
  goalChipText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  goalChipTextSelected: {
    color: '#fff',
  },
  specialRequestsInput: {
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    color: '#333',
    minHeight: 100,
  },
  bookingSummary: {
    backgroundColor: '#fff',
    marginBottom: 20,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  summaryHeader: {
    marginBottom: 15,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    flex: 1,
    textAlign: 'right',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#e9ecef',
    marginVertical: 15,
  },
  summaryTotalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  summaryTotalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary,
  },
  discountNote: {
    fontSize: 12,
    color: '#4CAF50',
    textAlign: 'center',
    marginTop: 5,
    fontStyle: 'italic',
  },
  bottomAction: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  totalContainer: {
    flex: 1,
  },
  totalLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  bookBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 12,
    minWidth: 120,
    alignItems: 'center',
  },
  bookBtnDisabled: {
    backgroundColor: '#ccc',
  },
  bookBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmationModal: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    marginHorizontal: 20,
    maxWidth: 350,
  },
  confirmationTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginTop: 15,
    marginBottom: 10,
  },
  confirmationText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 10,
  },
  confirmationDetails: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: 30,
  },
  confirmationButtons: {
    width: '100%',
  },
  viewBookingBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  viewBookingBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  backHomeBtn: {
    backgroundColor: '#f8f9fa',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  backHomeBtnText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default BookSession;