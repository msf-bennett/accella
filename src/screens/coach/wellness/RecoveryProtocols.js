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
  Switch,
  Slider,
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

const RecoveryProtocols = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { user, clients, recoveryProtocols } = useSelector(state => state.coach);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('protocols'); // protocols, clients, monitoring
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showModalityModal, setShowModalityModal] = useState(false);
  const [selectedProtocol, setSelectedProtocol] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);

  // Animation values
  const scrollY = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(height)).current;

  // Form states
  const [newProtocol, setNewProtocol] = useState({
    name: '',
    description: '',
    duration: '7', // days
    sleepTarget: 8,
    restDayFrequency: 2, // per week
    modalities: [],
    intensity: 'moderate',
    phase: 'active-recovery',
    autoReminders: true,
    customInstructions: ''
  });

  // Recovery modalities data
  const recoveryModalities = [
    { id: 'sleep', name: 'Sleep Optimization', icon: 'bedtime', color: '#4A90E2' },
    { id: 'stretching', name: 'Stretching', icon: 'accessibility', color: '#7ED321' },
    { id: 'massage', name: 'Massage Therapy', icon: 'spa', color: '#F5A623' },
    { id: 'sauna', name: 'Sauna/Heat', icon: 'whatshot', color: '#D0021B' },
    { id: 'ice-bath', name: 'Cold Therapy', icon: 'ac-unit', color: '#50E3C2' },
    { id: 'meditation', name: 'Meditation', icon: 'self-improvement', color: '#9013FE' },
    { id: 'foam-rolling', name: 'Foam Rolling', icon: 'fitness-center', color: '#FF6900' },
    { id: 'compression', name: 'Compression', icon: 'compress', color: '#BD10E0' },
    { id: 'hydration', name: 'Hydration Protocol', icon: 'local-drink', color: '#50E3C2' },
    { id: 'nutrition', name: 'Recovery Nutrition', icon: 'restaurant', color: '#7ED321' },
  ];

  // Mock data - replace with Redux state
  const mockProtocols = [
    {
      id: 1,
      name: 'Post-Training Recovery',
      description: 'Standard recovery protocol for training days',
      clients: 15,
      duration: '24 hours',
      sleepTarget: 8,
      restDayFreq: 1,
      status: 'active',
      modalities: ['stretching', 'hydration', 'sleep'],
      intensity: 'moderate',
      phase: 'post-workout',
      compliance: 87,
      createdAt: '2024-01-15',
      tags: ['training', 'daily', 'standard']
    },
    {
      id: 2,
      name: 'Competition Recovery',
      description: 'Intensive recovery for post-competition',
      clients: 8,
      duration: '3 days',
      sleepTarget: 9,
      restDayFreq: 2,
      status: 'active',
      modalities: ['massage', 'ice-bath', 'sleep', 'meditation'],
      intensity: 'intensive',
      phase: 'competition-recovery',
      compliance: 92,
      createdAt: '2024-01-10',
      tags: ['competition', 'intensive', 'elite']
    },
    {
      id: 3,
      name: 'Injury Prevention',
      description: 'Preventive recovery protocol',
      clients: 22,
      duration: '7 days',
      sleepTarget: 8,
      restDayFreq: 3,
      status: 'draft',
      modalities: ['foam-rolling', 'stretching', 'compression'],
      intensity: 'light',
      phase: 'prevention',
      compliance: 75,
      createdAt: '2024-01-20',
      tags: ['prevention', 'mobility', 'maintenance']
    }
  ];

  const mockClients = [
    {
      id: 1,
      name: 'Sarah Johnson',
      avatar: 'https://i.pravatar.cc/100?img=1',
      currentProtocol: 'Post-Training Recovery',
      sleepAvg: 7.2,
      recoveryScore: 85,
      lastUpdate: '2 hours ago',
      nextSession: 'Tomorrow 6:00 AM',
      status: 'recovering',
      compliance: 88,
      recentActivities: ['Sleep: 7.5h', 'Stretching: 15min', 'Hydration: 2.8L']
    },
    {
      id: 2,
      name: 'Mike Chen',
      avatar: 'https://i.pravatar.cc/100?img=2',
      currentProtocol: 'Competition Recovery',
      sleepAvg: 8.5,
      recoveryScore: 92,
      lastUpdate: '30 min ago',
      nextSession: 'Rest Day',
      status: 'recovered',
      compliance: 95,
      recentActivities: ['Sleep: 9h', 'Ice Bath: 10min', 'Massage: 60min']
    },
    {
      id: 3,
      name: 'Emma Davis',
      avatar: 'https://i.pravatar.cc/100?img=3',
      currentProtocol: null,
      sleepAvg: 6.8,
      recoveryScore: 68,
      lastUpdate: '1 day ago',
      nextSession: 'Training 4:00 PM',
      status: 'needs-attention',
      compliance: 65,
      recentActivities: ['Sleep: 6.5h', 'No recovery activities']
    }
  ];

  const recoveryPhases = [
    { key: 'active-recovery', label: 'Active Recovery', color: COLORS.success },
    { key: 'post-workout', label: 'Post-Workout', color: COLORS.primary },
    { key: 'competition-recovery', label: 'Competition Recovery', color: '#FF6900' },
    { key: 'injury-recovery', label: 'Injury Recovery', color: COLORS.error },
    { key: 'prevention', label: 'Prevention', color: '#9013FE' },
    { key: 'maintenance', label: 'Maintenance', color: '#50E3C2' }
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

  const handleCreateProtocol = () => {
    if (!newProtocol.name.trim()) {
      Alert.alert('Error', 'Please enter a protocol name');
      return;
    }

    if (newProtocol.modalities.length === 0) {
      Alert.alert('Error', 'Please select at least one recovery modality');
      return;
    }

    // Create protocol logic here
    Vibration.vibrate(50);
    Alert.alert(
      'Success! 🎉',
      'Recovery protocol created successfully',
      [{ text: 'OK', onPress: () => setShowCreateModal(false) }]
    );

    // Reset form
    setNewProtocol({
      name: '',
      description: '',
      duration: '7',
      sleepTarget: 8,
      restDayFrequency: 2,
      modalities: [],
      intensity: 'moderate',
      phase: 'active-recovery',
      autoReminders: true,
      customInstructions: ''
    });
  };

  const handleAssignProtocol = () => {
    if (!selectedProtocol || !selectedClient) {
      Alert.alert('Error', 'Please select both a protocol and client');
      return;
    }

    Vibration.vibrate(50);
    Alert.alert(
      'Protocol Assigned! 💪',
      `${selectedProtocol.name} has been assigned to ${selectedClient.name}`,
      [{ text: 'OK', onPress: () => setShowAssignModal(false) }]
    );

    setSelectedProtocol(null);
    setSelectedClient(null);
  };

  const toggleModality = (modalityId) => {
    setNewProtocol(prev => ({
      ...prev,
      modalities: prev.modalities.includes(modalityId)
        ? prev.modalities.filter(id => id !== modalityId)
        : [...prev.modalities, modalityId]
    }));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'recovered': return COLORS.success;
      case 'recovering': return COLORS.primary;
      case 'needs-attention': return COLORS.error;
      default: return '#666';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'recovered': return 'check-circle';
      case 'recovering': return 'refresh';
      case 'needs-attention': return 'warning';
      default: return 'help';
    }
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
              Recovery Protocols 💪
            </Text>
            <Text style={[TEXT_STYLES.body, styles.headerSubtitle]}>
              Optimize athlete recovery & performance
            </Text>
          </View>
          <TouchableOpacity
            style={styles.notificationButton}
            onPress={() => Alert.alert('Feature Coming Soon! 🚀', 'Recovery alerts will be available in the next update.')}
          >
            <Icon name="healing" size={24} color="#ffffff" />
            <Badge style={styles.notificationBadge}>5</Badge>
          </TouchableOpacity>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>18</Text>
            <Text style={styles.statLabel}>Active Protocols</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>7.8h</Text>
            <Text style={styles.statLabel}>Avg Sleep</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>86%</Text>
            <Text style={styles.statLabel}>Recovery Score</Text>
          </View>
        </View>
      </View>
    </LinearGradient>
  );

  const renderTabBar = () => (
    <View style={styles.tabContainer}>
      {[
        { key: 'protocols', label: 'Protocols', icon: 'healing' },
        { key: 'clients', label: 'Monitoring', icon: 'monitor-heart' },
        { key: 'analytics', label: 'Analytics', icon: 'analytics' }
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

  const renderProtocolCard = ({ item }) => (
    <Card style={styles.protocolCard} elevation={2}>
      <Card.Content>
        <View style={styles.protocolHeader}>
          <View style={styles.protocolInfo}>
            <Text style={[TEXT_STYLES.h3, styles.protocolName]}>{item.name}</Text>
            <Text style={[TEXT_STYLES.caption, styles.protocolDescription]}>
              {item.description}
            </Text>
          </View>
          <View style={styles.protocolActions}>
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

        <View style={styles.protocolMetrics}>
          <View style={styles.metric}>
            <Icon name="people" size={20} color={COLORS.primary} />
            <Text style={styles.metricValue}>{item.clients}</Text>
            <Text style={styles.metricLabel}>Clients</Text>
          </View>
          <View style={styles.metric}>
            <Icon name="schedule" size={20} color={COLORS.success} />
            <Text style={styles.metricValue}>{item.duration}</Text>
            <Text style={styles.metricLabel}>Duration</Text>
          </View>
          <View style={styles.metric}>
            <Icon name="bedtime" size={20} color="#FF6900" />
            <Text style={styles.metricValue}>{item.sleepTarget}h</Text>
            <Text style={styles.metricLabel}>Sleep Target</Text>
          </View>
          <View style={styles.metric}>
            <Icon name="trending-up" size={20} color={COLORS.success} />
            <Text style={styles.metricValue}>{item.compliance}%</Text>
            <Text style={styles.metricLabel}>Compliance</Text>
          </View>
        </View>

        <View style={styles.modalitiesPreview}>
          <Text style={styles.modalitiesTitle}>Recovery Modalities:</Text>
          <View style={styles.modalitiesContainer}>
            {item.modalities.slice(0, 3).map((modalityId) => {
              const modality = recoveryModalities.find(m => m.id === modalityId);
              return modality ? (
                <View key={modalityId} style={[styles.modalityIcon, { backgroundColor: `${modality.color}15` }]}>
                  <Icon name={modality.icon} size={16} color={modality.color} />
                </View>
              ) : null;
            })}
            {item.modalities.length > 3 && (
              <Text style={styles.moreModalities}>+{item.modalities.length - 3}</Text>
            )}
          </View>
        </View>

        <View style={styles.phaseContainer}>
          <Chip
            style={[styles.phaseChip, { backgroundColor: `${recoveryPhases.find(p => p.key === item.phase)?.color || COLORS.primary}15` }]}
            textStyle={[styles.phaseText, { color: recoveryPhases.find(p => p.key === item.phase)?.color || COLORS.primary }]}
          >
            {recoveryPhases.find(p => p.key === item.phase)?.label || item.phase}
          </Chip>
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
            setSelectedProtocol(item);
            setShowAssignModal(true);
          }}
          style={styles.actionButton}
        >
          Assign
        </Button>
        <Button 
          mode="contained" 
          onPress={() => Alert.alert('Feature Coming Soon! 🚀', 'Protocol editing will be available in the next update.')}
          style={styles.actionButton}
        >
          Edit
        </Button>
      </Card.Actions>
    </Card>
  );

  const renderClientMonitoringCard = ({ item }) => (
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
            <Text style={[TEXT_STYLES.caption, styles.clientProtocol]}>
              {item.currentProtocol || 'No active protocol'}
            </Text>
            <Text style={[TEXT_STYLES.caption, styles.nextSession]}>
              Next: {item.nextSession}
            </Text>
          </View>
          <View style={styles.statusContainer}>
            <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(item.status) }]}>
              <Icon name={getStatusIcon(item.status)} size={20} color="#ffffff" />
            </View>
            <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
              {item.status.replace('-', ' ')}
            </Text>
          </View>
        </View>

        <View style={styles.recoveryMetrics}>
          <View style={styles.recoveryMetric}>
            <Text style={styles.recoveryMetricLabel}>Recovery Score</Text>
            <Text style={[styles.recoveryMetricValue, { 
              color: item.recoveryScore >= 80 ? COLORS.success : 
                     item.recoveryScore >= 60 ? '#FF9800' : COLORS.error 
            }]}>
              {item.recoveryScore}
            </Text>
            <ProgressBar 
              progress={item.recoveryScore / 100} 
              color={item.recoveryScore >= 80 ? COLORS.success : 
                     item.recoveryScore >= 60 ? '#FF9800' : COLORS.error}
              style={styles.recoveryProgressBar}
            />
          </View>
          
          <View style={styles.recoveryMetric}>
            <Text style={styles.recoveryMetricLabel}>Sleep Average</Text>
            <Text style={[styles.recoveryMetricValue, { 
              color: item.sleepAvg >= 7.5 ? COLORS.success : 
                     item.sleepAvg >= 6.5 ? '#FF9800' : COLORS.error 
            }]}>
              {item.sleepAvg}h
            </Text>
            <ProgressBar 
              progress={item.sleepAvg / 10} 
              color={item.sleepAvg >= 7.5 ? COLORS.success : 
                     item.sleepAvg >= 6.5 ? '#FF9800' : COLORS.error}
              style={styles.recoveryProgressBar}
            />
          </View>
        </View>

        <View style={styles.recentActivities}>
          <Text style={styles.activitiesTitle}>Recent Activities:</Text>
          {item.recentActivities.map((activity, index) => (
            <Text key={index} style={styles.activityItem}>• {activity}</Text>
          ))}
        </View>

        <View style={styles.complianceSection}>
          <Text style={styles.complianceLabel}>Protocol Compliance</Text>
          <View style={styles.complianceRow}>
            <ProgressBar 
              progress={item.compliance / 100} 
              color={item.compliance >= 80 ? COLORS.success : 
                     item.compliance >= 60 ? '#FF9800' : COLORS.error}
              style={styles.complianceBar}
            />
            <Text style={[styles.complianceValue, {
              color: item.compliance >= 80 ? COLORS.success : 
                     item.compliance >= 60 ? '#FF9800' : COLORS.error
            }]}>
              {item.compliance}%
            </Text>
          </View>
        </View>
      </Card.Content>

      <Card.Actions>
        <Button 
          mode="outlined" 
          onPress={() => Alert.alert('Feature Coming Soon! 🚀', 'Detailed recovery tracking will be available in the next update.')}
        >
          View Details
        </Button>
        <Button 
          mode="contained" 
          onPress={() => {
            setSelectedClient(item);
            setShowAssignModal(true);
          }}
        >
          Update Protocol
        </Button>
      </Card.Actions>
    </Card>
  );

  const renderAnalyticsView = () => (
    <ScrollView style={styles.analyticsContainer} showsVerticalScrollIndicator={false}>
      <Card style={styles.analyticsCard} elevation={2}>
        <Card.Content>
          <Text style={[TEXT_STYLES.h3, styles.analyticsTitle]}>Recovery Trends 📊</Text>
          
          <View style={styles.trendMetrics}>
            <View style={styles.trendMetric}>
              <Icon name="trending-up" size={24} color={COLORS.success} />
              <Text style={styles.trendValue}>+12%</Text>
              <Text style={styles.trendLabel}>Sleep Quality</Text>
            </View>
            <View style={styles.trendMetric}>
              <Icon name="trending-up" size={24} color={COLORS.success} />
              <Text style={styles.trendValue}>+8%</Text>
              <Text style={styles.trendLabel}>Compliance</Text>
            </View>
            <View style={styles.trendMetric}>
              <Icon name="trending-down" size={24} color={COLORS.error} />
              <Text style={styles.trendValue}>-5%</Text>
              <Text style={styles.trendLabel}>Fatigue Levels</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.analyticsCard} elevation={2}>
        <Card.Content>
          <Text style={[TEXT_STYLES.h3, styles.analyticsTitle]}>Popular Modalities 🎯</Text>
          
          {recoveryModalities.slice(0, 5).map((modality, index) => (
            <View key={modality.id} style={styles.modalityUsage}>
              <View style={styles.modalityInfo}>
                <Icon name={modality.icon} size={20} color={modality.color} />
                <Text style={styles.modalityName}>{modality.name}</Text>
              </View>
              <View style={styles.modalityProgress}>
                <ProgressBar 
                  progress={0.8 - (index * 0.15)} 
                  color={modality.color}
                  style={styles.modalityProgressBar}
                />
                <Text style={styles.modalityPercentage}>
                  {Math.round((0.8 - (index * 0.15)) * 100)}%
                </Text>
              </View>
            </View>
          ))}
        </Card.Content>
      </Card>

      <Card style={styles.analyticsCard} elevation={2}>
        <Card.Content>
          <Text style={[TEXT_STYLES.h3, styles.analyticsTitle]}>Recovery Insights 💡</Text>
          
          <View style={styles.insights}>
            <View style={styles.insight}>
              <Icon name="lightbulb-outline" size={20} color="#FF9800" />
              <Text style={styles.insightText}>
                Athletes with 8+ hours sleep show 15% better recovery scores
              </Text>
            </View>
            <View style={styles.insight}>
              <Icon name="lightbulb-outline" size={20} color="#FF9800" />
              <Text style={styles.insightText}>
                Cold therapy protocols increase compliance by 23%
              </Text>
            </View>
            <View style={styles.insight}>
              <Icon name="lightbulb-outline" size={20} color="#FF9800" />
              <Text style={styles.insightText}>
                Morning recovery sessions have 40% higher completion rates
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>
    </ScrollView>
  );

  const renderCreateModal = () => (
    <Portal>
      <Modal
        visible={showCreateModal}
        onDismiss={() => setShowCreateModal(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <ScrollView style={styles.modalContent}>
          <Text style={[TEXT_STYLES.h2, styles.modalTitle]}>Create Recovery Protocol 💪</Text>
          
          <TextInput
            label="Protocol Name"
            value={newProtocol.name}
            onChangeText={(text) => setNewProtocol(prev => ({ ...prev, name: text }))}
            style={styles.input}
            mode="outlined"
          />
          
          <TextInput
            label="Description"
            value={newProtocol.description}
            onChangeText={(text) => setNewProtocol(prev => ({ ...prev, description: text }))}
            style={styles.input}
            mode="outlined"
            multiline
            numberOfLines={3}
          />

          <Text style={styles.sectionTitle}>Recovery Phase</Text>
          <ScrollView horizontal style={styles.phaseSelector} showsHorizontalScrollIndicator={false}>
            {recoveryPhases.map((phase) => (
              <TouchableOpacity
                key={phase.key}
                style={[styles.phaseOption, 
                  newProtocol.phase === phase.key && { backgroundColor: `${phase.color}15`, borderColor: phase.color }
                ]}
                onPress={() => setNewProtocol(prev => ({ ...prev, phase: phase.key }))}
              >
                <Text style={[styles.phaseOptionText, 
                  newProtocol.phase === phase.key && { color: phase.color }
                ]}>
                  {phase.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={styles.sectionTitle}>Sleep Target: {newProtocol.sleepTarget} hours</Text>
          <Slider
            style={styles.slider}
            minimumValue={6}
            maximumValue={10}
            step={0.5}
            value={newProtocol.sleepTarget}
            onValueChange={(value) => setNewProtocol(prev => ({ ...prev, sleepTarget: value }))}
            thumbStyle={{ backgroundColor: COLORS.primary }}
            trackStyle={{ backgroundColor: `${COLORS.primary}30` }}
            minimumTrackTintColor={COLORS.primary}
          />

          <Text style={styles.sectionTitle}>Recovery Modalities</Text>
          <TouchableOpacity
            style={styles.modalitiesButton}
            onPress={() => setShowModalityModal(true)}
          >
            <Icon name="healing" size={20} color={COLORS.primary} />
            <Text style={styles.modalitiesButtonText}>
              Select Modalities ({newProtocol.modalities.length})
            </Text>
            <Icon name="chevron-right" size={20} color="#666" />
          </TouchableOpacity>

          <View style={styles.switchContainer}>
            <Text style={styles.switchLabel}>Auto Reminders</Text>
            <Switch
              value={newProtocol.autoReminders}
              onValueChange={(value) => setNewProtocol(prev => ({ ...prev, autoReminders: value }))}
              color={COLORS.primary}
            />
          </View>

          <TextInput
            label="Custom Instructions (Optional)"
            value={newProtocol.customInstructions}
            onChangeText={(text) => setNewProtocol(prev => ({ ...prev, customInstructions: text }))}
            style={styles.input}
            mode="outlined"
            multiline
            numberOfLines={4}
          />

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
              onPress={handleCreateProtocol}
              style={styles.modalButton}
            >
              Create Protocol
            </Button>
          </View>
        </ScrollView>
      </Modal>
    </Portal>
  );

  const renderModalityModal = () => (
    <Portal>
      <Modal
        visible={showModalityModal}
        onDismiss={() => setShowModalityModal(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <View style={styles.modalContent}>
          <Text style={[TEXT_STYLES.h2, styles.modalTitle]}>Select Recovery Modalities 🔧</Text>
          
          <ScrollView style={styles.modalitiesList} showsVerticalScrollIndicator={false}>
            {recoveryModalities.map((modality) => (
              <TouchableOpacity
                key={modality.id}
                style={[styles.modalityItem, 
                  newProtocol.modalities.includes(modality.id) && styles.selectedModality
                ]}
                onPress={() => toggleModality(modality.id)}
              >
                <View style={[styles.modalityIconContainer, { backgroundColor: `${modality.color}15` }]}>
                  <Icon name={modality.icon} size={24} color={modality.color} />
                </View>
                <View style={styles.modalityDetails}>
                  <Text style={styles.modalityItemName}>{modality.name}</Text>
                  <Text style={styles.modalityDescription}>
                    {getModalityDescription(modality.id)}
                  </Text>
                </View>
                {newProtocol.modalities.includes(modality.id) && (
                  <Icon name="check-circle" size={24} color={COLORS.success} />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.modalActions}>
            <Button
              mode="contained"
              onPress={() => setShowModalityModal(false)}
              style={styles.modalButton}
            >
              Done ({newProtocol.modalities.length} selected)
            </Button>
          </View>
        </View>
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
          <Text style={[TEXT_STYLES.h2, styles.modalTitle]}>Assign Recovery Protocol 🎯</Text>
          
          <Text style={styles.sectionTitle}>Select Protocol</Text>
          <ScrollView horizontal style={styles.protocolSelector} showsHorizontalScrollIndicator={false}>
            {mockProtocols.map((protocol) => (
              <TouchableOpacity
                key={protocol.id}
                style={[styles.protocolOption, selectedProtocol?.id === protocol.id && styles.selectedProtocol]}
                onPress={() => setSelectedProtocol(protocol)}
              >
                <Text style={styles.protocolOptionName}>{protocol.name}</Text>
                <Text style={styles.protocolOptionDuration}>{protocol.duration}</Text>
                <View style={styles.protocolOptionModalities}>
                  {protocol.modalities.slice(0, 3).map((modalityId) => {
                    const modality = recoveryModalities.find(m => m.id === modalityId);
                    return modality ? (
                      <Icon key={modalityId} name={modality.icon} size={12} color={modality.color} />
                    ) : null;
                  })}
                </View>
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
                  <Text style={styles.clientOptionProtocol}>
                    {client.currentProtocol || 'No active protocol'}
                  </Text>
                  <View style={styles.clientOptionStats}>
                    <Text style={styles.clientOptionStat}>Recovery: {client.recoveryScore}%</Text>
                    <Text style={styles.clientOptionStat}>Sleep: {client.sleepAvg}h</Text>
                  </View>
                </View>
                <View style={[styles.clientStatusDot, { backgroundColor: getStatusColor(client.status) }]} />
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
              onPress={handleAssignProtocol}
              style={styles.modalButton}
            >
              Assign Protocol
            </Button>
          </View>
        </View>
      </Modal>
    </Portal>
  );

  const getModalityDescription = (modalityId) => {
    const descriptions = {
      'sleep': 'Optimize sleep quality and duration',
      'stretching': 'Dynamic and static stretching routines',
      'massage': 'Professional massage therapy sessions',
      'sauna': 'Heat therapy for muscle recovery',
      'ice-bath': 'Cold water immersion therapy',
      'meditation': 'Mindfulness and breathing exercises',
      'foam-rolling': 'Self-massage with foam rollers',
      'compression': 'Compression garments and therapy',
      'hydration': 'Structured hydration protocols',
      'nutrition': 'Recovery-focused nutrition plans'
    };
    return descriptions[modalityId] || 'Recovery modality';
  };

  const renderContent = () => {
    if (activeTab === 'analytics') {
      return renderAnalyticsView();
    }

    const data = activeTab === 'protocols' ? mockProtocols : mockClients;
    const filtered = data.filter(item => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (filtered.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Icon name="healing" size={80} color="#cccccc" />
          <Text style={[TEXT_STYLES.h3, styles.emptyTitle]}>
            No {activeTab} found
          </Text>
          <Text style={[TEXT_STYLES.body, styles.emptyMessage]}>
            {activeTab === 'protocols' && "Create your first recovery protocol to get started!"}
            {activeTab === 'clients' && "Add clients to start monitoring their recovery."}
          </Text>
        </View>
      );
    }

    const renderItem = activeTab === 'protocols' ? renderProtocolCard : renderClientMonitoringCard;

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
      />
    );
  };

  return (
    <View style={styles.container}>
      {renderHeader()}
      
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {renderTabBar()}
        
        {activeTab !== 'analytics' && (
          <Searchbar
            placeholder={`Search ${activeTab}...`}
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchbar}
            iconColor={COLORS.primary}
          />
        )}

        {renderContent()}
      </Animated.View>

      <FAB
        style={styles.fab}
        icon="add"
        label="Create Protocol"
        onPress={() => setShowCreateModal(true)}
        color="#ffffff"
      />

      {renderCreateModal()}
      {renderModalityModal()}
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
  protocolCard: {
    marginBottom: SPACING.md,
    borderRadius: 12,
  },
  protocolHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  protocolInfo: {
    flex: 1,
  },
  protocolName: {
    color: COLORS.text,
    marginBottom: 4,
  },
  protocolDescription: {
    color: '#666',
  },
  protocolActions: {
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
  protocolMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: SPACING.sm,
    marginBottom: SPACING.md,
  },
  metric: {
    alignItems: 'center',
    flex: 1,
  },
  metricValue: {
    ...TEXT_STYLES.body,
    color: COLORS.text,
    fontWeight: 'bold',
    marginTop: 2,
  },
  metricLabel: {
    ...TEXT_STYLES.caption,
    color: '#666',
    marginTop: 2,
    textAlign: 'center',
  },
  modalitiesPreview: {
    marginBottom: SPACING.md,
  },
  modalitiesTitle: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  modalitiesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalityIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.xs,
  },
  moreModalities: {
    ...TEXT_STYLES.caption,
    color: '#666',
    marginLeft: SPACING.xs,
  },
  phaseContainer: {
    marginBottom: SPACING.md,
  },
  phaseChip: {
    alignSelf: 'flex-start',
  },
  phaseText: {
    fontSize: 12,
    fontWeight: '500',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
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
  clientProtocol: {
    color: COLORS.primary,
    fontWeight: '500',
  },
  nextSession: {
    color: '#666',
    marginTop: 2,
  },
  statusContainer: {
    alignItems: 'center',
  },
  statusIndicator: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  statusText: {
    ...TEXT_STYLES.caption,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  recoveryMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  recoveryMetric: {
    flex: 0.48,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: SPACING.sm,
  },
  recoveryMetricLabel: {
    ...TEXT_STYLES.caption,
    color: '#666',
    marginBottom: 4,
  },
  recoveryMetricValue: {
    ...TEXT_STYLES.h2,
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  recoveryProgressBar: {
    height: 4,
    borderRadius: 2,
  },
  recentActivities: {
    marginBottom: SPACING.md,
  },
  activitiesTitle: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  activityItem: {
    ...TEXT_STYLES.caption,
    color: '#666',
    marginBottom: 2,
  },
  complianceSection: {
    marginTop: SPACING.sm,
  },
  complianceLabel: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  complianceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  complianceBar: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    marginRight: SPACING.sm,
  },
  complianceValue: {
    ...TEXT_STYLES.body,
    fontWeight: 'bold',
  },
  analyticsContainer: {
    padding: SPACING.md,
  },
  analyticsCard: {
    marginBottom: SPACING.md,
    borderRadius: 12,
  },
  analyticsTitle: {
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  trendMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  trendMetric: {
    alignItems: 'center',
    flex: 1,
  },
  trendValue: {
    ...TEXT_STYLES.h3,
    fontWeight: 'bold',
    marginVertical: SPACING.xs,
  },
  trendLabel: {
    ...TEXT_STYLES.caption,
    color: '#666',
    textAlign: 'center',
  },
  modalityUsage: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  modalityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  modalityName: {
    ...TEXT_STYLES.body,
    marginLeft: SPACING.sm,
    flex: 1,
  },
  modalityProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  modalityProgressBar: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    marginRight: SPACING.sm,
  },
  modalityPercentage: {
    ...TEXT_STYLES.caption,
    color: '#666',
    width: 35,
  },
  insights: {
    marginTop: SPACING.sm,
  },
  insight: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  insightText: {
    ...TEXT_STYLES.body,
    color: '#666',
    marginLeft: SPACING.sm,
    flex: 1,
    lineHeight: 20,
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
    maxHeight: '85%',
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
  phaseSelector: {
    maxHeight: 50,
    marginBottom: SPACING.md,
  },
  phaseOption: {
    backgroundColor: '#f8f9fa',
    borderRadius: 20,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginRight: SPACING.sm,
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  phaseOptionText: {
    ...TEXT_STYLES.body,
    color: '#666',
    fontWeight: '500',
  },
  slider: {
    width: '100%',
    height: 40,
    marginBottom: SPACING.md,
  },
  modalitiesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  modalitiesButtonText: {
    ...TEXT_STYLES.body,
    flex: 1,
    marginLeft: SPACING.sm,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    marginBottom: SPACING.md,
  },
  switchLabel: {
    ...TEXT_STYLES.body,
    color: COLORS.text,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.xl,
  },
  modalButton: {
    flex: 0.45,
  },
  modalitiesList: {
    maxHeight: 300,
    marginBottom: SPACING.md,
  },
  modalityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: 8,
    marginBottom: SPACING.xs,
    backgroundColor: '#f8f9fa',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedModality: {
    backgroundColor: `${COLORS.primary}10`,
    borderColor: COLORS.primary,
  },
  modalityIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  modalityDetails: {
    flex: 1,
  },
  modalityItemName: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    marginBottom: 2,
  },
  modalityDescription: {
    ...TEXT_STYLES.caption,
    color: '#666',
  },
  protocolSelector: {
    maxHeight: 120,
    marginBottom: SPACING.md,
  },
  protocolOption: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: SPACING.md,
    marginRight: SPACING.sm,
    minWidth: 140,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedProtocol: {
    backgroundColor: `${COLORS.primary}15`,
    borderColor: COLORS.primary,
  },
  protocolOptionName: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    marginBottom: 4,
  },
  protocolOptionDuration: {
    ...TEXT_STYLES.caption,
    color: '#666',
    marginBottom: 4,
  },
  protocolOptionModalities: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  clientOptionProtocol: {
    ...TEXT_STYLES.caption,
    color: '#666',
    marginTop: 2,
  },
  clientOptionStats: {
    flexDirection: 'row',
    marginTop: 2,
  },
  clientOptionStat: {
    ...TEXT_STYLES.caption,
    color: COLORS.primary,
    marginRight: SPACING.sm,
  },
  clientStatusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
};

export default RecoveryProtocols;