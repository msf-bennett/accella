import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  Dimensions,
  RefreshControl,
  Alert,
  StatusBar,
  TouchableOpacity,
  FlatList,
  Modal,
  TextInput,
} from 'react-native';
import { 
  Card,
  Button,
  Chip,
  Avatar,
  IconButton,
  Surface,
  Searchbar,
  FAB,
  Portal,
  Dialog,
  RadioButton,
  ProgressBar,
  Badge,
} from 'react-native-paper';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/LinearGradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';
import { COLORS } from '../../../styles/colors';
import { SPACING } from '../../../styles/spacing';
import { TEXT_STYLES } from '../../../styles/textStyles';
import { TYPOGRAPHY } from '../../../styles/typography';
import { LAYOUT } from '../../../styles/layout';

const { width } = Dimensions.get('window');

const InjuryTracking = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { players } = useSelector(state => state.coach);
  
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedSeverity, setSelectedSeverity] = useState('all');
  const [injuries, setInjuries] = useState([]);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);
  const [selectedInjury, setSelectedInjury] = useState(null);
  const [injuryData, setInjuryData] = useState({
    playerId: '',
    injuryType: '',
    bodyPart: '',
    severity: 'minor',
    description: '',
    dateOccurred: new Date().toISOString().split('T')[0],
    expectedRecovery: '',
    treatment: '',
    restrictions: '',
  });

  // Mock data - replace with actual API calls
  const mockInjuries = [
    {
      id: '1',
      playerId: 'p1',
      playerName: 'John Smith',
      playerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      injuryType: 'Ankle Sprain',
      bodyPart: 'Ankle',
      severity: 'moderate',
      status: 'recovering',
      dateOccurred: '2024-08-10',
      expectedRecovery: '2024-08-24',
      daysOut: 6,
      totalEstimatedDays: 14,
      recoveryProgress: 43,
      treatment: 'Physical therapy, ice, compression',
      restrictions: 'No running or jumping exercises',
      lastUpdate: '2024-08-16',
      medicalClearance: false,
      notes: 'Player reports reduced pain and swelling',
    },
    {
      id: '2',
      playerId: 'p2',
      playerName: 'Emily Johnson',
      playerAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b332c76a?w=150&h=150&fit=crop&crop=face',
      injuryType: 'Hamstring Strain',
      bodyPart: 'Hamstring',
      severity: 'minor',
      status: 'cleared',
      dateOccurred: '2024-08-01',
      expectedRecovery: '2024-08-08',
      daysOut: 7,
      totalEstimatedDays: 7,
      recoveryProgress: 100,
      treatment: 'Rest, stretching, gradual return',
      restrictions: 'None - cleared for full activity',
      lastUpdate: '2024-08-08',
      medicalClearance: true,
      notes: 'Full recovery achieved, cleared by team doctor',
    },
    {
      id: '3',
      playerId: 'p3',
      playerName: 'Mike Davis',
      playerAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      injuryType: 'Concussion',
      bodyPart: 'Head',
      severity: 'major',
      status: 'out',
      dateOccurred: '2024-08-14',
      expectedRecovery: '2024-08-28',
      daysOut: 2,
      totalEstimatedDays: 14,
      recoveryProgress: 14,
      treatment: 'Complete rest, concussion protocol',
      restrictions: 'No physical activity, cognitive rest',
      lastUpdate: '2024-08-16',
      medicalClearance: false,
      notes: 'Following return-to-play protocol, symptoms improving',
    },
    {
      id: '4',
      playerId: 'p4',
      playerName: 'Sarah Wilson',
      playerAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      injuryType: 'Knee Strain',
      bodyPart: 'Knee',
      severity: 'minor',
      status: 'recovering',
      dateOccurred: '2024-08-12',
      expectedRecovery: '2024-08-19',
      daysOut: 4,
      totalEstimatedDays: 7,
      recoveryProgress: 57,
      treatment: 'Ice, elevation, light therapy',
      restrictions: 'Limited contact drills',
      lastUpdate: '2024-08-16',
      medicalClearance: false,
      notes: 'Good progress, pain decreasing',
    },
  ];

  const mockPlayers = [
    { id: 'p1', name: 'John Smith', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face' },
    { id: 'p2', name: 'Emily Johnson', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b332c76a?w=150&h=150&fit=crop&crop=face' },
    { id: 'p3', name: 'Mike Davis', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face' },
    { id: 'p4', name: 'Sarah Wilson', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face' },
  ];

  const injuryTypes = [
    'Ankle Sprain', 'Hamstring Strain', 'Knee Injury', 'Shoulder Injury',
    'Concussion', 'Muscle Strain', 'Fracture', 'Bruise/Contusion', 'Other'
  ];

  const bodyParts = [
    'Head', 'Neck', 'Shoulder', 'Arm', 'Elbow', 'Wrist', 'Hand',
    'Chest', 'Back', 'Abdomen', 'Hip', 'Thigh', 'Knee', 'Shin',
    'Ankle', 'Foot', 'Other'
  ];

  const severityLevels = [
    { value: 'minor', label: 'Minor', color: '#4CAF50', days: '1-3 days' },
    { value: 'moderate', label: 'Moderate', color: '#FF9800', days: '4-14 days' },
    { value: 'major', label: 'Major', color: '#F44336', days: '15+ days' },
  ];

  const statusTypes = [
    { value: 'all', label: 'All Status', icon: 'list' },
    { value: 'out', label: 'Out', icon: 'block', color: '#F44336' },
    { value: 'recovering', label: 'Recovering', icon: 'healing', color: '#FF9800' },
    { value: 'cleared', label: 'Cleared', icon: 'check-circle', color: '#4CAF50' },
  ];

  useEffect(() => {
    loadInjuries();
  }, []);

  const loadInjuries = useCallback(() => {
    setInjuries(mockInjuries);
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadInjuries();
    setTimeout(() => setRefreshing(false), 1000);
  }, [loadInjuries]);

  const filteredInjuries = injuries.filter(injury => {
    const matchesSearch = injury.playerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         injury.injuryType.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         injury.bodyPart.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || injury.status === selectedStatus;
    const matchesSeverity = selectedSeverity === 'all' || injury.severity === selectedSeverity;
    return matchesSearch && matchesStatus && matchesSeverity;
  });

  const getStatusColor = (status) => {
    const statusConfig = statusTypes.find(s => s.value === status);
    return statusConfig?.color || COLORS.secondary;
  };

  const getSeverityColor = (severity) => {
    const severityConfig = severityLevels.find(s => s.value === severity);
    return severityConfig?.color || COLORS.secondary;
  };

  const handleReportInjury = () => {
    if (!injuryData.playerId || !injuryData.injuryType || !injuryData.bodyPart) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const newInjury = {
      id: Date.now().toString(),
      ...injuryData,
      playerName: mockPlayers.find(p => p.id === injuryData.playerId)?.name || 'Unknown',
      playerAvatar: mockPlayers.find(p => p.id === injuryData.playerId)?.avatar || '',
      status: 'out',
      daysOut: 0,
      totalEstimatedDays: parseInt(injuryData.expectedRecovery) || 7,
      recoveryProgress: 0,
      lastUpdate: new Date().toISOString().split('T')[0],
      medicalClearance: false,
      notes: `Initial injury report: ${injuryData.description}`,
    };

    setInjuries([...injuries, newInjury]);
    resetReportDialog();
    Alert.alert('Success', 'Injury reported successfully! 🏥');
  };

  const handleUpdateInjury = () => {
    const updatedInjuries = injuries.map(injury =>
      injury.id === selectedInjury.id
        ? {
            ...injury,
            ...injuryData,
            lastUpdate: new Date().toISOString().split('T')[0],
          }
        : injury
    );

    setInjuries(updatedInjuries);
    resetUpdateDialog();
    Alert.alert('Success', 'Injury updated successfully! ✅');
  };

  const resetReportDialog = () => {
    setShowReportDialog(false);
    setInjuryData({
      playerId: '',
      injuryType: '',
      bodyPart: '',
      severity: 'minor',
      description: '',
      dateOccurred: new Date().toISOString().split('T')[0],
      expectedRecovery: '',
      treatment: '',
      restrictions: '',
    });
  };

  const resetUpdateDialog = () => {
    setShowUpdateDialog(false);
    setSelectedInjury(null);
    setInjuryData({
      playerId: '',
      injuryType: '',
      bodyPart: '',
      severity: 'minor',
      description: '',
      dateOccurred: new Date().toISOString().split('T')[0],
      expectedRecovery: '',
      treatment: '',
      restrictions: '',
    });
  };

  const openUpdateDialog = (injury) => {
    setSelectedInjury(injury);
    setInjuryData({
      playerId: injury.playerId,
      injuryType: injury.injuryType,
      bodyPart: injury.bodyPart,
      severity: injury.severity,
      description: injury.notes,
      dateOccurred: injury.dateOccurred,
      expectedRecovery: injury.expectedRecovery,
      treatment: injury.treatment,
      restrictions: injury.restrictions,
    });
    setShowUpdateDialog(true);
  };

  const renderSummaryStats = () => {
    const activeInjuries = injuries.filter(i => i.status !== 'cleared').length;
    const recoveryRate = Math.round((injuries.filter(i => i.status === 'cleared').length / injuries.length) * 100) || 0;
    const avgRecoveryTime = Math.round(injuries.reduce((sum, i) => sum + i.totalEstimatedDays, 0) / injuries.length) || 0;

    return (
      <Card style={styles.summaryCard}>
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={styles.summaryGradient}
        >
          <Text style={styles.summaryTitle}>🏥 Injury Overview</Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryNumber}>{activeInjuries}</Text>
              <Text style={styles.summaryLabel}>Active Injuries</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryNumber}>{recoveryRate}%</Text>
              <Text style={styles.summaryLabel}>Recovery Rate</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryNumber}>{injuries.length}</Text>
              <Text style={styles.summaryLabel}>Total Cases</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryNumber}>{avgRecoveryTime}</Text>
              <Text style={styles.summaryLabel}>Avg Days</Text>
            </View>
          </View>
        </LinearGradient>
      </Card>
    );
  };

  const renderFilters = () => (
    <View style={styles.filtersContainer}>
      <Text style={styles.sectionTitle}>🔍 Status Filter</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
        {statusTypes.map((status) => (
          <TouchableOpacity
            key={status.value}
            onPress={() => setSelectedStatus(status.value)}
            style={[
              styles.filterChip,
              selectedStatus === status.value && styles.selectedFilterChip
            ]}
          >
            <Icon 
              name={status.icon} 
              size={18} 
              color={selectedStatus === status.value ? 'white' : (status.color || COLORS.primary)} 
            />
            <Text style={[
              styles.filterText,
              selectedStatus === status.value && styles.selectedFilterText
            ]}>
              {status.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text style={styles.sectionTitle}>⚠️ Severity Filter</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
        <Chip
          mode={selectedSeverity === 'all' ? 'flat' : 'outlined'}
          selected={selectedSeverity === 'all'}
          onPress={() => setSelectedSeverity('all')}
          style={[styles.severityChip, selectedSeverity === 'all' && styles.selectedChip]}
        >
          All Levels
        </Chip>
        {severityLevels.map((severity) => (
          <Chip
            key={severity.value}
            mode={selectedSeverity === severity.value ? 'flat' : 'outlined'}
            selected={selectedSeverity === severity.value}
            onPress={() => setSelectedSeverity(severity.value)}
            style={[
              styles.severityChip,
              selectedSeverity === severity.value && { backgroundColor: severity.color }
            ]}
            textStyle={selectedSeverity === severity.value && { color: 'white' }}
          >
            {severity.label}
          </Chip>
        ))}
      </ScrollView>
    </View>
  );

  const renderInjuryCard = ({ item }) => (
    <Card style={styles.injuryCard}>
      <View style={styles.injuryHeader}>
        <Avatar.Image 
          size={50} 
          source={{ uri: item.playerAvatar }}
          style={styles.playerAvatar}
        />
        <View style={styles.injuryInfo}>
          <Text style={styles.playerName}>{item.playerName}</Text>
          <Text style={styles.injuryType}>{item.injuryType}</Text>
          <Text style={styles.bodyPart}>📍 {item.bodyPart}</Text>
        </View>
        <View style={styles.injuryStatus}>
          <Badge
            style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}
          >
            {item.status.toUpperCase()}
          </Badge>
          <Badge
            style={[styles.severityBadge, { backgroundColor: getSeverityColor(item.severity) }]}
          >
            {item.severity.toUpperCase()}
          </Badge>
        </View>
      </View>

      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressTitle}>🔄 Recovery Progress</Text>
          <Text style={styles.progressPercentage}>{item.recoveryProgress}%</Text>
        </View>
        <ProgressBar 
          progress={item.recoveryProgress / 100} 
          color={getStatusColor(item.status)}
          style={styles.progressBar}
        />
        <Text style={styles.progressText}>
          {item.daysOut} of {item.totalEstimatedDays} days • Expected: {item.expectedRecovery}
        </Text>
      </View>

      <View style={styles.injuryDetails}>
        <View style={styles.detailRow}>
          <Icon name="event" size={16} color={COLORS.secondary} />
          <Text style={styles.detailText}>Occurred: {item.dateOccurred}</Text>
        </View>
        <View style={styles.detailRow}>
          <Icon name="update" size={16} color={COLORS.secondary} />
          <Text style={styles.detailText}>Last updated: {item.lastUpdate}</Text>
        </View>
        {item.medicalClearance && (
          <View style={styles.detailRow}>
            <Icon name="verified" size={16} color={COLORS.success} />
            <Text style={[styles.detailText, { color: COLORS.success }]}>Medical clearance received</Text>
          </View>
        )}
      </View>

      {item.treatment && (
        <View style={styles.treatmentSection}>
          <Text style={styles.treatmentTitle}>💊 Current Treatment</Text>
          <Text style={styles.treatmentText}>{item.treatment}</Text>
        </View>
      )}

      {item.restrictions && (
        <View style={styles.restrictionsSection}>
          <Text style={styles.restrictionsTitle}>🚫 Activity Restrictions</Text>
          <Text style={styles.restrictionsText}>{item.restrictions}</Text>
        </View>
      )}

      <View style={styles.injuryActions}>
        <Button
          mode="outlined"
          onPress={() => openUpdateDialog(item)}
          style={styles.actionButton}
          icon="edit"
        >
          Update
        </Button>
        <Button
          mode="contained"
          onPress={() => navigation.navigate('InjuryDetails', { injuryId: item.id })}
          style={styles.actionButton}
          buttonColor={COLORS.primary}
        >
          Details
        </Button>
      </View>
    </Card>
  );

  const renderReportDialog = () => (
    <Portal>
      <Dialog visible={showReportDialog} onDismiss={resetReportDialog}>
        <Dialog.Title>🏥 Report New Injury</Dialog.Title>
        <Dialog.Content>
          <ScrollView showsVerticalScrollIndicator={false} style={styles.dialogContent}>
            <Text style={styles.dialogLabel}>Select Player *</Text>
            <RadioButton.Group
              onValueChange={value => setInjuryData({ ...injuryData, playerId: value })}
              value={injuryData.playerId}
            >
              {mockPlayers.map(player => (
                <RadioButton.Item key={player.id} label={player.name} value={player.id} />
              ))}
            </RadioButton.Group>

            <Text style={styles.dialogLabel}>Injury Type *</Text>
            <RadioButton.Group
              onValueChange={value => setInjuryData({ ...injuryData, injuryType: value })}
              value={injuryData.injuryType}
            >
              {injuryTypes.map(type => (
                <RadioButton.Item key={type} label={type} value={type} />
              ))}
            </RadioButton.Group>

            <Text style={styles.dialogLabel}>Body Part *</Text>
            <RadioButton.Group
              onValueChange={value => setInjuryData({ ...injuryData, bodyPart: value })}
              value={injuryData.bodyPart}
            >
              {bodyParts.slice(0, 8).map(part => (
                <RadioButton.Item key={part} label={part} value={part} />
              ))}
            </RadioButton.Group>

            <Text style={styles.dialogLabel}>Severity *</Text>
            <RadioButton.Group
              onValueChange={value => setInjuryData({ ...injuryData, severity: value })}
              value={injuryData.severity}
            >
              {severityLevels.map(severity => (
                <RadioButton.Item 
                  key={severity.value} 
                  label={`${severity.label} (${severity.days})`} 
                  value={severity.value} 
                />
              ))}
            </RadioButton.Group>

            <TextInput
              placeholder="Description of injury..."
              value={injuryData.description}
              onChangeText={(text) => setInjuryData({ ...injuryData, description: text })}
              style={styles.textInput}
              multiline
              numberOfLines={3}
            />

            <TextInput
              placeholder="Expected recovery date (YYYY-MM-DD)"
              value={injuryData.expectedRecovery}
              onChangeText={(text) => setInjuryData({ ...injuryData, expectedRecovery: text })}
              style={styles.textInput}
            />

            <TextInput
              placeholder="Treatment plan..."
              value={injuryData.treatment}
              onChangeText={(text) => setInjuryData({ ...injuryData, treatment: text })}
              style={styles.textInput}
              multiline
              numberOfLines={2}
            />

            <TextInput
              placeholder="Activity restrictions..."
              value={injuryData.restrictions}
              onChangeText={(text) => setInjuryData({ ...injuryData, restrictions: text })}
              style={styles.textInput}
              multiline
              numberOfLines={2}
            />
          </ScrollView>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={resetReportDialog}>Cancel</Button>
          <Button mode="contained" onPress={handleReportInjury}>Report</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );

  const renderUpdateDialog = () => (
    <Portal>
      <Dialog visible={showUpdateDialog} onDismiss={resetUpdateDialog}>
        <Dialog.Title>✏️ Update Injury Status</Dialog.Title>
        <Dialog.Content>
          <ScrollView showsVerticalScrollIndicator={false} style={styles.dialogContent}>
            <Text style={styles.dialogLabel}>Recovery Progress</Text>
            <TextInput
              placeholder="Recovery percentage (0-100)"
              value={injuryData.recoveryProgress?.toString() || ''}
              onChangeText={(text) => setInjuryData({ ...injuryData, recoveryProgress: parseInt(text) || 0 })}
              style={styles.textInput}
              keyboardType="numeric"
            />

            <Text style={styles.dialogLabel}>Current Status</Text>
            <RadioButton.Group
              onValueChange={value => setInjuryData({ ...injuryData, status: value })}
              value={injuryData.status}
            >
              <RadioButton.Item label="Out" value="out" />
              <RadioButton.Item label="Recovering" value="recovering" />
              <RadioButton.Item label="Cleared" value="cleared" />
            </RadioButton.Group>

            <TextInput
              placeholder="Updated treatment plan..."
              value={injuryData.treatment}
              onChangeText={(text) => setInjuryData({ ...injuryData, treatment: text })}
              style={styles.textInput}
              multiline
              numberOfLines={2}
            />

            <TextInput
              placeholder="Current restrictions..."
              value={injuryData.restrictions}
              onChangeText={(text) => setInjuryData({ ...injuryData, restrictions: text })}
              style={styles.textInput}
              multiline
              numberOfLines={2}
            />

            <TextInput
              placeholder="Progress notes..."
              value={injuryData.notes}
              onChangeText={(text) => setInjuryData({ ...injuryData, notes: text })}
              style={styles.textInput}
              multiline
              numberOfLines={3}
            />
          </ScrollView>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={resetUpdateDialog}>Cancel</Button>
          <Button mode="contained" onPress={handleUpdateInjury}>Update</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );

  const renderEmptyState = () => (
    <Surface style={styles.emptyState}>
      <Icon name="healing" size={80} color={COLORS.secondary} />
      <Text style={styles.emptyTitle}>No Injuries Found</Text>
      <Text style={styles.emptySubtitle}>
        Great news! No matching injuries in your records
      </Text>
    </Surface>
  );

  return (
    <View style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />
      
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <IconButton
            icon="arrow-back"
            iconColor="white"
            onPress={() => navigation.goBack()}
          />
          <Text style={styles.headerTitle}>Injury Tracking</Text>
          <IconButton
            icon="local-hospital"
            iconColor="white"
            onPress={() => Alert.alert('Feature Coming Soon', 'Medical integration will be available in the next update! 🏥')}
          />
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
      >
        {renderSummaryStats()}
        {renderFilters()}

        <Searchbar
          placeholder="Search injuries, players, or body parts..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          iconColor={COLORS.primary}
        />

        <View style={styles.injuriesSection}>
          <Text style={styles.sectionTitle}>
            🏥 Injury Records ({filteredInjuries.length})
          </Text>
          
          {filteredInjuries.length > 0 ? (
            <FlatList
              data={filteredInjuries}
              keyExtractor={(item) => item.id}
              renderItem={renderInjuryCard}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            renderEmptyState()
          )}
        </View>
      </ScrollView>

      <FAB
        icon="add"
        style={styles.fab}
        onPress={() => setShowReportDialog(true)}
        color="white"
      />

      {renderReportDialog()}
      {renderUpdateDialog()}
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
    paddingBottom: SPACING.md,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.sm,
  },
  headerTitle: {
    ...TEXT_STYLES.heading,
    color: 'white',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: SPACING.md,
  },
  content: {
    flex: 1,
    padding: SPACING.md,
  },
  summaryCard: {
    marginBottom: SPACING.lg,
    elevation: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  summaryGradient: {
    padding: SPACING.lg,
  },
  summaryTitle: {
    ...TEXT_STYLES.heading,
    color: 'white',
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  summaryNumber: {
    ...TEXT_STYLES.heading,
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
  },
summaryLabel: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  filtersContainer: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    ...TEXT_STYLES.subheading,
    color: COLORS.text,
    marginBottom: SPACING.sm,
    marginTop: SPACING.md,
    fontWeight: '600',
  },
  chipScroll: {
    marginBottom: SPACING.md,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginRight: SPACING.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  selectedFilterChip: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterText: {
    ...TEXT_STYLES.body,
    color: COLORS.text,
    marginLeft: SPACING.xs,
    fontSize: 14,
  },
  selectedFilterText: {
    color: 'white',
  },
  severityChip: {
    marginRight: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  selectedChip: {
    backgroundColor: COLORS.primary,
  },
  searchBar: {
    marginBottom: SPACING.lg,
    elevation: 2,
    borderRadius: 8,
  },
  injuriesSection: {
    marginBottom: SPACING.xl,
  },
  injuryCard: {
    marginBottom: SPACING.md,
    padding: SPACING.md,
    elevation: 3,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
  },
  injuryHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  playerAvatar: {
    marginRight: SPACING.md,
  },
  injuryInfo: {
    flex: 1,
  },
  playerName: {
    ...TEXT_STYLES.subheading,
    color: COLORS.text,
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  injuryType: {
    ...TEXT_STYLES.body,
    color: COLORS.primary,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  bodyPart: {
    ...TEXT_STYLES.caption,
    color: COLORS.secondary,
  },
  injuryStatus: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    marginBottom: SPACING.xs,
    paddingHorizontal: SPACING.sm,
  },
  severityBadge: {
    paddingHorizontal: SPACING.sm,
  },
  progressSection: {
    marginBottom: SPACING.md,
    padding: SPACING.sm,
    backgroundColor: COLORS.background,
    borderRadius: 8,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  progressTitle: {
    ...TEXT_STYLES.body,
    color: COLORS.text,
    fontWeight: '600',
  },
  progressPercentage: {
    ...TEXT_STYLES.body,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: SPACING.sm,
  },
  progressText: {
    ...TEXT_STYLES.caption,
    color: COLORS.secondary,
    textAlign: 'center',
  },
  injuryDetails: {
    marginBottom: SPACING.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  detailText: {
    ...TEXT_STYLES.caption,
    color: COLORS.secondary,
    marginLeft: SPACING.sm,
  },
  treatmentSection: {
    marginBottom: SPACING.md,
    padding: SPACING.sm,
    backgroundColor: COLORS.background,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  treatmentTitle: {
    ...TEXT_STYLES.body,
    color: COLORS.text,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  treatmentText: {
    ...TEXT_STYLES.caption,
    color: COLORS.secondary,
    lineHeight: 18,
  },
  restrictionsSection: {
    marginBottom: SPACING.md,
    padding: SPACING.sm,
    backgroundColor: '#FFF3E0',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#FF9800',
  },
  restrictionsTitle: {
    ...TEXT_STYLES.body,
    color: COLORS.text,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  restrictionsText: {
    ...TEXT_STYLES.caption,
    color: COLORS.secondary,
    lineHeight: 18,
  },
  injuryActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.sm,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: SPACING.xs,
  },
  dialogContent: {
    maxHeight: 400,
  },
  dialogLabel: {
    ...TEXT_STYLES.body,
    color: COLORS.text,
    fontWeight: '600',
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  textInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    backgroundColor: COLORS.surface,
    ...TEXT_STYLES.body,
    color: COLORS.text,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
    marginVertical: SPACING.xl,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    elevation: 1,
  },
  emptyTitle: {
    ...TEXT_STYLES.heading,
    color: COLORS.text,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  emptySubtitle: {
    ...TEXT_STYLES.body,
    color: COLORS.secondary,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    margin: SPACING.lg,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
    borderRadius: 28,
  },
});

export default InjuryTracking;