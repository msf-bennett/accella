// researchDatabase.js - Coach Discovery Research Database
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock database for coach discovery and search functionality
class ResearchDatabase {
  constructor() {
    this.coaches = [];
    this.academies = [];
    this.sports = [];
    this.locations = [];
    this.initialized = false;
  }

  // Initialize the database with mock data
  async initialize() {
    if (this.initialized) return;

    try {
      // Load data from AsyncStorage or initialize with defaults
      const storedCoaches = await AsyncStorage.getItem('coaches_database');
      const storedAcademies = await AsyncStorage.getItem('academies_database');

      if (storedCoaches) {
        this.coaches = JSON.parse(storedCoaches);
      } else {
        this.coaches = this.generateMockCoaches();
        await this.saveCoaches();
      }

      if (storedAcademies) {
        this.academies = JSON.parse(storedAcademies);
      } else {
        this.academies = this.generateMockAcademies();
        await this.saveAcademies();
      }

      this.sports = this.initializeSports();
      this.locations = this.initializeLocations();
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize research database:', error);
      // Fallback to mock data
      this.coaches = this.generateMockCoaches();
      this.academies = this.generateMockAcademies();
      this.sports = this.initializeSports();
      this.locations = this.initializeLocations();
      this.initialized = true;
    }
  }

  // Generate mock coaches data
  generateMockCoaches() {
    const sports = ['Football', 'Basketball', 'Tennis', 'Swimming', 'Athletics', 'Volleyball', 'Baseball', 'Soccer', 'Golf', 'Rugby'];
    const locations = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose'];
    const specializations = ['Youth Training', 'Professional Coaching', 'Fitness Training', 'Rehabilitation', 'Performance Analysis', 'Mental Coaching'];
    
    const coaches = [];
    
    for (let i = 1; i <= 50; i++) {
      const sport = sports[Math.floor(Math.random() * sports.length)];
      const location = locations[Math.floor(Math.random() * locations.length)];
      const rating = (Math.random() * 2 + 3).toFixed(1); // 3.0 to 5.0
      const experience = Math.floor(Math.random() * 20) + 1;
      const price = Math.floor(Math.random() * 80) + 20; // $20-100 per session
      
      coaches.push({
        id: `coach_${i}`,
        name: this.generateRandomName(),
        sport,
        location,
        latitude: this.getLocationCoordinates(location).lat,
        longitude: this.getLocationCoordinates(location).lng,
        rating: parseFloat(rating),
        reviewCount: Math.floor(Math.random() * 200) + 5,
        experience: `${experience} years`,
        pricePerSession: price,
        specializations: this.getRandomSpecializations(specializations),
        certifications: this.generateCertifications(sport),
        bio: this.generateBio(sport, experience),
        avatar: `https://i.pravatar.cc/150?img=${i}`,
        isVerified: Math.random() > 0.3,
        isOnline: Math.random() > 0.4,
        responseTime: this.generateResponseTime(),
        availability: this.generateAvailability(),
        languages: this.generateLanguages(),
        sessionTypes: ['Individual', 'Group', 'Online'],
        achievements: this.generateAchievements(sport),
        socialProof: {
          studentsCount: Math.floor(Math.random() * 500) + 10,
          successRate: Math.floor(Math.random() * 20) + 80, // 80-100%
          yearsActive: experience,
        },
        contact: {
          phone: this.generatePhoneNumber(),
          email: `coach${i}@example.com`,
          website: Math.random() > 0.6 ? `www.coach${i}.com` : null,
        },
        gallery: this.generateGallery(i),
        schedule: this.generateSchedule(),
        createdAt: new Date(Date.now() - Math.random() * 31536000000), // Random date within last year
        lastActive: new Date(Date.now() - Math.random() * 86400000), // Random within last 24 hours
      });
    }
    
    return coaches;
  }

