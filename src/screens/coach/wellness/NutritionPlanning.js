import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  StatusBar,
  Animated,
  Dimensions,
  Platform,
  Vibration,
  FlatList,
} from 'react-native';
import { 
  Card,
  Button,
  Chip,
  ProgressBar,
  Avatar,
  IconButton,
  FAB,
  Surface,
  Searchbar,
  Portal,
  Modal,
  TextInput,
  Divider,
  Badge,
} from 'react-native-paper';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/LinearGradient';
import { useSelector, useDispatch } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Import your established constants
import { COLORS } from '../../../styles/colors';
import { SPACING } from '../../../styles/spacing';
import { TEXT_STYLES } from '../../../styles/textStyles';
import { TYPOGRAPHY } from '../../../styles/typography';
import { LAYOUT } from '../../../styles/layout';

const { width, height } = Dimensions.get('window');

const NutritionPlanning = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { user, clients, nutritionPlans } = useSelector(state => state.coach);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('plans'); // plans, clients, templates
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);

  // Animation values
  const scrollY = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(height)).current;

  // Form states
  const [newPlan, setNewPlan] = useState({
    name: '',
    description: '',
    duration: '4', // weeks
    targetCalories: '',
    macroSplit: { protein: 30, carbs: 40, fats: 30 },
    mealTimes: ['Breakfast', 'Lunch', 'Dinner', 'Snacks'],
    restrictions: [],
    goals: []
  });

  // Mock data - replace with Redux state
  const mockPlans = [
    {
      id: 1,
      name: 'Athletic Performance Plan',
      description: 'High-protein diet for strength athletes',
      clients: 8,
      duration: '8 weeks',
      calories: 2800,
      status: 'active',
      macros: { protein: 35, carbs: 40, fats: 25 },
      createdAt: '2024-01-15',
      tags: ['strength', 'muscle-gain', 'performance']
    },
    {
      id: 2,
      name: 'Weight Loss Program',
      description: 'Calorie-controlled plan for fat loss',
      clients: 12,
      duration: '12 weeks',
      calories: 1800,
      status: 'active',
      macros: { protein: 40, carbs: 30, fats: 30 },
      createdAt: '2024-01-10',
      tags: ['weight-loss', 'deficit', 'health']
    },
    {
      id: 3,
      name: 'Endurance Athlete Nutrition',
      description: 'Carb-focused plan for endurance sports',
      clients: 6,
      duration: '6 weeks',
      calories: 3200,
      status: 'draft',
      macros: { protein: 20, carbs: 60, fats: 20 },
      createdAt: '2024-01-20',
      tags: ['endurance', 'cardio', 'performance']
    }
  ];

  const mockClients = [
    {
      id: 1,
      name: 'Sarah Johnson',
      avatar: 'https://i.pravatar.cc/100?img=1',
      currentPlan: 'Athletic Performance Plan',
      compliance: 85,
      lastUpdate: '2 hours ago',
      goals: ['muscle-gain', 'strength'],
      restrictions: ['lactose-free']
    },
    {
      id: 2,
      name: 'Mike Chen',
      avatar: 'https://i.pravatar.cc/100?img=2',
      currentPlan: 'Weight Loss Program',
      compliance: 92,
      lastUpdate: '1 day ago',
      goals: ['weight-loss', 'health'],
      restrictions: ['gluten-free']
    },
    {
      id: 3,
      name: 'Emma Davis',
      avatar: 'https://i.pravatar.cc/100?img=3',
      currentPlan: null,
      compliance: 0,
      lastUpdate: '1 week ago',
      goals: ['performance', 'endurance'],
      restrictions: ['vegetarian']
    }
  ];

  const nutritionTemplates = [
    { id: 1, name: 'High Protein', calories: 2500, protein: 40, carbs: 30, fats: 30 },
    { id: 2, name: 'Balanced', calories: 2200, protein: 25, carbs: 45, fats: 30 },
    { id: 3, name: 'Low Carb', calories: 2000, protein: 35, carbs: 15, fats: 50 },
    { id: 4, name: 'Endurance', calories: 3000, protein: 20, carbs: 60, fats: 20 }
  ];

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

  const handleCreatePlan = () => {
    if (!newPlan.name.trim()) {
      Alert.alert('Error', 'Please enter a plan name');
      return;
    }

    // Create plan logic here
    Vibration.vibrate(50);
    Alert.alert(
      'Success! 🎉',
      'Nutrition plan created successfully',
      [{ text: 'OK', onPress: () => setShowCreateModal(false) }]
    );

    // Reset form
    setNewPlan({
      name: '',
      description: '',
      duration: '4',
      targetCalories: '',
      macroSplit: { protein: 30, carbs: 40, fats: 30 },
      mealTimes: ['Breakfast', 'Lunch', 'Dinner', 'Snacks'],
      restrictions: [],
      goals: []
    });
  };

  const handleAssignPlan = () => {
    if (!selectedPlan || !selectedClient) {
      Alert.alert('Error', 'Please select both a plan and client');
      return;
    }

    Vibration.vibrate(50);
    Alert.alert(
      'Plan Assigned! 📋',
      `${selectedPlan.name} has been assigned to ${selectedClient.name}`,
      [{ text: 'OK', onPress: () => setShowAssignModal(false) }]
    );

    setSelectedPlan(null);
    setSelectedClient(null);
  };

  const renderHeader = () => (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={styles.header}
    >
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <View style={styles.headerContent}>
        <View style={styles.headerTop}>
          <View>
            <Text style={[TEXT_STYLES.h2, styles.headerTitle]}>
              Nutrition Planning 🥗
            </Text>
            <Text style={[TEXT_STYLES.body, styles.headerSubtitle]}>
              Create and manage meal plans
            </Text>
          </View>
          <TouchableOpacity
            style={styles.notificationButton}
            onPress={() => Alert.alert('Feature Coming Soon! 🚀', 'Notifications will be available in the next update.')}
          >
            <Icon name="notifications" size={24} color="#ffffff" />
            <Badge style={styles.notificationBadge}>3</Badge>
          </TouchableOpacity>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>24</Text>
            <Text style={styles.statLabel}>Active Plans</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>48</Text>
            <Text style={styles.statLabel}>Clients</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>89%</Text>
            <Text style={styles.statLabel}>Avg Compliance</Text>
          </View>
        </View>
      </View>
    </LinearGradient>
  );

  const renderTabBar = () => (
    <View style={styles.tabContainer}>
      {[
        { key: 'plans', label: 'Plans', icon: 'restaurant-menu' },
        { key: 'clients', label: 'Clients', icon: 'people' },
        { key: 'templates', label: 'Templates', icon: 'library-books' }
      ].map((tab) => (
        <TouchableOpacity
          key={tab.key}
          style={[styles.tab, activeTab === tab.key && styles.activeTab]}
          onPress={() => setActiveTab(tab.key)}
        >
          <Icon 
            name={tab.icon} 
            size={20} 
            color={activeTab === tab.key ? COLORS.primary : '#666'} 
          />
          <Text style={[
            styles.tabLabel,
            activeTab === tab.key && styles.activeTabLabel
          ]}>
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderPlanCard = ({ item }) => (
    <Card style={styles.planCard} elevation={2}>
      <Card.Content>
        <View style={styles.planHeader}>
          <View style={styles.planInfo}>
            <Text style={[TEXT_STYLES.h3, styles.planName]}>{item.name}</Text>
            <Text style={[TEXT_STYLES.caption, styles.planDescription]}>
              {item.description}
            </Text>
          </View>
          <View style={styles.planActions}>
            <Chip
              style={[styles.statusChip, 
                item.status === 'active' ? styles.activeChip : styles.draftChip
              ]}
              textStyle={styles.chipText}
            >
              {item.status}
            </Chip>
          </View>
        </View>

        <View style={styles.planMetrics}>
          <View style={styles.metric}>
            <Text style={styles.metricValue}>{item.clients}</Text>
            <Text style={styles.metricLabel}>Clients</Text>
          </View>
          <View style={styles.metric}>
            <Text style={styles.metricValue}>{item.calories}</Text>
            <Text style={styles.metricLabel}>Calories</Text>
          </View>
          <View style={styles.metric}>
            <Text style={styles.metricValue}>{item.duration}</Text>
            <Text style={styles.metricLabel}>Duration</Text>
          </View>
        </View>

        <View style={styles.macroContainer}>
          <Text style={styles.macroTitle}>Macro Split</Text>
          <View style={styles.macroBar}>
            <View style={[styles.macroSegment, { flex: item.macros.protein, backgroundColor: '#4CAF50' }]} />
            <View style={[styles.macroSegment, { flex: item.macros.carbs, backgroundColor: '#FF9800' }]} />
            <View style={[styles.macroSegment, { flex: item.macros.fats, backgroundColor: '#2196F3' }]} />
          </View>
          <View style={styles.macroLabels}>
            <Text style={styles.macroLabel}>P: {item.macros.protein}%</Text>
            <Text style={styles.macroLabel}>C: {item.macros.carbs}%</Text>
            <Text style={styles.macroLabel}>F: {item.macros.fats}%</Text>
          </View>
        </View>

        <View style={styles.tagsContainer}>
          {item.tags.map((tag, index) => (
            <Chip key={index} style={styles.tag} textStyle={styles.tagText}>
              {tag}
            </Chip>
          ))}
        </View>
      </Card.Content>
      
      <Card.Actions>
        <Button 
          mode="outlined" 
          onPress={() => {
            setSelectedPlan(item);
            setShowAssignModal(true);
          }}
          style={styles.actionButton}
        >
          Assign
        </Button>
        <Button 
          mode="contained" 
          onPress={() => Alert.alert('Feature Coming Soon! 🚀', 'Plan editing will be available in the next update.')}
          style={styles.actionButton}
        >
          Edit
        </Button>
      </Card.Actions>
    </Card>
  );

  const renderClientCard = ({ item }) => (
    <Card style={styles.clientCard} elevation={2}>
      <Card.Content>
        <View style={styles.clientHeader}>
          <Avatar.Image 
            source={{ uri: item.avatar }} 
            size={50} 
            style={styles.clientAvatar}
          />
          <View style={styles.clientInfo}>
            <Text style={[TEXT_STYLES.h3, styles.clientName]}>{item.name}</Text>
            <Text style={[TEXT_STYLES.caption, styles.clientPlan]}>
              {item.currentPlan || 'No active plan'}
            </Text>
            <Text style={[TEXT_STYLES.caption, styles.lastUpdate]}>
              Updated {item.lastUpdate}
            </Text>
          </View>
          <View style={styles.complianceContainer}>
            <Text style={styles.complianceLabel}>Compliance</Text>
            <Text style={[styles.complianceValue, 
              item.compliance >= 80 ? styles.goodCompliance : 
              item.compliance >= 60 ? styles.okCompliance : styles.poorCompliance
            ]}>
              {item.compliance}%
            </Text>
          </View>
        </View>

        <ProgressBar 
          progress={item.compliance / 100} 
          color={item.compliance >= 80 ? COLORS.success : 
                 item.compliance >= 60 ? '#FF9800' : COLORS.error}
          style={styles.progressBar}
        />

        <View style={styles.clientTags}>
          <Text style={styles.tagsTitle}>Goals & Restrictions:</Text>
          <View style={styles.tagsRow}>
            {[...item.goals, ...item.restrictions].map((tag, index) => (
              <Chip 
                key={index} 
                style={[styles.clientTag, 
                  item.restrictions.includes(tag) && styles.restrictionTag
                ]} 
                textStyle={styles.clientTagText}
              >
                {tag}
              </Chip>
            ))}
          </View>
        </View>
      </Card.Content>

      <Card.Actions>
        <Button 
          mode="outlined" 
          onPress={() => Alert.alert('Feature Coming Soon! 🚀', 'Progress tracking will be available in the next update.')}
        >
          Progress
        </Button>
        <Button 
          mode="contained" 
          onPress={() => {
            setSelectedClient(item);
            setShowAssignModal(true);
          }}
        >
          Assign Plan
        </Button>
      </Card.Actions>
    </Card>
  );

  const renderTemplateCard = ({ item }) => (
    <TouchableOpacity
      style={styles.templateCard}
      onPress={() => {
        setNewPlan(prev => ({
          ...prev,
          targetCalories: item.calories.toString(),
          macroSplit: {
            protein: item.protein,
            carbs: item.carbs,
            fats: item.fats
          }
        }));
        setShowCreateModal(true);
      }}
    >
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.templateGradient}
      >
        <Text style={styles.templateName}>{item.name}</Text>
        <Text style={styles.templateCalories}>{item.calories} cal</Text>
        <View style={styles.templateMacros}>
          <Text style={styles.templateMacro}>P: {item.protein}%</Text>
          <Text style={styles.templateMacro}>C: {item.carbs}%</Text>
          <Text style={styles.templateMacro}>F: {item.fats}%</Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderCreateModal = () => (
    <Portal>
      <Modal
        visible={showCreateModal}
        onDismiss={() => setShowCreateModal(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <ScrollView style={styles.modalContent}>
          <Text style={[TEXT_STYLES.h2, styles.modalTitle]}>Create Nutrition Plan 📝</Text>
          
          <TextInput
            label="Plan Name"
            value={newPlan.name}
            onChangeText={(text) => setNewPlan(prev => ({ ...prev, name: text }))}
            style={styles.input}
            mode="outlined"
          />
          
          <TextInput
            label="Description"
            value={newPlan.description}
            onChangeText={(text) => setNewPlan(prev => ({ ...prev, description: text }))}
            style={styles.input}
            mode="outlined"
            multiline
            numberOfLines={3}
          />
          
          <TextInput
            label="Target Calories"
            value={newPlan.targetCalories}
            onChangeText={(text) => setNewPlan(prev => ({ ...prev, targetCalories: text }))}
            style={styles.input}
            mode="outlined"
            keyboardType="numeric"
          />

          <Text style={styles.sectionTitle}>Macro Distribution</Text>
          <View style={styles.macroInputs}>
            <TextInput
              label="Protein %"
              value={newPlan.macroSplit.protein.toString()}
              onChangeText={(text) => setNewPlan(prev => ({
                ...prev,
                macroSplit: { ...prev.macroSplit, protein: parseInt(text) || 0 }
              }))}
              style={styles.macroInput}
              mode="outlined"
              keyboardType="numeric"
            />
            <TextInput
              label="Carbs %"
              value={newPlan.macroSplit.carbs.toString()}
              onChangeText={(text) => setNewPlan(prev => ({
                ...prev,
                macroSplit: { ...prev.macroSplit, carbs: parseInt(text) || 0 }
              }))}
              style={styles.macroInput}
              mode="outlined"
              keyboardType="numeric"
            />
            <TextInput
              label="Fats %"
              value={newPlan.macroSplit.fats.toString()}
              onChangeText={(text) => setNewPlan(prev => ({
                ...prev,
                macroSplit: { ...prev.macroSplit, fats: parseInt(text) || 0 }
              }))}
              style={styles.macroInput}
              mode="outlined"
              keyboardType="numeric"
            />
          </View>

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
              onPress={handleCreatePlan}
              style={styles.modalButton}
            >
              Create Plan
            </Button>
          </View>
        </ScrollView>
      </Modal>
    </Portal>
  );

  const renderAssignModal = () => (
    <Portal>
      <Modal
        visible={showAssignModal}
        onDismiss={() => setShowAssignModal(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <View style={styles.modalContent}>
          <Text style={[TEXT_STYLES.h2, styles.modalTitle]}>Assign Nutrition Plan 👥</Text>
          
          <Text style={styles.sectionTitle}>Select Plan</Text>
          <ScrollView horizontal style={styles.planSelector} showsHorizontalScrollIndicator={false}>
            {mockPlans.map((plan) => (
              <TouchableOpacity
                key={plan.id}
                style={[styles.planOption, selectedPlan?.id === plan.id && styles.selectedPlan]}
                onPress={() => setSelectedPlan(plan)}
              >
                <Text style={styles.planOptionName}>{plan.name}</Text>
                <Text style={styles.planOptionCals}>{plan.calories} cal</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={styles.sectionTitle}>Select Client</Text>
          <ScrollView style={styles.clientSelector} showsVerticalScrollIndicator={false}>
            {mockClients.map((client) => (
              <TouchableOpacity
                key={client.id}
                style={[styles.clientOption, selectedClient?.id === client.id && styles.selectedClient]}
                onPress={() => setSelectedClient(client)}
              >
                <Avatar.Image source={{ uri: client.avatar }} size={40} />
                <View style={styles.clientOptionInfo}>
                  <Text style={styles.clientOptionName}>{client.name}</Text>
                  <Text style={styles.clientOptionPlan}>{client.currentPlan || 'No plan'}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.modalActions}>
            <Button
              mode="outlined"
              onPress={() => setShowAssignModal(false)}
              style={styles.modalButton}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleAssignPlan}
              style={styles.modalButton}
            >
              Assign Plan
            </Button>
          </View>
        </View>
      </Modal>
    </Portal>
  );

  const renderContent = () => {
    const filteredData = activeTab === 'plans' ? mockPlans :
                        activeTab === 'clients' ? mockClients :
                        nutritionTemplates;
    
    const filtered = filteredData.filter(item => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (filtered.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Icon name="restaurant" size={80} color="#cccccc" />
          <Text style={[TEXT_STYLES.h3, styles.emptyTitle]}>
            No {activeTab} found
          </Text>
          <Text style={[TEXT_STYLES.body, styles.emptyMessage]}>
            {activeTab === 'plans' && "Create your first nutrition plan to get started!"}
            {activeTab === 'clients' && "Add clients to start managing their nutrition."}
            {activeTab === 'templates' && "Templates will help you create plans quickly."}
          </Text>
        </View>
      );
    }

    const renderItem = activeTab === 'plans' ? renderPlanCard :
                     activeTab === 'clients' ? renderClientCard :
                     renderTemplateCard;

    return (
      <FlatList
        data={filtered}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        numColumns={activeTab === 'templates' ? 2 : 1}
        columnWrapperStyle={activeTab === 'templates' ? styles.templateRow : null}
      />
    );
  };

  return (
    <View style={styles.container}>
      {renderHeader()}
      
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {renderTabBar()}
        
        <Searchbar
          placeholder={`Search ${activeTab}...`}
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
          iconColor={COLORS.primary}
        />

        {renderContent()}
      </Animated.View>

      <FAB
        style={styles.fab}
        icon="add"
        label="Create Plan"
        onPress={() => setShowCreateModal(true)}
        color="#ffffff"
      />

      {renderCreateModal()}
      {renderAssignModal()}
    </View>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight + 10,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.md,
  },
  headerContent: {
    flex: 1,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  headerTitle: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: '#ffffff',
    opacity: 0.9,
    marginTop: 4,
  },
  notificationButton: {
    position: 'relative',
    padding: SPACING.sm,
  },
  notificationBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: COLORS.error,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: SPACING.md,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    ...TEXT_STYLES.h2,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  statLabel: {
    ...TEXT_STYLES.caption,
    color: '#ffffff',
    opacity: 0.8,
    marginTop: 4,
  },
  content: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: `${COLORS.primary}15`,
  },
  tabLabel: {
    ...TEXT_STYLES.body,
    color: '#666',
    marginLeft: SPACING.xs,
  },
  activeTabLabel: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  searchbar: {
    margin: SPACING.md,
    elevation: 2,
  },
  listContainer: {
    padding: SPACING.md,
    paddingBottom: 100,
  },
  planCard: {
    marginBottom: SPACING.md,
    borderRadius: 12,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  planInfo: {
    flex: 1,
  },
  planName: {
    color: COLORS.text,
    marginBottom: 4,
  },
  planDescription: {
    color: '#666',
  },
  planActions: {
    alignItems: 'flex-end',
  },
  statusChip: {
    marginBottom: SPACING.xs,
  },
  activeChip: {
    backgroundColor: `${COLORS.success}15`,
  },
  draftChip: {
    backgroundColor: `${COLORS.warning}15`,
  },
  chipText: {
    fontSize: 12,
    textTransform: 'capitalize',
  },
  planMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: SPACING.sm,
    marginBottom: SPACING.md,
  },
  metric: {
    alignItems: 'center',
  },
  metricValue: {
    ...TEXT_STYLES.h3,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  metricLabel: {
    ...TEXT_STYLES.caption,
    color: '#666',
    marginTop: 2,
  },
  macroContainer: {
    marginBottom: SPACING.md,
  },
  macroTitle: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  macroBar: {
    height: 8,
    borderRadius: 4,
    flexDirection: 'row',
    overflow: 'hidden',
    marginBottom: SPACING.xs,
  },
  macroSegment: {
    height: '100%',
  },
  macroLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  macroLabel: {
    ...TEXT_STYLES.caption,
    color: '#666',
    fontWeight: '500',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: SPACING.sm,
  },
  tag: {
    marginRight: SPACING.xs,
    marginBottom: SPACING.xs,
    backgroundColor: `${COLORS.primary}10`,
  },
  tagText: {
    fontSize: 12,
    color: COLORS.primary,
  },
  actionButton: {
    marginLeft: SPACING.xs,
  },
  clientCard: {
    marginBottom: SPACING.md,
    borderRadius: 12,
  },
  clientHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  clientAvatar: {
    marginRight: SPACING.sm,
  },
  clientInfo: {
    flex: 1,
  },
  clientName: {
    color: COLORS.text,
    marginBottom: 2,
  },
  clientPlan: {
    color: COLORS.primary,
    fontWeight: '500',
  },
  lastUpdate: {
    color: '#666',
    marginTop: 2,
  },
  complianceContainer: {
    alignItems: 'center',
  },
  complianceLabel: {
    ...TEXT_STYLES.caption,
    color: '#666',
  },
  complianceValue: {
    ...TEXT_STYLES.h3,
    fontWeight: 'bold',
    marginTop: 2,
  },
  goodCompliance: {
    color: COLORS.success,
  },
  okCompliance: {
    color: '#FF9800',
  },
  poorCompliance: {
    color: COLORS.error,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    marginBottom: SPACING.md,
  },
  clientTags: {
    marginTop: SPACING.sm,
  },
  tagsTitle: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  clientTag: {
    marginRight: SPACING.xs,
    marginBottom: SPACING.xs,
    backgroundColor: `${COLORS.success}10`,
  },
  restrictionTag: {
    backgroundColor: `${COLORS.warning}10`,
  },
  clientTagText: {
    fontSize: 12,
  },
  templateRow: {
    justifyContent: 'space-between',
  },
  templateCard: {
    flex: 0.48,
    marginBottom: SPACING.md,
    borderRadius: 12,
    overflow: 'hidden',
  },
  templateGradient: {
    padding: SPACING.md,
    alignItems: 'center',
  },
  templateName: {
    ...TEXT_STYLES.h3,
    color: '#ffffff',
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  templateCalories: {
    ...TEXT_STYLES.body,
    color: '#ffffff',
    opacity: 0.9,
    marginBottom: SPACING.sm,
  },
  templateMacros: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  templateMacro: {
    ...TEXT_STYLES.caption,
    color: '#ffffff',
    fontWeight: '500',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
  },
  emptyTitle: {
    color: '#666',
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  emptyMessage: {
    color: '#999',
    textAlign: 'center',
    lineHeight: 22,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.md,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: SPACING.md,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: SPACING.lg,
    maxHeight: '80%',
  },
  modalTitle: {
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  input: {
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    ...TEXT_STYLES.h3,
    color: COLORS.text,
    marginBottom: SPACING.sm,
    marginTop: SPACING.md,
  },
  macroInputs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  macroInput: {
    flex: 0.3,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.xl,
  },
  modalButton: {
    flex: 0.45,
  },
  planSelector: {
    maxHeight: 120,
    marginBottom: SPACING.md,
  },
  planOption: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: SPACING.md,
    marginRight: SPACING.sm,
    minWidth: 120,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedPlan: {
    backgroundColor: `${COLORS.primary}15`,
    borderColor: COLORS.primary,
  },
  planOptionName: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
  },
  planOptionCals: {
    ...TEXT_STYLES.caption,
    color: '#666',
  },
  clientSelector: {
    maxHeight: 200,
    marginBottom: SPACING.md,
  },
  clientOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.sm,
    borderRadius: 8,
    marginBottom: SPACING.xs,
    backgroundColor: '#f8f9fa',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedClient: {
    backgroundColor: `${COLORS.primary}15`,
    borderColor: COLORS.primary,
  },
  clientOptionInfo: {
    marginLeft: SPACING.sm,
    flex: 1,
  },
  clientOptionName: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
  },
  clientOptionPlan: {
    ...TEXT_STYLES.caption,
    color: '#666',
    marginTop: 2,
  },
};

export default NutritionPlanning;