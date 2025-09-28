import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  ScrollView,
  Text,
  StatusBar,
  Alert,
  Animated,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
  FlatList,
  Modal,
  Vibration,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
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
  Switch,
  Divider,
} from 'react-native-paper';
import { BlurView } from '@react-native-blur/blur';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';

// Import design system constants
import { COLORS, SPACING, TEXT_STYLES } from '../../constants/theme';

const { width, height } = Dimensions.get('window');

const EquipmentMaintenance = ({ navigation }) => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const userProgress = useSelector(state => state.progress.equipmentMaintenance);
  
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [completedTasks, setCompletedTasks] = useState(new Set());
  const [myEquipment, setMyEquipment] = useState([]);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [maintenanceStreak, setMaintenanceStreak] = useState(3);
  const [totalPoints, setTotalPoints] = useState(85);
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [activeTab, setActiveTab] = useState('tasks'); // 'tasks', 'schedule', 'myequipment'
  
  const scrollY = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // Maintenance task categories
  const maintenanceCategories = [
    { id: 'all', name: 'All Tasks', icon: 'build', color: COLORS.primary },
    { id: 'daily', name: 'Daily 📅', icon: 'today', color: '#4CAF50' },
    { id: 'weekly', name: 'Weekly 📆', icon: 'date-range', color: '#FF9800' },
    { id: 'monthly', name: 'Monthly 🗓️', icon: 'event', color: '#2196F3' },
    { id: 'seasonal', name: 'Seasonal 🍂', icon: 'nature', color: '#9C27B0' },
  ];

  // Maintenance tasks data
  const maintenanceTasks = [
    {
      id: 1,
      title: 'Clean Your Boots',
      equipment: 'Football Boots',
      category: 'daily',
      frequency: 'After each training',
      difficulty: 'easy',
      timeRequired: '5 minutes',
      description: 'Remove dirt and grass from your football boots',
      steps: [
        'Remove loose dirt with a soft brush',
        'Wipe with a damp cloth',
        'Let them air dry naturally',
        'Stuff with newspaper to maintain shape'
      ],
      tips: [
        'Never put boots in the washing machine',
        'Clean studs with a small stick or brush',
        'Dry away from direct heat sources'
      ],
      icon: '👟',
      points: 5,
      importance: 'high',
      benefits: 'Keeps boots in good condition and prevents bad smells',
      funFact: 'Professional players clean their boots after every match!',
      warningSign: 'Strong smell or visible mud buildup',
    },
    {
      id: 2,
      title: 'Wash Training Kit',
      equipment: 'Jerseys & Shorts',
      category: 'daily',
      frequency: 'After each use',
      difficulty: 'easy',
      timeRequired: '10 minutes',
      description: 'Keep your training clothes clean and fresh',
      steps: [
        'Turn clothes inside out before washing',
        'Use cold water to preserve colors',
        'Air dry instead of using a dryer',
        'Fold neatly to prevent wrinkles'
      ],
      tips: [
        'Wash immediately after training when possible',
        'Use sports detergent for best results',
        'Never use fabric softener on technical fabrics'
      ],
      icon: '👕',
      points: 5,
      importance: 'high',
      benefits: 'Prevents bacteria buildup and keeps you comfortable',
      funFact: 'Technical fabrics work best when kept clean!',
      warningSign: 'Persistent odors even after washing',
    },
    {
      id: 3,
      title: 'Check Equipment Safety',
      equipment: 'Safety Gear',
      category: 'weekly',
      frequency: 'Every week',
      difficulty: 'medium',
      timeRequired: '15 minutes',
      description: 'Inspect all safety equipment for damage',
      steps: [
        'Check helmets for cracks or dents',
        'Inspect pads for wear and tear',
        'Test all straps and buckles',
        'Replace any damaged items immediately'
      ],
      tips: [
        'Never use damaged safety equipment',
        'Ask a parent or coach to help with inspection',
        'Keep a maintenance log'
      ],
      icon: '🛡️',
      points: 15,
      importance: 'critical',
      benefits: 'Ensures your safety during training and games',
      funFact: 'A helmet inspection can save you from serious injury!',
      warningSign: 'Any visible cracks, loose parts, or damaged straps',
    },
    {
      id: 4,
      title: 'Tennis Racket String Check',
      equipment: 'Tennis Racket',
      category: 'weekly',
      frequency: 'Every week',
      difficulty: 'medium',
      timeRequired: '10 minutes',
      description: 'Check and maintain tennis racket strings',
      steps: [
        'Look for frayed or broken strings',
        'Check string tension by pressing center',
        'Clean the grip with a damp cloth',
        'Store in a racket case when not in use'
      ],
      tips: [
        'Restring every 3-6 months for regular players',
        'Lower tension = more power, higher = more control',
        'Use overgrips to extend handle life'
      ],
      icon: '🎾',
      points: 10,
      importance: 'medium',
      benefits: 'Better performance and prevents racket damage',
      funFact: 'Professional players change strings before every match!',
      warningSign: 'Loose, frayed, or broken strings',
    },
    {
      id: 5,
      title: 'Swimming Gear Deep Clean',
      equipment: 'Swimming Equipment',
      category: 'weekly',
      frequency: 'Every week',
      difficulty: 'easy',
      timeRequired: '20 minutes',
      description: 'Deep clean goggles, swimsuit, and accessories',
      steps: [
        'Rinse goggles with fresh water',
        'Clean anti-fog coating gently',
        'Wash swimsuit in cold water',
        'Air dry all equipment completely'
      ],
      tips: [
        'Never touch the inside of goggle lenses',
        'Use mild soap for stubborn chlorine buildup',
        'Rotate between multiple swimsuits'
      ],
      icon: '🏊',
      points: 10,
      importance: 'high',
      benefits: 'Prevents eye irritation and extends equipment life',
      funFact: 'Chlorine can damage equipment if not cleaned properly!',
      warningSign: 'Cloudy goggles or strong chlorine smell',
    },
    {
      id: 6,
      title: 'Ball Pressure Check',
      equipment: 'Sports Balls',
      category: 'monthly',
      frequency: 'Every month',
      difficulty: 'medium',
      timeRequired: '15 minutes',
      description: 'Check and maintain proper ball pressure',
      steps: [
        'Test bounce height against regulation',
        'Use a pressure gauge if available',
        'Add air if needed with proper pump',
        'Check for damage or worn areas'
      ],
      tips: [
        'Learn proper pressure for your sport',
        'Store balls in a cool, dry place',
        'Avoid over-inflating which can damage balls'
      ],
      icon: '⚽',
      points: 15,
      importance: 'medium',
      benefits: 'Ensures consistent performance and fair play',
      funFact: 'A football should bounce between 125-155cm when dropped from 2m!',
      warningSign: 'Ball feels too soft or hard, or has visible damage',
    },
    {
      id: 7,
      title: 'Equipment Storage Audit',
      equipment: 'All Equipment',
      category: 'monthly',
      frequency: 'Every month',
      difficulty: 'easy',
      timeRequired: '30 minutes',
      description: 'Organize and properly store all your sports equipment',
      steps: [
        'Clean out your sports bag completely',
        'Check all equipment for damage',
        'Organize by sport and frequency of use',
        'Ensure proper ventilation for drying'
      ],
      tips: [
        'Use mesh bags for wet/dirty items',
        'Keep a checklist of all your equipment',
        'Label everything with your name'
      ],
      icon: '📦',
      points: 20,
      importance: 'medium',
      benefits: 'Prevents loss and extends equipment lifespan',
      funFact: 'Proper storage can double your equipment\'s lifespan!',
      warningSign: 'Equipment scattered or stored in damp areas',
    },
    {
      id: 8,
      title: 'Seasonal Equipment Review',
      equipment: 'All Seasonal Gear',
      category: 'seasonal',
      frequency: 'Every 3 months',
      difficulty: 'medium',
      timeRequired: '45 minutes',
      description: 'Complete review and preparation for new season',
      steps: [
        'Assess what equipment needs replacement',
        'Deep clean all items',
        'Check sizing for growing athletes',
        'Plan equipment budget with parents'
      ],
      tips: [
        'Start preparation 1 month before season',
        'Keep receipts for warranty claims',
        'Consider equipment swaps with teammates'
      ],
      icon: '🔄',
      points: 30,
      importance: 'high',
      benefits: 'Ensures you\'re ready for the new season',
      funFact: 'Many injuries happen due to poorly maintained equipment!',
      warningSign: 'Equipment hasn\'t been checked in 3+ months',
    },
  ];

  // My Equipment tracking
  const myEquipmentData = [
    {
      id: 1,
      name: 'Nike Football Boots',
      type: 'Football Boots',
      purchaseDate: '2024-08-15',
      condition: 'Good',
      lastMaintenance: '2025-08-27',
      nextMaintenance: '2025-08-30',
      maintenanceScore: 85,
      needsAttention: false,
      icon: '👟',
    },
    {
      id: 2,
      name: 'Adidas Shin Guards',
      type: 'Safety Equipment',
      purchaseDate: '2024-08-15',
      condition: 'Excellent',
      lastMaintenance: '2025-08-25',
      nextMaintenance: '2025-09-01',
      maintenanceScore: 95,
      needsAttention: false,
      icon: '🛡️',
    },
    {
      id: 3,
      name: 'Wilson Tennis Racket',
      type: 'Tennis Equipment',
      purchaseDate: '2024-07-10',
      condition: 'Needs Attention',
      lastMaintenance: '2025-08-20',
      nextMaintenance: '2025-08-29',
      maintenanceScore: 60,
      needsAttention: true,
      icon: '🎾',
    },
  ];

  // Filter tasks based on search and category
  const filteredTasks = maintenanceTasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.equipment.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || task.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  useEffect(() => {
    // Animate screen entrance
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
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // Simulate API refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const completeTask = (taskId) => {
    const task = maintenanceTasks.find(t => t.id === taskId);
    const newCompleted = new Set(completedTasks);
    
    if (newCompleted.has(taskId)) {
      newCompleted.delete(taskId);
      setTotalPoints(prev => prev - task.points);
    } else {
      newCompleted.add(taskId);
      setTotalPoints(prev => prev + task.points);
      Vibration.vibrate(100);
      
      // Check for streak bonus
      if (newCompleted.size % 5 === 0) {
        setShowRewardModal(true);
        setMaintenanceStreak(prev => prev + 1);
      }
    }
    setCompletedTasks(newCompleted);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return '#4CAF50';
      case 'medium': return '#FF9800';
      case 'hard': return '#F44336';
      default: return COLORS.primary;
    }
  };

  const getImportanceColor = (importance) => {
    switch (importance) {
      case 'critical': return '#F44336';
      case 'high': return '#FF9800';
      case 'medium': return '#2196F3';
      case 'low': return '#4CAF50';
      default: return COLORS.primary;
    }
  };

  const renderMaintenanceTask = ({ item }) => {
    const isCompleted = completedTasks.has(item.id);
    const categoryInfo = maintenanceCategories.find(cat => cat.id === item.category);
    
    return (
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
          marginBottom: SPACING.md,
        }}
      >
        <Card
          style={{
            marginHorizontal: SPACING.sm,
            elevation: 4,
            borderRadius: 16,
            backgroundColor: isCompleted ? '#E8F5E8' : '#FFFFFF',
            borderLeftWidth: 4,
            borderLeftColor: getImportanceColor(item.importance),
          }}
          onPress={() => {
            setSelectedTask(item);
            setShowTaskModal(true);
          }}
        >
          <Card.Content style={{ padding: SPACING.md }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: SPACING.sm }}>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.xs }}>
                  <Text style={{ fontSize: 24, marginRight: SPACING.sm }}>{item.icon}</Text>
                  <Text style={[TEXT_STYLES.h3, { flex: 1, color: isCompleted ? '#4CAF50' : '#333' }]}>
                    {item.title}
                  </Text>
                  {isCompleted && (
                    <Surface style={{
                      backgroundColor: '#4CAF50',
                      borderRadius: 12,
                      padding: 4,
                    }}>
                      <Icon name="check" size={16} color="#FFFFFF" />
                    </Surface>
                  )}
                </View>
                
                <Text style={[TEXT_STYLES.caption, { color: '#666', marginBottom: SPACING.xs }]}>
                  {item.equipment} • {item.frequency}
                </Text>
                
                <Text style={[TEXT_STYLES.body, { color: '#666', marginBottom: SPACING.sm }]}>
                  {item.description}
                </Text>
              </View>
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm }}>
              <View style={{ flexDirection: 'row', gap: SPACING.xs }}>
                <Chip
                  mode="outlined"
                  style={{ backgroundColor: getDifficultyColor(item.difficulty) + '20' }}
                  textStyle={{ color: getDifficultyColor(item.difficulty), fontSize: 10 }}
                  compact
                >
                  {item.difficulty.toUpperCase()}
                </Chip>
                <Chip
                  mode="outlined"
                  style={{ backgroundColor: categoryInfo?.color + '20' }}
                  textStyle={{ color: categoryInfo?.color, fontSize: 10 }}
                  compact
                >
                  {item.category.toUpperCase()}
                </Chip>
              </View>
              
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Icon name="schedule" size={14} color="#666" />
                <Text style={[TEXT_STYLES.caption, { marginLeft: 4, color: '#666' }]}>
                  {item.timeRequired}
                </Text>
              </View>
            </View>

            <Divider style={{ marginVertical: SPACING.sm }} />

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Icon name="star" size={16} color="#FFD700" />
                <Text style={[TEXT_STYLES.caption, { marginLeft: 4, color: '#FFD700', fontWeight: 'bold' }]}>
                  {item.points} pts
                </Text>
              </View>

              <Button
                mode={isCompleted ? "contained" : "outlined"}
                onPress={() => completeTask(item.id)}
                style={{ borderRadius: 20 }}
                buttonColor={isCompleted ? '#4CAF50' : undefined}
                textColor={isCompleted ? '#FFFFFF' : COLORS.primary}
                compact
              >
                {isCompleted ? '✓ Done' : 'Complete'}
              </Button>
            </View>
          </Card.Content>
        </Card>
      </Animated.View>
    );
  };

  const renderMyEquipmentItem = ({ item }) => {
    const isOverdue = new Date(item.nextMaintenance) < new Date();
    
    return (
      <Card
        style={{
          marginHorizontal: SPACING.sm,
          marginBottom: SPACING.md,
          elevation: 4,
          borderRadius: 16,
          backgroundColor: item.needsAttention ? '#FFEBEE' : '#FFFFFF',
          borderLeftWidth: 4,
          borderLeftColor: item.needsAttention ? '#F44336' : '#4CAF50',
        }}
      >
        <Card.Content style={{ padding: SPACING.md }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              <Text style={{ fontSize: 24, marginRight: SPACING.sm }}>{item.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={[TEXT_STYLES.h3, { color: '#333' }]}>{item.name}</Text>
                <Text style={[TEXT_STYLES.caption, { color: '#666' }]}>{item.type}</Text>
              </View>
            </View>
            {item.needsAttention && (
              <Surface style={{
                backgroundColor: '#F44336',
                borderRadius: 12,
                padding: 4,
              }}>
                <Icon name="warning" size={16} color="#FFFFFF" />
              </Surface>
            )}
          </View>

          <View style={{ marginBottom: SPACING.sm }}>
            <Text style={[TEXT_STYLES.caption, { marginBottom: SPACING.xs }]}>
              Condition Score: {item.maintenanceScore}%
            </Text>
            <ProgressBar
              progress={item.maintenanceScore / 100}
              color={item.maintenanceScore > 80 ? '#4CAF50' : item.maintenanceScore > 60 ? '#FF9800' : '#F44336'}
              style={{ height: 6, borderRadius: 3 }}
            />
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.sm }}>
            <View>
              <Text style={[TEXT_STYLES.caption, { color: '#666' }]}>Last Maintained</Text>
              <Text style={[TEXT_STYLES.body, { fontSize: 12 }]}>{item.lastMaintenance}</Text>
            </View>
            <View>
              <Text style={[TEXT_STYLES.caption, { color: isOverdue ? '#F44336' : '#666' }]}>Next Due</Text>
              <Text style={[TEXT_STYLES.body, { fontSize: 12, color: isOverdue ? '#F44336' : '#333' }]}>
                {item.nextMaintenance}
              </Text>
            </View>
          </View>

          <Button
            mode={item.needsAttention ? "contained" : "outlined"}
            onPress={() => {
              Alert.alert(
                "Maintenance Action",
                `Schedule maintenance for ${item.name}?`,
                [
                  { text: "Later", style: "cancel" },
                  { text: "Schedule", onPress: () => {
                    Alert.alert("Success! 🎉", "Maintenance reminder set!");
                    Vibration.vibrate(100);
                  }}
                ]
              );
            }}
            style={{ borderRadius: 20 }}
            buttonColor={item.needsAttention ? '#F44336' : undefined}
            textColor={item.needsAttention ? '#FFFFFF' : COLORS.primary}
            compact
          >
            {item.needsAttention ? 'Needs Attention!' : 'Schedule Maintenance'}
          </Button>
        </Card.Content>
      </Card>
    );
  };

  const renderTaskModal = () => {
    if (!selectedTask) return null;

    return (
      <Modal
        visible={showTaskModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowTaskModal(false)}
      >
        <View style={{ flex: 1, backgroundColor: '#F5F5F5' }}>
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            style={{ paddingTop: 50, paddingBottom: SPACING.lg }}
          >
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingHorizontal: SPACING.lg,
            }}>
              <Text style={[TEXT_STYLES.h2, { color: '#FFFFFF', flex: 1 }]}>
                {selectedTask.title}
              </Text>
              <IconButton
                icon="close"
                iconColor="#FFFFFF"
                size={24}
                onPress={() => setShowTaskModal(false)}
              />
            </View>
          </LinearGradient>

          <ScrollView contentContainerStyle={{ padding: SPACING.lg }}>
            {/* Task Overview */}
            <Card style={{ marginBottom: SPACING.lg, elevation: 4 }}>
              <Card.Content style={{ padding: SPACING.lg }}>
                <View style={{ alignItems: 'center', marginBottom: SPACING.lg }}>
                  <Text style={{ fontSize: 60, marginBottom: SPACING.sm }}>{selectedTask.icon}</Text>
                  <Text style={[TEXT_STYLES.h3, { textAlign: 'center', color: COLORS.primary }]}>
                    {selectedTask.equipment}
                  </Text>
                </View>

                <Surface style={{
                  padding: SPACING.md,
                  borderRadius: 12,
                  backgroundColor: getImportanceColor(selectedTask.importance) + '20',
                  marginBottom: SPACING.lg,
                }}>
                  <Text style={[TEXT_STYLES.body, { color: getImportanceColor(selectedTask.importance), textAlign: 'center', fontWeight: 'bold' }]}>
                    Importance: {selectedTask.importance.toUpperCase()}
                  </Text>
                </Surface>

                <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: SPACING.lg }}>
                  <View style={{ alignItems: 'center' }}>
                    <Icon name="schedule" size={24} color="#666" />
                    <Text style={[TEXT_STYLES.caption, { marginTop: 4 }]}>Time</Text>
                    <Text style={[TEXT_STYLES.body, { fontWeight: 'bold' }]}>{selectedTask.timeRequired}</Text>
                  </View>
                  <View style={{ alignItems: 'center' }}>
                    <Icon name="fitness-center" size={24} color="#666" />
                    <Text style={[TEXT_STYLES.caption, { marginTop: 4 }]}>Difficulty</Text>
                    <Text style={[TEXT_STYLES.body, { fontWeight: 'bold', color: getDifficultyColor(selectedTask.difficulty) }]}>
                      {selectedTask.difficulty}
                    </Text>
                  </View>
                  <View style={{ alignItems: 'center' }}>
                    <Icon name="star" size={24} color="#FFD700" />
                    <Text style={[TEXT_STYLES.caption, { marginTop: 4 }]}>Points</Text>
                    <Text style={[TEXT_STYLES.body, { fontWeight: 'bold', color: '#FFD700' }]}>{selectedTask.points}</Text>
                  </View>
                </View>
              </Card.Content>
            </Card>

            {/* Steps */}
            <Card style={{ marginBottom: SPACING.lg, elevation: 4 }}>
              <Card.Content style={{ padding: SPACING.lg }}>
                <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md, color: COLORS.primary }]}>
                  Step-by-Step Guide 📋
                </Text>
                {selectedTask.steps.map((step, index) => (
                  <View key={index} style={{
                    flexDirection: 'row',
                    alignItems: 'flex-start',
                    marginBottom: SPACING.sm,
                    paddingVertical: SPACING.xs,
                  }}>
                    <Surface style={{
                      width: 24,
                      height: 24,
                      borderRadius: 12,
                      backgroundColor: COLORS.primary,
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginRight: SPACING.sm,
                    }}>
                      <Text style={[TEXT_STYLES.caption, { color: '#FFFFFF', fontWeight: 'bold' }]}>
                        {index + 1}
                      </Text>
                    </Surface>
                    <Text style={[TEXT_STYLES.body, { flex: 1, lineHeight: 20 }]}>
                      {step}
                    </Text>
                  </View>
                ))}
              </Card.Content>
            </Card>

            {/* Pro Tips */}
            <Card style={{ marginBottom: SPACING.lg, elevation: 4 }}>
              <Card.Content style={{ padding: SPACING.lg }}>
                <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md, color: COLORS.primary }]}>
                  Pro Tips! 💡
                </Text>
                {selectedTask.tips.map((tip, index) => (
                  <View key={index} style={{ flexDirection: 'row', marginBottom: SPACING.sm }}>
                    <Text style={[TEXT_STYLES.body, { color: '#FF9800', marginRight: SPACING.sm }]}>💡</Text>
                    <Text style={[TEXT_STYLES.body, { flex: 1, lineHeight: 20 }]}>
                      {tip}
                    </Text>
                  </View>
                ))}
              </Card.Content>
            </Card>

            {/* Benefits & Fun Fact */}
            <Card style={{ marginBottom: SPACING.lg, elevation: 4 }}>
              <Card.Content style={{ padding: SPACING.lg }}>
                <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md, color: COLORS.primary }]}>
                  Why This Matters 🎯
                </Text>
                <Surface style={{
                  padding: SPACING.md,
                  borderRadius: 12,
                  backgroundColor: '#E3F2FD',
                  marginBottom: SPACING.md,
                }}>
                  <Text style={[TEXT_STYLES.body, { color: '#1565C0', lineHeight: 20 }]}>
                    {selectedTask.benefits}
                  </Text>
                </Surface>

                <Surface style={{
                  padding: SPACING.md,
                  borderRadius: 12,
                  backgroundColor: '#FFF3E0',
                }}>
                  <Text style={[TEXT_STYLES.caption, { color: '#E65100', fontStyle: 'italic' }]}>
                    🎉 {selectedTask.funFact}
                  </Text>
                </Surface>
              </Card.Content>
            </Card>

            {/* Warning Signs */}
            <Card style={{ marginBottom: SPACING.xl, elevation: 4 }}>
              <Card.Content style={{ padding: SPACING.lg }}>
                <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md, color: '#F44336' }]}>
                  Warning Signs! ⚠️
                </Text>
                <Surface style={{
                  padding: SPACING.md,
                  borderRadius: 12,
                  backgroundColor: '#FFEBEE',
                  borderLeftWidth: 4,
                  borderLeftColor: '#F44336',
                }}>
                  <Text style={[TEXT_STYLES.body, { color: '#C62828', lineHeight: 20 }]}>
                    🚨 {selectedTask.warningSign}
                  </Text>
                </Surface>
              </Card.Content>
            </Card>

            <Button
              mode="contained"
              onPress={() => {
                completeTask(selectedTask.id);
                setShowTaskModal(false);
              }}
              style={{
                borderRadius: 25,
                paddingVertical: SPACING.xs,
                marginBottom: SPACING.xl,
              }}
              buttonColor={completedTasks.has(selectedTask.id) ? '#4CAF50' : COLORS.primary}
            >
              {completedTasks.has(selectedTask.id) ? '✓ Task Completed!' : `Complete & Earn ${selectedTask.points} Points!`}
            </Button>
          </ScrollView>
        </View>
      </Modal>
    );
  };

  const renderRewardModal = () => (
    <Modal
      visible={showRewardModal}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setShowRewardModal(false)}
    >
      <BlurView
        style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
        blurType="light"
        blurAmount={10}
      >
        <Surface style={{
          padding: SPACING.xl,
          borderRadius: 20,
          elevation: 10,
          backgroundColor: '#FFFFFF',
          alignItems: 'center',
          margin: SPACING.xl,
        }}>
          <Text style={{ fontSize: 60, marginBottom: SPACING.md }}>🎉</Text>
          <Text style={[TEXT_STYLES.h2, { color: '#FFD700', marginBottom: SPACING.sm }]}>
            Streak Bonus!
          </Text>
          <Text style={[TEXT_STYLES.body, { textAlign: 'center', marginBottom: SPACING.lg }]}>
            You've completed 5 maintenance tasks! Your equipment care streak is now {maintenanceStreak} days! 🔥
          </Text>
          <Text style={[TEXT_STYLES.caption, { textAlign: 'center', marginBottom: SPACING.lg, color: '#666' }]}>
            Bonus: +25 points for consistent maintenance!
          </Text>
          <Button
            mode="contained"
            onPress={() => {
              setShowRewardModal(false);
              setTotalPoints(prev => prev + 25);
            }}
            buttonColor="#FFD700"
            textColor="#000000"
            style={{ borderRadius: 25 }}
          >
            Collect Bonus! 🎁
          </Button>
        </Surface>
      </BlurView>
    </Modal>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'tasks':
        return (
          <FlatList
            data={filteredTasks}
            renderItem={renderMaintenanceTask}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={{ paddingBottom: 100 }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[COLORS.primary]}
                tintColor={COLORS.primary}
              />
            }
            ListEmptyComponent={() => (
              <Surface style={{
                margin: SPACING.lg,
                padding: SPACING.xl,
                borderRadius: 16,
                elevation: 2,
                alignItems: 'center',
              }}>
                <Text style={{ fontSize: 48, marginBottom: SPACING.md }}>🔧</Text>
                <Text style={[TEXT_STYLES.h3, { color: '#666', marginBottom: SPACING.sm }]}>
                  No tasks found
                </Text>
                <Text style={[TEXT_STYLES.body, { color: '#999', textAlign: 'center' }]}>
                  Try adjusting your search or category filter
                </Text>
              </Surface>
            )}
          />
        );
      
      case 'myequipment':
        return (
          <FlatList
            data={myEquipmentData}
            renderItem={renderMyEquipmentItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={{ paddingBottom: 100 }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[COLORS.primary]}
                tintColor={COLORS.primary}
              />
            }
          />
        );
      
      case 'schedule':
        return (
          <ScrollView contentContainerStyle={{ padding: SPACING.lg, paddingBottom: 100 }}>
            <Card style={{ marginBottom: SPACING.lg, elevation: 4 }}>
              <LinearGradient
                colors={['#4CAF50', '#81C784']}
                style={{
                  padding: SPACING.lg,
                  borderTopLeftRadius: 16,
                  borderTopRightRadius: 16,
                  alignItems: 'center',
                }}
              >
                <Text style={{ fontSize: 48, marginBottom: SPACING.sm }}>📅</Text>
                <Text style={[TEXT_STYLES.h2, { color: '#FFFFFF' }]}>
                  Maintenance Schedule
                </Text>
              </LinearGradient>
              
              <Card.Content style={{ padding: SPACING.lg }}>
                <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md, color: COLORS.primary }]}>
                  This Week's Tasks 📋
                </Text>
                
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day, index) => {
                  const dayTasks = index === 0 ? ['Clean Your Boots'] : 
                                  index === 2 ? ['Wash Training Kit'] :
                                  index === 6 ? ['Check Equipment Safety'] : [];
                  
                  return (
                    <Surface
                      key={day}
                      style={{
                        padding: SPACING.md,
                        borderRadius: 12,
                        marginBottom: SPACING.sm,
                        backgroundColor: dayTasks.length > 0 ? '#E8F5E8' : '#F5F5F5',
                        elevation: dayTasks.length > 0 ? 2 : 0,
                      }}
                    >
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text style={[TEXT_STYLES.body, { fontWeight: 'bold', color: '#333' }]}>
                          {day}
                        </Text>
                        {dayTasks.length > 0 ? (
                          <Chip
                            mode="flat"
                            style={{ backgroundColor: '#4CAF50' }}
                            textStyle={{ color: '#FFFFFF', fontSize: 10 }}
                            compact
                          >
                            {dayTasks.length} task{dayTasks.length > 1 ? 's' : ''}
                          </Chip>
                        ) : (
                          <Text style={[TEXT_STYLES.caption, { color: '#999' }]}>Free day! 😊</Text>
                        )}
                      </View>
                      {dayTasks.map((task, taskIndex) => (
                        <Text key={taskIndex} style={[TEXT_STYLES.caption, { color: '#4CAF50', marginTop: 4 }]}>
                          • {task}
                        </Text>
                      ))}
                    </Surface>
                  );
                })}
              </Card.Content>
            </Card>

            {/* Maintenance Calendar */}
            <Card style={{ marginBottom: SPACING.lg, elevation: 4 }}>
              <Card.Content style={{ padding: SPACING.lg }}>
                <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md, color: COLORS.primary }]}>
                  Monthly Overview 🗓️
                </Text>
                
                <Surface style={{
                  padding: SPACING.md,
                  borderRadius: 12,
                  backgroundColor: '#E3F2FD',
                  marginBottom: SPACING.md,
                }}>
                  <Text style={[TEXT_STYLES.body, { color: '#1565C0', textAlign: 'center' }]}>
                    You have 3 weekly tasks and 2 monthly tasks coming up!
                  </Text>
                </Surface>

                {/* Quick Stats */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: SPACING.md }}>
                  <View style={{ alignItems: 'center' }}>
                    <Text style={[TEXT_STYLES.h2, { color: '#4CAF50' }]}>
                      {completedTasks.size}
                    </Text>
                    <Text style={[TEXT_STYLES.caption, { color: '#666' }]}>Completed</Text>
                  </View>
                  <View style={{ alignItems: 'center' }}>
                    <Text style={[TEXT_STYLES.h2, { color: '#FF9800' }]}>
                      {maintenanceTasks.length - completedTasks.size}
                    </Text>
                    <Text style={[TEXT_STYLES.caption, { color: '#666' }]}>Remaining</Text>
                  </View>
                  <View style={{ alignItems: 'center' }}>
                    <Text style={[TEXT_STYLES.h2, { color: '#F44336' }]}>
                      {maintenanceStreak}
                    </Text>
                    <Text style={[TEXT_STYLES.caption, { color: '#666' }]}>Day Streak</Text>
                  </View>
                </View>
              </Card.Content>
            </Card>
          </ScrollView>
        );
      
      default:
        return null;
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F5F5F5' }}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />

      {/* Header */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={{
          paddingTop: 50,
          paddingBottom: SPACING.lg,
          paddingHorizontal: SPACING.lg,
        }}
      >
        <Animated.View style={{ opacity: fadeAnim }}>
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: SPACING.md,
          }}>
            <Text style={[TEXT_STYLES.h1, { color: '#FFFFFF' }]}>
              Equipment Care 🔧
            </Text>
            <View style={{ alignItems: 'center' }}>
              <Text style={[TEXT_STYLES.caption, { color: '#FFFFFF' }]}>Total Points</Text>
              <Text style={[TEXT_STYLES.h2, { color: '#FFD700' }]}>
                {totalPoints} ⭐
              </Text>
            </View>
          </View>

          <Text style={[TEXT_STYLES.body, { color: '#FFFFFF', opacity: 0.9, marginBottom: SPACING.md }]}>
            Take care of your equipment and it will take care of you! 💪
          </Text>

          <Surface style={{
            padding: SPACING.md,
            borderRadius: 12,
            backgroundColor: 'rgba(255,255,255,0.2)',
            marginBottom: SPACING.md,
          }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.xs }}>
              <Text style={[TEXT_STYLES.caption, { color: '#FFFFFF' }]}>
                Maintenance Streak: {maintenanceStreak} days 🔥
              </Text>
              <Text style={[TEXT_STYLES.caption, { color: '#FFFFFF' }]}>
                {completedTasks.size}/{maintenanceTasks.length} completed
              </Text>
            </View>
            <ProgressBar
              progress={completedTasks.size / maintenanceTasks.length}
              color="#FFD700"
              style={{ height: 8, borderRadius: 4 }}
            />
          </Surface>
        </Animated.View>
      </LinearGradient>

      {/* Tab Navigation */}
      <Surface style={{
        elevation: 4,
        backgroundColor: '#FFFFFF',
      }}>
        <View style={{
          flexDirection: 'row',
          paddingHorizontal: SPACING.md,
          paddingVertical: SPACING.sm,
        }}>
          {[
            { id: 'tasks', label: 'Tasks', icon: 'assignment' },
            { id: 'myequipment', label: 'My Equipment', icon: 'inventory' },
            { id: 'schedule', label: 'Schedule', icon: 'calendar-today' },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.id}
              onPress={() => {
                setActiveTab(tab.id);
                Vibration.vibrate(50);
              }}
              style={{
                flex: 1,
                paddingVertical: SPACING.sm,
                alignItems: 'center',
                borderBottomWidth: activeTab === tab.id ? 2 : 0,
                borderBottomColor: COLORS.primary,
              }}
            >
              <Icon 
                name={tab.icon} 
                size={20} 
                color={activeTab === tab.id ? COLORS.primary : '#999'} 
              />
              <Text style={[
                TEXT_STYLES.caption,
                {
                  marginTop: 4,
                  color: activeTab === tab.id ? COLORS.primary : '#999',
                  fontWeight: activeTab === tab.id ? 'bold' : 'normal',
                }
              ]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Surface>

      {/* Search Bar (only for tasks tab) */}
      {activeTab === 'tasks' && (
        <View style={{ padding: SPACING.md }}>
          <Searchbar
            placeholder="Search maintenance tasks... 🔍"
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={{
              elevation: 4,
              borderRadius: 25,
              backgroundColor: '#FFFFFF',
            }}
            iconColor={COLORS.primary}
            inputStyle={{ fontSize: 16 }}
          />
        </View>
      )}

      {/* Category Filter (only for tasks tab) */}
      {activeTab === 'tasks' && (
        <View style={{ marginBottom: SPACING.md }}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: SPACING.md }}
          >
            {maintenanceCategories.map((category) => (
              <TouchableOpacity
                key={category.id}
                onPress={() => {
                  setSelectedCategory(category.id);
                  Vibration.vibrate(50);
                }}
                style={{ marginRight: SPACING.sm }}
              >
                <Surface
                  style={{
                    paddingHorizontal: SPACING.md,
                    paddingVertical: SPACING.sm,
                    borderRadius: 20,
                    elevation: selectedCategory === category.id ? 8 : 2,
                    backgroundColor: selectedCategory === category.id ? category.color : '#FFFFFF',
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Icon 
                      name={category.icon} 
                      size={20} 
                      color={selectedCategory === category.id ? '#FFFFFF' : category.color} 
                    />
                    <Text style={[
                      TEXT_STYLES.caption,
                      {
                        marginLeft: SPACING.xs,
                        color: selectedCategory === category.id ? '#FFFFFF' : category.color,
                        fontWeight: selectedCategory === category.id ? 'bold' : 'normal',
                      }
                    ]}>
                      {category.name}
                    </Text>
                  </View>
                </Surface>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Tab Content */}
      {renderTabContent()}

      {/* Floating Action Buttons */}
      <View style={{ position: 'absolute', right: 16, bottom: 16 }}>
        <FAB
          icon="add-alarm"
          label="Set Reminder"
          style={{
            backgroundColor: COLORS.secondary,
            marginBottom: SPACING.sm,
          }}
          color="#FFFFFF"
          onPress={() => {
            Alert.alert(
              "Maintenance Reminder 🔔",
              "Set a daily reminder to check your equipment?",
              [
                { text: "Not Now", style: "cancel" },
                { 
                  text: "Set Reminder", 
                  onPress: () => {
                    Alert.alert("Success! ✅", "Daily reminder set for 6 PM!");
                    Vibration.vibrate(100);
                  }
                }
              ]
            );
          }}
          size="small"
        />
        
        <FAB
          icon="help"
          label="Get Help"
          style={{
            backgroundColor: '#FF9800',
          }}
          color="#FFFFFF"
          onPress={() => {
            Alert.alert(
              "Maintenance Help 🆘",
              "• Ask your coach for equipment advice\n• Check manufacturer instructions\n• Replace damaged equipment immediately\n• Keep a maintenance diary\n• Clean equipment after every use",
              [{ text: "Thanks!", style: "default" }]
            );
          }}
          size="small"
        />
      </View>

      {/* Achievement Badge */}
      <TouchableOpacity
        style={{
          position: 'absolute',
          bottom: 16,
          left: 16,
          backgroundColor: completedTasks.size >= 5 ? '#FFD700' : '#E0E0E0',
          borderRadius: 25,
          paddingHorizontal: SPACING.md,
          paddingVertical: SPACING.sm,
          elevation: 8,
          flexDirection: 'row',
          alignItems: 'center',
        }}
        onPress={() => {
          Alert.alert(
            "Equipment Care Master! 🏆",
            `Tasks Completed: ${completedTasks.size}/${maintenanceTasks.length}\nMaintenance Streak: ${maintenanceStreak} days\nTotal Points: ${totalPoints}\n\n${completedTasks.size >= 5 ? 'You\'re an Equipment Care Champion! 🌟' : 'Complete more tasks to become a champion!'}`,
            [{ text: "Keep Going!", style: "default" }]
          );
        }}
      >
        <Icon 
          name="build" 
          size={20} 
          color={completedTasks.size >= 5 ? "#000000" : "#999"} 
        />
        <Text style={{
          marginLeft: SPACING.xs,
          fontWeight: 'bold',
          color: completedTasks.size >= 5 ? "#000000" : "#999",
          fontSize: 14,
        }}>
          Streak: {maintenanceStreak}🔥
        </Text>
      </TouchableOpacity>

      {/* Modals */}
      <Portal>
        {renderTaskModal()}
        {renderRewardModal()}
      </Portal>
    </View>
  );
};

// Screen options for navigation
EquipmentMaintenance.screenOptions = {
  title: 'Equipment Maintenance',
  headerShown: false,
};

export default EquipmentMaintenance;