  // Generate mock academies data
  generateMockAcademies() {
    const sports = ['Football', 'Basketball', 'Tennis', 'Swimming', 'Athletics', 'Volleyball', 'Baseball', 'Soccer', 'Golf', 'Rugby'];
    const locations = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose'];
    
    const academies = [];
    
    for (let i = 1; i <= 25; i++) {
      const location = locations[Math.floor(Math.random() * locations.length)];
      const rating = (Math.random() * 2 + 3).toFixed(1);
      const sportsOffered = this.getRandomSports(sports, Math.floor(Math.random() * 5) + 1);
      
      academies.push({
        id: `academy_${i}`,
        name: this.generateAcademyName(),
        location,
        latitude: this.getLocationCoordinates(location).lat,
        longitude: this.getLocationCoordinates(location).lng,
        rating: parseFloat(rating),
        reviewCount: Math.floor(Math.random() * 100) + 10,
        sportsOffered,
        ageGroups: ['6-12', '13-17', '18+'],
        priceRange: {
          min: Math.floor(Math.random() * 50) + 50,
          max: Math.floor(Math.random() * 100) + 150,
        },
        facilities: this.generateFacilities(sportsOffered),
        programs: this.generatePrograms(sportsOffered),
        coachCount: Math.floor(Math.random() * 20) + 5,
        studentCapacity: Math.floor(Math.random() * 200) + 50,
        currentStudents: Math.floor(Math.random() * 150) + 30,
        established: Math.floor(Math.random() * 30) + 1990,
        certifications: this.generateAcademyCertifications(),
        description: this.generateAcademyDescription(),
        images: this.generateAcademyGallery(i),
        contact: {
          phone: this.generatePhoneNumber(),
          email: `info@academy${i}.com`,
          website: `www.academy${i}.com`,
          address: this.generateAddress(location),
        },
        operatingHours: this.generateOperatingHours(),
        amenities: this.generateAmenities(),
        isPartner: Math.random() > 0.7,
        hasTrialClass: Math.random() > 0.5,
        createdAt: new Date(Date.now() - Math.random() * 31536000000),
      });
    }
    
    return academies;
  }

  // Initialize sports categories
  initializeSports() {
    return [
      {
        id: 'football',
        name: 'Football',
        icon: 'sports-football',
        category: 'Team Sports',
        popularity: 95,
      },
      {
        id: 'basketball',
        name: 'Basketball',
        icon: 'sports-basketball',
        category: 'Team Sports',
        popularity: 90,
      },
      {
        id: 'tennis',
        name: 'Tennis',
        icon: 'sports-tennis',
        category: 'Individual Sports',
        popularity: 85,
      },
      {
        id: 'swimming',
        name: 'Swimming',
        icon: 'pool',
        category: 'Individual Sports',
        popularity: 80,
      },
      {
        id: 'athletics',
        name: 'Athletics',
        icon: 'directions-run',
        category: 'Individual Sports',
        popularity: 75,
      },
      {
        id: 'volleyball',
        name: 'Volleyball',
        icon: 'sports-volleyball',
        category: 'Team Sports',
        popularity: 70,
      },
      {
        id: 'baseball',
        name: 'Baseball',
        icon: 'sports-baseball',
        category: 'Team Sports',
        popularity: 65,
      },
      {
        id: 'soccer',
        name: 'Soccer',
        icon: 'sports-soccer',
        category: 'Team Sports',
        popularity: 88,
      },
      {
        id: 'golf',
        name: 'Golf',
        icon: 'golf-course',
        category: 'Individual Sports',
        popularity: 60,
      },
      {
        id: 'rugby',
        name: 'Rugby',
        icon: 'sports-rugby',
        category: 'Team Sports',
        popularity: 55,
      },
    ];
  }

  // Initialize locations
  initializeLocations() {
    return [
      { name: 'New York', state: 'NY', lat: 40.7128, lng: -74.0060 },
      { name: 'Los Angeles', state: 'CA', lat: 34.0522, lng: -118.2437 },
      { name: 'Chicago', state: 'IL', lat: 41.8781, lng: -87.6298 },
      { name: 'Houston', state: 'TX', lat: 29.7604, lng: -95.3698 },
      { name: 'Phoenix', state: 'AZ', lat: 33.4484, lng: -112.0740 },
      { name: 'Philadelphia', state: 'PA', lat: 39.9526, lng: -75.1652 },
      { name: 'San Antonio', state: 'TX', lat: 29.4241, lng: -98.4936 },
      { name: 'San Diego', state: 'CA', lat: 32.7157, lng: -117.1611 },
      { name: 'Dallas', state: 'TX', lat: 32.7767, lng: -96.7970 },
      { name: 'San Jose', state: 'CA', lat: 37.3382, lng: -121.8863 },
    ];
  }

