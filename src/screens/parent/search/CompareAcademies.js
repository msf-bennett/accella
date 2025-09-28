import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Alert,
  Modal,
  FlatList,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS } from '../../../styles/colors';

const { width, height } = Dimensions.get('window');

const CompareAcademies = ({ navigation, route }) => {
  const { selectedAcademies = [], allAcademies = [] } = route.params || {};
  
  const [academies, setAcademies] = useState(selectedAcademies);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedComparison, setSelectedComparison] = useState('overview');
  const [showFilters, setShowFilters] = useState(false);
  const scrollX = useRef(new Animated.Value(0)).current;

  // Mock data for academies - replace with actual data
  const [mockAcademies] = useState([
    {
      id: 1,
      name: 'Elite Sports Academy',
      sport: 'Football',
      image: 'https://via.placeholder.com/100',
      rating: 4.8,
      reviews: 245,
      distance: '2.5 km',
      priceRange: '$50-80',
      established: 2015,
      facilities: ['Indoor Courts', 'Outdoor Fields', 'Gym', 'Swimming Pool', 'Cafeteria'],
      coaches: 12,
      students: 300,
      programs: ['Beginner', 'Intermediate', 'Advanced', 'Professional'],
      ageGroups: ['6-10', '11-15', '16-18', '18+'],
      certifications: ['FIFA Certified', 'UEFA Licensed'],
      achievements: ['State Champions 2023', 'Regional Winners 2022'],
      schedule: {
        weekdays: '4:00 PM - 8:00 PM',
        weekends: '8:00 AM - 6:00 PM'
      },
      location: {
        address: '123 Sports Avenue, Downtown',
        coordinates: { lat: -1.2921, lng: 36.8219 }
      },
      contact: {
        phone: '+254 700 123 456',
        email: 'info@elitesports.com',
        website: 'www.elitesports.com'
      },
      highlights: ['Professional Coaches', 'Modern Facilities', 'Proven Track Record'],
      trialAvailable: true,
      onlineBooking: true
    },
    {
      id: 2,
      name: 'Champions Basketball Hub',
      sport: 'Basketball',
      image: 'https://via.placeholder.com/100',
      rating: 4.6,
      reviews: 189,
      distance: '3.8 km',
      priceRange: '$40-70',
      established: 2018,
      facilities: ['Indoor Courts', 'Training Gym', 'Video Analysis', 'Locker Rooms'],
      coaches: 8,
      students: 180,
      programs: ['Youth Development', 'Skills Training', 'Competitive Teams'],
      ageGroups: ['8-12', '13-17', '18+'],
      certifications: ['FIBA Certified', 'National Coaching License'],
      achievements: ['City Champions 2023', 'Youth League Winners'],
      schedule: {
        weekdays: '5:00 PM - 9:00 PM',
        weekends: '9:00 AM - 5:00 PM'
      },
      location: {
        address: '456 Basketball Street, Westlands',
        coordinates: { lat: -1.2634, lng: 36.8106 }
      },
      contact: {
        phone: '+254 700 789 012',
        email: 'contact@championshub.com',
        website: 'www.championshub.com'
      },
      highlights: ['Expert Coaching', 'Youth Focus', 'Competitive Teams'],
      trialAvailable: true,
      onlineBooking: false
    },
    {
      id: 3,
      name: 'Victory Tennis Academy',
      sport: 'Tennis',
      image: 'https://via.placeholder.com/100',
      rating: 4.9,
      reviews: 156,
      distance: '1.8 km',
      priceRange: '$60-100',
      established: 2012,
      facilities: ['6 Tennis Courts', 'Pro Shop', 'Fitness Center', 'Clubhouse'],
      coaches: 6,
      students: 120,
      programs: ['Junior Development', 'Adult Lessons', 'Tournament Prep'],
      ageGroups: ['5-8', '9-14', '15-18', 'Adult'],
      certifications: ['ITF Certified', 'Professional Tennis Registry'],
      achievements: ['National Junior Champions', 'Regional Tournament Winners'],
      schedule: {
        weekdays: '6:00 AM - 10:00 PM',
        weekends: '7:00 AM - 8:00 PM'
      },
      location: {
        address: '789 Tennis Lane, Karen',
        coordinates: { lat: -1.3197, lng: 36.7081 }
      },
      contact: {
        phone: '+254 700 345 678',
        email: 'info@victorytennis.com',
        website: 'www.victorytennis.com'
      },
      highlights: ['Premium Facilities', 'Individual Attention', 'Tournament Success'],
      trialAvailable: true,
      onlineBooking: true
    }
  ]);

  const comparisonCategories = [
    { id: 'overview', name: 'Overview', icon: 'view-dashboard' },
    { id: 'facilities', name: 'Facilities', icon: 'home-variant' },
    { id: 'programs', name: 'Programs', icon: 'school' },
    { id: 'pricing', name: 'Pricing', icon: 'currency-usd' },
    { id: 'contact', name: 'Contact', icon: 'phone' }
  ];

  useEffect(() => {
    if (selectedAcademies.length === 0) {
      // Load some default academies for comparison
      setAcademies(mockAcademies.slice(0, 2));
    }
  }, []);

  const handleAddAcademy = (academy) => {
    if (academies.length >= 3) {
      Alert.alert('Limit Reached', 'You can compare up to 3 academies at once.');
      return;
    }
    
    if (academies.find(a => a.id === academy.id)) {
      Alert.alert('Already Added', 'This academy is already in comparison.');
      return;
    }

    setAcademies([...academies, academy]);
    setShowAddModal(false);
  };

  const handleRemoveAcademy = (academyId) => {
    if (academies.length <= 1) {
      Alert.alert('Minimum Required', 'At least one academy is required for comparison.');
      return;
    }
    
    setAcademies(academies.filter(a => a.id !== academyId));
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Icon name="arrow-left" size={24} color={COLORS.dark} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Compare Academies</Text>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setShowAddModal(true)}
      >
        <Icon name="plus" size={24} color={COLORS.primary} />
      </TouchableOpacity>
    </View>
  );

  const renderCategoryTabs = () => (
    <View style={styles.categoryTabs}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {comparisonCategories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryTab,
              selectedComparison === category.id && styles.activeCategoryTab
            ]}
            onPress={() => setSelectedComparison(category.id)}
          >
            <Icon
              name={category.icon}
              size={18}
              color={selectedComparison === category.id ? COLORS.white : COLORS.gray}
            />
            <Text style={[
              styles.categoryTabText,
              selectedComparison === category.id && styles.activeCategoryTabText
            ]}>
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderAcademyCards = () => (
    <View style={styles.academyCardsContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.academyCardsScroll}>
        {academies.map((academy, index) => (
          <View key={academy.id} style={styles.academyCard}>
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => handleRemoveAcademy(academy.id)}
            >
              <Icon name="close" size={16} color={COLORS.error} />
            </TouchableOpacity>
            
            <Image source={{ uri: academy.image }} style={styles.academyImage} />
            <Text style={styles.academyName}>{academy.name}</Text>
            <Text style={styles.academySport}>{academy.sport}</Text>
            
            <View style={styles.ratingContainer}>
              <Icon name="star" size={14} color={COLORS.warning} />
              <Text style={styles.rating}>{academy.rating}</Text>
              <Text style={styles.reviews}>({academy.reviews})</Text>
            </View>
            
            <Text style={styles.distance}>{academy.distance} away</Text>
          </View>
        ))}
        
        {academies.length < 3 && (
          <TouchableOpacity
            style={styles.addAcademyCard}
            onPress={() => setShowAddModal(true)}
          >
            <Icon name="plus" size={30} color={COLORS.primary} />
            <Text style={styles.addAcademyText}>Add Academy</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );

  const renderOverviewComparison = () => (
    <View style={styles.comparisonContent}>
      {/* Rating Comparison */}
      <View style={styles.comparisonSection}>
        <Text style={styles.sectionTitle}>Rating & Reviews</Text>
        <View style={styles.comparisonRow}>
          <Text style={styles.comparisonLabel}>Rating</Text>
          {academies.map((academy) => (
            <View key={academy.id} style={styles.comparisonCell}>
              <View style={styles.ratingDisplay}>
                <Icon name="star" size={16} color={COLORS.warning} />
                <Text style={styles.ratingValue}>{academy.rating}</Text>
              </View>
            </View>
          ))}
        </View>
        <View style={styles.comparisonRow}>
          <Text style={styles.comparisonLabel}>Reviews</Text>
          {academies.map((academy) => (
            <View key={academy.id} style={styles.comparisonCell}>
              <Text style={styles.cellValue}>{academy.reviews}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Basic Info */}
      <View style={styles.comparisonSection}>
        <Text style={styles.sectionTitle}>Basic Information</Text>
        <View style={styles.comparisonRow}>
          <Text style={styles.comparisonLabel}>Established</Text>
          {academies.map((academy) => (
            <View key={academy.id} style={styles.comparisonCell}>
              <Text style={styles.cellValue}>{academy.established}</Text>
            </View>
          ))}
        </View>
        <View style={styles.comparisonRow}>
          <Text style={styles.comparisonLabel}>Distance</Text>
          {academies.map((academy) => (
            <View key={academy.id} style={styles.comparisonCell}>
              <Text style={styles.cellValue}>{academy.distance}</Text>
            </View>
          ))}
        </View>
        <View style={styles.comparisonRow}>
          <Text style={styles.comparisonLabel}>Price Range</Text>
          {academies.map((academy) => (
            <View key={academy.id} style={styles.comparisonCell}>
              <Text style={styles.cellValue}>{academy.priceRange}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Staff & Students */}
      <View style={styles.comparisonSection}>
        <Text style={styles.sectionTitle}>Staff & Students</Text>
        <View style={styles.comparisonRow}>
          <Text style={styles.comparisonLabel}>Coaches</Text>
          {academies.map((academy) => (
            <View key={academy.id} style={styles.comparisonCell}>
              <Text style={styles.cellValue}>{academy.coaches}</Text>
            </View>
          ))}
        </View>
        <View style={styles.comparisonRow}>
          <Text style={styles.comparisonLabel}>Students</Text>
          {academies.map((academy) => (
            <View key={academy.id} style={styles.comparisonCell}>
              <Text style={styles.cellValue}>{academy.students}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );

  const renderFacilitiesComparison = () => (
    <View style={styles.comparisonContent}>
      <View style={styles.comparisonSection}>
        <Text style={styles.sectionTitle}>Available Facilities</Text>
        {/* Get all unique facilities */}
        {Array.from(new Set(academies.flatMap(a => a.facilities))).map((facility) => (
          <View key={facility} style={styles.comparisonRow}>
            <Text style={styles.comparisonLabel}>{facility}</Text>
            {academies.map((academy) => (
              <View key={academy.id} style={styles.comparisonCell}>
                <Icon
                  name={academy.facilities.includes(facility) ? "check-circle" : "close-circle"}
                  size={20}
                  color={academy.facilities.includes(facility) ? COLORS.success : COLORS.error}
                />
              </View>
            ))}
          </View>
        ))}
      </View>
    </View>
  );

  const renderProgramsComparison = () => (
    <View style={styles.comparisonContent}>
      <View style={styles.comparisonSection}>
        <Text style={styles.sectionTitle}>Training Programs</Text>
        {academies.map((academy) => (
          <View key={academy.id} style={styles.programCard}>
            <Text style={styles.programAcademyName}>{academy.name}</Text>
            <View style={styles.programsList}>
              {academy.programs.map((program, index) => (
                <View key={index} style={styles.programTag}>
                  <Text style={styles.programTagText}>{program}</Text>
                </View>
              ))}
            </View>
          </View>
        ))}
      </View>

      <View style={styles.comparisonSection}>
        <Text style={styles.sectionTitle}>Age Groups</Text>
        {academies.map((academy) => (
          <View key={academy.id} style={styles.programCard}>
            <Text style={styles.programAcademyName}>{academy.name}</Text>
            <View style={styles.programsList}>
              {academy.ageGroups.map((age, index) => (
                <View key={index} style={styles.ageTag}>
                  <Text style={styles.ageTagText}>{age}</Text>
                </View>
              ))}
            </View>
          </View>
        ))}
      </View>
    </View>
  );

  const renderPricingComparison = () => (
    <View style={styles.comparisonContent}>
      <View style={styles.comparisonSection}>
        <Text style={styles.sectionTitle}>Pricing Information</Text>
        <View style={styles.comparisonRow}>
          <Text style={styles.comparisonLabel}>Price Range</Text>
          {academies.map((academy) => (
            <View key={academy.id} style={styles.comparisonCell}>
              <Text style={styles.priceValue}>{academy.priceRange}</Text>
            </View>
          ))}
        </View>
        <View style={styles.comparisonRow}>
          <Text style={styles.comparisonLabel}>Trial Available</Text>
          {academies.map((academy) => (
            <View key={academy.id} style={styles.comparisonCell}>
              <Icon
                name={academy.trialAvailable ? "check-circle" : "close-circle"}
                size={20}
                color={academy.trialAvailable ? COLORS.success : COLORS.error}
              />
            </View>
          ))}
        </View>
        <View style={styles.comparisonRow}>
          <Text style={styles.comparisonLabel}>Online Booking</Text>
          {academies.map((academy) => (
            <View key={academy.id} style={styles.comparisonCell}>
              <Icon
                name={academy.onlineBooking ? "check-circle" : "close-circle"}
                size={20}
                color={academy.onlineBooking ? COLORS.success : COLORS.error}
              />
            </View>
          ))}
        </View>
      </View>
    </View>
  );

  const renderContactComparison = () => (
    <View style={styles.comparisonContent}>
      <View style={styles.comparisonSection}>
        <Text style={styles.sectionTitle}>Contact Information</Text>
        {academies.map((academy) => (
          <View key={academy.id} style={styles.contactCard}>
            <Text style={styles.contactAcademyName}>{academy.name}</Text>
            
            <View style={styles.contactItem}>
              <Icon name="map-marker" size={16} color={COLORS.primary} />
              <Text style={styles.contactText}>{academy.location.address}</Text>
            </View>
            
            <View style={styles.contactItem}>
              <Icon name="phone" size={16} color={COLORS.primary} />
              <Text style={styles.contactText}>{academy.contact.phone}</Text>
            </View>
            
            <View style={styles.contactItem}>
              <Icon name="email" size={16} color={COLORS.primary} />
              <Text style={styles.contactText}>{academy.contact.email}</Text>
            </View>
            
            <View style={styles.contactItem}>
              <Icon name="web" size={16} color={COLORS.primary} />
              <Text style={styles.contactText}>{academy.contact.website}</Text>
            </View>

            <View style={styles.scheduleInfo}>
              <Text style={styles.scheduleTitle}>Operating Hours</Text>
              <Text style={styles.scheduleText}>Weekdays: {academy.schedule.weekdays}</Text>
              <Text style={styles.scheduleText}>Weekends: {academy.schedule.weekends}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );

  const renderComparisonContent = () => {
    switch (selectedComparison) {
      case 'overview':
        return renderOverviewComparison();
      case 'facilities':
        return renderFacilitiesComparison();
      case 'programs':
        return renderProgramsComparison();
      case 'pricing':
        return renderPricingComparison();
      case 'contact':
        return renderContactComparison();
      default:
        return renderOverviewComparison();
    }
  };

  const renderAddAcademyModal = () => (
    <Modal visible={showAddModal} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.addModalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add Academy to Compare</Text>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <Icon name="close" size={24} color={COLORS.dark} />
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={mockAcademies.filter(a => !academies.find(academy => academy.id === a.id))}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.modalAcademyItem}
                onPress={() => handleAddAcademy(item)}
              >
                <Image source={{ uri: item.image }} style={styles.modalAcademyImage} />
                <View style={styles.modalAcademyInfo}>
                  <Text style={styles.modalAcademyName}>{item.name}</Text>
                  <Text style={styles.modalAcademySport}>{item.sport}</Text>
                  <View style={styles.modalRatingContainer}>
                    <Icon name="star" size={14} color={COLORS.warning} />
                    <Text style={styles.modalRating}>{item.rating}</Text>
                    <Text style={styles.modalDistance}>• {item.distance}</Text>
                  </View>
                </View>
                <Icon name="plus-circle" size={24} color={COLORS.primary} />
              </TouchableOpacity>
            )}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </View>
    </Modal>
  );

  const renderActionButtons = () => (
    <View style={styles.actionButtons}>
      <TouchableOpacity
        style={styles.actionButton}
        onPress={() => {
          // Share comparison functionality
          Alert.alert('Share', 'Comparison shared successfully!');
        }}
      >
        <Icon name="share-variant" size={20} color={COLORS.primary} />
        <Text style={styles.actionButtonText}>Share</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={styles.actionButton}
        onPress={() => {
          // Save comparison functionality
          Alert.alert('Saved', 'Comparison saved to your favorites!');
        }}
      >
        <Icon name="heart-outline" size={20} color={COLORS.primary} />
        <Text style={styles.actionButtonText}>Save</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.actionButton, styles.primaryAction]}
        onPress={() => {
          // Navigate to booking with selected academies
          navigation.navigate('BookTrial', { academies });
        }}
      >
        <Icon name="calendar-plus" size={20} color={COLORS.white} />
        <Text style={[styles.actionButtonText, styles.primaryActionText]}>Book Trial</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      {renderCategoryTabs()}
      {renderAcademyCards()}
      
      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {renderComparisonContent()}
      </ScrollView>
      
      {renderActionButtons()}
      {renderAddAcademyModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.dark,
  },
  addButton: {
    padding: 5,
  },
  categoryTabs: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 5,
    backgroundColor: COLORS.lightGray,
    borderRadius: 20,
  },
  activeCategoryTab: {
    backgroundColor: COLORS.primary,
  },
  categoryTabText: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.gray,
    marginLeft: 5,
  },
  activeCategoryTabText: {
    color: COLORS.white,
  },
  academyCardsContainer: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  academyCardsScroll: {
    paddingHorizontal: 15,
  },
  academyCard: {
    width: 140,
    backgroundColor: COLORS.lightGray,
    borderRadius: 12,
    padding: 15,
    marginRight: 15,
    alignItems: 'center',
    position: 'relative',
  },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 2,
    zIndex: 1,
  },
  academyImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 10,
  },
  academyName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.dark,
    textAlign: 'center',
    marginBottom: 5,
  },
  academySport: {
    fontSize: 12,
    color: COLORS.gray,
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  rating: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.dark,
    marginLeft: 3,
  },
  reviews: {
    fontSize: 10,
    color: COLORS.gray,
    marginLeft: 3,
  },
  distance: {
    fontSize: 10,
    color: COLORS.gray,
  },
  addAcademyCard: {
    width: 140,
    height: 140,
    backgroundColor: COLORS.primary + '10',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addAcademyText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '500',
    marginTop: 5,
  },
  scrollContent: {
    flex: 1,
  },
  comparisonContent: {
    padding: 20,
  },
  comparisonSection: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.dark,
    marginBottom: 15,
  },
  comparisonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray + '50',
  },
  comparisonLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.dark,
  },
  comparisonCell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellValue: {
    fontSize: 12,
    color: COLORS.dark,
    textAlign: 'center',
  },
  ratingDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingValue: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.dark,
    marginLeft: 3,
  },
  priceValue: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
    textAlign: 'center',
  },
  programCard: {
    backgroundColor: COLORS.lightGray,
    borderRadius: 8,
    padding: 15,
    marginBottom: 12,
  },
  programAcademyName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: 10,
  },
  programsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  programTag: {
    backgroundColor: COLORS.primary,
    borderRadius: 15,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 8,
    marginBottom: 5,
  },
  programTagText: {
    fontSize: 10,
    color: COLORS.white,
    fontWeight: '500',
  },
  ageTag: {
    backgroundColor: COLORS.success,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 8,
    marginBottom: 5,
  },
  ageTagText: {
    fontSize: 10,
    color: COLORS.white,
    fontWeight: '500',
  },
  contactCard: {
    backgroundColor: COLORS.lightGray,
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
  },
  contactAcademyName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: 12,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  contactText: {
    fontSize: 12,
    color: COLORS.dark,
    marginLeft: 8,
    flex: 1,
  },
  scheduleInfo: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray + '30',
  },
  scheduleTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: 5,
  },
  scheduleText: {
    fontSize: 11,
    color: COLORS.gray,
    marginBottom: 2,
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: COLORS.lightGray,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  primaryAction: {
    backgroundColor: COLORS.primary,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.dark,
    marginLeft: 5,
  },
  primaryActionText: {
    color: COLORS.white,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  addModalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    maxHeight: height * 0.8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.dark,
  },
  modalAcademyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray + '50',
  },
  modalAcademyImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  modalAcademyInfo: {
    flex: 1,
  },
  modalAcademyName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: 3,
  },
  modalAcademySport: {
    fontSize: 12,
    color: COLORS.gray,
    marginBottom: 5,
  },
  modalRatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalRating: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.dark,
    marginLeft: 3,
  },
  modalDistance: {
    fontSize: 12,
    color: COLORS.gray,
    marginLeft: 5,
  },
});

export default CompareAcademies;