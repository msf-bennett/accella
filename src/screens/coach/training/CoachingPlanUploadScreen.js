//src/screens/coach/training/CoachingPlanUploadScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { Card, Button, ProgressBar, Surface, IconButton, Chip } from 'react-native-paper';
import DocumentProcessor from '../../../services/DocumentProcessor';
import PlatformUtils from '../../../utils/PlatformUtils';
import { COLORS, SPACING, TEXT_STYLES } from '../../../styles/themes';

// Load platform-safe components
const MaterialIcons = PlatformUtils.getSafeComponent('MaterialIcons');
const LinearGradient = PlatformUtils.getSafeComponent('LinearGradient');

// Move helper functions outside the component
const getFileIcon = (type) => {
  switch(type) {
    case 'application/pdf': return 'picture-as-pdf';
    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': return 'description';
    case 'application/vnd.ms-excel':
    case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': return 'grid-on';
    case 'text/csv': return 'table-chart';
    default: return 'insert-drive-file';
  }
};

const formatFileSize = (bytes) => {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString();
};

// Get integrity status display info
const getIntegrityStatus = (document) => {
  if (!document.integrityCheck) {
    return { 
      color: '#FFA500', 
      text: 'Not Verified', 
      icon: 'help-outline',
      needsCheck: true 
    };
  }
  
  switch (document.integrityCheck.status) {
    case 'passed':
      return { 
        color: '#4CAF50', 
        text: 'Verified', 
        icon: 'verified',
        needsCheck: false 
      };
    case 'warning':
      return { 
        color: '#FF9800', 
        text: 'Warning', 
        icon: 'warning',
        needsCheck: false 
      };
    case 'failed':
      return { 
        color: '#F44336', 
        text: 'Failed', 
        icon: 'error',
        needsCheck: true 
      };
    case 'error':
      return { 
        color: '#F44336', 
        text: 'Error', 
        icon: 'error',
        needsCheck: true 
      };
    default:
      return { 
        color: '#9E9E9E', 
        text: 'Unknown', 
        icon: 'help-outline',
        needsCheck: true 
      };
  }
};