  // Search coaches with filters
  async searchCoaches(filters = {}) {
    await this.initialize();
    
    let results = [...this.coaches];
    
    // Filter by sport
    if (filters.sport && filters.sport !== 'all') {
      results = results.filter(coach => 
        coach.sport.toLowerCase() === filters.sport.toLowerCase()
      );
    }
    
    // Filter by location
    if (filters.location) {
      results = results.filter(coach => 
        coach.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }
    
    // Filter by rating
    if (filters.minRating) {
      results = results.filter(coach => coach.rating >= filters.minRating);
    }
    
    // Filter by price range
    if (filters.maxPrice) {
      results = results.filter(coach => coach.pricePerSession <= filters.maxPrice);
    }
    
    // Filter by availability
    if (filters.availableNow) {
      results = results.filter(coach => coach.isOnline);
    }
    
    // Filter by experience
    if (filters.minExperience) {
      results = results.filter(coach => 
        parseInt(coach.experience) >= filters.minExperience
      );
    }
    
    // Search by name or specialization
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      results = results.filter(coach => 
        coach.name.toLowerCase().includes(query) ||
        coach.specializations.some(spec => spec.toLowerCase().includes(query)) ||
        coach.bio.toLowerCase().includes(query)
      );
    }
    
    // Sort results
    if (filters.sortBy) {
      results = this.sortCoaches(results, filters.sortBy);
    }
    
    return results;
  }

  // Search academies with filters
  async searchAcademies(filters = {}) {
    await this.initialize();
    
    let results = [...this.academies];
    
    // Filter by sport
    if (filters.sport && filters.sport !== 'all') {
      results = results.filter(academy => 
        academy.sportsOffered.some(sport => 
          sport.toLowerCase() === filters.sport.toLowerCase()
        )
      );
    }
    
    // Filter by location
    if (filters.location) {
      results = results.filter(academy => 
        academy.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }
    
    // Filter by rating
    if (filters.minRating) {
      results = results.filter(academy => academy.rating >= filters.minRating);
    }
    
    // Filter by price range
    if (filters.maxPrice) {
      results = results.filter(academy => academy.priceRange.min <= filters.maxPrice);
    }
    
    // Filter by age group
    if (filters.ageGroup) {
      results = results.filter(academy => 
        academy.ageGroups.includes(filters.ageGroup)
      );
    }
    
    // Search by name or description
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      results = results.filter(academy => 
        academy.name.toLowerCase().includes(query) ||
        academy.description.toLowerCase().includes(query) ||
        academy.programs.some(program => program.toLowerCase().includes(query))
      );
    }
    
    // Sort results
    if (filters.sortBy) {
      results = this.sortAcademies(results, filters.sortBy);
    }
    
    return results;
  }

  // Get coach by ID
  async getCoachById(coachId) {
    await this.initialize();
    return this.coaches.find(coach => coach.id === coachId);
  }

  // Get academy by ID
  async getAcademyById(academyId) {
    await this.initialize();
    return this.academies.find(academy => academy.id === academyId);
  }

  // Get nearby coaches
  async getNearbyCoaches(userLat, userLng, radiusKm = 50) {
    await this.initialize();
    
    return this.coaches.filter(coach => {
      const distance = this.calculateDistance(
        userLat, 
        userLng, 
        coach.latitude, 
        coach.longitude
      );
      return distance <= radiusKm;
    });
  }

  // Get popular sports
  getSports() {
    return this.sports.sort((a, b) => b.popularity - a.popularity);
  }

  // Get locations
  getLocations() {
    return this.locations;
  }

  // Helper methods
  sortCoaches(coaches, sortBy) {
    switch (sortBy) {
      case 'rating':
        return coaches.sort((a, b) => b.rating - a.rating);
      case 'price_low':
        return coaches.sort((a, b) => a.pricePerSession - b.pricePerSession);
      case 'price_high':
        return coaches.sort((a, b) => b.pricePerSession - a.pricePerSession);
      case 'experience':
        return coaches.sort((a, b) => 
          parseInt(b.experience) - parseInt(a.experience)
        );
      case 'reviews':
        return coaches.sort((a, b) => b.reviewCount - a.reviewCount);
      default:
        return coaches;
    }
  }

