import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  RefreshControl,
  TouchableOpacity,
  Alert,
  Animated,
  Dimensions,
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
  Portal,
  Modal,
  TextInput,
  Searchbar,
  Divider,
} from 'react-native-paper';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';

// Design system constants
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4CAF50',
  error: '#f44336',
  warning: '#ff9800',
  info: '#2196F3',
  background: '#f5f5f5',
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
  h1: { fontSize: 28, fontWeight: 'bold', color: COLORS.text },
  h2: { fontSize: 24, fontWeight: 'bold', color: COLORS.text },
  h3: { fontSize: 20, fontWeight: '600', color: COLORS.text },
  body: { fontSize: 16, color: COLORS.text },
  bodySecondary: { fontSize: 14, color: COLORS.textSecondary },
  caption: { fontSize: 12, color: COLORS.textSecondary },
};

const { width: screenWidth } = Dimensions.get('window');

const MeasurementLog = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTimeframe, setSelectedTimeframe] = useState('3m');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedMeasurement, setSelectedMeasurement] = useState(null);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [viewMode, setViewMode] = useState('list'); // list, chart
  
  // New measurement form state
  const [newMeasurement, setNewMeasurement] = useState({
    type: '',
    value: '',
    unit: '',
    bodyPart: '',
    notes: '',
    date: new Date().toISOString().split('T')[0],
  });

  // Mock data - in real app, this would come from Redux store
  const [measurements, setMeasurements] = useState([
    {
      id: 1,
      type: 'Weight',
      value: 75.5,
      unit: 'kg',
      bodyPart: 'Full Body',
      category: 'weight',
      date: '2024-08-23',
      notes: 'Morning weight after workout',
      trend: 'up',
      change: '+0.5',
    },
    {
      id: 2,
      type: 'Height',
      value: 180,
      unit: 'cm',
      bodyPart: 'Full Body',
      category: 'dimension',
      date: '2024-08-01',
      notes: 'Annual measurement',
      trend: 'stable',
      change: '0',
    },
    {
      id: 3,
      type: 'Body Fat',
      value: 12.5,
      unit: '%',
      bodyPart: 'Full Body',
      category: 'composition',
      date: '2024-08-20',
      notes: 'DEXA scan results',
      trend: 'down',
      change: '-0.8',
    },
    {
      id: 4,
      type: 'Chest',
      value: 102,
      unit: 'cm',
      bodyPart: 'Chest',
      category: 'dimension',
      date: '2024-08-15',
      notes: 'Expanded measurement',
      trend: 'up',
      change: '+2',
    },
    {
      id: 5,
      type: 'Bicep',
      value: 38,
      unit: 'cm',
      bodyPart: 'Arms',
      category: 'dimension',
      date: '2024-08-10',
      notes: 'Flexed measurement',
      trend: 'up',
      change: '+1',
    },
    {
      id: 6,
      type: 'Waist',
      value: 82,
      unit: 'cm',
      bodyPart: 'Waist',
      category: 'dimension',
      date: '2024-08-12',
      notes: 'Natural waistline',
      trend: 'down',
      change: '-1.5',
    },
    {
      id: 7,
      type: 'Muscle Mass',
      value: 62.8,
      unit: 'kg',
      bodyPart: 'Full Body',
      category: 'composition',
      date: '2024-08-18',
      notes: 'InBody scan results',
      trend: 'up',
      change: '+1.2',
    },
  ]);

  const dispatch = useDispatch();
  const user = useSelector(state => state.auth?.user);

  const measurementCategories = [
    { key: 'all', label: 'All', icon: 'straighten', color: COLORS.primary },
    { key: 'weight', label: 'Weight', icon: 'monitor-weight', color: COLORS.info },
    { key: 'dimension', label: 'Dimensions', icon: 'straighten', color: COLORS.warning },
    { key: 'composition', label: 'Body Comp', icon: 'fitness-center', color: COLORS.success },
  ];

  const timeframes = [
    { key: '1m', label: '1M' },
    { key: '3m', label: '3M' },
    { key: '6m', label: '6M' },
    { key: '1y', label: '1Y' },
    { key: 'all', label: 'All' },
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
    }, 1500);
  }, []);

  const getTrendColor = (trend) => {
    switch (trend) {
      case 'up': return COLORS.success;
      case 'down': return COLORS.error;
      case 'stable': return COLORS.textSecondary;
      default: return COLORS.textSecondary;
    }
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up': return 'trending-up';
      case 'down': return 'trending-down';
      case 'stable': return 'trending-flat';
      default: return 'remove';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'weight': return 'monitor-weight';
      case 'dimension': return 'straighten';
      case 'composition': return 'fitness-center';
      default: return 'straighten';
    }
  };

  const getCategoryColor = (category) => {
    const cat = measurementCategories.find(c => c.key === category);
    return cat ? cat.color : COLORS.primary;
  };

  const filterMeasurements = () => {
    let filtered = measurements;
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(measurement => measurement.category === selectedCategory);
    }
    
    if (searchQuery) {
      filtered = filtered.filter(measurement =>
        measurement.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        measurement.bodyPart.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Filter by timeframe
    const now = new Date();
    const filterDate = new Date();
    
    switch (selectedTimeframe) {
      case '1m':
        filterDate.setMonth(now.getMonth() - 1);
        break;
      case '3m':
        filterDate.setMonth(now.getMonth() - 3);
        break;
      case '6m':
        filterDate.setMonth(now.getMonth() - 6);
        break;
      case '1y':
        filterDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        filterDate.setFullYear(2000); // Show all
    }
    
    if (selectedTimeframe !== 'all') {
      filtered = filtered.filter(measurement => new Date(measurement.date) >= filterDate);
    }
    
    return filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  const handleAddMeasurement = () => {
    if (!newMeasurement.type || !newMeasurement.value || !newMeasurement.unit) {
      Alert.alert('Validation Error', 'Please fill in all required fields');
      return;
    }

    // Determine category based on type
    let category = 'dimension';
    const type = newMeasurement.type.toLowerCase();
    if (type.includes('weight') || type.includes('mass')) {
      category = 'weight';
    } else if (type.includes('fat') || type.includes('muscle') || type.includes('body')) {
      category = 'composition';
    }

    const measurement = {
      id: Date.now(),
      ...newMeasurement,
      value: parseFloat(newMeasurement.value),
      category,
      trend: 'stable',
      change: '0',
    };

    setMeasurements(prev => [measurement, ...prev]);
    setNewMeasurement({
      type: '',
      value: '',
      unit: '',
      bodyPart: '',
      notes: '',
      date: new Date().toISOString().split('T')[0],
    });
    setShowAddModal(false);
    Alert.alert('Success', 'Measurement recorded successfully! 📏');
  };

  const renderMeasurementCard = (measurement) => (
    <TouchableOpacity
      key={measurement.id}
      onPress={() => {
        setSelectedMeasurement(measurement);
        setShowDetailModal(true);
      }}
      activeOpacity={0.7}
    >
      <Card style={styles.measurementCard}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleRow}>
              <Icon
                name={getCategoryIcon(measurement.category)}
                size={24}
                color={getCategoryColor(measurement.category)}
              />
              <View style={{ marginLeft: SPACING.sm, flex: 1 }}>
                <Text style={TEXT_STYLES.h3}>{measurement.type}</Text>
                <Text style={TEXT_STYLES.bodySecondary}>{measurement.bodyPart}</Text>
              </View>
            </View>
            <View style={styles.valueContainer}>
              <Text style={[TEXT_STYLES.h2, { color: getCategoryColor(measurement.category) }]}>
                {measurement.value}
              </Text>
              <Text style={[TEXT_STYLES.bodySecondary, { marginLeft: SPACING.xs }]}>
                {measurement.unit}
              </Text>
            </View>
          </View>
          
          <View style={styles.cardDetails}>
            <View style={styles.detailRow}>
              <Icon name="date-range" size={16} color={COLORS.textSecondary} />
              <Text style={[TEXT_STYLES.bodySecondary, { marginLeft: SPACING.xs }]}>
                {new Date(measurement.date).toLocaleDateString()}
              </Text>
            </View>
            
            {measurement.change !== '0' && (
              <View style={styles.trendRow}>
                <Icon
                  name={getTrendIcon(measurement.trend)}
                  size={16}
                  color={getTrendColor(measurement.trend)}
                />
                <Text style={[
                  TEXT_STYLES.bodySecondary,
                  { marginLeft: SPACING.xs, color: getTrendColor(measurement.trend) }
                ]}>
                  {measurement.change > 0 ? '+' : ''}{measurement.change} {measurement.unit}
                </Text>
              </View>
            )}
            
            {measurement.notes && (
              <Text style={[TEXT_STYLES.caption, { marginTop: SPACING.xs, fontStyle: 'italic' }]}>
                {measurement.notes}
              </Text>
            )}
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  const renderStats = () => {
    const totalMeasurements = measurements.length;
    const recentMeasurements = measurements.filter(m => {
      const measurementDate = new Date(m.date);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return measurementDate >= weekAgo;
    }).length;

    const improvements = measurements.filter(m => m.trend === 'up').length;
    const categories = [...new Set(measurements.map(m => m.category))].length;

    return (
      <View style={styles.statsContainer}>
        <Surface style={styles.statCard}>
          <Icon name="straighten" size={28} color={COLORS.primary} />
          <Text style={[TEXT_STYLES.h2, { color: COLORS.primary }]}>{totalMeasurements}</Text>
          <Text style={TEXT_STYLES.caption}>Total</Text>
        </Surface>
        <Surface style={styles.statCard}>
          <Icon name="update" size={28} color={COLORS.info} />
          <Text style={[TEXT_STYLES.h2, { color: COLORS.info }]}>{recentMeasurements}</Text>
          <Text style={TEXT_STYLES.caption}>This Week</Text>
        </Surface>
        <Surface style={styles.statCard}>
          <Icon name="trending-up" size={28} color={COLORS.success} />
          <Text style={[TEXT_STYLES.h2, { color: COLORS.success }]}>{improvements}</Text>
          <Text style={TEXT_STYLES.caption}>Improving</Text>
        </Surface>
        <Surface style={styles.statCard}>
          <Icon name="category" size={28} color={COLORS.warning} />
          <Text style={[TEXT_STYLES.h2, { color: COLORS.warning }]}>{categories}</Text>
          <Text style={TEXT_STYLES.caption}>Categories</Text>
        </Surface>
      </View>
    );
  };

  const renderCategories = () => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryContainer}>
      {measurementCategories.map(category => (
        <TouchableOpacity
          key={category.key}
          onPress={() => setSelectedCategory(category.key)}
          style={[
            styles.categoryChip,
            selectedCategory === category.key && {
              backgroundColor: category.color,
            }
          ]}
        >
          <Icon
            name={category.icon}
            size={20}
            color={selectedCategory === category.key ? COLORS.surface : category.color}
          />
          <Text
            style={[
              TEXT_STYLES.body,
              { marginLeft: SPACING.xs },
              selectedCategory === category.key && { color: COLORS.surface, fontWeight: '600' }
            ]}
          >
            {category.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderTimeframes = () => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.timeframeContainer}>
      {timeframes.map(timeframe => (
        <TouchableOpacity
          key={timeframe.key}
          onPress={() => setSelectedTimeframe(timeframe.key)}
          style={[
            styles.timeframeChip,
            selectedTimeframe === timeframe.key && styles.timeframeChipActive
          ]}
        >
          <Text
            style={[
              TEXT_STYLES.bodySecondary,
              selectedTimeframe === timeframe.key && { color: COLORS.surface, fontWeight: '600' }
            ]}
          >
            {timeframe.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderViewToggle = () => (
    <View style={styles.viewToggle}>
      <TouchableOpacity
        onPress={() => setViewMode('list')}
        style={[
          styles.viewButton,
          viewMode === 'list' && styles.viewButtonActive
        ]}
      >
        <Icon
          name="view-list"
          size={20}
          color={viewMode === 'list' ? COLORS.surface : COLORS.textSecondary}
        />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => setViewMode('chart')}
        style={[
          styles.viewButton,
          viewMode === 'chart' && styles.viewButtonActive
        ]}
      >
        <Icon
          name="show-chart"
          size={20}
          color={viewMode === 'chart' ? COLORS.surface : COLORS.textSecondary}
        />
      </TouchableOpacity>
    </View>
  );

  const renderChartView = () => {
    const filteredData = filterMeasurements();
    const chartData = filteredData
      .filter(m => m.type === 'Weight')
      .reverse()
      .map(m => ({
        date: new Date(m.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value: m.value,
      }));

    return (
      <Card style={styles.chartCard}>
        <Card.Content>
          <View style={styles.chartHeader}>
            <Text style={TEXT_STYLES.h3}>Weight Progress</Text>
            <Chip mode="outlined" compact>
              Last {selectedTimeframe === 'all' ? '12M' : selectedTimeframe}
            </Chip>
          </View>
          <View style={styles.chartContainer}>
            <Text style={[TEXT_STYLES.caption, { textAlign: 'center', marginTop: SPACING.lg }]}>
              📊 Chart visualization coming soon!
            </Text>
            <Text style={[TEXT_STYLES.bodySecondary, { textAlign: 'center', marginTop: SPACING.sm }]}>
              Interactive charts will show your measurement trends
            </Text>
          </View>
        </Card.Content>
      </Card>
    );
  };

  const renderAddModal = () => (
    <Portal>
      <Modal
        visible={showAddModal}
        onDismiss={() => setShowAddModal(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <BlurView intensity={20} style={styles.modalBlur}>
          <Card style={styles.modalCard}>
            <Card.Title
              title="Add Measurement 📏"
              titleStyle={TEXT_STYLES.h3}
              left={(props) => <Avatar.Icon {...props} icon="add" />}
              right={(props) => (
                <IconButton
                  {...props}
                  icon="close"
                  onPress={() => setShowAddModal(false)}
                />
              )}
            />
            <Card.Content>
              <ScrollView showsVerticalScrollIndicator={false}>
                <TextInput
                  label="Measurement Type *"
                  value={newMeasurement.type}
                  onChangeText={(text) => setNewMeasurement(prev => ({ ...prev, type: text }))}
                  mode="outlined"
                  style={styles.input}
                  placeholder="e.g., Weight, Height, Chest"
                />
                
                <View style={styles.inputRow}>
                  <TextInput
                    label="Value *"
                    value={newMeasurement.value}
                    onChangeText={(text) => setNewMeasurement(prev => ({ ...prev, value: text }))}
                    mode="outlined"
                    style={[styles.input, { flex: 2, marginRight: SPACING.sm }]}
                    keyboardType="numeric"
                    placeholder="0.0"
                  />
                  <TextInput
                    label="Unit *"
                    value={newMeasurement.unit}
                    onChangeText={(text) => setNewMeasurement(prev => ({ ...prev, unit: text }))}
                    mode="outlined"
                    style={[styles.input, { flex: 1 }]}
                    placeholder="kg, cm, %"
                  />
                </View>
                
                <TextInput
                  label="Body Part"
                  value={newMeasurement.bodyPart}
                  onChangeText={(text) => setNewMeasurement(prev => ({ ...prev, bodyPart: text }))}
                  mode="outlined"
                  style={styles.input}
                  placeholder="e.g., Full Body, Arms, Chest"
                />
                
                <TextInput
                  label="Date"
                  value={newMeasurement.date}
                  onChangeText={(text) => setNewMeasurement(prev => ({ ...prev, date: text }))}
                  mode="outlined"
                  style={styles.input}
                  placeholder="YYYY-MM-DD"
                />
                
                <TextInput
                  label="Notes"
                  value={newMeasurement.notes}
                  onChangeText={(text) => setNewMeasurement(prev => ({ ...prev, notes: text }))}
                  mode="outlined"
                  multiline
                  numberOfLines={3}
                  style={styles.input}
                  placeholder="Any additional notes about this measurement"
                />
              </ScrollView>
            </Card.Content>
            <Card.Actions>
              <Button onPress={() => setShowAddModal(false)}>Cancel</Button>
              <Button
                mode="contained"
                onPress={handleAddMeasurement}
                style={{ backgroundColor: COLORS.primary }}
              >
                Add Measurement
              </Button>
            </Card.Actions>
          </Card>
        </BlurView>
      </Modal>
    </Portal>
  );

  const renderDetailModal = () => (
    <Portal>
      <Modal
        visible={showDetailModal}
        onDismiss={() => setShowDetailModal(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <BlurView intensity={20} style={styles.modalBlur}>
          <Card style={styles.modalCard}>
            {selectedMeasurement && (
              <>
                <Card.Title
                  title={selectedMeasurement.type}
                  subtitle={`${selectedMeasurement.value} ${selectedMeasurement.unit}`}
                  titleStyle={TEXT_STYLES.h3}
                  left={(props) => (
                    <Avatar.Icon
                      {...props}
                      icon={getCategoryIcon(selectedMeasurement.category)}
                      style={{ backgroundColor: getCategoryColor(selectedMeasurement.category) }}
                    />
                  )}
                  right={(props) => (
                    <IconButton
                      {...props}
                      icon="close"
                      onPress={() => setShowDetailModal(false)}
                    />
                  )}
                />
                <Card.Content>
                  <ScrollView showsVerticalScrollIndicator={false}>
                    <View style={styles.detailSection}>
                      <Text style={TEXT_STYLES.h3}>Details</Text>
                      <View style={styles.detailGrid}>
                        <View style={styles.detailItem}>
                          <Text style={TEXT_STYLES.bodySecondary}>Body Part</Text>
                          <Text style={TEXT_STYLES.body}>{selectedMeasurement.bodyPart}</Text>
                        </View>
                        <View style={styles.detailItem}>
                          <Text style={TEXT_STYLES.bodySecondary}>Date</Text>
                          <Text style={TEXT_STYLES.body}>
                            {new Date(selectedMeasurement.date).toLocaleDateString()}
                          </Text>
                        </View>
                        <View style={styles.detailItem}>
                          <Text style={TEXT_STYLES.bodySecondary}>Category</Text>
                          <Chip
                            mode="outlined"
                            textStyle={{ color: getCategoryColor(selectedMeasurement.category) }}
                            style={{ borderColor: getCategoryColor(selectedMeasurement.category) }}
                          >
                            {selectedMeasurement.category}
                          </Chip>
                        </View>
                        {selectedMeasurement.change !== '0' && (
                          <View style={styles.detailItem}>
                            <Text style={TEXT_STYLES.bodySecondary}>Change</Text>
                            <View style={styles.changeIndicator}>
                              <Icon
                                name={getTrendIcon(selectedMeasurement.trend)}
                                size={20}
                                color={getTrendColor(selectedMeasurement.trend)}
                              />
                              <Text style={[
                                TEXT_STYLES.body,
                                { marginLeft: SPACING.xs, color: getTrendColor(selectedMeasurement.trend) }
                              ]}>
                                {selectedMeasurement.change > 0 ? '+' : ''}{selectedMeasurement.change} {selectedMeasurement.unit}
                              </Text>
                            </View>
                          </View>
                        )}
                      </View>
                    </View>

                    {selectedMeasurement.notes && (
                      <View style={styles.detailSection}>
                        <Text style={TEXT_STYLES.h3}>Notes</Text>
                        <Text style={TEXT_STYLES.body}>{selectedMeasurement.notes}</Text>
                      </View>
                    )}

                    <View style={styles.detailSection}>
                      <Text style={TEXT_STYLES.h3}>Quick Actions</Text>
                      <View style={styles.actionButtons}>
                        <Button
                          mode="outlined"
                          icon="edit"
                          onPress={() => {
                            Alert.alert('Feature Coming Soon', 'Edit measurement functionality will be available in the next update! ✏️');
                          }}
                          style={styles.actionButton}
                        >
                          Edit
                        </Button>
                        <Button
                          mode="outlined"
                          icon="content-copy"
                          onPress={() => {
                            Alert.alert('Feature Coming Soon', 'Duplicate measurement functionality will be available in the next update! 📋');
                          }}
                          style={styles.actionButton}
                        >
                          Duplicate
                        </Button>
                      </View>
                    </View>
                  </ScrollView>
                </Card.Content>
              </>
            )}
          </Card>
        </BlurView>
      </Modal>
    </Portal>
  );

  const filteredMeasurements = filterMeasurements();

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="transparent" translucent barStyle="light-content" />
      
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={[TEXT_STYLES.h1, { color: COLORS.surface }]}>Measurements 📏</Text>
          <Text style={[TEXT_STYLES.body, { color: COLORS.surface, opacity: 0.9 }]}>
            Track your physical progress
          </Text>
        </View>
      </LinearGradient>

      <Animated.ScrollView
        style={[styles.scrollView, { opacity: fadeAnim }]}
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
        {renderStats()}

        <View style={styles.searchSection}>
          <Searchbar
            placeholder="Search measurements..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchBar}
            iconColor={COLORS.primary}
          />
        </View>

        {renderCategories()}
        
        <View style={styles.controlsRow}>
          {renderTimeframes()}
          {renderViewToggle()}
        </View>

        <View style={styles.content}>
          {viewMode === 'chart' ? (
            renderChartView()
          ) : filteredMeasurements.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Card.Content style={styles.emptyContent}>
                <Icon name="straighten" size={64} color={COLORS.textSecondary} />
                <Text style={[TEXT_STYLES.h3, { marginTop: SPACING.md, textAlign: 'center' }]}>
                  {searchQuery || selectedCategory !== 'all' || selectedTimeframe !== 'all'
                    ? 'No measurements match your filters'
                    : 'No measurements recorded yet'}
                </Text>
                <Text style={[TEXT_STYLES.bodySecondary, { textAlign: 'center', marginTop: SPACING.sm }]}>
                  {searchQuery || selectedCategory !== 'all' || selectedTimeframe !== 'all'
                    ? 'Try adjusting your search or filters'
                    : 'Start tracking your physical progress! 💪'}
                </Text>
                {!searchQuery && selectedCategory === 'all' && selectedTimeframe === 'all' && (
                  <Button
                    mode="contained"
                    onPress={() => setShowAddModal(true)}
                    style={[styles.emptyButton, { backgroundColor: COLORS.primary }]}
                  >
                    Add First Measurement
                  </Button>
                )}
              </Card.Content>
            </Card>
          ) : (
            filteredMeasurements.map(renderMeasurementCard)
          )}
        </View>

        <View style={styles.bottomSpacing} />
      </Animated.ScrollView>

      <FAB
        style={[styles.fab, { backgroundColor: COLORS.primary }]}
        icon="add"
        onPress={() => setShowAddModal(true)}
        color={COLORS.surface}
      />

      {renderAddModal()}
      {renderDetailModal()}
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
    paddingHorizontal: SPACING.md,
  },
  headerContent: {
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
    marginTop: -SPACING.lg,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: COLORS.background,
    paddingTop: SPACING.lg,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.lg,
  },
  statCard: {
    flex: 1,
    marginHorizontal: SPACING.xs,
    padding: SPACING.md,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
  },
  searchSection: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  searchBar: {
    elevation: 0,
    backgroundColor: COLORS.surface,
  },
  categoryContainer: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginRight: SPACING.sm,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  timeframeContainer: {
    flex: 1,
    marginRight: SPACING.md,
  },
  timeframeChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginRight: SPACING.sm,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  timeframeChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: SPACING.xs,
  },
  viewButton: {
    padding: SPACING.sm,
    borderRadius: 16,
  },
  viewButtonActive: {
    backgroundColor: COLORS.primary,
  },
  content: {
    paddingHorizontal: SPACING.md,
  },
  measurementCard: {
    marginBottom: SPACING.md,
    borderRadius: 16,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  cardDetails: {
    marginTop: SPACING.sm,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  chartCard: {
    borderRadius: 16,
    elevation: 2,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  chartContainer: {
    height: 200,
    justifyContent: 'center',
  },
  emptyCard: {
    borderRadius: 16,
    elevation: 1,
  },
  emptyContent: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  emptyButton: {
    marginTop: SPACING.lg,
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
    paddingHorizontal: SPACING.md,
  },
  modalBlur: {
    flex: 1,
    justifyContent: 'center',
  },
  modalCard: {
    maxHeight: '80%',
    borderRadius: 24,
  },
  input: {
    marginBottom: SPACING.md,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailSection: {
    marginBottom: SPACING.lg,
  },
  detailGrid: {
    marginTop: SPACING.sm,
  },
  detailItem: {
    marginBottom: SPACING.md,
  },
  changeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: SPACING.md,
  },
  actionButton: {
    flex: 0.45,
  },
  bottomSpacing: {
    height: 100,
  },
});

export default MeasurementLog;