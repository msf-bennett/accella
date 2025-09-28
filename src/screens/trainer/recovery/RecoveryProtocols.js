import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Animated,
  StatusBar,
  Dimensions,
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
} from 'react-native-paper';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import { BlurView } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';

// Import design system constants
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  background: '#f5f5f5',
  surface: '#ffffff',
  text: '#333333',
  textLight: '#666666',
  accent: '#FF6B6B',
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

const TEXT_STYLES = {
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  subtitle: {
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
    color: COLORS.textLight,
  },
};

const { width } = Dimensions.get('window');

const RecoveryProtocols = ({ navigation }) => {
  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  
  // State management
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedProtocol, setSelectedProtocol] = useState(null);
  const [loading, setLoading] = useState(true);

  // Redux
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const protocols = useSelector(state => state.recovery.protocols || []);

  // Mock data for demonstration
  const [recoveryProtocols, setRecoveryProtocols] = useState([
    {
      id: '1',
      title: 'Post-Workout Recovery 💪',
      description: 'Complete recovery routine for after intense training sessions',
      duration: '20-30 minutes',
      category: 'active',
      difficulty: 'Beginner',
      steps: 8,
      rating: 4.8,
      completions: 156,
      tags: ['stretching', 'cool-down', 'flexibility'],
      clientsAssigned: 12,
      lastUsed: '2 hours ago',
    },
    {
      id: '2',
      title: 'Sleep Optimization Protocol 🌙',
      description: 'Evidence-based techniques for better recovery through sleep',
      duration: '30-45 minutes',
      category: 'sleep',
      difficulty: 'Intermediate',
      steps: 6,
      rating: 4.9,
      completions: 203,
      tags: ['sleep hygiene', 'relaxation', 'recovery'],
      clientsAssigned: 8,
      lastUsed: '1 day ago',
    },
    {
      id: '3',
      title: 'Cold Therapy Protocol ❄️',
      description: 'Structured cold exposure for enhanced recovery and adaptation',
      duration: '15-20 minutes',
      category: 'therapy',
      difficulty: 'Advanced',
      steps: 5,
      rating: 4.7,
      completions: 89,
      tags: ['cold therapy', 'inflammation', 'performance'],
      clientsAssigned: 5,
      lastUsed: '3 days ago',
    },
    {
      id: '4',
      title: 'Mobility & Flexibility Routine 🤸',
      description: 'Daily mobility work to maintain range of motion and prevent injury',
      duration: '25-35 minutes',
      category: 'mobility',
      difficulty: 'Beginner',
      steps: 12,
      rating: 4.6,
      completions: 324,
      tags: ['mobility', 'flexibility', 'injury prevention'],
      clientsAssigned: 18,
      lastUsed: '4 hours ago',
    },
    {
      id: '5',
      title: 'Nutrition Recovery Plan 🥗',
      description: 'Post-training nutrition guidelines for optimal recovery',
      duration: '2-3 hours',
      category: 'nutrition',
      difficulty: 'Intermediate',
      steps: 4,
      rating: 4.5,
      completions: 267,
      tags: ['nutrition', 'supplements', 'hydration'],
      clientsAssigned: 15,
      lastUsed: '6 hours ago',
    },
  ]);

  const categories = [
    { id: 'all', name: 'All', icon: 'apps', count: recoveryProtocols.length },
    { id: 'active', name: 'Active Recovery', icon: 'directions-run', count: 1 },
    { id: 'sleep', name: 'Sleep', icon: 'bedtime', count: 1 },
    { id: 'therapy', name: 'Therapy', icon: 'spa', count: 1 },
    { id: 'mobility', name: 'Mobility', icon: 'accessibility', count: 1 },
    { id: 'nutrition', name: 'Nutrition', icon: 'restaurant', count: 1 },
  ];

  // Animation on mount
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

    // Simulate loading
    setTimeout(() => setLoading(false), 1000);
  }, []);

  // Refresh handler
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  // Filter protocols based on search and category
  const filteredProtocols = recoveryProtocols.filter(protocol => {
    const matchesSearch = protocol.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         protocol.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         protocol.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || protocol.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner': return COLORS.success;
      case 'Intermediate': return COLORS.warning;
      case 'Advanced': return COLORS.error;
      default: return COLORS.textLight;
    }
  };

  const handleProtocolPress = (protocol) => {
    setSelectedProtocol(protocol);
    navigation.navigate('RecoveryProtocolDetails', { protocol });
  };

  const handleCreateProtocol = () => {
    Alert.alert(
      '🚧 Feature in Development',
      'Recovery protocol creation is coming soon! Our AI will help you build personalized recovery plans.',
      [{ text: 'Got it! 👍', style: 'default' }]
    );
  };

  const handleAssignProtocol = (protocol) => {
    Alert.alert(
      '👥 Assign Protocol',
      `Assign "${protocol.title}" to specific clients or groups?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Select Clients', onPress: () => navigation.navigate('ClientSelection', { protocol }) },
      ]
    );
  };

  const renderCategoryChip = ({ item }) => (
    <Chip
      mode={selectedCategory === item.id ? 'flat' : 'outlined'}
      selected={selectedCategory === item.id}
      onPress={() => setSelectedCategory(item.id)}
      style={{
        marginRight: SPACING.sm,
        backgroundColor: selectedCategory === item.id ? COLORS.primary : 'transparent',
      }}
      textStyle={{
        color: selectedCategory === item.id ? '#fff' : COLORS.text,
        fontSize: 12,
      }}
      icon={item.icon}
    >
      {item.name} ({item.count})
    </Chip>
  );

  const renderProtocolCard = ({ item, index }) => (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
        marginBottom: SPACING.md,
      }}
    >
      <Card
        style={{
          margin: SPACING.sm,
          elevation: 4,
          borderRadius: 16,
        }}
        onPress={() => handleProtocolPress(item)}
      >
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={{
            height: 120,
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            justifyContent: 'space-between',
            padding: SPACING.md,
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View style={{ flex: 1 }}>
              <Text style={[TEXT_STYLES.subtitle, { color: '#fff', marginBottom: SPACING.xs }]}>
                {item.title}
              </Text>
              <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)' }]}>
                {item.description}
              </Text>
            </View>
            <IconButton
              icon="dots-vertical"
              iconColor="#fff"
              size={20}
              onPress={() => handleAssignProtocol(item)}
            />
          </View>
          
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Chip
              mode="flat"
              textStyle={{ color: '#fff', fontSize: 10 }}
              style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
            >
              {item.difficulty}
            </Chip>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Icon name="star" size={16} color="#FFD700" />
              <Text style={{ color: '#fff', marginLeft: 4, fontSize: 12 }}>
                {item.rating}
              </Text>
            </View>
          </View>
        </LinearGradient>

        <Card.Content style={{ padding: SPACING.md }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.sm }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Icon name="schedule" size={16} color={COLORS.textLight} />
              <Text style={[TEXT_STYLES.caption, { marginLeft: 4 }]}>
                {item.duration}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Icon name="people" size={16} color={COLORS.textLight} />
              <Text style={[TEXT_STYLES.caption, { marginLeft: 4 }]}>
                {item.clientsAssigned} assigned
              </Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.sm }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Icon name="list" size={16} color={COLORS.textLight} />
              <Text style={[TEXT_STYLES.caption, { marginLeft: 4 }]}>
                {item.steps} steps
              </Text>
            </View>
            <Text style={[TEXT_STYLES.caption]}>
              Used {item.lastUsed}
            </Text>
          </View>

          <View style={{ marginBottom: SPACING.sm }}>
            <Text style={[TEXT_STYLES.caption, { marginBottom: 4 }]}>
              Completions: {item.completions}
            </Text>
            <ProgressBar
              progress={item.completions / 400}
              color={COLORS.success}
              style={{ height: 4, borderRadius: 2 }}
            />
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {item.tags.map((tag, tagIndex) => (
              <Chip
                key={tagIndex}
                mode="outlined"
                compact
                style={{ marginRight: SPACING.xs }}
                textStyle={{ fontSize: 10 }}
              >
                {tag}
              </Chip>
            ))}
          </ScrollView>
        </Card.Content>
      </Card>
    </Animated.View>
  );

  const renderEmptyState = () => (
    <View style={{ 
      flex: 1, 
      justifyContent: 'center', 
      alignItems: 'center', 
      paddingHorizontal: SPACING.xl,
      marginTop: 50,
    }}>
      <Icon name="spa" size={80} color={COLORS.textLight} />
      <Text style={[TEXT_STYLES.subtitle, { marginTop: SPACING.md, textAlign: 'center' }]}>
        No Recovery Protocols Found
      </Text>
      <Text style={[TEXT_STYLES.caption, { textAlign: 'center', marginTop: SPACING.sm }]}>
        Create your first recovery protocol or adjust your search filters
      </Text>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      {/* Header */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={{ paddingTop: 50, paddingBottom: SPACING.md }}
      >
        <View style={{ 
          flexDirection: 'row', 
          alignItems: 'center', 
          paddingHorizontal: SPACING.md,
          marginBottom: SPACING.md,
        }}>
          <IconButton
            icon="arrow-back"
            iconColor="#fff"
            size={24}
            onPress={() => navigation.goBack()}
          />
          <Text style={[TEXT_STYLES.title, { color: '#fff', flex: 1, marginLeft: SPACING.sm }]}>
            Recovery Protocols 🧘‍♀️
          </Text>
          <IconButton
            icon="filter-list"
            iconColor="#fff"
            size={24}
            onPress={() => Alert.alert('🚧 Coming Soon', 'Advanced filtering options coming soon!')}
          />
        </View>

        {/* Search Bar */}
        <View style={{ paddingHorizontal: SPACING.md }}>
          <Searchbar
            placeholder="Search recovery protocols..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={{ 
              backgroundColor: 'rgba(255,255,255,0.9)',
              borderRadius: 25,
            }}
            iconColor={COLORS.primary}
            placeholderTextColor={COLORS.textLight}
          />
        </View>
      </LinearGradient>

      {/* Stats Cards */}
      <View style={{ 
        flexDirection: 'row', 
        paddingHorizontal: SPACING.sm,
        marginTop: -20,
        marginBottom: SPACING.md,
      }}>
        <Surface style={{ 
          flex: 1, 
          margin: SPACING.xs, 
          padding: SPACING.md, 
          borderRadius: 16,
          elevation: 4,
        }}>
          <Text style={[TEXT_STYLES.body, { fontWeight: 'bold', color: COLORS.primary }]}>
            {recoveryProtocols.length}
          </Text>
          <Text style={TEXT_STYLES.caption}>Total Protocols</Text>
        </Surface>
        
        <Surface style={{ 
          flex: 1, 
          margin: SPACING.xs, 
          padding: SPACING.md, 
          borderRadius: 16,
          elevation: 4,
        }}>
          <Text style={[TEXT_STYLES.body, { fontWeight: 'bold', color: COLORS.success }]}>
            {recoveryProtocols.reduce((sum, p) => sum + p.clientsAssigned, 0)}
          </Text>
          <Text style={TEXT_STYLES.caption}>Clients Using</Text>
        </Surface>

        <Surface style={{ 
          flex: 1, 
          margin: SPACING.xs, 
          padding: SPACING.md, 
          borderRadius: 16,
          elevation: 4,
        }}>
          <Text style={[TEXT_STYLES.body, { fontWeight: 'bold', color: COLORS.warning }]}>
            {Math.round(recoveryProtocols.reduce((sum, p) => sum + p.rating, 0) / recoveryProtocols.length * 10) / 10}
          </Text>
          <Text style={TEXT_STYLES.caption}>Avg Rating</Text>
        </Surface>
      </View>

      {/* Category Filters */}
      <FlatList
        horizontal
        data={categories}
        renderItem={renderCategoryChip}
        keyExtractor={item => item.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ 
          paddingHorizontal: SPACING.md,
          marginBottom: SPACING.md,
        }}
      />

      {/* Protocols List */}
      <FlatList
        data={filteredProtocols}
        renderItem={renderProtocolCard}
        keyExtractor={item => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        ListEmptyComponent={renderEmptyState}
      />

      {/* Floating Action Button */}
      <FAB
        icon="add"
        style={{
          position: 'absolute',
          right: SPACING.md,
          bottom: SPACING.xl,
          backgroundColor: COLORS.primary,
        }}
        onPress={handleCreateProtocol}
      />
    </View>
  );
};

export default RecoveryProtocols;