  sortAcademies(academies, sortBy) {
    switch (sortBy) {
      case 'rating':
        return academies.sort((a, b) => b.rating - a.rating);
      case 'price_low':
        return academies.sort((a, b) => a.priceRange.min - b.priceRange.min);
      case 'price_high':
        return academies.sort((a, b) => b.priceRange.max - a.priceRange.max);
      case 'established':
        return academies.sort((a, b) => a.established - b.established);
      case 'students':
        return academies.sort((a, b) => b.currentStudents - a.currentStudents);
      default:
        return academies;
    }
  }

  calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  // Data persistence methods
  async saveCoaches() {
    try {
      await AsyncStorage.setItem('coaches_database', JSON.stringify(this.coaches));
    } catch (error) {
      console.error('Failed to save coaches:', error);
    }
  }

  async saveAcademies() {
    try {
      await AsyncStorage.setItem('academies_database', JSON.stringify(this.academies));
    } catch (error) {
      console.error('Failed to save academies:', error);
    }
  }

  // Mock data generators
  generateRandomName() {
    const firstNames = ['John', 'Sarah', 'Mike', 'Emily', 'David', 'Lisa', 'Chris', 'Anna', 'Mark', 'Jennifer'];
    const lastNames = ['Smith', 'Johnson', 'Brown', 'Davis', 'Miller', 'Wilson', 'Moore', 'Taylor', 'Anderson', 'Thomas'];
    
    return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
  }

  generateAcademyName() {
    const adjectives = ['Elite', 'Premier', 'Champion', 'Victory', 'Excel', 'Peak', 'Supreme', 'Pro', 'Dynamic', 'Apex'];
    const nouns = ['Academy', 'Training Center', 'Sports Club', 'Athletic Center', 'Performance Institute'];
    
    return `${adjectives[Math.floor(Math.random() * adjectives.length)]} ${nouns[Math.floor(Math.random() * nouns.length)]}`;
  }

  getLocationCoordinates(location) {
    const coords = {
      'New York': { lat: 40.7128, lng: -74.0060 },
      'Los Angeles': { lat: 34.0522, lng: -118.2437 },
      'Chicago': { lat: 41.8781, lng: -87.6298 },
      'Houston': { lat: 29.7604, lng: -95.3698 },
      'Phoenix': { lat: 33.4484, lng: -112.0740 },
      'Philadelphia': { lat: 39.9526, lng: -75.1652 },
      'San Antonio': { lat: 29.4241, lng: -98.4936 },
      'San Diego': { lat: 32.7157, lng: -117.1611 },
      'Dallas': { lat: 32.7767, lng: -96.7970 },
      'San Jose': { lat: 37.3382, lng: -121.8863 },
    };
    
    return coords[location] || { lat: 0, lng: 0 };
  }

