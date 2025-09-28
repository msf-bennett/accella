import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  RefreshControl,
  Alert,
  Modal,
  TouchableOpacity,
  Animated,
  Dimensions,
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
  ProgressBar,
  Portal,
  TextInput,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import { BlurView } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Import design constants
import { COLORS, SPACING, TEXT_STYLES } from '../../../constants/theme';

const { width } = Dimensions.get('window');

const PersonalRecords = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { user, clients } = useSelector(state => state.auth);
  const { records, isLoading } = useSelector(state => state.records);
  
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClient, setSelectedClient] = useState(route?.params?.clientId || null);
  const [filterCategory, setFilterCategory] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [celebrationAnim] = useState(new Animated.Value(0));

  // Mock data for development
  const mockRecords = [
    {
      id: '1',
      clientId: 'client1',
      clientName: 'Sarah Johnson',
      exercise: 'Deadlift',
      category: 'strength',
      value: 140,
      unit: 'kg',
      previousRecord: 135,
      date: '2025-08-18',
      improvement: 5,
      notes: 'Perfect form! Great breakthrough!',
      isNewRecord: true,
      reps: 1,
      sets: 1,
    },
    {
      id: '2',
      clientId: 'client2',
      clientName: 'Mike Chen',
      exercise: '5K Run',
      category: 'endurance',
      value: 22.5,
      unit: 'min',
      previousRecord: 24.2,
      date: '2025-08-17',
      improvement: -1.7,
      notes: 'Consistent pace, great endurance build-up',
      isNewRecord: true,
      distance: '5K',
    },
    {
      id: '3',
      clientId: 'client1',
      clientName: 'Sarah Johnson',
      exercise: 'Bench Press',
      category: 'strength',
      value: 70,
      unit: 'kg',
      previousRecord: 65,
      date: '2025-08-15',
      improvement: 5,
      notes: 'Solid progression, ready for next level',
      isNewRecord: false,
      reps: 5,
      sets: 3,
    },
    {
      id: '4',
      clientId: 'client3',
      clientName: 'Emma Davis',
      exercise: 'Pull-ups',
      category: 'bodyweight',
      value: 12,
      unit: 'reps',
      previousRecord: 8,
      date: '2025-08-16',
      improvement: 4,
      notes: 'Amazing progress! From 8 to 12 reps!',
      isNewRecord: true,
      sets: 1,
    },
    {
      id: '5',
      clientId: 'client2',
      clientName: 'Mike Chen',
      exercise: 'Plank Hold',
      category: 'core',
      value: 3.5,
      unit: 'min',
      previousRecord: 2.8,
      date: '2025-08-14',
      improvement: 0.7,
      notes: 'Great core strength development',
      isNewRecord: true,
    },
  ];

  const categories = [
    { id: 'all', label: 'All Records', icon: 'fitness-center', color: COLORS.primary },
    { id: 'strength', label: 'Strength', icon: 'fitness-center', color: '#e74c3c' },
    { id: 'endurance', label: 'Endurance', icon: 'directions-run', color: '#3498db' },
    { id: 'bodyweight', label: 'Bodyweight', icon: 'accessibility', color: '#9b59b6' },
    { id: 'core', label: 'Core', icon: 'trending-up', color: '#f39c12' },
  ];

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      Alert.alert('Success', 'Personal records updated! 🏆');
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh personal records');
    } finally {
      setRefreshing(false);
    }
  }, []);

  const getCategoryColor = (category) => {
    const cat = categories.find(c => c.id === category);
    return cat ? cat.color : COLORS.primary;
  };

  const getCategoryIcon = (category) => {
    const cat = categories.find(c => c.id === category);
    return cat ? cat.icon : 'fitness-center';
  };

  const filteredRecords = mockRecords.filter(record => {
    const matchesSearch = record.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         record.exercise.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || record.category === filterCategory;
    const matchesClient = !selectedClient || record.clientId === selectedClient;
    
    return matchesSearch && matchesCategory && matchesClient;
  
  });

  const handleAddRecord = () => {
    setShowAddModal(true);
  };

  const handleCelebration = (record) => {
    Animated.sequence([
      Animated.timing(celebrationAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(celebrationAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    Alert.alert(
      '🎉 New Personal Record!',
      `${record.clientName} just set a new PR in ${record.exercise}!`,
      [
        { text: 'Share Achievement', onPress: () => handleShareRecord(record) },
        { text: 'Awesome!', style: 'default' },
      ]
    );
  };

  const handleShareRecord = (record) => {
    Alert.alert('Feature Coming Soon', 'Share achievement functionality will be available in the next update');
  };

  const handleViewDetails = (record) => {
    setSelectedRecord(record);
  };

  const getImprovementDisplay = (record) => {
    if (record.category === 'endurance' && record.unit === 'min') {
      return record.improvement < 0 ? 
        `${Math.abs(record.improvement)}${record.unit} faster ⚡` : 
        `${record.improvement}${record.unit} slower`;
    }
    return `+${record.improvement}${record.unit} improvement 📈`;
  };

  const renderRecordCard = (record) => (
    <Card key={record.id} style={[
      styles.recordCard,
      record.isNewRecord && styles.newRecordCard
    ]}>
      {record.isNewRecord && (
        <LinearGradient
          colors={['#ffd700', '#ffed4a']}
          style={styles.newRecordBadge}
        >
          <Text style={styles.newRecordText}>🏆 NEW PR!</Text>
        </LinearGradient>
      )}
      
      <Card.Content>
        <View style={styles.cardHeader}>
          <View style={styles.clientInfo}>
            <Avatar.Text 
              size={40} 
              label={record.clientName.split(' ').map(n => n[0]).join('')}
              style={{ backgroundColor: getCategoryColor(record.category) }}
            />
            <View style={styles.clientDetails}>
              <Text style={styles.clientName}>{record.clientName}</Text>
              <Text style={styles.recordDate}>{new Date(record.date).toLocaleDateString()}</Text>
            </View>
          </View>
          <IconButton
            icon="dots-vertical"
            size={20}
            onPress={() => handleViewDetails(record)}
          />
        </View>

        <View style={styles.recordInfo}>
          <View style={styles.exerciseHeader}>
            <Icon 
              name={getCategoryIcon(record.category)} 
              size={24} 
              color={getCategoryColor(record.category)} 
            />
            <Text style={styles.exerciseName}>{record.exercise}</Text>
            <Chip 
              style={[styles.categoryChip, { backgroundColor: getCategoryColor(record.category) + '20' }]}
              textStyle={{ color: getCategoryColor(record.category), fontSize: 10 }}
            >
              {record.category.toUpperCase()}
            </Chip>
          </View>
          
          <View style={styles.valueContainer}>
            <View style={styles.currentRecord}>
              <Text style={styles.recordValue}>{record.value}</Text>
              <Text style={styles.recordUnit}>{record.unit}</Text>
            </View>
            
            {record.previousRecord && (
              <View style={styles.improvementContainer}>
                <Text style={styles.previousValue}>
                  Previous: {record.previousRecord}{record.unit}
                </Text>
                <Text style={[
                  styles.improvement,
                  { color: record.improvement > 0 || (record.improvement < 0 && record.unit === 'min') ? 
                    COLORS.success : COLORS.error }
                ]}>
                  {getImprovementDisplay(record)}
                </Text>
              </View>
            )}
          </View>

          {record.reps && (
            <View style={styles.detailsRow}>
              <Text style={styles.detailItem}>🔄 {record.reps} reps</Text>
              {record.sets && <Text style={styles.detailItem}>📊 {record.sets} sets</Text>}
            </View>
          )}

          {record.distance && (
            <Text style={styles.detailItem}>📏 Distance: {record.distance}</Text>
          )}

          {record.notes && (
            <View style={styles.notesContainer}>
              <Text style={styles.notes}>💭 "{record.notes}"</Text>
            </View>
          )}

          <View style={styles.actionButtons}>
            {record.isNewRecord && (
              <Button
                mode="contained"
                onPress={() => handleCelebration(record)}
                style={[styles.actionButton, { backgroundColor: '#ffd700' }]}
                labelStyle={{ fontSize: 12, color: '#333' }}
                icon="celebration"
              >
                Celebrate 🎉
              </Button>
            )}
            <Button
              mode="outlined"
              onPress={() => handleViewDetails(record)}
              style={styles.actionButton}
              labelStyle={{ fontSize: 12 }}
            >
              View Details
            </Button>
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  const renderStatsSection = () => {
    const totalRecords = mockRecords.length;
    const newRecords = mockRecords.filter(r => r.isNewRecord).length;
    const strengthRecords = mockRecords.filter(r => r.category === 'strength').length;
    
    return (
      <View style={styles.statsSection}>
        <Text style={styles.sectionTitle}>📊 Quick Stats</Text>
        <View style={styles.statsRow}>
          <Surface style={styles.statCard}>
            <Text style={styles.statNumber}>{totalRecords}</Text>
            <Text style={styles.statLabel}>Total PRs</Text>
          </Surface>
          <Surface style={styles.statCard}>
            <Text style={[styles.statNumber, { color: '#ffd700' }]}>{newRecords}</Text>
            <Text style={styles.statLabel}>This Week</Text>
          </Surface>
          <Surface style={styles.statCard}>
            <Text style={[styles.statNumber, { color: '#e74c3c' }]}>{strengthRecords}</Text>
            <Text style={styles.statLabel}>Strength</Text>
          </Surface>
        </View>
      </View>
    );
  };

  const renderEmptyState = () => (
    <Surface style={styles.emptyState}>
      <Icon name="jump-rope" size={80} color={COLORS.secondary} />
      <Text style={styles.emptyTitle}>No Personal Records Yet</Text>
      <Text style={styles.emptyText}>
        {selectedClient 
          ? "This client hasn't set any personal records yet" 
          : "Start tracking your clients' achievements and milestones"}
      </Text>
      <Button
        mode="contained"
        onPress={handleAddRecord}
        style={styles.addButton}
        icon="add"
      >
        Record First Achievement
      </Button>
    </Surface>
  );

  const renderDetailModal = () => (
    <Portal>
      <Modal
        visible={!!selectedRecord}
        onDismiss={() => setSelectedRecord(null)}
        contentContainerStyle={styles.modalContainer}
      >
        <BlurView style={styles.modalOverlay} blurType="light" blurAmount={5}>
          <Surface style={styles.detailCard}>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleContainer}>
                <Icon 
                  name="jump-rope" 
                  size={28} 
                  color="#ffd700" 
                  style={{ marginRight: SPACING.sm }}
                />
                <Text style={styles.modalTitle}>Personal Record</Text>
              </View>
              <IconButton
                icon="close"
                onPress={() => setSelectedRecord(null)}
              />
            </View>
            
            {selectedRecord && (
              <ScrollView style={styles.modalContent}>
                <View style={styles.recordHeader}>
                  <Avatar.Text 
                    size={60} 
                    label={selectedRecord.clientName.split(' ').map(n => n[0]).join('')}
                    style={{ backgroundColor: getCategoryColor(selectedRecord.category) }}
                  />
                  <View style={styles.recordHeaderInfo}>
                    <Text style={styles.modalClientName}>{selectedRecord.clientName}</Text>
                    <Text style={styles.modalExercise}>{selectedRecord.exercise}</Text>
                    <Text style={styles.modalDate}>{new Date(selectedRecord.date).toLocaleDateString()}</Text>
                  </View>
                </View>
                
                <View style={styles.recordValueSection}>
                  <Text style={styles.modalRecordValue}>
                    {selectedRecord.value} {selectedRecord.unit}
                  </Text>
                  {selectedRecord.previousRecord && (
                    <Text style={styles.modalPreviousRecord}>
                      Previous: {selectedRecord.previousRecord} {selectedRecord.unit}
                    </Text>
                  )}
                </View>
                
                {selectedRecord.improvement && (
                  <Surface style={styles.improvementCard}>
                    <Text style={styles.improvementTitle}>💪 Improvement</Text>
                    <Text style={styles.improvementValue}>
                      {getImprovementDisplay(selectedRecord)}
                    </Text>
                  </Surface>
                )}
                
                <View style={styles.detailsGrid}>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Category</Text>
                    <Chip 
                      style={[styles.categoryChip, { backgroundColor: getCategoryColor(selectedRecord.category) + '20' }]}
                      textStyle={{ color: getCategoryColor(selectedRecord.category) }}
                      icon={() => <Icon name={getCategoryIcon(selectedRecord.category)} size={16} />}
                    >
                      {selectedRecord.category}
                    </Chip>
                  </View>
                  
                  {selectedRecord.reps && (
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Reps</Text>
                      <Text style={styles.detailValue}>{selectedRecord.reps}</Text>
                    </View>
                  )}
                  
                  {selectedRecord.sets && (
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Sets</Text>
                      <Text style={styles.detailValue}>{selectedRecord.sets}</Text>
                    </View>
                  )}
                </View>
                
                {selectedRecord.notes && (
                  <Surface style={styles.notesCard}>
                    <Text style={styles.notesTitle}>📝 Coach Notes</Text>
                    <Text style={styles.notesText}>{selectedRecord.notes}</Text>
                  </Surface>
                )}
                
                <View style={styles.modalActions}>
                  <Button
                    mode="outlined"
                    onPress={() => {
                      setSelectedRecord(null);
                      Alert.alert('Feature Coming Soon', 'Edit record functionality will be available in the next update');
                    }}
                    style={styles.modalActionButton}
                  >
                    Edit Record
                  </Button>
                  <Button
                    mode="contained"
                    onPress={() => handleShareRecord(selectedRecord)}
                    style={[styles.modalActionButton, { backgroundColor: '#ffd700' }]}
                    labelStyle={{ color: '#333' }}
                    icon="share"
                  >
                    Share PR
                  </Button>
                </View>
              </ScrollView>
            )}
          </Surface>
        </BlurView>
      </Modal>
    </Portal>
  );

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Personal Records 🏆</Text>
        <Text style={styles.headerSubtitle}>Track client achievements and milestones</Text>
      </LinearGradient>

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <View style={styles.searchSection}>
          <Searchbar
            placeholder="Search records, clients, or exercises..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchBar}
            iconColor={COLORS.primary}
          />
        </View>

        <View style={styles.filterSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.filterChips}>
              {categories.map((category) => (
                <Chip
                  key={category.id}
                  selected={filterCategory === category.id}
                  onPress={() => setFilterCategory(category.id)}
                  style={[
                    styles.filterChip,
                    filterCategory === category.id && { backgroundColor: category.color + '20' }
                  ]}
                  textStyle={{ 
                    color: filterCategory === category.id ? category.color : COLORS.secondary 
                  }}
                  icon={() => filterCategory === category.id ? 
                    <Icon name={category.icon} size={16} color={category.color} /> : null
                  }
                >
                  {category.label}
                </Chip>
              ))}
            </View>
          </ScrollView>
        </View>

        {renderStatsSection()}

        <ScrollView
          style={styles.recordsList}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
        >
          {filteredRecords.length > 0 ? (
            <>
              <Text style={styles.sectionTitle}>🎯 Recent Achievements</Text>
              {filteredRecords.map((record) => renderRecordCard(record))}
            </>
          ) : (
            renderEmptyState()
          )}
        </ScrollView>
      </Animated.View>

      <FAB
        style={styles.fab}
        icon="add"
        onPress={handleAddRecord}
        color="white"
      />

      {renderDetailModal()}

      <Animated.View 
        style={[
          styles.celebrationOverlay,
          {
            opacity: celebrationAnim,
            transform: [{
              scale: celebrationAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.5, 1],
              }),
            }],
          }
        ]}
      >
        <Text style={styles.celebrationText}>🎉 NEW PERSONAL RECORD! 🎉</Text>
      </Animated.View>
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
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  headerTitle: {
    ...TEXT_STYLES.h1,
    color: 'white',
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    ...TEXT_STYLES.body,
    color: 'rgba(255,255,255,0.8)',
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  searchSection: {
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
  },
  searchBar: {
    backgroundColor: 'white',
    elevation: 2,
  },
  filterSection: {
    marginBottom: SPACING.lg,
  },
  filterChips: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  filterChip: {
    marginRight: SPACING.sm,
  },
  statsSection: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    ...TEXT_STYLES.h3,
    color: COLORS.text,
    marginBottom: SPACING.md,
    marginLeft: SPACING.sm,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },
  statCard: {
    flex: 1,
    padding: SPACING.md,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
  },
  statNumber: {
    ...TEXT_STYLES.h2,
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  statLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.secondary,
  },
  recordsList: {
    flex: 1,
  },
  recordCard: {
    marginBottom: SPACING.md,
    elevation: 3,
    borderRadius: 12,
    overflow: 'hidden',
  },
  newRecordCard: {
    borderWidth: 2,
    borderColor: '#ffd700',
    elevation: 5,
  },
  newRecordBadge: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    alignItems: 'center',
  },
  newRecordText: {
    ...TEXT_STYLES.caption,
    fontWeight: 'bold',
    color: '#333',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  clientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clientDetails: {
    marginLeft: SPACING.md,
  },
  clientName: {
    ...TEXT_STYLES.subtitle,
    color: COLORS.text,
  },
  recordDate: {
    ...TEXT_STYLES.caption,
    color: COLORS.secondary,
  },
  recordInfo: {
    marginTop: SPACING.sm,
  },
  exerciseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  exerciseName: {
    ...TEXT_STYLES.h3,
    color: COLORS.text,
    flex: 1,
  },
  categoryChip: {
    marginLeft: SPACING.sm,
  },
  valueContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    alignItems: 'center',
  },
  currentRecord: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: SPACING.sm,
  },
  recordValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  recordUnit: {
    fontSize: 20,
    color: COLORS.secondary,
    marginLeft: SPACING.xs,
  },
  improvementContainer: {
    alignItems: 'center',
  },
  previousValue: {
    ...TEXT_STYLES.caption,
    color: COLORS.secondary,
    marginBottom: SPACING.xs,
  },
  improvement: {
    ...TEXT_STYLES.body,
    fontWeight: 'bold',
  },
  detailsRow: {
    flexDirection: 'row',
    gap: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  detailItem: {
    ...TEXT_STYLES.body,
    color: COLORS.secondary,
  },
  notesContainer: {
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  notes: {
    ...TEXT_STYLES.body,
    color: '#1565c0',
    fontStyle: 'italic',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },
  actionButton: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
    borderRadius: 12,
    margin: SPACING.lg,
  },
  emptyTitle: {
    ...TEXT_STYLES.h2,
    color: COLORS.text,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  emptyText: {
    ...TEXT_STYLES.body,
    color: COLORS.secondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  addButton: {
    backgroundColor: COLORS.primary,
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
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  detailCard: {
    width: '100%',
    maxHeight: '85%',
    borderRadius: 16,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalTitle: {
    ...TEXT_STYLES.h2,
    color: COLORS.text,
  },
  modalContent: {
    padding: SPACING.lg,
  },
  recordHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  recordHeaderInfo: {
    marginLeft: SPACING.lg,
    flex: 1,
  },
  modalClientName: {
    ...TEXT_STYLES.h3,
    color: COLORS.text,
  },
  modalExercise: {
    ...TEXT_STYLES.subtitle,
    color: COLORS.primary,
    marginTop: SPACING.xs,
  },
  modalDate: {
    ...TEXT_STYLES.caption,
    color: COLORS.secondary,
    marginTop: SPACING.xs,
  },
  recordValueSection: {
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    padding: SPACING.lg,
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  modalRecordValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SPACING.sm,
  },
  modalPreviousRecord: {
    ...TEXT_STYLES.body,
    color: COLORS.secondary,
  },
  improvementCard: {
    padding: SPACING.md,
    borderRadius: 12,
    marginBottom: SPACING.lg,
    alignItems: 'center',
  },
  improvementTitle: {
    ...TEXT_STYLES.subtitle,
    color: COLORS.success,
    marginBottom: SPACING.xs,
  },
  improvementValue: {
    ...TEXT_STYLES.body,
    color: COLORS.success,
    fontWeight: 'bold',
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  detailItem: {
    flex: 1,
    minWidth: '45%',
    marginBottom: SPACING.md,
  },
  detailLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.secondary,
    marginBottom: SPACING.xs,
  },
  detailValue: {
    ...TEXT_STYLES.body,
    color: COLORS.text,
    fontWeight: 'bold',
  },
  notesCard: {
    padding: SPACING.md,
    borderRadius: 12,
    marginBottom: SPACING.lg,
    backgroundColor: '#e8f5e8',
  },
  notesTitle: {
    ...TEXT_STYLES.subtitle,
    color: COLORS.success,
    marginBottom: SPACING.sm,
  },
  notesText: {
    ...TEXT_STYLES.body,
    color: '#2e7d32',
    fontStyle: 'italic',
  },
  modalActions: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.lg,
  },
  modalActionButton: {
    flex: 1,
  },
  celebrationOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    zIndex: 1000,
  },
  celebrationText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffd700',
    textAlign: 'center',
    padding: SPACING.lg,
  },
});

export default PersonalRecords;