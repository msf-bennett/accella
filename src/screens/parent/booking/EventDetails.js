import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  Modal,
  TextInput,
  ActivityIndicator,
  Share,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const EventDetails = ({ route, navigation }) => {
  const { eventId } = route.params;
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showRSVPModal, setShowRSVPModal] = useState(false);
  const [rsvpStatus, setRsvpStatus] = useState('');
  const [notes, setNotes] = useState('');
  const [attendees, setAttendees] = useState([]);
  const [showAttendeesModal, setShowAttendeesModal] = useState(false);

  useEffect(() => {
    loadEventDetails();
  }, [eventId]);

  const loadEventDetails = async () => {
    try {
      setLoading(true);
      // Simulate API call - replace with actual API
      const mockEvent = {
        id: eventId,
        title: 'Regional Football Championship',
        type: 'Tournament',
        date: '2025-08-20',
        time: '09:00',
        endTime: '17:00',
        location: {
          name: 'Nairobi Sports Complex',
          address: '123 Stadium Road, Nairobi',
          coordinates: { lat: -1.2921, lng: 36.8219 }
        },
        description: 'Annual regional championship featuring teams from across Kenya. Players will compete in age-group categories.',
        organizer: {
          name: 'Kenya Football Association',
          contact: '+254 700 123 456',
          email: 'events@kfa.co.ke'
        },
        coach: {
          name: 'John Kimani',
          avatar: 'https://via.placeholder.com/50',
          phone: '+254 700 987 654'
        },
        requirements: [
          'Valid player registration',
          'Medical clearance certificate',
          'Team uniform',
          'Water bottle and snacks'
        ],
        agenda: [
          { time: '09:00', activity: 'Team Check-in & Registration' },
          { time: '10:00', activity: 'Warm-up Sessions' },
          { time: '11:00', activity: 'Group Stage Matches Begin' },
          { time: '13:00', activity: 'Lunch Break' },
          { time: '14:00', activity: 'Knockout Rounds' },
          { time: '16:00', activity: 'Finals & Awards Ceremony' }
        ],
        fees: {
          registration: 1500,
          uniform: 2500,
          transport: 1000
        },
        rsvpDeadline: '2025-08-18',
        attachments: [
          { name: 'Tournament Rules.pdf', size: '2.3 MB' },
          { name: 'Venue Map.jpg', size: '1.1 MB' }
        ],
        childrenRegistered: [
          { name: 'Alex Mwangi', category: 'U-14', status: 'Confirmed' },
          { name: 'Sarah Wanjiku', category: 'U-12', status: 'Pending' }
        ]
      };

      setEvent(mockEvent);
      setRsvpStatus(mockEvent.childrenRegistered[0]?.status || '');
    } catch (error) {
      Alert.alert('Error', 'Failed to load event details');
    } finally {
      setLoading(false);
    }
  };

  const handleRSVP = async (status) => {
    try {
      // API call to update RSVP status
      setRsvpStatus(status);
      setShowRSVPModal(false);
      
      Alert.alert(
        'RSVP Updated',
        `Successfully ${status.toLowerCase()} for ${event.title}`
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to update RSVP');
    }
  };

  const handleShareEvent = async () => {
    try {
      await Share.share({
        message: `Check out this event: ${event.title} on ${event.date} at ${event.location.name}`,
        title: event.title,
      });
    } catch (error) {
      console.error('Error sharing event:', error);
    }
  };

  const openMaps = () => {
    const { lat, lng } = event.location.coordinates;
    const url = `geo:${lat},${lng}?q=${encodeURIComponent(event.location.name)}`;
    Linking.openURL(url);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading event details...</Text>
      </View>
    );
  }

  if (!event) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#FF3B30" />
        <Text style={styles.errorText}>Event not found</Text>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backIcon}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleShareEvent}>
          <Ionicons name="share-outline" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {/* Event Banner */}
      <View style={styles.banner}>
        <View style={styles.eventTypeContainer}>
          <Text style={styles.eventType}>{event.type}</Text>
        </View>
        <Text style={styles.eventTitle}>{event.title}</Text>
        <View style={styles.dateTimeContainer}>
          <Ionicons name="calendar-outline" size={16} color="#666" />
          <Text style={styles.dateTime}>
            {event.date} • {event.time} - {event.endTime}
          </Text>
        </View>
      </View>

      {/* Location */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Location</Text>
        <TouchableOpacity style={styles.locationCard} onPress={openMaps}>
          <View style={styles.locationInfo}>
            <Ionicons name="location-outline" size={20} color="#007AFF" />
            <View style={styles.locationText}>
              <Text style={styles.locationName}>{event.location.name}</Text>
              <Text style={styles.locationAddress}>{event.location.address}</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#666" />
        </TouchableOpacity>
      </View>

      {/* RSVP Status */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Registration Status</Text>
        {event.childrenRegistered.map((child, index) => (
          <View key={index} style={styles.rsvpCard}>
            <View style={styles.childInfo}>
              <Text style={styles.childName}>{child.name}</Text>
              <Text style={styles.childCategory}>{child.category}</Text>
            </View>
            <View style={[styles.statusBadge, 
              child.status === 'Confirmed' ? styles.confirmedBadge : styles.pendingBadge
            ]}>
              <Text style={[styles.statusText,
                child.status === 'Confirmed' ? styles.confirmedText : styles.pendingText
              ]}>
                {child.status}
              </Text>
            </View>
          </View>
        ))}
        <TouchableOpacity 
          style={styles.rsvpButton}
          onPress={() => setShowRSVPModal(true)}
        >
          <Text style={styles.rsvpButtonText}>Update Registration</Text>
        </TouchableOpacity>
      </View>

      {/* Event Description */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About This Event</Text>
        <Text style={styles.description}>{event.description}</Text>
      </View>

      {/* Agenda */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Event Schedule</Text>
        {event.agenda.map((item, index) => (
          <View key={index} style={styles.agendaItem}>
            <Text style={styles.agendaTime}>{item.time}</Text>
            <Text style={styles.agendaActivity}>{item.activity}</Text>
          </View>
        ))}
      </View>

      {/* Requirements */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>What to Bring</Text>
        {event.requirements.map((requirement, index) => (
          <View key={index} style={styles.requirementItem}>
            <Ionicons name="checkmark-circle-outline" size={16} color="#34C759" />
            <Text style={styles.requirementText}>{requirement}</Text>
          </View>
        ))}
      </View>

      {/* Fees */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Event Fees</Text>
        <View style={styles.feesContainer}>
          {Object.entries(event.fees).map(([type, amount]) => (
            <View key={type} style={styles.feeItem}>
              <Text style={styles.feeType}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </Text>
              <Text style={styles.feeAmount}>KSh {amount.toLocaleString()}</Text>
            </View>
          ))}
          <View style={styles.totalFee}>
            <Text style={styles.totalFeeText}>Total</Text>
            <Text style={styles.totalFeeAmount}>
              KSh {Object.values(event.fees).reduce((a, b) => a + b, 0).toLocaleString()}
            </Text>
          </View>
        </View>
      </View>

      {/* Coach Contact */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Coach Contact</Text>
        <View style={styles.coachCard}>
          <Image 
            source={{ uri: event.coach.avatar }} 
            style={styles.coachAvatar}
          />
          <View style={styles.coachInfo}>
            <Text style={styles.coachName}>{event.coach.name}</Text>
            <Text style={styles.coachRole}>Head Coach</Text>
          </View>
          <View style={styles.contactActions}>
            <TouchableOpacity 
              style={styles.contactButton}
              onPress={() => Linking.openURL(`tel:${event.coach.phone}`)}
            >
              <Ionicons name="call-outline" size={20} color="#007AFF" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.contactButton}
              onPress={() => navigation.navigate('CoachChat', { coachId: event.coach.id })}
            >
              <Ionicons name="chatbubble-outline" size={20} color="#007AFF" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Attachments */}
      {event.attachments.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Documents</Text>
          {event.attachments.map((attachment, index) => (
            <TouchableOpacity key={index} style={styles.attachmentItem}>
              <Ionicons name="document-outline" size={20} color="#007AFF" />
              <View style={styles.attachmentInfo}>
                <Text style={styles.attachmentName}>{attachment.name}</Text>
                <Text style={styles.attachmentSize}>{attachment.size}</Text>
              </View>
              <Ionicons name="download-outline" size={20} color="#666" />
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={styles.primaryButton}
          onPress={() => navigation.navigate('CalendarScreen', { 
            eventId: event.id, 
            action: 'add' 
          })}
        >
          <Ionicons name="calendar-outline" size={20} color="white" />
          <Text style={styles.primaryButtonText}>Add to Calendar</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.secondaryButton}
          onPress={() => setShowAttendeesModal(true)}
        >
          <Ionicons name="people-outline" size={20} color="#007AFF" />
          <Text style={styles.secondaryButtonText}>View Attendees</Text>
        </TouchableOpacity>
      </View>

      {/* RSVP Modal */}
      <Modal
        visible={showRSVPModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowRSVPModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Update Registration</Text>
            
            <View style={styles.rsvpOptions}>
              <TouchableOpacity 
                style={[styles.rsvpOption, rsvpStatus === 'Confirmed' && styles.selectedOption]}
                onPress={() => handleRSVP('Confirmed')}
              >
                <Ionicons name="checkmark-circle" size={24} color="#34C759" />
                <Text style={styles.rsvpOptionText}>Confirm Attendance</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.rsvpOption, rsvpStatus === 'Maybe' && styles.selectedOption]}
                onPress={() => handleRSVP('Maybe')}
              >
                <Ionicons name="help-circle" size={24} color="#FF9500" />
                <Text style={styles.rsvpOptionText}>Maybe</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.rsvpOption, rsvpStatus === 'Declined' && styles.selectedOption]}
                onPress={() => handleRSVP('Declined')}
              >
                <Ionicons name="close-circle" size={24} color="#FF3B30" />
                <Text style={styles.rsvpOptionText}>Cannot Attend</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.notesInput}
              placeholder="Add notes (optional)"
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setShowRSVPModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.confirmButton}
                onPress={() => handleRSVP(rsvpStatus)}
              >
                <Text style={styles.confirmButtonText}>Update</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Attendees Modal */}
      <Modal
        visible={showAttendeesModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAttendeesModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Event Attendees</Text>
              <TouchableOpacity onPress={() => setShowAttendeesModal(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.attendeesList}>
              {event.childrenRegistered.map((child, index) => (
                <View key={index} style={styles.attendeeItem}>
                  <View style={styles.attendeeAvatar}>
                    <Text style={styles.attendeeInitial}>
                      {child.name.charAt(0)}
                    </Text>
                  </View>
                  <View style={styles.attendeeInfo}>
                    <Text style={styles.attendeeName}>{child.name}</Text>
                    <Text style={styles.attendeeCategory}>{child.category}</Text>
                  </View>
                  <View style={[styles.statusBadge,
                    child.status === 'Confirmed' ? styles.confirmedBadge : styles.pendingBadge
                  ]}>
                    <Text style={[styles.statusText,
                      child.status === 'Confirmed' ? styles.confirmedText : styles.pendingText
                    ]}>
                      {child.status}
                    </Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FF3B30',
    marginTop: 16,
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backIcon: {
    padding: 8,
  },
  banner: {
    backgroundColor: 'white',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  eventTypeContainer: {
    alignSelf: 'flex-start',
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 12,
  },
  eventType: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  eventTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  dateTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateTime: {
    fontSize: 16,
    color: '#666',
    marginLeft: 8,
  },
  section: {
    backgroundColor: 'white',
    marginTop: 12,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  locationText: {
    marginLeft: 12,
    flex: 1,
  },
  locationName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  locationAddress: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  rsvpCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginBottom: 12,
  },
  childInfo: {
    flex: 1,
  },
  childName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  childCategory: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  confirmedBadge: {
    backgroundColor: '#d4edda',
  },
  pendingBadge: {
    backgroundColor: '#fff3cd',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  confirmedText: {
    color: '#155724',
  },
  pendingText: {
    color: '#856404',
  },
  rsvpButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  rsvpButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  agendaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  agendaTime: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
    width: 60,
  },
  agendaActivity: {
    fontSize: 16,
    color: '#333',
    flex: 1,
    marginLeft: 16,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  requirementText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  feesContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
  },
  feeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  feeType: {
    fontSize: 16,
    color: '#333',
  },
  feeAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  totalFee: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  totalFeeText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  totalFeeAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#007AFF',
  },
  coachCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
  },
  coachAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#e0e0e0',
  },
  coachInfo: {
    flex: 1,
    marginLeft: 12,
  },
  coachName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  coachRole: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  contactActions: {
    flexDirection: 'row',
    gap: 12,
  },
  contactButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e8f4fd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  attachmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginBottom: 8,
  },
  attachmentInfo: {
    flex: 1,
    marginLeft: 12,
  },
  attachmentName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1a1a1a',
  },
  attachmentSize: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  actionButtons: {
    padding: 20,
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#007AFF',
    gap: 8,
  },
  secondaryButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 20,
    padding: 24,
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  rsvpOptions: {
    marginBottom: 20,
  },
  rsvpOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: '#f8f9fa',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedOption: {
    borderColor: '#007AFF',
    backgroundColor: '#e8f4fd',
  },
  rsvpOptionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1a1a1a',
    marginLeft: 12,
  },
  notesInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  confirmButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#007AFF',
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  attendeesList: {
    maxHeight: 300,
  },
  attendeeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  attendeeAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  attendeeInitial: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  attendeeInfo: {
    flex: 1,
    marginLeft: 12,
  },
  attendeeName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1a1a1a',
  },
  attendeeCategory: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
});

export default EventDetails;