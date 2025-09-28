import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  RefreshControl,
  Alert,
  TouchableOpacity,
  Animated,
  Dimensions,
  Vibration,
  TextInput,
} from 'react-native';
import {
  Card,
  Button,
  Chip,
  Avatar,
  IconButton,
  FAB,
  Surface,
  Searchbar,
  Portal,
  Modal,
  Menu,
  Divider,
} from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';

const { width } = Dimensions.get('window');

// Design system constants
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  background: '#f5f7fa',
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
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  subheading: {
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

const CoachNotes = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [notes, setNotes] = useState([]);
  const [filteredNotes, setFilteredNotes] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showMenuIndex, setShowMenuIndex] = useState(null);
  const [newNote, setNewNote] = useState({
    title: '',
    content: '',
    category: 'general',
    priority: 'medium',
    traineeId: null,
    sessionId: null,
  });

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  const categories = [
    { id: 'all', label: 'All Notes', icon: 'note', color: COLORS.primary },
    { id: 'trainee', label: 'Trainee Notes', icon: 'person', color: COLORS.success },
    { id: 'session', label: 'Session Notes', icon: 'fitness-center', color: COLORS.warning },
    { id: 'progress', label: 'Progress', icon: 'trending-up', color: COLORS.secondary },
    { id: 'general', label: 'General', icon: 'note-add', color: COLORS.primary },
  ];

  const priorityColors = {
    high: COLORS.error,
    medium: COLORS.warning,
    low: COLORS.success,
  };

  // Mock data - replace with Redux state
  useEffect(() => {
    loadNotes();
    animateEntrance();
  }, []);

  useEffect(() => {
    filterNotes();
  }, [searchQuery, selectedCategory, notes]);

  const loadNotes = () => {
    // Mock notes data
    const mockNotes = [
      {
        id: 1,
        title: 'John Doe - Strength Progress',
        content: 'Excellent improvement in squat form. Increased weight by 10kg. Focus on core stability next session.',
        category: 'trainee',
        priority: 'high',
        traineeId: 'trainee_1',
        traineeName: 'John Doe',
        sessionId: null,
        createdAt: '2024-02-20T10:30:00Z',
        updatedAt: '2024-02-20T10:30:00Z',
      },
      {
        id: 2,
        title: 'HIIT Session - Group A',
        content: 'Great energy from the group today. Sarah showed exceptional endurance. Mike struggled with burpees - need to modify.',
        category: 'session',
        priority: 'medium',
        traineeId: null,
        sessionId: 'session_1',
        createdAt: '2024-02-19T15:45:00Z',
        updatedAt: '2024-02-19T15:45:00Z',
      },
      {
        id: 3,
        title: 'New Training Equipment',
        content: 'Ordered resistance bands and medicine balls. Should arrive next week. Plan to integrate into functional training sessions.',
        category: 'general',
        priority: 'low',
        traineeId: null,
        sessionId: null,
        createdAt: '2024-02-18T09:15:00Z',
        updatedAt: '2024-02-18T09:15:00Z',
      },
      {
        id: 4,
        title: 'Emma Wilson - Injury Recovery',
        content: 'Knee rehabilitation progressing well. Can now perform bodyweight squats. Avoid jumping exercises for another 2 weeks.',
        category: 'progress',
        priority: 'high',
        traineeId: 'trainee_2',
        traineeName: 'Emma Wilson',
        sessionId: null,
        createdAt: '2024-02-17T14:20:00Z',
        updatedAt: '2024-02-17T14:20:00Z',
      },
    ];
    setNotes(mockNotes);
  };

  const filterNotes = useCallback(() => {
    let filtered = notes;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(note => note.category === selectedCategory);
    }

    if (searchQuery) {
      filtered = filtered.filter(note => 
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (note.traineeName && note.traineeName.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    setFilteredNotes(filtered.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)));
  }, [notes, searchQuery, selectedCategory]);

  const animateEntrance = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    Vibration.vibrate(50);
    setTimeout(() => {
      loadNotes();
      setRefreshing(false);
    }, 1500);
  }, []);

  const handleAddNote = () => {
    if (!newNote.title.trim() || !newNote.content.trim()) {
      Alert.alert('Error', 'Please fill in both title and content');
      return;
    }

    const note = {
      id: Date.now(),
      ...newNote,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setNotes(prev => [note, ...prev]);
    setNewNote({
      title: '',
      content: '',
      category: 'general',
      priority: 'medium',
      traineeId: null,
      sessionId: null,
    });
    setShowAddModal(false);
    Vibration.vibrate([50, 50, 100]);

    // Show success message
    setTimeout(() => {
      Alert.alert('Success! 📝', 'Note saved successfully');
    }, 300);
  };

  const handleDeleteNote = (noteId) => {
    Alert.alert(
      'Delete Note',
      'Are you sure you want to delete this note?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setNotes(prev => prev.filter(note => note.id !== noteId));
            Vibration.vibrate(100);
          }
        }
      ]
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    return date.toLocaleDateString();
  };

  const getCategoryIcon = (category) => {
    return categories.find(cat => cat.id === category)?.icon || 'note';
  };

  const getCategoryColor = (category) => {
    return categories.find(cat => cat.id === category)?.color || COLORS.primary;
  };

  const renderHeader = () => (
    <LinearGradient
      colors={[COLORS.primary, COLORS.secondary]}
      style={styles.header}
    >
      <View style={styles.headerContent}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>Coach Notes 📝</Text>
          <View style={styles.headerStats}>
            <Surface style={styles.statCard}>
              <Text style={styles.statNumber}>{notes.length}</Text>
              <Text style={styles.statLabel}>Total Notes</Text>
            </Surface>
          </View>
        </View>
        
        <Searchbar
          placeholder="Search notes, trainees, sessions..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          iconColor={COLORS.primary}
          inputStyle={styles.searchInput}
        />
      </View>
    </LinearGradient>
  );

  const renderCategories = () => (
    <View style={styles.categoriesContainer}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesScroll}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            onPress={() => {
              setSelectedCategory(category.id);
              Vibration.vibrate(30);
            }}
          >
            <Chip
              mode={selectedCategory === category.id ? 'flat' : 'outlined'}
              selected={selectedCategory === category.id}
              onPress={() => setSelectedCategory(category.id)}
              icon={category.icon}
              style={[
                styles.categoryChip,
                selectedCategory === category.id && {
                  backgroundColor: category.color + '20',
                  borderColor: category.color,
                }
              ]}
              textStyle={[
                styles.categoryChipText,
                selectedCategory === category.id && { color: category.color }
              ]}
            >
              {category.label}
            </Chip>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderNoteCard = (note, index) => (
    <Animated.View
      key={note.id}
      style={[
        styles.noteCardContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }
      ]}
    >
      <Card style={styles.noteCard}>
        <Card.Content style={styles.noteCardContent}>
          <View style={styles.noteHeader}>
            <View style={styles.noteHeaderLeft}>
              <Icon 
                name={getCategoryIcon(note.category)} 
                size={20} 
                color={getCategoryColor(note.category)} 
                style={styles.categoryIcon}
              />
              <View style={styles.noteTitleContainer}>
                <Text style={styles.noteTitle} numberOfLines={1}>
                  {note.title}
                </Text>
                <Text style={styles.noteDate}>
                  {formatDate(note.updatedAt)}
                </Text>
              </View>
            </View>
            
            <View style={styles.noteHeaderRight}>
              <View style={[
                styles.priorityIndicator,
                { backgroundColor: priorityColors[note.priority] }
              ]} />
              
              <Menu
                visible={showMenuIndex === index}
                onDismiss={() => setShowMenuIndex(null)}
                anchor={
                  <IconButton
                    icon="dots-vertical"
                    size={20}
                    onPress={() => setShowMenuIndex(index)}
                  />
                }
              >
                <Menu.Item
                  onPress={() => {
                    setShowMenuIndex(null);
                    // Navigate to edit note
                    Alert.alert('Edit Note', 'Edit functionality coming soon! ✏️');
                  }}
                  title="Edit"
                  leadingIcon="edit"
                />
                <Menu.Item
                  onPress={() => {
                    setShowMenuIndex(null);
                    // Share note
                    Alert.alert('Share Note', 'Share functionality coming soon! 📤');
                  }}
                  title="Share"
                  leadingIcon="share"
                />
                <Divider />
                <Menu.Item
                  onPress={() => {
                    setShowMenuIndex(null);
                    handleDeleteNote(note.id);
                  }}
                  title="Delete"
                  leadingIcon="delete"
                />
              </Menu>
            </View>
          </View>

          <Text style={styles.noteContent} numberOfLines={3}>
            {note.content}
          </Text>

          {note.traineeName && (
            <View style={styles.traineeTag}>
              <Avatar.Text 
                size={24} 
                label={note.traineeName.split(' ').map(n => n[0]).join('')}
                style={styles.traineeAvatar}
              />
              <Text style={styles.traineeName}>{note.traineeName}</Text>
            </View>
          )}
        </Card.Content>
      </Card>
    </Animated.View>
  );

  const renderAddNoteModal = () => (
    <Portal>
      <Modal
        visible={showAddModal}
        onDismiss={() => setShowAddModal(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <Surface style={styles.modalSurface}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add New Note</Text>
            <IconButton
              icon="close"
              size={24}
              onPress={() => setShowAddModal(false)}
            />
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Title *</Text>
              <TextInput
                style={styles.textInput}
                value={newNote.title}
                onChangeText={(text) => setNewNote(prev => ({ ...prev, title: text }))}
                placeholder="Enter note title..."
                placeholderTextColor={COLORS.textSecondary}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Category</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.categorySelector}
              >
                {categories.slice(1).map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    onPress={() => setNewNote(prev => ({ ...prev, category: category.id }))}
                  >
                    <Chip
                      mode={newNote.category === category.id ? 'flat' : 'outlined'}
                      selected={newNote.category === category.id}
                      icon={category.icon}
                      style={[
                        styles.modalCategoryChip,
                        newNote.category === category.id && {
                          backgroundColor: category.color + '20',
                          borderColor: category.color,
                        }
                      ]}
                    >
                      {category.label}
                    </Chip>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Priority</Text>
              <View style={styles.prioritySelector}>
                {['high', 'medium', 'low'].map((priority) => (
                  <TouchableOpacity
                    key={priority}
                    onPress={() => setNewNote(prev => ({ ...prev, priority }))}
                    style={[
                      styles.priorityOption,
                      newNote.priority === priority && styles.priorityOptionSelected
                    ]}
                  >
                    <View style={[
                      styles.priorityDot,
                      { backgroundColor: priorityColors[priority] }
                    ]} />
                    <Text style={[
                      styles.priorityText,
                      newNote.priority === priority && styles.priorityTextSelected
                    ]}>
                      {priority.charAt(0).toUpperCase() + priority.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Content *</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={newNote.content}
                onChangeText={(text) => setNewNote(prev => ({ ...prev, content: text }))}
                placeholder="Write your note here..."
                placeholderTextColor={COLORS.textSecondary}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
              />
            </View>
          </ScrollView>

          <View style={styles.modalActions}>
            <Button
              mode="outlined"
              onPress={() => setShowAddModal(false)}
              style={styles.modalButton}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleAddNote}
              style={[styles.modalButton, styles.primaryButton]}
              buttonColor={COLORS.primary}
            >
              Save Note
            </Button>
          </View>
        </Surface>
      </Modal>
    </Portal>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon name="note-add" size={80} color={COLORS.textSecondary} />
      <Text style={styles.emptyStateTitle}>No Notes Yet</Text>
      <Text style={styles.emptyStateText}>
        Start documenting your coaching insights, trainee progress, and session observations
      </Text>
      <Button
        mode="contained"
        onPress={() => setShowAddModal(true)}
        style={styles.emptyStateButton}
        buttonColor={COLORS.primary}
        icon="add"
      >
        Add Your First Note
      </Button>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />

      {renderHeader()}
      {renderCategories()}

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {filteredNotes.length === 0 ? (
          renderEmptyState()
        ) : (
          <View style={styles.notesList}>
            {filteredNotes.map((note, index) => renderNoteCard(note, index))}
            <View style={styles.bottomPadding} />
          </View>
        )}
      </ScrollView>

      <FAB
        style={styles.fab}
        icon="add"
        onPress={() => setShowAddModal(true)}
        color="white"
        customSize={56}
      />

      {renderAddNoteModal()}
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
    flex: 1,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  headerTitle: {
    ...TEXT_STYLES.heading,
    color: 'white',
    flex: 1,
  },
  headerStats: {
    flexDirection: 'row',
  },
  statCard: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
  },
  statNumber: {
    ...TEXT_STYLES.subheading,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  statLabel: {
    ...TEXT_STYLES.caption,
    fontSize: 10,
  },
  searchBar: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 25,
    elevation: 2,
  },
  searchInput: {
    ...TEXT_STYLES.body,
  },
  categoriesContainer: {
    backgroundColor: 'white',
    paddingVertical: SPACING.sm,
    elevation: 2,
  },
  categoriesScroll: {
    paddingHorizontal: SPACING.md,
  },
  categoryChip: {
    marginRight: SPACING.sm,
  },
  categoryChipText: {
    ...TEXT_STYLES.caption,
  },
  content: {
    flex: 1,
  },
  notesList: {
    padding: SPACING.md,
  },
  noteCardContainer: {
    marginBottom: SPACING.md,
  },
  noteCard: {
    elevation: 3,
    borderRadius: 12,
  },
  noteCardContent: {
    padding: SPACING.md,
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  noteHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    marginRight: SPACING.sm,
  },
  noteTitleContainer: {
    flex: 1,
  },
  noteTitle: {
    ...TEXT_STYLES.subheading,
    fontSize: 16,
    marginBottom: 2,
  },
  noteDate: {
    ...TEXT_STYLES.caption,
    fontSize: 12,
  },
  noteHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priorityIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: SPACING.xs,
  },
  noteContent: {
    ...TEXT_STYLES.body,
    lineHeight: 22,
    marginBottom: SPACING.sm,
  },
  traineeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  traineeAvatar: {
    marginRight: SPACING.xs,
    backgroundColor: COLORS.primary + '20',
  },
  traineeName: {
    ...TEXT_STYLES.caption,
    color: COLORS.primary,
    fontWeight: '500',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.xl * 2,
  },
  emptyStateTitle: {
    ...TEXT_STYLES.heading,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  emptyStateText: {
    ...TEXT_STYLES.body,
    textAlign: 'center',
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
  },
  emptyStateButton: {
    marginTop: SPACING.md,
  },
  fab: {
    position: 'absolute',
    right: SPACING.md,
    bottom: SPACING.md,
    backgroundColor: COLORS.primary,
    elevation: 6,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: SPACING.md,
  },
  modalSurface: {
    backgroundColor: 'white',
    borderRadius: 16,
    maxHeight: '90%',
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    ...TEXT_STYLES.subheading,
  },
  modalContent: {
    maxHeight: 500,
  },
  inputContainer: {
    padding: SPACING.md,
  },
  inputLabel: {
    ...TEXT_STYLES.body,
    fontWeight: '500',
    marginBottom: SPACING.xs,
  },
  textInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: SPACING.sm,
    ...TEXT_STYLES.body,
    backgroundColor: 'white',
  },
  textArea: {
    height: 120,
  },
  categorySelector: {
    flexDirection: 'row',
  },
  modalCategoryChip: {
    marginRight: SPACING.sm,
  },
  prioritySelector: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  priorityOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  priorityOptionSelected: {
    backgroundColor: COLORS.primary + '10',
    borderColor: COLORS.primary,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: SPACING.xs,
  },
  priorityText: {
    ...TEXT_STYLES.caption,
  },
  priorityTextSelected: {
    color: COLORS.primary,
    fontWeight: '500',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  modalButton: {
    flex: 1,
    marginHorizontal: SPACING.xs,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
  },
  bottomPadding: {
    height: 80,
  },
});

export default CoachNotes;