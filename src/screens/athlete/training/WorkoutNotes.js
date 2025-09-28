import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Animated,
  Alert,
  Vibration,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Card,
  Button,
  Chip,
  ProgressBar,
  Avatar,
  IconButton,
  Surface,
  Searchbar,
  FAB,
  Portal,
  Dialog,
  Checkbox,
  RadioButton,
  Divider,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Import design system constants
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const { width, height } = Dimensions.get('window');

const WorkoutNotes = ({ navigation, route }) => {
  // Animation values
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(50))[0];
  const fabScale = useState(new Animated.Value(1))[0];

  // Refs
  const scrollViewRef = useRef(null);
  const textInputRef = useRef(null);

  // State management
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSort, setSelectedSort] = useState('recent');
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [selectedNotes, setSelectedNotes] = useState([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  // Note creation/editing state
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteCategory, setNoteCategory] = useState('general');
  const [noteTags, setNoteTags] = useState([]);
  const [noteRating, setNoteRating] = useState(0);
  const [isVoiceRecording, setIsVoiceRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);

  // Modal states
  const [showAddNoteDialog, setShowAddNoteDialog] = useState(false);
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const [showVoiceDialog, setShowVoiceDialog] = useState(false);

  // Redux state
  const dispatch = useDispatch();
  const { workoutNotes, user, isLoading } = useSelector(state => ({
    workoutNotes: state.training?.workoutNotes || [],
    user: state.auth?.user || {},
    isLoading: state.training?.isLoading || false,
  }));

  // Mock data for comprehensive note types
  const mockWorkoutNotes = [
    {
      id: '1',
      title: 'Football Training - Sprint Improvements',
      content: 'Today I focused on acceleration drills and noticed significant improvement in my first 10 meters. My reaction time feels much sharper after working on the technique Coach Johnson showed me last week.\n\nKey observations:\n- Better body positioning at start\n- More explosive first step\n- Need to work on maintaining speed through 30m mark\n\nGoals for next session:\n- Focus on stride length consistency\n- Practice quick direction changes',
      category: 'performance',
      tags: ['sprint', 'acceleration', 'technique', 'football'],
      date: '2025-08-24T14:30:00Z',
      workoutId: 'workout_1',
      workoutTitle: 'Elite Football Training',
      rating: 4,
      mood: 'motivated',
      energy: 8,
      difficulty: 7,
      author: 'self',
      isPinned: true,
      hasImages: false,
      hasVoice: false,
      lastEdited: '2025-08-24T15:45:00Z',
      wordCount: 89,
    },
    {
      id: '2',
      title: 'Strength Training - New PR!',
      content: 'AMAZING session today! Hit a new personal record on back squats - 95kg for 5 reps! 🎉\n\nThe progressive overload program is really paying off. I can feel the difference in my leg strength during football practice too.\n\nTrainer Sarah\'s form corrections last month have made all the difference. Key points I\'m remembering:\n- Keep chest up and core tight\n- Full depth on every rep\n- Controlled eccentric phase\n\nNext goal: 100kg by month end!',
      category: 'achievement',
      tags: ['strength', 'pr', 'squat', 'milestone'],
      date: '2025-08-22T11:15:00Z',
      workoutId: 'workout_2',
      workoutTitle: 'Strength & Power Development',
      rating: 5,
      mood: 'ecstatic',
      energy: 9,
      difficulty: 8,
      author: 'self',
      isPinned: true,
      hasImages: true,
      hasVoice: false,
      lastEdited: '2025-08-22T11:30:00Z',
      wordCount: 102,
      achievements: ['Personal Record', 'Strength Milestone'],
    },
    {
      id: '3',
      title: 'Recovery Session Insights',
      content: 'Spent quality time on mobility and recovery today. Anna pointed out some significant improvements in my hamstring flexibility - the consistent stretching routine is working!\n\nNoticed areas that still need attention:\n- Right ankle mobility (old injury)\n- Hip flexor tightness on left side\n- Shoulder blade activation\n\nPlanning to add 10 minutes of targeted stretching to daily routine.',
      category: 'recovery',
      tags: ['mobility', 'flexibility', 'hamstring', 'recovery'],
      date: '2025-08-20T16:00:00Z',
      workoutId: 'workout_4',
      workoutTitle: 'Recovery & Mobility Session',
      rating: 4,
      mood: 'relaxed',
      energy: 6,
      difficulty: 3,
      author: 'self',
      isPinned: false,
      hasImages: false,
      hasVoice: true,
      lastEdited: '2025-08-20T16:15:00Z',
      wordCount: 67,
    },
    {
      id: '4',
      title: 'Coach Feedback - Basketball Skills',
      content: 'Coach Mike shared some excellent insights after today\'s shooting session:\n\n"Your form has improved dramatically over the past month. The arc consistency is much better, and your follow-through is more natural. Focus on maintaining that same rhythm under pressure."\n\nSpecific areas to work on:\n- Shot selection in game situations\n- Catch and shoot timing\n- Maintaining form when fatigued\n\nPlanning to practice these scenarios in next session.',
      category: 'feedback',
      tags: ['basketball', 'shooting', 'coach-feedback', 'form'],
      date: '2025-08-18T10:45:00Z',
      workoutId: 'workout_3',
      workoutTitle: 'Basketball Skills Masterclass',
      rating: 4,
      mood: 'focused',
      energy: 7,
      difficulty: 6,
      author: 'coach',
      coachName: 'Coach Mike',
      coachAvatar: 'https://i.pravatar.cc/150?img=3',
      isPinned: false,
      hasImages: false,
      hasVoice: false,
      lastEdited: '2025-08-18T10:50:00Z',
      wordCount: 88,
    },
    {
      id: '5',
      title: 'Mental Game Reflection',
      content: 'Had a tough training session today - not physically, but mentally. Found myself getting frustrated when drills weren\'t going perfectly.\n\nRealized I need to work on:\n- Patience with the learning process\n- Celebrating small improvements\n- Managing expectations\n\nReminder: Progress isn\'t always linear. Bad days are part of the journey.\n\nTomorrow is a new opportunity to apply what I learned today.',
      category: 'mental',
      tags: ['mindset', 'reflection', 'mental-game', 'growth'],
      date: '2025-08-17T19:30:00Z',
      workoutId: null,
      workoutTitle: null,
      rating: 3,
      mood: 'reflective',
      energy: 5,
      difficulty: 6,
      author: 'self',
      isPinned: false,
      hasImages: false,
      hasVoice: false,
      lastEdited: '2025-08-17T19:45:00Z',
      wordCount: 78,
    },
    {
      id: '6',
      title: 'Nutrition Impact Observation',
      content: 'Interesting correlation I\'ve noticed: training sessions after my new pre-workout meal (oatmeal + banana + almonds 2 hours before) feel significantly better.\n\nEnergy levels remain consistent throughout the session, and recovery seems faster.\n\nPrevious breakfast routine left me feeling sluggish by the 45-minute mark.\n\nPlanning to stick with this approach and monitor results over the next two weeks.',
      category: 'nutrition',
      tags: ['nutrition', 'pre-workout', 'energy', 'performance'],
      date: '2025-08-16T12:20:00Z',
      workoutId: null,
      workoutTitle: null,
      rating: 4,
      mood: 'analytical',
      energy: 8,
      difficulty: 5,
      author: 'self',
      isPinned: false,
      hasImages: false,
      hasVoice: false,
      lastEdited: '2025-08-16T12:25:00Z',
      wordCount: 65,
    },
  ];

  // Categories configuration
  const categories = [
    { id: 'all', label: 'All Notes', icon: 'description', color: COLORS.primary },
    { id: 'performance', label: 'Performance', icon: 'trending-up', color: '#4CAF50' },
    { id: 'achievement', label: 'Achievements', icon: 'jump-rope', color: '#FFD700' },
    { id: 'recovery', label: 'Recovery', icon: 'spa', color: '#00BCD4' },
    { id: 'feedback', label: 'Coach Feedback', icon: 'feedback', color: '#FF9800' },
    { id: 'mental', label: 'Mental Game', icon: 'psychology', color: '#9C27B0' },
    { id: 'nutrition', label: 'Nutrition', icon: 'restaurant', color: '#795548' },
    { id: 'general', label: 'General', icon: 'note', color: '#607D8B' },
  ];

  // Available tags
  const availableTags = [
    'technique', 'strength', 'cardio', 'flexibility', 'speed', 'power',
    'mental-game', 'nutrition', 'recovery', 'injury', 'milestone', 'pr',
    'form', 'strategy', 'teamwork', 'focus', 'motivation', 'goals'
  ];

  // Animation on component mount
  useEffect(() => {
    StatusBar.setBarStyle('light-content');
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

    // Check if we should show add note dialog from route params
    if (route?.params?.addNote) {
      setTimeout(() => setShowAddNoteDialog(true), 500);
    }
  }, []);

  // Pull to refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    Vibration.vibrate([50, 100, 50]);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      Alert.alert('✅ Success', 'Notes refreshed successfully!');
    } catch (error) {
      Alert.alert('❌ Error', 'Failed to refresh notes');
    } finally {
      setRefreshing(false);
    }
  }, []);

  // Filter and sort notes
  const filteredAndSortedNotes = React.useMemo(() => {
    let filtered = mockWorkoutNotes.filter(note => {
      const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           note.tags?.some(tag => tag.includes(searchQuery.toLowerCase()));
      
      const matchesCategory = selectedCategory === 'all' || note.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });

    // Sort notes
    filtered.sort((a, b) => {
      switch (selectedSort) {
        case 'recent':
          return new Date(b.date) - new Date(a.date);
        case 'oldest':
          return new Date(a.date) - new Date(b.date);
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'title':
          return a.title.localeCompare(b.title);
        case 'category':
          return a.category.localeCompare(b.category);
        default:
          return new Date(b.date) - new Date(a.date);
      }
    });

    // Sort pinned notes to top
    const pinnedNotes = filtered.filter(note => note.isPinned);
    const unpinnedNotes = filtered.filter(note => !note.isPinned);
    
    return [...pinnedNotes, ...unpinnedNotes];
  }, [mockWorkoutNotes, searchQuery, selectedCategory, selectedSort]);

  // Get category info
  const getCategoryInfo = (categoryId) => {
    return categories.find(cat => cat.id === categoryId) || categories[0];
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  };

  // Format reading time
  const getReadingTime = (wordCount) => {
    const wordsPerMinute = 200;
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    return `${minutes} min read`;
  };

  // Handle note selection
  const handleNoteSelection = (noteId) => {
    if (isSelectionMode) {
      setSelectedNotes(prev => 
        prev.includes(noteId) 
          ? prev.filter(id => id !== noteId)
          : [...prev, noteId]
      );
    } else {
      navigation.navigate('NoteDetail', { noteId });
    }
  };

  // Handle long press
  const handleLongPress = (noteId) => {
    if (!isSelectionMode) {
      setIsSelectionMode(true);
      setSelectedNotes([noteId]);
      Vibration.vibrate(100);
    }
  };

  // Save note
  const handleSaveNote = async () => {
    if (!noteTitle.trim() || !noteContent.trim()) {
      Alert.alert('⚠️ Missing Information', 'Please add both a title and content for your note.');
      return;
    }

    try {
      Vibration.vibrate([100, 50, 100]);
      
      // Simulate saving
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Reset form
      setNoteTitle('');
      setNoteContent('');
      setNoteCategory('general');
      setNoteTags([]);
      setNoteRating(0);
      setShowAddNoteDialog(false);
      
      Alert.alert('✅ Success', 'Your note has been saved successfully!');
    } catch (error) {
      Alert.alert('❌ Error', 'Failed to save note. Please try again.');
    }
  };

  // FAB animation
  const animateFAB = () => {
    Animated.sequence([
      Animated.spring(fabScale, {
        toValue: 0.8,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(fabScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Render category filters
  const renderCategoryFilters = () => (
    <View style={styles.categoriesContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScrollView}>
        {categories.map((category) => {
          const isSelected = selectedCategory === category.id;
          const noteCount = category.id === 'all' 
            ? mockWorkoutNotes.length 
            : mockWorkoutNotes.filter(note => note.category === category.id).length;

          return (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryChip,
                isSelected && { backgroundColor: category.color + '20', borderColor: category.color }
              ]}
              onPress={() => {
                setSelectedCategory(category.id);
                Vibration.vibrate(30);
              }}
            >
              <Icon 
                name={category.icon} 
                size={18} 
                color={isSelected ? category.color : COLORS.textSecondary} 
              />
              <Text style={[
                styles.categoryText,
                { color: isSelected ? category.color : COLORS.textSecondary }
              ]}>
                {category.label}
              </Text>
              {noteCount > 0 && (
                <View style={[styles.categoryBadge, { backgroundColor: category.color }]}>
                  <Text style={styles.categoryBadgeText}>{noteCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );

  // Render stats overview
  const renderStatsOverview = () => {
    const totalNotes = filteredAndSortedNotes.length;
    const totalWords = filteredAndSortedNotes.reduce((sum, note) => sum + note.wordCount, 0);
    const avgRating = filteredAndSortedNotes.reduce((sum, note) => sum + note.rating, 0) / totalNotes || 0;
    const pinnedCount = filteredAndSortedNotes.filter(note => note.isPinned).length;

    return (
      <Surface style={styles.statsContainer} elevation={2}>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Icon name="description" size={24} color={COLORS.primary} />
            <Text style={[TEXT_STYLES.h3, { color: COLORS.text }]}>{totalNotes}</Text>
            <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>Notes</Text>
          </View>
          
          <View style={styles.statItem}>
            <Icon name="menu-book" size={24} color="#4CAF50" />
            <Text style={[TEXT_STYLES.h3, { color: COLORS.text }]}>{totalWords}</Text>
            <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>Words</Text>
          </View>
          
          <View style={styles.statItem}>
            <Icon name="star" size={24} color="#FFD700" />
            <Text style={[TEXT_STYLES.h3, { color: COLORS.text }]}>{avgRating.toFixed(1)}</Text>
            <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>Avg Rating</Text>
          </View>
          
          <View style={styles.statItem}>
            <Icon name="push-pin" size={24} color="#FF9800" />
            <Text style={[TEXT_STYLES.h3, { color: COLORS.text }]}>{pinnedCount}</Text>
            <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>Pinned</Text>
          </View>
        </View>
      </Surface>
    );
  };

  // Render note card
  const renderNoteCard = ({ item, index }) => {
    const categoryInfo = getCategoryInfo(item.category);
    const isSelected = selectedNotes.includes(item.id);
    
    return (
      <Animated.View
        style={[
          styles.noteCardContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
          isSelected && styles.selectedNoteCard
        ]}
      >
        <Card style={styles.noteCard} elevation={isSelected ? 6 : 3}>
          <TouchableOpacity
            onPress={() => handleNoteSelection(item.id)}
            onLongPress={() => handleLongPress(item.id)}
            activeOpacity={0.8}
          >
            {/* Card Header */}
            <View style={styles.noteCardHeader}>
              <View style={styles.noteHeaderLeft}>
                <View style={[styles.categoryIndicator, { backgroundColor: categoryInfo.color }]}>
                  <Icon name={categoryInfo.icon} size={16} color="#ffffff" />
                </View>
                
                <View style={styles.noteTitleContainer}>
                  <Text style={[TEXT_STYLES.h4, { color: COLORS.text }]} numberOfLines={2}>
                    {item.title}
                  </Text>
                  <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
                    {formatDate(item.date)} • {getReadingTime(item.wordCount)}
                  </Text>
                </View>
              </View>
              
              <View style={styles.noteHeaderRight}>
                {item.isPinned && (
                  <Icon name="push-pin" size={16} color="#FF9800" style={styles.pinIcon} />
                )}
                
                <View style={styles.noteIcons}>
                  {item.hasImages && <Icon name="image" size={14} color={COLORS.textSecondary} />}
                  {item.hasVoice && <Icon name="mic" size={14} color={COLORS.textSecondary} />}
                </View>
                
                {isSelectionMode && (
                  <Checkbox
                    status={isSelected ? 'checked' : 'unchecked'}
                    onPress={() => handleNoteSelection(item.id)}
                  />
                )}
              </View>
            </View>

            {/* Card Body */}
            <View style={styles.noteCardBody}>
              <Text 
                style={[TEXT_STYLES.body, { color: COLORS.textSecondary, lineHeight: 20 }]} 
                numberOfLines={3}
              >
                {item.content}
              </Text>
              
              {/* Tags */}
              {item.tags && item.tags.length > 0 && (
                <View style={styles.tagsContainer}>
                  {item.tags.slice(0, 3).map((tag, tagIndex) => (
                    <Chip
                      key={tagIndex}
                      mode="outlined"
                      compact
                      style={[styles.noteTag, { borderColor: categoryInfo.color + '50' }]}
                      textStyle={[styles.tagText, { color: categoryInfo.color }]}
                    >
                      #{tag}
                    </Chip>
                  ))}
                  {item.tags.length > 3 && (
                    <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
                      +{item.tags.length - 3} more
                    </Text>
                  )}
                </View>
              )}
              
              {/* Footer */}
              <View style={styles.noteFooter}>
                {item.workoutTitle && (
                  <View style={styles.workoutLink}>
                    <Icon name="fitness-center" size={14} color={COLORS.textSecondary} />
                    <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary, marginLeft: 4 }]}>
                      {item.workoutTitle}
                    </Text>
                  </View>
                )}
                
                <View style={styles.noteRating}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Icon
                      key={star}
                      name={star <= item.rating ? 'star' : 'star-border'}
                      size={12}
                      color={star <= item.rating ? '#FFD700' : COLORS.textSecondary}
                    />
                  ))}
                </View>
              </View>

              {/* Author info for coach notes */}
              {item.author === 'coach' && (
                <View style={styles.coachInfo}>
                  <Avatar.Image
                    source={{ uri: item.coachAvatar }}
                    size={24}
                  />
                  <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary, marginLeft: 8 }]}>
                    Note from {item.coachName}
                  </Text>
                </View>
              )}

              {/* Achievements */}
              {item.achievements && item.achievements.length > 0 && (
                <View style={styles.achievementsContainer}>
                  {item.achievements.map((achievement, achIndex) => (
                    <View key={achIndex} style={styles.achievementBadge}>
                      <Icon name="jump-rope" size={12} color="#FFD700" />
                      <Text style={[TEXT_STYLES.caption, { color: COLORS.text, marginLeft: 4 }]}>
                        {achievement}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </TouchableOpacity>
        </Card>
      </Animated.View>
    );
  };

  // Render add note dialog
  const renderAddNoteDialog = () => (
    <Portal>
      <Modal
        visible={showAddNoteDialog}
        onDismiss={() => setShowAddNoteDialog(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContent}
        >
          <View style={styles.modalHeader}>
            <Text style={[TEXT_STYLES.h3, { color: COLORS.text }]}>
              📝 Add New Note
            </Text>
            <IconButton
              icon="close"
              size={24}
              onPress={() => setShowAddNoteDialog(false)}
            />
          </View>
          
          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            {/* Title Input */}
            <View style={styles.inputContainer}>
              <Text style={[TEXT_STYLES.body, { color: COLORS.text, marginBottom: SPACING.sm }]}>
                Note Title
              </Text>
              <TextInput
                ref={textInputRef}
                style={styles.titleInput}
                placeholder="Enter note title..."
                value={noteTitle}
                onChangeText={setNoteTitle}
                maxLength={100}
                autoFocus
              />
            </View>

            {/* Category Selection */}
            <View style={styles.inputContainer}>
              <Text style={[TEXT_STYLES.body, { color: COLORS.text, marginBottom: SPACING.sm }]}>
                Category
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {categories.slice(1).map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.categorySelector,
                      noteCategory === category.id && { backgroundColor: category.color + '20', borderColor: category.color }
                    ]}
                    onPress={() => setNoteCategory(category.id)}
                  >
                    <Icon name={category.icon} size={16} color={noteCategory === category.id ? category.color : COLORS.textSecondary} />
                    <Text style={[
                      styles.categorySelectorText,
                      { color: noteCategory === category.id ? category.color : COLORS.textSecondary }
                    ]}>
                      {category.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Content Input */}
            <View style={styles.inputContainer}>
              <Text style={[TEXT_STYLES.body, { color: COLORS.text, marginBottom: SPACING.sm }]}>
                Content
              </Text>
              <TextInput
                style={styles.contentInput}
                placeholder="Write your note here..."
                value={noteContent}
                onChangeText={setNoteContent}
                multiline
                numberOfLines={8}
                textAlignVertical="top"
                maxLength={2000}
              />
              <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary, textAlign: 'right' }]}>
                {noteContent.length}/2000 characters
              </Text>
            </View>

            {/* Rating */}
            <View style={styles.inputContainer}>
              <Text style={[TEXT_STYLES.body, { color: COLORS.text, marginBottom: SPACING.sm }]}>
                Session Rating
              </Text>
              <View style={styles.ratingContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity
                    key={star}
                    onPress={() => setNoteRating(star)}
                  >
                    <Icon
                      name={star <= noteRating ? 'star' : 'star-border'}
                      size={32}
                      color={star <= noteRating ? '#FFD700' : COLORS.textSecondary}
                      style={styles.ratingStar}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Tags Input */}
            <View style={styles.inputContainer}>
              <Text style={[TEXT_STYLES.body, { color: COLORS.text, marginBottom: SPACING.sm }]}>
                Tags (Optional)
              </Text>
              <View style={styles.tagsInputContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {availableTags.map((tag) => (
                    <TouchableOpacity
                      key={tag}
                      style={[
                        styles.availableTag,
                        noteTags.includes(tag) && styles.selectedTag
                      ]}
                      onPress={() => {
                        setNoteTags(prev => 
                          prev.includes(tag) 
                            ? prev.filter(t => t !== tag)
                            : [...prev, tag]
                        );
                      }}
                    >
                      <Text style={[
                        styles.availableTagText,
                        noteTags.includes(tag) && styles.selectedTagText
                      ]}>
                        #{tag}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>
          </ScrollView>
          
          <View style={styles.modalFooter}>
            <Button
              mode="outlined"
              onPress={() => setShowAddNoteDialog(false)}
              style={styles.modalButton}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleSaveNote}
              style={styles.modalButton}
              buttonColor={COLORS.primary}
              disabled={!noteTitle.trim() || !noteContent.trim()}
            >
              Save Note
            </Button>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </Portal>
  );

  // Render selection toolbar
  const renderSelectionToolbar = () => (
    <Surface style={styles.selectionToolbar} elevation={4}>
      <View style={styles.toolbarLeft}>
        <Text style={[TEXT_STYLES.body, { color: COLORS.text }]}>
          {selectedNotes.length} selected
        </Text>
      </View>
      
      <View style={styles.toolbarRight}>
        <IconButton
          icon="push-pin"
          size={24}
          onPress={() => {
            Alert.alert('📌 Pin Notes', 'Pin selected notes to the top?', [
              { text: 'Cancel', style: 'cancel' },
              { 
                text: 'Pin', 
                onPress: () => {
                  Alert.alert('✅ Success', `${selectedNotes.length} notes pinned!`);
                  setIsSelectionMode(false);
                  setSelectedNotes([]);
                }
              },
            ]);
          }}
        />
        
        <IconButton
          icon="share"
          size={24}
          onPress={() => {
            Alert.alert('📤 Share Notes', 'Share selected notes?', [
              { text: 'Cancel', style: 'cancel' },
              { 
                text: 'Share', 
                onPress: () => {
                  Alert.alert('✅ Success', 'Notes shared successfully!');
                  setIsSelectionMode(false);
                  setSelectedNotes([]);
                }
              },
            ]);
          }}
        />
        
        <IconButton
          icon="delete"
          size={24}
          iconColor={COLORS.error}
          onPress={() => {
            Alert.alert(
              '🗑️ Delete Notes', 
              `Delete ${selectedNotes.length} selected notes? This action cannot be undone.`,
              [
                { text: 'Cancel', style: 'cancel' },
                { 
                  text: 'Delete', 
                  style: 'destructive',
                  onPress: () => {
                    Alert.alert('✅ Success', 'Notes deleted successfully!');
                    setIsSelectionMode(false);
                    setSelectedNotes([]);
                  }
                },
              ]
            );
          }}
        />
        
        <IconButton
          icon="close"
          size={24}
          onPress={() => {
            setIsSelectionMode(false);
            setSelectedNotes([]);
          }}
        />
      </View>
    </Surface>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      {/* Header */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <View>
              <Text style={[TEXT_STYLES.h2, { color: '#ffffff', fontWeight: 'bold' }]}>
                Training Notes 📖
              </Text>
              <Text style={[TEXT_STYLES.body, { color: '#ffffff90' }]}>
                Document your fitness journey
              </Text>
            </View>
            
            <View style={styles.headerActions}>
              <IconButton
                icon="sort"
                size={24}
                iconColor="#ffffff"
                onPress={() => {
                  Alert.alert(
                    '🔄 Sort Options',
                    'Choose how to sort your notes',
                    [
                      { text: 'Most Recent', onPress: () => setSelectedSort('recent') },
                      { text: 'Oldest First', onPress: () => setSelectedSort('oldest') },
                      { text: 'By Rating', onPress: () => setSelectedSort('rating') },
                      { text: 'By Title', onPress: () => setSelectedSort('title') },
                      { text: 'By Category', onPress: () => setSelectedSort('category') },
                      { text: 'Cancel', style: 'cancel' },
                    ]
                  );
                }}
              />
              
              <IconButton
                icon={viewMode === 'list' ? 'grid-view' : 'view-list'}
                size={24}
                iconColor="#ffffff"
                onPress={() => {
                  setViewMode(viewMode === 'list' ? 'grid' : 'list');
                  Vibration.vibrate(30);
                }}
              />
            </View>
          </View>
        </View>
      </LinearGradient>

      {/* Selection Toolbar */}
      {isSelectionMode && renderSelectionToolbar()}

      {/* Main Content */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
            title="Pull to refresh your notes..."
            titleColor={COLORS.primary}
          />
        }
      >
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Searchbar
            placeholder="Search notes, tags, or content..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchbar}
            iconColor={COLORS.primary}
            inputStyle={TEXT_STYLES.body}
            elevation={2}
          />
        </View>

        {/* Stats Overview */}
        {!isSelectionMode && renderStatsOverview()}

        {/* Category Filters */}
        {renderCategoryFilters()}

        {/* Quick Actions */}
        {!isSelectionMode && filteredAndSortedNotes.length > 0 && (
          <View style={styles.quickActionsContainer}>
            <Text style={[TEXT_STYLES.h4, { color: COLORS.text, marginBottom: SPACING.sm }]}>
              ⚡ Quick Actions
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <TouchableOpacity
                style={styles.quickAction}
                onPress={() => setShowAddNoteDialog(true)}
              >
                <Icon name="add" size={24} color={COLORS.primary} />
                <Text style={[TEXT_STYLES.caption, { color: COLORS.primary }]}>
                  New Note
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.quickAction}
                onPress={() => {
                  Alert.alert('🎙️ Voice Note', 'Voice notes feature coming soon!');
                }}
              >
                <Icon name="mic" size={24} color="#4CAF50" />
                <Text style={[TEXT_STYLES.caption, { color: '#4CAF50' }]}>
                  Voice Note
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.quickAction}
                onPress={() => {
                  Alert.alert('📸 Photo Note', 'Photo notes feature coming soon!');
                }}
              >
                <Icon name="camera-alt" size={24} color="#FF9800" />
                <Text style={[TEXT_STYLES.caption, { color: '#FF9800' }]}>
                  Photo Note
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.quickAction}
                onPress={() => navigation.navigate('WorkoutHistory')}
              >
                <Icon name="history" size={24} color="#9C27B0" />
                <Text style={[TEXT_STYLES.caption, { color: '#9C27B0' }]}>
                  From Workout
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        )}

        {/* Notes List */}
        <View style={styles.notesList}>
          {filteredAndSortedNotes.length > 0 ? (
            <>
              <View style={styles.notesListHeader}>
                <Text style={[TEXT_STYLES.h3, { color: COLORS.text, fontWeight: 'bold' }]}>
                  {searchQuery 
                    ? `Search Results (${filteredAndSortedNotes.length})` 
                    : selectedCategory === 'all' 
                      ? `All Notes (${filteredAndSortedNotes.length}) 📝`
                      : `${getCategoryInfo(selectedCategory).label} (${filteredAndSortedNotes.length})`
                  }
                </Text>
                {!isSelectionMode && (
                  <TouchableOpacity
                    style={styles.selectModeButton}
                    onPress={() => {
                      setIsSelectionMode(true);
                      Vibration.vibrate(50);
                    }}
                  >
                    <Icon name="checklist" size={20} color={COLORS.primary} />
                    <Text style={[TEXT_STYLES.caption, { color: COLORS.primary, marginLeft: 4 }]}>
                      Select
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
              
              {filteredAndSortedNotes.map((item, index) => renderNoteCard({ item, index }))}
            </>
          ) : (
            <View style={styles.emptyState}>
              <Animated.View style={[styles.emptyStateContent, { opacity: fadeAnim }]}>
                <LinearGradient
                  colors={['#667eea20', '#764ba220']}
                  style={styles.emptyIconContainer}
                >
                  <Icon name="note-add" size={60} color={COLORS.primary} />
                </LinearGradient>
                
                <Text style={[TEXT_STYLES.h3, { color: COLORS.text, marginTop: SPACING.lg, textAlign: 'center' }]}>
                  {searchQuery ? 'No notes found' : 'No notes yet'}
                </Text>
                
                <Text style={[TEXT_STYLES.body, { 
                  color: COLORS.textSecondary, 
                  textAlign: 'center', 
                  marginTop: SPACING.sm,
                  lineHeight: 22 
                }]}>
                  {searchQuery 
                    ? `No results for "${searchQuery}". Try adjusting your search or category filter.`
                    : 'Start documenting your training journey! Add your first note to track progress, insights, and achievements.'
                  }
                </Text>
                
                {!searchQuery && (
                  <View style={styles.emptyStateActions}>
                    <Button
                      mode="contained"
                      onPress={() => setShowAddNoteDialog(true)}
                      style={styles.primaryAction}
                      buttonColor={COLORS.primary}
                      contentStyle={styles.buttonContent}
                      icon="add"
                    >
                      Create First Note
                    </Button>
                    
                    <Button
                      mode="outlined"
                      onPress={() => navigation.navigate('WorkoutHistory')}
                      style={styles.secondaryAction}
                      contentStyle={styles.buttonContent}
                      icon="history"
                    >
                      Add from Workout
                    </Button>
                  </View>
                )}
              </Animated.View>
            </View>
          )}
        </View>

        {/* Bottom spacing */}
        <View style={{ height: SPACING.xxl * 2 }} />
      </ScrollView>

      {/* Floating Action Button */}
      {!isSelectionMode && filteredAndSortedNotes.length > 0 && (
        <Animated.View style={[styles.fabContainer, { transform: [{ scale: fabScale }] }]}>
          <FAB
            icon="add"
            style={[styles.fab, { backgroundColor: COLORS.primary }]}
            color="#ffffff"
            onPress={() => {
              animateFAB();
              setShowAddNoteDialog(true);
            }}
          />
        </Animated.View>
      )}

      {/* Add Note Dialog */}
      {renderAddNoteDialog()}
    </View>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: StatusBar.currentHeight + SPACING.lg,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  headerContent: {
    flex: 1,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerActions: {
    flexDirection: 'row',
  },
  content: {
    flex: 1,
  },
  
  // Selection Toolbar
  selectionToolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: '#ffffff',
    elevation: 4,
  },
  toolbarLeft: {
    flex: 1,
  },
  toolbarRight: {
    flexDirection: 'row',
  },
  
  // Search
  searchContainer: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  searchbar: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
  },
  
  // Stats Overview
  statsContainer: {
    backgroundColor: '#ffffff',
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    borderRadius: 12,
    padding: SPACING.lg,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  
  // Categories
  categoriesContainer: {
    marginBottom: SPACING.md,
  },
  categoriesScrollView: {
    paddingHorizontal: SPACING.md,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginRight: SPACING.sm,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: COLORS.border || '#e0e0e0',
  },
  categoryText: {
    marginLeft: SPACING.xs,
    fontSize: 14,
  },
  categoryBadge: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: SPACING.xs,
  },
  categoryBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  
  // Quick Actions
  quickActionsContainer: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  quickAction: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: SPACING.md,
    marginRight: SPACING.sm,
    minWidth: 80,
    elevation: 2,
  },
  
  // Notes List
  notesList: {
    paddingHorizontal: SPACING.md,
  },
  notesListHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  selectModeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  
  // Note Card
  noteCardContainer: {
    marginBottom: SPACING.md,
  },
  selectedNoteCard: {
    transform: [{ scale: 0.98 }],
  },
  noteCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    overflow: 'hidden',
  },
  noteCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  noteHeaderLeft: {
    flexDirection: 'row',
    flex: 1,
  },
  categoryIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  noteTitleContainer: {
    flex: 1,
  },
  noteHeaderRight: {
    alignItems: 'flex-end',
  },
  pinIcon: {
    marginBottom: SPACING.xs,
  },
  noteIcons: {
    flexDirection: 'row',
    marginBottom: SPACING.xs,
  },
  noteCardBody: {
    padding: SPACING.md,
    paddingTop: 0,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: SPACING.sm,
    alignItems: 'center',
  },
  noteTag: {
    marginRight: SPACING.xs,
    marginBottom: SPACING.xs,
    backgroundColor: 'transparent',
  },
  tagText: {
    fontSize: 10,
  },
  noteFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  workoutLink: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  noteRating: {
    flexDirection: 'row',
  },
  coachInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border || '#e0e0e0',
  },
  achievementsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: SPACING.sm,
  },
  achievementBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFD70020',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 12,
    marginRight: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  
  // Empty State
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
  },
  emptyStateContent: {
    alignItems: 'center',
    maxWidth: 300,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateActions: {
    width: '100%',
    marginTop: SPACING.xl,
  },
  primaryAction: {
    marginBottom: SPACING.sm,
  },
  secondaryAction: {
    borderColor: COLORS.primary,
  },
  buttonContent: {
    height: 48,
  },
  
  // Modal
  modalContainer: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    flex: 1,
    justifyContent: 'center',
    padding: SPACING.md,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    maxHeight: height * 0.8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border || '#e0e0e0',
  },
  modalBody: {
    flex: 1,
    padding: SPACING.lg,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border || '#e0e0e0',
  },
  modalButton: {
    flex: 0.48,
  },
  
  // Input Fields
  inputContainer: {
    marginBottom: SPACING.lg,
  },
  titleInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: SPACING.md,
    fontSize: 16,
    color: COLORS.text,
  },
  contentInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: SPACING.md,
    fontSize: 16,
    color: COLORS.text,
    minHeight: 120,
  },
  categorySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginRight: SPACING.sm,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  categorySelectorText: {
    marginLeft: SPACING.xs,
    fontSize: 14,
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  ratingStar: {
    marginHorizontal: SPACING.xs,
  },
  tagsInputContainer: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: SPACING.sm,
  },
  availableTag: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    marginRight: SPACING.xs,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: COLORS.border || '#e0e0e0',
  },
  selectedTag: {
    backgroundColor: COLORS.primary + '20',
    borderColor: COLORS.primary,
  },
  availableTagText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  selectedTagText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  
  // FAB
  fabContainer: {
    position: 'absolute',
    bottom: SPACING.lg,
    right: SPACING.lg,
  },
  fab: {
    elevation: 8,
  },
};

export default WorkoutNotes;