import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
  RefreshControl,
  Alert,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { 
  Card,
  Button,
  FAB,
  Avatar,
  Surface,
  Portal,
  Dialog,
  TextInput,
  Chip,
  ProgressBar,
  Badge,
  Searchbar,
  Divider,
} from 'react-native-paper';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';
import { StatusBar } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

// Design system constants
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4caf50',
  error: '#f44336',
  warning: '#ff9800',
  background: '#f8f9fa',
  surface: '#ffffff',
  text: '#333333',
  textSecondary: '#666666',
  border: '#e0e0e0',
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

const TEXT_STYLES = {
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  body: {
    fontSize: 16,
    color: COLORS.text,
  },
  caption: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
};

const ClientFeedback = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { clientId } = route.params || {};
  
  // Redux state
  const user = useSelector(state => state.auth.user);
  const clients = useSelector(state => state.clients.list);
  const feedback = useSelector(state => state.feedback.data);
  
  // Local state
  const [selectedClient, setSelectedClient] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [newFeedbackRequest, setNewFeedbackRequest] = useState({
    title: '',
    description: '',
    type: 'general',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (clientId) {
      const client = clients.find(c => c.id === clientId);
      setSelectedClient(client);
    }
  }, [clientId, clients]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  const filterOptions = [
    { label: 'All', value: 'all', icon: 'list' },
    { label: 'Session', value: 'session', icon: 'fitness-center' },
    { label: 'Program', value: 'program', icon: 'event-note' },
    { label: 'General', value: 'general', icon: 'chat' },
    { label: 'Surveys', value: 'survey', icon: 'poll' },
    { label: 'Issues', value: 'issue', icon: 'report-problem' },
  ];

  const feedbackTypes = [
    { label: 'Session Feedback', value: 'session' },
    { label: 'Program Review', value: 'program' },
    { label: 'General Feedback', value: 'general' },
    { label: 'Survey', value: 'survey' },
  ];

  // Mock feedback data
  const mockFeedback = [
    {
      id: '1',
      clientId: selectedClient?.id,
      type: 'session',
      title: 'Session #15 - Upper Body Strength',
      rating: 5,
      content: 'Amazing session today! I felt really challenged but supported throughout. The new exercises you introduced were perfect for targeting my weak points.',
      date: '2024-03-30',
      sessionId: 'sess_001',
      categories: {
        difficulty: 4,
        effectiveness: 5,
        instruction: 5,
        motivation: 5,
      },
      tags: ['strength', 'upper-body', 'excellent'],
      responded: false,
    },
    {
      id: '2',
      clientId: selectedClient?.id,
      type: 'program',
      title: '4-Week Program Review',
      rating: 4,
      content: 'Overall very happy with the program structure. Seeing good progress on strength gains. Would love more variety in the cardio sections though.',
      date: '2024-03-28',
      programId: 'prog_001',
      categories: {
        structure: 4,
        progression: 5,
        variety: 3,
        results: 4,
      },
      tags: ['program', 'strength-gains', 'cardio-variety'],
      responded: true,
      trainerResponse: 'Thanks for the detailed feedback! I\'ll add more cardio variety in the next phase.',
      responseDate: '2024-03-29',
    },
    {
      id: '3',
      clientId: selectedClient?.id,
      type: 'issue',
      title: 'Equipment Availability Concern',
      rating: 2,
      content: 'Had trouble accessing the cable machine during peak hours. Maybe we can adjust session times or find alternative exercises?',
      date: '2024-03-25',
      categories: {
        equipment: 2,
        scheduling: 3,
        alternatives: 4,
      },
      tags: ['equipment', 'scheduling', 'peak-hours'],
      responded: true,
      trainerResponse: 'Let\'s discuss alternative time slots. I\'ve also prepared bodyweight alternatives for busy gym days.',
      responseDate: '2024-03-26',
      priority: 'high',
    },
    {
      id: '4',
      clientId: selectedClient?.id,
      type: 'survey',
      title: 'Monthly Satisfaction Survey',
      rating: 4,
      content: 'Satisfaction survey responses covering training approach, communication, and goal progress.',
      date: '2024-03-20',
      categories: {
        communication: 5,
        expertise: 5,
        motivation: 4,
        progress: 4,
        value: 4,
      },
      tags: ['monthly-survey', 'satisfaction'],
      responded: false,
      surveyData: {
        overallSatisfaction: 4.4,
        wouldRecommend: true,
        goalProgress: 'on-track',
      },
    },
  ];

  const handleRequestFeedback = async () => {
    if (!newFeedbackRequest.title.trim()) {
      Alert.alert('Missing Information', 'Please enter a feedback request title.');
      return;
    }

    setLoading(true);
    try {
      const feedbackRequest = {
        id: Date.now().toString(),
        clientId: selectedClient?.id,
        title: newFeedbackRequest.title,
        description: newFeedbackRequest.description,
        type: newFeedbackRequest.type,
        requestDate: new Date().toISOString(),
        status: 'pending',
      };

      // Dispatch to Redux store
      // dispatch(sendFeedbackRequest(feedbackRequest));

      setNewFeedbackRequest({ title: '', description: '', type: 'general' });
      setShowRequestDialog(false);
      
      Alert.alert('Success! 📨', 'Feedback request sent to client successfully.');
    } catch (error) {
      console.error('Request feedback error:', error);
      Alert.alert('Error', 'Failed to send feedback request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = (feedbackItem) => {
    setSelectedFeedback(feedbackItem);
    setShowDetailModal(true);
  };

  const getRatingColor = (rating) => {
    if (rating >= 4.5) return COLORS.success;
    if (rating >= 3.5) return COLORS.primary;
    if (rating >= 2.5) return COLORS.warning;
    return COLORS.error;
  };

  const getRatingStars = (rating) => {
    return '⭐'.repeat(Math.floor(rating)) + (rating % 1 !== 0 ? '⭐️' : '');
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'session': return 'fitness-center';
      case 'program': return 'event-note';
      case 'general': return 'chat';
      case 'survey': return 'poll';
      case 'issue': return 'report-problem';
      default: return 'feedback';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'session': return COLORS.primary;
      case 'program': return COLORS.secondary;
      case 'general': return COLORS.success;
      case 'survey': return COLORS.warning;
      case 'issue': return COLORS.error;
      default: return COLORS.textSecondary;
    }
  };

  const renderHeader = () => (
    <LinearGradient
      colors={[COLORS.primary, COLORS.secondary]}
      style={styles.header}
    >
      <View style={styles.headerContent}>
        <View style={styles.clientInfo}>
          <Avatar.Text
            size={60}
            label={selectedClient?.name?.charAt(0) || 'C'}
            style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
            labelStyle={{ color: 'white' }}
          />
          <View style={styles.clientDetails}>
            <Text style={styles.clientName}>
              {selectedClient?.name || 'Select Client'}
            </Text>
            <Text style={styles.clientMeta}>
              Feedback & Reviews 💬
            </Text>
          </View>
        </View>
        <View style={styles.headerStats}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>4.6</Text>
            <Text style={styles.statLabel}>Avg Rating</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>24</Text>
            <Text style={styles.statLabel}>Reviews</Text>
          </View>
        </View>
      </View>
    </LinearGradient>
  );

  const renderSearchAndFilter = () => (
    <View style={styles.searchContainer}>
      <Searchbar
        placeholder="Search feedback..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
        iconColor={COLORS.primary}
      />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
      >
        {filterOptions.map((option) => (
          <Chip
            key={option.value}
            mode={selectedFilter === option.value ? 'flat' : 'outlined'}
            selected={selectedFilter === option.value}
            onPress={() => setSelectedFilter(option.value)}
            style={[
              styles.filterChip,
              selectedFilter === option.value && styles.selectedChip,
            ]}
            textStyle={{
              color: selectedFilter === option.value ? 'white' : COLORS.primary,
            }}
            icon={option.icon}
          >
            {option.label}
          </Chip>
        ))}
      </ScrollView>
    </View>
  );

  const renderOverviewStats = () => {
    const avgRating = 4.6;
    const totalFeedback = 24;
    const responseRate = 85;
    const satisfactionScore = 92;

    return (
      <Card style={styles.statsCard}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Feedback Overview 📊</Text>
          <View style={styles.statsGrid}>
            <Surface style={styles.statCard}>
              <Icon name="star" size={24} color={COLORS.warning} />
              <Text style={styles.statNumber}>{avgRating}</Text>
              <Text style={styles.statDescription}>Average Rating</Text>
              <Text style={styles.statExtra}>{getRatingStars(avgRating)}</Text>
            </Surface>
            <Surface style={styles.statCard}>
              <Icon name="chat-bubble" size={24} color={COLORS.primary} />
              <Text style={styles.statNumber}>{totalFeedback}</Text>
              <Text style={styles.statDescription}>Total Reviews</Text>
              <Text style={styles.statExtra}>This month: 6</Text>
            </Surface>
            <Surface style={styles.statCard}>
              <Icon name="reply" size={24} color={COLORS.success} />
              <Text style={styles.statNumber}>{responseRate}%</Text>
              <Text style={styles.statDescription}>Response Rate</Text>
              <Text style={styles.statExtra}>20/24 responded</Text>
            </Surface>
            <Surface style={styles.statCard}>
              <Icon name="thumb-up" size={24} color={COLORS.secondary} />
              <Text style={styles.statNumber}>{satisfactionScore}%</Text>
              <Text style={styles.statDescription}>Satisfaction</Text>
              <Text style={styles.statExtra}>Excellent!</Text>
            </Surface>
          </View>
        </Card.Content>
      </Card>
    );
  };

  const renderRatingBreakdown = () => (
    <Card style={styles.breakdownCard}>
      <Card.Content>
        <Text style={styles.sectionTitle}>Rating Distribution ⭐</Text>
        {[5, 4, 3, 2, 1].map(star => {
          const percentage = star === 5 ? 65 : star === 4 ? 25 : star === 3 ? 8 : star === 2 ? 2 : 0;
          return (
            <View key={star} style={styles.ratingRow}>
              <Text style={styles.ratingLabel}>{star} ⭐</Text>
              <ProgressBar
                progress={percentage / 100}
                color={getRatingColor(star)}
                style={styles.ratingBar}
              />
              <Text style={styles.ratingPercentage}>{percentage}%</Text>
            </View>
          );
        })}
      </Card.Content>
    </Card>
  );

  const renderFeedbackItem = ({ item }) => (
    <Card style={styles.feedbackCard}>
      <Card.Content>
        <View style={styles.feedbackHeader}>
          <View style={styles.feedbackType}>
            <Icon
              name={getTypeIcon(item.type)}
              size={20}
              color={getTypeColor(item.type)}
            />
            <Text style={[styles.typeText, { color: getTypeColor(item.type) }]}>
              {item.type.toUpperCase()}
            </Text>
          </View>
          <View style={styles.feedbackMeta}>
            <Text style={styles.feedbackDate}>
              {new Date(item.date).toLocaleDateString()}
            </Text>
            {item.priority === 'high' && (
              <Badge style={styles.priorityBadge}>HIGH</Badge>
            )}
          </View>
        </View>

        <Text style={styles.feedbackTitle}>{item.title}</Text>
        
        <View style={styles.ratingContainer}>
          <Text style={styles.ratingText}>
            {getRatingStars(item.rating)} {item.rating}/5
          </Text>
          {item.categories && (
            <Text style={styles.categoriesText}>
              {Object.keys(item.categories).length} categories rated
            </Text>
          )}
        </View>

        <Text style={styles.feedbackContent} numberOfLines={3}>
          {item.content}
        </Text>

        {item.tags && (
          <View style={styles.tagsContainer}>
            {item.tags.slice(0, 3).map((tag, index) => (
              <Chip
                key={index}
                mode="outlined"
                compact
                style={styles.feedbackTag}
                textStyle={styles.tagText}
              >
                {tag}
              </Chip>
            ))}
            {item.tags.length > 3 && (
              <Text style={styles.moreTagsText}>+{item.tags.length - 3} more</Text>
            )}
          </View>
        )}

        <Divider style={styles.divider} />

        <View style={styles.feedbackFooter}>
          <View style={styles.responseStatus}>
            {item.responded ? (
              <View style={styles.respondedStatus}>
                <Icon name="check-circle" size={16} color={COLORS.success} />
                <Text style={styles.respondedText}>Responded</Text>
              </View>
            ) : (
              <View style={styles.pendingStatus}>
                <Icon name="schedule" size={16} color={COLORS.warning} />
                <Text style={styles.pendingText}>Pending Response</Text>
              </View>
            )}
          </View>
          
          <View style={styles.feedbackActions}>
            <Button
              mode="outlined"
              onPress={() => handleViewDetail(item)}
              compact
              style={styles.viewButton}
            >
              View Details
            </Button>
            {!item.responded && (
              <Button
                mode="contained"
                onPress={() => Alert.alert('Reply', 'Reply feature coming soon!')}
                compact
                style={styles.replyButton}
                labelStyle={{ color: 'white' }}
              >
                Reply
              </Button>
            )}
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  const renderRequestDialog = () => (
    <Portal>
      <Dialog visible={showRequestDialog} onDismiss={() => setShowRequestDialog(false)}>
        <Dialog.Title>Request Feedback 📝</Dialog.Title>
        <Dialog.Content>
          <TextInput
            label="Feedback Title *"
            value={newFeedbackRequest.title}
            onChangeText={(text) => setNewFeedbackRequest({...newFeedbackRequest, title: text})}
            mode="outlined"
            style={styles.dialogInput}
            placeholder="e.g., Session #20 Feedback"
          />
          
          <Text style={styles.inputLabel}>Feedback Type</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeSelector}>
            {feedbackTypes.map((type) => (
              <Chip
                key={type.value}
                mode={newFeedbackRequest.type === type.value ? 'flat' : 'outlined'}
                selected={newFeedbackRequest.type === type.value}
                onPress={() => setNewFeedbackRequest({...newFeedbackRequest, type: type.value})}
                style={[
                  styles.typeChip,
                  newFeedbackRequest.type === type.value && { backgroundColor: COLORS.primary },
                ]}
                textStyle={{
                  color: newFeedbackRequest.type === type.value ? 'white' : COLORS.primary,
                }}
              >
                {type.label}
              </Chip>
            ))}
          </ScrollView>

          <TextInput
            label="Description (optional)"
            value={newFeedbackRequest.description}
            onChangeText={(text) => setNewFeedbackRequest({...newFeedbackRequest, description: text})}
            multiline
            numberOfLines={3}
            mode="outlined"
            style={styles.dialogInput}
            placeholder="Specific questions or areas you'd like feedback on..."
          />
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={() => setShowRequestDialog(false)}>Cancel</Button>
          <Button
            onPress={handleRequestFeedback}
            loading={loading}
            mode="contained"
            style={{ backgroundColor: COLORS.primary }}
          >
            Send Request
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );

  const renderDetailModal = () => (
    <Portal>
      <Dialog
        visible={showDetailModal}
        onDismiss={() => setShowDetailModal(false)}
        style={styles.detailDialog}
      >
        <Dialog.Title>
          Feedback Details 💬
        </Dialog.Title>
        <Dialog.ScrollArea style={styles.dialogScrollArea}>
          <ScrollView>
            {selectedFeedback && (
              <View style={styles.detailContent}>
                <View style={styles.detailHeader}>
                  <Text style={styles.detailTitle}>{selectedFeedback.title}</Text>
                  <Text style={styles.detailDate}>
                    {new Date(selectedFeedback.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </Text>
                </View>

                <View style={styles.detailRating}>
                  <Text style={styles.detailRatingText}>
                    {getRatingStars(selectedFeedback.rating)} {selectedFeedback.rating}/5
                  </Text>
                </View>

                <Text style={styles.detailFeedbackText}>{selectedFeedback.content}</Text>

                {selectedFeedback.categories && (
                  <View style={styles.categoriesSection}>
                    <Text style={styles.categoriesTitle}>Category Ratings:</Text>
                    {Object.entries(selectedFeedback.categories).map(([category, rating]) => (
                      <View key={category} style={styles.categoryRow}>
                        <Text style={styles.categoryName}>
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </Text>
                        <View style={styles.categoryRating}>
                          <ProgressBar
                            progress={rating / 5}
                            color={getRatingColor(rating)}
                            style={styles.categoryBar}
                          />
                          <Text style={styles.categoryScore}>{rating}/5</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                )}

                {selectedFeedback.tags && (
                  <View style={styles.detailTagsSection}>
                    <Text style={styles.tagsTitle}>Tags:</Text>
                    <View style={styles.detailTagsContainer}>
                      {selectedFeedback.tags.map((tag, index) => (
                        <Chip
                          key={index}
                          mode="outlined"
                          compact
                          style={styles.detailTag}
                        >
                          {tag}
                        </Chip>
                      ))}
                    </View>
                  </View>
                )}

                {selectedFeedback.responded && selectedFeedback.trainerResponse && (
                  <View style={styles.responseSection}>
                    <Text style={styles.responseTitle}>Your Response:</Text>
                    <Text style={styles.responseText}>{selectedFeedback.trainerResponse}</Text>
                    <Text style={styles.responseDate}>
                      Responded on {new Date(selectedFeedback.responseDate).toLocaleDateString()}
                    </Text>
                  </View>
                )}
              </View>
            )}
          </ScrollView>
        </Dialog.ScrollArea>
        <Dialog.Actions>
          <Button onPress={() => setShowDetailModal(false)}>Close</Button>
          {selectedFeedback && !selectedFeedback.responded && (
            <Button
              mode="contained"
              onPress={() => {
                setShowDetailModal(false);
                Alert.alert('Reply', 'Reply feature coming soon!');
              }}
              style={{ backgroundColor: COLORS.primary }}
            >
              Reply
            </Button>
          )}
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Icon name="feedback" size={80} color={COLORS.textSecondary} />
      <Text style={styles.emptyTitle}>No Feedback Yet</Text>
      <Text style={styles.emptyText}>
        Request feedback from your client to start collecting valuable insights
      </Text>
      <Button
        mode="contained"
        onPress={() => setShowRequestDialog(true)}
        style={styles.emptyButton}
        icon="add"
      >
        Request Feedback
      </Button>
    </View>
  );

  if (!selectedClient) {
    return (
      <View style={styles.emptyContainer}>
        <Icon name="person-search" size={80} color={COLORS.textSecondary} />
        <Text style={styles.emptyTitle}>Select a Client</Text>
        <Text style={styles.emptyText}>
          Choose a client to view their feedback and reviews
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />
      
      {renderHeader()}
      
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      >
        {renderSearchAndFilter()}
        {renderOverviewStats()}
        {renderRatingBreakdown()}
        
        <Text style={styles.listTitle}>Recent Feedback 💬</Text>
        
        {mockFeedback.length > 0 ? (
          <FlatList
            data={mockFeedback}
            renderItem={renderFeedbackItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.feedbackList}
          />
        ) : (
          renderEmptyState()
        )}
        
        <View style={styles.bottomSpacing} />
      </ScrollView>

      <FAB
        style={styles.fab}
        icon="add"
        onPress={() => setShowRequestDialog(true)}
        color="white"
      />

      {renderRequestDialog()}
      {renderDetailModal()}
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
    paddingHorizontal: SPACING.md,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  clientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  clientDetails: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  clientName: {
    ...TEXT_STYLES.title,
    color: 'white',
    fontSize: 20,
  },
  clientMeta: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255,255,255,0.8)',
  },
  headerStats: {
    flexDirection: 'row',
  },
  statItem: {
    alignItems: 'center',
    marginLeft: SPACING.md,
  },
  statValue: {
    ...TEXT_STYLES.title,
    color: 'white',
    fontSize: 18,
  },
  statLabel: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: SPACING.md,
  },
  searchContainer: {
    marginVertical: SPACING.md,
  },
  searchbar: {
    marginBottom: SPACING.md,
    elevation: 2,
  },
  filterContainer: {
    flexDirection: 'row',
  },
  filterChip: {
    marginRight: SPACING.sm,
    borderColor: COLORS.primary,
  },
  selectedChip: {
    backgroundColor: COLORS.primary,
  },
  statsCard: {
    marginBottom: SPACING.md,
    elevation: 2,
  },
  sectionTitle: {
    ...TEXT_STYLES.subtitle,
    marginBottom: SPACING.md,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    padding: SPACING.md,
    alignItems: 'center',
    marginBottom: SPACING.sm,
    borderRadius: 12,
    elevation: 1,
  },
  statNumber: {
    ...TEXT_STYLES.title,
    fontSize: 18,
    marginVertical: SPACING.xs,
  },
  statDescription: {
    ...TEXT_STYLES.caption,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  statExtra: {
    ...TEXT_STYLES.caption,
    fontSize: 12,
    color: COLORS.primary,
    textAlign: 'center',
  },
  breakdownCard: {
    marginBottom: SPACING.md,
    elevation: 2,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  ratingLabel: {
    ...TEXT_STYLES.body,
    width: 50,
  },
  ratingBar: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.border,
    marginHorizontal: SPACING.sm,
  },
  ratingPercentage: {
    ...TEXT_STYLES.caption,
    width: 40,
    textAlign: 'right',
  },
  listTitle: {
    ...TEXT_STYLES.subtitle,
    marginBottom: SPACING.md,
  },
  feedbackList: {
    paddingBottom: SPACING.md,
  },
  feedbackCard: {
    marginBottom: SPACING.md,
    elevation: 2,
  },
  feedbackHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  feedbackType: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeText: {
    ...TEXT_STYLES.caption,
    fontWeight: 'bold',
    marginLeft: SPACING.xs,
    fontSize: 12,
  },
  feedbackMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  feedbackDate: {
    ...TEXT_STYLES.caption,
    marginRight: SPACING.sm,
  },
  priorityBadge: {
    backgroundColor: COLORS.error,
    fontSize: 10,
  },
  feedbackTitle: {
    ...TEXT_STYLES.subtitle,
    fontSize: 16,
    marginBottom: SPACING.sm,
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  ratingText: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
  },
  categoriesText: {
    ...TEXT_STYLES.caption,
    color: COLORS.primary,
  },
  feedbackContent: {
    ...TEXT_STYLES.body,
    lineHeight: 22,
    marginBottom: SPACING.md,
    color: COLORS.textSecondary,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  feedbackTag: {
    marginRight: SPACING.sm,
    marginBottom: SPACING.xs,
    height: 28,
  },
  tagText: {
    fontSize: 11,
  },
  moreTagsText: {
    ...TEXT_STYLES.caption,
    color: COLORS.primary,
    fontSize: 12,
  },
  divider: {
    marginVertical: SPACING.sm,
  },
  feedbackFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  responseStatus: {
    flex: 1,
  },
  respondedStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  respondedText: {
    ...TEXT_STYLES.caption,
    color: COLORS.success,
    marginLeft: SPACING.xs,
    fontWeight: '500',
  },
  pendingStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pendingText: {
    ...TEXT_STYLES.caption,
    color: COLORS.warning,
    marginLeft: SPACING.xs,
    fontWeight: '500',
  },
  feedbackActions: {
    flexDirection: 'row',
  },
  viewButton: {
    marginRight: SPACING.sm,
  },
  replyButton: {
    backgroundColor: COLORS.primary,
  },
  dialogInput: {
    marginBottom: SPACING.md,
  },
  inputLabel: {
    ...TEXT_STYLES.body,
    marginBottom: SPACING.sm,
    fontWeight: '500',
  },
  typeSelector: {
    marginBottom: SPACING.md,
  },
  typeChip: {
    marginRight: SPACING.sm,
    borderColor: COLORS.primary,
  },
  detailDialog: {
    maxHeight: '85%',
  },
  dialogScrollArea: {
    maxHeight: 500,
  },
  detailContent: {
    padding: SPACING.sm,
  },
  detailHeader: {
    marginBottom: SPACING.md,
  },
  detailTitle: {
    ...TEXT_STYLES.subtitle,
    marginBottom: SPACING.xs,
  },
  detailDate: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
  },
  detailRating: {
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  detailRatingText: {
    ...TEXT_STYLES.title,
    fontSize: 20,
  },
  detailFeedbackText: {
    ...TEXT_STYLES.body,
    lineHeight: 24,
    marginBottom: SPACING.lg,
    backgroundColor: COLORS.background,
    padding: SPACING.md,
    borderRadius: 8,
  },
  categoriesSection: {
    marginBottom: SPACING.lg,
  },
  categoriesTitle: {
    ...TEXT_STYLES.subtitle,
    fontSize: 16,
    marginBottom: SPACING.md,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  categoryName: {
    ...TEXT_STYLES.body,
    flex: 1,
  },
  categoryRating: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginLeft: SPACING.md,
  },
  categoryBar: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.border,
    marginRight: SPACING.sm,
  },
  categoryScore: {
    ...TEXT_STYLES.caption,
    fontWeight: '600',
    minWidth: 30,
  },
  detailTagsSection: {
    marginBottom: SPACING.lg,
  },
  tagsTitle: {
    ...TEXT_STYLES.subtitle,
    fontSize: 16,
    marginBottom: SPACING.sm,
  },
  detailTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  detailTag: {
    marginRight: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  responseSection: {
    backgroundColor: COLORS.background,
    padding: SPACING.md,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.success,
  },
  responseTitle: {
    ...TEXT_STYLES.subtitle,
    fontSize: 16,
    marginBottom: SPACING.sm,
    color: COLORS.success,
  },
  responseText: {
    ...TEXT_STYLES.body,
    lineHeight: 22,
    marginBottom: SPACING.sm,
  },
  responseDate: {
    ...TEXT_STYLES.caption,
    fontStyle: 'italic',
  },
  fab: {
    position: 'absolute',
    margin: SPACING.md,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.xl,
  },
  emptyTitle: {
    ...TEXT_STYLES.title,
    marginTop: SPACING.md,
    textAlign: 'center',
  },
  emptyText: {
    ...TEXT_STYLES.body,
    textAlign: 'center',
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  emptyButton: {
    backgroundColor: COLORS.primary,
  },
  bottomSpacing: {
    height: 100,
  },
});

export default ClientFeedback;

