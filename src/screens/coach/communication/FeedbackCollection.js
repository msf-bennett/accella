import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  RefreshControl,
  Alert,
  Animated,
  Vibration,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { 
  Card,
  Button,
  Searchbar,
  Avatar,
  Chip,
  IconButton,
  FAB,
  Surface,
  Portal,
  Modal,
  TextInput,
  ProgressBar,
  Menu,
  Divider,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/LinearGradient';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Import your design system constants
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  background: '#f5f5f5',
  surface: '#ffffff',
  text: '#333333',
  textSecondary: '#666666',
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
  h2: { fontSize: 24, fontWeight: '600', color: COLORS.text },
  h3: { fontSize: 20, fontWeight: '600', color: COLORS.text },
  body: { fontSize: 16, color: COLORS.text },
  caption: { fontSize: 14, color: COLORS.textSecondary },
  small: { fontSize: 12, color: COLORS.textSecondary },
};

const FeedbackCollection = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [filterMenuVisible, setFilterMenuVisible] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [fadeAnim] = useState(new Animated.Value(0));

  // Mock data - replace with real data from Redux store
  const [feedbackData, setFeedbackData] = useState([
    {
      id: '1',
      title: 'Training Session Quality',
      description: 'How would you rate today\'s training session?',
      type: 'rating',
      category: 'Training',
      targetAudience: 'players',
      status: 'active',
      createdAt: '2025-01-15T10:00:00Z',
      responses: 12,
      averageRating: 4.3,
      questions: [
        { id: 'q1', text: 'Overall session quality', type: 'rating', required: true },
        { id: 'q2', text: 'Drill difficulty level', type: 'rating', required: true },
        { id: 'q3', text: 'Additional comments', type: 'text', required: false },
      ],
    },
    {
      id: '2',
      title: 'Communication Effectiveness',
      description: 'Parent feedback on coach communication',
      type: 'survey',
      category: 'Communication',
      targetAudience: 'parents',
      status: 'draft',
      createdAt: '2025-01-14T15:30:00Z',
      responses: 0,
      questions: [
        { id: 'q1', text: 'How clear is our communication?', type: 'multiple', required: true },
        { id: 'q2', text: 'Frequency of updates', type: 'rating', required: true },
      ],
    },
    {
      id: '3',
      title: 'Season Progress Review',
      description: 'Mid-season feedback collection',
      type: 'comprehensive',
      category: 'Progress',
      targetAudience: 'all',
      status: 'completed',
      createdAt: '2025-01-10T09:00:00Z',
      responses: 28,
      averageRating: 4.7,
      questions: [
        { id: 'q1', text: 'Player development progress', type: 'rating', required: true },
        { id: 'q2', text: 'Team chemistry improvement', type: 'rating', required: true },
        { id: 'q3', text: 'Areas for improvement', type: 'text', required: true },
      ],
    },
  ]);

  const [newFeedback, setNewFeedback] = useState({
    title: '',
    description: '',
    type: 'rating',
    category: 'Training',
    targetAudience: 'players',
    questions: [
      { id: Date.now().toString(), text: '', type: 'rating', required: true }
    ],
  });

  const [responses, setResponses] = useState([
    {
      id: 'r1',
      feedbackId: '1',
      respondentName: 'Alex Johnson',
      respondentType: 'player',
      avatar: 'https://i.pravatar.cc/100?img=1',
      submittedAt: '2025-01-15T14:30:00Z',
      answers: [
        { questionId: 'q1', value: 5, text: 'Excellent' },
        { questionId: 'q2', value: 4, text: 'Good' },
        { questionId: 'q3', value: null, text: 'Great session, learned a lot!' },
      ],
    },
    {
      id: 'r2',
      feedbackId: '1',
      respondentName: 'Emma Davis',
      respondentType: 'player',
      avatar: 'https://i.pravatar.cc/100?img=2',
      submittedAt: '2025-01-15T16:45:00Z',
      answers: [
        { questionId: 'q1', value: 4, text: 'Good' },
        { questionId: 'q2', value: 3, text: 'Fair' },
        { questionId: 'q3', value: null, text: 'Could use more individual feedback' },
      ],
    },
  ]);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return COLORS.success;
      case 'draft':
        return COLORS.warning;
      case 'completed':
        return COLORS.primary;
      default:
        return COLORS.textSecondary;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return 'play-circle';
      case 'draft':
        return 'edit';
      case 'completed':
        return 'check-circle';
      default:
        return 'help-circle';
    }
  };

  const getAudienceIcon = (audience) => {
    switch (audience) {
      case 'players':
        return 'sports';
      case 'parents':
        return 'family-restroom';
      case 'all':
        return 'groups';
      default:
        return 'people';
    }
  };

  const filteredFeedback = feedbackData.filter(feedback => {
    const matchesSearch = feedback.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         feedback.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === 'all' || feedback.status === activeFilter;
    return matchesSearch && matchesFilter;
  });

  const handleCreateFeedback = () => {
    if (!newFeedback.title || !newFeedback.description) {
      Alert.alert('Required Fields', 'Please fill in title and description');
      return;
    }

    const feedback = {
      ...newFeedback,
      id: Date.now().toString(),
      status: 'draft',
      createdAt: new Date().toISOString(),
      responses: 0,
      questions: newFeedback.questions.filter(q => q.text.trim() !== ''),
    };

    setFeedbackData(prev => [feedback, ...prev]);
    setNewFeedback({
      title: '',
      description: '',
      type: 'rating',
      category: 'Training',
      targetAudience: 'players',
      questions: [
        { id: Date.now().toString(), text: '', type: 'rating', required: true }
      ],
    });
    setShowCreateModal(false);
    Vibration.vibrate([10, 50, 10]);
  };

  const addQuestion = () => {
    setNewFeedback(prev => ({
      ...prev,
      questions: [
        ...prev.questions,
        { id: Date.now().toString(), text: '', type: 'rating', required: true }
      ]
    }));
  };

  const removeQuestion = (questionId) => {
    setNewFeedback(prev => ({
      ...prev,
      questions: prev.questions.filter(q => q.id !== questionId)
    }));
  };

  const updateQuestion = (questionId, field, value) => {
    setNewFeedback(prev => ({
      ...prev,
      questions: prev.questions.map(q =>
        q.id === questionId ? { ...q, [field]: value } : q
      )
    }));
  };

  const toggleFeedbackStatus = (feedbackId) => {
    setFeedbackData(prev =>
      prev.map(feedback =>
        feedback.id === feedbackId
          ? {
              ...feedback,
              status: feedback.status === 'active' ? 'draft' : 'active'
            }
          : feedback
      )
    );
    Vibration.vibrate(10);
  };

  const viewResponses = (feedback) => {
    setSelectedFeedback(feedback);
    setShowResponseModal(true);
  };

  const renderFeedbackCard = ({ item: feedback }) => (
    <Card style={styles.feedbackCard}>
      <Card.Content>
        <View style={styles.cardHeader}>
          <View style={styles.feedbackInfo}>
            <Text style={TEXT_STYLES.h3}>{feedback.title}</Text>
            <Text style={TEXT_STYLES.caption} numberOfLines={2}>
              {feedback.description}
            </Text>
          </View>
          <View style={styles.cardActions}>
            <Chip
              mode="outlined"
              textStyle={[styles.statusChip, { color: getStatusColor(feedback.status) }]}
              style={{ borderColor: getStatusColor(feedback.status) }}
            >
              {feedback.status}
            </Chip>
          </View>
        </View>

        <View style={styles.cardMeta}>
          <View style={styles.metaRow}>
            <Icon name={getAudienceIcon(feedback.targetAudience)} size={16} color={COLORS.textSecondary} />
            <Text style={TEXT_STYLES.small}>{feedback.targetAudience}</Text>
          </View>
          <View style={styles.metaRow}>
            <Icon name="category" size={16} color={COLORS.textSecondary} />
            <Text style={TEXT_STYLES.small}>{feedback.category}</Text>
          </View>
          <View style={styles.metaRow}>
            <Icon name="schedule" size={16} color={COLORS.textSecondary} />
            <Text style={TEXT_STYLES.small}>
              {new Date(feedback.createdAt).toLocaleDateString()}
            </Text>
          </View>
        </View>

        <View style={styles.cardStats}>
          <Surface style={styles.statItem}>
            <Text style={[TEXT_STYLES.h3, { color: COLORS.primary }]}>
              {feedback.responses}
            </Text>
            <Text style={TEXT_STYLES.small}>Responses</Text>
          </Surface>
          {feedback.averageRating && (
            <Surface style={styles.statItem}>
              <View style={styles.ratingRow}>
                <Text style={[TEXT_STYLES.h3, { color: COLORS.success }]}>
                  {feedback.averageRating}
                </Text>
                <Icon name="star" size={16} color={COLORS.warning} />
              </View>
              <Text style={TEXT_STYLES.small}>Avg Rating</Text>
            </Surface>
          )}
          <Surface style={styles.statItem}>
            <Text style={[TEXT_STYLES.h3, { color: COLORS.secondary }]}>
              {feedback.questions.length}
            </Text>
            <Text style={TEXT_STYLES.small}>Questions</Text>
          </Surface>
        </View>

        <View style={styles.cardButtons}>
          <Button
            mode="outlined"
            onPress={() => viewResponses(feedback)}
            style={styles.actionButton}
            disabled={feedback.responses === 0}
          >
            View Responses
          </Button>
          <Button
            mode="contained"
            onPress={() => toggleFeedbackStatus(feedback.id)}
            style={styles.actionButton}
            buttonColor={feedback.status === 'active' ? COLORS.warning : COLORS.success}
          >
            {feedback.status === 'active' ? 'Pause' : 'Activate'}
          </Button>
        </View>
      </Card.Content>
    </Card>
  );

  const renderResponseItem = ({ item: response }) => (
    <Surface style={styles.responseCard}>
      <View style={styles.responseHeader}>
        <Avatar.Image size={40} source={{ uri: response.avatar }} />
        <View style={styles.responseInfo}>
          <Text style={TEXT_STYLES.body}>{response.respondentName}</Text>
          <Text style={TEXT_STYLES.caption}>
            {response.respondentType} • {new Date(response.submittedAt).toLocaleDateString()}
          </Text>
        </View>
      </View>

      {response.answers.map((answer, index) => (
        <View key={index} style={styles.answerItem}>
          <Text style={TEXT_STYLES.caption}>
            Question {index + 1}
            {answer.value && (
              <Text style={[TEXT_STYLES.caption, { color: COLORS.warning }]}>
                {' '}• {answer.value}/5 ⭐
              </Text>
            )}
          </Text>
          {answer.text && answer.value === null && (
            <Text style={TEXT_STYLES.body}>{answer.text}</Text>
          )}
          {answer.text && answer.value !== null && (
            <Text style={TEXT_STYLES.caption}>{answer.text}</Text>
          )}
        </View>
      ))}
    </Surface>
  );

  const CreateFeedbackModal = () => (
    <Portal>
      <Modal
        visible={showCreateModal}
        onDismiss={() => setShowCreateModal(false)}
        contentContainerStyle={styles.modal}
      >
        <BlurView style={styles.modalBlur} blurType="light" blurAmount={10}>
          <Surface style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={[TEXT_STYLES.h2, { textAlign: 'center', marginBottom: SPACING.lg }]}>
                Create Feedback Form 📋
              </Text>

              <TextInput
                label="Title *"
                value={newFeedback.title}
                onChangeText={(text) => setNewFeedback(prev => ({ ...prev, title: text }))}
                style={styles.input}
                mode="outlined"
              />

              <TextInput
                label="Description *"
                value={newFeedback.description}
                onChangeText={(text) => setNewFeedback(prev => ({ ...prev, description: text }))}
                style={styles.input}
                mode="outlined"
                multiline
                numberOfLines={3}
              />

              <View style={styles.inputRow}>
                <TextInput
                  label="Category"
                  value={newFeedback.category}
                  onChangeText={(text) => setNewFeedback(prev => ({ ...prev, category: text }))}
                  style={[styles.input, { flex: 1, marginRight: SPACING.sm }]}
                  mode="outlined"
                />
                <TextInput
                  label="Target Audience"
                  value={newFeedback.targetAudience}
                  onChangeText={(text) => setNewFeedback(prev => ({ ...prev, targetAudience: text }))}
                  style={[styles.input, { flex: 1 }]}
                  mode="outlined"
                />
              </View>

              <Text style={[TEXT_STYLES.h3, { marginTop: SPACING.lg, marginBottom: SPACING.md }]}>
                Questions
              </Text>

              {newFeedback.questions.map((question, index) => (
                <Surface key={question.id} style={styles.questionCard}>
                  <View style={styles.questionHeader}>
                    <Text style={TEXT_STYLES.body}>Question {index + 1}</Text>
                    {newFeedback.questions.length > 1 && (
                      <IconButton
                        icon="delete"
                        size={20}
                        iconColor={COLORS.error}
                        onPress={() => removeQuestion(question.id)}
                      />
                    )}
                  </View>

                  <TextInput
                    label="Question text"
                    value={question.text}
                    onChangeText={(text) => updateQuestion(question.id, 'text', text)}
                    style={styles.input}
                    mode="outlined"
                    multiline
                  />

                  <View style={styles.inputRow}>
                    <TextInput
                      label="Type"
                      value={question.type}
                      onChangeText={(text) => updateQuestion(question.id, 'type', text)}
                      style={[styles.input, { flex: 1, marginRight: SPACING.sm }]}
                      mode="outlined"
                    />
                    <TouchableOpacity
                      style={styles.checkboxRow}
                      onPress={() => updateQuestion(question.id, 'required', !question.required)}
                    >
                      <Icon
                        name={question.required ? "check-box" : "check-box-outline-blank"}
                        size={24}
                        color={COLORS.primary}
                      />
                      <Text style={TEXT_STYLES.caption}>Required</Text>
                    </TouchableOpacity>
                  </View>
                </Surface>
              ))}

              <Button
                mode="outlined"
                onPress={addQuestion}
                style={styles.addQuestionButton}
                icon="add"
              >
                Add Question
              </Button>

              <View style={styles.modalActions}>
                <Button
                  mode="outlined"
                  onPress={() => setShowCreateModal(false)}
                  style={styles.modalButton}
                >
                  Cancel
                </Button>
                <Button
                  mode="contained"
                  onPress={handleCreateFeedback}
                  style={styles.modalButton}
                  buttonColor={COLORS.primary}
                >
                  Create Form
                </Button>
              </View>
            </ScrollView>
          </Surface>
        </BlurView>
      </Modal>
    </Portal>
  );

  const ResponseModal = () => (
    <Portal>
      <Modal
        visible={showResponseModal}
        onDismiss={() => setShowResponseModal(false)}
        contentContainerStyle={styles.modal}
      >
        <BlurView style={styles.modalBlur} blurType="light" blurAmount={10}>
          <Surface style={styles.modalContent}>
            <Text style={[TEXT_STYLES.h2, { textAlign: 'center', marginBottom: SPACING.lg }]}>
              Feedback Responses 📊
            </Text>
            
            {selectedFeedback && (
              <>
                <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.sm }]}>
                  {selectedFeedback.title}
                </Text>
                <Text style={[TEXT_STYLES.caption, { marginBottom: SPACING.lg }]}>
                  {selectedFeedback.responses} total responses
                </Text>

                <FlatList
                  data={responses.filter(r => r.feedbackId === selectedFeedback.id)}
                  renderItem={renderResponseItem}
                  keyExtractor={(item) => item.id}
                  showsVerticalScrollIndicator={false}
                  style={{ maxHeight: 400 }}
                />
              </>
            )}

            <Button
              mode="contained"
              onPress={() => setShowResponseModal(false)}
              style={styles.closeButton}
              buttonColor={COLORS.primary}
            >
              Close
            </Button>
          </Surface>
        </BlurView>
      </Modal>
    </Portal>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} translucent />
      
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        style={styles.header}
      >
        <Text style={[TEXT_STYLES.h1, { color: 'white' }]}>Feedback Collection 📝</Text>
        <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)' }]}>
          Gather insights from players and parents
        </Text>
      </LinearGradient>

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <View style={styles.searchRow}>
          <Searchbar
            placeholder="Search feedback forms..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchbar}
            iconColor={COLORS.primary}
          />
          <Menu
            visible={filterMenuVisible}
            onDismiss={() => setFilterMenuVisible(false)}
            anchor={
              <IconButton
                icon="filter-list"
                size={24}
                iconColor={COLORS.primary}
                onPress={() => setFilterMenuVisible(true)}
                style={styles.filterButton}
              />
            }
          >
            <Menu.Item onPress={() => { setActiveFilter('all'); setFilterMenuVisible(false); }} title="All" />
            <Menu.Item onPress={() => { setActiveFilter('active'); setFilterMenuVisible(false); }} title="Active" />
            <Menu.Item onPress={() => { setActiveFilter('draft'); setFilterMenuVisible(false); }} title="Draft" />
            <Menu.Item onPress={() => { setActiveFilter('completed'); setFilterMenuVisible(false); }} title="Completed" />
          </Menu>
        </View>

        <View style={styles.statsRow}>
          <Surface style={styles.statCard}>
            <Text style={TEXT_STYLES.h2}>{feedbackData.length}</Text>
            <Text style={TEXT_STYLES.caption}>Total Forms</Text>
          </Surface>
          <Surface style={styles.statCard}>
            <Text style={TEXT_STYLES.h2}>
              {feedbackData.filter(f => f.status === 'active').length}
            </Text>
            <Text style={TEXT_STYLES.caption}>Active</Text>
          </Surface>
          <Surface style={styles.statCard}>
            <Text style={TEXT_STYLES.h2}>
              {feedbackData.reduce((sum, f) => sum + f.responses, 0)}
            </Text>
            <Text style={TEXT_STYLES.caption}>Responses</Text>
          </Surface>
        </View>

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
            <Surface style={styles.emptyState}>
              <Icon name="feedback" size={64} color={COLORS.textSecondary} />
              <Text style={[TEXT_STYLES.h3, { textAlign: 'center', marginTop: SPACING.md }]}>
                No feedback forms found
              </Text>
              <Text style={[TEXT_STYLES.caption, { textAlign: 'center' }]}>
                Create your first feedback form to start collecting insights
              </Text>
            </Surface>
          }
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      </Animated.View>

      <FAB
        icon="add"
        style={styles.fab}
        onPress={() => setShowCreateModal(true)}
        color="white"
      />

      <CreateFeedbackModal />
      <ResponseModal />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: StatusBar.currentHeight + SPACING.lg,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
  },
  content: {
    flex: 1,
    padding: SPACING.md,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  searchbar: {
    flex: 1,
    elevation: 2,
  },
  filterButton: {
    marginLeft: SPACING.sm,
    backgroundColor: COLORS.surface,
    elevation: 2,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: SPACING.lg,
    gap: SPACING.sm,
  },
  statCard: {
    flex: 1,
    padding: SPACING.md,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
  },
  feedbackCard: {
    marginBottom: SPACING.md,
    elevation: 3,
    borderRadius: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  feedbackInfo: {
    flex: 1,
    marginRight: SPACING.md,
  },
  cardActions: {
    alignItems: 'flex-end',
  },
  statusChip: {
    fontSize: 12,
    textTransform: 'capitalize',
  },
  cardMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  cardStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  statItem: {
    flex: 1,
    padding: SPACING.sm,
    borderRadius: 8,
    alignItems: 'center',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  cardButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  actionButton: {
    flex: 1,
  },
  emptyState: {
    padding: SPACING.xl,
    alignItems: 'center',
    borderRadius: 12,
    elevation: 1,
  },
  fab: {
    position: 'absolute',
    right: SPACING.lg,
    bottom: SPACING.lg,
    backgroundColor: COLORS.primary,
  },
  modal: {
    flex: 1,
    justifyContent: 'center',
  },
  modalBlur: {
    flex: 1,
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  modalContent: {
    padding: SPACING.lg,
    borderRadius: 16,
    maxHeight: '90%',
  },
  input: {
    marginBottom: SPACING.md,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  questionCard: {
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderRadius: 12,
    elevation: 1,
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    flex: 1,
    justifyContent: 'center',
  },
  addQuestionButton: {
    marginBottom: SPACING.lg,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.md,
  },
  modalButton: {
    flex: 1,
  },
  closeButton: {
    marginTop: SPACING.lg,
  },
  responseCard: {
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderRadius: 12,
    elevation: 1,
  },
  responseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  responseInfo: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  answerItem: {
    marginBottom: SPACING.sm,
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.background,
  },
});

export default FeedbackCollection;