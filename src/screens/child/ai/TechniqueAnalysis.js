import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
  StatusBar,
  Animated,
  TouchableOpacity,
  RefreshControl,
  Vibration,
  Dimensions,
  Image,
  Modal,
  Linking,
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
  TextInput,
  Searchbar,
  ActivityIndicator,
  Divider,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Import your design system constants
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  background: '#f5f5f5',
  surface: '#ffffff',
  text: '#333333',
  textSecondary: '#666666',
  disabled: '#cccccc',
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

const TEXT_STYLES = {
  title: { fontSize: 24, fontWeight: 'bold', color: COLORS.text },
  subtitle: { fontSize: 18, fontWeight: '600', color: COLORS.text },
  body: { fontSize: 16, color: COLORS.text },
  caption: { fontSize: 14, color: COLORS.textSecondary },
  small: { fontSize: 12, color: COLORS.textSecondary },
};

const { width, height } = Dimensions.get('window');

const TechniqueAnalysis = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const analyses = useSelector(state => state.technique.analyses || []);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  // Animation references
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const sparkleAnim = useRef(new Animated.Value(0)).current;
  
  // State management
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedTechnique, setSelectedTechnique] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [points, setPoints] = useState(user?.points || 0);
  const [streak, setStreak] = useState(user?.techniqueStreak || 0);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');

  // Sample data for child-friendly technique categories
  const techniqueCategories = [
    { 
      id: 'soccer', 
      name: 'Soccer Skills ⚽', 
      color: '#4CAF50',
      icon: 'sports-soccer',
      techniques: ['Dribbling', 'Passing', 'Shooting', 'Ball Control']
    },
    { 
      id: 'basketball', 
      name: 'Basketball Moves 🏀', 
      color: '#FF9800',
      icon: 'sports-basketball',
      techniques: ['Shooting', 'Dribbling', 'Passing', 'Defense']
    },
    { 
      id: 'swimming', 
      name: 'Swimming Strokes 🏊', 
      color: '#03A9F4',
      icon: 'pool',
      techniques: ['Freestyle', 'Backstroke', 'Breaststroke', 'Butterfly']
    },
    { 
      id: 'tennis', 
      name: 'Tennis Techniques 🎾', 
      color: '#9C27B0',
      icon: 'sports-tennis',
      techniques: ['Forehand', 'Backhand', 'Serve', 'Volley']
    },
  ];

  // Sample analysis data
  const sampleAnalyses = [
    {
      id: '1',
      videoId: 'video_1',
      technique: 'Soccer Dribbling',
      date: '2025-08-27',
      thumbnail: 'https://via.placeholder.com/150x100/4CAF50/white?text=Soccer',
      score: 85,
      improvements: ['Keep head up more', 'Use both feet equally', 'Control pace better'],
      strengths: ['Great ball control', 'Good body positioning', 'Confident touches'],
      status: 'completed',
      funFact: 'You improved 15 points since last time! 🎉',
      nextSteps: ['Practice with cones', 'Try dribbling with weaker foot'],
      pointsEarned: 120,
      badge: 'Dribble Master',
    },
    {
      id: '2',
      videoId: 'video_2',
      technique: 'Basketball Shooting',
      date: '2025-08-25',
      thumbnail: 'https://via.placeholder.com/150x100/FF9800/white?text=Basketball',
      score: 78,
      improvements: ['Follow through more', 'Square shoulders to basket', 'Use legs more'],
      strengths: ['Good arc on shot', 'Consistent form', 'Nice rhythm'],
      status: 'completed',
      funFact: 'Your shooting accuracy improved by 12%! 🏀',
      nextSteps: ['Practice free throws', 'Work on jump shot timing'],
      pointsEarned: 100,
      badge: 'Sharp Shooter',
    },
  ];

  // Initialize animations
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Sparkle animation for points
    Animated.loop(
      Animated.sequence([
        Animated.timing(sparkleAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(sparkleAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate refresh
    setTimeout(() => {
      setRefreshing(false);
      Vibration.vibrate(50);
    }, 1000);
  }, []);

  const handleVideoUpload = () => {
    Alert.alert(
      'Upload Video 📹',
      'Choose how you want to add your technique video:',
      [
        {
          text: 'Record New Video 🎬',
          onPress: () => recordVideo(),
        },
        {
          text: 'Choose from Gallery 📱',
          onPress: () => selectFromGallery(),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  const recordVideo = () => {
    Alert.alert(
      'Feature Coming Soon! 🚧',
      'Video recording will be available in the next update. Stay tuned! 🎬',
      [{ text: 'Got it! 👍', style: 'default' }]
    );
  };

  const selectFromGallery = () => {
    Alert.alert(
      'Feature Coming Soon! 🚧',
      'Gallery selection will be available in the next update. Stay tuned! 📱',
      [{ text: 'Got it! 👍', style: 'default' }]
    );
  };

  const startAnalysis = (technique) => {
    setSelectedTechnique(technique);
    setIsAnalyzing(true);
    setShowUploadModal(false);
    
    // Simulate AI analysis
    setTimeout(() => {
      const mockResults = {
        technique: technique,
        score: Math.floor(Math.random() * 30) + 70, // 70-100
        improvements: [
          'Keep your balance centered',
          'Focus on smooth movements',
          'Practice the basics more',
        ],
        strengths: [
          'Great enthusiasm! 🌟',
          'Good effort and energy',
          'Nice form fundamentals',
        ],
        funFact: `You're ${Math.floor(Math.random() * 20) + 5}% better than last time! 🎉`,
        pointsEarned: Math.floor(Math.random() * 50) + 75,
        badge: technique.includes('Soccer') ? '⚽ Soccer Star' : '🏀 Basketball Pro',
      };
      
      setAnalysisResults(mockResults);
      setIsAnalyzing(false);
      setShowResults(true);
      setPoints(prev => prev + mockResults.pointsEarned);
      setStreak(prev => prev + 1);
      Vibration.vibrate([100, 50, 100]);
    }, 3000);
  };

  const renderHeader = () => (
    <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <View style={styles.headerContent}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={[TEXT_STYLES.title, { color: 'white', flex: 1, textAlign: 'center' }]}>
          Technique AI Coach 🤖
        </Text>
        <Animated.View 
          style={[
            styles.pointsBadge,
            {
              opacity: sparkleAnim,
            },
          ]}
        >
          <Icon name="star" size={16} color="#FFD700" />
          <Text style={styles.pointsText}>{points}</Text>
        </Animated.View>
      </View>
      <View style={styles.streakContainer}>
        <Icon name="local-fire-department" size={20} color="#FF5722" />
        <Text style={styles.streakText}>{streak} day streak! 🔥</Text>
      </View>
    </LinearGradient>
  );

  const renderQuickActions = () => (
    <Surface style={styles.quickActionsContainer}>
      <Text style={[TEXT_STYLES.subtitle, styles.sectionTitle]}>
        Quick Actions 🚀
      </Text>
      <View style={styles.quickActionsGrid}>
        <TouchableOpacity 
          style={[styles.quickActionCard, { backgroundColor: COLORS.primary }]}
          onPress={() => setShowUploadModal(true)}
        >
          <Icon name="video-call" size={32} color="white" />
          <Text style={styles.quickActionText}>Upload Video 📹</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.quickActionCard, { backgroundColor: COLORS.success }]}
          onPress={() => navigation.navigate('DrillLibrary')}
        >
          <Icon name="fitness-center" size={32} color="white" />
          <Text style={styles.quickActionText}>Practice Drills 🏃‍♀️</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.quickActionCard, { backgroundColor: COLORS.warning }]}
          onPress={() => navigation.navigate('Progress')}
        >
          <Icon name="trending-up" size={32} color="white" />
          <Text style={styles.quickActionText}>View Progress 📈</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.quickActionCard, { backgroundColor: COLORS.secondary }]}
          onPress={() => navigation.navigate('Achievements')}
        >
          <Icon name="jump-rope" size={32} color="white" />
          <Text style={styles.quickActionText}>My Badges 🏆</Text>
        </TouchableOpacity>
      </View>
    </Surface>
  );

  const renderRecentAnalyses = () => (
    <Surface style={styles.recentContainer}>
      <View style={styles.sectionHeader}>
        <Text style={[TEXT_STYLES.subtitle, styles.sectionTitle]}>
          Recent Analyses 🔍
        </Text>
        <TouchableOpacity onPress={() => navigation.navigate('AllAnalyses')}>
          <Text style={styles.viewAllText}>View All</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {sampleAnalyses.map((analysis) => (
          <TouchableOpacity
            key={analysis.id}
            style={styles.analysisCard}
            onPress={() => viewAnalysisDetails(analysis)}
          >
            <Image source={{ uri: analysis.thumbnail }} style={styles.analysisThumbnail} />
            <View style={styles.analysisOverlay}>
              <Text style={styles.analysisScore}>{analysis.score}%</Text>
            </View>
            <View style={styles.analysisContent}>
              <Text style={styles.analysisTitle}>{analysis.technique}</Text>
              <Text style={styles.analysisDate}>{analysis.date}</Text>
              <View style={styles.analysisPoints}>
                <Icon name="star" size={16} color="#FFD700" />
                <Text style={styles.analysisPointsText}>+{analysis.pointsEarned}</Text>
              </View>
              <Chip icon="military-tech" compact style={styles.badgeChip}>
                {analysis.badge}
              </Chip>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </Surface>
  );

  const renderTechniqueCategories = () => (
    <Surface style={styles.categoriesContainer}>
      <Text style={[TEXT_STYLES.subtitle, styles.sectionTitle]}>
        Choose Your Sport 🏃‍♀️
      </Text>
      <Text style={[TEXT_STYLES.caption, styles.sectionDescription]}>
        Pick a sport to analyze your technique!
      </Text>
      
      <View style={styles.categoriesGrid}>
        {techniqueCategories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[styles.categoryCard, { backgroundColor: category.color }]}
            onPress={() => showTechniqueOptions(category)}
          >
            <Icon name={category.icon} size={40} color="white" />
            <Text style={styles.categoryName}>{category.name}</Text>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeText}>
                {category.techniques.length} techniques
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </Surface>
  );

  const showTechniqueOptions = (category) => {
    Alert.alert(
      `${category.name} Techniques`,
      'Which technique would you like to analyze?',
      [
        ...category.techniques.map(technique => ({
          text: `${technique} ${technique === 'Dribbling' ? '⚽' : technique === 'Shooting' ? '🎯' : '🏃‍♀️'}`,
          onPress: () => startAnalysis(`${category.name} - ${technique}`),
        })),
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const viewAnalysisDetails = (analysis) => {
    Alert.alert(
      `${analysis.technique} Analysis 🔍`,
      `Score: ${analysis.score}%\n\n` +
      `Fun Fact: ${analysis.funFact}\n\n` +
      `Strengths:\n${analysis.strengths.map(s => `• ${s}`).join('\n')}\n\n` +
      `Areas to improve:\n${analysis.improvements.map(i => `• ${i}`).join('\n')}`,
      [
        {
          text: 'Practice Tips 💡',
          onPress: () => showPracticeTips(analysis),
        },
        {
          text: 'Share Progress 📱',
          onPress: () => shareProgress(analysis),
        },
        { text: 'Close', style: 'cancel' },
      ]
    );
  };

  const showPracticeTips = (analysis) => {
    Alert.alert(
      'Practice Tips 💡',
      `Here are some tips to improve your ${analysis.technique}:\n\n` +
      `${analysis.nextSteps.map(tip => `🎯 ${tip}`).join('\n')}\n\n` +
      'Keep practicing and you\'ll get even better! 🌟',
      [{ text: 'Got it! 👍', style: 'default' }]
    );
  };

  const shareProgress = (analysis) => {
    Alert.alert(
      'Share Your Progress! 📱',
      `Great job on your ${analysis.technique}! Want to share your ${analysis.score}% score with your coach or parents?`,
      [
        {
          text: 'Share with Coach 👨‍🏫',
          onPress: () => Alert.alert('Shared! 📤', 'Your coach will see your progress!'),
        },
        {
          text: 'Share with Parents 👨‍👩‍👧',
          onPress: () => Alert.alert('Shared! 📤', 'Your parents will be so proud!'),
        },
        { text: 'Maybe Later', style: 'cancel' },
      ]
    );
  };

  const renderUploadModal = () => (
    <Portal>
      <Modal
        visible={showUploadModal}
        onDismiss={() => setShowUploadModal(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <BlurView style={styles.modalBlur} blurType="light" blurAmount={10}>
          <Text style={[TEXT_STYLES.title, styles.modalTitle]}>
            Upload Your Video! 🎬
          </Text>
          <Text style={[TEXT_STYLES.caption, styles.modalDescription]}>
            Record or choose a video of your technique for AI analysis
          </Text>
          
          <View style={styles.uploadOptions}>
            <TouchableOpacity style={styles.uploadOption} onPress={recordVideo}>
              <LinearGradient colors={[COLORS.primary, COLORS.secondary]} style={styles.uploadOptionGradient}>
                <Icon name="videocam" size={32} color="white" />
                <Text style={styles.uploadOptionText}>Record New Video</Text>
                <Text style={styles.uploadOptionSubtext}>Use your camera 📹</Text>
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.uploadOption} onPress={selectFromGallery}>
              <LinearGradient colors={[COLORS.success, '#66BB6A']} style={styles.uploadOptionGradient}>
                <Icon name="photo-library" size={32} color="white" />
                <Text style={styles.uploadOptionText}>Choose from Gallery</Text>
                <Text style={styles.uploadOptionSubtext}>Pick existing video 📱</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
          
          <Button
            mode="outlined"
            onPress={() => setShowUploadModal(false)}
            style={styles.modalCloseButton}
          >
            Cancel
          </Button>
        </BlurView>
      </Modal>
    </Portal>
  );

  const renderAnalysisModal = () => (
    <Portal>
      <Modal
        visible={isAnalyzing || showResults}
        dismissable={false}
        contentContainerStyle={styles.analysisModalContainer}
      >
        <BlurView style={styles.analysisModalBlur} blurType="light" blurAmount={10}>
          {isAnalyzing ? (
            <View style={styles.analyzingContainer}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={[TEXT_STYLES.title, styles.analyzingTitle]}>
                Analyzing Your Technique... 🤖
              </Text>
              <Text style={[TEXT_STYLES.caption, styles.analyzingText]}>
                Our AI coach is watching your video and preparing feedback!
              </Text>
              <View style={styles.analyzingSteps}>
                <Text style={styles.analyzingStep}>🔍 Analyzing movement patterns...</Text>
                <Text style={styles.analyzingStep}>📊 Calculating technique score...</Text>
                <Text style={styles.analyzingStep}>💡 Preparing improvement tips...</Text>
              </View>
            </View>
          ) : showResults && analysisResults ? (
            <View style={styles.resultsContainer}>
              <Text style={[TEXT_STYLES.title, styles.resultsTitle]}>
                Analysis Complete! 🎉
              </Text>
              
              <View style={styles.scoreContainer}>
                <Text style={styles.scoreLabelText}>Your Score</Text>
                <Text style={styles.scoreText}>{analysisResults.score}%</Text>
                <ProgressBar 
                  progress={analysisResults.score / 100} 
                  color={COLORS.success}
                  style={styles.scoreProgressBar}
                />
              </View>
              
              <Text style={styles.funFactText}>{analysisResults.funFact}</Text>
              
              <View style={styles.pointsEarnedContainer}>
                <Icon name="star" size={24} color="#FFD700" />
                <Text style={styles.pointsEarnedText}>
                  +{analysisResults.pointsEarned} Points! 🎯
                </Text>
              </View>
              
              <Chip icon="military-tech" style={styles.badgeEarnedChip}>
                Badge Earned: {analysisResults.badge}
              </Chip>
              
              <View style={styles.resultsActions}>
                <Button
                  mode="contained"
                  onPress={() => viewDetailedResults(analysisResults)}
                  style={styles.resultsButton}
                >
                  View Details 📋
                </Button>
                <Button
                  mode="outlined"
                  onPress={() => {
                    setShowResults(false);
                    setAnalysisResults(null);
                  }}
                  style={styles.resultsButton}
                >
                  Done ✨
                </Button>
              </View>
            </View>
          )}
        </BlurView>
      </Modal>
    </Portal>
  );

  const viewDetailedResults = (results) => {
    setShowResults(false);
    Alert.alert(
      `Detailed Analysis 📊`,
      `Technique: ${results.technique}\nScore: ${results.score}%\n\n` +
      `🌟 Strengths:\n${results.strengths.map(s => `• ${s}`).join('\n')}\n\n` +
      `💡 Areas to improve:\n${results.improvements.map(i => `• ${i}`).join('\n')}\n\n` +
      `Keep practicing and you'll get even better! 🚀`,
      [
        {
          text: 'Practice Now 🏃‍♀️',
          onPress: () => navigation.navigate('DrillLibrary'),
        },
        {
          text: 'Share Progress 📱',
          onPress: () => shareProgress(results),
        },
        { text: 'Close', style: 'cancel' },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {renderHeader()}
      
      <ScrollView
        style={styles.scrollContainer}
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
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {renderQuickActions()}
          {renderRecentAnalyses()}
          {renderTechniqueCategories()}
        </Animated.View>
      </ScrollView>

      {renderUploadModal()}
      {renderAnalysisModal()}

      <FAB
        icon="add"
        label="Analyze Video 🎬"
        style={styles.fab}
        onPress={handleVideoUpload}
        color="white"
        customSize={60}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: StatusBar.currentHeight + SPACING.md,
    paddingBottom: SPACING.md,
    paddingHorizontal: SPACING.md,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 20,
  },
  pointsText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: SPACING.xs,
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  streakText: {
    color: 'white',
    marginLeft: SPACING.xs,
    fontWeight: '600',
  },
  scrollContainer: {
    flex: 1,
  },
  content: {
    padding: SPACING.md,
  },
  quickActionsContainer: {
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderRadius: 16,
    elevation: 2,
  },
  sectionTitle: {
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  sectionDescription: {
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionCard: {
    width: (width - SPACING.xl * 2 - SPACING.md) / 2,
    aspectRatio: 1,
    borderRadius: 16,
    padding: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
    elevation: 4,
  },
  quickActionText: {
    color: 'white',
    fontWeight: 'bold',
    marginTop: SPACING.sm,
    textAlign: 'center',
    fontSize: 14,
  },
  recentContainer: {
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderRadius: 16,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  viewAllText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  analysisCard: {
    width: 180,
    marginRight: SPACING.md,
    borderRadius: 12,
    backgroundColor: 'white',
    elevation: 3,
    overflow: 'hidden',
  },
  analysisThumbnail: {
    width: '100%',
    height: 100,
    resizeMode: 'cover',
  },
  analysisOverlay: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 8,
  },
  analysisScore: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  analysisContent: {
    padding: SPACING.md,
  },
  analysisTitle: {
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  analysisDate: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginBottom: SPACING.sm,
  },
  analysisPoints: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  analysisPointsText: {
    marginLeft: SPACING.xs,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  badgeChip: {
    backgroundColor: COLORS.warning,
    alignSelf: 'flex-start',
  },
  categoriesContainer: {
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderRadius: 16,
    elevation: 2,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: (width - SPACING.xl * 2 - SPACING.md) / 2,
    aspectRatio: 1.2,
    borderRadius: 16,
    padding: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
    elevation: 4,
  },
  categoryName: {
    color: 'white',
    fontWeight: 'bold',
    marginTop: SPACING.sm,
    textAlign: 'center',
    fontSize: 14,
  },
  categoryBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 12,
    marginTop: SPACING.sm,
  },
  categoryBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBlur: {
    width: width - SPACING.xl,
    maxHeight: height * 0.7,
    borderRadius: 20,
    padding: SPACING.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  modalTitle: {
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  modalDescription: {
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  uploadOptions: {
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  uploadOption: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
  },
  uploadOptionGradient: {
    padding: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadOptionText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: SPACING.sm,
  },
  uploadOptionSubtext: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    marginTop: SPACING.xs,
  },
  modalCloseButton: {
    borderColor: COLORS.textSecondary,
  },
  analysisModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  analysisModalBlur: {
    width: width - SPACING.xl,
    maxHeight: height * 0.8,
    borderRadius: 20,
    padding: SPACING.xl,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    alignItems: 'center',
  },
  analyzingContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  analyzingTitle: {
    textAlign: 'center',
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
  },
  analyzingText: {
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  analyzingSteps: {
    alignItems: 'flex-start',
  },
  analyzingStep: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
    paddingLeft: SPACING.md,
  },
  resultsContainer: {
    alignItems: 'center',
    width: '100%',
  },
  resultsTitle: {
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  scoreContainer: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
    width: '100%',
  },
  scoreLabelText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  scoreText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: COLORS.success,
    marginBottom: SPACING.sm,
  },
  scoreProgressBar: {
    width: '80%',
    height: 8,
    borderRadius: 4,
  },
  funFactText: {
    fontSize: 16,
    color: COLORS.text,
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: SPACING.lg,
    paddingHorizontal: SPACING.md,
  },
  pointsEarnedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.warning,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: 25,
    marginBottom: SPACING.md,
  },
  pointsEarnedText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: SPACING.sm,
  },
  badgeEarnedChip: {
    backgroundColor: COLORS.success,
    marginBottom: SPACING.lg,
  },
  resultsActions: {
    flexDirection: 'row',
    gap: SPACING.md,
    width: '100%',
  },
  resultsButton: {
    flex: 1,
    borderRadius: 25,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.md,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
});

export default TechniqueAnalysis;