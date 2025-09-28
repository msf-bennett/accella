import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Dimensions,
  Animated,
  TouchableOpacity,
  StatusBar,
  Alert,
  Vibration,
  KeyboardAvoidingView,
  Platform,
  FlatList,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import {
  Text,
  Card,
  Button,
  Chip,
  Avatar,
  IconButton,
  Searchbar,
  Portal,
  FAB,
  Surface,
  TextInput,
  ProgressBar,
  Badge,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { LinearGradient } from '../../../components/shared/LinearGradient';
import { BlurView } from '../../../components/shared/BlurView';
import { COLORS } from '../../../styles/colors';
import { SPACING } from '../../../styles/spacing';
import { TEXT_STYLES } from '../../../styles/textStyles';
import { TYPOGRAPHY } from '../../../styles/typography';
import { LAYOUT } from '../../../styles/layout';

const { width, height } = Dimensions.get('window');
const CARD_WIDTH = width * 0.9;

const AICoachingAssistant = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [activeFeature, setActiveFeature] = useState('chat');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(true);
  
  const scrollY = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const typingAnim = useRef(new Animated.Value(0)).current;
  const chatScrollRef = useRef(null);

  const { user } = useSelector(state => state.auth);
  const { players, sessions } = useSelector(state => state.coach || {});
  const dispatch = useDispatch();

  useEffect(() => {
    // Initialize animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Load initial AI greeting
    loadInitialMessage();
  }, []);

  useEffect(() => {
    // Animate typing indicator
    if (isTyping) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(typingAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(typingAnim, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      typingAnim.stopAnimation();
      typingAnim.setValue(0);
    }
  }, [isTyping]);

  const loadInitialMessage = () => {
    const initialMessage = {
      id: 'ai-welcome',
      type: 'ai',
      text: `Hello ${user?.firstName || 'Coach'}! 👋 I'm your AI Coaching Assistant. I'm here to help you create better training plans, analyze player performance, and provide personalized recommendations. How can I assist you today?`,
      timestamp: new Date(),
      suggestions: [
        'Create a training plan',
        'Analyze player performance',
        'Suggest drills for speed',
        'Help with injury prevention',
      ]
    };
    setMessages([initialMessage]);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    Vibration.vibrate([50, 100, 50]);
    // Simulate data refresh
    setTimeout(() => setRefreshing(false), 1500);
  }, []);

  const handleSendMessage = async () => {
    if (!messageText.trim()) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      type: 'user',
      text: messageText.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setMessageText('');
    setShowSuggestions(false);
    setIsTyping(true);

    // Simulate AI processing
    setTimeout(() => {
      generateAIResponse(userMessage.text);
    }, 1500 + Math.random() * 1000);
  };

  const generateAIResponse = (userInput) => {
    const responses = getAIResponse(userInput);
    
    setIsTyping(false);
    const aiMessage = {
      id: `ai-${Date.now()}`,
      type: 'ai',
      text: responses.text,
      timestamp: new Date(),
      suggestions: responses.suggestions,
      actionCards: responses.actionCards,
    };

    setMessages(prev => [...prev, aiMessage]);
    
    // Scroll to bottom after message is added
    setTimeout(() => {
      chatScrollRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const getAIResponse = (input) => {
    const lowerInput = input.toLowerCase();
    
    if (lowerInput.includes('training plan') || lowerInput.includes('workout')) {
      return {
        text: "I'd be happy to help you create a training plan! 🏋️‍♂️ To provide the best recommendations, I'll need some information about your players. What sport are you coaching, and what's the skill level of your athletes?",
        suggestions: ['Football training', 'Youth players', 'Advanced athletes', 'Beginner friendly'],
        actionCards: [
          {
            id: 1,
            title: 'Quick Training Plan',
            description: 'Generate a 4-week plan',
            icon: 'schedule',
            color: '#4CAF50'
          },
          {
            id: 2,
            title: 'Custom Plan Builder',
            description: 'Detailed customization',
            icon: 'build',
            color: '#2196F3'
          }
        ]
      };
    }
    
    if (lowerInput.includes('performance') || lowerInput.includes('analyze')) {
      return {
        text: "Performance analysis is one of my specialties! 📊 I can help you track individual player progress, identify strengths and weaknesses, and suggest targeted improvements. Would you like me to analyze specific metrics or overall team performance?",
        suggestions: ['Individual player stats', 'Team performance', 'Fitness metrics', 'Skill assessment'],
        actionCards: [
          {
            id: 1,
            title: 'Player Analysis',
            description: 'Detailed individual reports',
            icon: 'person',
            color: '#FF9800'
          },
          {
            id: 2,
            title: 'Team Insights',
            description: 'Overall team metrics',
            icon: 'group',
            color: '#9C27B0'
          }
        ]
      };
    }

    if (lowerInput.includes('drill') || lowerInput.includes('exercise')) {
      return {
        text: "Great choice! 🎯 I have access to hundreds of proven drills and exercises. What specific skills are you looking to develop? I can recommend drills based on age group, skill level, and available equipment.",
        suggestions: ['Speed drills', 'Ball control', 'Team coordination', 'Strength training'],
        actionCards: [
          {
            id: 1,
            title: 'Drill Library',
            description: 'Browse all exercises',
            icon: 'library-books',
            color: '#4ECDC4'
          },
          {
            id: 2,
            title: 'Smart Recommendations',
            description: 'AI-suggested drills',
            icon: 'auto-awesome',
            color: '#FF6B6B'
          }
        ]
      };
    }

    if (lowerInput.includes('injury') || lowerInput.includes('prevention')) {
      return {
        text: "Injury prevention is crucial for athlete development! 🏥 I can help you identify risk factors, suggest preventive exercises, and create warm-up routines. What specific concerns do you have?",
        suggestions: ['Warm-up routines', 'Recovery protocols', 'Risk assessment', 'Nutrition advice'],
        actionCards: [
          {
            id: 1,
            title: 'Prevention Plan',
            description: 'Customized protocols',
            icon: 'health-and-safety',
            color: '#4CAF50'
          },
          {
            id: 2,
            title: 'Recovery Guide',
            description: 'Post-training care',
            icon: 'spa',
            color: '#673AB7'
          }
        ]
      };
    }

    // Default response
    return {
      text: "I understand you're looking for coaching assistance! 🤔 I can help with training plans, performance analysis, drill recommendations, injury prevention, and much more. Could you be more specific about what you need help with?",
      suggestions: ['Training plans', 'Player analysis', 'Drill suggestions', 'Team management'],
      actionCards: [
        {
          id: 1,
          title: 'Getting Started',
          description: 'Learn what I can do',
          icon: 'help',
          color: '#2196F3'
        },
        {
          id: 2,
          title: 'Popular Features',
          description: 'Most used tools',
          icon: 'trending-up',
          color: '#FF9800'
        }
      ]
    };
  };

  const handleSuggestionPress = (suggestion) => {
    setMessageText(suggestion);
    setTimeout(() => handleSendMessage(), 100);
  };

  const handleActionCardPress = (card) => {
    Alert.alert(
      `${card.title} 🚧`,
      `The ${card.description} feature is currently being developed and will be available soon!`,
      [{ text: 'Got it!', style: 'default' }]
    );
  };

  // Quick feature buttons
  const quickFeatures = [
    {
      id: 'plan-generator',
      title: 'Plan Generator',
      icon: 'auto-awesome',
      color: '#4CAF50',
      description: 'AI-powered training plans'
    },
    {
      id: 'performance-insights',
      title: 'Performance Insights',
      icon: 'insights',
      color: '#2196F3',
      description: 'Detailed player analytics'
    },
    {
      id: 'drill-recommendations',
      title: 'Smart Drills',
      icon: 'fitness-center',
      color: '#FF9800',
      description: 'Personalized exercises'
    },
    {
      id: 'injury-prevention',
      title: 'Health Monitor',
      icon: 'health-and-safety',
      color: '#9C27B0',
      description: 'Injury prevention tools'
    },
  ];

  // AI capabilities showcase
  const aiCapabilities = [
    {
      icon: 'psychology',
      title: 'Smart Analysis',
      description: 'Advanced performance analytics using machine learning',
      features: ['Player profiling', 'Weakness detection', 'Progress prediction']
    },
    {
      icon: 'auto-fix-high',
      title: 'Automated Planning',
      description: 'Generate training plans based on goals and constraints',
      features: ['Custom schedules', 'Adaptive difficulty', 'Equipment optimization']
    },
    {
      icon: 'timeline',
      title: 'Trend Detection',
      description: 'Identify patterns in player development over time',
      features: ['Performance trends', 'Skill progression', 'Injury patterns']
    },
    {
      icon: 'recommend',
      title: 'Smart Recommendations',
      description: 'Personalized suggestions for each player',
      features: ['Drill selection', 'Training intensity', 'Recovery timing']
    },
  ];

  const renderMessage = ({ item }) => (
    <View style={[
      styles.messageContainer,
      item.type === 'user' ? styles.userMessage : styles.aiMessage
    ]}>
      {item.type === 'ai' && (
        <Avatar.Icon
          size={32}
          icon="smart-toy"
          style={styles.aiAvatar}
        />
      )}
      
      <View style={[
        styles.messageBubble,
        item.type === 'user' ? styles.userBubble : styles.aiBubble
      ]}>
        <Text style={[
          styles.messageText,
          item.type === 'user' ? styles.userText : styles.aiText
        ]}>
          {item.text}
        </Text>
        
        <Text style={styles.messageTime}>
          {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>

      {item.type === 'user' && (
        <Avatar.Image
          size={32}
          source={{ uri: user?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100' }}
          style={styles.userAvatar}
        />
      )}
    </View>
  );

  const renderSuggestions = (suggestions) => (
    <View style={styles.suggestionsContainer}>
      <Text style={styles.suggestionsTitle}>Quick responses:</Text>
      <View style={styles.suggestionsGrid}>
        {suggestions.map((suggestion, index) => (
          <Chip
            key={index}
            mode="outlined"
            onPress={() => handleSuggestionPress(suggestion)}
            style={styles.suggestionChip}>
            {suggestion}
          </Chip>
        ))}
      </View>
    </View>
  );

  const renderActionCards = (cards) => (
    <View style={styles.actionCardsContainer}>
      <Text style={styles.actionCardsTitle}>Quick actions:</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {cards.map((card) => (
          <TouchableOpacity
            key={card.id}
            style={styles.actionCard}
            onPress={() => handleActionCardPress(card)}>
            <LinearGradient
              colors={[card.color, `${card.color}CC`]}
              style={styles.actionCardGradient}>
              <Icon name={card.icon} size={24} color="white" />
              <Text style={styles.actionCardTitle}>{card.title}</Text>
              <Text style={styles.actionCardDescription}>{card.description}</Text>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderTypingIndicator = () => (
    <Animated.View style={[
      styles.messageContainer,
      styles.aiMessage,
      { opacity: typingAnim }
    ]}>
      <Avatar.Icon
        size={32}
        icon="smart-toy"
        style={styles.aiAvatar}
      />
      <View style={[styles.messageBubble, styles.aiBubble, styles.typingBubble]}>
        <View style={styles.typingDots}>
          <View style={styles.typingDot} />
          <View style={styles.typingDot} />
          <View style={styles.typingDot} />
        </View>
      </View>
    </Animated.View>
  );

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0.9],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Enhanced Header */}
      <Animated.View style={[styles.header, { opacity: headerOpacity }]}>
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}>
          
          <View style={styles.headerContent}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}>
              <Icon name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            
            <View style={styles.headerInfo}>
              <Text style={styles.headerTitle}>AI Coaching Assistant</Text>
              <Text style={styles.headerSubtitle}>Your intelligent training partner 🤖</Text>
            </View>
            
            <TouchableOpacity style={styles.settingsButton}>
              <Icon name="settings" size={24} color="white" />
            </TouchableOpacity>
          </View>

          {/* AI Status Indicator */}
          <View style={styles.statusContainer}>
            <View style={styles.statusIndicator}>
              <View style={styles.onlineIndicator} />
              <Text style={styles.statusText}>AI Assistant Online</Text>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>

      <KeyboardAvoidingView 
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
        
        {/* Feature Tabs */}
        <View style={styles.tabsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {['chat', 'insights', 'planning', 'analysis'].map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[styles.tab, activeFeature === tab && styles.activeTab]}
                onPress={() => setActiveFeature(tab)}>
                <Text style={[
                  styles.tabText,
                  activeFeature === tab && styles.activeTabText
                ]}>
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {activeFeature === 'chat' ? (
          <>
            {/* Chat Messages */}
            <FlatList
              ref={chatScrollRef}
              data={messages}
              keyExtractor={(item) => item.id}
              renderItem={renderMessage}
              style={styles.chatContainer}
              showsVerticalScrollIndicator={false}
              ListFooterComponent={() => (
                <View>
                  {isTyping && renderTypingIndicator()}
                  
                  {/* Render suggestions and action cards from last AI message */}
                  {messages.length > 0 && messages[messages.length - 1].type === 'ai' && (
                    <>
                      {messages[messages.length - 1].suggestions && 
                        renderSuggestions(messages[messages.length - 1].suggestions)}
                      {messages[messages.length - 1].actionCards && 
                        renderActionCards(messages[messages.length - 1].actionCards)}
                    </>
                  )}
                  
                  {/* Initial suggestions for new users */}
                  {messages.length === 1 && showSuggestions && (
                    <View style={styles.initialSuggestions}>
                      <Text style={styles.suggestionsTitle}>Try asking me about:</Text>
                      <View style={styles.quickFeaturesGrid}>
                        {quickFeatures.map((feature) => (
                          <TouchableOpacity
                            key={feature.id}
                            style={styles.quickFeatureCard}
                            onPress={() => handleSuggestionPress(feature.description)}>
                            <LinearGradient
                              colors={[feature.color, `${feature.color}CC`]}
                              style={styles.quickFeatureGradient}>
                              <Icon name={feature.icon} size={28} color="white" />
                              <Text style={styles.quickFeatureTitle}>{feature.title}</Text>
                              <Text style={styles.quickFeatureDescription}>{feature.description}</Text>
                            </LinearGradient>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  )}
                  
                  <View style={{ height: 20 }} />
                </View>
              )}
            />

            {/* Message Input */}
            <Surface style={styles.inputContainer}>
              <TextInput
                mode="outlined"
                placeholder="Ask me anything about coaching..."
                value={messageText}
                onChangeText={setMessageText}
                multiline
                maxLength={500}
                style={styles.messageInput}
                right={
                  <TextInput.Icon 
                    icon="send" 
                    onPress={handleSendMessage}
                    disabled={!messageText.trim()}
                  />
                }
              />
            </Surface>
          </>
        ) : (
          /* Other Feature Views */
          <ScrollView
            style={styles.featureContainer}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor="#667eea"
                colors={['#667eea', '#764ba2']}
              />
            }>
            
            {activeFeature === 'insights' && (
              <Animated.View style={[
                styles.featureContent,
                { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
              ]}>
                <Text style={styles.featureTitle}>AI Performance Insights 📊</Text>
                <Text style={styles.featureDescription}>
                  Advanced analytics powered by machine learning
                </Text>
                
                {aiCapabilities.map((capability, index) => (
                  <Card key={index} style={styles.capabilityCard}>
                    <Card.Content>
                      <View style={styles.capabilityHeader}>
                        <Icon name={capability.icon} size={32} color="#667eea" />
                        <View style={styles.capabilityInfo}>
                          <Text style={styles.capabilityTitle}>{capability.title}</Text>
                          <Text style={styles.capabilityDescription}>{capability.description}</Text>
                        </View>
                      </View>
                      <View style={styles.featuresContainer}>
                        {capability.features.map((feature, idx) => (
                          <Chip key={idx} mode="outlined" style={styles.featureChip}>
                            {feature}
                          </Chip>
                        ))}
                      </View>
                    </Card.Content>
                  </Card>
                ))}
              </Animated.View>
            )}

            {activeFeature === 'planning' && (
              <Animated.View style={[
                styles.featureContent,
                { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
              ]}>
                <Text style={styles.featureTitle}>Smart Training Planning 🧠</Text>
                <Text style={styles.featureDescription}>
                  AI-generated training plans tailored to your needs
                </Text>
                
                <Card style={styles.planningCard}>
                  <Card.Content>
                    <Text style={styles.planningTitle}>Quick Plan Generator</Text>
                    <Text style={styles.planningSubtitle}>Generate a training plan in seconds</Text>
                    
                    <View style={styles.planningOptions}>
                      <Button mode="contained" style={styles.planningButton}>
                        4-Week Program
                      </Button>
                      <Button mode="outlined" style={styles.planningButton}>
                        Custom Duration
                      </Button>
                    </View>
                    
                    <View style={styles.planningStats}>
                      <View style={styles.statItem}>
                        <Text style={styles.statValue}>10,000+</Text>
                        <Text style={styles.statLabel}>Plans Generated</Text>
                      </View>
                      <View style={styles.statItem}>
                        <Text style={styles.statValue}>95%</Text>
                        <Text style={styles.statLabel}>Success Rate</Text>
                      </View>
                      <View style={styles.statItem}>
                        <Text style={styles.statValue}>4.8⭐</Text>
                        <Text style={styles.statLabel}>Coach Rating</Text>
                      </View>
                    </View>
                  </Card.Content>
                </Card>
              </Animated.View>
            )}

            {activeFeature === 'analysis' && (
              <Animated.View style={[
                styles.featureContent,
                { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
              ]}>
                <Text style={styles.featureTitle}>Performance Analysis 📈</Text>
                <Text style={styles.featureDescription}>
                  Deep insights into player and team performance
                </Text>
                
                <Card style={styles.analysisCard}>
                  <Card.Content>
                    <Text style={styles.analysisTitle}>Recent Analysis</Text>
                    
                    <View style={styles.analysisItem}>
                      <Icon name="person" size={24} color="#4CAF50" />
                      <View style={styles.analysisContent}>
                        <Text style={styles.analysisText}>Player Performance Review</Text>
                        <Text style={styles.analysisSubtext}>5 players analyzed today</Text>
                      </View>
                      <Icon name="chevron-right" size={24} color="#666" />
                    </View>
                    
                    <View style={styles.analysisItem}>
                      <Icon name="group" size={24} color="#2196F3" />
                      <View style={styles.analysisContent}>
                        <Text style={styles.analysisText}>Team Dynamics Report</Text>
                        <Text style={styles.analysisSubtext}>Generated 2 hours ago</Text>
                      </View>
                      <Icon name="chevron-right" size={24} color="#666" />
                    </View>
                    
                    <View style={styles.analysisItem}>
                      <Icon name="trending-up" size={24} color="#FF9800" />
                      <View style={styles.analysisContent}>
                        <Text style={styles.analysisText}>Progress Tracking</Text>
                        <Text style={styles.analysisSubtext}>Weekly improvement detected</Text>
                      </View>
                      <Icon name="chevron-right" size={24} color="#666" />
                    </View>
                  </Card.Content>
                </Card>
              </Animated.View>
            )}
          </ScrollView>
        )}
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    zIndex: 1000,
  },
  headerGradient: {
    paddingTop: StatusBar.currentHeight + 10,
    paddingBottom: SPACING.md,
    paddingHorizontal: SPACING.md,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
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
    color: 'white',
    fontWeight: 'bold',
  },
  headerSubtitle: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  settingsButton: {
    padding: SPACING.xs,
  },
  statusContainer: {
    alignItems: 'center',
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 20,
  },
  onlineIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
    marginRight: SPACING.xs,
  },
  statusText: {
    ...TEXT_STYLES.caption,
    color: 'white',
    fontSize: 12,
  },
  content: {
    flex: 1,
  },
  tabsContainer: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingVertical: SPACING.sm,
  },
  tab: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    marginHorizontal: SPACING.xs,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  activeTab: {
    backgroundColor: '#667eea',
  },
  tabText: {
    ...TEXT_STYLES.body,
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: 'white',
  },
  chatContainer: {
    flex: 1,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginVertical: SPACING.xs,
  },
  userMessage: {
    justifyContent: 'flex-end',
  },
  aiMessage: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: width * 0.75,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
  },
  userBubble: {
    backgroundColor: '#667eea',
    marginRight: SPACING.xs,
    borderBottomRightRadius: 8,
  },
  aiBubble: {
    backgroundColor: 'white',
    marginLeft: SPACING.xs,
    borderBottomLeftRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  messageText: {
    ...TEXT_STYLES.body,
    lineHeight: 22,
  },
  userText: {
    color: 'white',
  },
  aiText: {
    color: '#333',
  },
  messageTime: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255,255,255,0.7)',
    margin
  },

})

export default AICoachingAssistant;