import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  StatusBar,
  RefreshControl,
  Alert,
  Dimensions,
  Animated,
  TouchableOpacity,
} from 'react-native';
import {
  Card,
  Text,
  Button,
  Chip,
  ProgressBar,
  Avatar,
  IconButton,
  FAB,
  Surface,
  Portal,
  Modal,
  TextInput,
  Searchbar,
  List,
} from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from 'expo-blur';

// Import your design system constants
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4CAF50',
  error: '#f44336',
  warning: '#ff9800',
  background: '#f8f9fa',
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
  h1: { fontSize: 28, fontWeight: 'bold' },
  h2: { fontSize: 24, fontWeight: 'bold' },
  h3: { fontSize: 20, fontWeight: '600' },
  body: { fontSize: 16 },
  caption: { fontSize: 12 },
};

const { width } = Dimensions.get('window');

const BudgetTracker = ({ navigation }) => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.user);
  
  // Animation values
  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(50);
  
  // State management
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [expenses, setExpenses] = useState([
    {
      id: 1,
      name: 'Nike Running Shoes',
      category: 'Equipment',
      amount: 120.00,
      date: '2024-03-15',
      description: 'New training shoes for cardio workouts',
      priority: 'high',
    },
    {
      id: 2,
      name: 'Protein Powder',
      category: 'Supplements',
      amount: 45.99,
      date: '2024-03-10',
      description: 'Monthly protein supplement',
      priority: 'medium',
    },
    {
      id: 3,
      name: 'Gym Membership',
      category: 'Membership',
      amount: 89.99,
      date: '2024-03-01',
      description: 'Monthly gym membership fee',
      priority: 'high',
    },
    {
      id: 4,
      name: 'Resistance Bands Set',
      category: 'Equipment',
      amount: 25.50,
      date: '2024-02-28',
      description: 'Home workout equipment',
      priority: 'low',
    },
  ]);
  
  const [budget, setBudget] = useState({
    monthly: 300,
    spent: 281.48,
    remaining: 18.52,
  });
  
  const [newExpense, setNewExpense] = useState({
    name: '',
    category: 'Equipment',
    amount: '',
    description: '',
    priority: 'medium',
  });

  const categories = ['All', 'Equipment', 'Supplements', 'Membership', 'Training', 'Nutrition'];
  const priorityColors = {
    high: COLORS.error,
    medium: COLORS.warning,
    low: COLORS.success,
  };

  useEffect(() => {
    // Entrance animations
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

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const handleAddExpense = () => {
    if (!newExpense.name || !newExpense.amount) {
      Alert.alert('Missing Information', 'Please fill in all required fields');
      return;
    }

    const expense = {
      id: Date.now(),
      ...newExpense,
      amount: parseFloat(newExpense.amount),
      date: new Date().toISOString().split('T')[0],
    };

    setExpenses(prev => [expense, ...prev]);
    setBudget(prev => ({
      ...prev,
      spent: prev.spent + expense.amount,
      remaining: prev.remaining - expense.amount,
    }));

    setNewExpense({
      name: '',
      category: 'Equipment',
      amount: '',
      description: '',
      priority: 'medium',
    });
    setShowAddModal(false);

    Alert.alert('Success! 🎉', 'Expense added to your budget tracker');
  };

  const filteredExpenses = expenses.filter(expense => {
    const matchesCategory = selectedCategory === 'All' || expense.category === selectedCategory;
    const matchesSearch = expense.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getBudgetStatus = () => {
    const percentage = (budget.spent / budget.monthly) * 100;
    if (percentage < 70) return { color: COLORS.success, status: 'On Track 💪' };
    if (percentage < 90) return { color: COLORS.warning, status: 'Watch Spending ⚠️' };
    return { color: COLORS.error, status: 'Over Budget 🚨' };
  };

  const budgetStatus = getBudgetStatus();

  const renderExpenseCard = (expense) => (
    <Card key={expense.id} style={styles.expenseCard} elevation={2}>
      <Card.Content>
        <View style={styles.expenseHeader}>
          <View style={styles.expenseInfo}>
            <Text style={[TEXT_STYLES.h3, { color: COLORS.text }]}>
              {expense.name}
            </Text>
            <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
              {expense.category} • {expense.date}
            </Text>
          </View>
          <View style={styles.expenseAmount}>
            <Text style={[TEXT_STYLES.h3, { color: COLORS.primary }]}>
              ${expense.amount.toFixed(2)}
            </Text>
            <Chip 
              mode="outlined"
              style={[styles.priorityChip, { borderColor: priorityColors[expense.priority] }]}
              textStyle={{ color: priorityColors[expense.priority], fontSize: 10 }}
            >
              {expense.priority}
            </Chip>
          </View>
        </View>
        {expense.description && (
          <Text style={[TEXT_STYLES.body, { color: COLORS.textSecondary, marginTop: SPACING.sm }]}>
            {expense.description}
          </Text>
        )}
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="transparent" translucent barStyle="light-content" />
      
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        style={styles.header}
      >
        <Animated.View 
          style={[
            styles.headerContent,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.headerTop}>
            <Text style={[TEXT_STYLES.h1, { color: 'white' }]}>
              Budget Tracker 💰
            </Text>
            <IconButton
              icon="settings"
              iconColor="white"
              size={24}
              onPress={() => Alert.alert('Settings', 'Budget settings coming soon!')}
            />
          </View>
          
          <Surface style={styles.budgetOverview} elevation={4}>
            <View style={styles.budgetStats}>
              <View style={styles.budgetItem}>
                <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
                  Monthly Budget
                </Text>
                <Text style={[TEXT_STYLES.h2, { color: COLORS.text }]}>
                  ${budget.monthly.toFixed(2)}
                </Text>
              </View>
              
              <View style={styles.budgetItem}>
                <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
                  Spent
                </Text>
                <Text style={[TEXT_STYLES.h2, { color: budgetStatus.color }]}>
                  ${budget.spent.toFixed(2)}
                </Text>
              </View>
              
              <View style={styles.budgetItem}>
                <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
                  Remaining
                </Text>
                <Text style={[TEXT_STYLES.h2, { color: budget.remaining >= 0 ? COLORS.success : COLORS.error }]}>
                  ${budget.remaining.toFixed(2)}
                </Text>
              </View>
            </View>
            
            <View style={styles.progressSection}>
              <View style={styles.progressHeader}>
                <Text style={[TEXT_STYLES.body, { color: COLORS.text }]}>
                  {budgetStatus.status}
                </Text>
                <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
                  {((budget.spent / budget.monthly) * 100).toFixed(1)}%
                </Text>
              </View>
              <ProgressBar
                progress={budget.spent / budget.monthly}
                color={budgetStatus.color}
                style={styles.progressBar}
              />
            </View>
          </Surface>
        </Animated.View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
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
        <View style={styles.searchSection}>
          <Searchbar
            placeholder="Search expenses..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchBar}
            iconColor={COLORS.primary}
          />
        </View>

        <View style={styles.categorySection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.categoryChips}>
              {categories.map((category) => (
                <Chip
                  key={category}
                  mode={selectedCategory === category ? 'flat' : 'outlined'}
                  selected={selectedCategory === category}
                  onPress={() => setSelectedCategory(category)}
                  style={[
                    styles.categoryChip,
                    selectedCategory === category && styles.selectedCategoryChip,
                  ]}
                  textStyle={{
                    color: selectedCategory === category ? 'white' : COLORS.primary,
                  }}
                >
                  {category}
                </Chip>
              ))}
            </View>
          </ScrollView>
        </View>

        <View style={styles.expensesSection}>
          <View style={styles.sectionHeader}>
            <Text style={[TEXT_STYLES.h3, { color: COLORS.text }]}>
              Recent Expenses
            </Text>
            <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
              {filteredExpenses.length} items
            </Text>
          </View>

          {filteredExpenses.length === 0 ? (
            <Card style={styles.emptyCard} elevation={1}>
              <Card.Content style={styles.emptyContent}>
                <Icon name="receipt-long" size={64} color={COLORS.border} />
                <Text style={[TEXT_STYLES.h3, { color: COLORS.textSecondary, marginTop: SPACING.md }]}>
                  No expenses found
                </Text>
                <Text style={[TEXT_STYLES.body, { color: COLORS.textSecondary, textAlign: 'center' }]}>
                  {searchQuery ? 'Try adjusting your search' : 'Add your first expense to get started'}
                </Text>
              </Card.Content>
            </Card>
          ) : (
            filteredExpenses.map(renderExpenseCard)
          )}
        </View>
      </ScrollView>

      <FAB
        style={styles.fab}
        icon="add"
        onPress={() => setShowAddModal(true)}
        color="white"
      />

      <Portal>
        <Modal
          visible={showAddModal}
          onDismiss={() => setShowAddModal(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <BlurView intensity={20} style={StyleSheet.absoluteFillObject} />
          <Surface style={styles.modalContent} elevation={8}>
            <View style={styles.modalHeader}>
              <Text style={[TEXT_STYLES.h2, { color: COLORS.text }]}>
                Add New Expense 📝
              </Text>
              <IconButton
                icon="close"
                onPress={() => setShowAddModal(false)}
              />
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <TextInput
                label="Expense Name *"
                value={newExpense.name}
                onChangeText={(text) => setNewExpense(prev => ({ ...prev, name: text }))}
                style={styles.input}
                mode="outlined"
                outlineColor={COLORS.border}
                activeOutlineColor={COLORS.primary}
              />

              <TextInput
                label="Amount *"
                value={newExpense.amount}
                onChangeText={(text) => setNewExpense(prev => ({ ...prev, amount: text }))}
                style={styles.input}
                mode="outlined"
                keyboardType="decimal-pad"
                left={<TextInput.Icon icon="attach-money" />}
                outlineColor={COLORS.border}
                activeOutlineColor={COLORS.primary}
              />

              <View style={styles.pickerSection}>
                <Text style={[TEXT_STYLES.body, { color: COLORS.text, marginBottom: SPACING.sm }]}>
                  Category
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.categoryPicker}>
                    {categories.slice(1).map((category) => (
                      <Chip
                        key={category}
                        mode={newExpense.category === category ? 'flat' : 'outlined'}
                        selected={newExpense.category === category}
                        onPress={() => setNewExpense(prev => ({ ...prev, category }))}
                        style={[
                          styles.pickerChip,
                          newExpense.category === category && styles.selectedPickerChip,
                        ]}
                        textStyle={{
                          color: newExpense.category === category ? 'white' : COLORS.primary,
                        }}
                      >
                        {category}
                      </Chip>
                    ))}
                  </View>
                </ScrollView>
              </View>

              <View style={styles.pickerSection}>
                <Text style={[TEXT_STYLES.body, { color: COLORS.text, marginBottom: SPACING.sm }]}>
                  Priority
                </Text>
                <View style={styles.priorityPicker}>
                  {['low', 'medium', 'high'].map((priority) => (
                    <Chip
                      key={priority}
                      mode={newExpense.priority === priority ? 'flat' : 'outlined'}
                      selected={newExpense.priority === priority}
                      onPress={() => setNewExpense(prev => ({ ...prev, priority }))}
                      style={[
                        styles.priorityChipLarge,
                        { backgroundColor: newExpense.priority === priority ? priorityColors[priority] : 'transparent' }
                      ]}
                      textStyle={{
                        color: newExpense.priority === priority ? 'white' : priorityColors[priority],
                        textTransform: 'capitalize',
                      }}
                    >
                      {priority}
                    </Chip>
                  ))}
                </View>
              </View>

              <TextInput
                label="Description (Optional)"
                value={newExpense.description}
                onChangeText={(text) => setNewExpense(prev => ({ ...prev, description: text }))}
                style={styles.input}
                mode="outlined"
                multiline
                numberOfLines={3}
                outlineColor={COLORS.border}
                activeOutlineColor={COLORS.primary}
              />

              <View style={styles.modalActions}>
                <Button
                  mode="outlined"
                  onPress={() => setShowAddModal(false)}
                  style={styles.cancelButton}
                >
                  Cancel
                </Button>
                <Button
                  mode="contained"
                  onPress={handleAddExpense}
                  style={styles.addButton}
                  buttonColor={COLORS.primary}
                >
                  Add Expense
                </Button>
              </View>
            </ScrollView>
          </Surface>
        </Modal>
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
    paddingBottom: SPACING.xl,
    paddingHorizontal: SPACING.lg,
  },
  headerContent: {
    flex: 1,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  budgetOverview: {
    borderRadius: 16,
    padding: SPACING.lg,
    backgroundColor: COLORS.surface,
  },
  budgetStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  budgetItem: {
    alignItems: 'center',
    flex: 1,
  },
  progressSection: {
    marginTop: SPACING.md,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.border,
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
    elevation: 2,
    backgroundColor: COLORS.surface,
  },
  categorySection: {
    marginBottom: SPACING.lg,
  },
  categoryChips: {
    flexDirection: 'row',
    paddingVertical: SPACING.sm,
  },
  categoryChip: {
    marginRight: SPACING.sm,
    borderColor: COLORS.primary,
  },
  selectedCategoryChip: {
    backgroundColor: COLORS.primary,
  },
  expensesSection: {
    marginBottom: 100,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  expenseCard: {
    marginBottom: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
  },
  expenseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  expenseInfo: {
    flex: 1,
    marginRight: SPACING.md,
  },
  expenseAmount: {
    alignItems: 'flex-end',
  },
  priorityChip: {
    marginTop: SPACING.xs,
    height: 24,
  },
  emptyCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
  },
  emptyContent: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
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
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  modalContent: {
    width: width - SPACING.xl,
    maxHeight: '80%',
    borderRadius: 16,
    padding: SPACING.lg,
    backgroundColor: COLORS.surface,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  input: {
    marginBottom: SPACING.md,
    backgroundColor: COLORS.surface,
  },
  pickerSection: {
    marginBottom: SPACING.lg,
  },
  categoryPicker: {
    flexDirection: 'row',
  },
  pickerChip: {
    marginRight: SPACING.sm,
    borderColor: COLORS.primary,
  },
  selectedPickerChip: {
    backgroundColor: COLORS.primary,
  },
  priorityPicker: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  priorityChipLarge: {
    flex: 1,
    marginHorizontal: SPACING.xs,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.lg,
  },
  cancelButton: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  addButton: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
});

export default BudgetTracker;