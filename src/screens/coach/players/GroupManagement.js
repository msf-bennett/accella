import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  Dimensions,
  RefreshControl,
  Alert,
  StatusBar,
  TouchableOpacity,
  FlatList,
  Modal,
  TextInput,
} from 'react-native';
import { 
  Card,
  Button,
  Chip,
  Avatar,
  IconButton,
  Surface,
  Searchbar,
  FAB,
  Portal,
  Dialog,
  RadioButton,
  Checkbox,
} from 'react-native-paper';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/LinearGradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';
import { COLORS } from '../../../styles/colors';
import { SPACING } from '../../../styles/spacing';
import { TEXT_STYLES } from '../../../styles/textStyles';
import { TYPOGRAPHY } from '../../../styles/typography';
import { LAYOUT } from '../../../styles/layout';

const { width } = Dimensions.get('window');

const GroupManagement = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { players } = useSelector(state => state.coach);
  
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [groups, setGroups] = useState([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showPlayerSelector, setShowPlayerSelector] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [newGroupData, setNewGroupData] = useState({
    name: '',
    description: '',
    category: 'team',
    color: '#667eea',
    maxPlayers: 20,
    selectedPlayers: [],
  });

  // Mock data - replace with actual API calls
  const mockGroups = [
    {
      id: '1',
      name: 'Varsity Football',
      description: 'Senior level competitive team',
      category: 'team',
      color: '#667eea',
      playerCount: 25,
      maxPlayers: 30,
      coachId: user?.id,
      players: ['p1', 'p2', 'p3'],
      createdAt: '2024-01-15',
      lastActivity: '2 hours ago',
      upcomingSessions: 3,
      completionRate: 92,
    },
    {
      id: '2',
      name: 'Speed Training',
      description: 'Specialized speed and agility training',
      category: 'training',
      color: '#ff6b6b',
      playerCount: 12,
      maxPlayers: 15,
      coachId: user?.id,
      players: ['p1', 'p4', 'p5'],
      createdAt: '2024-02-01',
      lastActivity: '1 day ago',
      upcomingSessions: 2,
      completionRate: 88,
    },
    {
      id: '3',
      name: 'JV Team',
      description: 'Junior varsity development team',
      category: 'team',
      color: '#4ecdc4',
      playerCount: 18,
      maxPlayers: 25,
      coachId: user?.id,
      players: ['p6', 'p7', 'p8'],
      createdAt: '2024-01-20',
      lastActivity: '3 hours ago',
      upcomingSessions: 4,
      completionRate: 95,
    },
    {
      id: '4',
      name: 'Strength & Conditioning',
      description: 'Weight training and conditioning',
      category: 'fitness',
      color: '#feca57',
      playerCount: 30,
      maxPlayers: 35,
      coachId: user?.id,
      players: ['p1', 'p2', 'p9'],
      createdAt: '2024-01-10',
      lastActivity: '5 hours ago',
      upcomingSessions: 5,
      completionRate: 85,
    },
  ];

  const mockPlayers = [
    { id: 'p1', name: 'John Smith', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face', position: 'QB' },
    { id: 'p2', name: 'Emily Johnson', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b332c76a?w=150&h=150&fit=crop&crop=face', position: 'RB' },
    { id: 'p3', name: 'Mike Davis', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face', position: 'WR' },
    { id: 'p4', name: 'Sarah Wilson', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face', position: 'LB' },
    { id: 'p5', name: 'Alex Brown', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face', position: 'DB' },
  ];

  const categories = [
    { label: 'All Groups', value: 'all', icon: 'group' },
    { label: 'Teams', value: 'team', icon: 'sports' },
    { label: 'Training', value: 'training', icon: 'fitness-center' },
    { label: 'Fitness', value: 'fitness', icon: 'directions-run' },
  ];

  const groupColors = [
    '#667eea', '#ff6b6b', '#4ecdc4', '#feca57', 
    '#ff9ff3', '#54a0ff', '#5f27cd', '#00d2d3'
  ];

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = useCallback(() => {
    setGroups(mockGroups);
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadGroups();
    setTimeout(() => setRefreshing(false), 1000);
  }, [loadGroups]);

  const filteredGroups = groups.filter(group => {
    const matchesSearch = group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         group.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || group.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCreateGroup = () => {
    if (!newGroupData.name.trim()) {
      Alert.alert('Error', 'Please enter a group name');
      return;
    }

    const newGroup = {
      id: Date.now().toString(),
      ...newGroupData,
      playerCount: newGroupData.selectedPlayers.length,
      coachId: user?.id,
      createdAt: new Date().toISOString().split('T')[0],
      lastActivity: 'Just created',
      upcomingSessions: 0,
      completionRate: 0,
      players: newGroupData.selectedPlayers,
    };

    setGroups([...groups, newGroup]);
    resetCreateDialog();
    Alert.alert('Success', `Group "${newGroup.name}" created successfully! 🎉`);
  };

  const handleEditGroup = () => {
    const updatedGroups = groups.map(group =>
      group.id === selectedGroup.id
        ? {
            ...group,
            ...newGroupData,
            playerCount: newGroupData.selectedPlayers.length,
            players: newGroupData.selectedPlayers,
          }
        : group
    );

    setGroups(updatedGroups);
    resetEditDialog();
    Alert.alert('Success', 'Group updated successfully! ✅');
  };

  const handleDeleteGroup = (groupId) => {
    Alert.alert(
      'Delete Group',
      'Are you sure you want to delete this group? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setGroups(groups.filter(group => group.id !== groupId));
            Alert.alert('Success', 'Group deleted successfully');
          },
        },
      ]
    );
  };

  const resetCreateDialog = () => {
    setShowCreateDialog(false);
    setNewGroupData({
      name: '',
      description: '',
      category: 'team',
      color: '#667eea',
      maxPlayers: 20,
      selectedPlayers: [],
    });
  };

  const resetEditDialog = () => {
    setShowEditDialog(false);
    setSelectedGroup(null);
    setNewGroupData({
      name: '',
      description: '',
      category: 'team',
      color: '#667eea',
      maxPlayers: 20,
      selectedPlayers: [],
    });
  };

  const openEditDialog = (group) => {
    setSelectedGroup(group);
    setNewGroupData({
      name: group.name,
      description: group.description,
      category: group.category,
      color: group.color,
      maxPlayers: group.maxPlayers,
      selectedPlayers: group.players,
    });
    setShowEditDialog(true);
  };

  const togglePlayerSelection = (playerId) => {
    const isSelected = newGroupData.selectedPlayers.includes(playerId);
    const updatedPlayers = isSelected
      ? newGroupData.selectedPlayers.filter(id => id !== playerId)
      : [...newGroupData.selectedPlayers, playerId];
    
    setNewGroupData({ ...newGroupData, selectedPlayers: updatedPlayers });
  };

  const renderSummaryStats = () => (
    <Card style={styles.summaryCard}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.summaryGradient}
      >
        <Text style={styles.summaryTitle}>📊 Groups Overview</Text>
        <View style={styles.summaryGrid}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryNumber}>{groups.length}</Text>
            <Text style={styles.summaryLabel}>Total Groups</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryNumber}>
              {groups.reduce((sum, g) => sum + g.playerCount, 0)}
            </Text>
            <Text style={styles.summaryLabel}>Total Players</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryNumber}>
              {Math.round(groups.reduce((sum, g) => sum + g.completionRate, 0) / groups.length)}%
            </Text>
            <Text style={styles.summaryLabel}>Avg Completion</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryNumber}>
              {groups.reduce((sum, g) => sum + g.upcomingSessions, 0)}
            </Text>
            <Text style={styles.summaryLabel}>Sessions Planned</Text>
          </View>
        </View>
      </LinearGradient>
    </Card>
  );

  const renderCategoryFilters = () => (
    <View style={styles.filtersContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {categories.map((category) => (
          <TouchableOpacity
            key={category.value}
            onPress={() => setSelectedCategory(category.value)}
            style={[
              styles.categoryChip,
              selectedCategory === category.value && styles.selectedCategoryChip
            ]}
          >
            <Icon 
              name={category.icon} 
              size={20} 
              color={selectedCategory === category.value ? 'white' : COLORS.primary} 
            />
            <Text style={[
              styles.categoryText,
              selectedCategory === category.value && styles.selectedCategoryText
            ]}>
              {category.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderGroupCard = ({ item }) => (
    <Card style={styles.groupCard}>
      <View style={styles.groupHeader}>
        <View style={[styles.groupColorIndicator, { backgroundColor: item.color }]} />
        <View style={styles.groupInfo}>
          <Text style={styles.groupName}>{item.name}</Text>
          <Text style={styles.groupDescription}>{item.description}</Text>
          <View style={styles.groupMeta}>
            <Icon name="group" size={16} color={COLORS.secondary} />
            <Text style={styles.metaText}>
              {item.playerCount}/{item.maxPlayers} players
            </Text>
            <Icon name="schedule" size={16} color={COLORS.secondary} style={{ marginLeft: SPACING.md }} />
            <Text style={styles.metaText}>{item.lastActivity}</Text>
          </View>
        </View>
        <IconButton
          icon="dots-vertical"
          onPress={() => {
            Alert.alert(
              'Group Actions',
              `Choose an action for ${item.name}`,
              [
                { text: 'Edit', onPress: () => openEditDialog(item) },
                { text: 'Duplicate', onPress: () => Alert.alert('Feature Coming Soon', 'Group duplication will be available in the next update! 📋') },
                { text: 'Delete', style: 'destructive', onPress: () => handleDeleteGroup(item.id) },
                { text: 'Cancel', style: 'cancel' },
              ]
            );
          }}
        />
      </View>

      <View style={styles.groupStats}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{item.upcomingSessions}</Text>
          <Text style={styles.statLabel}>Upcoming</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{item.completionRate}%</Text>
          <Text style={styles.statLabel}>Completion</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{item.category}</Text>
          <Text style={styles.statLabel}>Category</Text>
        </View>
      </View>

      <View style={styles.groupActions}>
        <Button
          mode="outlined"
          onPress={() => navigation.navigate('PlayerManagement', { groupId: item.id })}
          style={styles.actionButton}
          icon="group"
        >
          Manage Players
        </Button>
        <Button
          mode="contained"
          onPress={() => navigation.navigate('GroupDetails', { groupId: item.id })}
          style={styles.actionButton}
          buttonColor={item.color}
        >
          View Details
        </Button>
      </View>
    </Card>
  );

  const renderCreateDialog = () => (
    <Portal>
      <Dialog visible={showCreateDialog} onDismiss={resetCreateDialog}>
        <Dialog.Title>🏆 Create New Group</Dialog.Title>
        <Dialog.Content>
          <ScrollView showsVerticalScrollIndicator={false}>
            <TextInput
              placeholder="Group Name"
              value={newGroupData.name}
              onChangeText={(text) => setNewGroupData({ ...newGroupData, name: text })}
              style={styles.input}
            />
            
            <TextInput
              placeholder="Description"
              value={newGroupData.description}
              onChangeText={(text) => setNewGroupData({ ...newGroupData, description: text })}
              style={styles.input}
              multiline
              numberOfLines={3}
            />

            <Text style={styles.dialogLabel}>Category</Text>
            <RadioButton.Group
              onValueChange={value => setNewGroupData({ ...newGroupData, category: value })}
              value={newGroupData.category}
            >
              {categories.slice(1).map(cat => (
                <RadioButton.Item key={cat.value} label={cat.label} value={cat.value} />
              ))}
            </RadioButton.Group>

            <Text style={styles.dialogLabel}>Group Color</Text>
            <View style={styles.colorPicker}>
              {groupColors.map(color => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorOption,
                    { backgroundColor: color },
                    newGroupData.color === color && styles.selectedColor
                  ]}
                  onPress={() => setNewGroupData({ ...newGroupData, color })}
                />
              ))}
            </View>

            <TextInput
              placeholder="Max Players"
              value={newGroupData.maxPlayers.toString()}
              onChangeText={(text) => setNewGroupData({ ...newGroupData, maxPlayers: parseInt(text) || 20 })}
              style={styles.input}
              keyboardType="numeric"
            />

            <Button
              mode="outlined"
              onPress={() => setShowPlayerSelector(true)}
              style={styles.playerSelectorButton}
              icon="group-add"
            >
              Select Players ({newGroupData.selectedPlayers.length})
            </Button>
          </ScrollView>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={resetCreateDialog}>Cancel</Button>
          <Button mode="contained" onPress={handleCreateGroup}>Create</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );

  const renderEditDialog = () => (
    <Portal>
      <Dialog visible={showEditDialog} onDismiss={resetEditDialog}>
        <Dialog.Title>✏️ Edit Group</Dialog.Title>
        <Dialog.Content>
          <ScrollView showsVerticalScrollIndicator={false}>
            <TextInput
              placeholder="Group Name"
              value={newGroupData.name}
              onChangeText={(text) => setNewGroupData({ ...newGroupData, name: text })}
              style={styles.input}
            />
            
            <TextInput
              placeholder="Description"
              value={newGroupData.description}
              onChangeText={(text) => setNewGroupData({ ...newGroupData, description: text })}
              style={styles.input}
              multiline
              numberOfLines={3}
            />

            <Text style={styles.dialogLabel}>Category</Text>
            <RadioButton.Group
              onValueChange={value => setNewGroupData({ ...newGroupData, category: value })}
              value={newGroupData.category}
            >
              {categories.slice(1).map(cat => (
                <RadioButton.Item key={cat.value} label={cat.label} value={cat.value} />
              ))}
            </RadioButton.Group>

            <Text style={styles.dialogLabel}>Group Color</Text>
            <View style={styles.colorPicker}>
              {groupColors.map(color => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorOption,
                    { backgroundColor: color },
                    newGroupData.color === color && styles.selectedColor
                  ]}
                  onPress={() => setNewGroupData({ ...newGroupData, color })}
                />
              ))}
            </View>

            <TextInput
              placeholder="Max Players"
              value={newGroupData.maxPlayers.toString()}
              onChangeText={(text) => setNewGroupData({ ...newGroupData, maxPlayers: parseInt(text) || 20 })}
              style={styles.input}
              keyboardType="numeric"
            />

            <Button
              mode="outlined"
              onPress={() => setShowPlayerSelector(true)}
              style={styles.playerSelectorButton}
              icon="group-add"
            >
              Update Players ({newGroupData.selectedPlayers.length})
            </Button>
          </ScrollView>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={resetEditDialog}>Cancel</Button>
          <Button mode="contained" onPress={handleEditGroup}>Update</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );

  const renderPlayerSelector = () => (
    <Modal
      visible={showPlayerSelector}
      animationType="slide"
      onRequestClose={() => setShowPlayerSelector(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>👥 Select Players</Text>
          <IconButton
            icon="close"
            onPress={() => setShowPlayerSelector(false)}
          />
        </View>
        <FlatList
          data={mockPlayers}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.playerItem}
              onPress={() => togglePlayerSelection(item.id)}
            >
              <Avatar.Image size={40} source={{ uri: item.avatar }} />
              <View style={styles.playerDetails}>
                <Text style={styles.playerName}>{item.name}</Text>
                <Text style={styles.playerPosition}>{item.position}</Text>
              </View>
              <Checkbox
                status={newGroupData.selectedPlayers.includes(item.id) ? 'checked' : 'unchecked'}
                onPress={() => togglePlayerSelection(item.id)}
              />
            </TouchableOpacity>
          )}
        />
        <Button
          mode="contained"
          onPress={() => setShowPlayerSelector(false)}
          style={styles.confirmButton}
        >
          Confirm Selection ({newGroupData.selectedPlayers.length})
        </Button>
      </View>
    </Modal>
  );

  const renderEmptyState = () => (
    <Surface style={styles.emptyState}>
      <Icon name="group-add" size={80} color={COLORS.secondary} />
      <Text style={styles.emptyTitle}>No Groups Found</Text>
      <Text style={styles.emptySubtitle}>
        Create your first group to start organizing your players
      </Text>
      <Button
        mode="contained"
        onPress={() => setShowCreateDialog(true)}
        style={styles.emptyButton}
        icon="add"
      >
        Create Group
      </Button>
    </Surface>
  );

  return (
    <View style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />
      
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <IconButton
            icon="arrow-back"
            iconColor="white"
            onPress={() => navigation.goBack()}
          />
          <Text style={styles.headerTitle}>Group Management</Text>
          <IconButton
            icon="filter-list"
            iconColor="white"
            onPress={() => Alert.alert('Feature Coming Soon', 'Advanced filtering options will be available in the next update! 🔍')}
          />
        </View>
      </LinearGradient>

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
      >
        {renderSummaryStats()}
        {renderCategoryFilters()}

        <Searchbar
          placeholder="Search groups..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          iconColor={COLORS.primary}
        />

        <View style={styles.groupsSection}>
          <Text style={styles.sectionTitle}>
            🏆 Your Groups ({filteredGroups.length})
          </Text>
          
          {filteredGroups.length > 0 ? (
            <FlatList
              data={filteredGroups}
              keyExtractor={(item) => item.id}
              renderItem={renderGroupCard}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            renderEmptyState()
          )}
        </View>
      </ScrollView>

      <FAB
        icon="add"
        style={styles.fab}
        onPress={() => setShowCreateDialog(true)}
        color="white"
      />

      {renderCreateDialog()}
      {renderEditDialog()}
      {renderPlayerSelector()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.md,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.sm,
  },
  headerTitle: {
    ...TEXT_STYLES.heading,
    color: 'white',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: SPACING.md,
  },
  content: {
    flex: 1,
    padding: SPACING.md,
  },
  summaryCard: {
    marginBottom: SPACING.lg,
    elevation: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  summaryGradient: {
    padding: SPACING.lg,
  },
  summaryTitle: {
    ...TEXT_STYLES.heading,
    color: 'white',
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  summaryNumber: {
    ...TEXT_STYLES.heading,
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
  },
  summaryLabel: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  filtersContainer: {
    marginBottom: SPACING.lg,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginRight: SPACING.sm,
    backgroundColor: 'white',
    borderRadius: 20,
    elevation: 2,
  },
  selectedCategoryChip: {
    backgroundColor: COLORS.primary,
  },
  categoryText: {
    ...TEXT_STYLES.body,
    marginLeft: SPACING.xs,
    color: COLORS.primary,
  },
  selectedCategoryText: {
    color: 'white',
  },
  searchBar: {
    backgroundColor: 'white',
    elevation: 2,
    marginBottom: SPACING.lg,
  },
  groupsSection: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    ...TEXT_STYLES.subheading,
    marginBottom: SPACING.md,
  },
  groupCard: {
    marginBottom: SPACING.md,
    elevation: 2,
    borderRadius: 12,
    overflow: 'hidden',
  },
  groupHeader: {
    flexDirection: 'row',
    padding: SPACING.md,
    alignItems: 'flex-start',
  },
  groupColorIndicator: {
    width: 4,
    height: 60,
    borderRadius: 2,
    marginRight: SPACING.md,
  },
  groupInfo: {
    flex: 1,
  },
  groupName: {
    ...TEXT_STYLES.subheading,
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  groupDescription: {
    ...TEXT_STYLES.body,
    color: COLORS.secondary,
    marginBottom: SPACING.sm,
  },
  groupMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    ...TEXT_STYLES.caption,
    color: COLORS.secondary,
    marginLeft: SPACING.xs,
  },
  groupStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    ...TEXT_STYLES.subheading,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  statLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.secondary,
    marginTop: SPACING.xs,
  },
  groupActions: {
    flexDirection: 'row',
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  actionButton: {
    flex: 1,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.md,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.secondary,
    borderRadius: 8,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginBottom: SPACING.md,
    fontSize: 16,
  },
  dialogLabel: {
    ...TEXT_STYLES.subheading,
    marginBottom: SPACING.sm,
    marginTop: SPACING.sm,
  },
  colorPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: SPACING.md,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    margin: SPACING.xs,
  },
  selectedColor: {
    borderWidth: 3,
    borderColor: COLORS.primary,
  },
  playerSelectorButton: {
    marginTop: SPACING.sm,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  modalTitle: {
    ...TEXT_STYLES.heading,
    flex: 1,
  },
  playerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  playerDetails: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  playerName: {
    ...TEXT_STYLES.subheading,
    fontWeight: 'bold',
  },
  playerPosition: {
    ...TEXT_STYLES.caption,
    color: COLORS.secondary,
  },
  confirmButton: {
    margin: SPACING.md,
    backgroundColor: COLORS.primary,
  },
  emptyState: {
    alignItems: 'center',
    padding: SPACING.xl,
    borderRadius: 12,
    backgroundColor: 'white',
    elevation: 1,
    marginTop: SPACING.lg,
  },
  emptyTitle: {
    ...TEXT_STYLES.heading,
    marginTop: SPACING.md,
    color: COLORS.secondary,
  },
  emptySubtitle: {
    ...TEXT_STYLES.body,
    textAlign: 'center',
    color: COLORS.secondary,
    marginTop: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  emptyButton: {
    backgroundColor: COLORS.primary,
  },
});

export default GroupManagement;