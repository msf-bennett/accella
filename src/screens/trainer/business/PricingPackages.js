import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
  StatusBar,
  TouchableOpacity,
  Modal,
  TextInput,
  Vibration,
} from 'react-native';
import { 
  Card,
  Button,
  Chip,
  Avatar,
  IconButton,
  FAB,
  Surface,
  Portal,
  Searchbar,
} from 'react-native-paper';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from '../../../components/shared/BlurView';

// Design System
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  background: '#f5f5f5',
  white: '#FFFFFF',
  text: '#333333',
  textSecondary: '#666666',
  border: '#E0E0E0',
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
  caption: { fontSize: 14, color: COLORS.textSecondary },
  small: { fontSize: 12, color: COLORS.textSecondary },
};

const PricingPackagesScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const packages = useSelector(state => state.business.packages || []);

  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [filterType, setFilterType] = useState('all');

  // Create/Edit Package Form State
  const [packageForm, setPackageForm] = useState({
    title: '',
    description: '',
    price: '',
    duration: '',
    sessionsIncluded: '',
    category: 'personal',
    features: [],
    isPopular: false,
    isActive: true,
  });

  // Mock data for demonstration
  const mockPackages = [
    {
      id: '1',
      title: 'Basic Fitness Plan',
      description: 'Perfect for beginners starting their fitness journey',
      price: 99,
      originalPrice: 129,
      duration: '4 weeks',
      sessionsIncluded: 8,
      category: 'personal',
      features: ['Custom workout plan', 'Weekly check-ins', 'Exercise video library'],
      isPopular: false,
      isActive: true,
      clientsEnrolled: 24,
      revenue: 2376,
      rating: 4.8,
      completionRate: 87,
    },
    {
      id: '2',
      title: 'Premium Training Package',
      description: 'Comprehensive training with nutrition guidance',
      price: 199,
      originalPrice: 249,
      duration: '8 weeks',
      sessionsIncluded: 16,
      category: 'premium',
      features: ['1-on-1 sessions', 'Nutrition plan', 'Progress tracking', '24/7 support'],
      isPopular: true,
      isActive: true,
      clientsEnrolled: 18,
      revenue: 3582,
      rating: 4.9,
      completionRate: 94,
    },
    {
      id: '3',
      title: 'Group Fitness Class',
      description: 'High-energy group sessions for motivation',
      price: 49,
      duration: '1 month',
      sessionsIncluded: 12,
      category: 'group',
      features: ['Group training', 'Flexible scheduling', 'Social community'],
      isPopular: false,
      isActive: true,
      clientsEnrolled: 45,
      revenue: 2205,
      rating: 4.6,
      completionRate: 91,
    },
    {
      id: '4',
      title: 'Athletic Performance',
      description: 'Sport-specific training for athletes',
      price: 299,
      duration: '12 weeks',
      sessionsIncluded: 24,
      category: 'athletic',
      features: ['Sport-specific drills', 'Performance analysis', 'Recovery protocols', 'Competition prep'],
      isPopular: false,
      isActive: false,
      clientsEnrolled: 8,
      revenue: 2392,
      rating: 5.0,
      completionRate: 100,
    },
  ];

  const filteredPackages = mockPackages.filter(pkg => {
    const matchesSearch = pkg.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         pkg.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === 'all' || 
                         (filterType === 'active' && pkg.isActive) ||
                         (filterType === 'inactive' && !pkg.isActive) ||
                         pkg.category === filterType;
    return matchesSearch && matchesFilter;
  });

  const totalRevenue = mockPackages.reduce((sum, pkg) => sum + pkg.revenue, 0);
  const totalClients = mockPackages.reduce((sum, pkg) => sum + pkg.clientsEnrolled, 0);
  const averageRating = mockPackages.reduce((sum, pkg) => sum + pkg.rating, 0) / mockPackages.length;

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh packages');
    } finally {
      setRefreshing(false);
    }
  }, []);

  const handleCreatePackage = () => {
    Vibration.vibrate(50);
    setPackageForm({
      title: '',
      description: '',
      price: '',
      duration: '',
      sessionsIncluded: '',
      category: 'personal',
      features: [],
      isPopular: false,
      isActive: true,
    });
    setShowCreateModal(true);
  };

  const handleEditPackage = (pkg) => {
    Vibration.vibrate(50);
    setSelectedPackage(pkg);
    setPackageForm({
      title: pkg.title,
      description: pkg.description,
      price: pkg.price.toString(),
      duration: pkg.duration,
      sessionsIncluded: pkg.sessionsIncluded.toString(),
      category: pkg.category,
      features: pkg.features,
      isPopular: pkg.isPopular,
      isActive: pkg.isActive,
    });
    setShowEditModal(true);
  };

  const handleSavePackage = () => {
    if (!packageForm.title || !packageForm.price) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    Alert.alert('Success', 'Package saved successfully! 🎉');
    setShowCreateModal(false);
    setShowEditModal(false);
  };

  const handleDeletePackage = (pkg) => {
    Alert.alert(
      'Delete Package',
      `Are you sure you want to delete "${pkg.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            Alert.alert('Success', 'Package deleted successfully');
          }
        },
      ]
    );
  };

  const togglePackageStatus = (pkg) => {
    const action = pkg.isActive ? 'deactivate' : 'activate';
    Alert.alert(
      'Update Package Status',
      `${action.charAt(0).toUpperCase() + action.slice(1)} "${pkg.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: action.charAt(0).toUpperCase() + action.slice(1),
          onPress: () => {
            Alert.alert('Success', `Package ${action}d successfully!`);
          }
        },
      ]
    );
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'personal': return COLORS.primary;
      case 'premium': return COLORS.warning;
      case 'group': return COLORS.success;
      case 'athletic': return '#9C27B0';
      default: return COLORS.textSecondary;
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'personal': return 'person';
      case 'premium': return 'star';
      case 'group': return 'group';
      case 'athletic': return 'sports';
      default: return 'fitness-center';
    }
  };

  const renderStatsCards = () => (
    <View style={styles.statsContainer}>
      <Card style={[styles.statCard, { backgroundColor: COLORS.success }]}>
        <Card.Content style={styles.statContent}>
          <Icon name="attach-money" size={24} color={COLORS.white} />
          <Text style={[TEXT_STYLES.h3, { color: COLORS.white }]}>${totalRevenue.toLocaleString()}</Text>
          <Text style={[TEXT_STYLES.caption, { color: COLORS.white }]}>Total Revenue</Text>
        </Card.Content>
      </Card>

      <Card style={[styles.statCard, { backgroundColor: COLORS.primary }]}>
        <Card.Content style={styles.statContent}>
          <Icon name="people" size={24} color={COLORS.white} />
          <Text style={[TEXT_STYLES.h3, { color: COLORS.white }]}>{totalClients}</Text>
          <Text style={[TEXT_STYLES.caption, { color: COLORS.white }]}>Active Clients</Text>
        </Card.Content>
      </Card>

      <Card style={[styles.statCard, { backgroundColor: COLORS.warning }]}>
        <Card.Content style={styles.statContent}>
          <Icon name="star" size={24} color={COLORS.white} />
          <Text style={[TEXT_STYLES.h3, { color: COLORS.white }]}>{averageRating.toFixed(1)}</Text>
          <Text style={[TEXT_STYLES.caption, { color: COLORS.white }]}>Avg Rating</Text>
        </Card.Content>
      </Card>
    </View>
  );

  const renderFilterChips = () => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersContainer}>
      {[
        { key: 'all', label: 'All Packages', icon: 'view-list' },
        { key: 'active', label: 'Active', icon: 'check-circle' },
        { key: 'inactive', label: 'Inactive', icon: 'pause-circle-outline' },
        { key: 'personal', label: 'Personal', icon: 'person' },
        { key: 'premium', label: 'Premium', icon: 'star' },
        { key: 'group', label: 'Group', icon: 'group' },
        { key: 'athletic', label: 'Athletic', icon: 'sports' },
      ].map((filter) => (
        <Chip
          key={filter.key}
          mode={filterType === filter.key ? 'flat' : 'outlined'}
          selected={filterType === filter.key}
          onPress={() => setFilterType(filter.key)}
          icon={filter.icon}
          style={[
            styles.filterChip,
            filterType === filter.key && { backgroundColor: COLORS.primary }
          ]}
          textStyle={filterType === filter.key ? { color: COLORS.white } : {}}
        >
          {filter.label}
        </Chip>
      ))}
    </ScrollView>
  );

  const renderPackageCard = (pkg) => (
    <Card key={pkg.id} style={styles.packageCard}>
      {pkg.isPopular && (
        <View style={styles.popularBadge}>
          <LinearGradient colors={[COLORS.warning, '#FF6F00']} style={styles.popularGradient}>
            <Icon name="star" size={16} color={COLORS.white} />
            <Text style={styles.popularText}>POPULAR</Text>
          </LinearGradient>
        </View>
      )}
      
      <Card.Content style={styles.packageContent}>
        <View style={styles.packageHeader}>
          <View style={styles.packageTitleRow}>
            <View style={[styles.categoryIcon, { backgroundColor: getCategoryColor(pkg.category) }]}>
              <Icon name={getCategoryIcon(pkg.category)} size={20} color={COLORS.white} />
            </View>
            <View style={styles.packageInfo}>
              <Text style={TEXT_STYLES.h3}>{pkg.title}</Text>
              <Text style={TEXT_STYLES.caption}>{pkg.description}</Text>
            </View>
            <IconButton
              icon="dots-vertical"
              size={20}
              onPress={() => {
                Alert.alert(
                  'Package Actions',
                  'Choose an action',
                  [
                    { text: 'Edit', onPress: () => handleEditPackage(pkg) },
                    { text: pkg.isActive ? 'Deactivate' : 'Activate', onPress: () => togglePackageStatus(pkg) },
                    { text: 'Delete', style: 'destructive', onPress: () => handleDeletePackage(pkg) },
                    { text: 'Cancel', style: 'cancel' },
                  ]
                );
              }}
            />
          </View>
        </View>

        <View style={styles.priceSection}>
          <View style={styles.priceRow}>
            <Text style={styles.price}>${pkg.price}</Text>
            {pkg.originalPrice && (
              <Text style={styles.originalPrice}>${pkg.originalPrice}</Text>
            )}
            <View style={styles.pricingDetails}>
              <Text style={TEXT_STYLES.caption}>{pkg.duration}</Text>
              <Text style={TEXT_STYLES.caption}>{pkg.sessionsIncluded} sessions</Text>
            </View>
          </View>
        </View>

        <View style={styles.featuresSection}>
          <Text style={[TEXT_STYLES.caption, { marginBottom: SPACING.xs }]}>Features included:</Text>
          {pkg.features.slice(0, 3).map((feature, index) => (
            <View key={index} style={styles.featureRow}>
              <Icon name="check" size={16} color={COLORS.success} />
              <Text style={[TEXT_STYLES.small, { marginLeft: SPACING.xs }]}>{feature}</Text>
            </View>
          ))}
          {pkg.features.length > 3 && (
            <Text style={[TEXT_STYLES.small, { color: COLORS.primary }]}>
              +{pkg.features.length - 3} more features
            </Text>
          )}
        </View>

        <View style={styles.metricsSection}>
          <View style={styles.metricItem}>
            <Icon name="people" size={16} color={COLORS.textSecondary} />
            <Text style={TEXT_STYLES.small}>{pkg.clientsEnrolled} clients</Text>
          </View>
          <View style={styles.metricItem}>
            <Icon name="attach-money" size={16} color={COLORS.success} />
            <Text style={TEXT_STYLES.small}>${pkg.revenue}</Text>
          </View>
          <View style={styles.metricItem}>
            <Icon name="star" size={16} color={COLORS.warning} />
            <Text style={TEXT_STYLES.small}>{pkg.rating} rating</Text>
          </View>
          <View style={styles.metricItem}>
            <Icon name="trending-up" size={16} color={COLORS.primary} />
            <Text style={TEXT_STYLES.small}>{pkg.completionRate}% completion</Text>
          </View>
        </View>

        <View style={styles.statusSection}>
          <Chip
            mode="outlined"
            icon={pkg.isActive ? 'check-circle' : 'pause-circle-outline'}
            style={[
              styles.statusChip,
              { borderColor: pkg.isActive ? COLORS.success : COLORS.error }
            ]}
            textStyle={{ color: pkg.isActive ? COLORS.success : COLORS.error }}
          >
            {pkg.isActive ? 'Active' : 'Inactive'}
          </Chip>
        </View>
      </Card.Content>
    </Card>
  );

  const renderCreateEditModal = () => (
    <Modal
      visible={showCreateModal || showEditModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => {
        setShowCreateModal(false);
        setShowEditModal(false);
      }}
    >
      <BlurView style={styles.modalContainer} blurType="dark">
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={TEXT_STYLES.h2}>
              {showCreateModal ? 'Create Package' : 'Edit Package'}
            </Text>
            <IconButton
              icon="close"
              onPress={() => {
                setShowCreateModal(false);
                setShowEditModal(false);
              }}
            />
          </View>

          <ScrollView style={styles.formContainer}>
            <TextInput
              style={styles.input}
              placeholder="Package Title *"
              value={packageForm.title}
              onChangeText={(text) => setPackageForm({...packageForm, title: text})}
            />

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Description"
              value={packageForm.description}
              onChangeText={(text) => setPackageForm({...packageForm, description: text})}
              multiline
              numberOfLines={3}
            />

            <View style={styles.inputRow}>
              <TextInput
                style={[styles.input, styles.halfInput]}
                placeholder="Price ($) *"
                value={packageForm.price}
                onChangeText={(text) => setPackageForm({...packageForm, price: text})}
                keyboardType="numeric"
              />
              <TextInput
                style={[styles.input, styles.halfInput]}
                placeholder="Sessions Included"
                value={packageForm.sessionsIncluded}
                onChangeText={(text) => setPackageForm({...packageForm, sessionsIncluded: text})}
                keyboardType="numeric"
              />
            </View>

            <TextInput
              style={styles.input}
              placeholder="Duration (e.g., 4 weeks)"
              value={packageForm.duration}
              onChangeText={(text) => setPackageForm({...packageForm, duration: text})}
            />

            <View style={styles.categorySection}>
              <Text style={[TEXT_STYLES.body, { marginBottom: SPACING.sm }]}>Category:</Text>
              <View style={styles.categoryButtons}>
                {['personal', 'premium', 'group', 'athletic'].map((category) => (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.categoryButton,
                      packageForm.category === category && {
                        backgroundColor: getCategoryColor(category)
                      }
                    ]}
                    onPress={() => setPackageForm({...packageForm, category})}
                  >
                    <Icon
                      name={getCategoryIcon(category)}
                      size={20}
                      color={packageForm.category === category ? COLORS.white : COLORS.textSecondary}
                    />
                    <Text
                      style={[
                        TEXT_STYLES.caption,
                        { color: packageForm.category === category ? COLORS.white : COLORS.textSecondary }
                      ]}
                    >
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.formButtons}>
              <Button
                mode="outlined"
                onPress={() => {
                  setShowCreateModal(false);
                  setShowEditModal(false);
                }}
                style={styles.cancelButton}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={handleSavePackage}
                style={styles.saveButton}
                buttonColor={COLORS.primary}
              >
                {showCreateModal ? 'Create Package' : 'Update Package'}
              </Button>
            </View>
          </ScrollView>
        </View>
      </BlurView>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <LinearGradient colors={[COLORS.primary, COLORS.secondary]} style={styles.header}>
        <Text style={[TEXT_STYLES.h1, { color: COLORS.white }]}>Pricing Packages 💰</Text>
        <Text style={[TEXT_STYLES.body, { color: COLORS.white, opacity: 0.9 }]}>
          Manage your training packages and pricing
        </Text>
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
        {renderStatsCards()}

        <View style={styles.searchSection}>
          <Searchbar
            placeholder="Search packages..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchbar}
            iconColor={COLORS.primary}
          />
        </View>

        {renderFilterChips()}

        <View style={styles.packagesSection}>
          <View style={styles.sectionHeader}>
            <Text style={TEXT_STYLES.h2}>Your Packages ({filteredPackages.length})</Text>
            <IconButton
              icon="add"
              mode="contained"
              iconColor={COLORS.white}
              containerColor={COLORS.primary}
              onPress={handleCreatePackage}
            />
          </View>

          {filteredPackages.length > 0 ? (
            filteredPackages.map(renderPackageCard)
          ) : (
            <Surface style={styles.emptyState}>
              <Icon name="inventory" size={64} color={COLORS.textSecondary} />
              <Text style={[TEXT_STYLES.h3, { marginTop: SPACING.md }]}>No packages found</Text>
              <Text style={[TEXT_STYLES.body, { textAlign: 'center', marginTop: SPACING.sm }]}>
                {searchQuery ? 'Try adjusting your search terms' : 'Create your first package to get started'}
              </Text>
              {!searchQuery && (
                <Button
                  mode="contained"
                  onPress={handleCreatePackage}
                  style={styles.createButton}
                  buttonColor={COLORS.primary}
                >
                  Create Package
                </Button>
              )}
            </Surface>
          )}
        </View>
      </ScrollView>

      <FAB
        icon="add"
        style={styles.fab}
        color={COLORS.white}
        customSize={56}
        onPress={handleCreatePackage}
      />

      {renderCreateEditModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: 60,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.md,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.md,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -SPACING.lg,
    marginBottom: SPACING.lg,
  },
  statCard: {
    flex: 1,
    marginHorizontal: SPACING.xs,
    elevation: 4,
  },
  statContent: {
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  searchSection: {
    marginBottom: SPACING.md,
  },
  searchbar: {
    backgroundColor: COLORS.white,
    elevation: 2,
  },
  filtersContainer: {
    marginBottom: SPACING.lg,
  },
  filterChip: {
    marginRight: SPACING.sm,
  },
  packagesSection: {
    marginBottom: 100,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  packageCard: {
    marginBottom: SPACING.md,
    elevation: 3,
    backgroundColor: COLORS.white,
  },
  popularBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    zIndex: 1,
  },
  popularGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderTopRightRadius: 12,
    borderBottomLeftRadius: 12,
  },
  popularText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: 'bold',
    marginLeft: SPACING.xs,
  },
  packageContent: {
    paddingTop: SPACING.md,
  },
  packageHeader: {
    marginBottom: SPACING.md,
  },
  packageTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  packageInfo: {
    flex: 1,
  },
  priceSection: {
    marginBottom: SPACING.md,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  originalPrice: {
    fontSize: 16,
    textDecorationLine: 'line-through',
    color: COLORS.textSecondary,
    marginLeft: SPACING.sm,
  },
  pricingDetails: {
    marginLeft: 'auto',
    alignItems: 'flex-end',
  },
  featuresSection: {
    marginBottom: SPACING.md,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  metricsSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusSection: {
    alignItems: 'flex-start',
  },
  statusChip: {
    marginTop: SPACING.xs,
  },
  emptyState: {
    alignItems: 'center',
    padding: SPACING.xl,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    elevation: 2,
  },
  createButton: {
    marginTop: SPACING.lg,
  },
  fab: {
    position: 'absolute',
    bottom: SPACING.lg,
    right: SPACING.md,
    backgroundColor: COLORS.primary,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.md,
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    width: '100%',
    maxHeight: '90%',
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  formContainer: {
    padding: SPACING.md,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: SPACING.sm,
    marginBottom: SPACING.md,
    fontSize: 16,
    backgroundColor: COLORS.white,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  categorySection: {
    marginBottom: SPACING.lg,
  },
  categoryButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  categoryButton: {
    flex: 1,
    alignItems: 'center',
    padding: SPACING.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginHorizontal: SPACING.xs,
  },
  formButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.lg,
  },
  cancelButton: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  saveButton: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
});

export default PricingPackages;