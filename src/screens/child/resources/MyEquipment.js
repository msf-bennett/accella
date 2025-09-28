import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  RefreshControl,
  StatusBar,
  Alert,
  Animated,
  Dimensions,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import {
  Card,
  Title,
  Subtitle,
  Button,
  Chip,
  Surface,
  Avatar,
  IconButton,
  FAB,
  Searchbar,
  ProgressBar,
  Text,
  Portal,
  Modal,
} from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';
import { COLORS, SPACING, TEXT_STYLES } from '../../../constants/theme';

const { width } = Dimensions.get('window');

const MyEquipmentsScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, equipment } = useSelector(state => ({
    user: state.auth.user,
    equipment: state.equipment.myEquipment || []
  }));

  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const fadeAnim = new Animated.Value(0);

  // Mock equipment data for demonstration
  const mockEquipment = [
    {
      id: 1,
      name: 'Soccer Cleats',
      category: 'Footwear',
      condition: 'Good',
      conditionScore: 80,
      lastUsed: '2025-08-28',
      sport: 'Football',
      brand: 'Nike',
      size: '6',
      location: 'Sports Bag',
      image: 'sports-shoe',
      needsReplacement: false,
      points: 25
    },
    {
      id: 2,
      name: 'Basketball',
      category: 'Ball',
      condition: 'Excellent',
      conditionScore: 95,
      lastUsed: '2025-08-29',
      sport: 'Basketball',
      brand: 'Wilson',
      size: 'Official',
      location: 'Garage',
      image: 'sports-basketball',
      needsReplacement: false,
      points: 30
    },
    {
      id: 3,
      name: 'Tennis Racket',
      category: 'Equipment',
      condition: 'Fair',
      conditionScore: 65,
      lastUsed: '2025-08-25',
      sport: 'Tennis',
      brand: 'Babolat',
      size: 'Junior',
      location: 'Bedroom',
      image: 'sports-tennis',
      needsReplacement: true,
      points: 20
    },
    {
      id: 4,
      name: 'Swimming Goggles',
      category: 'Accessories',
      condition: 'Good',
      conditionScore: 85,
      lastUsed: '2025-08-27',
      sport: 'Swimming',
      brand: 'Speedo',
      size: 'Youth',
      location: 'Swim Bag',
      image: 'pool',
      needsReplacement: false,
      points: 15
    },
    {
      id: 5,
      name: 'Hockey Stick',
      category: 'Equipment',
      condition: 'Poor',
      conditionScore: 40,
      lastUsed: '2025-08-20',
      sport: 'Hockey',
      brand: 'CCM',
      size: 'Junior',
      location: 'Garage',
      image: 'sports-hockey',
      needsReplacement: true,
      points: 10
    }
  ];

  const categories = ['All', 'Footwear', 'Ball', 'Equipment', 'Accessories'];

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  }, []);

  const getConditionColor = (score) => {
    if (score >= 80) return COLORS.success;
    if (score >= 60) return '#FFA726';
    return COLORS.error;
  };

  const getConditionIcon = (score) => {
    if (score >= 80) return 'check-circle';
    if (score >= 60) return 'warning';
    return 'error';
  };

  const filteredEquipment = mockEquipment.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.sport.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const totalPoints = mockEquipment.reduce((sum, item) => sum + item.points, 0);
  const equipmentNeedingReplacement = mockEquipment.filter(item => item.needsReplacement).length;

  const handleEquipmentPress = (item) => {
    setSelectedEquipment(item);
  };

  const handleAddEquipment = () => {
    Alert.alert(
      '🔧 Equipment Manager',
      'This feature is under development! Soon you\'ll be able to add new equipment to track.',
      [{ text: 'Got it! 👍', style: 'default' }]
    );
  };

  const handleRequestReplacement = (item) => {
    Alert.alert(
      '🚨 Request Replacement',
      `Would you like to ask your parents to replace your ${item.name}?`,
      [
        { text: 'Not Now', style: 'cancel' },
        { 
          text: 'Ask Parents 📱', 
          style: 'default',
          onPress: () => {
            Alert.alert('📨 Request Sent!', 'Your parents have been notified about the replacement request.');
          }
        }
      ]
    );
  };

  const renderEquipmentCard = ({ item }) => (
    <Card style={[styles.equipmentCard, { marginHorizontal: SPACING.md }]} onPress={() => handleEquipmentPress(item)}>
      <LinearGradient
        colors={item.needsReplacement ? ['#FF6B6B', '#FF8E53'] : ['#667eea', '#764ba2']}
        style={styles.cardHeader}
      >
        <View style={styles.cardHeaderContent}>
          <Avatar.Icon
            size={40}
            icon={item.image}
            style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
          />
          <View style={styles.cardHeaderText}>
            <Title style={styles.cardTitle}>{item.name}</Title>
            <Subtitle style={styles.cardSubtitle}>{item.sport} • {item.brand}</Subtitle>
          </View>
          <IconButton
            icon={item.needsReplacement ? 'warning' : 'dots-vertical'}
            iconColor="white"
            size={20}
            onPress={() => item.needsReplacement ? handleRequestReplacement(item) : null}
          />
        </View>
      </LinearGradient>
      
      <Card.Content style={styles.cardContent}>
        <View style={styles.conditionRow}>
          <Icon 
            name={getConditionIcon(item.conditionScore)} 
            size={20} 
            color={getConditionColor(item.conditionScore)} 
          />
          <Text style={[styles.conditionText, { color: getConditionColor(item.conditionScore) }]}>
            {item.condition} ({item.conditionScore}%)
          </Text>
          <Chip 
            mode="outlined" 
            compact
            style={styles.categoryChip}
            textStyle={styles.chipText}
          >
            {item.category}
          </Chip>
        </View>
        
        <ProgressBar
          progress={item.conditionScore / 100}
          color={getConditionColor(item.conditionScore)}
          style={styles.progressBar}
        />
        
        <View style={styles.detailsRow}>
          <View style={styles.detailItem}>
            <Icon name="location-on" size={16} color={COLORS.textSecondary} />
            <Text style={styles.detailText}>{item.location}</Text>
          </View>
          <View style={styles.detailItem}>
            <Icon name="straighten" size={16} color={COLORS.textSecondary} />
            <Text style={styles.detailText}>Size {item.size}</Text>
          </View>
          <View style={styles.detailItem}>
            <Icon name="star" size={16} color="#FFD700" />
            <Text style={styles.detailText}>{item.points} pts</Text>
          </View>
        </View>
        
        <Text style={styles.lastUsedText}>
          Last used: {new Date(item.lastUsed).toLocaleDateString()}
        </Text>

        {item.needsReplacement && (
          <Button
            mode="contained"
            onPress={() => handleRequestReplacement(item)}
            style={styles.replacementButton}
            buttonColor={COLORS.error}
            icon="alert-circle"
            compact
          >
            Ask for Replacement
          </Button>
        )}
      </Card.Content>
    </Card>
  );

  const renderStatsCard = () => (
    <Card style={[styles.statsCard, { marginHorizontal: SPACING.md }]}>
      <LinearGradient
        colors={['#4facfe', '#00f2fe']}
        style={styles.statsGradient}
      >
        <View style={styles.statsContent}>
          <View style={styles.statItem}>
            <Icon name="sports" size={24} color="white" />
            <Text style={styles.statNumber}>{mockEquipment.length}</Text>
            <Text style={styles.statLabel}>Equipment</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Icon name="star" size={24} color="#FFD700" />
            <Text style={styles.statNumber}>{totalPoints}</Text>
            <Text style={styles.statLabel}>Total Points</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Icon name="warning" size={24} color="#FFB74D" />
            <Text style={styles.statNumber}>{equipmentNeedingReplacement}</Text>
            <Text style={styles.statLabel}>Need Help</Text>
          </View>
        </View>
      </LinearGradient>
    </Card>
  );

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <IconButton
              icon="arrow-back"
              iconColor="white"
              size={24}
              onPress={() => navigation.goBack()}
            />
            <Title style={styles.headerTitle}>My Equipment 🏆</Title>
            <IconButton
              icon="notifications"
              iconColor="white"
              size={24}
              onPress={() => Alert.alert('🔔 Notifications', 'No new notifications!')}
            />
          </View>
          
          <Text style={styles.welcomeText}>
            Hey {user?.firstName || 'Champion'}! Keep your gear in great shape! 💪
          </Text>
        </View>
      </LinearGradient>

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
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
        >
          {/* Search and Filters */}
          <View style={styles.searchSection}>
            <Searchbar
              placeholder="Search equipment..."
              onChangeText={setSearchQuery}
              value={searchQuery}
              style={styles.searchBar}
              iconColor={COLORS.primary}
            />
            
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
              {categories.map((category) => (
                <Chip
                  key={category}
                  selected={selectedCategory === category}
                  onPress={() => setSelectedCategory(category)}
                  style={[
                    styles.filterChip,
                    selectedCategory === category && styles.selectedFilterChip
                  ]}
                  textStyle={[
                    styles.filterChipText,
                    selectedCategory === category && styles.selectedFilterChipText
                  ]}
                >
                  {category}
                </Chip>
              ))}
            </ScrollView>
          </View>

          {/* Stats Overview */}
          {renderStatsCard()}

          {/* Quick Actions */}
          <View style={styles.quickActionsSection}>
            <Title style={styles.sectionTitle}>Quick Actions ⚡</Title>
            <View style={styles.quickActionsGrid}>
              <TouchableOpacity
                style={styles.quickActionCard}
                onPress={handleAddEquipment}
              >
                <Surface style={styles.quickActionSurface}>
                  <Icon name="add-circle" size={32} color={COLORS.primary} />
                  <Text style={styles.quickActionText}>Add Equipment</Text>
                </Surface>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.quickActionCard}
                onPress={() => Alert.alert('📝 Equipment Check', 'Feature coming soon! You\'ll be able to check your equipment condition.')}
              >
                <Surface style={styles.quickActionSurface}>
                  <Icon name="fact-check" size={32} color={COLORS.success} />
                  <Text style={styles.quickActionText}>Check Condition</Text>
                </Surface>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.quickActionCard}
                onPress={() => Alert.alert('🏪 Equipment Store', 'Feature coming soon! Browse equipment recommendations.')}
              >
                <Surface style={styles.quickActionSurface}>
                  <Icon name="shopping-cart" size={32} color="#FF6B6B" />
                  <Text style={styles.quickActionText}>Shop Gear</Text>
                </Surface>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.quickActionCard}
                onPress={() => Alert.alert('📊 Progress Report', 'Feature coming soon! View your equipment usage stats.')}
              >
                <Surface style={styles.quickActionSurface}>
                  <Icon name="analytics" size={32} color="#9C27B0" />
                  <Text style={styles.quickActionText}>View Stats</Text>
                </Surface>
              </TouchableOpacity>
            </View>
          </View>

          {/* Equipment List */}
          <View style={styles.equipmentSection}>
            <View style={styles.sectionHeader}>
              <Title style={styles.sectionTitle}>Your Equipment 🎯</Title>
              <Text style={styles.equipmentCount}>
                {filteredEquipment.length} items
              </Text>
            </View>

            {filteredEquipment.length === 0 ? (
              <Card style={[styles.emptyCard, { marginHorizontal: SPACING.md }]}>
                <Card.Content style={styles.emptyContent}>
                  <Icon name="sports" size={64} color={COLORS.textSecondary} />
                  <Title style={styles.emptyTitle}>No Equipment Found</Title>
                  <Text style={styles.emptyText}>
                    {searchQuery ? 'Try a different search term' : 'Add your first piece of equipment to get started!'}
                  </Text>
                  <Button
                    mode="contained"
                    onPress={handleAddEquipment}
                    style={styles.emptyButton}
                    icon="add"
                  >
                    Add Equipment
                  </Button>
                </Card.Content>
              </Card>
            ) : (
              <FlatList
                data={filteredEquipment}
                renderItem={renderEquipmentCard}
                keyExtractor={item => item.id.toString()}
                scrollEnabled={false}
                ItemSeparatorComponent={() => <View style={{ height: SPACING.md }} />}
                contentContainerStyle={{ paddingBottom: SPACING.xl }}
              />
            )}
          </View>
        </ScrollView>
      </Animated.View>

      {/* Equipment Detail Modal */}
      <Portal>
        <Modal
          visible={!!selectedEquipment}
          onDismiss={() => setSelectedEquipment(null)}
          contentContainerStyle={styles.modalContainer}
        >
          {selectedEquipment && (
            <BlurView intensity={20} style={styles.modalBlur}>
              <Card style={styles.detailModal}>
                <LinearGradient
                  colors={['#667eea', '#764ba2']}
                  style={styles.modalHeader}
                >
                  <View style={styles.modalHeaderContent}>
                    <Avatar.Icon
                      size={60}
                      icon={selectedEquipment.image}
                      style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
                    />
                    <Title style={styles.modalTitle}>{selectedEquipment.name}</Title>
                    <IconButton
                      icon="close"
                      iconColor="white"
                      size={24}
                      style={styles.modalCloseButton}
                      onPress={() => setSelectedEquipment(null)}
                    />
                  </View>
                </LinearGradient>
                
                <Card.Content style={styles.modalContent}>
                  <View style={styles.modalDetailRow}>
                    <Text style={styles.modalDetailLabel}>Sport:</Text>
                    <Text style={styles.modalDetailValue}>{selectedEquipment.sport}</Text>
                  </View>
                  <View style={styles.modalDetailRow}>
                    <Text style={styles.modalDetailLabel}>Brand:</Text>
                    <Text style={styles.modalDetailValue}>{selectedEquipment.brand}</Text>
                  </View>
                  <View style={styles.modalDetailRow}>
                    <Text style={styles.modalDetailLabel}>Size:</Text>
                    <Text style={styles.modalDetailValue}>{selectedEquipment.size}</Text>
                  </View>
                  <View style={styles.modalDetailRow}>
                    <Text style={styles.modalDetailLabel}>Location:</Text>
                    <Text style={styles.modalDetailValue}>{selectedEquipment.location}</Text>
                  </View>
                  <View style={styles.modalDetailRow}>
                    <Text style={styles.modalDetailLabel}>Condition:</Text>
                    <View style={styles.conditionDetail}>
                      <Text style={[styles.modalDetailValue, { color: getConditionColor(selectedEquipment.conditionScore) }]}>
                        {selectedEquipment.condition}
                      </Text>
                      <ProgressBar
                        progress={selectedEquipment.conditionScore / 100}
                        color={getConditionColor(selectedEquipment.conditionScore)}
                        style={styles.modalProgressBar}
                      />
                    </View>
                  </View>
                  
                  <View style={styles.modalActions}>
                    <Button
                      mode="outlined"
                      onPress={() => Alert.alert('📝 Update', 'Feature coming soon!')}
                      style={styles.modalActionButton}
                      icon="edit"
                    >
                      Update Info
                    </Button>
                    {selectedEquipment.needsReplacement && (
                      <Button
                        mode="contained"
                        onPress={() => {
                          handleRequestReplacement(selectedEquipment);
                          setSelectedEquipment(null);
                        }}
                        style={styles.modalActionButton}
                        buttonColor={COLORS.error}
                        icon="alert-circle"
                      >
                        Request Help
                      </Button>
                    )}
                  </View>
                </Card.Content>
              </Card>
            </BlurView>
          )}
        </Modal>
      </Portal>

      {/* Floating Action Button */}
      <FAB
        icon="add"
        style={[styles.fab, { backgroundColor: COLORS.primary }]}
        onPress={handleAddEquipment}
        label="Add Equipment"
      />
    </View>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: StatusBar.currentHeight + SPACING.md,
    paddingBottom: SPACING.lg,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerContent: {
    paddingHorizontal: SPACING.md,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  welcomeText: {
    color: 'white',
    fontSize: 14,
    marginTop: SPACING.xs,
    textAlign: 'center',
    opacity: 0.9,
  },
  content: {
    flex: 1,
  },
  searchSection: {
    padding: SPACING.md,
  },
  searchBar: {
    backgroundColor: 'white',
    elevation: 2,
    marginBottom: SPACING.md,
  },
  filterRow: {
    flexDirection: 'row',
  },
  filterChip: {
    marginRight: SPACING.xs,
    backgroundColor: 'white',
  },
  selectedFilterChip: {
    backgroundColor: COLORS.primary,
  },
  filterChipText: {
    fontSize: 12,
  },
  selectedFilterChipText: {
    color: 'white',
  },
  statsCard: {
    marginBottom: SPACING.lg,
    elevation: 4,
  },
  statsGradient: {
    padding: SPACING.md,
    borderRadius: 12,
  },
  statsContent: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginTop: SPACING.xs,
  },
  statLabel: {
    fontSize: 12,
    color: 'white',
    opacity: 0.9,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  quickActionsSection: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionCard: {
    width: '48%',
    marginBottom: SPACING.sm,
  },
  quickActionSurface: {
    padding: SPACING.md,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
    backgroundColor: 'white',
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  equipmentSection: {
    flex: 1,
    paddingBottom: 100,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  equipmentCount: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  equipmentCard: {
    marginBottom: SPACING.md,
    elevation: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  cardHeader: {
    padding: SPACING.md,
  },
  cardHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardHeaderText: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  cardTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cardSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
  },
  cardContent: {
    padding: SPACING.md,
  },
  conditionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  conditionText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: SPACING.xs,
    flex: 1,
  },
  categoryChip: {
    height: 24,
  },
  chipText: {
    fontSize: 10,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    marginBottom: SPACING.sm,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  detailText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginLeft: SPACING.xs / 2,
  },
  lastUsedText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    marginBottom: SPACING.sm,
  },
  replacementButton: {
    marginTop: SPACING.xs,
  },
  emptyCard: {
    elevation: 2,
  },
  emptyContent: {
    alignItems: 'center',
    padding: SPACING.xl,
  },
  emptyTitle: {
    fontSize: 18,
    color: COLORS.textPrimary,
    marginTop: SPACING.md,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.xs,
    marginBottom: SPACING.lg,
  },
  emptyButton: {
    marginTop: SPACING.md,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.md,
    right: 0,
    bottom: 0,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBlur: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  detailModal: {
    width: width * 0.9,
    maxHeight: '80%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  modalHeader: {
    padding: SPACING.lg,
    alignItems: 'center',
  },
  modalHeaderContent: {
    alignItems: 'center',
    position: 'relative',
    width: '100%',
  },
  modalCloseButton: {
    position: 'absolute',
    right: 0,
    top: -10,
  },
  modalTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
  modalContent: {
    padding: SPACING.lg,
  },
  modalDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalDetailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  modalDetailValue: {
    fontSize: 14,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  conditionDetail: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  modalProgressBar: {
    height: 3,
    borderRadius: 2,
    marginTop: SPACING.xs,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.lg,
    gap: SPACING.sm,
  },
  modalActionButton: {
    flex: 1,
  },
};

export default MyEquipmentsScreen;