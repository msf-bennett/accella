import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Vibration,
  StatusBar,
  RefreshControl,
  Animated,
} from 'react-native';
import { 
  Card,
  Button,
  Avatar,
  IconButton,
  Surface,
  Chip,
  ProgressBar,
} from 'react-native-paper';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';

// Design system imports
import { COLORS, SPACING, TEXT_STYLES } from '../styles/theme';

const AICoachChat = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, isLoading } = useSelector(state => state.auth);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('general');
  const [aiLevel, setAiLevel] = useState(1);
  const [streak, setStreak] = useState(7);
  const [totalPoints, setTotalPoints] = useState(1250);
  
  const scrollViewRef = useRef();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // AI Coach categories
  const coachCategories = [
    { id: 'general', label: 'General', icon: 'chat', color: COLORS.primary },
    { id: 'training', label: 'Training', icon: 'fitness-center', color: '#e74c3c' },
    { id: 'nutrition', label: 'Nutrition', icon: 'restaurant', color: '#f39c12' },
    { id: 'recovery', label: 'Recovery', icon: 'spa', color: '#27ae60' },
    { id: 'mental', label: 'Mental', icon: 'psychology', color: '#9b59b6' },
  ];

  // Quick action suggestions
  const quickActions = [
    { id: 1, text: "Plan my training for this week 💪", category: 'training' },
    { id: 2, text: "Suggest a nutrition plan 🥗", category: 'nutrition' },
    { id: 3, text: "Help with recovery tips 🧘‍♂️", category: 'recovery' },
    { id: 4, text: "Mental preparation advice 🧠", category: 'mental' },
    { id: 5, text: "Analyze my performance 📊", category: 'general' },
  ];

  useEffect(() => {
    initializeChat();
    animateEntrance();
    loadPreviousMessages();
  }, []);

  const animateEntrance = () => {
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
  };

  const initializeChat = () => {
    const welcomeMessage = {
      id: Date.now(),
      text: `Hey ${user?.firstName || 'Champion'}! 👋 I'm your AI Coach. I'm here to help you with training, nutrition, recovery, and mental preparation. What would you like to work on today?`,
      isAI: true,
      timestamp: new Date(),
      category: 'general',
      points: 0,
    };
    setMessages([welcomeMessage]);
  };

  const loadPreviousMessages = async () => {
    try {
      // Simulate loading previous messages
      setRefreshing(true);
      // In real app, load from AsyncStorage or API
      setTimeout(() => {
        setRefreshing(false);
      }, 1000);
    } catch (error) {
      console.error('Error loading messages:', error);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    loadPreviousMessages();
  }, []);

  const sendMessage = async (messageText = inputText) => {
    if (!messageText.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: messageText,
      isAI: false,
      timestamp: new Date(),
      category: selectedCategory,
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    // Vibration feedback
    Vibration.vibrate(50);

    // Scroll to bottom
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);

    try {
      // Simulate AI response
      setTimeout(() => {
        const aiResponse = generateAIResponse(messageText, selectedCategory);
        const aiMessage = {
          id: Date.now() + 1,
          text: aiResponse.text,
          isAI: true,
          timestamp: new Date(),
          category: selectedCategory,
          points: aiResponse.points,
          achievement: aiResponse.achievement,
        };

        setMessages(prev => [...prev, aiMessage]);
        setIsTyping(false);
        
        if (aiResponse.points > 0) {
          setTotalPoints(prev => prev + aiResponse.points);
        }

        if (aiResponse.achievement) {
          showAchievement(aiResponse.achievement);
        }

        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }, 1500);
    } catch (error) {
      setIsTyping(false);
      Alert.alert('Error', 'Failed to get AI response. Please try again.');
    }
  };

  const generateAIResponse = (message, category) => {
    const responses = {
      training: {
        text: "Great question about training! 💪 Based on your profile, I recommend focusing on progressive overload this week. Start with 3 sets of compound exercises, increase intensity by 5-10%. Remember to warm up properly and maintain good form. Would you like me to create a detailed weekly plan?",
        points: 25,
        achievement: null,
      },
      nutrition: {
        text: "Excellent nutrition question! 🥗 For optimal performance, focus on eating protein within 30 minutes post-workout. Include complex carbs 2-3 hours before training. Stay hydrated with 2-3L water daily. Need specific meal suggestions for your sport?",
        points: 20,
        achievement: "Nutrition Enthusiast",
      },
      recovery: {
        text: "Recovery is crucial for progress! 🧘‍♂️ Ensure 7-9 hours of quality sleep, incorporate active recovery days, and try contrast showers. Foam rolling for 10-15 minutes daily can significantly improve muscle recovery. What specific recovery challenges are you facing?",
        points: 30,
        achievement: null,
      },
      mental: {
        text: "Mental preparation is key! 🧠 Try visualization techniques before training - spend 5 minutes imagining successful performance. Practice deep breathing exercises and positive self-talk. Confidence comes from preparation. Would you like specific mental exercises for your sport?",
        points: 35,
        achievement: "Mental Warrior",
      },
      general: {
        text: "I'm here to help you become the best athlete you can be! 🌟 Whether it's training techniques, nutrition advice, recovery strategies, or mental preparation - just ask. What's your biggest challenge right now?",
        points: 15,
        achievement: null,
      },
    };

    return responses[category] || responses.general;
  };

  const showAchievement = (achievement) => {
    Alert.alert(
      "🏆 Achievement Unlocked!",
      `You've earned the "${achievement}" badge! Keep up the great work!`,
      [{ text: "Awesome!", onPress: () => Vibration.vibrate(100) }]
    );
  };

  const handleQuickAction = (action) => {
    setSelectedCategory(action.category);
    sendMessage(action.text);
  };

  const renderMessage = (message, index) => {
    const isLastMessage = index === messages.length - 1;
    
    return (
      <Animated.View
        key={message.id}
        style={[
          styles.messageContainer,
          message.isAI ? styles.aiMessageContainer : styles.userMessageContainer,
          { opacity: fadeAnim }
        ]}
      >
        {message.isAI && (
          <Avatar.Icon 
            size={32} 
            icon="robot" 
            style={styles.aiAvatar}
            theme={{ colors: { primary: COLORS.primary } }}
          />
        )}
        
        <Surface style={[
          styles.messageBubble,
          message.isAI ? styles.aiMessage : styles.userMessage
        ]}>
          <Text style={[
            styles.messageText,
            message.isAI ? styles.aiMessageText : styles.userMessageText
          ]}>
            {message.text}
          </Text>
          
          {message.points > 0 && (
            <View style={styles.pointsContainer}>
              <Icon name="star" size={16} color="#f39c12" />
              <Text style={styles.pointsText}>+{message.points} points</Text>
            </View>
          )}
          
          <Text style={[
            styles.timestamp,
            message.isAI ? styles.aiTimestamp : styles.userTimestamp
          ]}>
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </Surface>
        
        {!message.isAI && (
          <Avatar.Text 
            size={32} 
            label={user?.firstName?.[0] || 'U'} 
            style={styles.userAvatar}
          />
        )}
      </Animated.View>
    );
  };

  const renderTypingIndicator = () => {
    if (!isTyping) return null;
    
    return (
      <View style={[styles.messageContainer, styles.aiMessageContainer]}>
        <Avatar.Icon 
          size={32} 
          icon="robot" 
          style={styles.aiAvatar}
          theme={{ colors: { primary: COLORS.primary } }}
        />
        <Surface style={[styles.messageBubble, styles.aiMessage]}>
          <View style={styles.typingContainer}>
            <Text style={styles.typingText}>AI Coach is typing</Text>
            <View style={styles.typingDots}>
              <View style={[styles.dot, styles.dot1]} />
              <View style={[styles.dot, styles.dot2]} />
              <View style={[styles.dot, styles.dot3]} />
            </View>
          </View>
        </Surface>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      {/* Header */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Icon name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>AI Coach 🤖</Text>
            <Text style={styles.headerSubtitle}>Level {aiLevel} • {streak} day streak 🔥</Text>
          </View>
          
          <View style={styles.pointsHeader}>
            <Icon name="star" size={20} color="#f39c12" />
            <Text style={styles.pointsHeaderText}>{totalPoints}</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Category Selector */}
      <View style={styles.categoryContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryContent}
        >
          {coachCategories.map((category) => (
            <Chip
              key={category.id}
              mode={selectedCategory === category.id ? 'flat' : 'outlined'}
              selected={selectedCategory === category.id}
              onPress={() => setSelectedCategory(category.id)}
              icon={category.icon}
              style={[
                styles.categoryChip,
                selectedCategory === category.id && { backgroundColor: category.color }
              ]}
              textStyle={[
                styles.categoryChipText,
                selectedCategory === category.id && styles.selectedCategoryText
              ]}
            >
              {category.label}
            </Chip>
          ))}
        </ScrollView>
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      >
        {messages.map((message, index) => renderMessage(message, index))}
        {renderTypingIndicator()}
        
        {messages.length === 1 && (
          <View style={styles.quickActionsContainer}>
            <Text style={styles.quickActionsTitle}>Quick Actions 🚀</Text>
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={styles.quickActionButton}
                onPress={() => handleQuickAction(action)}
              >
                <Text style={styles.quickActionText}>{action.text}</Text>
                <Icon name="arrow-forward" size={16} color={COLORS.primary} />
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Input Area */}
      <View style={styles.inputContainer}>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Ask your AI Coach anything..."
            placeholderTextColor="#999"
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              inputText.trim() ? styles.sendButtonActive : styles.sendButtonInactive
            ]}
            onPress={() => sendMessage()}
            disabled={!inputText.trim()}
          >
            <Icon 
              name="send" 
              size={20} 
              color={inputText.trim() ? '#fff' : '#999'} 
            />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: StatusBar.currentHeight + SPACING.lg,
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: SPACING.xs,
  },
  headerInfo: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    ...TEXT_STYLES.h2,
    color: '#fff',
    fontWeight: 'bold',
  },
  headerSubtitle: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  pointsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 20,
  },
  pointsHeaderText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: SPACING.xs,
  },
  categoryContainer: {
    backgroundColor: '#fff',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  categoryContent: {
    paddingHorizontal: SPACING.md,
  },
  categoryChip: {
    marginRight: SPACING.sm,
  },
  categoryChipText: {
    fontSize: 12,
  },
  selectedCategoryText: {
    color: '#fff',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: SPACING.md,
  },
  messageContainer: {
    flexDirection: 'row',
    marginVertical: SPACING.xs,
    alignItems: 'flex-end',
  },
  aiMessageContainer: {
    justifyContent: 'flex-start',
  },
  userMessageContainer: {
    justifyContent: 'flex-end',
  },
  aiAvatar: {
    marginRight: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  userAvatar: {
    marginLeft: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  messageBubble: {
    maxWidth: '75%',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    elevation: 2,
  },
  aiMessage: {
    backgroundColor: '#f8f9fa',
    borderBottomLeftRadius: 5,
  },
  userMessage: {
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: 5,
  },
  messageText: {
    ...TEXT_STYLES.body,
    lineHeight: 20,
  },
  aiMessageText: {
    color: '#333',
  },
  userMessageText: {
    color: '#fff',
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs,
    paddingTop: SPACING.xs,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  pointsText: {
    ...TEXT_STYLES.caption,
    color: '#f39c12',
    fontWeight: 'bold',
    marginLeft: SPACING.xs,
  },
  timestamp: {
    ...TEXT_STYLES.caption,
    marginTop: SPACING.xs,
  },
  aiTimestamp: {
    color: '#999',
  },
  userTimestamp: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typingText: {
    ...TEXT_STYLES.caption,
    color: '#666',
    marginRight: SPACING.sm,
  },
  typingDots: {
    flexDirection: 'row',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
    marginHorizontal: 1,
    opacity: 0.4,
  },
  dot1: {
    // Animation would be added here
  },
  dot2: {
    // Animation would be added here
  },
  dot3: {
    // Animation would be added here
  },
  quickActionsContainer: {
    marginTop: SPACING.lg,
    padding: SPACING.md,
    backgroundColor: '#f8f9fa',
    borderRadius: 15,
  },
  quickActionsTitle: {
    ...TEXT_STYLES.h3,
    color: '#333',
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  quickActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: SPACING.md,
    marginVertical: SPACING.xs,
    borderRadius: 10,
    elevation: 1,
  },
  quickActionText: {
    ...TEXT_STYLES.body,
    color: '#333',
    flex: 1,
  },
  inputContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 25,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    maxHeight: 100,
    backgroundColor: '#f8f9fa',
    marginRight: SPACING.sm,
    ...TEXT_STYLES.body,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonActive: {
    backgroundColor: COLORS.primary,
  },
  sendButtonInactive: {
    backgroundColor: '#e0e0e0',
  },
});

export default AICoachChat;