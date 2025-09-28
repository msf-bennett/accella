import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  Image,
  KeyboardAvoidingView,
  Platform,
  ActionSheetIOS,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';

const CoachChat = ({ route, navigation }) => {
  const { coachId, childName } = route.params;
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [coach, setCoach] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState('');
  const [sessionType, setSessionType] = useState('');
  const flatListRef = useRef();

  // Mock coach data
  const mockCoach = {
    id: coachId,
    name: 'Coach Martinez',
    avatar: 'coach_avatar.jpg',
    sport: 'Football',
    academy: 'Elite Sports Academy',
    status: 'online',
    lastSeen: new Date(),
    rating: 4.9,
    responseTime: '~15 mins'
  };

  // Mock messages
  const mockMessages = [
    {
      id: 1,
      senderId: 'coach_123',
      senderName: 'Coach Martinez',
      message: 'Hello! Great session with Alex today. He showed excellent improvement in ball control.',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      type: 'text',
      isCoach: true,
      read: true
    },
    {
      id: 2,
      senderId: 'parent_456',
      senderName: 'Parent',
      message: 'Thank you! We noticed he\'s been practicing at home too. Any specific areas we should focus on?',
      timestamp: new Date(Date.now() - 1.5 * 60 * 60 * 1000),
      type: 'text',
      isCoach: false,
      read: true
    },
    {
      id: 3,
      senderId: 'coach_123',
      senderName: 'Coach Martinez',
      message: 'I\'d suggest working on left-foot passing. Here\'s a drill video that might help.',
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
      type: 'text',
      isCoach: true,
      read: true
    },
    {
      id: 4,
      senderId: 'coach_123',
      senderName: 'Coach Martinez',
      message: '',
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
      type: 'video',
      videoUrl: 'https://example.com/drill_video.mp4',
      videoThumbnail: 'video_thumb.jpg',
      videoDuration: '3:45',
      videoTitle: 'Left Foot Passing Drill',
      isCoach: true,
      read: true
    },
    {
      id: 5,
      senderId: 'parent_456',
      senderName: 'Parent',
      message: 'Perfect! We\'ll work on this over the weekend. Also, would it be possible to schedule an extra session next week?',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      type: 'text',
      isCoach: false,
      read: true
    },
    {
      id: 6,
      senderId: 'coach_123',
      senderName: 'Coach Martinez',
      message: 'Absolutely! I have availability on Wednesday and Friday. Would you prefer morning or afternoon?',
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      type: 'text',
      isCoach: true,
      read: false
    }
  ];

  useEffect(() => {
    loadChatData();
    markMessagesAsRead();
  }, []);

  const loadChatData = async () => {
    // Replace with actual API calls
    setCoach(mockCoach);
    setMessages(mockMessages);
  };

  const markMessagesAsRead = async () => {
    // Mark coach messages as read
    const updatedMessages = messages.map(msg => 
      msg.isCoach ? { ...msg, read: true } : msg
    );
    setMessages(updatedMessages);
  };

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const newMessage = {
      id: Date.now(),
      senderId: 'parent_456',
      senderName: 'Parent',
      message: inputText.trim(),
      timestamp: new Date(),
      type: 'text',
      isCoach: false,
      read: false,
      sending: true
    };

    setMessages(prev => [...prev, newMessage]);
    setInputText('');

    // Simulate sending
    setTimeout(() => {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === newMessage.id 
            ? { ...msg, sending: false, read: true }
            : msg
        )
      );
      
      // Simulate coach typing
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        // Could add mock coach response here
      }, 2000);
    }, 1000);

    // Scroll to bottom
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleAttachment = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Camera', 'Photo Library', 'Document'],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          switch (buttonIndex) {
            case 1:
              openCamera();
              break;
            case 2:
              openImageLibrary();
              break;
            case 3:
              openDocumentPicker();
              break;
          }
        }
      );
    } else {
      // Android implementation
      Alert.alert(
        'Add Attachment',
        'Choose an option',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Camera', onPress: openCamera },
          { text: 'Photo Library', onPress: openImageLibrary },
          { text: 'Document', onPress: openDocumentPicker },
        ]
      );
    }
  };

  const openCamera = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert('Permission required', 'Camera permission is required to take photos.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (!result.canceled) {
      sendImageMessage(result.assets[0]);
    }
  };

  const openImageLibrary = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (!result.canceled) {
      sendImageMessage(result.assets[0]);
    }
  };

  const openDocumentPicker = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled) {
        sendDocumentMessage(result.assets[0]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick document');
    }
  };

  const sendImageMessage = async (image) => {
    const newMessage = {
      id: Date.now(),
      senderId: 'parent_456',
      senderName: 'Parent',
      message: '',
      timestamp: new Date(),
      type: 'image',
      imageUri: image.uri,
      isCoach: false,
      read: false,
      sending: true
    };

    setMessages(prev => [...prev, newMessage]);
    
    // Simulate upload
    setTimeout(() => {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === newMessage.id 
            ? { ...msg, sending: false, read: true }
            : msg
        )
      );
    }, 2000);
  };

  const sendDocumentMessage = async (document) => {
    const newMessage = {
      id: Date.now(),
      senderId: 'parent_456',
      senderName: 'Parent',
      message: '',
      timestamp: new Date(),
      type: 'document',
      documentName: document.name,
      documentSize: document.size,
      documentUri: document.uri,
      isCoach: false,
      read: false,
      sending: true
    };

    setMessages(prev => [...prev, newMessage]);
    
    // Simulate upload
    setTimeout(() => {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === newMessage.id 
            ? { ...msg, sending: false, read: true }
            : msg
        )
      );
    }, 2000);
  };

  const handleBookSession = () => {
    setShowBookingModal(true);
  };

  const confirmBooking = () => {
    if (!selectedTime || !sessionType) {
      Alert.alert('Missing Information', 'Please select time and session type.');
      return;
    }

    Alert.alert(
      'Confirm Booking',
      `Book ${sessionType} session on ${selectedDate.toDateString()} at ${selectedTime}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: () => {
            setShowBookingModal(false);
            
            // Send booking message
            const bookingMessage = {
              id: Date.now(),
              senderId: 'parent_456',
              senderName: 'Parent',
              message: `I'd like to book a ${sessionType} session on ${selectedDate.toDateString()} at ${selectedTime}. Please confirm if this works for you.`,
              timestamp: new Date(),
              type: 'booking',
              bookingDetails: {
                date: selectedDate,
                time: selectedTime,
                sessionType: sessionType,
                status: 'pending'
              },
              isCoach: false,
              read: false
            };

            setMessages(prev => [...prev, bookingMessage]);
            Alert.alert('Success', 'Booking request sent to coach!');
          }
        }
      ]
    );
  };

  const formatTime = (timestamp) => {
    const now = new Date();
    const messageTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - messageTime) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    return messageTime.toLocaleDateString();
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return Math.round(bytes / 1024) + ' KB';
    return Math.round(bytes / 1048576) + ' MB';
  };

  const renderMessage = ({ item, index }) => {
    const isFirstInGroup = index === 0 || messages[index - 1].isCoach !== item.isCoach;
    const isLastInGroup = index === messages.length - 1 || messages[index + 1].isCoach !== item.isCoach;

    return (
      <View style={[
        styles.messageContainer,
        item.isCoach ? styles.coachMessage : styles.parentMessage
      ]}>
        {isFirstInGroup && item.isCoach && (
          <View style={styles.senderInfo}>
            <Image source={{ uri: coach?.avatar }} style={styles.senderAvatar} />
            <Text style={styles.senderName}>{item.senderName}</Text>
          </View>
        )}
        
        <View style={[
          styles.messageBubble,
          item.isCoach ? styles.coachBubble : styles.parentBubble,
          isFirstInGroup && styles.firstInGroup,
          isLastInGroup && styles.lastInGroup
        ]}>
          {item.type === 'text' && (
            <Text style={[
              styles.messageText,
              item.isCoach ? styles.coachText : styles.parentText
            ]}>
              {item.message}
            </Text>
          )}
          
          {item.type === 'image' && (
            <TouchableOpacity>
              <Image source={{ uri: item.imageUri }} style={styles.messageImage} />
            </TouchableOpacity>
          )}
          
          {item.type === 'video' && (
            <TouchableOpacity style={styles.videoMessage}>
              <Image source={{ uri: item.videoThumbnail }} style={styles.videoThumbnail} />
              <View style={styles.videoOverlay}>
                <Ionicons name="play-circle" size={32} color="#fff" />
              </View>
              <View style={styles.videoInfo}>
                <Text style={styles.videoTitle}>{item.videoTitle}</Text>
                <Text style={styles.videoDuration}>{item.videoDuration}</Text>
              </View>
            </TouchableOpacity>
          )}
          
          {item.type === 'document' && (
            <TouchableOpacity style={styles.documentMessage}>
              <Ionicons name="document" size={24} color={item.isCoach ? '#fff' : '#007AFF'} />
              <View style={styles.documentInfo}>
                <Text style={[
                  styles.documentName,
                  { color: item.isCoach ? '#fff' : '#007AFF' }
                ]}>
                  {item.documentName}
                </Text>
                <Text style={[
                  styles.documentSize,
                  { color: item.isCoach ? '#E3F2FD' : '#666' }
                ]}>
                  {formatFileSize(item.documentSize)}
                </Text>
              </View>
            </TouchableOpacity>
          )}
          
          {item.type === 'booking' && (
            <View style={styles.bookingMessage}>
              <Ionicons name="calendar" size={20} color={item.isCoach ? '#fff' : '#007AFF'} />
              <View style={styles.bookingInfo}>
                <Text style={[
                  styles.bookingText,
                  { color: item.isCoach ? '#fff' : '#007AFF' }
                ]}>
                  Session Booking Request
                </Text>
                <Text style={[
                  styles.bookingDetails,
                  { color: item.isCoach ? '#E3F2FD' : '#666' }
                ]}>
                  {item.bookingDetails.sessionType} • {item.bookingDetails.date.toDateString()} • {item.bookingDetails.time}
                </Text>
              </View>
            </View>
          )}
          
          {item.sending && (
            <View style={styles.sendingIndicator}>
              <Ionicons name="time-outline" size={12} color="#999" />
              <Text style={styles.sendingText}>Sending...</Text>
            </View>
          )}
        </View>
        
        {isLastInGroup && (
          <Text style={[
            styles.timestamp,
            item.isCoach ? styles.coachTimestamp : styles.parentTimestamp
          ]}>
            {formatTime(item.timestamp)}
          </Text>
        )}
      </View>
    );
  };

  const BookingModal = () => {
    const timeSlots = [
      '9:00 AM', '10:00 AM', '11:00 AM', '2:00 PM', 
      '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM'
    ];

    const sessionTypes = [
      'Individual Training', 'Group Session', 'Skills Assessment', 
      'Match Preparation', 'Fitness Training'
    ];

    return (
      <Modal visible={showBookingModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.bookingModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Book Session</Text>
              <TouchableOpacity onPress={() => setShowBookingModal(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalContent}>
              <Text style={styles.fieldLabel}>Session Type</Text>
              <View style={styles.sessionTypeContainer}>
                {sessionTypes.map(type => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.sessionTypeButton,
                      sessionType === type && styles.selectedSessionType
                    ]}
                    onPress={() => setSessionType(type)}
                  >
                    <Text style={[
                      styles.sessionTypeText,
                      sessionType === type && styles.selectedSessionTypeText
                    ]}>
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.fieldLabel}>Available Time Slots</Text>
              <View style={styles.timeSlotsContainer}>
                {timeSlots.map(time => (
                  <TouchableOpacity
                    key={time}
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

              <TouchableOpacity
                style={styles.confirmBookingButton}
                onPress={confirmBooking}
              >
                <Text style={styles.confirmBookingText}>Send Booking Request</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        
        <View style={styles.coachInfo}>
          <Image source={{ uri: coach?.avatar }} style={styles.headerAvatar} />
          <View style={styles.headerTextInfo}>
            <Text style={styles.headerCoachName}>{coach?.name}</Text>
            <View style={styles.statusContainer}>
              <View style={[
                styles.statusDot,
                { backgroundColor: coach?.status === 'online' ? '#00C853' : '#999' }
              ]} />
              <Text style={styles.statusText}>
                {coach?.status === 'online' ? 'Online' : `Last seen ${formatTime(coach?.lastSeen)}`}
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={styles.bookButton}
          onPress={handleBookSession}
        >
          <Ionicons name="calendar" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderMessage}
        contentContainerStyle={styles.messagesList}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      {/* Typing Indicator */}
      {isTyping && (
        <View style={styles.typingContainer}>
          <View style={styles.typingBubble}>
            <Text style={styles.typingText}>{coach?.name} is typing...</Text>
            <View style={styles.typingDots}>
              <View style={[styles.dot, styles.dot1]} />
              <View style={[styles.dot, styles.dot2]} />
              <View style={[styles.dot, styles.dot3]} />
            </View>
          </View>
        </View>
      )}

      {/* Input Bar */}
      <View style={styles.inputContainer}>
        <TouchableOpacity
          style={styles.attachButton}
          onPress={handleAttachment}
        >
          <Ionicons name="attach" size={24} color="#666" />
        </TouchableOpacity>
        
        <TextInput
          style={styles.textInput}
          placeholder="Type a message..."
          value={inputText}
          onChangeText={setInputText}
          multiline
          maxLength={500}
        />
        
        <TouchableOpacity
          style={[
            styles.sendButton,
            inputText.trim() ? styles.activeSendButton : styles.inactiveSendButton
          ]}
          onPress={sendMessage}
          disabled={!inputText.trim()}
        >
          <Ionicons 
            name="send" 
            size={20} 
            color={inputText.trim() ? '#fff' : '#999'} 
          />
        </TouchableOpacity>
      </View>

      <BookingModal />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 40,
  },
  coachInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: '#E3F2FD',
  },
  headerTextInfo: {
    flex: 1,
  },
  headerCoachName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    color: '#E3F2FD',
  },
  bookButton: {
    padding: 8,
  },
  messagesList: {
    paddingVertical: 16,
  },
  messageContainer: {
    marginVertical: 2,
    marginHorizontal: 16,
  },
  coachMessage: {
    alignItems: 'flex-start',
  },
  parentMessage: {
    alignItems: 'flex-end',
  },
  senderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    marginLeft: 8,
  },
  senderAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
    backgroundColor: '#ddd',
  },
  senderName: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  messageBubble: {
    maxWidth: '80%',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  coachBubble: {
    backgroundColor: '#007AFF',
    alignSelf: 'flex-start',
  },
  parentBubble: {
    backgroundColor: '#E5E5EA',
    alignSelf: 'flex-end',
  },
  firstInGroup: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  lastInGroup: {
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  coachText: {
    color: '#fff',
  },
  parentText: {
    color: '#000',
  },
  messageImage: {
    width: 200,
    height: 150,
    borderRadius: 8,
  },
  videoMessage: {
    position: 'relative',
  },
  videoThumbnail: {
    width: 200,
    height: 120,
    borderRadius: 8,
    backgroundColor: '#000',
  },
  videoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 8,
  },
  videoInfo: {
    marginTop: 8,
  },
  videoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  videoDuration: {
    fontSize: 12,
    color: '#E3F2FD',
  },
  documentMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  documentInfo: {
    marginLeft: 12,
  },
  documentName: {
    fontSize: 14,
    fontWeight: '600',
  },
  documentSize: {
    fontSize: 12,
    marginTop: 2,
  },
  bookingMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  bookingInfo: {
    marginLeft: 12,
  },
  bookingText: {
    fontSize: 14,
    fontWeight: '600',
  },
  bookingDetails: {
    fontSize: 12,
    marginTop: 2,
  },
  sendingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  sendingText: {
    fontSize: 11,
    color: '#999',
    marginLeft: 4,
  },
  timestamp: {
    fontSize: 11,
    color: '#999',
    marginTop: 4,
  },
  coachTimestamp: {
    alignSelf: 'flex-start',
    marginLeft: 8,
  },
  parentTimestamp: {
    alignSelf: 'flex-end',
    marginRight: 8,
  },
  typingContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E5E5EA',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignSelf: 'flex-start',
  },
  typingText: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
  typingDots: {
    flexDirection: 'row',
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#999',
    marginHorizontal: 1,
  },
  dot1: { animationDelay: '0s' },
  dot2: { animationDelay: '0.2s' },
  dot3: { animationDelay: '0.4s' },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  attachButton: {
    padding: 8,
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 100,
    fontSize: 16,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  activeSendButton: {
    backgroundColor: '#007AFF',
  },
  inactiveSendButton: {
    backgroundColor: '#f0f0f0',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookingModal: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalContent: {
    padding: 20,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  sessionTypeContainer: {
    marginBottom: 24,
  },
  sessionTypeButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 8,
  },
  selectedSessionType: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  sessionTypeText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  selectedSessionTypeText: {
    color: '#fff',
  },
  timeSlotsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
  },
  timeSlot: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    marginRight: 8,
    marginBottom: 8,
  },
  selectedTimeSlot: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  timeSlotText: {
    fontSize: 14,
    color: '#666',
  },
  selectedTimeSlotText: {
    color: '#fff',
  },
  confirmBookingButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  confirmBookingText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CoachChat;