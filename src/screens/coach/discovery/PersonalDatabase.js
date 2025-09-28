// PersonalDatabase.js - User Personal and Profile Management Database
import AsyncStorage from '@react-native-async-storage/async-storage';

// Persona types
export const PERSONA_TYPES = {
  COACH: 'coach',
  PLAYER: 'player',
  PARENT: 'parent',
  ACADEMY: 'academy',
};

// User status types
export const USER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
  PENDING: 'pending',
  VERIFIED: 'verified',
};

// Skill levels
export const SKILL_LEVELS = {
  BEGINNER: 'beginner',
  INTERMEDIATE: 'intermediate',
  ADVANCED: 'advanced',
  PROFESSIONAL: 'professional',
};

// Age groups
export const AGE_GROUPS = {
  YOUTH: '6-12',
  TEEN: '13-17',
  ADULT: '18+',
  SENIOR: '50+',
};

class PersonalDatabase {
  constructor() {
    this.users = new Map();
    this.currentUser = null;
    this.userPreferences = new Map();
    this.userStats = new Map();
    this.userConnections = new Map();
    this.initialized = false;
  }

  // Initialize the database
  async initialize() {
    if (this.initialized) return;

    try {
      // Load existing data from AsyncStorage
      const storedUsers = await AsyncStorage.getItem('persona_users');
      const storedCurrentUser = await AsyncStorage.getItem('current_user');
      const storedPreferences = await AsyncStorage.getItem('user_preferences');
      const storedStats = await AsyncStorage.getItem('user_stats');
      const storedConnections = await AsyncStorage.getItem('user_connections');

      if (storedUsers) {
        const usersArray = JSON.parse(storedUsers);
        usersArray.forEach(user => {
          this.users.set(user.id, user);
        });
      } else {
        // Generate mock users for development
        await this.generateMockUsers();
      }

      if (storedCurrentUser) {
        this.currentUser = JSON.parse(storedCurrentUser);
      }

      if (storedPreferences) {
        const prefsArray = JSON.parse(storedPreferences);
        prefsArray.forEach(pref => {
          this.userPreferences.set(pref.userId, pref);
        });
      }

      if (storedStats) {
        const statsArray = JSON.parse(storedStats);
        statsArray.forEach(stat => {
          this.userStats.set(stat.userId, stat);
        });
      }

      if (storedConnections) {
        const connectionsArray = JSON.parse(storedConnections);
        connectionsArray.forEach(connection => {
          this.userConnections.set(connection.userId, connection);
        });
      }

      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize PersonalDatabase:', error);
      await this.generateMockUsers();
      this.initialized = true;
    }
  }

  // Create new user profile
  async createUser(userData) {
    await this.initialize();

    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const newUser = {
      id: userId,
      email: userData.email,
      phone: userData.phone,
      persona: userData.persona,
      status: USER_STATUS.PENDING,
      profile: this.createPersonaProfile(userData.persona, userData),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
      isVerified: false,
      settings: this.getDefaultSettings(),
      privacy: this.getDefaultPrivacy(),
    };

    this.users.set(userId, newUser);
    await this.saveUsers();

    // Initialize user preferences and stats
    await this.initializeUserPreferences(userId, userData.persona);
    await this.initializeUserStats(userId, userData.persona);
    await this.initializeUserConnections(userId);

    return newUser;
  }

