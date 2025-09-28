import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  StatusBar,
  RefreshControl,
  TouchableOpacity,
  Alert,
  Animated,
  Dimensions,
  Image,
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
  Divider,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { BlurView } from '@react-native-blur/blur';

const { width, height } = Dimensions.get('window');

// Design system constants
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#28a745',
  error: '#dc3545',
  warning: '#ffc107',
  background: '#f8f9fa',
  surface: '#ffffff',
  text: '#333333',
  textSecondary: '#666666',
  border: '#e0e0e0',
  massage: '#9c27b0',
  relaxation: '#00bcd4',
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
  caption: { fontSize: 14, color: COLORS.textSecondary },
};

const MassageProtocol = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, isLoading } = useSelector(state => state.auth);
  
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedProtocol, setSelectedProtocol] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [timerActive, setTimerActive] = useState(false);
  const [sessionTime, setSessionTime] = useState(0);
  const [animatedValue] = useState(new Animated.Value(0));
  const timerRef = useRef(null);

  // Sample data - replace with Redux state
  const [massageData, setMassageData] = useState({
    activeSession: {
      client: 'John Smith',
      protocol: 'Deep Tissue Recovery',
      duration: 45,
      elapsed: 15,
      bodyParts: ['shoulders', 'back', 'legs']
    },
    protocols: [
      {
        id: 1,
        title: 'Deep Tissue Recovery',
        category: 'recovery',
        duration: '45-60 min',
        difficulty: 'Advanced',
        bodyParts: ['Back', 'Shoulders', 'Legs'],
        techniques: ['Deep Pressure', 'Trigger Points', 'Myofascial Release'],
        benefits: ['Muscle Tension Relief', 'Improved Circulation', 'Pain Reduction'],
        color: COLORS.massage,
        icon: 'spa',
        rating: 4.8,
        sessions: 156
      },
      {
        id: 2,
        title: 'Sports Performance',
        category: 'performance',
        duration: '30-45 min',
        difficulty: 'Intermediate',
        bodyParts: ['Full Body', 'Focus Areas'],
        techniques: ['Swedish', 'Compression', 'Stretching'],
        benefits: ['Enhanced Performance', 'Flexibility', 'Injury Prevention'],
        color: COLORS.primary,
        icon: 'fitness-center',
        rating: 4.7,
        sessions: 89
      },
      {
        id: 3,
        title: 'Relaxation Therapy',
        category: 'relaxation',
        duration: '60-90 min',
        difficulty: 'Beginner',
        bodyParts: ['Full Body', 'Head', 'Face'],
        techniques: ['Light Touch', 'Aromatherapy', 'Hot Stone'],
        benefits: ['Stress Relief', 'Better Sleep', 'Mental Clarity'],
        color: COLORS.relaxation,
        icon: 'self-improvement',
        rating: 4.9,
        sessions: 203
      },
      {
        id: 4,
        title: 'Injury Rehabilitation',
        category: 'medical',
        duration: '30-45 min',
        difficulty: 'Advanced',
        bodyParts: ['Targeted Areas', 'Surrounding Tissue'],
        techniques: ['Medical Massage', 'Lymphatic Drainage', 'Gentle Mobilization'],
        benefits: ['Faster Healing', 'Reduced Inflammation', 'Mobility Restoration'],
        color: COLORS.success,
        icon: 'healing',
        rating: 4.6,
        sessions: 67
      }
    ],
    techniques: [
      {
        id: 1,
        name: 'Swedish Massage',
        type: 'relaxation',
        pressure: 'Light to Medium',
        duration: '5-10 min per area',
        description: 'Long, flowing strokes to promote relaxation'
      },
      {
        id: 2,
        name: 'Deep Tissue',
        type: 'therapeutic',
        pressure: 'Medium to Deep',
        duration: '10-15 min per area',
        description: 'Focused pressure on muscle knots and tension'
      },
      {
        id: 3,
        name: 'Trigger Point',
        type: 'medical',
        pressure: 'Deep',
        duration: '2-5 min per point',
        description: 'Targeted pressure on specific pain points'
      },
      {
        id: 4,
        name: 'Myofascial Release',
        type: 'therapeutic',
        pressure: 'Medium',
        duration: '3-8 min per area',
        description: 'Sustained pressure to release fascial restrictions'
      }
    ]
  });

  const categories = [
    { id: 'all', label: 'All', icon: 'grid-view' },
    { id: 'recovery', label: 'Recovery', icon: 'spa' },
    { id: 'performance', label: 'Performance', icon: 'fitness-center' },
    { id: 'relaxation', label: 'Relaxation', icon: 'self-improvement' },
    { id: 'medical', label: 'Medical', icon: 'healing' }
  ];

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    if (timerActive) {
      timerRef.current = setInterval(() => {
        setSessionTime(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [timerActive]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Simulate data refresh
      await new Promise(resolve => setTimeout(resolve, 1000));
      // dispatch(fetchMassageProtocols());
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh data');
    } finally {
      setRefreshing(false);
    }
  }, [dispatch]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartSession = (protocol) => {
    Alert.alert(
      'Start Massage Session',
      `Begin ${protocol.title} protocol?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Start', 
          onPress: () => {
            setTimerActive(true);
            setSessionTime(0);
            Alert.alert('Session Started', `${protocol.title} session is now active! ⏱️`);
          }
        }
      ]
    );
  };

  const handleStopSession = () => {
    Alert.alert(
      'End Session',
      'Are you sure you want to end the current session?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'End Session', 
          onPress: () => {
            setTimerActive(false);
            setSessionTime(0);
            Alert.alert('Session Completed', 'Great work! Session logged successfully. 📝');
          }
        }
      ]
    );
  };

  const handleViewTechniques = () => {
    setShowModal(true);
  };

  const renderHeader = () => (
    <LinearGradient
      colors={[COLORS.massage, COLORS.secondary]}
      style={styles.header}
    >
      <View style={styles.headerContent}>
        <Text style={[TEXT_STYLES.h2, styles.headerTitle]}>Massage Protocols</Text>
        <Text style={styles.headerSubtitle}>Therapeutic recovery sessions 🌿</Text>
        
        {timerActive && (
          <Surface style={styles.activeSessionCard}>
            <View style={styles.sessionHeader}>
              <Icon name="timer" size={20} color={COLORS.success} />
              <Text style={[TEXT_STYLES.body, styles.sessionTitle]}>Active Session</Text>
              <TouchableOpacity onPress={handleStopSession}>
                <Icon name="stop" size={20} color={COLORS.error} />
              </TouchableOpacity>
            </View>
            <Text style={styles.sessionTime}>{formatTime(sessionTime)}</Text>
            <Text style={styles.sessionClient}>
              {massageData.activeSession.client} • {massageData.activeSession.protocol}
            </Text>
          </Surface>
        )}
      </View>
    </LinearGradient>
  );

  const renderSearchAndFilters = () => (
    <View style={styles.searchSection}>
      <Searchbar
        placeholder="Search massage protocols..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
        iconColor={COLORS.massage}
      />
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterContainer}
      >
        {categories.map((category) => (
          <Chip
            key={category.id}
            selected={selectedCategory === category.id}
            onPress={() => setSelectedCategory(category.id)}
            style={[
              styles.filterChip,
              selectedCategory === category.id && styles.filterChipSelected
            ]}
            textStyle={selectedCategory === category.id ? styles.filterChipTextSelected : styles.filterChipText}
            icon={category.icon}
          >
            {category.label}
          </Chip>
        ))}
      </ScrollView>
    </View>
  );

  const renderProtocolCard = (protocol) => (
    <Card key={protocol.id} style={styles.protocolCard}>
      <Card.Content>
        <View style={styles.protocolHeader}>
          <View style={styles.protocolInfo}>
            <View style={[styles.protocolIcon, { backgroundColor: protocol.color + '20' }]}>
              <Icon name={protocol.icon} size={28} color={protocol.color} />
            </View>
            <View style={styles.protocolDetails}>
              <Text style={[TEXT_STYLES.h3, styles.protocolTitle]}>{protocol.title}</Text>
              <Text style={styles.protocolMeta}>{protocol.duration} • {protocol.difficulty}</Text>
              <View style={styles.ratingContainer}>
                <Icon name="star" size={16} color={COLORS.warning} />
                <Text style={styles.rating}>{protocol.rating}</Text>
                <Text style={styles.sessions}>({protocol.sessions} sessions)</Text>
              </View>
            </View>
          </View>
          <IconButton
            icon="dots-vertical"
            onPress={() => {
              setSelectedProtocol(protocol);
              Alert.alert('Protocol Options', 'Detailed view coming soon!');
            }}
          />
        </View>
        
        <View style={styles.bodyPartsSection}>
          <Text style={styles.sectionLabel}>Body Parts:</Text>
          <View style={styles.chipContainer}>
            {protocol.bodyParts.map((part, index) => (
              <Chip
                key={index}
                style={[styles.bodyPartChip, { backgroundColor: protocol.color + '15' }]}
                textStyle={{ color: protocol.color, fontSize: 12 }}
                compact
              >
                {part}
              </Chip>
            ))}
          </View>
        </View>
        
        <View style={styles.techniquesSection}>
          <Text style={styles.sectionLabel}>Techniques:</Text>
          <View style={styles.chipContainer}>
            {protocol.techniques.map((technique, index) => (
              <Chip
                key={index}
                style={styles.techniqueChip}
                textStyle={{ color: COLORS.textSecondary, fontSize: 12 }}
                compact
              >
                {technique}
              </Chip>
            ))}
          </View>
        </View>
        
        <View style={styles.benefitsSection}>
          <Text style={styles.sectionLabel}>Benefits:</Text>
          <View style={styles.benefitsList}>
            {protocol.benefits.map((benefit, index) => (
              <View key={index} style={styles.benefitItem}>
                <Icon name="check-circle" size={16} color={COLORS.success} />
                <Text style={styles.benefitText}>{benefit}</Text>
              </View>
            ))}
          </View>
        </View>
        
        <View style={styles.protocolActions}>
          <Button
            mode="contained"
            onPress={() => handleStartSession(protocol)}
            style={[styles.actionButton, { backgroundColor: protocol.color }]}
            labelStyle={styles.actionButtonText}
            disabled={timerActive}
          >
            {timerActive ? 'Session Active' : 'Start Session'}
          </Button>
          <Button
            mode="outlined"
            onPress={() => Alert.alert('Protocol Guide', 'Detailed instructions coming soon!')}
            style={styles.actionButton}
            textColor={protocol.color}
          >
            View Guide
          </Button>
        </View>
      </Card.Content>
    </Card>
  );

  const renderQuickActions = () => (
    <View style={styles.quickActions}>
      <Text style={[TEXT_STYLES.h3, styles.quickActionsTitle]}>Quick Actions</Text>
      <View style={styles.actionGrid}>
        <TouchableOpacity 
          style={styles.quickActionCard}
          onPress={handleViewTechniques}
        >
          <Icon name="touch-app" size={32} color={COLORS.massage} />
          <Text style={styles.quickActionText}>Techniques</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.quickActionCard}
          onPress={() => Alert.alert('Body Map', 'Interactive body mapping coming soon!')}
        >
          <Icon name="accessibility" size={32} color={COLORS.primary} />
          <Text style={styles.quickActionText}>Body Map</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.quickActionCard}
          onPress={() => Alert.alert('Session History', 'Session tracking coming soon!')}
        >
          <Icon name="history" size={32} color={COLORS.success} />
          <Text style={styles.quickActionText}>History</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.quickActionCard}
          onPress={() => Alert.alert('Client Notes', 'Note management coming soon!')}
        >
          <Icon name="note-add" size={32} color={COLORS.warning} />
          <Text style={styles.quickActionText}>Notes</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderTechniquesModal = () => (
    <Portal>
      <Modal 
        visible={showModal} 
        onDismiss={() => setShowModal(false)}
        contentContainerStyle={styles.modalContent}
      >
        <View style={styles.modalHeader}>
          <Text style={[TEXT_STYLES.h3, styles.modalTitle]}>Massage Techniques</Text>
          <IconButton
            icon="close"
            onPress={() => setShowModal(false)}
          />
        </View>
        <Divider />
        <ScrollView style={styles.modalBody}>
          {massageData.techniques.map((technique) => (
            <Card key={technique.id} style={styles.techniqueCard}>
              <Card.Content>
                <View style={styles.techniqueHeader}>
                  <Text style={[TEXT_STYLES.body, styles.techniqueName]}>{technique.name}</Text>
                  <Chip 
                    style={styles.techniqueTypeChip}
                    textStyle={{ fontSize: 12 }}
                    compact
                  >
                    {technique.type}
                  </Chip>
                </View>
                <Text style={styles.techniqueDescription}>{technique.description}</Text>
                <View style={styles.techniqueDetails}>
                  <View style={styles.techniqueDetail}>
                    <Icon name="fitness-center" size={16} color={COLORS.textSecondary} />
                    <Text style={styles.techniqueDetailText}>{technique.pressure}</Text>
                  </View>
                  <View style={styles.techniqueDetail}>
                    <Icon name="timer" size={16} color={COLORS.textSecondary} />
                    <Text style={styles.techniqueDetailText}>{technique.duration}</Text>
                  </View>
                </View>
              </Card.Content>
            </Card>
          ))}
        </ScrollView>
      </Modal>
    </Portal>
  );

  const filteredProtocols = massageData.protocols.filter(protocol => {
    const matchesCategory = selectedCategory === 'all' || protocol.category === selectedCategory;
    const matchesSearch = protocol.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         protocol.techniques.some(tech => tech.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <View style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />
      
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.massage]}
            tintColor={COLORS.massage}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={[
            styles.content,
            {
              opacity: animatedValue,
              transform: [
                {
                  translateY: animatedValue.interpolate({
                    inputRange: [0, 1],
                    outputRange: [50, 0],
                  }),
                },
              ],
            },
          ]}
        >
          {renderHeader()}
          {renderSearchAndFilters()}
          
          <View style={styles.mainContent}>
            <View style={styles.section}>
              <Text style={[TEXT_STYLES.h2, styles.sectionTitle]}>Massage Protocols</Text>
              {filteredProtocols.map(renderProtocolCard)}
            </View>
            
            {renderQuickActions()}
          </View>
        </Animated.View>
      </ScrollView>
      
      {renderTechniquesModal()}
      
      <FAB
        style={styles.fab}
        icon="add"
        onPress={() => Alert.alert('Custom Protocol', 'Create custom massage protocol coming soon!')}
        color="#fff"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  header: {
    paddingTop: StatusBar.currentHeight + SPACING.lg,
    paddingBottom: SPACING.xl,
    paddingHorizontal: SPACING.md,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    color: '#fff',
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    color: '#fff',
    opacity: 0.9,
    fontSize: 16,
    marginBottom: SPACING.lg,
  },
  activeSessionCard: {
    width: width - SPACING.lg * 2,
    padding: SPACING.md,
    borderRadius: 16,
    elevation: 4,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  sessionTitle: {
    flex: 1,
    marginLeft: SPACING.sm,
    fontWeight: '600',
    color: COLORS.text,
  },
  sessionTime: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.success,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  sessionClient: {
    textAlign: 'center',
    color: COLORS.textSecondary,
  },
  searchSection: {
    padding: SPACING.md,
  },
  searchBar: {
    marginBottom: SPACING.md,
    elevation: 2,
  },
  filterContainer: {
    paddingHorizontal: SPACING.xs,
  },
  filterChip: {
    marginRight: SPACING.sm,
    backgroundColor: COLORS.surface,
  },
  filterChipSelected: {
    backgroundColor: COLORS.massage,
  },
  filterChipText: {
    color: COLORS.textSecondary,
  },
  filterChipTextSelected: {
    color: '#fff',
  },
  mainContent: {
    padding: SPACING.md,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  protocolCard: {
    marginBottom: SPACING.md,
    elevation: 2,
    borderRadius: 16,
  },
  protocolHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  protocolInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  protocolIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  protocolDetails: {
    flex: 1,
  },
  protocolTitle: {
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  protocolMeta: {
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    marginLeft: SPACING.xs,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  sessions: {
    marginLeft: SPACING.xs,
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  sectionLabel: {
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  bodyPartsSection: {
    marginBottom: SPACING.md,
  },
  techniquesSection: {
    marginBottom: SPACING.md,
  },
  benefitsSection: {
    marginBottom: SPACING.lg,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  bodyPartChip: {
    marginBottom: SPACING.xs,
  },
  techniqueChip: {
    backgroundColor: COLORS.border,
    marginBottom: SPACING.xs,
  },
  benefitsList: {
    gap: SPACING.sm,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  benefitText: {
    color: COLORS.text,
    fontSize: 14,
  },
  protocolActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  actionButton: {
    flex: 1,
  },
  actionButtonText: {
    color: '#fff',
  },
  quickActions: {
    marginBottom: SPACING.xl,
  },
  quickActionsTitle: {
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  quickActionCard: {
    flex: 1,
    minWidth: (width - SPACING.md * 3) / 2,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    height: 100,
  },
  quickActionText: {
    marginTop: SPACING.sm,
    color: COLORS.text,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    margin: SPACING.md,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.massage,
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    margin: SPACING.lg,
    borderRadius: 16,
    maxHeight: height * 0.8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
  },
  modalTitle: {
    color: COLORS.text,
  },
  modalBody: {
    padding: SPACING.md,
  },
  techniqueCard: {
    marginBottom: SPACING.md,
    elevation: 1,
  },
  techniqueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  techniqueName: {
    fontWeight: '600',
    color: COLORS.text,
  },
  techniqueTypeChip: {
    backgroundColor: COLORS.primary + '20',
  },
  techniqueDescription: {
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
    lineHeight: 20,
  },
  techniqueDetails: {
    flexDirection: 'row',
    gap: SPACING.lg,
  },
  techniqueDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  techniqueDetailText: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
});

export default MassageProtocol;