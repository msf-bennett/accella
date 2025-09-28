import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
  Modal,
  FlatList,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Calendar } from 'react-native-calendars';
import { COLORS } from '../../../styles/colors';

const { width, height } = Dimensions.get('window');

const BookTrial = ({ navigation, route }) => {
  const { academy, coach, sport } = route.params || {};
  
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedChild, setSelectedChild] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [parentNotes, setParentNotes] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [medicalInfo, setMedicalInfo] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);
  const [showTimeSlots, setShowTimeSlots] = useState(false);
  const [loading, setLoading] = useState(false);

  // Mock data - replace with actual data from your backend
  const [children] = useState([
    {
      id: 1,
      name: 'Sarah Johnson',
      age: 12,
      sport: 'Football',
      image: 'https://via.placeholder.com/60',
      skillLevel: 'Beginner'
    },
    {
      id: 2,
      name: 'Mike Johnson',
      age: 9,
      sport: 'Basketball',
      image: 'https://via.placeholder.com/60',
      skillLevel: 'Intermediate'
    }
  ]);

  const [trialPackages] = useState([
    {
      id: 1,
      name: 'Single Trial Session',
      duration: '1 hour',
      price: 25,
      description: 'One-time trial session to experience our coaching',
      includes: ['Equipment provided', 'Skill assessment', 'Feedback report']
    },
    {
      id: 2,
      name: 'Weekend Trial Package',
      duration: '2 sessions',
      price: 40,
      description: 'Two trial sessions over the weekend',
      includes: ['Equipment provided', 'Skill assessment', 'Progress tracking', 'Nutrition tips']
    },
    {
      id: 3,
      name: 'Weekly Trial',
      duration: '3 sessions',
      price: 60,
      description: 'Full week trial with comprehensive evaluation',
      includes: ['Equipment provided', 'Detailed assessment', 'Custom training plan', 'Parent consultation']
    }
  ]);

  const [availableTimeSlots] = useState([
    '09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'
  ]);

  const markedDates = {
    [selectedDate]: {
      selected: true,
      selectedColor: COLORS.primary,
    },
  };

  const renderStepIndicator = () => {
    const steps = ['Child', 'Package', 'Schedule', 'Details', 'Confirm'];
    
    return (
      <View style={styles.stepIndicator}>
        {steps.map((step, index) => (
          <View key={index} style={styles.stepContainer}>
            <View style={[
              styles.stepCircle,
              { backgroundColor: currentStep > index ? COLORS.primary : COLORS.lightGray }
            ]}>
              <Text style={[
                styles.stepNumber,
                { color: currentStep > index ? COLORS.white : COLORS.gray }
              ]}>
                {index + 1}
              </Text>
            </View>
            <Text style={styles.stepLabel}>{step}</Text>
            {index < steps.length - 1 && (
              <View style={[
                styles.stepLine,
                { backgroundColor: currentStep > index + 1 ? COLORS.primary : COLORS.lightGray }
              ]} />
            )}
          </View>
        ))}
      </View>
    );
  };

  const renderChildSelection = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Select Child</Text>
      <Text style={styles.stepSubtitle}>Choose which child will attend the trial session</Text>
      
      {children.map((child) => (
        <TouchableOpacity
          key={child.id}
          style={[
            styles.childCard,
            selectedChild?.id === child.id && styles.selectedChildCard
          ]}
          onPress={() => setSelectedChild(child)}
        >
          <Image source={{ uri: child.image }} style={styles.childImage} />
          <View style={styles.childInfo}>
            <Text style={styles.childName}>{child.name}</Text>
            <Text style={styles.childDetails}>{child.age} years • {child.sport} • {child.skillLevel}</Text>
          </View>
          {selectedChild?.id === child.id && (
            <Icon name="check-circle" size={24} color={COLORS.primary} />
          )}
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderPackageSelection = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Choose Trial Package</Text>
      <Text style={styles.stepSubtitle}>Select the trial package that best fits your needs</Text>
      
      {trialPackages.map((pkg) => (
        <TouchableOpacity
          key={pkg.id}
          style={[
            styles.packageCard,
            selectedPackage?.id === pkg.id && styles.selectedPackageCard
          ]}
          onPress={() => setSelectedPackage(pkg)}
        >
          <View style={styles.packageHeader}>
            <Text style={styles.packageName}>{pkg.name}</Text>
            <Text style={styles.packagePrice}>${pkg.price}</Text>
          </View>
          <Text style={styles.packageDuration}>{pkg.duration}</Text>
          <Text style={styles.packageDescription}>{pkg.description}</Text>
          
          <View style={styles.packageIncludes}>
            <Text style={styles.includesTitle}>Includes:</Text>
            {pkg.includes.map((item, index) => (
              <View key={index} style={styles.includeItem}>
                <Icon name="check" size={16} color={COLORS.success} />
                <Text style={styles.includeText}>{item}</Text>
              </View>
            ))}
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderScheduleSelection = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Select Date & Time</Text>
      <Text style={styles.stepSubtitle}>Choose your preferred date and time slot</Text>
      
      <TouchableOpacity
        style={styles.dateSelector}
        onPress={() => setShowCalendar(true)}
      >
        <Icon name="calendar" size={20} color={COLORS.primary} />
        <Text style={styles.dateSelectorText}>
          {selectedDate ? selectedDate : 'Select Date'}
        </Text>
        <Icon name="chevron-right" size={20} color={COLORS.gray} />
      </TouchableOpacity>

      {selectedDate && (
        <View style={styles.timeSlotsContainer}>
          <Text style={styles.timeSlotsTitle}>Available Time Slots</Text>
          <View style={styles.timeSlots}>
            {availableTimeSlots.map((time, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.timeSlot,
                  selectedTime === time && styles.selectedTimeSlot
                ]}
                onPress={() => setSelectedTime(time)}
              >
                <Text style={[
                  styles.timeSlotText,
                  selectedTime === time && styles.selectedTimeSlotText
                ]}>
                  {time}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </View>
  );

  const renderDetailsForm = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Additional Details</Text>
      <Text style={styles.stepSubtitle}>Provide any additional information for the trial</Text>
      
      <View style={styles.formField}>
        <Text style={styles.fieldLabel}>Emergency Contact Number</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Enter emergency contact"
          value={emergencyContact}
          onChangeText={setEmergencyContact}
          keyboardType="phone-pad"
        />
      </View>

      <View style={styles.formField}>
        <Text style={styles.fieldLabel}>Medical Information</Text>
        <TextInput
          style={[styles.textInput, styles.multilineInput]}
          placeholder="Any medical conditions, allergies, or special requirements"
          value={medicalInfo}
          onChangeText={setMedicalInfo}
          multiline
          numberOfLines={3}
        />
      </View>

      <View style={styles.formField}>
        <Text style={styles.fieldLabel}>Additional Notes</Text>
        <TextInput
          style={[styles.textInput, styles.multilineInput]}
          placeholder="Any specific goals, concerns, or requests for the trial session"
          value={parentNotes}
          onChangeText={setParentNotes}
          multiline
          numberOfLines={4}
        />
      </View>
    </View>
  );

  const renderConfirmation = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Confirm Booking</Text>
      <Text style={styles.stepSubtitle}>Please review your trial session details</Text>
      
      <View style={styles.confirmationCard}>
        <View style={styles.academyInfo}>
          <Image source={{ uri: academy?.image }} style={styles.academyImage} />
          <View>
            <Text style={styles.academyName}>{academy?.name || 'Elite Sports Academy'}</Text>
            <Text style={styles.coachName}>Coach: {coach?.name || 'John Smith'}</Text>
          </View>
        </View>

        <View style={styles.confirmationSection}>
          <Text style={styles.confirmationLabel}>Child</Text>
          <Text style={styles.confirmationValue}>{selectedChild?.name}</Text>
        </View>

        <View style={styles.confirmationSection}>
          <Text style={styles.confirmationLabel}>Package</Text>
          <Text style={styles.confirmationValue}>{selectedPackage?.name}</Text>
        </View>

        <View style={styles.confirmationSection}>
          <Text style={styles.confirmationLabel}>Date & Time</Text>
          <Text style={styles.confirmationValue}>{selectedDate} at {selectedTime}</Text>
        </View>

        <View style={styles.confirmationSection}>
          <Text style={styles.confirmationLabel}>Duration</Text>
          <Text style={styles.confirmationValue}>{selectedPackage?.duration}</Text>
        </View>

        <View style={styles.confirmationSection}>
          <Text style={styles.confirmationLabel}>Total Cost</Text>
          <Text style={styles.confirmationPrice}>${selectedPackage?.price}</Text>
        </View>
      </View>

      <View style={styles.paymentInfo}>
        <Icon name="information" size={20} color={COLORS.info} />
        <Text style={styles.paymentInfoText}>
          Payment will be processed after the trial session completion
        </Text>
      </View>
    </View>
  );

  const handleNext = () => {
    switch (currentStep) {
      case 1:
        if (!selectedChild) {
          Alert.alert('Error', 'Please select a child');
          return;
        }
        break;
      case 2:
        if (!selectedPackage) {
          Alert.alert('Error', 'Please select a trial package');
          return;
        }
        break;
      case 3:
        if (!selectedDate || !selectedTime) {
          Alert.alert('Error', 'Please select date and time');
          return;
        }
        break;
      case 4:
        if (!emergencyContact) {
          Alert.alert('Error', 'Emergency contact is required');
          return;
        }
        break;
      case 5:
        handleBookTrial();
        return;
    }
    setCurrentStep(currentStep + 1);
  };

  const handleBookTrial = async () => {
    setLoading(true);
    
    // Simulate API call
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      Alert.alert(
        'Booking Confirmed!',
        'Your trial session has been booked successfully. You will receive a confirmation email shortly.',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('ParentDashboard')
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to book trial session. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return renderChildSelection();
      case 2:
        return renderPackageSelection();
      case 3:
        return renderScheduleSelection();
      case 4:
        return renderDetailsForm();
      case 5:
        return renderConfirmation();
      default:
        return renderChildSelection();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={24} color={COLORS.dark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Book Trial Session</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Step Indicator */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.stepIndicatorContainer}>
        {renderStepIndicator()}
      </ScrollView>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderStepContent()}
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        {currentStep > 1 && (
          <TouchableOpacity
            style={styles.backStepButton}
            onPress={() => setCurrentStep(currentStep - 1)}
          >
            <Text style={styles.backStepButtonText}>Previous</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity
          style={[
            styles.nextButton,
            currentStep === 1 && styles.fullWidthButton
          ]}
          onPress={handleNext}
          disabled={loading}
        >
          <Text style={styles.nextButtonText}>
            {loading ? 'Processing...' : currentStep === 5 ? 'Confirm Booking' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Calendar Modal */}
      <Modal visible={showCalendar} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.calendarModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Date</Text>
              <TouchableOpacity onPress={() => setShowCalendar(false)}>
                <Icon name="close" size={24} color={COLORS.dark} />
              </TouchableOpacity>
            </View>
            <Calendar
              onDayPress={(day) => {
                setSelectedDate(day.dateString);
                setShowCalendar(false);
              }}
              markedDates={markedDates}
              minDate={new Date().toISOString().split('T')[0]}
              theme={{
                selectedDayBackgroundColor: COLORS.primary,
                todayTextColor: COLORS.primary,
                arrowColor: COLORS.primary,
              }}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.dark,
  },
  placeholder: {
    width: 34,
  },
  stepIndicatorContainer: {
    paddingVertical: 20,
    paddingHorizontal: 10,
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  stepContainer: {
    alignItems: 'center',
    marginHorizontal: 5,
  },
  stepCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 5,
  },
  stepNumber: {
    fontSize: 12,
    fontWeight: '600',
  },
  stepLabel: {
    fontSize: 10,
    color: COLORS.gray,
    textAlign: 'center',
  },
  stepLine: {
    position: 'absolute',
    top: 15,
    left: 35,
    width: 40,
    height: 2,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  stepContent: {
    paddingBottom: 100,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.dark,
    marginBottom: 5,
  },
  stepSubtitle: {
    fontSize: 14,
    color: COLORS.gray,
    marginBottom: 25,
  },
  childCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: COLORS.lightGray,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedChildCard: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '10',
  },
  childImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  childInfo: {
    flex: 1,
  },
  childName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: 5,
  },
  childDetails: {
    fontSize: 12,
    color: COLORS.gray,
  },
  packageCard: {
    padding: 20,
    backgroundColor: COLORS.lightGray,
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedPackageCard: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '10',
  },
  packageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  packageName: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.dark,
  },
  packagePrice: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.primary,
  },
  packageDuration: {
    fontSize: 12,
    color: COLORS.gray,
    marginBottom: 10,
  },
  packageDescription: {
    fontSize: 14,
    color: COLORS.dark,
    marginBottom: 15,
  },
  packageIncludes: {
    marginTop: 10,
  },
  includesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: 8,
  },
  includeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  includeText: {
    fontSize: 12,
    color: COLORS.gray,
    marginLeft: 8,
  },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: COLORS.lightGray,
    borderRadius: 12,
    marginBottom: 20,
  },
  dateSelectorText: {
    flex: 1,
    fontSize: 16,
    color: COLORS.dark,
    marginLeft: 10,
  },
  timeSlotsContainer: {
    marginTop: 10,
  },
  timeSlotsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: 15,
  },
  timeSlots: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  timeSlot: {
    width: '30%',
    padding: 12,
    backgroundColor: COLORS.lightGray,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  selectedTimeSlot: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  timeSlotText: {
    fontSize: 12,
    color: COLORS.dark,
    fontWeight: '500',
  },
  selectedTimeSlotText: {
    color: COLORS.white,
  },
  formField: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: COLORS.dark,
    backgroundColor: COLORS.white,
  },
  multilineInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  confirmationCard: {
    backgroundColor: COLORS.lightGray,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  academyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray + '30',
  },
  academyImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  academyName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.dark,
  },
  coachName: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 2,
  },
  confirmationSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  confirmationLabel: {
    fontSize: 14,
    color: COLORS.gray,
  },
  confirmationValue: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.dark,
    textAlign: 'right',
    flex: 1,
    marginLeft: 10,
  },
  confirmationPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary,
  },
  paymentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: COLORS.info + '15',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.info,
  },
  paymentInfoText: {
    fontSize: 12,
    color: COLORS.info,
    marginLeft: 10,
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  backStepButton: {
    flex: 1,
    padding: 15,
    backgroundColor: COLORS.lightGray,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 10,
  },
  backStepButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.gray,
  },
  nextButton: {
    flex: 2,
    padding: 15,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    alignItems: 'center',
  },
  fullWidthButton: {
    flex: 1,
    marginRight: 0,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarModal: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
    margin: 20,
    width: width * 0.9,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.dark,
  },
});

export default BookTrial;