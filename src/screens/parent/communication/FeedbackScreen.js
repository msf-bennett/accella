import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  Image,
  FlatList,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { 
  Card,
  Button,
  Avatar,
  Badge,
  Chip,
  ProgressBar,
  Divider,
  FAB,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS } from '../../../styles/colors';
import { LineChart, BarChart } from 'react-native-chart-kit';

const { width: screenWidth } = Dimensions.get('window');

const FeedbackScreen = ({ navigation, route }) => {
  const { childId, childName } = route.params || {};
  
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('week'); // week, month, quarter
  const [selectedCategory, setSelectedCategory] = useState('all'); // all, technical, physical, mental, tactical
  const [showNewFeedbackModal, setShowNewFeedbackModal] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [overallProgress, setOverallProgress] = useState(null);

  // Mock feedback data
  const mockFeedbacks = [
    {
      id: '1',
      sessionId: 'session_001',
      sessionName: 'Football Training - Dribbling Focus',
      coachId: 'coach_001',
      coachName: 'Coach Michael',
      coachAvatar: 'https://via.placeholder.com/100',
      date: '2025-08-10',
      duration: 90, // minutes
      sport: 'Football',
      category: 'technical',
      overallRating: 4.2,
      attendance: 'present',
      punctuality: 'on-time',
      effort: 4.5,
      improvement: 4.0,
      teamwork: 4.3,
      skills: {
        technical: 4.2,
        physical: 3.8,
        mental: 4.0,
        tactical: 3.9,
      },
      strengths: [
        'Excellent ball control during dribbling drills',
        'Good listening skills and follows instructions well',
        'Shows great enthusiasm and positive attitude',
        'Improved passing accuracy significantly'
      ],
      improvements: [
        'Work on left foot shooting technique',
        'Needs to communicate more with teammates',
        'Could improve defensive positioning'
      ],
      detailedFeedback: 'Great session today! Your child showed remarkable improvement in ball control and dribbling skills. The 1v1 exercises really highlighted their natural talent. However, we need to work on using both feet equally. Keep up the excellent work!',
      goals: [
        'Master left-foot shooting by next session',
        'Complete 20 successful passes in a row',
        'Improve sprint time by 0.2 seconds'
      ],
      homework: 'Practice juggling 50 times with both feet daily',
      nextSession: '2025-08-17',
      videos: [
        { id: '1', thumbnail: 'https://via.placeholder.com/150x100', title: 'Dribbling Technique' },
        { id: '2', thumbnail: 'https://via.placeholder.com/150x100', title: 'Goal Scored' }
      ],
      images: [
        'https://via.placeholder.com/200x150',
        'https://via.placeholder.com/200x150'
      ],
      measurements: {
        height: '145 cm',
        weight: '40 kg',
        sprintTime: '12.5s (100m)',
        flexibility: 'Good',
        coordination: 'Excellent'
      }
    },
    {
      id: '2',
      sessionId: 'session_002',
      sessionName: 'Swimming - Freestyle Technique',
      coachId: 'coach_002',
      coachName: 'Coach Sarah',
      coachAvatar: 'https://via.placeholder.com/100',
      date: '2025-08-08',
      duration: 60,
      sport: 'Swimming',
      category: 'physical',
      overallRating: 4.5,
      attendance: 'present',
      punctuality: 'early',
      effort: 4.8,
      improvement: 4.2,
      teamwork: 4.0,
      skills: {
        technical: 4.5,
        physical: 4.6,
        mental: 4.2,
        tactical: 4.0,
      },
      strengths: [
        'Perfect freestyle stroke technique',
        'Excellent breathing pattern',
        'Great endurance improvement',
        'Very disciplined in following training plan'
      ],
      improvements: [
        'Work on flip turns speed',
        'Strengthen core muscles',
        'Improve backstroke technique'
      ],
      detailedFeedback: 'Outstanding swimming session! Your stroke technique has improved tremendously. The breathing rhythm is now perfect and your endurance has increased significantly. Ready to move to advanced drills next week.',
      goals: [
        'Swim 400m freestyle without stopping',
        'Improve flip turn technique',
        'Master backstroke breathing pattern'
      ],
      homework: 'Daily dry-land exercises focusing on core strength',
      nextSession: '2025-08-15',
      videos: [
        { id: '3', thumbnail: 'https://via.placeholder.com/150x100', title: 'Freestyle Technique' }
      ],
      images: [
        'https://via.placeholder.com/200x150'
      ],
      measurements: {
        lapTime: '1:45 (100m freestyle)',
        heartRate: '145 bpm (average)',
        strokeRate: '28 strokes/min',
        technique: 'Excellent'
      }
    },
    {
      id: '3',
      sessionId: 'session_003',
      sessionName: 'Basketball - Defense Training',
      coachId: 'coach_003',
      coachName: 'Coach David',
      coachAvatar: 'https://via.placeholder.com/100',
      date: '2025-08-05',
      duration: 75,
      sport: 'Basketball',
      category: 'tactical',
      overallRating: 3.8,
      attendance: 'present',
      punctuality: 'late',
      effort: 4.0,
      improvement: 3.5,
      teamwork: 4.2,
      skills: {
        technical: 3.9,
        physical: 3.7,
        mental: 3.8,
        tactical: 3.8,
      },
      strengths: [
        'Good court vision and awareness',
        'Excellent teamwork and communication',
        'Strong rebounding skills',
        'Positive attitude during challenging drills'
      ],
      improvements: [
        'Work on lateral movement speed',
        'Improve free throw accuracy',
        'Need to arrive on time for warm-up'
      ],
      detailedFeedback: 'Good defensive session but arrived 10 minutes late which affected warm-up. Your court awareness is improving and you\'re communicating well with teammates. Focus on footwork drills at home.',
      goals: [
        'Improve lateral defensive slides',
        'Achieve 70% free throw accuracy',
        'Arrive 15 minutes before session starts'
      ],
      homework: 'Practice defensive slides for 10 minutes daily',
      nextSession: '2025-08-12',
      videos: [],
      images: [
        'https://via.placeholder.com/200x150',
        'https://via.placeholder.com/200x150',
        'https://via.placeholder.com/200x150'
      ],
      measurements: {
        verticalJump: '45 cm',
        freeThrowAccuracy: '60%',
        defensiveReactions: 'Good',
        agility: 'Needs work'
      }
    }
  ];

  // Mock progress data
  const mockProgressData = {
    technical: [4.0, 4.1, 4.2, 4.0, 4.2, 4.3, 4.2],
    physical: [3.5, 3.6, 3.8, 3.7, 3.8, 3.9, 3.8],
    mental: [3.8, 4.0, 4.0, 4.1, 4.0, 4.2, 4.0],
    tactical: [3.6, 3.7, 3.8, 3.9, 3.8, 3.9, 3.9],
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7']
  };

  const categories = [
    { key: 'all', label: 'All Feedback', icon: 'list', color: COLORS.primary },
    { key: 'technical', label: 'Technical', icon: 'build', color: '#FF9800' },
    { key: 'physical', label: 'Physical', icon: 'fitness-center', color: '#4CAF50' },
    { key: 'mental', label: 'Mental', icon: 'psychology', color: '#9C27B0' },
    { key: 'tactical', label: 'Tactical', icon: 'strategy', color: '#F44336' }
  ];

  const periods = [
    { key: 'week', label: 'This Week' },
    { key: 'month', label: 'This Month' },
    { key: 'quarter', label: 'Last 3 Months' }
  ];

  useEffect(() => {
    loadFeedbacks();
    calculateOverallProgress();
  }, [selectedPeriod, selectedCategory]);

  const loadFeedbacks = async () => {
    try {
      setLoading(true);
      // In real app, fetch from API based on childId, period, and category
      let filtered = [...mockFeedbacks];
      
      if (selectedCategory !== 'all') {
        filtered = filtered.filter(feedback => feedback.category === selectedCategory);
      }
      
      // Apply date filtering based on selectedPeriod
      const now = new Date();
      filtered = filtered.filter(feedback => {
        const feedbackDate = new Date(feedback.date);
        switch (selectedPeriod) {
          case 'week':
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            return feedbackDate >= weekAgo;
          case 'month':
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            return feedbackDate >= monthAgo;
          case 'quarter':
            const quarterAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
            return feedbackDate >= quarterAgo;
          default:
            return true;
        }
      });
      
      setFeedbacks(filtered);
    } catch (error) {
      console.error('Error loading feedbacks:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateOverallProgress = () => {
    if (feedbacks.length === 0) return;
    
    const totalSkills = feedbacks.reduce((acc, feedback) => ({
      technical: acc.technical + feedback.skills.technical,
      physical: acc.physical + feedback.skills.physical,
      mental: acc.mental + feedback.skills.mental,
      tactical: acc.tactical + feedback.skills.tactical,
    }), { technical: 0, physical: 0, mental: 0, tactical: 0 });

    const avgSkills = {
      technical: totalSkills.technical / feedbacks.length,
      physical: totalSkills.physical / feedbacks.length,
      mental: totalSkills.mental / feedbacks.length,
      tactical: totalSkills.tactical / feedbacks.length,
    };

    const overallRating = (avgSkills.technical + avgSkills.physical + avgSkills.mental + avgSkills.tactical) / 4;
    
    setOverallProgress({
      overallRating: Math.round(overallRating * 10) / 10,
      skills: avgSkills,
      totalSessions: feedbacks.length,
      attendanceRate: (feedbacks.filter(f => f.attendance === 'present').length / feedbacks.length) * 100,
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getSkillColor = (rating) => {
    if (rating >= 4.5) return '#4CAF50';
    if (rating >= 4.0) return '#8BC34A';
    if (rating >= 3.5) return '#FFC107';
    if (rating >= 3.0) return '#FF9800';
    return '#F44336';
  };

  const handleViewDetails = (feedback) => {
    setSelectedFeedback(feedback);
    setShowNewFeedbackModal(true);
  };

  const handleShareFeedback = (feedback) => {
    Alert.alert(
      'Share Feedback',
      'Choose how you want to share this feedback',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Copy Link', onPress: () => console.log('Copy link') },
        { text: 'Send to Coach', onPress: () => console.log('Send to coach') },
      ]
    );
  };

  const renderFeedbackCard = ({ item: feedback }) => (
    <Card style={styles.feedbackCard}>
      <View style={styles.cardHeader}>
        <View style={styles.coachInfo}>
          <Avatar.Image source={{ uri: feedback.coachAvatar }} size={40} />
          <View style={styles.coachDetails}>
            <Text style={styles.coachName}>{feedback.coachName}</Text>
            <Text style={styles.sessionName}>{feedback.sessionName}</Text>
          </View>
        </View>
        <View style={styles.cardHeaderRight}>
          <Text style={styles.date}>{formatDate(feedback.date)}</Text>
          <View style={styles.overallRating}>
            <Icon name="star" size={16} color="#FFD700" />
            <Text style={styles.ratingText}>{feedback.overallRating}</Text>
          </View>
        </View>
      </View>

      <View style={styles.skillsOverview}>
        <Text style={styles.sectionTitle}>Skills Assessment</Text>
        <View style={styles.skillsGrid}>
          {Object.entries(feedback.skills).map(([skill, rating]) => (
            <View key={skill} style={styles.skillItem}>
              <Text style={styles.skillName}>{skill.charAt(0).toUpperCase() + skill.slice(1)}</Text>
              <View style={styles.skillRating}>
                <ProgressBar 
                  progress={rating / 5} 
                  color={getSkillColor(rating)} 
                  style={styles.skillBar}
                />
                <Text style={[styles.skillValue, { color: getSkillColor(rating) }]}>
                  {rating}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.quickStats}>
        <View style={styles.statItem}>
          <Icon name="schedule" size={16} color={COLORS.textSecondary} />
          <Text style={styles.statText}>{feedback.duration}min</Text>
        </View>
        <View style={styles.statItem}>
          <Icon name="sports" size={16} color={COLORS.textSecondary} />
          <Text style={styles.statText}>{feedback.sport}</Text>
        </View>
        <View style={styles.statItem}>
          <Icon name={feedback.attendance === 'present' ? 'check-circle' : 'cancel'} 
                size={16} 
                color={feedback.attendance === 'present' ? COLORS.success : COLORS.error} />
          <Text style={styles.statText}>{feedback.attendance}</Text>
        </View>
        <View style={styles.statItem}>
          <Icon name="trending-up" size={16} color={COLORS.primary} />
          <Text style={styles.statText}>Effort: {feedback.effort}</Text>
        </View>
      </View>

      <View style={styles.strengths}>
        <Text style={styles.subsectionTitle}>Key Strengths</Text>
        {feedback.strengths.slice(0, 2).map((strength, index) => (
          <View key={index} style={styles.strengthItem}>
            <Icon name="check" size={16} color={COLORS.success} />
            <Text style={styles.strengthText}>{strength}</Text>
          </View>
        ))}
      </View>

      <View style={styles.cardActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleViewDetails(feedback)}
        >
          <Icon name="visibility" size={18} color={COLORS.primary} />
          <Text style={styles.actionButtonText}>View Details</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleShareFeedback(feedback)}
        >
          <Icon name="share" size={18} color={COLORS.textSecondary} />
          <Text style={styles.actionButtonText}>Share</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('CoachChat', { 
            coachId: feedback.coachId,
            coachName: feedback.coachName 
          })}
        >
          <Icon name="chat" size={18} color={COLORS.textSecondary} />
          <Text style={styles.actionButtonText}>Chat</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );

  const renderDetailedFeedback = () => (
    <Modal
      visible={showNewFeedbackModal}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <ScrollView style={styles.detailModal}>
        <View style={styles.detailHeader}>
          <TouchableOpacity onPress={() => setShowNewFeedbackModal(false)}>
            <Icon name="close" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.detailTitle}>Detailed Feedback</Text>
          <TouchableOpacity onPress={() => handleShareFeedback(selectedFeedback)}>
            <Icon name="share" size={24} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        {selectedFeedback && (
          <>
            <View style={styles.sessionInfo}>
              <View style={styles.sessionHeader}>
                <Avatar.Image source={{ uri: selectedFeedback.coachAvatar }} size={50} />
                <View style={styles.sessionDetails}>
                  <Text style={styles.sessionTitle}>{selectedFeedback.sessionName}</Text>
                  <Text style={styles.sessionCoach}>by {selectedFeedback.coachName}</Text>
                  <Text style={styles.sessionDate}>{formatDate(selectedFeedback.date)} • {selectedFeedback.duration} minutes</Text>
                </View>
              </View>
            </View>

            <View style={styles.detailSection}>
              <Text style={styles.detailSectionTitle}>Overall Assessment</Text>
              <Text style={styles.detailedFeedbackText}>{selectedFeedback.detailedFeedback}</Text>
            </View>

            <View style={styles.detailSection}>
              <Text style={styles.detailSectionTitle}>Skills Breakdown</Text>
              <View style={styles.skillsDetailed}>
                {Object.entries(selectedFeedback.skills).map(([skill, rating]) => (
                  <View key={skill} style={styles.skillDetailItem}>
                    <Text style={styles.skillDetailName}>
                      {skill.charAt(0).toUpperCase() + skill.slice(1)}
                    </Text>
                    <View style={styles.skillDetailRating}>
                      <ProgressBar 
                        progress={rating / 5} 
                        color={getSkillColor(rating)} 
                        style={styles.skillDetailBar}
                      />
                      <Text style={styles.skillDetailValue}>{rating}/5</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.detailSection}>
              <Text style={styles.detailSectionTitle}>Strengths</Text>
              {selectedFeedback.strengths.map((strength, index) => (
                <View key={index} style={styles.detailListItem}>
                  <Icon name="check-circle" size={16} color={COLORS.success} />
                  <Text style={styles.detailListText}>{strength}</Text>
                </View>
              ))}
            </View>

            <View style={styles.detailSection}>
              <Text style={styles.detailSectionTitle}>Areas for Improvement</Text>
              {selectedFeedback.improvements.map((improvement, index) => (
                <View key={index} style={styles.detailListItem}>
                  <Icon name="trending-up" size={16} color={COLORS.warning} />
                  <Text style={styles.detailListText}>{improvement}</Text>
                </View>
              ))}
            </View>

            <View style={styles.detailSection}>
              <Text style={styles.detailSectionTitle}>Goals for Next Session</Text>
              {selectedFeedback.goals.map((goal, index) => (
                <View key={index} style={styles.detailListItem}>
                  <Icon name="flag" size={16} color={COLORS.primary} />
                  <Text style={styles.detailListText}>{goal}</Text>
                </View>
              ))}
            </View>

            {selectedFeedback.homework && (
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Homework</Text>
                <View style={styles.homeworkCard}>
                  <Icon name="assignment" size={20} color={COLORS.primary} />
                  <Text style={styles.homeworkText}>{selectedFeedback.homework}</Text>
                </View>
              </View>
            )}

            {selectedFeedback.measurements && (
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Performance Measurements</Text>
                <View style={styles.measurementsGrid}>
                  {Object.entries(selectedFeedback.measurements).map(([key, value]) => (
                    <View key={key} style={styles.measurementItem}>
                      <Text style={styles.measurementLabel}>
                        {key.charAt(0).toUpperCase() + key.slice(1)}
                      </Text>
                      <Text style={styles.measurementValue}>{value}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {(selectedFeedback.images?.length > 0 || selectedFeedback.videos?.length > 0) && (
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Media</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.mediaContainer}>
                    {selectedFeedback.videos?.map((video, index) => (
                      <TouchableOpacity key={index} style={styles.mediaItem}>
                        <Image source={{ uri: video.thumbnail }} style={styles.mediaThumbnail} />
                        <Icon name="play-circle-filled" size={30} color="#fff" style={styles.playIcon} />
                        <Text style={styles.mediaTitle}>{video.title}</Text>
                      </TouchableOpacity>
                    ))}
                    {selectedFeedback.images?.map((image, index) => (
                      <TouchableOpacity key={index} style={styles.mediaItem}>
                        <Image source={{ uri: image }} style={styles.mediaThumbnail} />
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </Modal>
  );

  const renderProgressModal = () => (
    <Modal
      visible={showProgressModal}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.progressModal}>
        <View style={styles.progressHeader}>
          <TouchableOpacity onPress={() => setShowProgressModal(false)}>
            <Icon name="close" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.progressTitle}>Progress Analysis</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={styles.progressContent}>
          <Text style={styles.progressSubtitle}>Skills Development Over Time</Text>
          
          <LineChart
            data={{
              labels: mockProgressData.labels,
              datasets: [
                {
                  data: mockProgressData.technical,
                  color: (opacity = 1) => `rgba(255, 152, 0, ${opacity})`,
                  strokeWidth: 2
                },
                {
                  data: mockProgressData.physical,
                  color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
                  strokeWidth: 2
                },
                {
                  data: mockProgressData.mental,
                  color: (opacity = 1) => `rgba(156, 39, 176, ${opacity})`,
                  strokeWidth: 2
                },
                {
                  data: mockProgressData.tactical,
                  color: (opacity = 1) => `rgba(244, 67, 54, ${opacity})`,
                  strokeWidth: 2
                }
              ],
              legend: ['Technical', 'Physical', 'Mental', 'Tactical']
            }}
            width={screenWidth - 40}
            height={220}
            chartConfig={{
              backgroundColor: '#fff',
              backgroundGradientFrom: '#fff',
              backgroundGradientTo: '#fff',
              decimalPlaces: 1,
              color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              style: {
                borderRadius: 16
              },
              propsForDots: {
                r: '4',
                strokeWidth: '2',
              }
            }}
            style={styles.chart}
          />

          <View style={styles.progressLegend}>
            {categories.slice(1).map(category => (
              <View key={category.key} style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: category.color }]} />
                <Text style={styles.legendText}>{category.label}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading feedback...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header with filters */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {childName ? `${childName}'s Feedback` : 'Training Feedback'}
        </Text>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersContainer}>
          <View style={styles.filters}>
            {periods.map(period => (
              <TouchableOpacity
                key={period.key}
                style={[
                  styles.filterChip,
                  selectedPeriod === period.key && styles.activeFilterChip
                ]}
                onPress={() => setSelectedPeriod(period.key)}
              >
                <Text style={[
                  styles.filterChipText,
                  selectedPeriod === period.key && styles.activeFilterChipText
                ]}>
                  {period.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Category filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryContainer}>
        <View style={styles.categories}>
          {categories.map(category => (
            <TouchableOpacity
              key={category.key}
              style={[
                styles.categoryChip,
                selectedCategory === category.key && styles.activeCategoryChip
              ]}
              onPress={() => setSelectedCategory(category.key)}
            >
              <Icon 
                name={category.icon} 
                size={16} 
                color={selectedCategory === category.key ? '#fff' : category.color} 
              />
              <Text style={[
                styles.categoryChipText,
                selectedCategory === category.key && styles.activeCategoryChipText
              ]}>
                {category.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Overall Progress Summary */}
      {overallProgress && (
        <Card style={styles.progressSummary}>
          <View style={styles.progressSummaryContent}>
            <View style={styles.progressStats}>
              <View style={styles.progressStat}>
                <Text style={styles.progressStatValue}>{overallProgress.overallRating}</Text>
                <Text style={styles.progressStatLabel}>Overall Rating</Text>
              </View>
              <View style={styles.progressStat}>
                <Text style={styles.progressStatValue}>{overallProgress.totalSessions}</Text>
                <Text style={styles.progressStatLabel}>Sessions</Text>
              </View>
              <View style={styles.progressStat}>
                <Text style={styles.progressStatValue}>{Math.round(overallProgress.attendanceRate)}%</Text>
                <Text style={styles.progressStatLabel}>Attendance</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.progressButton}
              onPress={() => setShowProgressModal(true)}
            >
              <Text style={styles.progressButtonText}>View Progress</Text>
              <Icon name="trending-up" size={16} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
        </Card>
      )}

      {/* Feedback List */}
      {feedbacks.length > 0 ? (
        <FlatList
          data={feedbacks}
          renderItem={renderFeedbackCard}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.feedbackList}
        />
      ) : (
        <View style={styles.emptyState}>
          <Icon name="assignment" size={64} color={COLORS.textSecondary} />
          <Text style={styles.emptyStateTitle}>No Feedback Yet</Text>
          <Text style={styles.emptyStateText}>
            {selectedCategory === 'all' 
              ? 'Feedback from coaches will appear here after training sessions'
              : `No ${selectedCategory} feedback for this period`
            }
          </Text>
        </View>
      )}

      {/* Floating Action Button for Coaches */}
      <FAB
        icon="add"
        style={styles.fab}
        onPress={() => navigation.navigate('CreateFeedback', { childId })}
      />

      {/* Modals */}
      {renderDetailedFeedback()}
      {renderProgressModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  header: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 12,
  },
  filtersContainer: {
    marginHorizontal: -16,
  },
  filters: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
  },
  filterChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
  },
  activeFilterChip: {
    backgroundColor: COLORS.primary,
  },
  filterChipText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  activeFilterChipText: {
    color: '#fff',
    fontWeight: '600',
  },
  categoryContainer: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    marginHorizontal: -16,
  },
  categories: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  activeCategoryChip: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryChipText: {
    fontSize: 13,
    color: COLORS.text,
  },
  activeCategoryChipText: {
    color: '#fff',
    fontWeight: '600',
  },
  progressSummary: {
    margin: 16,
    borderRadius: 12,
    elevation: 2,
  },
  progressSummaryContent: {
    padding: 16,
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  progressStat: {
    alignItems: 'center',
  },
  progressStatValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  progressStatLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  progressButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: COLORS.primary + '20',
  },
  progressButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  feedbackList: {
    padding: 16,
  },
  feedbackCard: {
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  coachInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  coachDetails: {
    marginLeft: 12,
    flex: 1,
  },
  coachName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  sessionName: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  cardHeaderRight: {
    alignItems: 'flex-end',
  },
  date: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  overallRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  skillsOverview: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  skillsGrid: {
    gap: 12,
  },
  skillItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  skillName: {
    fontSize: 14,
    color: COLORS.text,
    flex: 1,
  },
  skillRating: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginLeft: 16,
  },
  skillBar: {
    height: 6,
    flex: 1,
    marginRight: 8,
    borderRadius: 3,
  },
  skillValue: {
    fontSize: 12,
    fontWeight: '600',
    minWidth: 24,
    textAlign: 'right',
  },
  quickStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  strengths: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  subsectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  strengthItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 4,
  },
  strengthText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    flex: 1,
    lineHeight: 18,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  actionButtonText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
  // Detail Modal Styles
  detailModal: {
    flex: 1,
    backgroundColor: '#fff',
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  detailTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  sessionInfo: {
    padding: 16,
    backgroundColor: '#f8f9fa',
  },
  sessionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sessionDetails: {
    marginLeft: 12,
    flex: 1,
  },
  sessionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  sessionCoach: {
    fontSize: 14,
    color: COLORS.primary,
    marginTop: 2,
  },
  sessionDate: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  detailSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  detailedFeedbackText: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 22,
  },
  skillsDetailed: {
    gap: 16,
  },
  skillDetailItem: {
    gap: 8,
  },
  skillDetailName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  skillDetailRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  skillDetailBar: {
    height: 8,
    flex: 1,
    marginRight: 12,
    borderRadius: 4,
  },
  skillDetailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    minWidth: 32,
  },
  detailListItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 8,
  },
  detailListText: {
    fontSize: 14,
    color: COLORS.text,
    flex: 1,
    lineHeight: 20,
  },
  homeworkCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    backgroundColor: COLORS.primary + '10',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  homeworkText: {
    fontSize: 14,
    color: COLORS.text,
    flex: 1,
    lineHeight: 20,
  },
  measurementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  measurementItem: {
    flex: 1,
    minWidth: '45%',
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    alignItems: 'center',
  },
  measurementLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  measurementValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  mediaContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  mediaItem: {
    position: 'relative',
    alignItems: 'center',
  },
  mediaThumbnail: {
    width: 120,
    height: 80,
    borderRadius: 8,
  },
  playIcon: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -15 }, { translateY: -15 }],
  },
  mediaTitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
    textAlign: 'center',
    maxWidth: 120,
  },
  // Progress Modal Styles
  progressModal: {
    flex: 1,
    backgroundColor: '#fff',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  progressContent: {
    flex: 1,
    padding: 16,
  },
  progressSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  progressLegend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
    marginTop: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 14,
    color: COLORS.text,
  },
});

export default FeedbackScreen;