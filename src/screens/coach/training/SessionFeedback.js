import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  Alert,
  Animated,
  Dimensions,
  TouchableOpacity,
  Modal,
  RefreshControl,
  FlatList,
} from 'react-native';
import { 
  Card,
  Button,
  Chip,
  TextInput,
  Avatar,
  IconButton,
  FAB,
  Surface,
  Portal,
  Searchbar,
  RadioButton,
  Divider,
  ProgressBar,
} from 'react-native-paper';
import { LinearGradient } from '../../../components/shared/LinearGradient';
import { BlurView } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';

// Constants
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  background: '#f5f5f5',
  white: '#FFFFFF',
  text: '#333333',
  textSecondary: '#666666',
  border: '#E0E0E0',
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

const TEXT_STYLES = {
  h1: { fontSize: 28, fontWeight: 'bold', color: COLORS.text },
  h2: { fontSize: 24, fontWeight: 'bold', color: COLORS.text },
  h3: { fontSize: 20, fontWeight: '600', color: COLORS.text },
  body: { fontSize: 16, color: COLORS.text },
  caption: { fontSize: 14, color: COLORS.textSecondary },
  small: { fontSize: 12, color: COLORS.textSecondary },
};

const { width } = Dimensions.get('window');

const FEEDBACK_CATEGORIES = [
  { value: 'all', label: 'All Feedback', icon: 'feedback', color: COLORS.primary },
  { value: 'training', label: 'Training Quality', icon: 'fitness-center', color: COLORS.success },
  { value: 'coaching', label: 'Coaching Style', icon: 'sports', color: COLORS.warning },
  { value: 'facilities', label: 'Facilities', icon: 'place', color: COLORS.error },
  { value: 'communication', label: 'Communication', icon: 'chat', color: COLORS.secondary },
  { value: 'suggestions', label: 'Suggestions', icon: 'lightbulb', color: '#9C27B0' },
];

const RATING_LABELS = {
  1: { label: 'Poor', color: COLORS.error, emoji: '😞' },
  2: { label: 'Below Average', color: '#FF5722', emoji: '😕' },
  3: { label: 'Average', color: COLORS.warning, emoji: '😐' },
  4: { label: 'Good', color: '#2196F3', emoji: '🙂' },
  5: { label: 'Excellent', color: COLORS.success, emoji: '😊' },
};

