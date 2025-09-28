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
  Platform,
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
  SegmentedButtons,
  Divider,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { BlurView } from '../../../components/shared/BlurView';

// Import your established constants
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const { width, height } = Dimensions.get('window');

const NutritionPlanning = ({ navigation }) => {
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // State management
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('plans');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [nutritionPlans, setNutritionPlans] = useState([]);
  const [clients, setClients] = useState([]);
  const [mealTemplates, setMealTemplates] = useState([]);

  // Redux
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const isLoading = useSelector(state => state.nutrition?.isLoading || false);

  // Mock data for demonstration
  useEffect(() => {
    setNutritionPlans([
      {
        id: '1',
        name: 'Weight Loss Plan',
        description: 'High protein, low carb nutrition plan',
        clientCount: 8,
        calories: 1800,
        protein: 140,
        carbs: 90,
        fats: 60,
        status: 'active',
        createdDate: '2024-01-15',
        tags: ['Weight Loss', 'High Protein'],
      },
      {
        id: '2',
        name: 'Muscle Gain Plan',
        description: 'Balanced macros for muscle building',
        clientCount: 12,
        calories: 2400,
        protein: 180,
        carbs: 240,
        fats: 80,
        status: 'active',
        createdDate: '2024-01-10',
        tags: ['Muscle Gain', 'Bulking'],
      },
      {
        id: '3',
        name: 'Athletic Performance',
        description: 'Sports-specific nutrition protocol',
        clientCount: 5,
        calories: 2800,
        protein: 160,
        carbs: 350,
        fats: 90,
        status: 'draft',
        createdDate: '2024-01-20',
        tags: ['Performance', 'Athletes'],
      },
    ]);

    setClients([
      { id: '1', name: 'John Smith', avatar: null, currentPlan: 'Weight Loss Plan' },
      { id: '2', name: 'Sarah Johnson', avatar: null, currentPlan: 'Muscle Gain Plan' },
      { id: '3', name: 'Mike Wilson', avatar: null, currentPlan: null },
    ]);

    setMealTemplates([
      { id: '1', name: 'High Protein Breakfast', calories: 420, protein: 35 },
      { id: '2', name: 'Post-Workout Smoothie', calories: 280, protein: 25 },
      { id: '3', name: 'Lean Dinner', calories: 520, protein: 40 },
    ]);
  }, []);

  // Animations
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Refresh handler
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  // Filter plans based on search
  const filteredPlans = nutritionPlans.filter(plan =>
    plan.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    plan.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreatePlan = () => {
    Alert.alert(
      'Create Nutrition Plan',
      'Nutrition plan creation feature is in development. This will include AI-powered meal planning, macro calculations, and automated scheduling.',
      [{ text: 'Got it!', style: 'default' }]
    );
  };

  const handleEditPlan = (plan) => {
    Alert.alert(
      'Edit Plan',
      `Edit "${plan.name}" feature coming soon. This will include drag-and-drop meal planning, macro adjustments, and client customization.`,
      [{ text: 'Understood', style: 'default' }]
    );
  };

  const handleAssignPlan = (plan) => {
    Alert.alert(
      'Assign Plan',
      `Assign "${plan.name}" to clients feature in development. This will include bulk assignment, individualized modifications, and progress tracking.`,
      [{ text: 'OK', style: 'default' }]
    );
  };

  const renderNutritionPlan = (plan) => (
    <Animated.View
      key={plan.id}
      style={[
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
      ]}
    >
      <Card style={styles.planCard} mode="elevated">
        <Card.Content>
          <View style={styles.planHeader}>
            <View style={styles.planInfo}>
              <Text style={styles.planTitle}>{plan.name}</Text>
              <Text style={styles.planDescription}>{plan.description}</Text>
            </View>
            <Chip
              mode="outlined"
              style={[
                styles.statusChip,
                { backgroundColor: plan.status === 'active' ? COLORS.success + '20' : COLORS.secondary + '20' }
              ]}
              textStyle={{ color: plan.status === 'active' ? COLORS.success : COLORS.secondary }}
            >
              {plan.status.toUpperCase()}
            </Chip>
          </View>

          <View style={styles.macroRow}>
            <View style={styles.macroItem}>
              <Text style={styles.macroValue}>{plan.calories}</Text>
              <Text style={styles.macroLabel}>Calories</Text>
            </View>
            <View style={styles.macroItem}>
              <Text style={styles.macroValue}>{plan.protein}g</Text>
              <Text style={styles.macroLabel}>Protein</Text>
            </View>
            <View style={styles.macroItem}>
              <Text style={styles.macroValue}>{plan.carbs}g</Text>
              <Text style={styles.macroLabel}>Carbs</Text>
            </View>
            <View style={styles.macroItem}>
              <Text style={styles.macroValue}>{plan.fats}g</Text>
              <Text style={styles.macroLabel}>Fats</Text>
            </View>
          </View>

          <View style={styles.tagsContainer}>
            {plan.tags.map((tag, index) => (
              <Chip key={index} style={styles.tag} compact>
                {tag}
              </Chip>
            ))}
          </View>

          <View style={styles.planStats}>
            <View style={styles.statItem}>
              <Icon name="group" size={16} color={COLORS.primary} />
              <Text style={styles.statText}>{plan.clientCount} clients</Text>
            </View>
            <Text style={styles.createdDate}>Created {new Date(plan.createdDate).toLocaleDateString()}</Text>
          </View>
        </Card.Content>

        <Card.Actions>
          <Button
            mode="outlined"
            onPress={() => handleEditPlan(plan)}
            style={styles.actionButton}
          >
            <Icon name="edit" size={16} />
            Edit
          </Button>
          <Button
            mode="contained"
            onPress={() => handleAssignPlan(plan)}
            style={styles.actionButton}
          >
            <Icon name="person-add" size={16} />
            Assign
          </Button>
        </Card.Actions>
      </Card>
    </Animated.View>
  );

  const renderClientsList = () => (
    <View style={styles.clientsSection}>
      <Text style={styles.sectionTitle}>Client Nutrition Overview 📊</Text>
      {clients.map((client) => (
        <Card key={client.id} style={styles.clientCard} mode="outlined">
          <Card.Content style={styles.clientContent}>
            <Avatar.Text
              size={50}
              label={client.name.split(' ').map(n => n[0]).join('')}
              style={{ backgroundColor: COLORS.primary }}
            />
            <View style={styles.clientInfo}>
              <Text style={styles.clientName}>{client.name}</Text>
              <Text style={styles.clientPlan}>
                {client.currentPlan ? `📋 ${client.currentPlan}` : '⚠️ No plan assigned'}
              </Text>
            </View>
            <IconButton
              icon="chevron-right"
              size={20}
              onPress={() => Alert.alert('Client Details', 'Client nutrition details coming soon!')}
            />
          </Card.Content>
        </Card>
      ))}
    </View>
  );

  const renderMealTemplates = () => (
    <View style={styles.templatesSection}>
      <Text style={styles.sectionTitle}>Meal Templates 🍽️</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {mealTemplates.map((template) => (
          <Surface key={template.id} style={styles.templateCard} elevation={2}>
            <Text style={styles.templateName}>{template.name}</Text>
            <Text style={styles.templateCalories}>{template.calories} cal</Text>
            <Text style={styles.templateProtein}>{template.protein}g protein</Text>
            <Button
              mode="text"
              onPress={() => Alert.alert('Add Template', 'Template integration coming soon!')}
              style={styles.templateButton}
            >
              Add to Plan
            </Button>
          </Surface>
        ))}
      </ScrollView>
    </View>
  );

  const renderQuickStats = () => (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={styles.statsContainer}
    >
      <Text style={styles.statsTitle}>Nutrition Overview 📈</Text>
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{nutritionPlans.length}</Text>
          <Text style={styles.statLabel}>Active Plans</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{clients.filter(c => c.currentPlan).length}</Text>
          <Text style={styles.statLabel}>Assigned Clients</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{mealTemplates.length}</Text>
          <Text style={styles.statLabel}>Meal Templates</Text>
        </View>
      </View>
    </LinearGradient>
  );

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Nutrition Planning 🥗</Text>
          <Text style={styles.headerSubtitle}>Create and manage nutrition plans for your clients</Text>
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
        showsVerticalScrollIndicator={false}
      >
        <Searchbar
          placeholder="Search nutrition plans..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          inputStyle={styles.searchInput}
          iconColor={COLORS.primary}
        />

        <SegmentedButtons
          value={activeTab}
          onValueChange={setActiveTab}
          buttons={[
            { value: 'plans', label: '📋 Plans' },
            { value: 'clients', label: '👥 Clients' },
            { value: 'templates', label: '🍽️ Templates' },
          ]}
          style={styles.segmentedButtons}
        />

        {renderQuickStats()}

        {activeTab === 'plans' && (
          <View style={styles.plansSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Nutrition Plans 📝</Text>
              <Chip
                mode="outlined"
                style={styles.countChip}
              >
                {filteredPlans.length} plans
              </Chip>
            </View>
            {filteredPlans.map(renderNutritionPlan)}
          </View>
        )}

        {activeTab === 'clients' && renderClientsList()}

        {activeTab === 'templates' && renderMealTemplates()}

        <View style={styles.bottomSpacing} />
      </ScrollView>

      <FAB
        icon="add"
        style={styles.fab}
        onPress={handleCreatePlan}
        label="Create Plan"
        extended
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    ...TEXT_STYLES.title,
    color: 'white',
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    ...TEXT_STYLES.body,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.md,
    marginTop: -20,
  },
  searchBar: {
    marginBottom: SPACING.md,
    borderRadius: 12,
    elevation: 2,
  },
  searchInput: {
    ...TEXT_STYLES.body,
  },
  segmentedButtons: {
    marginBottom: SPACING.md,
  },
  statsContainer: {
    borderRadius: 16,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  statsTitle: {
    ...TEXT_STYLES.subtitle,
    color: 'white',
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statCard: {
    alignItems: 'center',
  },
  statNumber: {
    ...TEXT_STYLES.title,
    color: 'white',
    fontSize: 24,
  },
  statLabel: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
  plansSection: {
    marginBottom: SPACING.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    ...TEXT_STYLES.subtitle,
    color: COLORS.textPrimary,
  },
  countChip: {
    backgroundColor: COLORS.primary + '20',
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
    marginRight: SPACING.md,
  },
  planTitle: {
    ...TEXT_STYLES.subtitle,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  planDescription: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
  },
  statusChip: {
    marginTop: SPACING.xs,
  },
  macroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    paddingHorizontal: SPACING.md,
  },
  macroItem: {
    alignItems: 'center',
  },
  macroValue: {
    ...TEXT_STYLES.subtitle,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  macroLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: SPACING.md,
  },
  tag: {
    marginRight: SPACING.xs,
    marginBottom: SPACING.xs,
    backgroundColor: COLORS.primary + '15',
  },
  planStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    ...TEXT_STYLES.body,
    color: COLORS.textPrimary,
    marginLeft: SPACING.xs,
  },
  createdDate: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
  },
  actionButton: {
    marginHorizontal: SPACING.xs,
  },
  clientsSection: {
    marginBottom: SPACING.xl,
  },
  clientCard: {
    marginBottom: SPACING.sm,
    borderRadius: 12,
  },
  clientContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clientInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  clientName: {
    ...TEXT_STYLES.subtitle,
    color: COLORS.textPrimary,
  },
  clientPlan: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  templatesSection: {
    marginBottom: SPACING.xl,
  },
  templateCard: {
    width: 160,
    padding: SPACING.md,
    marginRight: SPACING.md,
    borderRadius: 12,
    backgroundColor: 'white',
  },
  templateName: {
    ...TEXT_STYLES.subtitle,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  templateCalories: {
    ...TEXT_STYLES.body,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  templateProtein: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  templateButton: {
    marginTop: SPACING.xs,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.md,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
  bottomSpacing: {
    height: 100,
  },
});

export default NutritionPlanning;