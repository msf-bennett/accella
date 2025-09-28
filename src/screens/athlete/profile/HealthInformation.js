import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  RefreshControl,
  Alert,
  Vibration,
  TouchableOpacity,
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
  Switch,
  Divider,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Design system imports
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const HealthInformation = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, healthData } = useSelector(state => state.user);
  const [refreshing, setRefreshing] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);

  // Health information state
  const [healthInfo, setHealthInfo] = useState({
    allergies: ['Peanuts', 'Shellfish'],
    medications: ['Vitamin D', 'Iron Supplement'],
    medicalConditions: [],
    emergencyContacts: [
      { name: 'John Doe', relationship: 'Father', phone: '+1234567890' },
      { name: 'Jane Doe', relationship: 'Mother', phone: '+1234567891' }
    ],
    bloodType: 'O+',
    height: '175 cm',
    weight: '70 kg',
    restingHeartRate: '65 bpm',
    injuryHistory: [
      { injury: 'Ankle Sprain', date: '2024-01-15', status: 'Recovered' },
      { injury: 'Knee Strain', date: '2023-11-20', status: 'Recovered' }
    ],
    fitnessGoals: ['Improve Endurance', 'Build Strength', 'Flexibility'],
    nutritionPreferences: {
      vegetarian: false,
      vegan: false,
      glutenFree: false,
      dairyFree: false,
    },
    lastMedicalCheckup: '2024-01-20',
  });

  useEffect(() => {
    StatusBar.setBarStyle('light-content');
    StatusBar.setTranslucent(true);
    loadHealthData();
  }, []);

  const loadHealthData = async () => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      // In real app, dispatch action to load health data
    } catch (error) {
      Alert.alert('Error', 'Failed to load health information');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadHealthData();
    setRefreshing(false);
  }, []);

  const handleEditCategory = (category, data) => {
    setSelectedCategory(category);
    setFormData(data);
    setEditModalVisible(true);
    Vibration.vibrate(50);
  };

  const saveHealthData = async () => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setHealthInfo(prev => ({
        ...prev,
        [selectedCategory]: formData
      }));
      
      setEditModalVisible(false);
      Alert.alert('Success! 🎉', 'Health information updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update health information');
    } finally {
      setLoading(false);
    }
  };

  const getHealthScore = () => {
    const completedFields = [
      healthInfo.bloodType,
      healthInfo.height,
      healthInfo.weight,
      healthInfo.lastMedicalCheckup,
    ].filter(field => field && field.length > 0).length;
    
    const totalFields = 4;
    return Math.round((completedFields / totalFields) * 100);
  };

  const renderHealthOverview = () => (
    <Card style={styles.overviewCard}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.gradientHeader}
      >
        <View style={styles.overviewContent}>
          <Text style={styles.overviewTitle}>Health Profile</Text>
          <View style={styles.scoreContainer}>
            <Text style={styles.scoreText}>{getHealthScore()}%</Text>
            <Text style={styles.scoreLabel}>Complete</Text>
          </View>
        </View>
        <ProgressBar
          progress={getHealthScore() / 100}
          color={COLORS.success}
          style={styles.progressBar}
        />
      </LinearGradient>
    </Card>
  );

  const renderVitalStats = () => (
    <Card style={styles.card}>
      <Card.Title
        title="Vital Statistics 📊"
        titleStyle={styles.cardTitle}
        right={() => (
          <IconButton
            icon="edit"
            onPress={() => handleEditCategory('vitals', {
              height: healthInfo.height,
              weight: healthInfo.weight,
              restingHeartRate: healthInfo.restingHeartRate,
              bloodType: healthInfo.bloodType,
            })}
          />
        )}
      />
      <Card.Content>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Icon name="height" size={24} color={COLORS.primary} />
            <Text style={styles.statLabel}>Height</Text>
            <Text style={styles.statValue}>{healthInfo.height}</Text>
          </View>
          <View style={styles.statItem}>
            <Icon name="monitor-weight" size={24} color={COLORS.primary} />
            <Text style={styles.statLabel}>Weight</Text>
            <Text style={styles.statValue}>{healthInfo.weight}</Text>
          </View>
          <View style={styles.statItem}>
            <Icon name="favorite" size={24} color={COLORS.error} />
            <Text style={styles.statLabel}>Resting HR</Text>
            <Text style={styles.statValue}>{healthInfo.restingHeartRate}</Text>
          </View>
          <View style={styles.statItem}>
            <Icon name="opacity" size={24} color={COLORS.error} />
            <Text style={styles.statLabel}>Blood Type</Text>
            <Text style={styles.statValue}>{healthInfo.bloodType}</Text>
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  const renderAllergiesAndMedications = () => (
    <Card style={styles.card}>
      <Card.Title
        title="Allergies & Medications 💊"
        titleStyle={styles.cardTitle}
        right={() => (
          <IconButton
            icon="edit"
            onPress={() => handleEditCategory('allergiesAndMeds', {
              allergies: healthInfo.allergies,
              medications: healthInfo.medications,
              medicalConditions: healthInfo.medicalConditions,
            })}
          />
        )}
      />
      <Card.Content>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Allergies</Text>
          <View style={styles.chipContainer}>
            {healthInfo.allergies.length > 0 ? (
              healthInfo.allergies.map((allergy, index) => (
                <Chip key={index} icon="warning" mode="outlined" style={styles.chip}>
                  {allergy}
                </Chip>
              ))
            ) : (
              <Text style={styles.emptyText}>No known allergies</Text>
            )}
          </View>
        </View>

        <Divider style={styles.divider} />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current Medications</Text>
          <View style={styles.chipContainer}>
            {healthInfo.medications.length > 0 ? (
              healthInfo.medications.map((medication, index) => (
                <Chip key={index} icon="medication" mode="outlined" style={styles.chip}>
                  {medication}
                </Chip>
              ))
            ) : (
              <Text style={styles.emptyText}>No current medications</Text>
            )}
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  const renderEmergencyContacts = () => (
    <Card style={styles.card}>
      <Card.Title
        title="Emergency Contacts 🚨"
        titleStyle={styles.cardTitle}
        right={() => (
          <IconButton
            icon="edit"
            onPress={() => handleEditCategory('emergencyContacts', healthInfo.emergencyContacts)}
          />
        )}
      />
      <Card.Content>
        {healthInfo.emergencyContacts.map((contact, index) => (
          <Surface key={index} style={styles.contactItem}>
            <Avatar.Icon icon="account" size={40} />
            <View style={styles.contactInfo}>
              <Text style={styles.contactName}>{contact.name}</Text>
              <Text style={styles.contactRelation}>{contact.relationship}</Text>
              <Text style={styles.contactPhone}>{contact.phone}</Text>
            </View>
            <IconButton
              icon="phone"
              mode="contained"
              onPress={() => Alert.alert('Call', `Calling ${contact.name}...`)}
            />
          </Surface>
        ))}
      </Card.Content>
    </Card>
  );

  const renderInjuryHistory = () => (
    <Card style={styles.card}>
      <Card.Title
        title="Injury History 🏥"
        titleStyle={styles.cardTitle}
        right={() => (
          <IconButton
            icon="edit"
            onPress={() => handleEditCategory('injuryHistory', healthInfo.injuryHistory)}
          />
        )}
      />
      <Card.Content>
        {healthInfo.injuryHistory.length > 0 ? (
          healthInfo.injuryHistory.map((injury, index) => (
            <Surface key={index} style={styles.injuryItem}>
              <View style={styles.injuryInfo}>
                <Text style={styles.injuryName}>{injury.injury}</Text>
                <Text style={styles.injuryDate}>{injury.date}</Text>
              </View>
              <Chip
                icon={injury.status === 'Recovered' ? 'check-circle' : 'clock'}
                mode={injury.status === 'Recovered' ? 'flat' : 'outlined'}
                style={[
                  styles.statusChip,
                  injury.status === 'Recovered' && styles.recoveredChip
                ]}
              >
                {injury.status}
              </Chip>
            </Surface>
          ))
        ) : (
          <Text style={styles.emptyText}>No injury history recorded 💪</Text>
        )}
      </Card.Content>
    </Card>
  );

  const renderNutritionPreferences = () => (
    <Card style={styles.card}>
      <Card.Title
        title="Nutrition Preferences 🥗"
        titleStyle={styles.cardTitle}
        right={() => (
          <IconButton
            icon="edit"
            onPress={() => handleEditCategory('nutrition', healthInfo.nutritionPreferences)}
          />
        )}
      />
      <Card.Content>
        <View style={styles.preferenceItem}>
          <Text style={styles.preferenceLabel}>Vegetarian</Text>
          <Switch
            value={healthInfo.nutritionPreferences.vegetarian}
            onValueChange={() => {}}
            disabled
          />
        </View>
        <View style={styles.preferenceItem}>
          <Text style={styles.preferenceLabel}>Vegan</Text>
          <Switch
            value={healthInfo.nutritionPreferences.vegan}
            onValueChange={() => {}}
            disabled
          />
        </View>
        <View style={styles.preferenceItem}>
          <Text style={styles.preferenceLabel}>Gluten Free</Text>
          <Switch
            value={healthInfo.nutritionPreferences.glutenFree}
            onValueChange={() => {}}
            disabled
          />
        </View>
        <View style={styles.preferenceItem}>
          <Text style={styles.preferenceLabel}>Dairy Free</Text>
          <Switch
            value={healthInfo.nutritionPreferences.dairyFree}
            onValueChange={() => {}}
            disabled
          />
        </View>
      </Card.Content>
    </Card>
  );

  const renderEditModal = () => (
    <Portal>
      <Modal
        visible={editModalVisible}
        onDismiss={() => setEditModalVisible(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <BlurView style={styles.blurView} blurType="light" blurAmount={10}>
          <Card style={styles.modalCard}>
            <Card.Title
              title={`Edit ${selectedCategory}`}
              titleStyle={styles.modalTitle}
              right={() => (
                <IconButton
                  icon="close"
                  onPress={() => setEditModalVisible(false)}
                />
              )}
            />
            <Card.Content>
              <Text style={styles.modalText}>
                Feature coming soon! 🚧
              </Text>
              <Text style={styles.modalSubtext}>
                You'll be able to edit your health information here.
              </Text>
            </Card.Content>
            <Card.Actions>
              <Button
                mode="contained"
                onPress={() => setEditModalVisible(false)}
                style={styles.modalButton}
              >
                Got it
              </Button>
            </Card.Actions>
          </Card>
        </BlurView>
      </Modal>
    </Portal>
  );

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
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
        {renderHealthOverview()}
        {renderVitalStats()}
        {renderAllergiesAndMedications()}
        {renderEmergencyContacts()}
        {renderInjuryHistory()}
        {renderNutritionPreferences()}

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.lastUpdated}>
              Last medical checkup: {healthInfo.lastMedicalCheckup}
            </Text>
          </Card.Content>
        </Card>
      </ScrollView>

      <FAB
        icon="medical-bag"
        style={styles.fab}
        onPress={() => Alert.alert(
          'Medical Records 🏥',
          'Feature in development! Soon you\'ll be able to upload medical documents and test results.',
          [{ text: 'Got it!', style: 'default' }]
        )}
      />

      {renderEditModal()}
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
  scrollContent: {
    paddingTop: SPACING.xl * 2,
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.xl * 2,
  },
  overviewCard: {
    marginBottom: SPACING.lg,
    elevation: 4,
    borderRadius: 16,
    overflow: 'hidden',
  },
  gradientHeader: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl,
  },
  overviewContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  overviewTitle: {
    ...TEXT_STYLES.h2,
    color: 'white',
    fontWeight: 'bold',
  },
  scoreContainer: {
    alignItems: 'center',
  },
  scoreText: {
    ...TEXT_STYLES.h1,
    color: 'white',
    fontWeight: 'bold',
  },
  scoreLabel: {
    ...TEXT_STYLES.caption,
    color: 'white',
    opacity: 0.9,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  card: {
    marginBottom: SPACING.lg,
    elevation: 2,
    borderRadius: 12,
  },
  cardTitle: {
    ...TEXT_STYLES.h3,
    color: COLORS.text,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    width: '48%',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: 8,
    marginBottom: SPACING.sm,
  },
  statLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  statValue: {
    ...TEXT_STYLES.body,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: SPACING.xs / 2,
  },
  section: {
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    ...TEXT_STYLES.body,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  chip: {
    marginRight: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  emptyText: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  divider: {
    marginVertical: SPACING.md,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderRadius: 8,
    backgroundColor: COLORS.surface,
  },
  contactInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  contactName: {
    ...TEXT_STYLES.body,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  contactRelation: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
  },
  contactPhone: {
    ...TEXT_STYLES.caption,
    color: COLORS.primary,
  },
  injuryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderRadius: 8,
    backgroundColor: COLORS.surface,
  },
  injuryInfo: {
    flex: 1,
  },
  injuryName: {
    ...TEXT_STYLES.body,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  injuryDate: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
  },
  statusChip: {
    backgroundColor: COLORS.surface,
  },
  recoveredChip: {
    backgroundColor: COLORS.success,
  },
  preferenceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  preferenceLabel: {
    ...TEXT_STYLES.body,
    color: COLORS.text,
  },
  lastUpdated: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  fab: {
    position: 'absolute',
    right: SPACING.lg,
    bottom: SPACING.xl,
    backgroundColor: COLORS.primary,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  blurView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  modalCard: {
    width: '90%',
    maxWidth: 400,
    borderRadius: 16,
  },
  modalTitle: {
    ...TEXT_STYLES.h3,
    color: COLORS.text,
  },
  modalText: {
    ...TEXT_STYLES.body,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  modalSubtext: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  modalButton: {
    marginTop: SPACING.md,
  },
});

export default HealthInformation;