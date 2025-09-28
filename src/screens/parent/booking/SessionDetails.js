import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  TextInput,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { VideoView, useVideoPlayer } from 'expo-video';

const SessionDetails = ({ route, navigation }) => {
  const { sessionId } = route.params;
  const [session, setSession] = useState(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState(0);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);

  // Create video player when selectedVideo changes
  const player = useVideoPlayer(selectedVideo?.url || '', player => {
    player.loop = false;
    player.muted = false;
    if (showVideoModal && selectedVideo) {
      player.play();
    }
  });

  // Mock session data
  const mockSession = {
    id: sessionId,
    title: 'Advanced Dribbling Techniques',
    sport: 'Football',
    coach: {
      name: 'Coach Martinez',
      avatar: 'coach_avatar.jpg',
      rating: 4.9,
      experience: '8 years'
    },
    academy: 'Elite Sports Academy',
    date: new Date('2024-08-15T15:00:00'),
    duration: '90 minutes',
    location: 'Main Training Ground',
    child: {
      name: 'Alex Johnson',
      age: 12,
      photo: 'alex_photo.jpg'
    },
    attendance: {
      status: 'present',
      arrivalTime: '2:55 PM',
      departureTime: '4:30 PM',
      punctuality: 'On Time'
    },
    performance: {
      overallScore: 8.5,
      skills: [
        { name: 'Ball Control', score: 9, improvement: '+0.5', trend: 'up' },
        { name: 'Passing Accuracy', score: 8, improvement: '+0.3', trend: 'up' },
        { name: 'Speed & Agility', score: 8.5, improvement: '0', trend: 'stable' },
        { name: 'Team Cooperation', score: 9, improvement: '+0.7', trend: 'up' }
      ],
      physicalTests: [
        { name: '20m Sprint', result: '3.2s', previous: '3.4s', improvement: '-0.2s' },
        { name: 'Endurance Run', result: '12:30', previous: '12:45', improvement: '-15s' }
      ]
    },
    coachNotes: {
      highlights: [
        'Excellent improvement in ball control during 1v1 situations',
        'Great team spirit and communication with teammates',
        'Showed strong leadership qualities during team exercises'
      ],
      areasForImprovement: [
        'Work on left-foot passing accuracy',
        'Focus on maintaining speed during longer drills',
        'Practice shooting technique from different angles'
      ],
      nextSessionFocus: 'We will work on shooting accuracy and defensive positioning'
    },
    videos: [
      {
        id: 1,
        title: 'Dribbling Drill Performance',
        duration: '2:30',
        thumbnail: 'video1_thumb.jpg',
        url: 'https://example.com/video1.mp4',
        type: 'performance'
      },
      {
        id: 2,
        title: 'Coach Feedback Session',
        duration: '1:45',
        thumbnail: 'video2_thumb.jpg',
        url: 'https://example.com/video2.mp4',
        type: 'feedback'
      }
    ],
    exercises: [
      {
        name: 'Cone Dribbling',
        completed: true,
        sets: 3,
        performance: 'Excellent'
      },
      {
        name: 'Passing Accuracy',
        completed: true,
        sets: 4,
        performance: 'Good'
      },
      {
        name: '1v1 Situations',
        completed: true,
        sets: 5,
        performance: 'Very Good'
      },
      {
        name: 'Shooting Practice',
        completed: false,
        sets: 3,
        performance: 'Missed due to time constraint'
      }
    ],
    parentFeedback: {
      rating: 0,
      comment: '',
      submitted: false
    }
  };

  useEffect(() => {
    loadSessionDetails();
  }, []);

  const loadSessionDetails = async () => {
    // Replace with actual API call
    setSession(mockSession);
  };

  const handleVideoPress = (video) => {
  if (player) {
    player.pause(); // Pause current video if playing
  }
  setSelectedVideo(video);
  setShowVideoModal(true);
};

  const submitFeedback = async () => {
    if (rating === 0) {
      Alert.alert('Rating Required', 'Please provide a rating before submitting feedback.');
      return;
    }

    try {
      // API call to submit feedback
      const updatedSession = {
        ...session,
        parentFeedback: {
          rating,
          comment: feedback,
          submitted: true,
          submittedAt: new Date()
        }
      };
      
      setSession(updatedSession);
      setShowFeedbackModal(false);
      setFeedback('');
      setRating(0);
      
      Alert.alert('Success', 'Your feedback has been submitted successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to submit feedback. Please try again.');
    }
  };

  const renderStars = (score, size = 16) => {
    return [...Array(5)].map((_, index) => (
      <Ionicons
        key={index}
        name={index < Math.floor(score) ? 'star' : 'star-outline'}
        size={size}
        color="#FFD700"
      />
    ));
  };

  const renderRatingStars = (currentRating, onPress) => {
    return [...Array(5)].map((_, index) => (
      <TouchableOpacity key={index} onPress={() => onPress(index + 1)}>
        <Ionicons
          name={index < currentRating ? 'star' : 'star-outline'}
          size={30}
          color="#FFD700"
        />
      </TouchableOpacity>
    ));
  };

  const getPerformanceColor = (score) => {
    if (score >= 8.5) return '#00C853';
    if (score >= 7) return '#FFC107';
    return '#FF5722';
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up': return 'trending-up';
      case 'down': return 'trending-down';
      default: return 'remove';
    }
  };

  const getTrendColor = (trend) => {
    switch (trend) {
      case 'up': return '#00C853';
      case 'down': return '#FF5722';
      default: return '#FFC107';
    }
  };

  if (!session) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading session details...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.sessionInfo}>
            <Text style={styles.sessionTitle}>{session.title}</Text>
            <Text style={styles.sessionMeta}>
              {session.sport} • {session.academy}
            </Text>
            <Text style={styles.sessionDate}>
              {session.date.toLocaleDateString()} at {session.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
        </View>

        {/* Attendance Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Attendance</Text>
          <View style={styles.attendanceCard}>
            <View style={styles.attendanceHeader}>
              <View style={[styles.statusBadge, { backgroundColor: session.attendance.status === 'present' ? '#00C853' : '#FF5722' }]}>
                <Ionicons 
                  name={session.attendance.status === 'present' ? 'checkmark' : 'close'} 
                  size={16} 
                  color="#fff" 
                />
                <Text style={styles.statusText}>
                  {session.attendance.status === 'present' ? 'Present' : 'Absent'}
                </Text>
              </View>
              <Text style={styles.punctuality}>{session.attendance.punctuality}</Text>
            </View>
            {session.attendance.status === 'present' && (
              <View style={styles.timeDetails}>
                <View style={styles.timeItem}>
                  <Text style={styles.timeLabel}>Arrival</Text>
                  <Text style={styles.timeValue}>{session.attendance.arrivalTime}</Text>
                </View>
                <View style={styles.timeItem}>
                  <Text style={styles.timeLabel}>Departure</Text>
                  <Text style={styles.timeValue}>{session.attendance.departureTime}</Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Performance Scores */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Performance Overview</Text>
          <View style={styles.overallScore}>
            <Text style={styles.scoreLabel}>Overall Performance</Text>
            <View style={styles.scoreContainer}>
              <Text style={[styles.scoreValue, { color: getPerformanceColor(session.performance.overallScore) }]}>
                {session.performance.overallScore}/10
              </Text>
            </View>
          </View>

          {/* Skill Breakdown */}
          <View style={styles.skillsContainer}>
            {session.performance.skills.map((skill, index) => (
              <View key={index} style={styles.skillItem}>
                <View style={styles.skillInfo}>
                  <Text style={styles.skillName}>{skill.name}</Text>
                  <Text style={[styles.skillScore, { color: getPerformanceColor(skill.score) }]}>
                    {skill.score}/10
                  </Text>
                </View>
                <View style={styles.skillTrend}>
                  <Ionicons 
                    name={getTrendIcon(skill.trend)} 
                    size={16} 
                    color={getTrendColor(skill.trend)} 
                  />
                  <Text style={[styles.improvement, { color: getTrendColor(skill.trend) }]}>
                    {skill.improvement}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Physical Tests */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Physical Performance</Text>
          {session.performance.physicalTests.map((test, index) => (
            <View key={index} style={styles.physicalTestCard}>
              <Text style={styles.testName}>{test.name}</Text>
              <View style={styles.testResults}>
                <View style={styles.testResult}>
                  <Text style={styles.resultLabel}>Current</Text>
                  <Text style={styles.resultValue}>{test.result}</Text>
                </View>
                <View style={styles.testResult}>
                  <Text style={styles.resultLabel}>Previous</Text>
                  <Text style={styles.resultValue}>{test.previous}</Text>
                </View>
                <View style={styles.testResult}>
                  <Text style={styles.resultLabel}>Improvement</Text>
                  <Text style={[styles.resultValue, styles.improvement]}>
                    {test.improvement}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Coach Notes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Coach Feedback</Text>
          <View style={styles.coachNotesCard}>
            <View style={styles.coachHeader}>
              <Image source={{ uri: session.coach.avatar }} style={styles.coachAvatar} />
              <View style={styles.coachInfo}>
                <Text style={styles.coachName}>{session.coach.name}</Text>
                <View style={styles.coachRating}>
                  {renderStars(session.coach.rating)}
                  <Text style={styles.experience}>• {session.coach.experience}</Text>
                </View>
              </View>
            </View>

            <View style={styles.feedbackSection}>
              <Text style={styles.feedbackTitle}>Highlights</Text>
              {session.coachNotes.highlights.map((highlight, index) => (
                <View key={index} style={styles.feedbackItem}>
                  <Ionicons name="checkmark-circle" size={16} color="#00C853" />
                  <Text style={styles.feedbackText}>{highlight}</Text>
                </View>
              ))}
            </View>

            <View style={styles.feedbackSection}>
              <Text style={styles.feedbackTitle}>Areas for Improvement</Text>
              {session.coachNotes.areasForImprovement.map((area, index) => (
                <View key={index} style={styles.feedbackItem}>
                  <Ionicons name="alert-circle" size={16} color="#FF9500" />
                  <Text style={styles.feedbackText}>{area}</Text>
                </View>
              ))}
            </View>

            <View style={styles.nextSessionCard}>
              <Text style={styles.nextSessionTitle}>Next Session Focus</Text>
              <Text style={styles.nextSessionText}>{session.coachNotes.nextSessionFocus}</Text>
            </View>
          </View>
        </View>

        {/* Exercise Completion */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Exercise Completion</Text>
          {session.exercises.map((exercise, index) => (
            <View key={index} style={styles.exerciseCard}>
              <View style={styles.exerciseHeader}>
                <Ionicons 
                  name={exercise.completed ? 'checkmark-circle' : 'close-circle'} 
                  size={20} 
                  color={exercise.completed ? '#00C853' : '#FF5722'} 
                />
                <Text style={styles.exerciseName}>{exercise.name}</Text>
                <Text style={styles.exerciseSets}>{exercise.sets} sets</Text>
              </View>
              <Text style={[
                styles.exercisePerformance,
                { color: exercise.completed ? '#00C853' : '#FF5722' }
              ]}>
                {exercise.performance}
              </Text>
            </View>
          ))}
        </View>

        {/* Video Reviews */}
        {session.videos.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Video Reviews</Text>
            {session.videos.map((video, index) => (
              <TouchableOpacity
              key={index}
                style={styles.videoCard}
                onPress={() => handleVideoPress(video)}
              >
                <Image source={{ uri: video.thumbnail }} style={styles.videoThumbnail} />
                <View style={styles.videoInfo}>
                  <Text style={styles.videoTitle}>{video.title}</Text>
                  <Text style={styles.videoDuration}>{video.duration}</Text>
                </View>
                <Ionicons name="play-circle" size={32} color="#007AFF" />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Parent Feedback */}
        <View style={styles.section}>
          <View style={styles.feedbackHeader}>
            <Text style={styles.sectionTitle}>Your Feedback</Text>
            {!session.parentFeedback.submitted && (
              <TouchableOpacity
                style={styles.feedbackButton}
                onPress={() => setShowFeedbackModal(true)}
              >
                <Text style={styles.feedbackButtonText}>Leave Feedback</Text>
              </TouchableOpacity>
            )}
          </View>
          
          {session.parentFeedback.submitted ? (
            <View style={styles.submittedFeedbackCard}>
              <View style={styles.submittedRating}>
                {renderStars(session.parentFeedback.rating, 20)}
              </View>
              <Text style={styles.submittedComment}>
                {session.parentFeedback.comment || 'No additional comments'}
              </Text>
              <Text style={styles.submittedDate}>
                Submitted on {session.parentFeedback.submittedAt?.toLocaleDateString()}
              </Text>
            </View>
          ) : (
            <View style={styles.pendingFeedbackCard}>
              <Ionicons name="chatbubble-outline" size={32} color="#ccc" />
              <Text style={styles.pendingText}>Your feedback helps us improve</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Feedback Modal */}
      <Modal visible={showFeedbackModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.feedbackModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Rate This Session</Text>
              <TouchableOpacity onPress={() => setShowFeedbackModal(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalContent}>
              <Text style={styles.ratingLabel}>How would you rate this session?</Text>
              <View style={styles.starRating}>
                {renderRatingStars(rating, setRating)}
              </View>

              <Text style={styles.commentLabel}>Additional Comments (Optional)</Text>
              <TextInput
                style={styles.commentInput}
                placeholder="Share your thoughts about the session..."
                value={feedback}
                onChangeText={setFeedback}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />

              <TouchableOpacity
                style={styles.submitButton}
                onPress={submitFeedback}
              >
                <Text style={styles.submitButtonText}>Submit Feedback</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Video Modal */}
      <Modal visible={showVideoModal} animationType="slide">
        <View style={styles.videoModalContainer}>
          <View style={styles.videoModalHeader}>
            <Text style={styles.videoModalTitle}>{selectedVideo?.title}</Text>
            <TouchableOpacity 
             onPress={() => {
                if (player) {
                  player.pause();
                }
                setShowVideoModal(false);
              }}
              >
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
          {selectedVideo && (
            <VideoView
              style={styles.videoPlayer}
              player={player}
              allowsFullscreen
              allowsPictureInPicture
            />
          )}
        </View>
      </Modal>

      {/* Action Buttons */}
      <View style={styles.actionBar}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('CoachChat', { coachId: session.coach.id })}
        >
          <Ionicons name="chatbubble-outline" size={20} color="#007AFF" />
          <Text style={styles.actionButtonText}>Message Coach</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.primaryButton]}
          onPress={() => navigation.navigate('Schedule')}
        >
          <Ionicons name="calendar-outline" size={20} color="#fff" />
          <Text style={[styles.actionButtonText, styles.primaryButtonText]}>View Schedule</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#007AFF',
    padding: 20,
    paddingTop: 40,
  },
  sessionInfo: {
    alignItems: 'center',
  },
  sessionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  sessionMeta: {
    fontSize: 16,
    color: '#E3F2FD',
    marginBottom: 4,
  },
  sessionDate: {
    fontSize: 14,
    color: '#E3F2FD',
  },
  section: {
    backgroundColor: '#fff',
    margin: 16,
    marginBottom: 0,
    borderRadius: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  attendanceCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
  },
  attendanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 4,
  },
  punctuality: {
    fontSize: 14,
    color: '#666',
  },
  timeDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  timeItem: {
    alignItems: 'center',
  },
  timeLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  timeValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  overallScore: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  scoreLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  scoreContainer: {
    alignItems: 'center',
  },
  scoreValue: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  skillsContainer: {
    marginTop: 8,
  },
  skillItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  skillInfo: {
    flex: 1,
  },
  skillName: {
    fontSize: 14,
    color: '#333',
    marginBottom: 2,
  },
  skillScore: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  skillTrend: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  improvement: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  physicalTestCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  testName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  testResults: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  testResult: {
    alignItems: 'center',
    flex: 1,
  },
  resultLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  resultValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  coachNotesCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
  },
  coachHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  coachAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
    backgroundColor: '#ddd',
  },
  coachInfo: {
    flex: 1,
  },
  coachName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  coachRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  experience: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
  },
  feedbackSection: {
    marginBottom: 16,
  },
  feedbackTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  feedbackItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  feedbackText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
  nextSessionCard: {
    backgroundColor: '#e3f2fd',
    borderRadius: 6,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  nextSessionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 4,
  },
  nextSessionText: {
    fontSize: 14,
    color: '#1565C0',
    lineHeight: 20,
  },
  exerciseCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  exerciseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginLeft: 8,
  },
  exerciseSets: {
    fontSize: 12,
    color: '#666',
    backgroundColor: '#e0e0e0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  exercisePerformance: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  videoCard: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  videoThumbnail: {
    width: 60,
    height: 40,
    borderRadius: 6,
    backgroundColor: '#ddd',
    marginRight: 12,
  },
  videoInfo: {
    flex: 1,
  },
  videoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  videoDuration: {
    fontSize: 12,
    color: '#666',
  },
  feedbackHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  feedbackButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  feedbackButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  submittedFeedbackCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
  },
  submittedRating: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  submittedComment: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
  submittedDate: {
    fontSize: 12,
    color: '#999',
  },
  pendingFeedbackCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 24,
    alignItems: 'center',
  },
  pendingText: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  feedbackModal: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalContent: {
    padding: 20,
  },
  ratingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  starRating: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
  },
  commentLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    minHeight: 100,
    marginBottom: 20,
  },
  submitButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  videoModalContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  videoModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 40,
  },
  videoModalTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  videoPlayer: {
    flex: 1,
  },
  actionBar: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#007AFF',
    marginRight: 8,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
    marginRight: 0,
    marginLeft: 8,
  },
  actionButtonText: {
    color: '#007AFF',
    fontWeight: '600',
    marginLeft: 6,
  },
  primaryButtonText: {
    color: '#fff',
  },
});

export default SessionDetails;