  getRandomSpecializations(specializations) {
    const count = Math.floor(Math.random() * 3) + 1;
    const shuffled = [...specializations].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  generateCertifications(sport) {
    const certifications = [
      `Certified ${sport} Coach`,
      'Sports Psychology Certificate',
      'First Aid & CPR Certified',
      'Strength & Conditioning Specialist',
      'Youth Sports Development Certificate',
    ];
    
    const count = Math.floor(Math.random() * 3) + 1;
    const shuffled = [...certifications].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  generateBio(sport, experience) {
    return `Passionate ${sport.toLowerCase()} coach with ${experience} years of experience helping athletes reach their full potential. Specialized in developing both technical skills and mental toughness.`;
  }

  generateResponseTime() {
    const times = ['Usually responds within 1 hour', 'Usually responds within 2 hours', 'Usually responds within 4 hours', 'Usually responds within 1 day'];
    return times[Math.floor(Math.random() * times.length)];
  }

  generateAvailability() {
    return {
      monday: Math.random() > 0.3,
      tuesday: Math.random() > 0.3,
      wednesday: Math.random() > 0.3,
      thursday: Math.random() > 0.3,
      friday: Math.random() > 0.3,
      saturday: Math.random() > 0.5,
      sunday: Math.random() > 0.5,
    };
  }

  generateLanguages() {
    const languages = ['English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese'];
    const count = Math.floor(Math.random() * 2) + 1;
    const shuffled = [...languages].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  generateAchievements(sport) {
    const achievements = [
      `Regional ${sport} Championship Winner`,
      'Coach of the Year Award',
      'Developed 10+ collegiate athletes',
      'Published training methodology',
      'International coaching certification',
    ];
    
    const count = Math.floor(Math.random() * 3) + 1;
    const shuffled = [...achievements].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  generatePhoneNumber() {
    return `+1 (${Math.floor(Math.random() * 900) + 100}) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`;
  }

  generateGallery(id) {
    return [
      `https://picsum.photos/400/300?random=${id}1`,
      `https://picsum.photos/400/300?random=${id}2`,
      `https://picsum.photos/400/300?random=${id}3`,
    ];
  }

  generateSchedule() {
    return {
      monday: ['9:00 AM - 12:00 PM', '2:00 PM - 6:00 PM'],
      tuesday: ['9:00 AM - 12:00 PM', '2:00 PM - 6:00 PM'],
      wednesday: ['9:00 AM - 12:00 PM', '2:00 PM - 6:00 PM'],
      thursday: ['9:00 AM - 12:00 PM', '2:00 PM - 6:00 PM'],
      friday: ['9:00 AM - 12:00 PM', '2:00 PM - 6:00 PM'],
      saturday: ['8:00 AM - 2:00 PM'],
      sunday: ['Rest Day'],
    };
  }

  getRandomSports(sports, count) {
    const shuffled = [...sports].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  generateFacilities(sportsOffered) {
    const allFacilities = [
      'Indoor Courts', 'Outdoor Fields', 'Swimming Pool', 'Gym Equipment',
      'Locker Rooms', 'Cafeteria', 'Medical Room', 'Video Analysis Room',
      'Parking', 'Pro Shop', 'Conference Room', 'Recovery Center'
    ];
    
    const count = Math.floor(Math.random() * 6) + 4;
    const shuffled = [...allFacilities].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  generatePrograms(sportsOffered) {
    const programs = [];
    sportsOffered.forEach(sport => {
      programs.push(`${sport} Fundamentals`);
      programs.push(`Advanced ${sport} Training`);
      programs.push(`${sport} Competition Prep`);
    });
    
    return programs;
  }

  generateAcademyCertifications() {
    const certs = [
      'National Sports Academy Accreditation',
      'Youth Sports Safety Certification',
      'Elite Training Facility License',
      'Sports Medicine Partnership',
    ];
    
    const count = Math.floor(Math.random() * 3) + 1;
    return certs.slice(0, count);
  }

  generateAcademyDescription() {
    return 'A premier training facility dedicated to developing athletic excellence through innovative coaching methods, state-of-the-art facilities, and personalized training programs.';
  }

  generateAcademyGallery(id) {
    return [
      `https://picsum.photos/600/400?random=${id}10`,
      `https://picsum.photos/600/400?random=${id}11`,
      `https://picsum.photos/600/400?random=${id}12`,
      `https://picsum.photos/600/400?random=${id}13`,
    ];
  }

  generateAddress(location) {
    const streets = ['Main St', 'Oak Ave', 'Park Blvd', 'Sports Dr', 'Athletic Way'];
    const number = Math.floor(Math.random() * 9999) + 1;
    const street = streets[Math.floor(Math.random() * streets.length)];
    
    return `${number} ${street}, ${location}`;
  }

  generateOperatingHours() {
    return {
      monday: '6:00 AM - 10:00 PM',
      tuesday: '6:00 AM - 10:00 PM',
      wednesday: '6:00 AM - 10:00 PM',
      thursday: '6:00 AM - 10:00 PM',
      friday: '6:00 AM - 10:00 PM',
      saturday: '7:00 AM - 9:00 PM',
      sunday: '8:00 AM - 8:00 PM',
    };
  }

  generateAmenities() {
    const amenities = [
      'Free WiFi', 'Equipment Rental', 'Nutritionist on Staff',
      'Physical Therapy', 'Recovery Center', 'Juice Bar',
      'Parent Lounge', 'Study Area', 'Birthday Party Packages'
    ];
    
    const count = Math.floor(Math.random() * 5) + 3;
    const shuffled = [...amenities].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }
}

// Create and export singleton instance
const researchDatabase = new ResearchDatabase();

export default ResearchDatabase;