const CoachingPlanUploadScreen = ({ navigation }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState('');
  const [documents, setDocuments] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [platformReady, setPlatformReady] = useState(false);
  const [integrityResult, setIntegrityResult] = useState(null);
  const [showDocuments, setShowDocuments] = useState(true);
  const [clearedDocuments, setClearedDocuments] = useState(new Set());
  const [allStoredDocuments, setAllStoredDocuments] = useState([]);

  
  useEffect(() => {
    initializePlatform();
  }, []);

  useEffect(() => {
    if (platformReady) {
      loadDocuments();
    }
  }, [clearedDocuments, platformReady]);

  const initializePlatform = async () => {
    try {
      await PlatformUtils.initializePlatform();
      setPlatformReady(true);
      loadDocuments();
      
      // Run automatic maintenance check if available
      try {
        if (typeof DocumentProcessor.scheduleIntegrityMaintenance === 'function') {
          await DocumentProcessor.scheduleIntegrityMaintenance();
        } else {
          console.log('Integrity maintenance not available');
        }
      } catch (maintenanceError) {
        console.warn('Integrity maintenance failed:', maintenanceError.message);
        // Don't fail initialization for maintenance issues
      }
    } catch (error) {
      console.error('Platform initialization failed:', error);
      setPlatformReady(true); // Continue anyway with fallbacks
      loadDocuments();
    }
  };

const loadDocuments = async () => {
  try {
    console.log('Loading documents from storage...');
    const docs = await DocumentProcessor.getStoredDocuments();
    
    // Store all documents for reference
    setAllStoredDocuments(docs);
    
    // Filter out cleared documents for display
    const filteredDocs = docs.filter(doc => !clearedDocuments.has(doc.id));
    
    console.log('Documents loaded:', {
      count: filteredDocs.length,
      total: docs.length,
      cleared: docs.length - filteredDocs.length
    });
    
    setDocuments(filteredDocs);
  } catch (error) {
    console.error('Error loading documents:', error);
    const platformError = PlatformUtils.handlePlatformError(error, 'Document Loading');
    Alert.alert('Error', platformError.message);
  }
};

// In CoachingPlanUploadScreen.js, update the handleDocumentUpload method
const handleDocumentUpload = async () => {
  try {
    setUploading(true);
    setUploadProgress(0.1);
    setUploadStatus('Opening file selector...');
    setIntegrityResult(null);

    console.log('Starting enhanced document upload process...');

    // Step 1: Select document
    const file = await DocumentProcessor.selectDocument();
    console.log('File selection result:', file ? 'File selected' : 'No file selected');
    
    if (!file) {
      setUploading(false);
      setUploadStatus('Selection cancelled');
      return;
    }

    setUploadProgress(0.3);
    setUploadStatus('Analyzing document structure...');

    // Step 2: Validate file before storage
    const validation = DocumentProcessor.validateFileForPlatform(file);
    console.log('File validation result:', validation);
    
    if (!validation.isValid) {
      console.error('File validation failed:', validation.errors);
      showValidationError(validation);
      setUploading(false);
      return;
    }

    setUploadProgress(0.5);
    setUploadStatus('Storing file and analyzing structure...');

    console.log('About to store document with enhanced analysis...');

    // Step 3: Store with integrity check
    const result = await DocumentProcessor.storeDocumentWithIntegrityCheck(file);
    console.log('Storage completed, analyzing document structure...');

    setUploadProgress(0.7);
    setUploadStatus('Performing deep structure analysis...');

    // NEW Step 4: Analyze document structure immediately
    let structureAnalysis = null;
    try {
      const extractionResult = await DocumentProcessor.extractDocumentText(result.document);
      structureAnalysis = await DocumentProcessor.analyzeDocumentStructure(extractionResult.text, result.document);
      console.log('Document structure analysis completed:', structureAnalysis);
    } catch (error) {
      console.warn('Structure analysis failed:', error);
    }

    await loadDocuments();
    setIntegrityResult(result.integrityResult);

    setUploadProgress(0.9);
    setUploadStatus('Structure analysis complete');

    console.log('About to navigate to processing with structure insights...');

    // Generate enhanced academy preview with structure insights
    let academyPreview = null;
    try {
      academyPreview = await DocumentProcessor.previewAcademyInfo(result.document);
      if (structureAnalysis) {
        academyPreview.structureInsights = {
          organizationLevel: structureAnalysis.organizationLevel.level,
          totalWeeks: structureAnalysis.weekStructure.totalWeeks,
          totalDays: structureAnalysis.dayStructure.totalDays,
          hasDurations: structureAnalysis.durationAnalysis.hasDurationInfo,
          confidence: structureAnalysis.confidence
        };
      }
    } catch (error) {
      console.warn('Could not generate enhanced academy preview:', error);
    }

    // Step 5: Navigate to processing with structure insights
    navigation.navigate('PlanProcessing', {
      documentId: result.document.id,
      academyPreview: academyPreview,
      structureAnalysis: structureAnalysis, // NEW: Pass structure analysis
      onComplete: (trainingPlan) => {
        navigation.navigate('TrainingPlanLibrary', {
          newPlanId: trainingPlan?.id,
          showSuccess: true,
          message: `"${academyPreview?.academyName || trainingPlan?.title || 'Training Plan'}" created successfully with enhanced AI analysis!`
        });
      }
    });

  } catch (error) {
    console.error('Enhanced upload failed with error:', error);
    const platformError = PlatformUtils.handlePlatformError(error, 'Enhanced Document Upload');
    showUploadError(platformError);
  } finally {
    setUploading(false);
    setUploadProgress(0);
    setUploadStatus('');
  }
};

  const showValidationError = (validation) => {
    Alert.alert(
      'File Validation Failed',
      `${validation.errors.join('\n')}\n\nSuggestions:\n${validation.suggestions.join('\n')}`,
      [{ text: 'OK' }]
    );
  };

  const showUploadError = (error) => {
    Alert.alert(
      'Upload Failed',
      `${error.message}\n\n${error.suggestions?.join('\n') || 'Please try again.'}`,
      [
        { text: 'Retry', onPress: () => handleDocumentUpload() },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

const handleClearUploadedPlans = () => {
  Alert.alert(
    'Clear Upload History',
    'This will clear the uploaded plans from this screen but keep them in storage. You can still access them from the Document Library.',
    [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear History',
        style: 'default',
        onPress: () => {
          console.log('Clearing documents:', documents.map(doc => doc.id));
          // Mark all currently visible documents as cleared
          const documentIds = documents.map(doc => doc.id);
          const newClearedSet = new Set([...clearedDocuments, ...documentIds]);
          console.log('New cleared documents:', Array.from(newClearedSet));
          setClearedDocuments(newClearedSet);
        }
      }
    ]
  );
};

const handleRestoreDocuments = () => {
  const clearedCount = clearedDocuments.size;
  
  Alert.alert(
    'Restore Upload History',
    `This will restore ${clearedCount} previously cleared document${clearedCount !== 1 ? 's' : ''} to the upload history.`,
    [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Restore All',
        style: 'default',
        onPress: () => {
          console.log('Restoring all cleared documents');
          setClearedDocuments(new Set()); // Clear the cleared documents set
        }
      }
    ]
  );
};

  const handleRestoreView = () => {
    setShowDocuments(true);
  };

  const runIntegrityCheck = async (document) => {
    try {
      Alert.alert('Checking...', 'Running integrity check on document.');
      const result = await DocumentProcessor.verifyFileIntegrity(document);
      
      const status = getIntegrityStatus({ integrityCheck: { status: result.overallStatus } });
      
      Alert.alert(
        'Integrity Check Complete',
        `Status: ${status.text}\n\n${result.recommendations.join('\n')}`,
        [{ text: 'OK' }]
      );
      
      await loadDocuments();
    } catch (error) {
      Alert.alert('Check Failed', `Integrity check failed: ${error.message}`);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDocuments();
    setRefreshing(false);
  };

  // Safe Icon component that works on both platforms
  const SafeIcon = ({ name, size = 24, color = COLORS.primary, style }) => {
    if (MaterialIcons) {
      return <MaterialIcons name={name} size={size} color={color} style={style} />;
    }
    const iconMap = {
      'cloud-upload': '☁️',
      'picture-as-pdf': '📄',
      'description': '📝',
      'grid-on': '📊',
      'table-chart': '📈',
      'insert-drive-file': '📄',
      'arrow-right': '→',
      'upload': '⬆️',
      'verified': '✓',
      'warning': '⚠',
      'error': '✗',
      'help-outline': '?',
      'security': '🔒',
      'clear-all': '🗑️',
      'folder-open': '📂',
      'refresh': '🔄',
      'restore': '↩️'
    };
    return (
      <Text style={[{ fontSize: size, color }, style]}>
        {iconMap[name] || '📄'}
      </Text>
    );
  };

  // Safe Gradient component that works on both platforms
  const SafeGradient = ({ colors = ['#667eea', '#764ba2'], style, children }) => {
    if (LinearGradient) {
      return <LinearGradient colors={colors} style={style}>{children}</LinearGradient>;
    }
    return (
      <View style={[{ backgroundColor: colors[0] }, style]}>
        {children}
      </View>
    );
  };

  // Document integrity status component
  const IntegrityStatusChip = ({ document }) => {
    const status = getIntegrityStatus(document);
    
    return (
      <View style={styles.integrityContainer}>
        <Chip
          icon={() => <SafeIcon name={status.icon} size={16} color="white" />}
          style={[styles.integrityChip, { backgroundColor: status.color }]}
          textStyle={styles.integrityChipText}
          compact
        >
          {status.text}
        </Chip>
        {status.needsCheck && (
          <Button
            mode="text"
            compact
            onPress={() => runIntegrityCheck(document)}
            style={styles.checkButton}
          >
            Check
          </Button>
        )}
      </View>
    );
  };

  if (!platformReady) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text>Initializing platform...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[COLORS.primary]}
        />
      }
    >
      {/* Header */}
      <SafeGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <Text style={styles.headerText}>Upload Coaching Plans</Text>
        <Text style={styles.headerSubtext}>
          Upload and verify your training plan documents with integrity checking
        </Text>
      </SafeGradient>

      {/* Upload Section */}
      <Surface style={styles.uploadSection}>
        <SafeIcon name="cloud-upload" size={48} color={COLORS.primary} />
        <Text style={styles.uploadTitle}>Select Your Coaching Plan</Text>
        <Text style={styles.uploadSubtitle}>
          {PlatformUtils.isWeb() 
            ? 'Supported formats: PDF, Word, Excel, CSV, TXT (Max 5MB)'
            : 'Supported formats: PDF, Word, Excel, CSV (Max 10MB)'
          }
        </Text>
        
        {PlatformUtils.isWeb() && (
          <Text style={styles.webNotice}>
            Web Platform: Click "Choose File" and select your document when the browser dialog opens.
            The dialog may take a moment to appear.
          </Text>
        )}

        <Button
          mode="contained"
          onPress={handleDocumentUpload}
          disabled={uploading}
          style={styles.uploadButton}
          icon="upload"
        >
          {uploading 
            ? uploadStatus || PlatformUtils.getLoadingMessage('fileSelection')
            : 'Choose File'
          }
        </Button>

        {uploading && (
          <View style={styles.progressContainer}>
            <ProgressBar
              progress={uploadProgress}
              color={COLORS.primary}
              style={styles.progressBar}
            />
            <Text style={styles.progressText}>
              {Math.round(uploadProgress * 100)}% Complete
            </Text>
            {uploadStatus && (
              <Text style={styles.statusText}>{uploadStatus}</Text>
            )}
          </View>
        )}

        {integrityResult && !uploading && (
          <View style={styles.integrityResultContainer}>
            <SafeIcon name="security" size={24} color={COLORS.primary} />
            <Text style={styles.integrityResultText}>
              Integrity Status: {integrityResult.overallStatus}
            </Text>
          </View>
        )}
      </Surface>

      {/* Platform Info */}
      {PlatformUtils.isWeb() && (
        <Surface style={[styles.uploadSection, { marginTop: 0, paddingTop: SPACING.md }]}>
          <Text style={styles.platformNotice}>
            Web Platform: File integrity checking available. Some features may be limited.
          </Text>
        </Surface>
      )}

      {/* Documents List */}
      {documents.length > 0 && showDocuments && (
        <View style={styles.documentsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Uploaded Plans</Text>
            <View style={styles.actionButtonsContainer}>
              {/* Restore Button - always show but disabled when no cleared documents */}
              <TouchableOpacity 
                onPress={clearedDocuments.size > 0 ? handleRestoreDocuments : null}
                style={[
                  styles.restoreAllButton, 
                  clearedDocuments.size === 0 && styles.disabledButton
                ]}
                disabled={clearedDocuments.size === 0}
              >
                <Card style={[
                  styles.restoreAllCard,
                  clearedDocuments.size === 0 && styles.disabledCard
                ]}>
                  <Card.Content style={styles.actionButtonContent}>
                    <SafeIcon 
                      name="restore" 
                      size={16} 
                      color={clearedDocuments.size > 0 ? "#2196F3" : "#BDBDBD"} 
                    />
                    <Text style={[
                      styles.restoreAllText,
                      clearedDocuments.size === 0 && styles.disabledText
                    ]}>
                      Restore {clearedDocuments.size > 0 ? `(${clearedDocuments.size})` : ''}
                    </Text>
                  </Card.Content>
                </Card>
              </TouchableOpacity>
              
              {/* Clear All Button - enabled when there are visible documents */}
              <TouchableOpacity 
                onPress={handleClearUploadedPlans}
                style={[
                  styles.clearAllButton,
                  documents.length === 0 && styles.disabledButton
                ]}
                disabled={documents.length === 0}
              >
                <Card style={[
                  styles.clearAllCard,
                  documents.length === 0 && styles.disabledCard
                ]}>
                  <Card.Content style={styles.actionButtonContent}>
                    <SafeIcon 
                      name="clear-all" 
                      size={16} 
                      color={documents.length > 0 ? "#F44336" : "#BDBDBD"} 
                    />
                    <Text style={[
                      styles.clearAllText,
                      documents.length === 0 && styles.disabledText
                    ]}>
                      Clear All {documents.length > 0 ? `(${documents.length})` : ''}
                    </Text>
                  </Card.Content>
                </Card>
              </TouchableOpacity>
            </View>
          </View>
          
          {documents.map((doc) => (
            <Card key={doc.id} style={styles.documentCard}>
              <Card.Content>
                <View style={styles.documentInfo}>
                  <SafeIcon 
                    name={getFileIcon(doc.type)} 
                    size={24} 
                    color={COLORS.primary} 
                  />
                  <View style={styles.documentDetails}>
                    <Text style={styles.documentName}>{doc.originalName}</Text>
                    <Text style={styles.documentMeta}>
                      {formatFileSize(doc.size)} • {formatDate(doc.uploadedAt)}
                    </Text>
                    <Text style={styles.documentStatus}>
                      {doc.processed ? 'Processed' : 'Pending Processing'}
                    </Text>
                    <View style={styles.documentMetadata}>
                      {doc.platform && (
                        <Text style={styles.platformTag}>
                          {doc.platform === 'web' ? 'Web' : 'Mobile'}
                        </Text>
                      )}
                      <IntegrityStatusChip document={doc} />
                    </View>
                    {doc.integrityCheck && (
                      <Text style={styles.integrityDate}>
                        Last checked: {formatDate(doc.integrityCheck.timestamp)}
                      </Text>
                    )}
                  </View>
                  <IconButton
                    icon="arrow-right"
                    size={20}
                    onPress={() => navigation.navigate('PlanProcessing', { documentId: doc.id })}
                  />
                </View>
              </Card.Content>
            </Card>
          ))}
        </View>
      )}

      {/* Show empty state or cleared documents info */}
      {documents.length === 0 && (
        <View style={styles.documentsSection}>
          {clearedDocuments.size > 0 ? (
            // Show cleared documents info
            <View style={styles.restoreContainer}>
              <SafeIcon name="folder-open" size={48} color={COLORS.secondary} />
              <Text style={styles.restoreText}>All uploaded plans cleared</Text>
              <Text style={styles.restoreSubtext}>
                {clearedDocuments.size} document{clearedDocuments.size !== 1 ? 's' : ''} cleared from view
              </Text>
              <TouchableOpacity 
                onPress={handleRestoreDocuments}
                style={styles.restoreButtonContainer}
              >
                <Card style={styles.restoreCard}>
                  <Card.Content style={styles.restoreCardContent}>
                    <SafeIcon name="restore" size={20} color="#2196F3" />
                    <Text style={styles.restoreCardText}>
                      Restore All Documents
                    </Text>
                  </Card.Content>
                </Card>
              </TouchableOpacity>
            </View>
          ) : !uploading ? (
            // Show empty state
            <View style={styles.emptyState}>
              <SafeIcon name="description" size={64} color={COLORS.secondary} />
              <Text style={styles.emptyText}>No coaching plans uploaded yet</Text>
              <Text style={styles.emptySubtext}>
                Upload your first training plan with automatic integrity verification
              </Text>
            </View>
          ) : null}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: SPACING.lg,
    paddingTop: SPACING.xl,
  },
  headerText: {
    ...TEXT_STYLES.h1,
    color: 'white',
    marginBottom: SPACING.xs,
  },
  headerSubtext: {
    ...TEXT_STYLES.body,
    color: 'rgba(255,255,255,0.9)',
  },
  uploadSection: {
    margin: SPACING.md,
    padding: SPACING.lg,
    alignItems: 'center',
    elevation: 2,
    ...PlatformUtils.getPlatformStyles(),
  },
  uploadTitle: {
    ...TEXT_STYLES.h3,
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
  },
  uploadSubtitle: {
    ...TEXT_STYLES.caption,
    textAlign: 'center',
    marginBottom: SPACING.lg,
    color: COLORS.secondary,
  },
  uploadButton: {
    paddingHorizontal: SPACING.lg,
  },
  progressContainer: {
    width: '100%',
    marginTop: SPACING.md,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  progressText: {
    ...TEXT_STYLES.caption,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  statusText: {
    ...TEXT_STYLES.caption,
    textAlign: 'center',
    marginTop: SPACING.xs,
    color: COLORS.primary,
    fontStyle: 'italic',
  },
  integrityResultContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.md,
    padding: SPACING.sm,
    backgroundColor: COLORS.surfaceVariant || '#f5f5f5',
    borderRadius: 8,
  },
  integrityResultText: {
    ...TEXT_STYLES.caption,
    marginLeft: SPACING.sm,
    fontWeight: 'bold',
  },
  platformNotice: {
    ...TEXT_STYLES.caption,
    textAlign: 'center',
    color: COLORS.secondary,
    fontStyle: 'italic',
  },
  webNotice: {
    ...TEXT_STYLES.caption,
    textAlign: 'center',
    marginBottom: SPACING.md,
    color: COLORS.primary,
    fontStyle: 'italic',
    backgroundColor: COLORS.surfaceVariant || '#f0f8ff',
    padding: SPACING.sm,
    borderRadius: 4,
  },
  documentsSection: {
    padding: SPACING.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    ...TEXT_STYLES.h3,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  clearAllButton: {
    // No additional styles needed, TouchableOpacity handles the press
  },
  restoreAllButton: {
    // No additional styles needed, TouchableOpacity handles the press
  },
  disabledButton: {
    opacity: 0.6,
  },
  actionButtonContent: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearAllCard: {
    backgroundColor: '#FFEBEE', // Light red background
    borderColor: '#F44336',
    borderWidth: 1,
    minWidth: 100,
  },
  restoreAllCard: {
    backgroundColor: '#E3F2FD', // Light blue background
    borderColor: '#2196F3',
    borderWidth: 1,
    minWidth: 100,
  },
  disabledCard: {
    backgroundColor: '#F5F5F5', // Light gray background for disabled
    borderColor: '#BDBDBD', // Gray border for disabled
  },
  clearAllText: {
    ...TEXT_STYLES.caption,
    color: '#F44336',
    fontWeight: 'bold',
    marginLeft: SPACING.xs,
    fontSize: 12,
  },
  restoreAllText: {
    ...TEXT_STYLES.caption,
    color: '#2196F3',
    fontWeight: 'bold',
    marginLeft: SPACING.xs,
    fontSize: 12,
  },
  disabledText: {
    color: '#BDBDBD', // Gray text for disabled state
  },
  documentCard: {
    marginBottom: SPACING.md,
    ...PlatformUtils.getPlatformStyles(),
  },
  documentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  documentDetails: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  documentName: {
    ...TEXT_STYLES.subtitle,
    marginBottom: SPACING.xs,
  },
  documentMeta: {
    ...TEXT_STYLES.caption,
    color: COLORS.secondary,
  },
  documentStatus: {
    ...TEXT_STYLES.caption,
    marginTop: SPACING.xs,
  },
  documentMetadata: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs,
    gap: SPACING.sm,
  },
  platformTag: {
    ...TEXT_STYLES.caption,
    fontSize: 10,
    color: COLORS.secondary,
    backgroundColor: COLORS.surfaceVariant || '#f5f5f5',
    paddingHorizontal: SPACING.xs,
    paddingVertical: SPACING.xs / 2,
    borderRadius: 4,
  },
  integrityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  integrityChip: {
    height: 24,
  },
  integrityChipText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  checkButton: {
    marginLeft: SPACING.xs,
  },
  integrityDate: {
    ...TEXT_STYLES.caption,
    fontSize: 10,
    color: COLORS.secondary,
    marginTop: SPACING.xs / 2,
  },
  restoreContainer: {
    alignItems: 'center',
    padding: SPACING.xl,
    backgroundColor: COLORS.surfaceVariant || '#f5f5f5',
    borderRadius: 12,
    margin: SPACING.md,
  },
  restoreText: {
    ...TEXT_STYLES.subtitle,
    marginTop: SPACING.md,
    color: COLORS.secondary,
  },
  restoreSubtext: {
    ...TEXT_STYLES.caption,
    color: COLORS.secondary,
    textAlign: 'center',
    marginTop: SPACING.xs,
    marginBottom: SPACING.lg,
  },
  restoreButtonContainer: {
    // Container for the restore button
  },
  restoreCard: {
    backgroundColor: '#E3F2FD',
    borderColor: '#2196F3',
    borderWidth: 2,
    elevation: 2,
  },
  restoreCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  restoreCardText: {
    ...TEXT_STYLES.body,
    color: '#2196F3',
    fontWeight: 'bold',
    marginLeft: SPACING.sm,
  },
  emptyState: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  emptyText: {
    ...TEXT_STYLES.h3,
    marginTop: SPACING.md,
    color: COLORS.secondary,
  },
  emptySubtext: {
    ...TEXT_STYLES.body,
    color: COLORS.secondary,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
});

export default CoachingPlanUploadScreen;
