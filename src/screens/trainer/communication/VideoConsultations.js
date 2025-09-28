import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Dimensions,
  Vibration,
  Alert,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import { 
  Card,
  Button,
  Chip,
  IconButton,
  FAB,
  Surface,
  Portal,
  Modal,
  TextInput,
  Avatar,
  Badge,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { BlurView } from '../../../components/shared/BlurView';

// Import your design system constants
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const { width, height } = Dimensions.get('window');

const VideoConsultation = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { user, consultationData } = useSelector(state => state.consultation);
  
  // Video call states
  const [isConnected, setIsConnected] = useState(false);
  const [isCallActive, setIsCallActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState('connecting'); // connecting, connected, poor, disconnected
  
  // UI states
  const [showControls, setShowControls] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [showScreenShare, setShowScreenShare] = useState(false);
  const [showWorkoutPlans, setShowWorkoutPlans] = useState(false);
  
  // Chat and notes
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [consultationNotes, setConsultationNotes] = useState('');
  const [unreadMessages, setUnreadMessages] = useState(0);
  
  // Timers
  const callTimer = useRef(null);
  const controlsTimer = useRef(null);
  
  // Mock consultation data
  const mockConsultationData = {
    id: 'cons_001',
    clientName: 'Sarah Johnson',
    clientAvatar: 'https://example.com/avatar.jpg',
    coachName: 'Mike Thompson',
    sessionType: 'Fitness Assessment',
    scheduledTime: '2:00 PM - 3:00 PM',
    sessionGoals: ['Form correction', 'New workout plan', 'Nutrition guidance'],
    clientHistory: {
      previousSessions: 12,
      currentProgram: 'Strength Building',
      injuries: ['Previous knee injury (recovered)'],
      goals: ['Build muscle', 'Improve endurance']
    }
  };

  useEffect(() => {
    // Initialize call
    initializeCall();
    
    // Request permissions
    requestPermissions();
    
    // Auto-hide controls after 5 seconds
    resetControlsTimer();
    
    return () => {
      endCall();
      if (callTimer.current) clearInterval(callTimer.current);
      if (controlsTimer.current) clearTimeout(controlsTimer.current);
    };
  }, []);

  const requestPermissions = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.CAMERA,
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        ]);
        
        if (granted['android.permission.CAMERA'] !== PermissionsAndroid.RESULTS.GRANTED ||
            granted['android.permission.RECORD_AUDIO'] !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert('Permissions Required', 'Camera and microphone permissions are needed for video consultation.');
        }
      } catch (err) {
        console.warn(err);
      }
    }
  };

  const initializeCall = useCallback(() => {
    // Simulate connection process
    setConnectionStatus('connecting');
    
    setTimeout(() => {
      setConnectionStatus('connected');
      setIsConnected(true);
      setIsCallActive(true);
      
      // Start call timer
      callTimer.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
      
      Vibration.vibrate(100);
    }, 3000);
  }, []);

  const resetControlsTimer = () => {
    if (controlsTimer.current) clearTimeout(controlsTimer.current);
    setShowControls(true);
    
    controlsTimer.current = setTimeout(() => {
      setShowControls(false);
    }, 5000);
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    Vibration.vibrate(50);
  };

  const toggleVideo = () => {
    setIsVideoOn(!isVideoOn);
    Vibration.vibrate(50);
  };

  const toggleSpeaker = () => {
    setIsSpeakerOn(!isSpeakerOn);
    Vibration.vibrate(50);
  };

  const endCall = () => {
    Alert.alert(
      'End Consultation',
      'Are you sure you want to end this video consultation?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'End Call',
          style: 'destructive',
          onPress: () => {
            setIsCallActive(false);
            setIsConnected(false);
            if (callTimer.current) clearInterval(callTimer.current);
            navigation.goBack();
          }
        }
      ]
    );
  };

  const sendMessage = () => {
    if (newMessage.trim()) {
      const message = {
        id: Date.now(),
        text: newMessage,
        sender: user.role === 'coach' ? 'coach' : 'client',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      
      setChatMessages(prev => [...prev, message]);
      setNewMessage('');
      
      if (!showChat) {
        setUnreadMessages(prev => prev + 1);
      }
    }
  };

  const openChat = () => {
    setShowChat(true);
    setUnreadMessages(0);
  };

  const shareWorkoutPlan = () => {
    Alert.alert(
      'Feature Coming Soon',
      'Real-time workout plan sharing during video calls is under development! 🚧',
      [{ text: 'OK', style: 'default' }]
    );
  };

  const startScreenShare = () => {
    Alert.alert(
      'Feature Coming Soon',
      'Screen sharing functionality is under development! 🚧',
      [{ text: 'OK', style: 'default' }]
    );
  };

  const renderConnectionStatus = () => (
    <View style={styles.statusContainer}>
      <View style={[
        styles.connectionDot,
        { backgroundColor: connectionStatus === 'connected' ? COLORS.success : 
                           connectionStatus === 'poor' ? '#FFA726' : COLORS.error }
      ]} />
      <Text style={[TEXT_STYLES.caption, styles.statusText]}>
        {connectionStatus === 'connecting' ? 'Connecting...' :
         connectionStatus === 'connected' ? 'Connected' :
         connectionStatus === 'poor' ? 'Poor connection' : 'Disconnected'}
      </Text>
      {isCallActive && (
        <Chip mode="flat" style={styles.durationChip} textStyle={styles.durationText}>
          {formatDuration(callDuration)}
        </Chip>
      )}
    </View>
  );

  const renderVideoArea = () => (
    <TouchableOpacity 
      style={styles.videoContainer}
      activeOpacity={1}
      onPress={resetControlsTimer}
    >
      {/* Remote video (coach/client) */}
      <View style={styles.remoteVideo}>
        {!isConnected ? (
          <View style={styles.loadingContainer}>
            <Avatar.Image
              size={100}
              source={{ uri: mockConsultationData.clientAvatar }}
              style={styles.avatarPlaceholder}
            />
            <Text style={[TEXT_STYLES.body, styles.loadingText]}>
              Connecting to {mockConsultationData.clientName}...
            </Text>
          </View>
        ) : (
          <LinearGradient
            colors={['rgba(102, 126, 234, 0.1)', 'rgba(118, 75, 162, 0.1)']}
            style={styles.videoPlaceholder}
          >
            <MaterialIcons name="videocam" size={60} color={COLORS.primary} />
            <Text style={[TEXT_STYLES.body, styles.videoPlaceholderText]}>
              Video Feed Active
            </Text>
          </LinearGradient>
        )}
        
        {/* Session info overlay */}
        <View style={styles.sessionInfoOverlay}>
          <Text style={[TEXT_STYLES.caption, styles.sessionType]}>
            {mockConsultationData.sessionType}
          </Text>
          <Text style={[TEXT_STYLES.h3, styles.clientName]}>
            {mockConsultationData.clientName}
          </Text>
        </View>
      </View>

      {/* Local video (small window) */}
      <View style={styles.localVideo}>
        {isVideoOn ? (
          <LinearGradient
            colors={['rgba(102, 126, 234, 0.2)', 'rgba(118, 75, 162, 0.2)']}
            style={styles.localVideoContent}
          >
            <MaterialIcons name="person" size={30} color="white" />
          </LinearGradient>
        ) : (
          <View style={[styles.localVideoContent, { backgroundColor: '#333' }]}>
            <MaterialIcons name="videocam-off" size={30} color="white" />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderControls = () => {
    if (!showControls) return null;

    return (
      <View style={styles.controlsContainer}>
        <LinearGradient
          colors={['rgba(0, 0, 0, 0.8)', 'rgba(0, 0, 0, 0.6)']}
          style={styles.controlsGradient}
        >
          <View style={styles.primaryControls}>
            <IconButton
              icon={isMuted ? "mic-off" : "mic"}
              size={28}
              iconColor="white"
              style={[styles.controlButton, isMuted && styles.mutedButton]}
              onPress={toggleMute}
            />
            
            <IconButton
              icon={isVideoOn ? "videocam" : "videocam-off"}
              size={28}
              iconColor="white"
              style={[styles.controlButton, !isVideoOn && styles.mutedButton]}
              onPress={toggleVideo}
            />
            
            <IconButton
              icon="call-end"
              size={32}
              iconColor="white"
              style={styles.endCallButton}
              onPress={endCall}
            />
            
            <IconButton
              icon={isSpeakerOn ? "volume-up" : "volume-down"}
              size={28}
              iconColor="white"
              style={styles.controlButton}
              onPress={toggleSpeaker}
            />
            
            <View style={styles.chatButtonContainer}>
              <IconButton
                icon="chat"
                size={28}
                iconColor="white"
                style={styles.controlButton}
                onPress={openChat}
              />
              {unreadMessages > 0 && (
                <Badge style={styles.chatBadge}>{unreadMessages}</Badge>
              )}
            </View>
          </View>

          <View style={styles.secondaryControls}>
            <IconButton
              icon="screen-share"
              size={24}
              iconColor="white"
              style={styles.secondaryButton}
              onPress={startScreenShare}
            />
            
            <IconButton
              icon="fitness-center"
              size={24}
              iconColor="white"
              style={styles.secondaryButton}
              onPress={shareWorkoutPlan}
            />
            
            <IconButton
              icon="note-add"
              size={24}
              iconColor="white"
              style={styles.secondaryButton}
              onPress={() => setShowNotes(true)}
            />
          </View>
        </LinearGradient>
      </View>
    );
  };

  const renderChatModal = () => (
    <Portal>
      <Modal visible={showChat} onDismiss={() => setShowChat(false)} contentContainerStyle={styles.chatModal}>
        <View style={styles.chatHeader}>
          <Text style={[TEXT_STYLES.h3, styles.chatTitle]}>Chat</Text>
          <IconButton icon="close" onPress={() => setShowChat(false)} />
        </View>
        
        <View style={styles.chatMessages}>
          {chatMessages.map(message => (
            <View key={message.id} style={[
              styles.messageContainer,
              message.sender === (user.role === 'coach' ? 'coach' : 'client') 
                ? styles.myMessage : styles.theirMessage
            ]}>
              <Text style={styles.messageText}>{message.text}</Text>
              <Text style={styles.messageTime}>{message.timestamp}</Text>
            </View>
          ))}
        </View>
        
        <View style={styles.chatInput}>
          <TextInput
            value={newMessage}
            onChangeText={setNewMessage}
            placeholder="Type a message..."
            style={styles.messageInput}
            multiline
          />
          <IconButton
            icon="send"
            onPress={sendMessage}
            disabled={!newMessage.trim()}
          />
        </View>
      </Modal>
    </Portal>
  );

  const renderNotesModal = () => (
    <Portal>
      <Modal visible={showNotes} onDismiss={() => setShowNotes(false)} contentContainerStyle={styles.notesModal}>
        <View style={styles.notesHeader}>
          <Text style={[TEXT_STYLES.h3, styles.notesTitle]}>Session Notes</Text>
          <IconButton icon="close" onPress={() => setShowNotes(false)} />
        </View>
        
        <TextInput
          value={consultationNotes}
          onChangeText={setConsultationNotes}
          placeholder="Add notes about this consultation..."
          multiline
          numberOfLines={10}
          style={styles.notesInput}
        />
        
        <Button
          mode="contained"
          onPress={() => {
            // Save notes logic here
            setShowNotes(false);
            Alert.alert('Success', 'Notes saved successfully!');
          }}
          style={styles.saveNotesButton}
        >
          Save Notes
        </Button>
      </Modal>
    </Portal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar hidden />
      
      {renderConnectionStatus()}
      {renderVideoArea()}
      {renderControls()}
      {renderChatModal()}
      {renderNotesModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    gap: SPACING.xs,
  },
  connectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    color: 'white',
  },
  durationChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginLeft: SPACING.md,
  },
  durationText: {
    color: 'white',
    fontWeight: 'bold',
  },
  videoContainer: {
    flex: 1,
    position: 'relative',
  },
  remoteVideo: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    gap: SPACING.md,
  },
  avatarPlaceholder: {
    opacity: 0.7,
  },
  loadingText: {
    color: 'white',
    textAlign: 'center',
  },
  videoPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.md,
  },
  videoPlaceholderText: {
    color: COLORS.primary,
    fontWeight: '500',
  },
  sessionInfoOverlay: {
    position: 'absolute',
    top: SPACING.md,
    left: SPACING.md,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
  },
  sessionType: {
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 2,
  },
  clientName: {
    color: 'white',
    fontWeight: 'bold',
  },
  localVideo: {
    position: 'absolute',
    top: SPACING.xl,
    right: SPACING.md,
    width: 120,
    height: 160,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  localVideoContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  controlsGradient: {
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.md,
  },
  primaryControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
    gap: SPACING.lg,
  },
  controlButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    margin: 0,
  },
  mutedButton: {
    backgroundColor: 'rgba(244, 67, 54, 0.8)',
  },
  endCallButton: {
    backgroundColor: COLORS.error,
    margin: 0,
  },
  chatButtonContainer: {
    position: 'relative',
  },
  chatBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: COLORS.error,
  },
  secondaryControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.md,
  },
  secondaryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    margin: 0,
  },
  chatModal: {
    backgroundColor: 'white',
    margin: SPACING.md,
    borderRadius: 12,
    maxHeight: height * 0.7,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  chatTitle: {
    color: COLORS.text,
  },
  chatMessages: {
    flex: 1,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    maxHeight: 300,
  },
  messageContainer: {
    marginVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 12,
    maxWidth: '80%',
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: COLORS.primary,
  },
  theirMessage: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.surface,
  },
  messageText: {
    color: 'white',
    marginBottom: 4,
  },
  messageTime: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  chatInput: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  messageInput: {
    flex: 1,
    maxHeight: 100,
    backgroundColor: COLORS.surface,
  },
  notesModal: {
    backgroundColor: 'white',
    margin: SPACING.md,
    borderRadius: 12,
    padding: SPACING.lg,
  },
  notesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  notesTitle: {
    color: COLORS.text,
  },
  notesInput: {
    backgroundColor: COLORS.surface,
    marginBottom: SPACING.lg,
    textAlignVertical: 'top',
  },
  saveNotesButton: {
    backgroundColor: COLORS.primary,
  },
});

export default VideoConsultation;