  // Create persona-specific profile
  createPersonaProfile(persona, userData) {
    const baseProfile = {
      firstName: userData.firstName,
      lastName: userData.lastName,
      avatar: userData.avatar || null,
      location: userData.location || '',
      bio: userData.bio || '',
      dateOfBirth: userData.dateOfBirth || null,
      gender: userData.gender || '',
      languages: userData.languages || ['English'],
      timezone: userData.timezone || 'UTC',
    };

    switch (persona) {
      case PERSONA_TYPES.COACH:
        return {
          ...baseProfile,
          specializations: userData.specializations || [],
          sports: userData.sports || [],
          experience: userData.experience || 0,
          certifications: userData.certifications || [],
          education: userData.education || [],
          achievements: userData.achievements || [],
          coachingPhilosophy: userData.coachingPhilosophy || '',
          pricePerSession: userData.pricePerSession || 0,
          sessionTypes: userData.sessionTypes || ['individual'],
          availability: userData.availability || this.getDefaultAvailability(),
          businessInfo: {
            businessName: userData.businessName || '',
            businessType: userData.businessType || 'individual',
            taxId: userData.taxId || '',
            website: userData.website || '',
          },
          socialProof: {
            studentsCount: 0,
            successRate: 0,
            testimonials: [],
            ratings: [],
          },
        };

      case PERSONA_TYPES.PLAYER:
        return {
          ...baseProfile,
          sports: userData.sports || [],
          skillLevel: userData.skillLevel || SKILL_LEVELS.BEGINNER,
          position: userData.position || '',
          dominantHand: userData.dominantHand || '',
          height: userData.height || null,
          weight: userData.weight || null,
          goals: userData.goals || [],
          medicalInfo: {
            allergies: userData.allergies || [],
            medications: userData.medications || [],
            injuries: userData.injuries || [],
            emergencyContact: userData.emergencyContact || null,
          },
          parentInfo: userData.isMinor ? {
            parentId: userData.parentId || null,
            parentName: userData.parentName || '',
            parentEmail: userData.parentEmail || '',
            parentPhone: userData.parentPhone || '',
          } : null,
          schoolInfo: {
            school: userData.school || '',
            grade: userData.grade || '',
            gpa: userData.gpa || null,
          },
        };

      case PERSONA_TYPES.PARENT:
        return {
          ...baseProfile,
          children: userData.children || [],
          interests: userData.interests || [],
          budgetRange: userData.budgetRange || { min: 0, max: 200 },
          transportationAvailable: userData.transportationAvailable || true,
          preferredLocations: userData.preferredLocations || [],
          communicationPreferences: {
            updates: userData.updatesFrequency || 'weekly',
            method: userData.communicationMethod || 'app',
            emergencyOnly: userData.emergencyOnly || false,
          },
        };

      case PERSONA_TYPES.ACADEMY:
        return {
          ...baseProfile,
          academyName: userData.academyName || '',
          established: userData.established || new Date().getFullYear(),
          sportsOffered: userData.sportsOffered || [],
          ageGroups: userData.ageGroups || [],
          facilities: userData.facilities || [],
          programs: userData.programs || [],
          coachCount: userData.coachCount || 0,
          studentCapacity: userData.studentCapacity || 100,
          currentStudents: userData.currentStudents || 0,
          priceRange: userData.priceRange || { min: 50, max: 200 },
          operatingHours: userData.operatingHours || this.getDefaultOperatingHours(),
          amenities: userData.amenities || [],
          accreditations: userData.accreditations || [],
        };

      default:
        return baseProfile;
    }
  }

  // Get user by ID
  async getUserById(userId) {
    await this.initialize();
    return this.users.get(userId);
  }

  // Get user by email
  async getUserByEmail(email) {
    await this.initialize();
    for (const user of this.users.values()) {
      if (user.email === email) {
        return user;
      }
    }
    return null;
  }