const SessionFeedback = ({ navigation, route }) => {
  // Redux state
  const { user, currentSession } = useSelector(state => state.auth);
  const dispatch = useDispatch();

  // Route params
  const sessionId = route?.params?.sessionId || 'session_001';

  // State
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [feedback, setFeedback] = useState([]);
  const [filteredFeedback, setFilteredFeedback] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [responseText, setResponseText] = useState('');
  const [sortBy, setSortBy] = useState('newest'); // newest, oldest, rating_high, rating_low
  const [showFilters, setShowFilters] = useState(false);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const statsAnim = useRef(new Animated.Value(0)).current;

  // Mock data
  const [mockFeedback] = useState([
    {
      id: 'fb_001',
      playerId: 'player_001',
      playerName: 'John Smith',
      playerAvatar: null,
      type: 'player',
      category: 'training',
      rating: 5,
      title: 'Excellent Training Session!',
      message: 'Really enjoyed today\'s session. The new passing drills were challenging but very helpful. I can already see improvement in my technique.',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      responded: false,
      helpful: 3,
      tags: ['technical', 'improvement', 'passing'],
      sessionDate: '2024-01-15',
    },
    {
      id: 'fb_002',
      playerId: 'parent_001',
      playerName: 'Mike Johnson',
      playerAvatar: null,
      type: 'parent',
      category: 'communication',
      rating: 4,
      title: 'Good Communication',
      message: 'Appreciate the regular updates about my son\'s progress. Would love to see more specific areas for improvement at home.',
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
      responded: true,
      response: 'Thank you for the feedback! I\'ll prepare a detailed report for Mike\'s home practice.',
      helpful: 2,
      tags: ['communication', 'progress', 'home-practice'],
      sessionDate: '2024-01-15',
    },
    {
      id: 'fb_003',
      playerId: 'player_002',
      playerName: 'Alex Wilson',
      playerAvatar: null,
      type: 'player',
      category: 'facilities',
      rating: 3,
      title: 'Field Conditions',
      message: 'The main field was quite muddy today. Maybe we could use the indoor facility when weather is bad?',
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
      responded: false,
      helpful: 1,
      tags: ['facilities', 'weather', 'indoor'],
      sessionDate: '2024-01-14',
    },
    {
      id: 'fb_004',
      playerId: 'player_003',
      playerName: 'Chris Brown',
      playerAvatar: null,
      type: 'player',
      category: 'coaching',
      rating: 5,
      title: 'Amazing Individual Attention',
      message: 'Coach really took time to help me with my weak foot. The personalized drills made a huge difference!',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
      responded: true,
      response: 'Keep practicing those drills at home! You\'re making great progress.',
      helpful: 5,
      tags: ['individual', 'technique', 'improvement'],
      sessionDate: '2024-01-13',
    },
    {
      id: 'fb_005',
      playerId: 'parent_002',
      playerName: 'David Lee',
      playerAvatar: null,
      type: 'parent',
      category: 'suggestions',
      rating: 4,
      title: 'Session Duration',
      message: 'David loves the training but gets quite tired by the end of 90 minutes. Maybe shorter sessions for younger players?',
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
      responded: false,
      helpful: 2,
      tags: ['duration', 'younger-players', 'fatigue'],
      sessionDate: '2024-01-12',
    },
  ]);

  // Initialize animations
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
      }),
    ]).start();

    setFeedback(mockFeedback);
    setFilteredFeedback(mockFeedback);
  }, []);

  // Filter and sort feedback
  useEffect(() => {
    let filtered = mockFeedback.filter(item => {
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const matchesSearch = searchQuery === '' || 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.playerName.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });

    // Sort feedback
    switch (sortBy) {
      case 'oldest':
        filtered = filtered.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        break;
      case 'rating_high':
        filtered = filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'rating_low':
        filtered = filtered.sort((a, b) => a.rating - b.rating);
        break;
      default: // newest
        filtered = filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }

    setFilteredFeedback(filtered);
  }, [selectedCategory, searchQuery, sortBy, mockFeedback]);

  // Calculate statistics
  const calculateStats = useCallback(() => {
    const stats = {
      total: mockFeedback.length,
      averageRating: mockFeedback.reduce((sum, item) => sum + item.rating, 0) / mockFeedback.length,
      responseRate: (mockFeedback.filter(item => item.responded).length / mockFeedback.length) * 100,
      byCategory: {},
      byRating: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      byType: { player: 0, parent: 0 },
      trends: {
        thisWeek: mockFeedback.filter(item => 
          new Date(item.timestamp) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        ).length,
        responseTime: 24, // hours average
      }
    };

    // Calculate by category
    FEEDBACK_CATEGORIES.forEach(cat => {
      if (cat.value !== 'all') {
        stats.byCategory[cat.value] = mockFeedback.filter(item => item.category === cat.value).length;
      }
    });

    // Calculate by rating
    mockFeedback.forEach(item => {
      stats.byRating[item.rating]++;
    });

    // Calculate by type
    mockFeedback.forEach(item => {
      stats.byType[item.type]++;
    });

    return stats;
  }, [mockFeedback]);

  // Handlers
  const handleCategorySelect = useCallback((category) => {
    setSelectedCategory(category);
  }, []);

  const handleFeedbackPress = useCallback((feedbackItem) => {
    setSelectedFeedback(feedbackItem);
    setShowFeedbackModal(true);
  }, []);

  const handleResponseSubmit = useCallback(() => {
    if (!responseText.trim()) {
      Alert.alert('Error', 'Please enter a response');
      return;
    }

    Alert.alert(
      'Response Sent! 📧',
      'Your response has been sent to the feedback provider',
      [
        {
          text: 'OK',
          onPress: () => {
            setShowResponseModal(false);
            setResponseText('');
            setShowFeedbackModal(false);
          },
        },
      ]
    );
  }, [responseText]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => setRefreshing(false), 2000);
  }, []);

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInHours = Math.floor((now - time) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return time.toLocaleDateString();
  };

  // Render feedback card
  const renderFeedbackCard = ({ item }) => (
    <TouchableOpacity onPress={() => handleFeedbackPress(item)}>
      <Card style={styles.feedbackCard}>
        <Card.Content>
          <View style={styles.feedbackHeader}>
            <View style={styles.playerInfo}>
              <Avatar.Text
                size={40}
                label={item.playerName.split(' ').map(n => n[0]).join('')}
                style={[
                  styles.playerAvatar,
                  { backgroundColor: item.type === 'parent' ? COLORS.secondary : COLORS.primary }
                ]}
              />
              <View style={styles.playerDetails}>
                <Text style={TEXT_STYLES.body}>{item.playerName}</Text>
                <View style={styles.playerMeta}>
                  <Chip
                    mode="flat"
                    style={[styles.typeChip, {
                      backgroundColor: item.type === 'parent' ? COLORS.secondary : COLORS.primary
                    }]}
                    textStyle={styles.typeChipText}
                  >
                    {item.type.toUpperCase()}
                  </Chip>
                  <Text style={styles.timeText}>{formatTimeAgo(item.timestamp)}</Text>
                </View>
              </View>
            </View>
            
            <View style={styles.ratingContainer}>
              <View style={styles.starRating}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Icon
                    key={star}
                    name={star <= item.rating ? 'star' : 'star-border'}
                    size={16}
                    color={star <= item.rating ? COLORS.warning : COLORS.border}
                  />
                ))}
              </View>
              <Text style={styles.ratingText}>
                {RATING_LABELS[item.rating].emoji} {RATING_LABELS[item.rating].label}
              </Text>
            </View>
          </View>
          
          <Text style={styles.feedbackTitle}>{item.title}</Text>
          <Text style={styles.feedbackMessage} numberOfLines={3}>
            {item.message}
          </Text>
          
          <View style={styles.feedbackFooter}>
            <View style={styles.tags}>
              {item.tags.slice(0, 2).map((tag) => (
                <Chip key={tag} mode="flat" style={styles.tag} textStyle={styles.tagText}>
                  #{tag}
                </Chip>
              ))}
              {item.tags.length > 2 && (
                <Text style={styles.moreTags}>+{item.tags.length - 2}</Text>
              )}
            </View>
            
            <View style={styles.feedbackActions}>
              {item.responded ? (
                <Chip
                  mode="flat"
                  style={styles.respondedChip}
                  icon="check-circle"
                  textStyle={styles.respondedText}
                >
                  Responded
                </Chip>
              ) : (
                <Chip
                  mode="flat"
                  style={styles.pendingChip}
                  icon="schedule"
                  textStyle={styles.pendingText}
                >
                  Pending
                </Chip>
              )}
              <View style={styles.helpful}>
                <Icon name="thumb-up" size={16} color={COLORS.textSecondary} />
                <Text style={styles.helpfulText}>{item.helpful}</Text>
              </View>
            </View>
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  // Render category filter
  const renderCategoryFilter = () => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.categoryScrollContent}
      style={styles.categoryScroll}
    >
      {FEEDBACK_CATEGORIES.map((category) => (
        <TouchableOpacity
          key={category.value}
          onPress={() => handleCategorySelect(category.value)}
          style={[
            styles.categoryChip,
            selectedCategory === category.value && styles.categoryChipSelected
          ]}
        >
          <Icon 
            name={category.icon} 
            size={18} 
            color={selectedCategory === category.value ? COLORS.white : category.color} 
          />
          <Text style={[
            styles.categoryText,
            { color: selectedCategory === category.value ? COLORS.white : category.color }
          ]}>
            {category.label}
          </Text>
          {category.value !== 'all' && (
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeText}>
                {mockFeedback.filter(item => item.category === category.value).length}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  // Render statistics overview
  const renderStatsOverview = () => {
    const stats = calculateStats();
    
    return (
      <Card style={styles.statsCard}>
        <LinearGradient
          colors={[COLORS.primary, COLORS.secondary]}
          style={styles.statsGradient}
        >
          <Card.Content>
            <View style={styles.statsHeader}>
              <Text style={styles.statsTitle}>Feedback Overview 📊</Text>
              <TouchableOpacity onPress={() => setShowStatsModal(true)}>
                <Text style={styles.viewDetailsText}>View Details</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats.total}</Text>
                <Text style={styles.statLabel}>Total</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats.averageRating.toFixed(1)}⭐</Text>
                <Text style={styles.statLabel}>Avg Rating</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{Math.round(stats.responseRate)}%</Text>
                <Text style={styles.statLabel}>Responded</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats.trends.thisWeek}</Text>
                <Text style={styles.statLabel}>This Week</Text>
              </View>
            </View>
          </Card.Content>
        </LinearGradient>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={COLORS.primary}
        translucent
      />
      
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <IconButton
            icon="arrow-back"
            size={24}
            iconColor={COLORS.white}
            onPress={() => navigation.goBack()}
          />
          <Text style={styles.headerTitle}>Session Feedback</Text>
          <IconButton
            icon="filter-list"
            size={24}
            iconColor={COLORS.white}
            onPress={() => setShowFilters(!showFilters)}
          />
        </View>
        
        <Text style={styles.headerSubtitle}>
          Manage and respond to training feedback
        </Text>
      </LinearGradient>

      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {/* Statistics Overview */}
        {renderStatsOverview()}
        
        {/* Search and Filters */}
        <Card style={styles.searchCard}>
          <Card.Content>
            <Searchbar
              placeholder="Search feedback..."
              onChangeText={setSearchQuery}
              value={searchQuery}
              style={styles.searchBar}
            />
            
            {showFilters && (
              <View style={styles.filtersContainer}>
                <Text style={styles.filterLabel}>Sort by:</Text>
                <View style={styles.sortOptions}>
                  {[
                    { value: 'newest', label: 'Newest' },
                    { value: 'oldest', label: 'Oldest' },
                    { value: 'rating_high', label: 'Highest Rating' },
                    { value: 'rating_low', label: 'Lowest Rating' },
                  ].map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      onPress={() => setSortBy(option.value)}
                      style={[
                        styles.sortOption,
                        sortBy === option.value && styles.sortOptionSelected
                      ]}
                    >
                      <Text style={[
                        styles.sortOptionText,
                        sortBy === option.value && styles.sortOptionTextSelected
                      ]}>
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </Card.Content>
        </Card>
        
        {/* Category Filters */}
        {renderCategoryFilter()}
        
        {/* Feedback List */}
        <View style={styles.feedbackContainer}>
          <Text style={styles.sectionTitle}>
            {selectedCategory === 'all' ? 'All Feedback' : 
             FEEDBACK_CATEGORIES.find(cat => cat.value === selectedCategory)?.label} 
            ({filteredFeedback.length})
          </Text>
          
          <FlatList
            data={filteredFeedback}
            renderItem={renderFeedbackCard}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[COLORS.primary]}
                tintColor={COLORS.primary}
              />
            }
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Icon name="feedback" size={64} color={COLORS.textSecondary} />
                <Text style={styles.emptyStateText}>No feedback found</Text>
                <Text style={styles.emptyStateSubtext}>
                  {searchQuery ? 'Try adjusting your search' : 'Feedback will appear here as it\'s received'}
                </Text>
              </View>
            }
          />
        </View>
      </Animated.View>

      {/* Floating Action Button */}
      <FAB
        icon="add-comment"
        style={styles.fab}
        onPress={() => Alert.alert('Feature Coming Soon! 🚀', 'Request feedback feature will be available soon')}
        color={COLORS.white}
      />

      {/* Feedback Detail Modal */}
      <Portal>
        <Modal
          visible={showFeedbackModal}
          onDismiss={() => setShowFeedbackModal(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <BlurView intensity={80} style={styles.modalBlur}>
            <Card style={styles.feedbackModal}>
              <Card.Content>
                {selectedFeedback && (
                  <ScrollView showsVerticalScrollIndicator={false}>
                    <View style={styles.modalHeader}>
                      <Avatar.Text
                        size={50}
                        label={selectedFeedback.playerName.split(' ').map(n => n[0]).join('')}
                        style={[
                          styles.modalAvatar,
                          { backgroundColor: selectedFeedback.type === 'parent' ? COLORS.secondary : COLORS.primary }
                        ]}
                      />
                      <View style={styles.modalPlayerInfo}>
                        <Text style={TEXT_STYLES.h3}>{selectedFeedback.playerName}</Text>
                        <Text style={TEXT_STYLES.caption}>
                          {selectedFeedback.type === 'parent' ? 'Parent' : 'Player'} • {formatTimeAgo(selectedFeedback.timestamp)}
                        </Text>
                      </View>
                    </View>
                    
                    <View style={styles.modalRating}>
                      <View style={styles.modalStarRating}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Icon
                            key={star}
                            name={star <= selectedFeedback.rating ? 'star' : 'star-border'}
                            size={20}
                            color={star <= selectedFeedback.rating ? COLORS.warning : COLORS.border}
                          />
                        ))}
                      </View>
                      <Text style={styles.modalRatingText}>
                        {RATING_LABELS[selectedFeedback.rating].emoji} {RATING_LABELS[selectedFeedback.rating].label}
                      </Text>
                    </View>
                    
                    <Text style={styles.modalTitle}>{selectedFeedback.title}</Text>
                    <Text style={styles.modalMessage}>{selectedFeedback.message}</Text>
                    
                    <View style={styles.modalTags}>
                      {selectedFeedback.tags.map((tag) => (
                        <Chip key={tag} mode="flat" style={styles.modalTag}>
                          #{tag}
                        </Chip>
                      ))}
                    </View>
                    
                    {selectedFeedback.responded && selectedFeedback.response && (
                      <View style={styles.responseSection}>
                        <Text style={styles.responseTitle}>Your Response:</Text>
                        <Text style={styles.responseText}>{selectedFeedback.response}</Text>
                      </View>
                    )}
                    
                    <View style={styles.modalActions}>
                      <Button
                        mode="outlined"
                        onPress={() => setShowFeedbackModal(false)}
                        style={styles.modalButton}
                      >
                        Close
                      </Button>
                      {!selectedFeedback.responded && (
                        <Button
                          mode="contained"
                          onPress={() => {
                            setShowFeedbackModal(false);
                            setShowResponseModal(true);
                          }}
                          style={styles.modalButton}
                          icon="reply"
                        >
                          Respond
                        </Button>
                      )}
                    </View>
                  </ScrollView>
                )}
              </Card.Content>
            </Card>
          </BlurView>
        </Modal>
      </Portal>

      {/* Response Modal */}
      <Portal>
        <Modal
          visible={showResponseModal}
          onDismiss={() => setShowResponseModal(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <BlurView intensity={80} style={styles.modalBlur}>
            <Card style={styles.responseModal}>
              <Card.Content>
                <Text style={TEXT_STYLES.h2}>Respond to Feedback</Text>
                
                <TextInput
                  label="Your Response"
                  value={responseText}
                  onChangeText={setResponseText}
                  mode="outlined"
                  multiline
                  numberOfLines={6}
                  style={styles.responseInput}
                  placeholder="Write a thoughtful response to acknowledge the feedback..."
                />
                
                <View style={styles.responseActions}>
                  <Button
                    mode="outlined"
                    onPress={() => setShowResponseModal(false)}
                    style={styles.responseButton}
                  >
                    Cancel
                  </Button>
                  <Button
                    mode="contained"
                    onPress={handleResponseSubmit}
                    style={styles.responseButton}
                    icon="send"
                  >
                    Send Response
                  </Button>
                </View>
              </Card.Content>
            </Card>
          </BlurView>
        </Modal>
      </Portal>

      {/* Statistics Modal */}
      <Portal>
        <Modal
          visible={showStatsModal}
          onDismiss={() => setShowStatsModal(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <BlurView intensity={80} style={styles.modalBlur}>
            <Card style={styles.statsModal}>
              <Card.Content>
                <Text style={TEXT_STYLES.h2}>Detailed Statistics</Text>
                
                <ScrollView showsVerticalScrollIndicator={false} style={styles.statsScrollView}>
                  {(() => {
                    const stats = calculateStats();
                    return (
                      <View>
                        <Text style={styles.statsSection}>Rating Distribution</Text>
                        {[5, 4, 3, 2, 1].map((rating) => (
                          <View key={rating} style={styles.ratingDistribution}>
                            <View style={styles.ratingLabel}>
                              <Text>{rating}</Text>
                              <Icon name="star" size={16} color={COLORS.warning} />
                            </View>
                            <ProgressBar
                              progress={stats.byRating[rating] / stats.total}
                              color={RATING_LABELS[rating].color}
                              style={styles.ratingProgressBar}
                            />
                            <Text style={styles.ratingCount}>{stats.byRating[rating]}</Text>
                          </View>
                        ))}
                        
                        <Text style={styles.statsSection}>Feedback by Category</Text>
                        {Object.entries(stats.byCategory).map(([category, count]) => (
                          <View key={category} style={styles.categoryStats}>
                            <Text style={styles.categoryStatsLabel}>
                              {FEEDBACK_CATEGORIES.find(cat => cat.value === category)?.label}
                            </Text>
                            <Text style={styles.categoryStatsCount}>{count}</Text>
                          </View>
                        ))}
                        
                        <Text style={styles.statsSection}>Response Metrics</Text>
                        <View style={styles.responseMetrics}>
                          <View style={styles.metricItem}>
                            <Text style={styles.metricValue}>{Math.round(stats.responseRate)}%</Text>
                            <Text style={styles.metricLabel}>Response Rate</Text>
                          </View>
                          <View style={styles.metricItem}>
                            <Text style={styles.metricValue}>{stats.trends.responseTime}h</Text>
                            <Text style={styles.metricLabel}>Avg Response Time</Text>
                          </View>
                        </View>
                      </View>
                    );
                  })()}
                </ScrollView>
                
                <Button
                  mode="outlined"
                  onPress={() => setShowStatsModal(false)}
                  style={styles.modalCloseButton}
                >
                  Close
                </Button>
              </Card.Content>
            </Card>
          </BlurView>
        </Modal>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: 50,
    paddingBottom: SPACING.lg,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.white,
    opacity: 0.9,
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
  content: {
    flex: 1,
    padding: SPACING.md,
  },
  
  // Statistics Card
  statsCard: {
    marginBottom: SPACING.md,
    borderRadius: 12,
    overflow: 'hidden',
  },
  statsGradient: {
    padding: 0,
  },
  statsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  viewDetailsText: {
    color: COLORS.white,
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.white,
    opacity: 0.8,
    marginTop: SPACING.xs,
  },
  
  // Search and Filters
  searchCard: {
    marginBottom: SPACING.md,
    borderRadius: 12,
  },
  searchBar: {
    backgroundColor: COLORS.white,
  },
  filtersContainer: {
    marginTop: SPACING.md,
  },
  filterLabel: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    marginBottom: SPACING.sm,
  },
  sortOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  sortOption: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.background,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sortOptionSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  sortOptionText: {
    fontSize: 14,
    color: COLORS.text,
  },
  sortOptionTextSelected: {
    color: COLORS.white,
  },
  
  // Category Filters
  categoryScroll: {
    marginBottom: SPACING.md,
  },
  categoryScrollContent: {
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.white,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: SPACING.xs,
  },
  categoryChipSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
  },
  categoryBadge: {
    backgroundColor: COLORS.error,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: SPACING.xs,
  },
  categoryBadgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
  
  // Feedback Container
  feedbackContainer: {
    flex: 1,
  },
  sectionTitle: {
    ...TEXT_STYLES.h3,
    marginBottom: SPACING.md,
  },
  
  // Feedback Cards
  feedbackCard: {
    marginBottom: SPACING.md,
    borderRadius: 12,
  },
  feedbackHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  playerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  playerAvatar: {
    marginRight: SPACING.md,
  },
  playerDetails: {
    flex: 1,
  },
  playerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginTop: SPACING.xs,
  },
  typeChip: {
    height: 20,
    opacity: 0.9,
  },
  typeChipText: {
    fontSize: 10,
    color: COLORS.white,
    fontWeight: 'bold',
  },
  timeText: {
    ...TEXT_STYLES.small,
  },
  ratingContainer: {
    alignItems: 'flex-end',
  },
  starRating: {
    flexDirection: 'row',
    marginBottom: SPACING.xs,
  },
  ratingText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  feedbackTitle: {
    ...TEXT_STYLES.h3,
    fontSize: 18,
    marginBottom: SPACING.sm,
  },
  feedbackMessage: {
    ...TEXT_STYLES.body,
    lineHeight: 22,
    marginBottom: SPACING.md,
  },
  feedbackFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tags: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  tag: {
    height: 24,
    marginRight: SPACING.xs,
  },
  tagText: {
    fontSize: 10,
    color: COLORS.textSecondary,
  },
  moreTags: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginLeft: SPACING.xs,
  },
  feedbackActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  respondedChip: {
    height: 24,
    backgroundColor: COLORS.success,
  },
  respondedText: {
    fontSize: 10,
    color: COLORS.white,
    fontWeight: 'bold',
  },
  pendingChip: {
    height: 24,
    backgroundColor: COLORS.warning,
  },
  pendingText: {
    fontSize: 10,
    color: COLORS.white,
    fontWeight: 'bold',
  },
  helpful: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  helpfulText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  
  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  emptyStateText: {
    ...TEXT_STYLES.h3,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  emptyStateSubtext: {
    ...TEXT_STYLES.caption,
    textAlign: 'center',
  },
  
  // FAB
  fab: {
    position: 'absolute',
    right: SPACING.md,
    bottom: SPACING.md,
    backgroundColor: COLORS.primary,
  },
  
  // Modal Styles
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: SPACING.md,
  },
  modalBlur: {
    flex: 1,
    justifyContent: 'center',
  },
  
  // Feedback Detail Modal
  feedbackModal: {
    margin: SPACING.md,
    borderRadius: 12,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  modalAvatar: {
    marginRight: SPACING.md,
  },
  modalPlayerInfo: {
    flex: 1,
  },
  modalRating: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  modalStarRating: {
    flexDirection: 'row',
    marginBottom: SPACING.sm,
  },
  modalRatingText: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  modalTitle: {
    ...TEXT_STYLES.h2,
    marginBottom: SPACING.md,
  },
  modalMessage: {
    ...TEXT_STYLES.body,
    lineHeight: 24,
    marginBottom: SPACING.lg,
  },
  modalTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  modalTag: {
    backgroundColor: COLORS.background,
  },
  responseSection: {
    backgroundColor: COLORS.background,
    padding: SPACING.md,
    borderRadius: 8,
    marginBottom: SPACING.lg,
  },
  responseTitle: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    marginBottom: SPACING.sm,
  },
  responseText: {
    ...TEXT_STYLES.body,
    fontStyle: 'italic',
  },
  modalActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  modalButton: {
    flex: 1,
  },
  
  // Response Modal
  responseModal: {
    margin: SPACING.md,
    borderRadius: 12,
  },
  responseInput: {
    backgroundColor: COLORS.white,
    marginVertical: SPACING.lg,
  },
  responseActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  responseButton: {
    flex: 1,
  },
  
  // Statistics Modal
  statsModal: {
    margin: SPACING.md,
    borderRadius: 12,
    maxHeight: '80%',
  },
  statsScrollView: {
    maxHeight: 400,
    marginVertical: SPACING.md,
  },
  statsSection: {
    ...TEXT_STYLES.h3,
    fontSize: 16,
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
  },
  ratingDistribution: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  ratingLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 40,
  },
  ratingProgressBar: {
    flex: 1,
    height: 8,
    borderRadius: 4,
  },
  ratingCount: {
    width: 30,
    textAlign: 'right',
    fontSize: 14,
    color: COLORS.text,
  },
  categoryStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  categoryStatsLabel: {
    ...TEXT_STYLES.body,
  },
  categoryStatsCount: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
  },
  responseMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  metricItem: {
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  metricLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  modalCloseButton: {
    marginTop: SPACING.md,
  },
});

export default SessionFeedback;