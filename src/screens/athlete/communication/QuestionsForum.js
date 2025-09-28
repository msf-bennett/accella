import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Alert,
  TouchableOpacity,
  StatusBar,
  Animated,
  Vibration,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { 
  Card,
  Button,
  Chip,
  Avatar,
  IconButton,
  Surface,
  Searchbar,
  Badge,
  FAB,
  Portal,
  Modal,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Import design system constants
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  background: '#f8f9fa',
  surface: '#ffffff',
  text: '#333333',
  textSecondary: '#666666',
  border: '#e1e8ed',
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

const TEXT_STYLES = {
  h1: { fontSize: 28, fontWeight: 'bold' },
  h2: { fontSize: 24, fontWeight: '600' },
  h3: { fontSize: 20, fontWeight: '600' },
  body: { fontSize: 16, lineHeight: 24 },
  caption: { fontSize: 14, color: COLORS.textSecondary },
};

const QuestionsForum = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [askQuestionModal, setAskQuestionModal] = useState(false);
  const [newQuestion, setNewQuestion] = useState('');
  const [newQuestionTitle, setNewQuestionTitle] = useState('');
  const [newQuestionCategory, setNewQuestionCategory] = useState('general');
  const [newAnswer, setNewAnswer] = useState('');
  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(300);

  // Mock data for forum questions
  const [questions, setQuestions] = useState([
    {
      id: 1,
      title: 'Best pre-workout nutrition for teenage athletes?',
      content: 'My 16-year-old son plays football and I want to make sure he has the right nutrition before practice. What foods would you recommend 1-2 hours before training?',
      author: 'Sarah Johnson',
      authorAvatar: 'https://randomuser.me/api/portraits/women/1.jpg',
      authorRole: 'Parent',
      category: 'nutrition',
      tags: ['nutrition', 'pre-workout', 'teenage-athletes'],
      date: '2025-08-22',
      time: '14:30',
      views: 45,
      likes: 12,
      answers: 8,
      isLiked: false,
      isFollowed: true,
      isResolved: false,
      lastActivity: '2 hours ago',
      topAnswer: {
        author: 'Dr. Mike Nutrition',
        authorRole: 'Sports Nutritionist',
        content: 'For teenage athletes, I recommend a combination of complex carbs and lean protein 1-2 hours before training. Great options include: banana with peanut butter, oatmeal with berries, or whole grain toast with turkey. Avoid high-fat foods that can cause digestive issues.',
        likes: 15,
        isExpert: true,
      },
    },
    {
      id: 2,
      title: 'How to improve vertical jump for basketball? 🏀',
      content: 'I\'ve been training for 6 months but my vertical jump hasn\'t improved much. Currently at 28 inches and want to reach 32+. What specific exercises and training frequency would you recommend?',
      author: 'Marcus Williams',
      authorAvatar: 'https://randomuser.me/api/portraits/men/2.jpg',
      authorRole: 'Athlete',
      category: 'training',
      tags: ['basketball', 'vertical-jump', 'plyometrics', 'strength'],
      date: '2025-08-21',
      time: '18:45',
      views: 78,
      likes: 23,
      answers: 12,
      isLiked: true,
      isFollowed: false,
      isResolved: true,
      lastActivity: '5 hours ago',
      topAnswer: {
        author: 'Coach Thompson',
        authorRole: 'Basketball Coach',
        content: 'Focus on plyometric exercises 3x per week: box jumps, depth jumps, and single-leg bounds. Also add strength training with squats and deadlifts 2x per week. Progressive overload is key - increase intensity gradually.',
        likes: 28,
        isExpert: true,
      },
    },
    {
      id: 3,
      title: 'Dealing with sports anxiety in young athletes',
      content: 'My 12-year-old daughter gets really nervous before competitions and it affects her performance. She\'s a talented swimmer but the anxiety holds her back. Any advice from coaches or sports psychologists?',
      author: 'Jennifer Davis',
      authorAvatar: 'https://randomuser.me/api/portraits/women/3.jpg',
      authorRole: 'Parent',
      category: 'psychology',
      tags: ['sports-psychology', 'anxiety', 'young-athletes', 'swimming'],
      date: '2025-08-21',
      time: '10:15',
      views: 34,
      likes: 8,
      answers: 6,
      isLiked: false,
      isFollowed: true,
      isResolved: false,
      lastActivity: '1 day ago',
      topAnswer: {
        author: 'Dr. Emma Sports Psych',
        authorRole: 'Sports Psychologist',
        content: 'Pre-competition anxiety is common. Try visualization techniques, deep breathing exercises, and positive self-talk. Establish a consistent pre-race routine. Consider working with a sports psychologist for personalized strategies.',
        likes: 12,
        isExpert: true,
      },
    },
    {
      id: 4,
      title: 'Recovery time between intense training sessions?',
      content: 'I\'m training for track and field (sprints). Currently doing high-intensity sessions every other day, but wondering if I need more recovery time. I\'m 17 years old and have been training for 2 years.',
      author: 'Alex Rodriguez',
      authorAvatar: 'https://randomuser.me/api/portraits/men/4.jpg',
      authorRole: 'Athlete',
      category: 'recovery',
      tags: ['recovery', 'track-and-field', 'sprints', 'training-schedule'],
      date: '2025-08-20',
      time: '16:20',
      views: 56,
      likes: 15,
      answers: 9,
      isLiked: false,
      isFollowed: false,
      isResolved: false,
      lastActivity: '6 hours ago',
    },
    {
      id: 5,
      title: 'Strength training for soccer players - beginner tips? ⚽',
      content: 'Just started playing soccer seriously (age 15) and coach says I need to build more strength. Never done weight training before. What are the essential exercises I should start with?',
      author: 'Jamie Chen',
      authorAvatar: 'https://randomuser.me/api/portraits/men/5.jpg',
      authorRole: 'Athlete',
      category: 'training',
      tags: ['soccer', 'strength-training', 'beginner', 'weight-training'],
      date: '2025-08-20',
      time: '09:30',
      views: 42,
      likes: 11,
      answers: 7,
      isLiked: true,
      isFollowed: true,
      isResolved: true,
      lastActivity: '3 hours ago',
    },
  ]);

  const categories = [
    { id: 'all', name: 'All Questions', icon: 'forum' },
    { id: 'training', name: 'Training', icon: 'fitness-center' },
    { id: 'nutrition', name: 'Nutrition', icon: 'restaurant' },
    { id: 'recovery', name: 'Recovery', icon: 'hotel' },
    { id: 'psychology', name: 'Psychology', icon: 'psychology' },
    { id: 'equipment', name: 'Equipment', icon: 'sports' },
    { id: 'injury', name: 'Injury', icon: 'healing' },
  ];

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    Vibration.vibrate(50);
    
    // Simulate API call
    setTimeout(() => {
      Alert.alert(
        '🔄 Forum Refreshed',
        'Latest questions and answers loaded!',
        [{ text: 'Great! 👍', style: 'default' }]
      );
      setRefreshing(false);
    }, 1500);
  }, []);

  const handleQuestionPress = (question) => {
    Vibration.vibrate(30);
    setSelectedQuestion(question);
    setModalVisible(true);
  };

  const handleLikeQuestion = (questionId) => {
    Vibration.vibrate(25);
    setQuestions(prev =>
      prev.map(q =>
        q.id === questionId
          ? {
              ...q,
              isLiked: !q.isLiked,
              likes: q.isLiked ? q.likes - 1 : q.likes + 1
            }
          : q
      )
    );
  };

  const handleFollowQuestion = (questionId) => {
    Vibration.vibrate(25);
    setQuestions(prev =>
      prev.map(q =>
        q.id === questionId ? { ...q, isFollowed: !q.isFollowed } : q
      )
    );
  };

  const handleAskQuestion = () => {
    if (!newQuestionTitle.trim() || !newQuestion.trim()) {
      Alert.alert('Incomplete Question', 'Please provide both title and description for your question.');
      return;
    }

    const question = {
      id: questions.length + 1,
      title: newQuestionTitle,
      content: newQuestion,
      author: user?.name || 'Anonymous User',
      authorAvatar: user?.avatar || 'https://randomuser.me/api/portraits/men/10.jpg',
      authorRole: user?.role || 'Athlete',
      category: newQuestionCategory,
      tags: [],
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString(),
      views: 0,
      likes: 0,
      answers: 0,
      isLiked: false,
      isFollowed: true,
      isResolved: false,
      lastActivity: 'Just now',
    };

    setQuestions(prev => [question, ...prev]);
    setNewQuestion('');
    setNewQuestionTitle('');
    setNewQuestionCategory('general');
    setAskQuestionModal(false);
    
    Vibration.vibrate(50);
    Alert.alert(
      '✅ Question Posted!',
      'Your question has been posted to the forum. Community members will start answering soon!',
      [{ text: 'Awesome! 🎉', style: 'default' }]
    );
  };

  const getCategoryIcon = (category) => {
    const cat = categories.find(c => c.id === category);
    return cat ? cat.icon : 'help';
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'Coach': return COLORS.primary;
      case 'Sports Nutritionist': 
      case 'Sports Psychologist':
      case 'Expert': return COLORS.success;
      case 'Parent': return COLORS.warning;
      case 'Athlete': return COLORS.secondary;
      default: return COLORS.textSecondary;
    }
  };

  const filteredQuestions = questions.filter(question => {
    const matchesSearch = question.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         question.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         question.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         question.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || question.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const renderQuestionCard = (question) => (
    <TouchableOpacity
      key={question.id}
      onPress={() => handleQuestionPress(question)}
      activeOpacity={0.7}
    >
      <Card style={[styles.questionCard, question.isResolved && styles.resolvedCard]}>
        <Card.Content>
          <View style={styles.questionHeader}>
            <View style={styles.authorInfo}>
              <Avatar.Image 
                size={40} 
                source={{ uri: question.authorAvatar }}
                style={styles.authorAvatar}
              />
              <View style={styles.authorDetails}>
                <Text style={[TEXT_STYLES.body, styles.authorName]}>
                  {question.author}
                </Text>
                <View style={styles.authorMeta}>
                  <Chip 
                    mode="outlined" 
                    compact 
                    style={[styles.roleChip, { borderColor: getRoleColor(question.authorRole) }]}
                    textStyle={[styles.roleText, { color: getRoleColor(question.authorRole) }]}
                  >
                    {question.authorRole}
                  </Chip>
                  <Text style={[TEXT_STYLES.caption, styles.questionTime]}>
                    {question.lastActivity}
                  </Text>
                </View>
              </View>
            </View>
            {question.isResolved && (
              <Chip 
                mode="flat" 
                compact 
                style={styles.resolvedChip}
                textStyle={styles.resolvedText}
                icon="check-circle"
              >
                Solved
              </Chip>
            )}
          </View>

          <Text style={[TEXT_STYLES.h3, styles.questionTitle]}>
            {question.title}
          </Text>

          <Text style={[TEXT_STYLES.body, styles.questionContent]} numberOfLines={3}>
            {question.content}
          </Text>

          <View style={styles.questionTags}>
            {question.tags.slice(0, 3).map((tag, index) => (
              <Chip 
                key={index}
                mode="outlined" 
                compact 
                style={styles.tagChip}
                textStyle={styles.tagText}
              >
                #{tag}
              </Chip>
            ))}
            <Chip 
              mode="outlined" 
              compact 
              style={[styles.categoryChip, { borderColor: COLORS.primary }]}
              textStyle={[styles.categoryText, { color: COLORS.primary }]}
              icon={getCategoryIcon(question.category)}
            >
              {categories.find(c => c.id === question.category)?.name || 'General'}
            </Chip>
          </View>

          <View style={styles.questionStats}>
            <View style={styles.statItem}>
              <Icon name="visibility" size={16} color={COLORS.textSecondary} />
              <Text style={[TEXT_STYLES.caption, styles.statText]}>
                {question.views} views
              </Text>
            </View>
            <View style={styles.statItem}>
              <Icon name="question-answer" size={16} color={COLORS.primary} />
              <Text style={[TEXT_STYLES.caption, styles.statText]}>
                {question.answers} answers
              </Text>
            </View>
            <TouchableOpacity 
              style={styles.statItem}
              onPress={() => handleLikeQuestion(question.id)}
            >
              <Icon 
                name={question.isLiked ? "favorite" : "favorite-outline"} 
                size={16} 
                color={question.isLiked ? COLORS.error : COLORS.textSecondary} 
              />
              <Text style={[TEXT_STYLES.caption, styles.statText]}>
                {question.likes} likes
              </Text>
            </TouchableOpacity>
          </View>

          {question.topAnswer && (
            <Surface style={styles.topAnswerPreview}>
              <View style={styles.topAnswerHeader}>
                <Icon name="star" size={16} color={COLORS.warning} />
                <Text style={[TEXT_STYLES.caption, styles.topAnswerLabel]}>
                  Top Answer by {question.topAnswer.author}
                </Text>
                {question.topAnswer.isExpert && (
                  <Icon name="verified" size={16} color={COLORS.success} />
                )}
              </View>
              <Text style={[TEXT_STYLES.caption, styles.topAnswerText]} numberOfLines={2}>
                {question.topAnswer.content}
              </Text>
            </Surface>
          )}
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  const renderQuestionModal = () => (
    <Portal>
      <Modal
        visible={modalVisible}
        onDismiss={() => setModalVisible(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <BlurView style={styles.blurView} blurType="light" blurAmount={10}>
          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {selectedQuestion && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={[TEXT_STYLES.h3, styles.modalTitle]}>
                    {selectedQuestion.title}
                  </Text>
                  <IconButton
                    icon="close"
                    size={24}
                    onPress={() => setModalVisible(false)}
                    style={styles.closeButton}
                  />
                </View>

                <Surface style={styles.questionDetailCard}>
                  <View style={styles.questionAuthorInfo}>
                    <Avatar.Image 
                      size={50} 
                      source={{ uri: selectedQuestion.authorAvatar }}
                    />
                    <View style={styles.questionAuthorDetails}>
                      <Text style={[TEXT_STYLES.body, styles.questionAuthorName]}>
                        {selectedQuestion.author}
                      </Text>
                      <View style={styles.questionAuthorMeta}>
                        <Chip 
                          mode="outlined" 
                          compact 
                          style={[styles.roleChip, { borderColor: getRoleColor(selectedQuestion.authorRole) }]}
                          textStyle={[styles.roleText, { color: getRoleColor(selectedQuestion.authorRole) }]}
                        >
                          {selectedQuestion.authorRole}
                        </Chip>
                        <Text style={[TEXT_STYLES.caption]}>
                          Asked {selectedQuestion.date} • {selectedQuestion.lastActivity}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <Text style={[TEXT_STYLES.body, styles.questionDetailContent]}>
                    {selectedQuestion.content}
                  </Text>

                  <View style={styles.questionDetailActions}>
                    <Button
                      mode="outlined"
                      onPress={() => handleLikeQuestion(selectedQuestion.id)}
                      style={[styles.actionButton, selectedQuestion.isLiked && styles.likedButton]}
                      icon={selectedQuestion.isLiked ? "favorite" : "favorite-outline"}
                      buttonColor={selectedQuestion.isLiked ? 'rgba(244, 67, 54, 0.1)' : 'transparent'}
                    >
                      {selectedQuestion.likes} Likes
                    </Button>
                    <Button
                      mode="outlined"
                      onPress={() => handleFollowQuestion(selectedQuestion.id)}
                      style={[styles.actionButton, selectedQuestion.isFollowed && styles.followedButton]}
                      icon={selectedQuestion.isFollowed ? "notifications-active" : "notifications-none"}
                      buttonColor={selectedQuestion.isFollowed ? 'rgba(102, 126, 234, 0.1)' : 'transparent'}
                    >
                      {selectedQuestion.isFollowed ? 'Following' : 'Follow'}
                    </Button>
                  </View>
                </Surface>

                {selectedQuestion.topAnswer && (
                  <Surface style={styles.topAnswerCard}>
                    <View style={styles.topAnswerCardHeader}>
                      <Icon name="star" size={24} color={COLORS.warning} />
                      <Text style={[TEXT_STYLES.h3, styles.topAnswerTitle]}>
                        Top Answer
                      </Text>
                      {selectedQuestion.topAnswer.isExpert && (
                        <Icon name="verified" size={20} color={COLORS.success} />
                      )}
                    </View>
                    
                    <View style={styles.answerAuthorInfo}>
                      <Text style={[TEXT_STYLES.body, styles.answerAuthor]}>
                        By {selectedQuestion.topAnswer.author}
                      </Text>
                      <Text style={[TEXT_STYLES.caption]}>
                        {selectedQuestion.topAnswer.authorRole}
                      </Text>
                    </View>

                    <Text style={[TEXT_STYLES.body, styles.answerContent]}>
                      {selectedQuestion.topAnswer.content}
                    </Text>

                    <View style={styles.answerStats}>
                      <View style={styles.statItem}>
                        <Icon name="thumb-up" size={16} color={COLORS.success} />
                        <Text style={[TEXT_STYLES.caption, styles.statText]}>
                          {selectedQuestion.topAnswer.likes} helpful
                        </Text>
                      </View>
                    </View>
                  </Surface>
                )}

                <Surface style={styles.answerInputCard}>
                  <Text style={[TEXT_STYLES.h3, styles.answerInputTitle]}>
                    Your Answer 💬
                  </Text>
                  <TextInput
                    style={styles.answerInput}
                    placeholder="Share your knowledge and help the community..."
                    multiline
                    numberOfLines={4}
                    value={newAnswer}
                    onChangeText={setNewAnswer}
                  />
                  <Button
                    mode="contained"
                    onPress={() => {
                      if (newAnswer.trim()) {
                        Alert.alert('Answer Posted!', 'Your answer has been added to the discussion.');
                        setNewAnswer('');
                      }
                    }}
                    style={styles.submitAnswerButton}
                    buttonColor={COLORS.primary}
                    icon="send"
                  >
                    Post Answer
                  </Button>
                </Surface>
              </>
            )}
          </ScrollView>
        </BlurView>
      </Modal>
    </Portal>
  );

  const renderAskQuestionModal = () => (
    <Portal>
      <Modal
        visible={askQuestionModal}
        onDismiss={() => setAskQuestionModal(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <BlurView style={styles.blurView} blurType="light" blurAmount={10}>
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.askModalContent}
          >
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.askModalHeader}>
                <Text style={[TEXT_STYLES.h3, styles.askModalTitle]}>
                  Ask a Question 🤔
                </Text>
                <IconButton
                  icon="close"
                  size={24}
                  onPress={() => setAskQuestionModal(false)}
                  style={styles.closeButton}
                />
              </View>

              <Surface style={styles.askFormCard}>
                <Text style={[TEXT_STYLES.body, styles.formLabel]}>
                  Question Title *
                </Text>
                <TextInput
                  style={styles.titleInput}
                  placeholder="What's your question about?"
                  value={newQuestionTitle}
                  onChangeText={setNewQuestionTitle}
                />

                <Text style={[TEXT_STYLES.body, styles.formLabel]}>
                  Category
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categorySelector}>
                  {categories.slice(1).map(category => (
                    <TouchableOpacity
                      key={category.id}
                      onPress={() => setNewQuestionCategory(category.id)}
                    >
                      <Chip 
                        selected={newQuestionCategory === category.id}
                        onPress={() => setNewQuestionCategory(category.id)}
                        style={[
                          styles.categorySelectorChip,
                          newQuestionCategory === category.id && styles.selectedCategoryChip
                        ]}
                        textStyle={newQuestionCategory === category.id ? styles.selectedChipText : styles.chipText}
                        icon={category.icon}
                      >
                        {category.name}
                      </Chip>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                <Text style={[TEXT_STYLES.body, styles.formLabel]}>
                  Description *
                </Text>
                <TextInput
                  style={styles.questionInput}
                  placeholder="Provide details about your question. The more context you give, the better answers you'll receive..."
                  multiline
                  numberOfLines={6}
                  value={newQuestion}
                  onChangeText={setNewQuestion}
                />

                <View style={styles.askFormActions}>
                  <Button
                    mode="outlined"
                    onPress={() => setAskQuestionModal(false)}
                    style={styles.cancelButton}
                  >
                    Cancel
                  </Button>
                  <Button
                    mode="contained"
                    onPress={handleAskQuestion}
                    style={styles.submitButton}
                    buttonColor={COLORS.primary}
                    icon="send"
                  >
                    Post Question
                  </Button>
                </View>
              </Surface>
            </ScrollView>
          </KeyboardAvoidingView>
        </BlurView>
      </Modal>
    </Portal>
  );

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        style={styles.header}
      >
        <Text style={[TEXT_STYLES.h2, styles.headerTitle]}>
          Questions Forum 🤝
        </Text>
        <Text style={[TEXT_STYLES.caption, styles.headerSubtitle]}>
          Get answers from the community
        </Text>
      </LinearGradient>

      <View style={styles.content}>
        <Searchbar
          placeholder="Search questions, topics, or experts..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
          iconColor={COLORS.primary}
        />

        <ScrollView 
          horizontal 
          style={styles.categoryContainer}
          showsHorizontalScrollIndicator={false}
        >
          {categories.map(category => (
            <TouchableOpacity
              key={category.id}
              onPress={() => setSelectedCategory(category.id)}
            >
              <Chip 
                selected={selectedCategory === category.id}
                onPress={() => setSelectedCategory(category.id)}
                style={[
                  styles.categoryChip,
                  selectedCategory === category.id && styles.selectedCategoryChip
                ]}
                textStyle={selectedCategory === category.id ? styles.selectedChipText : styles.chipText}
                icon={category.icon}
              >
                {category.name}
              </Chip>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Animated.View style={[styles.questionsContainer, { 
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }]}>
          <ScrollView
            style={styles.questionsList}
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
            {filteredQuestions.length > 0 ? (
              filteredQuestions.map(renderQuestionCard)
            ) : (
              <Surface style={styles.emptyState}>
                <Icon name="help-outline" size={64} color={COLORS.textSecondary} />
                <Text style={[TEXT_STYLES.h3, styles.emptyTitle]}>
                  No Questions Found
                </Text>
                <Text style={[TEXT_STYLES.caption, styles.emptySubtitle]}>
                  {searchQuery || selectedCategory !== 'all' 
                    ? 'Try adjusting your search or category filter'
                    : 'Be the first to ask a question!'
                  }
                </Text>
                <Button
                  mode="contained"
                  onPress={() => setAskQuestionModal(true)}
                  style={styles.emptyActionButton}
                  buttonColor={COLORS.primary}
                  icon="add"
                >
                  Ask First Question
                </Button>
              </Surface>
            )}
          </ScrollView>
        </Animated.View>
      </View>

      <FAB
        icon="add"
        style={[styles.fab, { backgroundColor: COLORS.primary }]}
        onPress={() => {
          Vibration.vibrate(30);
          setAskQuestionModal(true);
        }}
        label="Ask Question"
      />

      {renderQuestionModal()}
      {renderAskQuestionModal()}
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
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTitle: {
    color: 'white',
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
  },
  searchbar: {
    marginBottom: SPACING.md,
    backgroundColor: COLORS.surface,
    elevation: 2,
  },
  categoryContainer: {
    marginBottom: SPACING.md,
  },
  categoryChip: {
    marginRight: SPACING.sm,
    backgroundColor: COLORS.surface,
    elevation: 1,
  },
  selectedCategoryChip: {
    backgroundColor: COLORS.primary,
    elevation: 3,
  },
  chipText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  selectedChipText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '600',
  },
  questionsContainer: {
    flex: 1,
  },
  questionsList: {
    flex: 1,
  },
  questionCard: {
    marginBottom: SPACING.md,
    backgroundColor: COLORS.surface,
    elevation: 2,
    borderRadius: 12,
  },
  resolvedCard: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.success,
    backgroundColor: 'rgba(76, 175, 80, 0.05)',
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  authorAvatar: {
    marginRight: SPACING.sm,
  },
  authorDetails: {
    flex: 1,
  },
  authorName: {
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  authorMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  roleChip: {
    height: 24,
    marginRight: SPACING.sm,
  },
  roleText: {
    fontSize: 10,
    fontWeight: '600',
  },
  questionTime: {
    fontSize: 12,
  },
  resolvedChip: {
    backgroundColor: COLORS.success,
    height: 28,
  },
  resolvedText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '600',
  },
  questionTitle: {
    color: COLORS.text,
    marginBottom: SPACING.sm,
    lineHeight: 28,
  },
  questionContent: {
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
    lineHeight: 22,
  },
  questionTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: SPACING.md,
  },
  tagChip: {
    height: 28,
    marginRight: SPACING.xs,
    marginBottom: SPACING.xs,
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    borderColor: 'rgba(102, 126, 234, 0.3)',
  },
  tagText: {
    fontSize: 11,
    color: COLORS.primary,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '600',
  },
  questionStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    marginLeft: 4,
    fontSize: 12,
  },
  topAnswerPreview: {
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
    padding: SPACING.sm,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.warning,
    marginTop: SPACING.sm,
    elevation: 1,
  },
  topAnswerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  topAnswerLabel: {
    marginLeft: 4,
    fontWeight: '600',
    color: COLORS.warning,
    fontSize: 12,
  },
  topAnswerText: {
    fontSize: 13,
    lineHeight: 18,
    color: COLORS.text,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xl * 2,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    elevation: 1,
  },
  emptyTitle: {
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
    color: COLORS.textSecondary,
  },
  emptySubtitle: {
    textAlign: 'center',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  emptyActionButton: {
    elevation: 0,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.md,
    right: 0,
    bottom: 0,
    elevation: 8,
  },
  // Modal styles
  modalContainer: {
    margin: SPACING.md,
    maxHeight: '90%',
  },
  blurView: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  modalContent: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    padding: SPACING.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.lg,
  },
  modalTitle: {
    flex: 1,
    color: COLORS.text,
    marginRight: SPACING.sm,
    lineHeight: 28,
  },
  closeButton: {
    margin: 0,
  },
  questionDetailCard: {
    padding: SPACING.md,
    borderRadius: 12,
    marginBottom: SPACING.md,
    elevation: 1,
  },
  questionAuthorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  questionAuthorDetails: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  questionAuthorName: {
    fontWeight: '600',
    marginBottom: 4,
  },
  questionAuthorMeta: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  questionDetailContent: {
    lineHeight: 24,
    marginBottom: SPACING.md,
  },
  questionDetailActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: SPACING.xs,
  },
  likedButton: {
    borderColor: COLORS.error,
  },
  followedButton: {
    borderColor: COLORS.primary,
  },
  topAnswerCard: {
    padding: SPACING.md,
    borderRadius: 12,
    marginBottom: SPACING.md,
    elevation: 1,
    backgroundColor: 'rgba(255, 193, 7, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 193, 7, 0.3)',
  },
  topAnswerCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  topAnswerTitle: {
    marginLeft: SPACING.sm,
    color: COLORS.warning,
    flex: 1,
  },
  answerAuthorInfo: {
    marginBottom: SPACING.sm,
  },
  answerAuthor: {
    fontWeight: '600',
    color: COLORS.text,
  },
  answerContent: {
    lineHeight: 24,
    marginBottom: SPACING.sm,
  },
  answerStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  answerInputCard: {
    padding: SPACING.md,
    borderRadius: 12,
    elevation: 1,
  },
  answerInputTitle: {
    marginBottom: SPACING.md,
    color: COLORS.text,
  },
  answerInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: SPACING.sm,
    marginBottom: SPACING.md,
    minHeight: 100,
    textAlignVertical: 'top',
    fontSize: 16,
  },
  submitAnswerButton: {
    elevation: 0,
  },
  // Ask Question Modal styles
  askModalContent: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    padding: SPACING.lg,
    maxHeight: '90%',
  },
  askModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  askModalTitle: {
    color: COLORS.text,
  },
  askFormCard: {
    padding: SPACING.md,
    borderRadius: 12,
    elevation: 1,
  },
  formLabel: {
    fontWeight: '600',
    marginBottom: SPACING.sm,
    color: COLORS.text,
  },
  titleInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: SPACING.sm,
    marginBottom: SPACING.md,
    fontSize: 16,
  },
  categorySelector: {
    marginBottom: SPACING.md,
  },
  categorySelectorChip: {
    marginRight: SPACING.sm,
    backgroundColor: COLORS.surface,
    elevation: 1,
  },
  questionInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: SPACING.sm,
    marginBottom: SPACING.md,
    minHeight: 120,
    textAlignVertical: 'top',
    fontSize: 16,
  },
  askFormActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  submitButton: {
    flex: 1,
    marginLeft: SPACING.sm,
    elevation: 0,
  },
});

export default QuestionsForum;