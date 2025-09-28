import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  StatusBar,
  Animated,
  Dimensions,
  RefreshControl,
  Vibration,
  Platform,
  TextInput,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
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
  Badge,
  Divider,
  Portal,
  Modal,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { BlurView } from '../../../components/shared/BlurView';

// Import your design system constants
import { COLORS, SPACING, TEXT_STYLES } from '../styles/theme';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const MotivationalMessages = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  
  // Redux state
  const user = useSelector(state => state.auth.user);
  const clients = useSelector(state => state.coaching.clients);
  
  // Local state
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [customMessage, setCustomMessage] = useState('');
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [selectedClients, setSelectedClients] = useState([]);
  const [showClientSelector, setShowClientSelector] = useState(false);
  const [messageHistory, setMessageHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [favoriteMessages, setFavoriteMessages] = useState(new Set());
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  
  // Message categories
  const categories = ['All', 'Motivation', 'Encouragement', 'Achievement', 'Challenge', 'Recovery', 'Mindset'];
  
  // Pre-built motivational messages
  const motivationalMessages = [
    {
      id: '1',
      category: 'Motivation',
      message: 'Push harder than yesterday if you want a different tomorrow! 💪',
      icon: 'fitness-center',
      color: '#ff6b6b',
      uses: 45
    },
    {
      id: '2',
      category: 'Encouragement',
      message: 'Your only limit is you! Break through and show what you\'re made of! 🔥',
      icon: 'trending-up',
      color: '#4ecdc4',
      uses: 38
    },
    {
      id: '3',
      category: 'Achievement',
      message: 'Champions train, losers complain. Which one are you today? 🏆',
      icon: 'jump-rope',
      color: '#45b7d1',
      uses: 52
    },
    {
      id: '4',
      category: 'Challenge',
      message: 'The pain you feel today will be the strength you feel tomorrow! ⚡',
      icon: 'flash-on',
      color: '#f39c12',
      uses: 41
    },
    {
      id: '5',
      category: 'Recovery',
      message: 'Rest when you\'re weary. Refresh and renew yourself. You deserve it! 🧘‍♂️',
      icon: 'self-improvement',
      color: '#9b59b6',
      uses: 29
    },
    {
      id: '6',
      category: 'Mindset',
      message: 'Believe in yourself and all that you are. You\'re stronger than you think! 🌟',
      icon: 'psychology',
      color: '#e74c3c',
      uses: 35
    },
    {
      id: '7',
      category: 'Motivation',
      message: 'Success isn\'t given. It\'s earned in the gym! Let\'s get after it! 🎯',
      icon: 'track-changes',
      color: '#27ae60',
      uses: 48
    },
    {
      id: '8',
      category: 'Encouragement',
      message: 'Every workout is progress. Every rep counts. You\'re doing amazing! 👏',
      icon: 'celebration',
      color: '#8e44ad',
      uses: 33
    },
    {
      id: '9',
      category: 'Achievement',
      message: 'You didn\'t come this far to only come this far. Keep pushing! 🚀',
      icon: 'rocket-launch',
      color: '#ff9f43',
      uses: 56
    },
    {
      id: '10',
      category: 'Challenge',
      message: 'Turn your can\'ts into cans and your dreams into plans! 💫',
      icon: 'auto-fix-high',
      color: '#00d2d3',
      uses: 42
    },
    {
      id: '11',
      category: 'Recovery',
      message: 'Your body achieves what your mind believes. Rest, recover, repeat! 💤',
      icon: 'bedtime',
      color: '#6c5ce7',
      uses: 28
    },
    {
      id: '12',
      category: 'Mindset',
      message: 'A strong mind creates a strong body. Mental toughness wins! 🧠',
      icon: 'psychology-alt',
      color: '#fd79a8',
      uses: 44
    }
  ];
  
  // Mock clients data
  const mockClients = [
    {
      id: '1',
      name: 'Sarah Johnson',
      avatar: 'https://i.pravatar.cc/150?img=1',
      status: 'active',
      lastWorkout: '2 hours ago',
      streak: 15
    },
    {
      id: '2',
      name: 'Mike Davis',
      avatar: 'https://i.pravatar.cc/150?img=2',
      status: 'active',
      lastWorkout: '1 day ago',
      streak: 8
    },
    {
      id: '3',
      name: 'Emma Wilson',
      avatar: 'https://i.pravatar.cc/150?img=3',
      status: 'inactive',
      lastWorkout: '3 days ago',
      streak: 3
    },
    {
      id: '4',
      name: 'Alex Chen',
      avatar: 'https://i.pravatar.cc/150?img=4',
      status: 'active',
      lastWorkout: '5 hours ago',
      streak: 22
    }
  ];

  // Effects
  useEffect(() => {
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
      })
    ]).start();
  }, []);

  // Handlers
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const sendMessage = (message, messageId = null) => {
    if (selectedClients.length === 0) {
      Alert.alert('⚠️ No Recipients', 'Please select at least one client to send the message to.');
      return;
    }

    const clientNames = selectedClients.map(id => {
      const client = mockClients.find(c => c.id === id);
      return client ? client.name : '';
    }).join(', ');

    // Add to message history
    const historyEntry = {
      id: Date.now().toString(),
      message: message.message || message,
      recipients: [...selectedClients],
      timestamp: new Date(),
      category: message.category || 'Custom',
      sentCount: selectedClients.length
    };
    
    setMessageHistory(prev => [historyEntry, ...prev]);
    
    // Update message usage count
    if (messageId) {
      const messageIndex = motivationalMessages.findIndex(m => m.id === messageId);
      if (messageIndex !== -1) {
        motivationalMessages[messageIndex].uses += selectedClients.length;
      }
    }

    Vibration.vibrate(100);
    Alert.alert(
      '📨 Message Sent!',
      `Your motivational message has been sent to: ${clientNames}`,
      [{ text: 'OK', onPress: () => setCustomMessage('') }]
    );
  };

  const sendCustomMessage = () => {
    if (!customMessage.trim()) {
      Alert.alert('⚠️ Empty Message', 'Please enter a message before sending.');
      return;
    }
    
    sendMessage(customMessage);
    setShowCustomModal(false);
    setCustomMessage('');
  };

  const toggleFavorite = (messageId) => {
    const newFavorites = new Set(favoriteMessages);
    if (newFavorites.has(messageId)) {
      newFavorites.delete(messageId);
    } else {
      newFavorites.add(messageId);
    }
    setFavoriteMessages(newFavorites);
    Vibration.vibrate(50);
  };

  const selectAllClients = () => {
    setSelectedClients(mockClients.map(c => c.id));
  };

  const selectActiveClients = () => {
    setSelectedClients(mockClients.filter(c => c.status === 'active').map(c => c.id));
  };

  const clearSelection = () => {
    setSelectedClients([]);
  };

  const toggleClientSelection = (clientId) => {
    setSelectedClients(prev => {
      if (prev.includes(clientId)) {
        return prev.filter(id => id !== clientId);
      } else {
        return [...prev, clientId];
      }
    });
  };

  const filteredMessages = motivationalMessages.filter(msg => {
    const matchesCategory = selectedCategory === 'All' || msg.category === selectedCategory;
    const matchesSearch = msg.message.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const renderMessageCard = (message) => (
    <Card key={message.id} style={styles.messageCard}>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => sendMessage(message, message.id)}
        onLongPress={() => toggleFavorite(message.id)}
      >
        <View style={styles.messageHeader}>
          <View style={[styles.messageIcon, { backgroundColor: message.color }]}>
            <Icon name={message.icon} size={24} color="#fff" />
          </View>
          <View style={styles.messageInfo}>
            <Text style={styles.messageCategory}>{message.category}</Text>
            <Text style={styles.messageUses}>Used {message.uses} times</Text>
          </View>
          <View style={styles.messageActions}>
            <TouchableOpacity onPress={() => toggleFavorite(message.id)} style={styles.favoriteButton}>
              <Icon 
                name={favoriteMessages.has(message.id) ? "favorite" : "favorite-border"} 
                size={20} 
                color={favoriteMessages.has(message.id) ? COLORS.error : COLORS.textSecondary} 
              />
            </TouchableOpacity>
          </View>
        </View>
        <Text style={styles.messageText}>{message.message}</Text>
        <View style={styles.messageFooter}>
          <Chip icon="send" mode="outlined" compact style={styles.sendChip}>
            Send Message
          </Chip>
        </View>
      </TouchableOpacity>
    </Card>
  );

  const renderClientSelector = () => (
    <Portal>
      <Modal visible={showClientSelector} onDismiss={() => setShowClientSelector(false)} contentContainerStyle={styles.modalContainer}>
        <View style={styles.clientSelectorModal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>👥 Select Recipients</Text>
            <TouchableOpacity onPress={() => setShowClientSelector(false)}>
              <Icon name="close" size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.selectionActions}>
            <Button mode="outlined" onPress={selectAllClients} compact>All</Button>
            <Button mode="outlined" onPress={selectActiveClients} compact>Active</Button>
            <Button mode="outlined" onPress={clearSelection} compact>Clear</Button>
          </View>
          
          <ScrollView style={styles.clientList}>
            {mockClients.map((client) => (
              <TouchableOpacity
                key={client.id}
                style={[
                  styles.clientItem,
                  selectedClients.includes(client.id) && styles.selectedClient
                ]}
                onPress={() => toggleClientSelection(client.id)}
              >
                <Avatar.Image size={40} source={{ uri: client.avatar }} />
                <View style={styles.clientInfo}>
                  <Text style={styles.clientName}>{client.name}</Text>
                  <Text style={styles.clientStatus}>
                    {client.status === 'active' ? '🟢' : '🔴'} {client.lastWorkout} • {client.streak} day streak
                  </Text>
                </View>
                {selectedClients.includes(client.id) && (
                  <Icon name="check-circle" size={24} color={COLORS.success} />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
          
          <View style={styles.modalFooter}>
            <Text style={styles.selectedCount}>
              {selectedClients.length} client{selectedClients.length !== 1 ? 's' : ''} selected
            </Text>
            <Button mode="contained" onPress={() => setShowClientSelector(false)}>
              Done
            </Button>
          </View>
        </View>
      </Modal>
    </Portal>
  );

  const renderCustomMessageModal = () => (
    <Portal>
      <Modal visible={showCustomModal} onDismiss={() => setShowCustomModal(false)} contentContainerStyle={styles.modalContainer}>
        <View style={styles.customMessageModal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>✍️ Custom Message</Text>
            <TouchableOpacity onPress={() => setShowCustomModal(false)}>
              <Icon name="close" size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>
          
          <TextInput
            style={styles.customMessageInput}
            placeholder="Write your motivational message..."
            value={customMessage}
            onChangeText={setCustomMessage}
            multiline
            numberOfLines={4}
            maxLength={200}
          />
          
          <Text style={styles.characterCount}>{customMessage.length}/200</Text>
          
          <View style={styles.quickTemplates}>
            <Text style={styles.templatesTitle}>Quick Templates:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {['You\'ve got this! 💪', 'Amazing progress! 🌟', 'Keep pushing! 🔥', 'Proud of you! 👏'].map((template, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.templateChip}
                  onPress={() => setCustomMessage(template)}
                >
                  <Text style={styles.templateText}>{template}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          
          <View style={styles.modalFooter}>
            <Button mode="outlined" onPress={() => setShowCustomModal(false)}>
              Cancel
            </Button>
            <Button mode="contained" onPress={sendCustomMessage}>
              Send Message
            </Button>
          </View>
        </View>
      </Modal>
    </Portal>
  );

  const renderMessageHistory = () => (
    <Portal>
      <Modal visible={showHistory} onDismiss={() => setShowHistory(false)} contentContainerStyle={styles.modalContainer}>
        <View style={styles.historyModal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>📜 Message History</Text>
            <TouchableOpacity onPress={() => setShowHistory(false)}>
              <Icon name="close" size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.historyList}>
            {messageHistory.length === 0 ? (
              <View style={styles.emptyHistory}>
                <Icon name="history" size={48} color={COLORS.textSecondary} />
                <Text style={styles.emptyHistoryText}>No messages sent yet</Text>
              </View>
            ) : (
              messageHistory.map((entry) => (
                <Card key={entry.id} style={styles.historyCard}>
                  <View style={styles.historyHeader}>
                    <Text style={styles.historyCategory}>{entry.category}</Text>
                    <Text style={styles.historyTime}>
                      {entry.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </View>
                  <Text style={styles.historyMessage}>{entry.message}</Text>
                  <Text style={styles.historySentCount}>
                    Sent to {entry.sentCount} client{entry.sentCount !== 1 ? 's' : ''}
                  </Text>
                </Card>
              ))
            )}
          </ScrollView>
        </View>
      </Modal>
    </Portal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerTitle}>
            <Text style={styles.title}>Motivational Messages</Text>
            <Text style={styles.subtitle}>Inspire & Encourage Your Clients</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={() => setShowHistory(true)} style={styles.headerAction}>
              <Icon name="history" size={24} color="#fff" />
              {messageHistory.length > 0 && <Badge size={16} style={styles.historyBadge}>{messageHistory.length}</Badge>}
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        {/* Recipients Selection */}
        <Card style={styles.recipientsCard}>
          <TouchableOpacity onPress={() => setShowClientSelector(true)} style={styles.recipientsSelector}>
            <View style={styles.recipientsInfo}>
              <Icon name="people" size={24} color={COLORS.primary} />
              <View style={styles.recipientsText}>
                <Text style={styles.recipientsTitle}>Recipients</Text>
                <Text style={styles.recipientsCount}>
                  {selectedClients.length === 0 
                    ? 'Select clients to send messages' 
                    : `${selectedClients.length} client${selectedClients.length !== 1 ? 's' : ''} selected`
                  }
                </Text>
              </View>
            </View>
            <Icon name="chevron-right" size={24} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </Card>

        {/* Search and Categories */}
        <View style={styles.filtersSection}>
          <Searchbar
            placeholder="Search motivational messages..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchBar}
            inputStyle={styles.searchInput}
          />
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
            {categories.map((category) => (
              <Chip
                key={category}
                mode={selectedCategory === category ? 'flat' : 'outlined'}
                selected={selectedCategory === category}
                onPress={() => setSelectedCategory(category)}
                style={styles.categoryChip}
                textStyle={styles.categoryChipText}
              >
                {category}
              </Chip>
            ))}
          </ScrollView>
        </View>

        {/* Messages List */}
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
          style={styles.messagesList}
        >
          {filteredMessages.length === 0 ? (
            <Card style={styles.emptyCard}>
              <View style={styles.emptyContent}>
                <Icon name="search-off" size={64} color={COLORS.textSecondary} />
                <Text style={styles.emptyTitle}>No Messages Found</Text>
                <Text style={styles.emptySubtitle}>
                  Try adjusting your search or category filter
                </Text>
              </View>
            </Card>
          ) : (
            <View style={styles.messagesGrid}>
              {filteredMessages.map(renderMessageCard)}
            </View>
          )}
        </ScrollView>
      </Animated.View>

      {/* Floating Action Button */}
      <FAB
        style={styles.fab}
        icon="edit"
        label="Custom Message"
        onPress={() => setShowCustomModal(true)}
        color="#fff"
      />

      {/* Modals */}
      {renderClientSelector()}
      {renderCustomMessageModal()}
      {renderMessageHistory()}
    </SafeAreaView>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: SPACING.lg,
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: SPACING.sm,
  },
  headerTitle: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    ...TEXT_STYLES.h2,
    color: '#fff',
    fontWeight: 'bold',
  },
  subtitle: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255,255,255,0.8)',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerAction: {
    padding: SPACING.sm,
    position: 'relative',
  },
  historyBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: COLORS.error,
  },
  content: {
    flex: 1,
    padding: SPACING.md,
  },
  recipientsCard: {
    marginBottom: SPACING.md,
    backgroundColor: '#fff',
    elevation: 2,
  },
  recipientsSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
  },
  recipientsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  recipientsText: {
    marginLeft: SPACING.sm,
    flex: 1,
  },
  recipientsTitle: {
    ...TEXT_STYLES.body,
    fontWeight: 'bold',
  },
  recipientsCount: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
  },
  filtersSection: {
    marginBottom: SPACING.md,
  },
  searchBar: {
    backgroundColor: '#f5f5f5',
    elevation: 0,
    marginBottom: SPACING.sm,
  },
  searchInput: {
    fontSize: 14,
  },
  categoriesScroll: {
    marginHorizontal: -SPACING.md,
    paddingHorizontal: SPACING.md,
  },
  categoryChip: {
    marginRight: SPACING.sm,
  },
  categoryChipText: {
    fontSize: 12,
  },
  messagesList: {
    flex: 1,
  },
  messagesGrid: {
    gap: SPACING.sm,
    paddingBottom: 80,
  },
  messageCard: {
    backgroundColor: '#fff',
    elevation: 2,
    marginBottom: SPACING.sm,
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  messageIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageInfo: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  messageCategory: {
    ...TEXT_STYLES.caption,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  messageUses: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
  },
  messageActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  favoriteButton: {
    padding: SPACING.xs,
  },
  messageText: {
    ...TEXT_STYLES.body,
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.sm,
    lineHeight: 22,
  },
  messageFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: SPACING.md,
    paddingTop: 0,
  },
  sendChip: {
    backgroundColor: COLORS.primary,
  },
  emptyCard: {
    padding: SPACING.xl,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  emptyContent: {
    alignItems: 'center',
  },
  emptyTitle: {
    ...TEXT_STYLES.h3,
    marginTop: SPACING.md,
    textAlign: 'center',
  },
  emptySubtitle: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.md,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  clientSelectorModal: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: screenWidth * 0.9,
    maxHeight: screenHeight * 0.8,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    ...TEXT_STYLES.h3,
    fontWeight: 'bold',
  },
  selectionActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  clientList: {
    flex: 1,
    maxHeight: 300,
  },
  clientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  selectedClient: {
    backgroundColor: '#f0f7ff',
  },
  clientInfo: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  clientName: {
    ...TEXT_STYLES.body,
    fontWeight: 'bold',
  },
  clientStatus: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
  },
  modalFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  selectedCount: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
  },
  customMessageModal: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: screenWidth * 0.9,
    maxHeight: screenHeight * 0.7,
  },
  customMessageInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: SPACING.md,
    margin: SPACING.md,
    minHeight: 120,
    textAlignVertical: 'top',
    fontSize: 16,
  },
  characterCount: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    textAlign: 'right',
    marginHorizontal: SPACING.md,
  },
  quickTemplates: {
    padding: SPACING.md,
  },
  templatesTitle: {
    ...TEXT_STYLES.body,
    fontWeight: 'bold',
    marginBottom: SPACING.sm,
  },
  templateChip: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    marginRight: SPACING.sm,
  },
  templateText: {
    ...TEXT_STYLES.caption,
    color: COLORS.primary,
  },
  historyModal: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: screenWidth * 0.9,
    maxHeight: screenHeight * 0.8,
  },
  historyList: {
    flex: 1,
    maxHeight: 400,
    padding: SPACING.md,
  },
  emptyHistory: {
    alignItems: 'center',
    padding: SPACING.xl,
  },
  emptyHistoryText: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
  },
  historyCard: {
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    backgroundColor: '#fff',
    elevation: 1,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  historyCategory: {
    ...TEXT_STYLES.caption,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  historyTime: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
  },
  historyMessage: {
    ...TEXT_STYLES.body,
    marginBottom: SPACING.xs,
  },
  historySentCount: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
};

export default MotivationalMessages;