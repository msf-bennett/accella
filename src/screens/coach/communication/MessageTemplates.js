import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  StatusBar,
  RefreshControl,
  Alert,
  TouchableOpacity,
  TextInput,
  Modal,
  Vibration,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
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
} from 'react-native-paper';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/LinearGradient';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Design system imports
import { COLORS } from '../../../styles/colors';
import { SPACING } from '../../../styles/spacing';
import { TEXT_STYLES } from '../../../styles/textStyles';
import { TYPOGRAPHY } from '../../../styles/typography';
import { LAYOUT } from '../../../styles/layout';

const MessageTemplates = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { messageTemplates, loading } = useSelector(state => state.communication);

  // State management
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [newTemplate, setNewTemplate] = useState({
    title: '',
    content: '',
    category: 'general',
    tags: [],
  });

  // Template categories
  const categories = [
    { id: 'all', label: 'All', icon: 'list', count: messageTemplates?.length || 0 },
    { id: 'training', label: 'Training', icon: 'fitness-center', count: 12 },
    { id: 'motivation', label: 'Motivation', icon: 'psychology', count: 8 },
    { id: 'feedback', label: 'Feedback', icon: 'feedback', count: 15 },
    { id: 'parent', label: 'Parent Updates', icon: 'family-restroom', count: 6 },
    { id: 'team', label: 'Team Announcements', icon: 'groups', count: 10 },
    { id: 'individual', label: 'Individual', icon: 'person', count: 9 },
  ];

  // Sample templates data
  const sampleTemplates = [
    {
      id: 1,
      title: 'Great Training Session Today! 💪',
      content: 'Excellent work in today\'s training session! Your dedication and effort are really showing. Keep up the fantastic progress - you\'re getting stronger every day! 🌟',
      category: 'motivation',
      tags: ['positive', 'training', 'progress'],
      usageCount: 24,
      lastUsed: '2 days ago',
      isFavorite: true,
    },
    {
      id: 2,
      title: 'Training Schedule Update ⏰',
      content: 'Hi! Quick update on this week\'s training schedule:\n\n📅 Monday: 4:00 PM - 6:00 PM\n📅 Wednesday: 4:00 PM - 6:00 PM\n📅 Friday: 4:00 PM - 6:00 PM\n\nPlease confirm your attendance. See you on the field!',
      category: 'team',
      tags: ['schedule', 'announcement', 'attendance'],
      usageCount: 18,
      lastUsed: '1 week ago',
      isFavorite: false,
    },
    {
      id: 3,
      title: 'Performance Feedback 📈',
      content: 'Your performance in the last session showed significant improvement in:\n\n✅ Ball control\n✅ Passing accuracy\n✅ Team communication\n\nAreas to focus on next:\n🎯 Finishing\n🎯 Defensive positioning\n\nKeep up the hard work!',
      category: 'feedback',
      tags: ['performance', 'improvement', 'individual'],
      usageCount: 31,
      lastUsed: '5 days ago',
      isFavorite: true,
    },
    {
      id: 4,
      title: 'Parent Progress Update 👨‍👩‍👧‍👦',
      content: 'Dear Parents,\n\nYour child has been making excellent progress this month! Here\'s a quick summary:\n\n📊 Attendance: 95%\n📊 Skill Development: Above Average\n📊 Team Spirit: Excellent\n\nThank you for your continued support!',
      category: 'parent',
      tags: ['progress', 'parents', 'monthly'],
      usageCount: 12,
      lastUsed: '3 days ago',
      isFavorite: false,
    },
  ];

  // Effects
  useEffect(() => {
    loadTemplates();
  }, []);

  // Handlers
  const loadTemplates = useCallback(async () => {
    try {
      // Simulate API call
      // dispatch(loadMessageTemplates());
    } catch (error) {
      Alert.alert('Error', 'Failed to load message templates');
    }
  }, [dispatch]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadTemplates();
    setRefreshing(false);
  }, [loadTemplates]);

  const handleCreateTemplate = () => {
    setEditingTemplate(null);
    setNewTemplate({
      title: '',
      content: '',
      category: 'general',
      tags: [],
    });
    setShowCreateModal(true);
    Vibration.vibrate(50);
  };

  const handleEditTemplate = (template) => {
    setEditingTemplate(template);
    setNewTemplate({
      title: template.title,
      content: template.content,
      category: template.category,
      tags: template.tags,
    });
    setShowCreateModal(true);
    Vibration.vibrate(50);
  };

  const handleSaveTemplate = () => {
    if (!newTemplate.title.trim() || !newTemplate.content.trim()) {
      Alert.alert('Error', 'Please fill in both title and content');
      return;
    }

    try {
      if (editingTemplate) {
        // dispatch(updateMessageTemplate(editingTemplate.id, newTemplate));
        Alert.alert('Success', 'Template updated successfully! ✅');
      } else {
        // dispatch(createMessageTemplate(newTemplate));
        Alert.alert('Success', 'Template created successfully! ✅');
      }
      setShowCreateModal(false);
      Vibration.vibrate([50, 50, 50]);
    } catch (error) {
      Alert.alert('Error', 'Failed to save template');
    }
  };

  const handleUseTemplate = (template) => {
    Vibration.vibrate(50);
    Alert.alert(
      'Use Template',
      'Where would you like to send this message?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Individual Player', 
          onPress: () => navigation.navigate('SendMessage', { template }) 
        },
        { 
          text: 'Team Group', 
          onPress: () => navigation.navigate('TeamChat', { template }) 
        },
        { 
          text: 'Parent Update', 
          onPress: () => navigation.navigate('ParentCommunication', { template }) 
        },
      ]
    );
  };

  const handleDeleteTemplate = (templateId) => {
    Alert.alert(
      'Delete Template',
      'Are you sure you want to delete this template?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // dispatch(deleteMessageTemplate(templateId));
            Alert.alert('Success', 'Template deleted successfully');
            Vibration.vibrate(100);
          },
        },
      ]
    );
  };

  const toggleFavorite = (templateId) => {
    // dispatch(toggleTemplateFavorite(templateId));
    Vibration.vibrate(50);
  };

  // Filter templates based on search and category
  const filteredTemplates = sampleTemplates.filter(template => {
    const matchesSearch = template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Render functions
  const renderHeader = () => (
    <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
      <View style={styles.headerContent}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>Message Templates</Text>
            <Text style={styles.headerSubtitle}>
              {filteredTemplates.length} templates available
            </Text>
          </View>
          <Avatar.Text 
            size={50} 
            label="MT" 
            style={styles.avatar}
            labelStyle={{ fontSize: 18, fontWeight: 'bold' }}
          />
        </View>
        
        <Searchbar
          placeholder="Search templates..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
          inputStyle={styles.searchInput}
          iconColor={COLORS.primary}
        />
      </View>
    </LinearGradient>
  );

  const renderCategoryChips = () => (
    <View style={styles.categoryContainer}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryScroll}
      >
        {categories.map((category) => (
          <Chip
            key={category.id}
            selected={selectedCategory === category.id}
            onPress={() => setSelectedCategory(category.id)}
            style={[
              styles.categoryChip,
              selectedCategory === category.id && styles.selectedCategoryChip,
            ]}
            textStyle={[
              styles.categoryChipText,
              selectedCategory === category.id && styles.selectedCategoryChipText,
            ]}
            icon={category.icon}
            compact={false}
          >
            {category.label} ({category.count})
          </Chip>
        ))}
      </ScrollView>
    </View>
  );

  const renderTemplateCard = (template) => (
    <Card key={template.id} style={styles.templateCard}>
      <Card.Content style={styles.cardContent}>
        <View style={styles.templateHeader}>
          <View style={styles.templateTitle}>
            <Text style={styles.templateTitleText}>{template.title}</Text>
            <View style={styles.templateMeta}>
              <Chip 
                compact 
                style={styles.categoryTag}
                textStyle={styles.categoryTagText}
                icon={categories.find(c => c.id === template.category)?.icon}
              >
                {categories.find(c => c.id === template.category)?.label}
              </Chip>
              <Text style={styles.usageCount}>Used {template.usageCount} times</Text>
            </View>
          </View>
          <IconButton
            icon={template.isFavorite ? 'favorite' : 'favorite-border'}
            iconColor={template.isFavorite ? COLORS.error : COLORS.textSecondary}
            onPress={() => toggleFavorite(template.id)}
            style={styles.favoriteButton}
          />
        </View>
        
        <Text style={styles.templateContent} numberOfLines={3}>
          {template.content}
        </Text>
        
        <View style={styles.templateTags}>
          {template.tags.map((tag, index) => (
            <Chip 
              key={index} 
              compact 
              style={styles.tag}
              textStyle={styles.tagText}
            >
              #{tag}
            </Chip>
          ))}
        </View>
        
        <View style={styles.templateFooter}>
          <Text style={styles.lastUsed}>Last used: {template.lastUsed}</Text>
          <View style={styles.templateActions}>
            <Button
              mode="outlined"
              compact
              onPress={() => handleEditTemplate(template)}
              style={styles.actionButton}
              labelStyle={styles.actionButtonLabel}
              icon="edit"
            >
              Edit
            </Button>
            <Button
              mode="contained"
              compact
              onPress={() => handleUseTemplate(template)}
              style={styles.useButton}
              labelStyle={styles.useButtonLabel}
              icon="send"
            >
              Use
            </Button>
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  const renderCreateModal = () => (
    <Modal
      visible={showCreateModal}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.modalContainer}>
        <LinearGradient colors={['#667eea', '#764ba2']} style={styles.modalHeader}>
          <View style={styles.modalHeaderContent}>
            <IconButton
              icon="close"
              iconColor="white"
              onPress={() => setShowCreateModal(false)}
            />
            <Text style={styles.modalTitle}>
              {editingTemplate ? 'Edit Template' : 'Create Template'}
            </Text>
            <Button
              mode="text"
              onPress={handleSaveTemplate}
              labelStyle={styles.saveButtonLabel}
              disabled={!newTemplate.title.trim() || !newTemplate.content.trim()}
            >
              Save
            </Button>
          </View>
        </LinearGradient>
        
        <ScrollView style={styles.modalContent}>
          <Surface style={styles.formSection}>
            <Text style={styles.formLabel}>Template Title *</Text>
            <TextInput
              style={styles.textInput}
              value={newTemplate.title}
              onChangeText={(text) => setNewTemplate(prev => ({ ...prev, title: text }))}
              placeholder="Enter template title..."
              maxLength={100}
            />
          </Surface>
          
          <Surface style={styles.formSection}>
            <Text style={styles.formLabel}>Message Content *</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={newTemplate.content}
              onChangeText={(text) => setNewTemplate(prev => ({ ...prev, content: text }))}
              placeholder="Enter your message template..."
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              maxLength={1000}
            />
          </Surface>
          
          <Surface style={styles.formSection}>
            <Text style={styles.formLabel}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.categorySelection}>
                {categories.filter(cat => cat.id !== 'all').map((category) => (
                  <Chip
                    key={category.id}
                    selected={newTemplate.category === category.id}
                    onPress={() => setNewTemplate(prev => ({ ...prev, category: category.id }))}
                    style={[
                      styles.selectionChip,
                      newTemplate.category === category.id && styles.selectedSelectionChip,
                    ]}
                    textStyle={[
                      styles.selectionChipText,
                      newTemplate.category === category.id && styles.selectedSelectionChipText,
                    ]}
                    icon={category.icon}
                  >
                    {category.label}
                  </Chip>
                ))}
              </View>
            </ScrollView>
          </Surface>
          
          <View style={styles.modalFooter} />
        </ScrollView>
      </View>
    </Modal>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon name="message" size={80} color={COLORS.textSecondary} />
      <Text style={styles.emptyStateTitle}>No Templates Found</Text>
      <Text style={styles.emptyStateText}>
        {searchQuery ? 'Try adjusting your search terms' : 'Create your first message template to get started'}
      </Text>
      {!searchQuery && (
        <Button
          mode="contained"
          onPress={handleCreateTemplate}
          style={styles.createFirstButton}
          icon="add"
        >
          Create First Template
        </Button>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      {renderHeader()}
      {renderCategoryChips()}
      
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
        {filteredTemplates.length > 0 ? (
          <View style={styles.templatesList}>
            {filteredTemplates.map(renderTemplateCard)}
            <View style={styles.bottomPadding} />
          </View>
        ) : (
          renderEmptyState()
        )}
      </ScrollView>
      
      <FAB
        icon="add"
        style={styles.fab}
        color="white"
        onPress={handleCreateTemplate}
      />
      
      <Portal>
        {renderCreateModal()}
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
    paddingTop: StatusBar.currentHeight + SPACING.lg,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  headerContent: {
    gap: SPACING.md,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerTitle: {
    ...TEXT_STYLES.h2,
    color: 'white',
    fontWeight: 'bold',
  },
  headerSubtitle: {
    ...TEXT_STYLES.body,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: SPACING.xs,
  },
  avatar: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  searchbar: {
    backgroundColor: 'white',
    elevation: 2,
    borderRadius: 12,
  },
  searchInput: {
    ...TEXT_STYLES.body,
  },
  categoryContainer: {
    backgroundColor: 'white',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  categoryScroll: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
  },
  categoryChip: {
    backgroundColor: COLORS.surface,
    marginRight: SPACING.sm,
  },
  selectedCategoryChip: {
    backgroundColor: COLORS.primary,
  },
  categoryChipText: {
    color: COLORS.textPrimary,
    fontSize: 12,
  },
  selectedCategoryChipText: {
    color: 'white',
  },
  content: {
    flex: 1,
  },
  templatesList: {
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  templateCard: {
    backgroundColor: 'white',
    marginBottom: SPACING.md,
    elevation: 2,
    borderRadius: 12,
  },
  cardContent: {
    padding: SPACING.lg,
  },
  templateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  templateTitle: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  templateTitleText: {
    ...TEXT_STYLES.h4,
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  templateMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  categoryTag: {
    backgroundColor: COLORS.primaryLight,
    height: 24,
  },
  categoryTagText: {
    fontSize: 10,
    color: COLORS.primary,
  },
  usageCount: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
  },
  favoriteButton: {
    margin: 0,
  },
  templateContent: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: SPACING.md,
  },
  templateTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    marginBottom: SPACING.md,
  },
  tag: {
    backgroundColor: COLORS.surface,
    height: 24,
  },
  tagText: {
    fontSize: 10,
    color: COLORS.textSecondary,
  },
  templateFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastUsed: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
  },
  templateActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  actionButton: {
    borderColor: COLORS.border,
    borderRadius: 20,
  },
  actionButtonLabel: {
    fontSize: 12,
    color: COLORS.textPrimary,
  },
  useButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 20,
  },
  useButtonLabel: {
    fontSize: 12,
    color: 'white',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
    marginTop: 100,
  },
  emptyStateTitle: {
    ...TEXT_STYLES.h3,
    fontWeight: 'bold',
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  emptyStateText: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  createFirstButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 25,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.lg,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  modalHeader: {
    paddingTop: StatusBar.currentHeight + SPACING.sm,
    paddingBottom: SPACING.sm,
  },
  modalHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.sm,
  },
  modalTitle: {
    ...TEXT_STYLES.h3,
    color: 'white',
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: SPACING.sm,
  },
  saveButtonLabel: {
    color: 'white',
    fontWeight: 'bold',
  },
  modalContent: {
    flex: 1,
    padding: SPACING.lg,
  },
  formSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    elevation: 1,
  },
  formLabel: {
    ...TEXT_STYLES.body,
    fontWeight: 'bold',
    marginBottom: SPACING.sm,
    color: COLORS.textPrimary,
  },
  textInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: SPACING.md,
    fontSize: 16,
    backgroundColor: 'white',
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  categorySelection: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  selectionChip: {
    backgroundColor: COLORS.surface,
  },
  selectedSelectionChip: {
    backgroundColor: COLORS.primary,
  },
  selectionChipText: {
    color: COLORS.textPrimary,
  },
  selectedSelectionChipText: {
    color: 'white',
  },
  modalFooter: {
    height: 100,
  },
  bottomPadding: {
    height: 100,
  },
});

export default MessageTemplates;