  // Update user profile
  async updateUser(userId, updates) {
    await this.initialize();
    
    const user = this.users.get(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const updatedUser = {
      ...user,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    this.users.set(userId, updatedUser);
    await this.saveUsers();

    // Update current user if it's the same user
    if (this.currentUser && this.currentUser.id === userId) {
      this.currentUser = updatedUser;
      await this.saveCurrentUser();
    }

    return updatedUser;
  }

  // Update user profile section
  async updateUserProfile(userId, profileUpdates) {
    await this.initialize();
    
    const user = this.users.get(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const updatedUser = {
      ...user,
      profile: {
        ...user.profile,
        ...profileUpdates,
      },
      updatedAt: new Date().toISOString(),
    };

    this.users.set(userId, updatedUser);
    await this.saveUsers();

    if (this.currentUser && this.currentUser.id === userId) {
      this.currentUser = updatedUser;
      await this.saveCurrentUser();
    }

    return updatedUser;
  }

  // Set current user
  async setCurrentUser(userId) {
    await this.initialize();
    
    const user = this.users.get(userId);
    if (!user) {
      throw new Error('User not found');
    }

    this.currentUser = user;
    await this.saveCurrentUser();
    
    // Update last active
    await this.updateUser(userId, { lastActive: new Date().toISOString() });

    return user;
  }

  // Get current user
  getCurrentUser() {
    return this.currentUser;
  }

  // Logout current user
  async logout() {
    this.currentUser = null;
    await AsyncStorage.removeItem('current_user');
  }

  // Get user preferences
  async getUserPreferences(userId) {
    await this.initialize();
    return this.userPreferences.get(userId);
  }

  // Update user preferences
  async updateUserPreferences(userId, preferences) {
    await this.initialize();
    
    const currentPrefs = this.userPreferences.get(userId) || {};
    const updatedPrefs = {
      ...currentPrefs,
      ...preferences,
      userId,
      updatedAt: new Date().toISOString(),
    };

    this.userPreferences.set(userId, updatedPrefs);
    await this.savePreferences();

    return updatedPrefs;
  }

  // Get user stats
  async getUserStats(userId) {
    await this.initialize();
    return this.userStats.get(userId);
  }

  // Update user stats
  async updateUserStats(userId, stats) {
    await this.initialize();
    
    const currentStats = this.userStats.get(userId) || {};
    const updatedStats = {
      ...currentStats,
      ...stats,
      userId,
      updatedAt: new Date().toISOString(),
    };

    this.userStats.set(userId, updatedStats);
    await this.saveStats();

    return updatedStats;
  }

  // Get user connections
  async getUserConnections(userId) {
    await this.initialize();
    return this.userConnections.get(userId);
  }

  // Add connection
  async addConnection(userId, connectionId, connectionType = 'friend') {
    await this.initialize();
    
    const connections = this.userConnections.get(userId) || { userId, connections: [] };
    
    // Check if connection already exists
    const existingIndex = connections.connections.findIndex(
      conn => conn.userId === connectionId
    );

    if (existingIndex >= 0) {
      // Update existing connection
      connections.connections[existingIndex] = {
        ...connections.connections[existingIndex],
        type: connectionType,
        updatedAt: new Date().toISOString(),
      };
    } else {
      // Add new connection
      connections.connections.push({
        userId: connectionId,
        type: connectionType,
        status: 'active',
        connectedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    this.userConnections.set(userId, connections);
    await this.saveConnections();

    return connections;
  }

  // Search users by persona and filters
  async searchUsers(filters = {}) {
    await this.initialize();
    
    let results = Array.from(this.users.values());

    // Filter by persona
    if (filters.persona) {
      results = results.filter(user => user.persona === filters.persona);
    }

    // Filter by location
    if (filters.location) {
      results = results.filter(user => 
        user.profile.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    // Filter by sport (for coaches and players)
    if (filters.sport) {
      results = results.filter(user => {
        if (user.profile.sports) {
          return user.profile.sports.some(sport => 
            sport.toLowerCase().includes(filters.sport.toLowerCase())
          );
        }
        if (user.profile.sportsOffered) {
          return user.profile.sportsOffered.some(sport => 
            sport.toLowerCase().includes(filters.sport.toLowerCase())
          );
        }
        return false;
      });
    }

    // Filter by status
    if (filters.status) {
      results = results.filter(user => user.status === filters.status);
    }

    // Filter by verified status
    if (filters.verified !== undefined) {
      results = results.filter(user => user.isVerified === filters.verified);
    }

    // Search by name
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      results = results.filter(user => 
        `${user.profile.firstName} ${user.profile.lastName}`.toLowerCase().includes(query) ||
        user.profile.bio.toLowerCase().includes(query)
      );
    }

    return results;
  }

  // Get users by persona
  async getUsersByPersona(persona) {
    await this.initialize();
    
    return Array.from(this.users.values()).filter(user => user.persona === persona);
  }

  // Initialize user preferences
  async initializeUserPreferences(userId, persona) {
    const defaultPreferences = {
      userId,
      notifications: {
        push: true,
        email: true,
        sms: false,
        sessionReminders: true,
        progressUpdates: true,
        socialActivity: false,
      },
      privacy: {
        profileVisibility: 'public',
        showLocation: true,
        showContactInfo: false,
        allowMessaging: true,
      },
      app: {
        theme: 'light',
        language: 'en',
        units: 'metric',
        autoSync: true,
      },
      persona: this.getPersonaSpecificPreferences(persona),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.userPreferences.set(userId, defaultPreferences);
    await this.savePreferences();
  }

  // Initialize user stats
  async initializeUserStats(userId, persona) {
    const defaultStats = {
      userId,
      general: {
        joinDate: new Date().toISOString(),
        loginStreak: 0,
        totalLogins: 0,
        profileViews: 0,
        connections: 0,
      },
      persona: this.getPersonaSpecificStats(persona),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.userStats.set(userId, defaultStats);
    await this.saveStats();
  }

  // Initialize user connections
  async initializeUserConnections(userId) {
    const defaultConnections = {
      userId,
      connections: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.userConnections.set(userId, defaultConnections);
    await this.saveConnections();
  }

  // Get persona-specific preferences
  getPersonaSpecificPreferences(persona) {
    switch (persona) {
      case PERSONA_TYPES.COACH:
        return {
          businessHours: this.getDefaultAvailability(),
          autoBooking: false,
          sessionReminders: 24, // hours
          paymentReminders: true,
          clientUpdates: 'weekly',
        };

      case PERSONA_TYPES.PLAYER:
        return {
          goalTracking: true,
          performanceAnalytics: true,
          parentalNotifications: true,
          coachFeedback: 'immediate',
          workoutReminders: true,
        };

      case PERSONA_TYPES.PARENT:
        return {
          childUpdates: 'daily',
          emergencyAlerts: true,
          progressReports: 'weekly',
          paymentReminders: true,
          scheduleChanges: true,
        };

      case PERSONA_TYPES.ACADEMY:
        return {
          staffNotifications: true,
          studentUpdates: 'weekly',
          parentCommunication: true,
          eventReminders: true,
          enrollmentAlerts: true,
        };

      default:
        return {};
    }
  }

  // Get persona-specific stats
  getPersonaSpecificStats(persona) {
    switch (persona) {
      case PERSONA_TYPES.COACH:
        return {
          studentsCount: 0,
          sessionsCompleted: 0,
          totalRevenue: 0,
          averageRating: 0,
          reviewsCount: 0,
          responseRate: 0,
          cancellationRate: 0,
        };

      case PERSONA_TYPES.PLAYER:
        return {
          sessionsAttended: 0,
          skillsImproved: [],
          goalsAchieved: 0,
          totalTrainingHours: 0,
          performanceScores: [],
          streakDays: 0,
          badges: [],
        };

      case PERSONA_TYPES.PARENT:
        return {
          childrenEnrolled: 0,
          totalSpent: 0,
          sessionsBooked: 0,
          feedbackSubmitted: 0,
          eventAttendance: 0,
        };

      case PERSONA_TYPES.ACADEMY:
        return {
          totalStudents: 0,
          totalCoaches: 0,
          sessionsDelivered: 0,
          averageRating: 0,
          reviewsCount: 0,
          enrollmentRate: 0,
          retentionRate: 0,
        };

      default:
        return {};
    }
  }

  // Get default settings
  getDefaultSettings() {
    return {
      theme: 'light',
      language: 'en',
      notifications: true,
      autoSync: true,
      biometric: false,
      twoFactor: false,
    };
  }

  // Get default privacy settings
  getDefaultPrivacy() {
    return {
      profileVisibility: 'public',
      showLocation: true,
      showContactInfo: false,
      allowMessaging: true,
      dataSharing: false,
      analytics: true,
    };
  }

  // Get default availability
  getDefaultAvailability() {
    return {
      monday: { available: true, hours: [{ start: '09:00', end: '17:00' }] },
      tuesday: { available: true, hours: [{ start: '09:00', end: '17:00' }] },
      wednesday: { available: true, hours: [{ start: '09:00', end: '17:00' }] },
      thursday: { available: true, hours: [{ start: '09:00', end: '17:00' }] },
      friday: { available: true, hours: [{ start: '09:00', end: '17:00' }] },
      saturday: { available: false, hours: [] },
      sunday: { available: false, hours: [] },
    };
  }

  // Get default operating hours
  getDefaultOperatingHours() {
    return {
      monday: '06:00 - 22:00',
      tuesday: '06:00 - 22:00',
      wednesday: '06:00 - 22:00',
      thursday: '06:00 - 22:00',
      friday: '06:00 - 22:00',
      saturday: '07:00 - 20:00',
      sunday: '08:00 - 18:00',
    };
  }

  // Generate mock users for development
  async generateMockUsers() {
    const mockUsers = [];
    
    // Generate coaches
    for (let i = 1; i <= 20; i++) {
      const coach = await this.createUser({
        email: `coach${i}@example.com`,
        phone: `+1555000${i.toString().padStart(4, '0')}`,
        persona: PERSONA_TYPES.COACH,
        firstName: this.getRandomFirstName(),
        lastName: this.getRandomLastName(),
        location: this.getRandomLocation(),
        sports: this.getRandomSports(1, 3),
        specializations: this.getRandomSpecializations(),
        experience: Math.floor(Math.random() * 20) + 1,
        pricePerSession: Math.floor(Math.random() * 80) + 20,
      });
      mockUsers.push(coach);
    }

    // Generate players
    for (let i = 1; i <= 30; i++) {
      const player = await this.createUser({
        email: `player${i}@example.com`,
        phone: `+1555001${i.toString().padStart(4, '0')}`,
        persona: PERSONA_TYPES.PLAYER,
        firstName: this.getRandomFirstName(),
        lastName: this.getRandomLastName(),
        location: this.getRandomLocation(),
        sports: this.getRandomSports(1, 2),
        skillLevel: this.getRandomSkillLevel(),
        dateOfBirth: this.getRandomBirthDate(),
      });
      mockUsers.push(player);
    }

    // Generate parents
    for (let i = 1; i <= 15; i++) {
      const parent = await this.createUser({
        email: `parent${i}@example.com`,
        phone: `+1555002${i.toString().padStart(4, '0')}`,
        persona: PERSONA_TYPES.PARENT,
        firstName: this.getRandomFirstName(),
        lastName: this.getRandomLastName(),
        location: this.getRandomLocation(),
        children: this.generateMockChildren(),
      });
      mockUsers.push(parent);
    }

    return mockUsers;
  }

  // Helper methods for mock data generation
  getRandomFirstName() {
    const names = ['John', 'Sarah', 'Mike', 'Emily', 'David', 'Lisa', 'Chris', 'Anna', 'Mark', 'Jennifer', 
                   'Robert', 'Michelle', 'James', 'Amanda', 'Daniel', 'Jessica', 'Matthew', 'Ashley'];
    return names[Math.floor(Math.random() * names.length)];
  }

  getRandomLastName() {
    const names = ['Smith', 'Johnson', 'Brown', 'Davis', 'Miller', 'Wilson', 'Moore', 'Taylor', 
                   'Anderson', 'Thomas', 'Jackson', 'White', 'Harris', 'Martin', 'Thompson'];
    return names[Math.floor(Math.random() * names.length)];
  }

  getRandomLocation() {
    const locations = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 
                       'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose'];
    return locations[Math.floor(Math.random() * locations.length)];
  }

  getRandomSports(min, max) {
    const sports = ['Football', 'Basketball', 'Tennis', 'Swimming', 'Athletics', 
                    'Volleyball', 'Baseball', 'Soccer', 'Golf', 'Rugby'];
    const count = Math.floor(Math.random() * (max - min + 1)) + min;
    const shuffled = [...sports].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  getRandomSpecializations() {
    const specs = ['Youth Training', 'Professional Coaching', 'Fitness Training', 
                   'Rehabilitation', 'Performance Analysis', 'Mental Coaching'];
    const count = Math.floor(Math.random() * 3) + 1;
    const shuffled = [...specs].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  getRandomSkillLevel() {
    const levels = Object.values(SKILL_LEVELS);
    return levels[Math.floor(Math.random() * levels.length)];
  }

  getRandomBirthDate() {
    const start = new Date(1990, 0, 1);
    const end = new Date(2015, 11, 31);
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString();
  }

  generateMockChildren() {
    const count = Math.floor(Math.random() * 3) + 1;
    const children = [];
    
    for (let i = 0; i < count; i++) {
      children.push({
        name: this.getRandomFirstName(),
        age: Math.floor(Math.random() * 12) + 6,
        sports: this.getRandomSports(1, 2),
        skillLevel: SKILL_LEVELS.BEGINNER,
      });
    }
    
    return children;
  }

  // Data persistence methods
  async saveUsers() {
    try {
      const usersArray = Array.from(this.users.values());
      await AsyncStorage.setItem('persona_users', JSON.stringify(usersArray));
    } catch (error) {
      console.error('Failed to save users:', error);
    }
  }

  async saveCurrentUser() {
    try {
      await AsyncStorage.setItem('current_user', JSON.stringify(this.currentUser));
    } catch (error) {
      console.error('Failed to save current user:', error);
    }
  }

  async savePreferences() {
    try {
      const prefsArray = Array.from(this.userPreferences.values());
      await AsyncStorage.setItem('user_preferences', JSON.stringify(prefsArray));
    } catch (error) {
      console.error('Failed to save preferences:', error);
    }
  }

  async saveStats() {
    try {
      const statsArray = Array.from(this.userStats.values());
      await AsyncStorage.setItem('user_stats', JSON.stringify(statsArray));
    } catch (error) {
      console.error('Failed to save stats:', error);
    }
  }

  async saveConnections() {
    try {
      const connectionsArray = Array.from(this.userConnections.values());
      await AsyncStorage.setItem('user_connections', JSON.stringify(connectionsArray));
    } catch (error) {
      console.error('Failed to save connections:', error);
    }
  }

  // Clear all data (for testing)
  async clearAllData() {
    try {
      await AsyncStorage.multiRemove([
        'persona_users',
        'current_user',
        'user_preferences',
        'user_stats',
        'user_connections',
      ]);
      
      this.users.clear();
      this.userPreferences.clear();
      this.userStats.clear();
      this.userConnections.clear();
      this.currentUser = null;
      this.initialized = false;
    } catch (error) {
      console.error('Failed to clear data:', error);
    }
  }
}

// Create and export singleton instance
const personalDatabase = new PersonalDatabase();

export default personalDatabase;
export { PERSONA_TYPES, USER_STATUS, SKILL_LEVELS, AGE_GROUPS };