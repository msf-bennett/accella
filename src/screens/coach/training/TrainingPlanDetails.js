//src/screens/coach/training/TrainingPlanDetails.js
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  ScrollView,
  StatusBar,
  Alert,
  Dimensions,
  RefreshControl,
  Animated,
  TouchableOpacity,
  FlatList,
  Share,
  ActivityIndicator,
} from 'react-native';
import {
  Card,
  Button,
  Chip,
  ProgressBar,
  IconButton,
  FAB,
  Surface,
  Text,
  Portal,
  Modal,
  Divider,
  Avatar,
  List,
  Snackbar,
} from 'react-native-paper';
import { LinearGradient } from '../../../components/shared/LinearGradient';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Design system imports
import { COLORS } from '../../../styles/colors';
import { SPACING } from '../../../styles/spacing';
import { TEXT_STYLES } from '../../../styles/textStyles';
import DocumentProcessor from '../../../services/DocumentProcessor';
import SessionExtractor from '../../../services/SessionExtractor'; 
import DocumentViewer from '../../shared/DocumentViewer';
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const TrainingPlanDetails = ({ navigation, route }) => {
  const { planId } = route.params;
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const headerAnim = useRef(new Animated.Value(0)).current;
  
  // State management
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedSessions, setExpandedSessions] = useState({});
  const [sessionModalVisible, setSessionModalVisible] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [documentModalVisible, setDocumentModalVisible] = useState(false);
  const [documentUploadModalVisible, setDocumentUploadModalVisible] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [sourceDocument, setSourceDocument] = useState(null);
  const [allDocuments, setAllDocuments] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [extractedSessions, setExtractedSessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(false);

  // Difficulty colors mapping
  const difficultyColors = {
    beginner: COLORS.success,
    intermediate: '#FF9800',
    advanced: COLORS.error,
  };

  // Tab options
const tabs = [
  { key: 'overview', label: 'Overview', icon: 'info' },
  { key: 'sessions', label: 'Sessions', icon: 'fitness-center' },
  { key: 'documents', label: 'Documents', icon: 'description' },
  { key: 'favorites', label: 'Favorites', icon: 'favorite' },
  { key: 'progress', label: 'Progress', icon: 'trending-up' },
  { key: 'nutrition', label: 'Nutrition', icon: 'restaurant' },
  { key: 'analytics', label: 'Analytics', icon: 'analytics' },
];

const loadAllDocuments = async () => {
  try {
    setLoadingDocs(true);
    const docs = await DocumentProcessor.getStoredDocuments();
    setAllDocuments(docs);
  } catch (error) {
    console.error('Error loading documents:', error);
    Alert.alert('Error', 'Failed to load documents');
  } finally {
    setLoadingDocs(false);
  }
};

const refreshDocuments = async () => {
  if (activeTab === 'documents') {
    await loadAllDocuments();
  }
};

// Load all documents from DocumentProcessor
// Update the existing useEffect to use the extracted function
useEffect(() => {
  if (activeTab === 'documents') {
    loadAllDocuments();
  }
}, [activeTab]);

  // load sessions when the tab becomes active
  useEffect(() => {
    if (activeTab === 'sessions' && plan?.sourceDocument && extractedSessions.length === 0) {
      loadSessionsFromDocument();
    }
  }, [activeTab, plan?.sourceDocument]);

  // Load plan data
  useEffect(() => {
    loadPlanDetails();
  }, [planId]);

  // Animation setup
  useEffect(() => {
    if (plan) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(headerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [plan]);

  // In TrainingPlanDetails.js, add this helper function:
const getCreatorInitials = (plan) => {
  const firstName = plan?.creatorFirstName || plan?.creator?.split(' ')[0] || '';
  const lastName = plan?.creatorLastName || plan?.creator?.split(' ')[1] || '';
  
  const firstInitial = firstName.charAt(0).toUpperCase();
  const lastInitial = lastName.charAt(0).toUpperCase();
  
  // If we have both initials, use them
  if (firstInitial && lastInitial) {
    return firstInitial + lastInitial;
  }
  
  // If we only have username, use first two characters
  const username = plan?.creatorUsername || plan?.creator || 'Coach';
  if (username.length >= 2) {
    return username.substring(0, 2).toUpperCase();
  }
  
  return 'CR'; // Coach as default
};

  const loadPlanDetails = async () => {
    try {
      setLoading(true);
      const plans = await DocumentProcessor.getTrainingPlans();
      const foundPlan = plans.find(p => p.id === planId);
      
      if (foundPlan) {
        setPlan(foundPlan);
      } else {
        Alert.alert('Error', 'Training plan not found');
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error loading plan details:', error);
      Alert.alert('Error', 'Failed to load training plan details');
    } finally {
      setLoading(false);
    }
  };

  const renderDocumentInfoSection = () => {
  if (!sourceDocument) return null;

  return (
    <Surface style={styles.documentInfoSection}>
      <View style={styles.documentInfoContainer}>
        <View style={styles.documentInfoHeader}>
          <Icon name="description" size={20} color={COLORS.primary} />
          <Text style={[TEXT_STYLES.subtitle2, { marginLeft: SPACING.sm, color: COLORS.textSecondary }]}>
            Source Document
          </Text>
        </View>
        <TouchableOpacity 
          style={styles.documentInfoContent}
          onPress={() => navigation.navigate('DocumentViewer', { 
            document: sourceDocument,
            planTitle: plan.title 
          })}
          activeOpacity={0.7}
        >
          <View style={styles.documentNameContainer}>
            <Text style={[TEXT_STYLES.body1, { fontWeight: '600', color: COLORS.textPrimary }]}>
              {sourceDocument.originalName}
            </Text>
            <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary, marginTop: 2 }]}>
              {getDocumentTypeLabel(sourceDocument)} • {formatFileSize(sourceDocument.size)} • {new Date(sourceDocument.uploadedAt).toLocaleDateString()}
            </Text>
          </View>
          <Icon name="arrow-forward" size={18} color={COLORS.textSecondary} />
        </TouchableOpacity>
      </View>
    </Surface>
  );
};

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPlanDetails();
    setRefreshing(false);
  };

  const handleStartPlan = () => {
    Alert.alert(
      'Start Training Plan',
      `Are you ready to begin "${plan.title}"? This will track your progress and schedule sessions.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Start Plan',
          onPress: () => {
            setSnackbarMessage('Training plan started! Check your dashboard for upcoming sessions.');
            setSnackbarVisible(true);
            // Here you would update the plan status and create sessions
          }
        }
      ]
    );
  };

  const handleEditPlan = () => {
    setEditModalVisible(true);
  };

  const handleSharePlan = async () => {
    try {
      await Share.share({
        message: `Check out this training plan: "${plan.title}" - ${plan.description}`,
        title: plan.title,
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  const handleSessionPress = (session) => {
    setSelectedSession(session);
    setSessionModalVisible(true);
  };

  const toggleSessionExpanded = (sessionId) => {
    setExpandedSessions(prev => ({
      ...prev,
      [sessionId]: !prev[sessionId]
    }));
  };

  const handleFavoriteDocument = async (document) => {
  try {
    const updatedDoc = {
      ...document,
      isFavorite: !document.isFavorite,
      favoritedAt: !document.isFavorite ? new Date().toISOString() : null
    };
    
    await DocumentProcessor.updateDocumentMetadata(updatedDoc);
    await loadAllDocuments();
    setSnackbarMessage(document.isFavorite ? 'Removed from favorites' : 'Added to favorites');
    setSnackbarVisible(true);
  } catch (error) {
    Alert.alert('Favorite Error', `Could not update favorite status: ${error.message}`);
  }
};

const handlePinDocument = async (document) => {
  try {
    if (!document.isPinned) {
      const pinnedCount = allDocuments.filter(doc => doc.isPinned).length;
      if (pinnedCount >= 7) {
        Alert.alert(
          'Pin Limit Reached',
          'You can only pin up to 7 documents. Unpin another document first.',
          [{ text: 'OK' }]
        );
        return;
      }
    }

    const updatedDoc = {
      ...document,
      isPinned: !document.isPinned,
      pinnedAt: !document.isPinned ? new Date().toISOString() : null
    };
    
    await DocumentProcessor.updateDocumentMetadata(updatedDoc);
    await loadAllDocuments();
    setSnackbarMessage(document.isPinned ? 'Document unpinned' : 'Document pinned to top');
    setSnackbarVisible(true);
  } catch (error) {
    Alert.alert('Pin Error', `Could not pin document: ${error.message}`);
  }
};

const handleDeleteDocument = async (document) => {
  if (document.isPinned) {
    Alert.alert(
      'Cannot Delete Pinned Document',
      'This document is pinned and protected from deletion. Unpin it first to delete.',
      [{ text: 'OK' }]
    );
    return;
  }

  Alert.alert(
    'Delete Document',
    `Are you sure you want to delete "${document.originalName}"? This action cannot be undone.`,
    [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await DocumentProcessor.deleteDocument(document.id);
            await loadAllDocuments();
            setSnackbarMessage('Document deleted successfully');
            setSnackbarVisible(true);
          } catch (error) {
            Alert.alert('Delete Failed', 'Could not delete document. Please try again.');
          }
        }
      }
    ]
  );
};

const renderTabContent = () => {
  switch (activeTab) {
    case 'overview':
      return renderOverview();
    case 'documents':
      return renderDocuments();
    case 'favorites':
      return renderFavorites();
    case 'sessions':
      return renderSessions();
    case 'progress':
      return renderProgress();
    case 'nutrition':
      return renderNutrition();
    case 'analytics':
      return renderAnalytics();
    default:
      return renderOverview();
  }
};

const getDocumentIcon = (document) => {
  const type = document.type ? document.type.toLowerCase() : '';
  const name = document.originalName ? document.originalName.toLowerCase() : '';
  
  if (type.includes('pdf') || name.endsWith('.pdf')) return 'picture-as-pdf';
  if (type.includes('doc') || name.includes('.doc')) return 'description';
  if (type.includes('xls') || name.includes('.xls')) return 'grid-on';
  if (type.includes('ppt') || name.includes('.ppt')) return 'slideshow';
  if (type.includes('image') || ['jpg', 'jpeg', 'png', 'gif'].some(ext => name.endsWith(ext))) return 'image';
  if (type.includes('video') || ['mp4', 'avi', 'mov'].some(ext => name.endsWith(ext))) return 'video-library';
  if (type.includes('audio') || ['mp3', 'wav', 'ogg'].some(ext => name.endsWith(ext))) return 'audiotrack';
  if (type.includes('text') || name.endsWith('.txt')) return 'text-snippet';
  return 'insert-drive-file';
};

const getDocumentColor = (document) => {
  const type = document.type ? document.type.toLowerCase() : '';
  const name = document.originalName ? document.originalName.toLowerCase() : '';
  
  if (type.includes('pdf') || name.endsWith('.pdf')) return '#FF5722';
  if (type.includes('doc') || name.includes('.doc')) return '#2196F3';
  if (type.includes('xls') || name.includes('.xls')) return '#4CAF50';
  if (type.includes('ppt') || name.includes('.ppt')) return '#FF9800';
  if (type.includes('image') || ['jpg', 'jpeg', 'png', 'gif'].some(ext => name.endsWith(ext))) return '#E91E63';
  if (type.includes('video') || ['mp4', 'avi', 'mov'].some(ext => name.endsWith(ext))) return '#F44336';
  if (type.includes('audio') || ['mp3', 'wav', 'ogg'].some(ext => name.endsWith(ext))) return '#3F51B5';
  if (type.includes('text') || name.endsWith('.txt')) return '#9C27B0';
  return '#757575';
};

const getDocumentTypeLabel = (document) => {
  const type = document.type ? document.type.toLowerCase() : '';
  const name = document.originalName ? document.originalName.toLowerCase() : '';
  
  if (type.includes('pdf') || name.endsWith('.pdf')) return 'PDF Document';
  if (type.includes('doc') || name.includes('.doc')) return 'Word Document';
  if (type.includes('xls') || name.includes('.xls')) return 'Spreadsheet';
  if (type.includes('ppt') || name.includes('.ppt')) return 'Presentation';
  if (type.includes('image') || ['jpg', 'jpeg', 'png', 'gif'].some(ext => name.endsWith(ext))) return 'Image File';
  if (type.includes('video') || ['mp4', 'avi', 'mov'].some(ext => name.endsWith(ext))) return 'Video File';
  if (type.includes('audio') || ['mp3', 'wav', 'ogg'].some(ext => name.endsWith(ext))) return 'Audio File';
  if (type.includes('text') || name.endsWith('.txt')) return 'Text Document';
  return 'Document';
};

const loadSourceDocument = async () => {
  try {
    if (plan && plan.sourceDocument) {
      const documents = await DocumentProcessor.getStoredDocuments();
      const foundDoc = documents.find(doc => doc.id === plan.sourceDocument);
      setSourceDocument(foundDoc);
    }
  } catch (error) {
    console.error('Error loading source document:', error);
  }
};

// Add this useEffect for more comprehensive navigation handling
useEffect(() => {
  const unsubscribe = navigation.addListener('focus', () => {
    // Always refresh documents when coming back to this screen
    if (activeTab === 'documents' && !loading) {
      loadAllDocuments();
    }
  });

  // Also listen for state changes from child screens
  const beforeRemoveListener = navigation.addListener('beforeRemove', (e) => {
    // Refresh documents when navigation is about to change
    if (activeTab === 'documents') {
      loadAllDocuments();
    }
  });

  return () => {
    unsubscribe();
    beforeRemoveListener();
  };
}, [navigation, activeTab, loading]);

// Add this useEffect to load document when plan changes:
useEffect(() => {
  if (plan) {
    loadSourceDocument();
  }
}, [plan]);

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const handleDocumentPress = (document) => {
  // Ensure we pass the complete document object with all necessary data
  const documentForViewer = {
    ...document,
    // Make sure we have all required fields
    id: document.id,
    originalName: document.originalName,
    type: document.type,
    size: document.size,
    uploadedAt: document.uploadedAt,
    webFileData: document.webFileData,
    file: document.file // Include original file object if available
  };
  
  navigation.navigate('DocumentViewer', {
    document: documentForViewer,
    planTitle: plan.title
  });
};

const handleDocumentDownload = (document) => {
  Alert.alert(
    'Download Document',
    `Download "${document.originalName}"?`,
    [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Download',
        onPress: () => {
          // Implement download logic here
          setSnackbarMessage(`Downloading ${document.originalName}...`);
          setSnackbarVisible(true);
        }
      }
    ]
  );
};

//Add document upload modal functionality
const handleDocumentUpload = async () => {
  try {
    setDocumentUploadModalVisible(false);
    
    // Use DocumentProcessor to select and upload document
    const file = await DocumentProcessor.selectDocument();
    if (!file) return;

    // Show loading state
    Alert.alert('Uploading...', 'Please wait while we process your document.');

    // Store document with integrity check
    const result = await DocumentProcessor.storeDocumentWithIntegrityCheck(file);
    
    // Show success message
    setSnackbarMessage(`Document "${result.document.originalName}" uploaded successfully!`);
    setSnackbarVisible(true);
    
    // Reload documents immediately after upload
    await loadAllDocuments();
    
  } catch (error) {
    console.error('Document upload failed:', error);
    Alert.alert('Upload Failed', error.message || 'Failed to upload document. Please try again.');
  }
};

const showDocumentOptions = (document) => {
  Alert.alert(
    document.originalName,
    'Choose an action:',
    [
      { text: 'View Document', onPress: () => handleDocumentPress(document) },
      { text: 'Open in Library', onPress: () => navigation.navigate('DocumentLibrary', { 
        highlightDocument: document.id,
        onDocumentChange: refreshDocuments 
      }) },
      { text: 'Share', onPress: () => shareDocument(document) },
      { text: 'Cancel', style: 'cancel' }
    ]
  );
};

const handleDailySessionPress = (dailySession, weekSession) => {
  navigation.navigate('SessionScheduleScreen', {
    sessionData: {
      ...dailySession,
      weekData: weekSession,
      planTitle: plan.title,
      academyName: dailySession.academyName || plan.title
    },
    planTitle: plan.title,
    academyName: dailySession.academyName || plan.title
  });
};

const handleScheduleSession = (session) => {
  navigation.navigate('SessionScheduler', {
    prefillData: session,
    planId: plan.id
  });
};

const handleStartSession = (session) => {
  Alert.alert(
    'Start Session',
    `Ready to start "${session.title}"?`,
    [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Start',
        onPress: () => {
          navigation.navigate('ActiveSession', {
            sessionId: session.id,
            sessionData: session
          });
        }
      }
    ]
  );
};

const showOptimizedSchedule = () => {
  const schedule = extractedSessions[0]?.optimizedSchedule;
  if (!schedule) return;

  navigation.navigate('AIScheduleView', {
    schedule: schedule,
    planTitle: plan.title,
    planId: plan.id
  });
};

// Move this function to component level (around line 300)
const loadSessionsFromDocument = async () => {
  try {
    setLoadingSessions(true);
    const documents = await DocumentProcessor.getStoredDocuments();
    const sourceDoc = documents.find(doc => doc.id === plan.sourceDocument);
    
    if (sourceDoc) {
      const extractionResult = await SessionExtractor.extractSessionsFromDocument(sourceDoc, plan);
      if (extractionResult && extractionResult.sessions) {
        setExtractedSessions(extractionResult.sessions);
      }
    }
  } catch (error) {
    console.error('Error loading sessions:', error);
    setSnackbarMessage('Failed to load sessions from document');
    setSnackbarVisible(true);
  } finally {
    setLoadingSessions(false);
  }
};

const processDocumentAsPlan = (document) => {
  navigation.navigate('PlanProcessing', {
    documentId: document.id,
    onComplete: (trainingPlan) => {
      navigation.navigate('TrainingPlanLibrary', {
        newPlanId: trainingPlan?.id,
        showSuccess: true,
        message: `"${trainingPlan?.title || 'Training Plan'}" created from document!`
      });
    }
  });
};

const handleGenerateVariations = async () => {
  try {
    Alert.alert(
      'Generate Variations',
      'Create training plans for other sports based on this plan?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Generate',
          onPress: async () => {
            setSnackbarMessage('Generating AI variations...');
            setSnackbarVisible(true);
            
            const variations = await DocumentProcessor.generateSportVariations(
              plan.id,
              ['basketball', 'tennis', 'volleyball']
            );
            
            setSnackbarMessage(`Generated ${variations.length} sport variations!`);
            setSnackbarVisible(true);
          }
        }
      ]
    );
  } catch (error) {
    Alert.alert('Generation Failed', error.message);
  }
};

const showAIInsights = () => {
  if (!plan.aiInsights || !plan.aiSuggestedImprovements) {
    Alert.alert('AI Analysis', 'No AI insights available for this plan.');
    return;
  }

  const insightsText = [
    '🧠 AI Analysis Results:',
    '',
    ...plan.aiInsights.map(insight => `• ${insight}`),
    '',
    '💡 Suggested Improvements:',
    '',
    ...plan.aiSuggestedImprovements.map(suggestion => `• ${suggestion}`)
  ].join('\n');

  Alert.alert(
    'AI Training Plan Analysis',
    insightsText,
    [
      { text: 'Apply Suggestions', onPress: () => applyAISuggestions() },
      { text: 'Close' }
    ]
  );
};

const applyAISuggestions = () => {
  Alert.alert(
    'Apply AI Suggestions',
    'This will create an enhanced version of your training plan with AI recommendations applied.',
    [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Create Enhanced Plan',
        onPress: async () => {
          setSnackbarMessage('Creating AI-enhanced plan...');
          setSnackbarVisible(true);
          
          // Here you would call your AI enhancement logic
          setTimeout(() => {
            setSnackbarMessage('Enhanced plan created successfully!');
            setSnackbarVisible(true);
          }, 2000);
        }
      }
    ]
  );
};

const shareDocument = async (document) => {
  try {
    await Share.share({
      message: `Check out this training document: ${document.originalName}`,
      title: document.originalName,
    });
  } catch (error) {
    console.error('Share error:', error);
  }
};

const deleteDocument = (document) => {
  Alert.alert(
    'Delete Document',
    `Are you sure you want to delete "${document.originalName}"? This action cannot be undone.`,
    [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await DocumentProcessor.deleteDocument(document.id);
            setSnackbarMessage('Document deleted successfully');
            setSnackbarVisible(true);
            loadPlanDetails(); // Refresh the view
          } catch (error) {
            Alert.alert('Delete Failed', 'Could not delete document. Please try again.');
          }
        }
      }
    ]
  );
};


const renderFavorites = () => {
  return (
    <View style={{ padding: SPACING.md }}>
      <View style={styles.favoritesRedirect}>
        <Icon name="favorite" size={64} color="#FF6B6B" />
        <Text style={[TEXT_STYLES.h3, { marginTop: SPACING.md, textAlign: 'center' }]}>
          Favorite Documents
        </Text>
        <Text style={[TEXT_STYLES.body2, { marginTop: SPACING.sm, textAlign: 'center', color: COLORS.textSecondary }]}>
          View and manage all your favorite documents in the Document Library.
        </Text>
        
        <Button
          mode="contained"
          onPress={() => navigation.navigate('DocumentLibrary', { showFavorites: true })}
          style={styles.libraryButton}
          icon="favorite"
        >
          View Favorites
        </Button>
        
        <Button
          mode="outlined"
          onPress={() => navigation.navigate('DocumentLibrary', { 
            onDocumentChange: refreshDocuments 
          })}
          style={[styles.libraryButton, { marginTop: SPACING.sm }]}
          icon="library-books"
        >
          Browse All Documents
        </Button>
      </View>
    </View>
  );
};

// Add this new function inside the component, after deleteDocument function
const renderTabSpecificFAB = () => {
  if (!plan) return null;

const fabConfigs = {
  overview: {
    icon: "play-arrow",
    label: "Start Training",
    onPress: handleStartPlan,
    show: plan.isOwned
  },
  documents: {
  icon: "library-books",
  label: "Document Library",
  onPress: () => navigation.navigate('DocumentLibrary', { 
    onDocumentChange: refreshDocuments 
  }),
  show: true
},
  favorites: {
    icon: "favorite",
    label: "View Favorites",
    onPress: () => navigation.navigate('DocumentLibrary', { showFavorites: true }),
    show: true
  },
  sessions: {
    icon: "add",
    label: "Add Session",
    onPress: () => navigation.navigate('SessionBuilder', { planId: plan.id }),
    show: true
  },
  progress: {
    icon: "analytics",
    label: "View Progress",
    onPress: () => Alert.alert('Feature Coming Soon', 'Detailed progress view will be available soon!'),
    show: true
  },
  nutrition: {
    icon: "lightbulb",
    label: "Nutrition Tips",
    onPress: () => Alert.alert('Nutrition Tip', 'Stay hydrated! Drink water 30 minutes before your workout for optimal performance.'),
    show: true
  },
  analytics: {
    icon: "assessment",
    label: "Analytics",
    onPress: () => navigation.navigate('PerformanceAnalytics', { planId: plan.id }),
    show: true
  }
};

  const currentFAB = fabConfigs[activeTab];
  
  if (!currentFAB || !currentFAB.show) return null;

  return (
    <FAB
      icon={currentFAB.icon}
      style={styles.fab}
      onPress={currentFAB.onPress}
      label={currentFAB.label}
    />
  );
};

  const renderOverview = () => (
    <View style={{ padding: SPACING.md }}>
    {/* Document Info Section - Only in Overview tab */}
    {renderDocumentInfoSection()}
      {/* Plan Stats */}
      <Surface style={styles.statsCard}>
        <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md, textAlign: 'center' }]}>
          Plan Overview
        </Text>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Icon name="fitness-center" size={24} color={COLORS.primary} />
            <Text style={styles.statNumber}>{plan.sessionsCount}</Text>
            <Text style={styles.statLabel}>Sessions</Text>
          </View>
          <View style={styles.statItem}>
            <Icon name="schedule" size={24} color={COLORS.primary} />
            <Text style={styles.statNumber}>{plan.duration}</Text>
            <Text style={styles.statLabel}>Duration</Text>
          </View>
          <View style={styles.statItem}>
            <Icon name="trending-up" size={24} color={difficultyColors[plan.difficulty]} />
            <Text style={styles.statNumber}>{plan.difficulty}</Text>
            <Text style={styles.statLabel}>Level</Text>
          </View>
          <View style={styles.statItem}>
            <Icon name="star" size={24} color="#FFD700" />
            <Text style={styles.statNumber}>{plan.rating}</Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
        </View>
      </Surface>

      {/* AI Enhancement Status - Add this after statsCard */}
        {plan.aiAnalyzed && (
          <Surface style={styles.aiStatusCard}>
            <View style={styles.aiStatusHeader}>
              <Icon name="auto-awesome" size={24} color="#9C27B0" />
              <Text style={[TEXT_STYLES.subtitle1, { marginLeft: SPACING.sm, color: "#9C27B0" }]}>
                AI Enhanced Plan
              </Text>
              <Chip
                mode="flat"
                compact
                style={{ backgroundColor: "#9C27B0", marginLeft: 'auto' }}
                textStyle={{ color: 'white', fontSize: 10 }}
              >
                {Math.round((plan.aiConfidence || 0.7) * 100)}% Confidence
              </Chip>
            </View>
            
            {plan.aiInsights && plan.aiInsights.length > 0 && (
              <View style={styles.aiInsights}>
                {plan.aiInsights.slice(0, 3).map((insight, index) => (
                  <Text key={index} style={[TEXT_STYLES.body2, { color: COLORS.textSecondary, marginBottom: 4 }]}>
                    • {insight}
                  </Text>
                ))}
              </View>
            )}
            
            <Button
              mode="outlined"
              compact
              onPress={() => showAIInsights()}
              style={{ marginTop: SPACING.sm, borderColor: "#9C27B0" }}
              textColor="#9C27B0"
              icon="lightbulb"
            >
              View AI Suggestions
            </Button>
          </Surface>
        )}

      {/* Description */}
      <Card style={styles.sectionCard}>
        <Card.Content>
          <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md }]}>
            Description
          </Text>
          <Text style={[TEXT_STYLES.body1, { lineHeight: 24 }]}>
            {plan.description}
          </Text>
        </Card.Content>
      </Card>

      {/* AI Generation Section */}
      <Card style={styles.sectionCard}>
        <Card.Content>
          <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md }]}>
            AI-Powered Features
          </Text>
          <Text style={[TEXT_STYLES.body2, { marginBottom: SPACING.md, color: COLORS.textSecondary }]}>
            Generate variations of this training plan for different sports
          </Text>
          <Button
            mode="contained"
            onPress={() => handleGenerateVariations()}
            style={{ backgroundColor: COLORS.secondary }}
            icon="auto-awesome"
          >
            Generate Sport Variations
          </Button>
        </Card.Content>
      </Card>

      {/* Tags */}
      <Card style={styles.sectionCard}>
        <Card.Content>
          <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md }]}>
            Focus Areas
          </Text>
          <View style={styles.tagsContainer}>
            {plan.tags.map((tag, index) => (
              <Chip
                key={index}
                mode="outlined"
                style={styles.tagChip}
                textStyle={{ fontSize: 12 }}
              >
                {tag}
              </Chip>
            ))}
          </View>
        </Card.Content>
      </Card>

      {/* Schedule */}
      {plan.schedule && (
        <Card style={styles.sectionCard}>
          <Card.Content>
            <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md }]}>
              Schedule
            </Text>
            <View style={styles.scheduleInfo}>
              <Icon name="calendar-today" size={20} color={COLORS.primary} />
              <Text style={[TEXT_STYLES.body1, { marginLeft: SPACING.sm }]}>
                {plan.schedule.pattern}
              </Text>
            </View>
            {plan.schedule.days && plan.schedule.days.length > 0 && (
              <View style={styles.daysContainer}>
                {plan.schedule.days.map((day, index) => (
                  <Chip
                    key={index}
                    mode="flat"
                    compact
                    style={[styles.dayChip, { backgroundColor: COLORS.primary + '20' }]}
                    textStyle={{ color: COLORS.primary, fontSize: 10 }}
                  >
                    {day.substring(0, 3).toUpperCase()}
                  </Chip>
                ))}
              </View>
            )}
          </Card.Content>
        </Card>
      )}

      {/* Creator Info - Updated with profile picture */}
      <Card style={styles.sectionCard}>
        <Card.Content>
          <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md }]}>
            Created By
          </Text>
          <View style={styles.creatorInfo}>
            {plan.creatorProfileImage ? (
              <Avatar.Image
                size={40}
                source={{ uri: plan.creatorProfileImage }}
                style={{ backgroundColor: COLORS.primary }}
              />
            ) : (
              <Avatar.Text
                size={40}
                label={getCreatorInitials(plan)}
                style={{ backgroundColor: COLORS.primary }}
              />
            )}
            <View style={styles.creatorDetails}>
              <Text style={[TEXT_STYLES.subtitle1, { fontWeight: 'bold' }]}>
                {plan.creatorUsername || plan.creator}
              </Text>
              <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
                Created: {new Date(plan.createdAt).toLocaleDateString()}
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>
    </View>
  );

  

 const renderDocuments = () => {
  if (loadingDocs) {
    return (
      <View style={[styles.emptyState, { minHeight: 200 }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={[TEXT_STYLES.body2, { marginTop: SPACING.md }]}>
          Loading documents...
        </Text>
      </View>
    );
  }

  // If documents exist, show them directly
  if (allDocuments.length > 0) {
    return (
      <View style={{ padding: SPACING.md }}>
        {/* Header with library button */}
        <View style={styles.documentsHeader}>
          <Text style={[TEXT_STYLES.h3, { flex: 1 }]}>
            Documents ({allDocuments.length})
          </Text>
          <Button
            mode="outlined"
            compact
            onPress={() => navigation.navigate('DocumentLibrary')}
            icon="library-books"
          >
            Full Library
          </Button>
        </View>
        
        <FlatList
          data={allDocuments.slice(0, 10)} // Show first 10 documents
          keyExtractor={(item) => item.id}
          renderItem={({ item: document }) => (
  <Card style={[
    styles.documentCard,
    document.isPinned && document.isFavorite && styles.pinnedFavoriteCard,
    document.isPinned && !document.isFavorite && styles.pinnedCard,
    !document.isPinned && document.isFavorite && styles.favoriteCard,
  ]}>
    <TouchableOpacity
          onPress={() => handleDocumentPress(document)}
          activeOpacity={0.7}
        >
          <Card.Content>
            <View style={styles.documentContainer}>
              <View style={styles.documentHeader}>
                <View style={styles.documentIconContainer}>
                  <Icon 
                    name={getDocumentIcon(document)} 
                    size={32} 
                    color={getDocumentColor(document)} 
                  />
                </View>
                <View style={styles.documentInfo}>
                  <Text style={[TEXT_STYLES.subtitle1, { fontWeight: 'bold' }]}>
                    {document.originalName}
                  </Text>
                  <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
                    {getDocumentTypeLabel(document)} • {formatFileSize(document.size)}
                  </Text>
                  <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
                    Uploaded: {new Date(document.uploadedAt).toLocaleDateString()}
                  </Text>
                  
                  {/* Status badges */}
                  <View style={styles.statusBadges}>
                    {document.isPinned && (
                      <Chip
                        compact
                        mode="flat"
                        style={styles.pinnedBadge}
                        textStyle={styles.badgeText}
                      >
                        Pinned
                      </Chip>
                    )}
                    {document.processed && (
                      <Chip
                        compact
                        mode="flat"
                        style={{ 
                          backgroundColor: COLORS.success + '20',
                          alignSelf: 'flex-start',
                          marginTop: SPACING.xs
                        }}
                        textStyle={{ color: COLORS.success, fontSize: 10 }}
                      >
                        Processed
                      </Chip>
                    )}
                    {document.isFavorite && (
                      <Chip
                        compact
                        mode="flat"
                        style={styles.favoriteBadge}
                        textStyle={styles.badgeText}
                      >
                        Favorite
                      </Chip>
                    )}
                  </View>
                </View>
              </View>

              {/* Action buttons */}
              <View style={styles.documentActionsRow}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleFavoriteDocument(document)}
                >
                  <Icon
                    name={document.isFavorite ? "favorite" : "favorite-border"}
                    size={20}
                    color={document.isFavorite ? "#4CAF50" : COLORS.textSecondary}
                  />
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handlePinDocument(document)}
                >
                  <Icon
                    name="push-pin"
                    size={18}
                    color={document.isPinned ? "#2196F3" : COLORS.textSecondary}
                    style={{
                      transform: [{ rotate: document.isPinned ? '-45deg' : '0deg' }],
                      opacity: document.isPinned ? 1 : 0.6
                    }}
                  />
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.actionButton, document.isPinned && styles.disabledAction]}
                  onPress={() => handleDeleteDocument(document)}
                  disabled={document.isPinned}
                >
                  <Icon
                    name="delete-outline"
                    size={20}
                    color={document.isPinned ? COLORS.disabled : "#F44336"}
                  />
                </TouchableOpacity>
                
                <IconButton
                  icon="more-vert"
                  size={20}
                  onPress={() => showDocumentOptions(document)}
                />
              </View>
            </View>
          </Card.Content>
        </TouchableOpacity>
      </Card>
    )}
          scrollEnabled={false}
          ListFooterComponent={() => 
            allDocuments.length > 10 ? (
              <Button
                mode="text"
                onPress={() => navigation.navigate('DocumentLibrary')}
                style={{ marginTop: SPACING.md }}
                icon="arrow-right"
              >
                View all {allDocuments.length} documents in Library
              </Button>
            ) : null
          }
        />
      </View>
    );
  }

  // If no documents exist, show the library redirect
  return (
    <View style={{ padding: SPACING.md }}>
      <View style={styles.documentsRedirect}>
        <Icon name="folder-open" size={64} color={COLORS.primary} />
        <Text style={[TEXT_STYLES.h3, { marginTop: SPACING.md, textAlign: 'center' }]}>
          Document Library
        </Text>
        <Text style={[TEXT_STYLES.body2, { marginTop: SPACING.sm, textAlign: 'center', color: COLORS.textSecondary }]}>
          No documents found. Upload your first training document to get started.
        </Text>
        
        <Button
          mode="contained"
          onPress={() => setDocumentUploadModalVisible(true)}
          style={styles.libraryButton}
          icon="add"
        >
          Upload Document
        </Button>
        
        <Button
          mode="outlined"
          onPress={() => navigation.navigate('DocumentLibrary')}
          style={[styles.libraryButton, { marginTop: SPACING.sm }]}
          icon="library-books"
        >
          Open Document Library
        </Button>

        <Surface style={styles.libraryPreview}>
          <Text style={[TEXT_STYLES.subtitle2, { marginBottom: SPACING.sm }]}>
            Library Features:
          </Text>
          <View style={styles.featuresList}>
            <Text style={styles.featureItem}>• Advanced search and filtering</Text>
            <Text style={styles.featureItem}>• Document favorites and bookmarks</Text>
            <Text style={styles.featureItem}>• File integrity verification</Text>
            <Text style={styles.featureItem}>• Detailed document information</Text>
            <Text style={styles.featureItem}>• Easy document sharing</Text>
          </View>
        </Surface>
      </View>
    </View>
  );
};


const renderSessions = () => {

  {extractedSessions.length > 0 && extractedSessions[0]?.optimizedSchedule && (
    <Card style={styles.aiScheduleCard}>
      <Card.Content>
        <View style={styles.aiScheduleHeader}>
          <Icon name="schedule" size={24} color="#2196F3" />
          <Text style={[TEXT_STYLES.subtitle1, { marginLeft: SPACING.sm, fontWeight: 'bold' }]}>
            AI-Optimized Schedule
          </Text>
        </View>
        
        <Text style={[TEXT_STYLES.body2, { color: COLORS.textSecondary, marginVertical: SPACING.sm }]}>
          Smart scheduling based on progressive training principles
        </Text>
        
        <View style={styles.schedulePreview}>
          {extractedSessions[0].optimizedSchedule.sessions.slice(0, 3).map((session, index) => (
            <View key={session.id} style={styles.scheduleItem}>
              <Text style={[TEXT_STYLES.caption, { fontWeight: 'bold' }]}>
                {session.day} • {session.time}
              </Text>
              <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
                {session.type} - {session.duration}min
              </Text>
            </View>
          ))}
        </View>
        
        <Button
          mode="contained"
          compact
          onPress={() => showOptimizedSchedule()}
          style={{ backgroundColor: "#2196F3", marginTop: SPACING.sm }}
          icon="calendar-today"
        >
          View Full AI Schedule
        </Button>
      </Card.Content>
    </Card>
  )}

  if (loadingSessions) {
    return (
      <View style={{ padding: SPACING.md, alignItems: 'center' }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={{ marginTop: SPACING.md }}>Loading sessions from document...</Text>
      </View>
    );
  }

  return (
    <View style={{ padding: SPACING.md }}>
      {extractedSessions.length > 0 ? (
        <FlatList
          data={extractedSessions}
          keyExtractor={(item) => item.id}
          renderItem={({ item: weekSession, index }) => (
            <Card style={styles.weekSessionCard}>
              <TouchableOpacity
                onPress={() => toggleSessionExpanded(weekSession.id)}
                activeOpacity={0.7}
              >
                <Card.Content>
                  <View style={styles.weekSessionHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={[TEXT_STYLES.h3, { fontWeight: 'bold', color: COLORS.primary }]}>
                        Week {weekSession.weekNumber}
                      </Text>
                      <Text style={[TEXT_STYLES.subtitle1, { marginTop: 4 }]}>
                        {weekSession.title}
                      </Text>
                      <Text style={[TEXT_STYLES.body2, { color: COLORS.textSecondary, marginTop: 4 }]}>
                        {weekSession.dailySessions.length} training session{weekSession.dailySessions.length > 1 ? 's' : ''} • {weekSession.totalDuration} minutes total
                      </Text>
                    </View>
                    <View style={styles.weekSessionActions}>
                      <Chip style={{ backgroundColor: COLORS.primary + '20' }}>
                        <Text style={{ color: COLORS.primary, fontSize: 12 }}>
                          {weekSession.dailySessions.length} days
                        </Text>
                      </Chip>
                      <IconButton
                        icon={expandedSessions[weekSession.id] ? 'expand-less' : 'expand-more'}
                        size={20}
                        onPress={() => toggleSessionExpanded(weekSession.id)}
                      />
                    </View>
                  </View>

                  {weekSession.description && (
                    <Text style={[TEXT_STYLES.body2, { marginTop: SPACING.sm, color: COLORS.textSecondary }]}>
                      {weekSession.description}
                    </Text>
                  )}

                  {expandedSessions[weekSession.id] && (
                    <View style={{ marginTop: SPACING.md }}>
                      <Text style={[TEXT_STYLES.subtitle2, { fontWeight: 'bold', marginBottom: SPACING.sm }]}>
                        Training Sessions:
                      </Text>
                      
                      {weekSession.dailySessions.map((dailySession, sessionIndex) => (
                        <TouchableOpacity
                          key={dailySession.id}
                          onPress={() => handleDailySessionPress(dailySession, weekSession)}
                          style={styles.dailySessionItem}
                        >
                          <View style={styles.dailySessionHeader}>
                            <View style={{ flex: 1 }}>
                              <Text style={[TEXT_STYLES.subtitle1, { fontWeight: '600' }]}>
                                {dailySession.day === 'week_plan' ? 'Weekly Overview' : `${dailySession.day.charAt(0).toUpperCase() + dailySession.day.slice(1)} Training`}
                              </Text>
                              <View style={styles.sessionMetaInfo}>
                                <Icon name="schedule" size={14} color={COLORS.textSecondary} />
                                <Text style={[TEXT_STYLES.caption, { marginLeft: 4, color: COLORS.textSecondary }]}>
                                  {dailySession.time} • {dailySession.duration}min
                                </Text>
                                <Text style={{ color: COLORS.textSecondary, marginHorizontal: 8 }}>•</Text>
                                <Icon name="location-on" size={14} color={COLORS.textSecondary} />
                                <Text style={[TEXT_STYLES.caption, { marginLeft: 4, color: COLORS.textSecondary }]}>
                                  {dailySession.location}
                                </Text>
                              </View>
                              
                              {dailySession.focus && dailySession.focus.length > 0 && (
                                <View style={{ flexDirection: 'row', marginTop: SPACING.xs }}>
                                  {dailySession.focus.slice(0, 3).map((focus, idx) => (
                                    <Chip
                                      key={idx}
                                      compact
                                      mode="outlined"
                                      style={{ marginRight: 4, height: 20 }}
                                      textStyle={{ fontSize: 10 }}
                                    >
                                      {focus}
                                    </Chip>
                                  ))}
                                </View>
                              )}
                            </View>
                            
                            <View style={styles.sessionActions}>
                              <Button
                                mode="outlined"
                                compact
                                onPress={(e) => {
                                  e.stopPropagation();
                                  handleScheduleSession(dailySession);
                                }}
                                style={{ marginRight: SPACING.xs }}
                                contentStyle={{ height: 28 }}
                              >
                                Schedule
                              </Button>
                              <Button
                                mode="contained"
                                compact
                                onPress={(e) => {
                                  e.stopPropagation();
                                  handleStartSession(dailySession);
                                }}
                                style={{ backgroundColor: COLORS.success }}
                                contentStyle={{ height: 28 }}
                              >
                                Start
                              </Button>
                            </View>
                          </View>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </Card.Content>
              </TouchableOpacity>
            </Card>
          )}
          scrollEnabled={false}
          ListHeaderComponent={() => (
            <View style={styles.sessionsHeader}>
              <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.sm }]}>
                Training Sessions ({extractedSessions.length} weeks)
              </Text>
              <Text style={[TEXT_STYLES.body2, { color: COLORS.textSecondary, marginBottom: SPACING.md }]}>
                Sessions extracted from: {plan.originalName || plan.title}
              </Text>
            </View>
          )}
        />
      ) : (
        <View style={styles.emptyState}>
          <Icon name="fitness-center" size={64} color={COLORS.textSecondary} />
          <Text style={[TEXT_STYLES.h3, { marginTop: SPACING.md, color: COLORS.textSecondary }]}>
            No Sessions Available
          </Text>
          <Text style={[TEXT_STYLES.body2, { marginTop: SPACING.sm, textAlign: 'center', color: COLORS.textSecondary }]}>
            Sessions will be automatically extracted from your training document.
          </Text>
          <Button
            mode="contained"
            style={{ marginTop: SPACING.md }}
            onPress={loadSessionsFromDocument}
          >
            Extract Sessions
          </Button>
        </View>
      )}
    </View>
  );
};

  const renderProgress = () => (
    <View style={{ padding: SPACING.md }}>
      {/* Progress Overview */}
      <Surface style={styles.progressCard}>
        <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md, textAlign: 'center' }]}>
          Your Progress
        </Text>
        
        <View style={styles.progressCircle}>
          <Text style={[TEXT_STYLES.h1, { color: COLORS.primary }]}>
            {plan.progress}%
          </Text>
          <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
            Complete
          </Text>
        </View>
        
        <ProgressBar
          progress={plan.progress / 100}
          color={COLORS.primary}
          style={styles.progressBar}
        />
        
        <View style={styles.progressStats}>
          <View style={styles.progressStat}>
            <Text style={styles.progressNumber}>
              {Math.floor((plan.sessionsCount * plan.progress) / 100)}
            </Text>
            <Text style={styles.progressLabel}>Sessions Completed</Text>
          </View>
          <View style={styles.progressStat}>
            <Text style={styles.progressNumber}>
              {plan.sessionsCount - Math.floor((plan.sessionsCount * plan.progress) / 100)}
            </Text>
            <Text style={styles.progressLabel}>Sessions Remaining</Text>
          </View>
        </View>
      </Surface>

      {/* Recent Activity */}
      <Card style={styles.sectionCard}>
        <Card.Content>
          <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md }]}>
            Recent Activity
          </Text>
          <List.Item
            title="Completed Session 3: Upper Body Strength"
            description="2 days ago"
            left={props => <List.Icon {...props} icon="check-circle" color={COLORS.success} />}
          />
          <List.Item
            title="Started Session 4: Cardio Endurance"
            description="Today"
            left={props => <List.Icon {...props} icon="play-circle" color={COLORS.primary} />}
          />
          <List.Item
            title="Updated nutrition plan"
            description="1 week ago"
            left={props => <List.Icon {...props} icon="restaurant" color={COLORS.secondary} />}
          />
        </Card.Content>
      </Card>
    </View>
  );

  const renderNutrition = () => (
    <View style={{ padding: SPACING.md }}>
      <Card style={styles.sectionCard}>
        <Card.Content>
          <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md }]}>
            Nutrition Guidelines
          </Text>
          <Text style={[TEXT_STYLES.body1, { marginBottom: SPACING.md }]}>
            Follow these nutrition recommendations to maximize your training results:
          </Text>
          
          <View style={styles.nutritionItem}>
            <Icon name="local-drink" size={24} color="#2196F3" />
            <View style={{ marginLeft: SPACING.md, flex: 1 }}>
              <Text style={[TEXT_STYLES.subtitle2, { fontWeight: 'bold' }]}>
                Hydration
              </Text>
              <Text style={TEXT_STYLES.body2}>
                Drink at least 2-3 liters of water daily, more on training days
              </Text>
            </View>
          </View>

          <View style={styles.nutritionItem}>
            <Icon name="restaurant" size={24} color="#FF9800" />
            <View style={{ marginLeft: SPACING.md, flex: 1 }}>
              <Text style={[TEXT_STYLES.subtitle2, { fontWeight: 'bold' }]}>
                Pre-Workout
              </Text>
              <Text style={TEXT_STYLES.body2}>
                Consume carbs 1-2 hours before training for energy
              </Text>
            </View>
          </View>

          <View style={styles.nutritionItem}>
            <Icon name="fitness-center" size={24} color="#4CAF50" />
            <View style={{ marginLeft: SPACING.md, flex: 1 }}>
              <Text style={[TEXT_STYLES.subtitle2, { fontWeight: 'bold' }]}>
                Post-Workout
              </Text>
              <Text style={TEXT_STYLES.body2}>
                Protein and carbs within 30 minutes for recovery
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      <Button
        mode="contained"
        style={{ margin: SPACING.md }}
        onPress={() => {
          Alert.alert('Feature Coming Soon', 'Detailed nutrition plans will be available in the next update!');
        }}
      >
        Create Custom Meal Plan
      </Button>
    </View>
  );

  const renderAnalytics = () => (
    <View style={{ padding: SPACING.md }}>
      <Card style={styles.sectionCard}>
        <Card.Content>
          <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md }]}>
            Performance Analytics
          </Text>
          
          <View style={styles.analyticsGrid}>
            <Surface style={styles.analyticsCard}>
              <Icon name="trending-up" size={32} color={COLORS.success} />
              <Text style={styles.analyticsNumber}>+15%</Text>
              <Text style={styles.analyticsLabel}>Strength Gain</Text>
            </Surface>
            
            <Surface style={styles.analyticsCard}>
              <Icon name="favorite" size={32} color={COLORS.error} />
              <Text style={styles.analyticsNumber}>-8 BPM</Text>
              <Text style={styles.analyticsLabel}>Resting HR</Text>
            </Surface>
            
            <Surface style={styles.analyticsCard}>
              <Icon name="speed" size={32} color={COLORS.primary} />
              <Text style={styles.analyticsNumber}>+12%</Text>
              <Text style={styles.analyticsLabel}>Endurance</Text>
            </Surface>
            
            <Surface style={styles.analyticsCard}>
              <Icon name="scale" size={32} color={COLORS.secondary} />
              <Text style={styles.analyticsNumber}>-3 kg</Text>
              <Text style={styles.analyticsLabel}>Body Fat</Text>
            </Surface>
          </View>
        </Card.Content>
      </Card>

      <Button
        mode="contained"
        style={{ margin: SPACING.md }}
        onPress={() => {
          Alert.alert('Feature Coming Soon', 'Detailed analytics dashboard will be available in the next update!');
        }}
      >
        View Detailed Analytics
      </Button>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading training plan...</Text>
      </View>
    );
  }

  if (!plan) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="error" size={64} color={COLORS.error} />
        <Text style={[TEXT_STYLES.h3, { marginTop: SPACING.md }]}>
          Plan Not Found
        </Text>
        <Button mode="contained" onPress={() => navigation.goBack()}>
          Go Back
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} translucent />
      
      {/* Header */}
      <Animated.View style={[styles.header, { opacity: headerAnim }]}>
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <IconButton
              icon="arrow-back"
              iconColor="white"
              size={24}
              onPress={() => navigation.goBack()}
            />
            <View style={styles.headerInfo}>
              <Text style={[TEXT_STYLES.h2, { color: 'white' }]}>
                {plan.title}
              </Text>
              <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)' }]}>
                {plan.category} • {plan.difficulty}
              </Text>
            </View>
            <View style={styles.headerActions}>
              <IconButton
                icon="share"
                iconColor="white"
                size={24}
                onPress={handleSharePlan}
              />
              <IconButton
                icon="edit"
                iconColor="white"
                size={24}
                onPress={handleEditPlan}
              />
            </View>
          </View>

          {/* Progress Bar */}
          {plan.isOwned && (
            <View style={styles.headerProgress}>
              <ProgressBar
                progress={plan.progress / 100}
                color="white"
                style={{ height: 4, backgroundColor: 'rgba(255,255,255,0.3)' }}
              />
              <Text style={[TEXT_STYLES.caption, { color: 'white', marginTop: 4 }]}>
                {plan.progress}% Complete
              </Text>
            </View>
          )}
        </LinearGradient>
      </Animated.View>

      {/* Tab Navigation */}
      <Surface style={styles.tabContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.tab,
                activeTab === tab.key && styles.activeTab
              ]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Icon
                name={tab.icon}
                size={20}
                color={activeTab === tab.key ? COLORS.primary : COLORS.textSecondary}
              />
              <Text
                style={[
                  styles.tabText,
                  { color: activeTab === tab.key ? COLORS.primary : COLORS.textSecondary }
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Surface>

      {/* Content */}
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
            />
          }
        >
          {renderTabContent()}
        </ScrollView>
      </Animated.View>

      {/* Snackbar */}
      <Portal>
        <Snackbar
          visible={snackbarVisible}
          onDismiss={() => setSnackbarVisible(false)}
          duration={3000}
          style={{ backgroundColor: COLORS.success }}
        >
          <Text style={{ color: 'white' }}>{snackbarMessage}</Text>
        </Snackbar>
      </Portal>

      {/* Document Upload Modal */}
<Portal>
  <Modal
    visible={documentUploadModalVisible}
    onDismiss={() => setDocumentUploadModalVisible(false)}
    contentContainerStyle={styles.modalContent}
  >
    <View style={{ alignItems: 'center' }}>
      <Icon name="cloud-upload" size={48} color={COLORS.primary} />
      <Text style={[TEXT_STYLES.h3, { marginVertical: SPACING.md }]}>
        Upload Document
      </Text>
      <Text style={[TEXT_STYLES.body2, { textAlign: 'center', marginBottom: SPACING.lg }]}>
        Select a document to add to your training library. Supported formats: PDF, Word, Excel, Text files.
      </Text>
      
      <View style={{ flexDirection: 'row', width: '100%', justifyContent: 'space-between' }}>
        <Button
          mode="outlined"
          onPress={() => setDocumentUploadModalVisible(false)}
          style={{ flex: 1, marginRight: SPACING.sm }}
        >
          Cancel
        </Button>
        <Button
          mode="contained"
          onPress={handleDocumentUpload}
          style={{ flex: 1, marginLeft: SPACING.sm }}
          icon="upload"
        >
          Select File
        </Button>
      </View>
    </View>
  </Modal>
</Portal>

      {/* Session Modal */}
      <Portal>
        <Modal
          visible={sessionModalVisible}
          onDismiss={() => setSessionModalVisible(false)}
          contentContainerStyle={styles.modalContent}
        >
          {selectedSession && (
            <View>
              <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md }]}>
                {selectedSession.title}
              </Text>
              <Text style={[TEXT_STYLES.body1, { marginBottom: SPACING.lg }]}>
                Detailed session information would go here...
              </Text>
              <Button
                mode="contained"
                onPress={() => setSessionModalVisible(false)}
              >
                Close
              </Button>
            </View>
          )}
        </Modal>
      </Portal>

      {/* Tab-specific Floating Action Button */}
      {renderTabSpecificFAB()}
    </View>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  header: {
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  headerGradient: {
    paddingTop: StatusBar.currentHeight + SPACING.md,
    paddingBottom: SPACING.lg,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.xs,
  },
  headerInfo: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  headerActions: {
    flexDirection: 'row',
  },
  headerProgress: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
  },
  tabContainer: {
    elevation: 2,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginHorizontal: SPACING.xs,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    marginLeft: SPACING.xs,
    fontSize: 12,
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  sectionCard: {
    marginBottom: SPACING.md,
    elevation: 2,
  },
  statsCard: {
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    elevation: 2,
    borderRadius: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginTop: SPACING.xs,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs / 2,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tagChip: {
    marginRight: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  scheduleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayChip: {
    marginRight: SPACING.xs,
    marginBottom: SPACING.xs,
    height: 24,
  },
  creatorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  creatorDetails: {
    marginLeft: SPACING.md,
  },
  sessionCard: {
    marginBottom: SPACING.md,
    elevation: 2,
  },
  sessionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  exerciseItem: {
    marginLeft: SPACING.md,
    marginBottom: SPACING.xs,
    color: COLORS.textSecondary,
  },
  noteItem: {
    marginLeft: SPACING.md,
    marginBottom: SPACING.xs,
    fontStyle: 'italic',
    color: COLORS.textSecondary,
  },
  sessionActions: {
    flexDirection: 'row',
    marginTop: SPACING.md,
    justifyContent: 'flex-end',
  },
  progressCard: {
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    elevation: 2,
    borderRadius: 12,
    alignItems: 'center',
  },
  progressCircle: {
    alignItems: 'center',
    marginVertical: SPACING.lg,
  },
  progressBar: {
    width: '100%',
    height: 8,
    borderRadius: 4,
    marginVertical: SPACING.md,
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: SPACING.md,
  },
  progressStat: {
    alignItems: 'center',
  },
  progressNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  progressLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  nutritionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surface,
  },
  analyticsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  analyticsCard: {
    width: '48%',
    padding: SPACING.md,
    alignItems: 'center',
    marginBottom: SPACING.md,
    elevation: 1,
    borderRadius: 8,
  },
  analyticsNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: SPACING.sm,
  },
  analyticsLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  emptyState: {
    padding: SPACING.xl,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 300,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.md,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
  modalContent: {
    backgroundColor: 'white',
    padding: SPACING.lg,
    margin: SPACING.lg,
    borderRadius: 12,
  },
    documentCard: {
    marginBottom: SPACING.md,
    elevation: 2,
  },
  documentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  documentIconContainer: {
    marginRight: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  documentInfo: {
    flex: 1,
  },
  documentActions: {
    flexDirection: 'row',
  },
  documentContainer: {
  position: 'relative',
},
favoriteContainer: {
  position: 'absolute',
  top: -8,
  left: -8,
  zIndex: 2,
},
favoriteIcon: {
  margin: 0,
  width: 32,
  height: 32,
},
pinContainer: {
  position: 'absolute',
  top: -8,
  right: -8,
  zIndex: 2,
},
pinIcon: {
  margin: 0,
  width: 30,
  height: 30,
},
deleteContainer: {
  position: 'absolute',
  bottom: -8,
  right: -8,
  zIndex: 2,
},
deleteIcon: {
  margin: 0,
  width: 32,
  height: 32,
},
disabledIcon: {
  opacity: 0.3,
},
clearAllSection: {
  marginBottom: SPACING.md,
  alignItems: 'center',
},
clearAllButton: {
  borderColor: '#F44336',
},
pinnedDocumentCard: {
  borderLeftWidth: 4,
  borderLeftColor: '#4CAF50',
},
favoritesBadges: {
  flexDirection: 'row',
  flexWrap: 'wrap',
},
documentInfoSection: {
  marginHorizontal: SPACING.md,
  marginVertical: SPACING.sm,
  borderRadius: 8,
  elevation: 1,
},
documentInfoContainer: {
  padding: SPACING.md,
},
documentInfoHeader: {
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: SPACING.sm,
},
documentInfoContent: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingVertical: SPACING.xs,
},
documentNameContainer: {
  flex: 1,
  marginRight: SPACING.sm,
},
documentsRedirect: {
  alignItems: 'center',
  padding: SPACING.xl,
  backgroundColor: COLORS.surface,
  borderRadius: 12,
  margin: SPACING.md,
},
favoritesRedirect: {
  alignItems: 'center',
  padding: SPACING.xl,
  backgroundColor: COLORS.surface,
  borderRadius: 12,
  margin: SPACING.md,
},
libraryButton: {
  marginTop: SPACING.md,
  minWidth: 200,
},
libraryPreview: {
  width: '100%',
  padding: SPACING.md,
  marginTop: SPACING.lg,
  borderRadius: 8,
  elevation: 1,
},
featuresList: {
  alignItems: 'flex-start',
},
featureItem: {
  ...TEXT_STYLES.body2,
  color: COLORS.textSecondary,
  marginBottom: SPACING.xs,
},
documentsHeader: {
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: SPACING.md,
  paddingHorizontal: SPACING.sm,
},
statusBadges: {
  flexDirection: 'row',
  marginTop: SPACING.xs,
  gap: SPACING.xs,
  flexWrap: 'wrap',
},
pinnedBadge: {
  backgroundColor: '#2196F3' + '20',
},
favoriteBadge: {
  backgroundColor: '#4CAF50' + '20',
},
badgeText: {
  fontSize: 10,
  fontWeight: 'bold',
},
documentActionsRow: {
  flexDirection: 'row',
  justifyContent: 'flex-end',
  alignItems: 'center',
  gap: SPACING.xs,
  marginTop: SPACING.sm,
},
actionButton: {
  padding: SPACING.xs,
  borderRadius: 20,
  backgroundColor: 'rgba(0,0,0,0.05)',
},
disabledAction: {
  opacity: 0.3,
},
pinnedCard: {
  borderLeftWidth: 4,
  borderLeftColor: '#2196F3',
  backgroundColor: '#E3F2FD',
},
favoriteCard: {
  backgroundColor: '#E8F5E8',
},
pinnedFavoriteCard: {
  borderLeftWidth: 4,
  borderLeftColor: '#2196F3',
  backgroundColor: '#E8F5E8',
},
weekSessionCard: {
  marginBottom: SPACING.md,
  borderRadius: 12,
  elevation: 2,
},
weekSessionHeader: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
},
weekSessionActions: {
  flexDirection: 'row',
  alignItems: 'center',
},
dailySessionItem: {
  backgroundColor: COLORS.surface,
  borderRadius: 8,
  padding: SPACING.md,
  marginBottom: SPACING.sm,
  borderLeftWidth: 3,
  borderLeftColor: COLORS.primary,
},
dailySessionHeader: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
},
sessionMetaInfo: {
  flexDirection: 'row',
  alignItems: 'center',
  marginTop: 4,
},
sessionActions: {
  flexDirection: 'row',
  alignItems: 'center',
},
sessionsHeader: {
  marginBottom: SPACING.md,
  paddingHorizontal: SPACING.sm,
},
aiStatusCard: {
  marginBottom: SPACING.md,
  padding: SPACING.md,
  elevation: 2,
  borderRadius: 12,
  backgroundColor: '#F3E5F5',
},
aiStatusHeader: {
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: SPACING.sm,
},
aiInsights: {
  marginVertical: SPACING.sm,
},
aiScheduleCard: {
  marginBottom: SPACING.md,
  borderLeftWidth: 4,
  borderLeftColor: '#2196F3',
  elevation: 2,
},
aiScheduleHeader: {
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: SPACING.sm,
},
schedulePreview: {
  flexDirection: 'row',
  justifyContent: 'space-around',
  marginVertical: SPACING.sm,
},
scheduleItem: {
  alignItems: 'center',
  padding: SPACING.xs,
  backgroundColor: 'rgba(33, 150, 243, 0.1)',
  borderRadius: 8,
  minWidth: 80,
},
};

export default TrainingPlanDetails;