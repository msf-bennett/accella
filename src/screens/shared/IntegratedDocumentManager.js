//src/screens/coach/training/IntegratedDocumentManager.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { 
  Card, 
  Button, 
  ProgressBar, 
  Surface, 
  IconButton, 
  Chip,
  FAB,
  Portal,
  Modal,
  Searchbar,
  Snackbar
} from 'react-native-paper';
import DocumentProcessor from '../../services/DocumentProcessor';
import PlatformUtils from '../../utils/PlatformUtils';
import { COLORS, SPACING, TEXT_STYLES } from '../../styles/themes';

// Helper functions
const getFileIcon = (type) => {
  switch(type) {
    case 'application/pdf': return '📄';
    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': return '📝';
    case 'application/vnd.ms-excel':
    case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': return '📊';
    case 'text/csv': return '📈';
    case 'text/plain': return '📄';
    default: return '📄';
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

const getIntegrityStatus = (document) => {
  if (!document.integrityCheck) {
    return { 
      color: '#FFA500', 
      text: 'Not Verified', 
      icon: '❓',
      needsCheck: true 
    };
  }
  
  switch (document.integrityCheck.status) {
    case 'passed':
      return { 
        color: '#4CAF50', 
        text: 'Verified', 
        icon: '✅',
        needsCheck: false 
      };
    case 'warning':
      return { 
        color: '#FF9800', 
        text: 'Warning', 
        icon: '⚠️',
        needsCheck: false 
      };
    case 'failed':
      return { 
        color: '#F44336', 
        text: 'Failed', 
        icon: '❌',
        needsCheck: true 
      };
    case 'error':
      return { 
        color: '#F44336', 
        text: 'Error', 
        icon: '❌',
        needsCheck: true 
      };
    default:
      return { 
        color: '#9E9E9E', 
        text: 'Unknown', 
        icon: '❓',
        needsCheck: true 
      };
  }
};

const IntegratedDocumentManager = ({ navigation, route }) => {
  // State management
  const [documents, setDocuments] = useState([]);
  const [filteredDocuments, setFilteredDocuments] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState('');
  const [processing, setProcessing] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('date'); // date, name, size, status
  const [filterBy, setFilterBy] = useState('all'); // all, processed, pending, verified
  const [showSortModal, setShowSortModal] = useState(false);
  const [snackbar, setSnackbar] = useState({ visible: false, message: '', type: 'info' });

  // Initialize on component mount
  useEffect(() => {
    initializeScreen();
  }, []);

  // Filter and search effect
  useEffect(() => {
    filterAndSortDocuments();
  }, [documents, searchQuery, sortBy, filterBy]);

  const initializeScreen = async () => {
    try {
      await PlatformUtils.initializePlatform();
      await loadDocuments();
      await DocumentProcessor.scheduleIntegrityMaintenance();
    } catch (error) {
      console.error('Screen initialization failed:', error);
      showSnackbar('Failed to initialize document manager', 'error');
    }
  };

  const loadDocuments = async () => {
    try {
      const docs = await DocumentProcessor.getStoredDocuments();
      setDocuments(docs);
    } catch (error) {
      console.error('Error loading documents:', error);
      showSnackbar('Failed to load documents', 'error');
    }
  };

  const filterAndSortDocuments = () => {
    let filtered = documents;

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(doc => 
        doc.originalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.type.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filter
    switch (filterBy) {
      case 'processed':
        filtered = filtered.filter(doc => doc.processed);
        break;
      case 'pending':
        filtered = filtered.filter(doc => !doc.processed);
        break;
      case 'verified':
        filtered = filtered.filter(doc => 
          doc.integrityCheck?.status === 'passed'
        );
        break;
      // 'all' - no additional filtering
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.originalName.localeCompare(b.originalName);
        case 'size':
          return b.size - a.size;
        case 'status':
          // Sort by processed status, then integrity status
          if (a.processed !== b.processed) {
            return b.processed - a.processed;
          }
          const aStatus = getIntegrityStatus(a);
          const bStatus = getIntegrityStatus(b);
          return aStatus.text.localeCompare(bStatus.text);
        case 'date':
        default:
          return new Date(b.uploadedAt) - new Date(a.uploadedAt);
      }
    });

    setFilteredDocuments(filtered);
  };

  const showSnackbar = (message, type = 'info') => {
    setSnackbar({ visible: true, message, type });
  };

  const handleUploadDocument = async () => {
    try {
      setUploading(true);
      setUploadProgress(0.1);
      setUploadStatus('Selecting document...');

      // Step 1: Select document
      const file = await DocumentProcessor.selectDocument();
      if (!file) {
        setUploading(false);
        return;
      }

      setUploadProgress(0.3);
      setUploadStatus('Validating file format...');

      // Step 2: Validate file before storage
      const validation = DocumentProcessor.validateFileForPlatform(file);
      if (!validation.isValid) {
        showValidationError(validation);
        setUploading(false);
        return;
      }

      setUploadProgress(0.6);
      setUploadStatus('Storing file and checking integrity...');

      // Step 3: Store with integrity check
      const result = await DocumentProcessor.storeDocumentWithIntegrityCheck(file);

      setUploadProgress(0.9);
      setUploadStatus('Upload complete');

      await loadDocuments();
      showSnackbar(`${file.name} uploaded successfully!`, 'success');

      // Show processing option
      handlePostUploadDialog(result.document, result.integrityResult);

    } catch (error) {
      console.error('Upload failed:', error);
      const platformError = PlatformUtils.handlePlatformError(error, 'Document Upload');
      showSnackbar(platformError.message, 'error');
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

  const handlePostUploadDialog = (document, integrityResult) => {
    const status = getIntegrityStatus({ integrityCheck: { status: integrityResult.overallStatus } });
    
    Alert.alert(
      'Document Uploaded Successfully',
      `${document.originalName}\nStatus: ${status.text}\n\nWould you like to process this document into a training plan now?`,
      [
        {
          text: 'Process Now',
          onPress: () => handleProcessDocument(document.id)
        },
        {
          text: 'Process Later',
          style: 'cancel'
        }
      ]
    );
  };

const handleProcessDocument = async (documentId) => {
  try {
    // First, get the document object to check its processing status
    const documents = await DocumentProcessor.getStoredDocuments();
    const document = documents.find(doc => doc.id === documentId);
    
    if (!document) {
      showSnackbar('Document not found', 'error');
      return;
    }

    // Check if document already has a linked training plan
    if (document.linkedTrainingPlanId) {
      const existingPlans = await DocumentProcessor.getTrainingPlans();
      const existingPlan = existingPlans.find(plan => plan.id === document.linkedTrainingPlanId);
      
      if (existingPlan) {
        Alert.alert(
          'Training Plan Already Exists',
          `A training plan "${existingPlan.title}" has already been created from this document.`,
          [
            {
              text: 'View Existing Plan',
              onPress: () => navigation.navigate('TrainingPlanDetails', { 
                planId: existingPlan.id 
              })
            },
            {
              text: 'Create New Plan',
              onPress: () => processDocumentWithProgress(documentId, true) // Force reprocess
            },
            { text: 'Cancel', style: 'cancel' }
          ]
        );
        return;
      }
    }
    
    // If no existing plan, proceed with processing
    await processDocumentWithProgress(documentId, false);
    
  } catch (error) {
    console.error('Error checking document processing status:', error);
    // Proceed with processing if check fails
    await processDocumentWithProgress(documentId, false);
  }
};

// Extract the processing logic into a separate function
const processDocumentWithProgress = async (documentId, forceReprocess = false) => {
  try {
    setProcessing(prev => ({ 
      ...prev, 
      [documentId]: { 
        progress: 0.1, 
        status: forceReprocess ? 'Starting reprocessing...' : 'Starting...' 
      } 
    }));
    
    // Simulate processing steps with progress updates
    setProcessing(prev => ({ 
      ...prev, 
      [documentId]: { progress: 0.3, status: 'Extracting content...' } 
    }));
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setProcessing(prev => ({ 
      ...prev, 
      [documentId]: { progress: 0.6, status: 'Analyzing structure...' } 
    }));
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setProcessing(prev => ({ 
      ...prev, 
      [documentId]: { 
        progress: 0.9, 
        status: forceReprocess ? 'Creating new training plan...' : 'Creating training plan...' 
      } 
    }));
    
    // Process the document with force option if needed
    const result = await DocumentProcessor.processTrainingPlan(documentId, { 
      force: forceReprocess 
    });
    
    setProcessing(prev => ({ 
      ...prev, 
      [documentId]: { progress: 1.0, status: 'Complete!' } 
    }));
    
    // Update documents list
    await loadDocuments();
    
    // Show success and navigation options
    const alertTitle = forceReprocess ? 'New Training Plan Created!' : 'Training Plan Created!';
    const alertMessage = forceReprocess 
      ? `A new version "${result.title}" has been successfully created from your document.`
      : `"${result.title}" has been successfully created from your document.`;
    
    Alert.alert(
      alertTitle,
      alertMessage,
      [
        {
          text: 'View Plan',
          onPress: () => navigation.navigate('TrainingPlanDetails', { planId: result.id })
        },
        {
          text: 'Stay Here',
          style: 'cancel'
        }
      ]
    );
    
    // Clear processing state after a delay
    setTimeout(() => {
      setProcessing(prev => {
        const newState = { ...prev };
        delete newState[documentId];
        return newState;
      });
    }, 2000);
    
  } catch (error) {
    console.error('Processing failed:', error);
    setProcessing(prev => {
      const newState = { ...prev };
      delete newState[documentId];
      return newState;
    });
    
    // Show more specific error messages
    if (error.message && error.message.includes('already exists')) {
      showSnackbar('Training plan already exists for this document', 'warning');
    } else {
      showSnackbar(`Processing failed: ${error.message}`, 'error');
    }
  }
};

  const handleViewDocument = (document) => {
    navigation.navigate('DocumentViewer', {
      document,
      planTitle: 'Training Plan Document'
    });
  };

  const handleDeleteDocument = async (document) => {
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
              await loadDocuments();
              showSnackbar('Document deleted successfully', 'success');
            } catch (error) {
              showSnackbar(`Delete failed: ${error.message}`, 'error');
            }
          }
        }
      ]
    );
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDocuments();
    setRefreshing(false);
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>📄</Text>
      <Text style={styles.emptyTitle}>No Documents Available</Text>
      <Text style={styles.emptySubtitle}>
        Upload your first coaching plan document to get started
      </Text>
      <Button
        mode="contained"
        onPress={handleUploadDocument}
        style={styles.emptyButton}
        icon="upload"
      >
        Upload Document
      </Button>
    </View>
  );

  const renderUploadingState = () => (
    <View style={styles.uploadingContainer}>
      <Card style={styles.uploadingCard}>
        <Card.Content>
          <Text style={styles.uploadingTitle}>Uploading Document</Text>
          <ProgressBar
            progress={uploadProgress}
            color={COLORS.primary}
            style={styles.uploadProgressBar}
          />
          <Text style={styles.uploadingStatus}>{uploadStatus}</Text>
          <Text style={styles.uploadingProgress}>
            {Math.round(uploadProgress * 100)}% Complete
          </Text>
        </Card.Content>
      </Card>
    </View>
  );

  const renderDocumentCard = (document) => {
    const status = getIntegrityStatus(document);
    const isProcessing = processing[document.id];

    return (
      <Card key={document.id} style={styles.documentCard}>
        <TouchableOpacity onPress={() => handleViewDocument(document)}>
          <Card.Content>
            <View style={styles.documentHeader}>
              <View style={styles.documentInfo}>
                <Text style={styles.fileIcon}>{getFileIcon(document.type)}</Text>
                <View style={styles.documentDetails}>
                  <Text style={styles.documentName} numberOfLines={1}>
                    {document.originalName}
                  </Text>
                  <Text style={styles.documentMeta}>
                    {formatFileSize(document.size)} • {formatDate(document.uploadedAt)}
                  </Text>
                </View>
              </View>
              
              <View style={styles.documentActions}>
                <IconButton
                  icon="delete-outline"
                  size={20}
                  iconColor="#F44336"
                  onPress={() => handleDeleteDocument(document)}
                />
              </View>
            </View>

            <View style={styles.documentStatus}>
              <Chip
                mode="flat"
                style={[styles.statusChip, { backgroundColor: status.color + '20' }]}
                textStyle={[styles.statusChipText, { color: status.color }]}
                icon={() => <Text>{status.icon}</Text>}
                compact
              >
                {status.text}
              </Chip>
              
              <Chip
                mode="flat"
                style={[
                  styles.processedChip,
                  { backgroundColor: document.processed ? '#4CAF50' + '20' : '#FF9800' + '20' }
                ]}
                textStyle={[
                  styles.processedChipText,
                  { color: document.processed ? '#4CAF50' : '#FF9800' }
                ]}
                compact
              >
                {document.processed ? 'Processed' : 'Pending'}
              </Chip>
            </View>

            {isProcessing && (
              <View style={styles.processingContainer}>
                <ProgressBar
                  progress={isProcessing.progress}
                  color={COLORS.primary}
                  style={styles.processingProgressBar}
                />
                <Text style={styles.processingStatus}>{isProcessing.status}</Text>
              </View>
            )}

            {!document.processed && !isProcessing && (
              <View style={styles.actionContainer}>
                <Button
                  mode="outlined"
                  compact
                  onPress={() => handleProcessDocument(document.id)}
                  style={styles.processButton}
                >
                  Process Document
                </Button>
              </View>
            )}
          </Card.Content>
        </TouchableOpacity>
      </Card>
    );
  };

  const renderSortModal = () => (
    <Portal>
      <Modal
        visible={showSortModal}
        onDismiss={() => setShowSortModal(false)}
        contentContainerStyle={styles.modalContent}
      >
        <Text style={styles.modalTitle}>Sort & Filter Documents</Text>
        
        <Text style={styles.modalSectionTitle}>Sort By:</Text>
        {['date', 'name', 'size', 'status'].map((option) => (
          <TouchableOpacity
            key={option}
            style={[
              styles.modalOption,
              sortBy === option && styles.modalOptionSelected
            ]}
            onPress={() => setSortBy(option)}
          >
            <Text style={[
              styles.modalOptionText,
              sortBy === option && styles.modalOptionTextSelected
            ]}>
              {option.charAt(0).toUpperCase() + option.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}

        <Text style={styles.modalSectionTitle}>Filter By:</Text>
        {[
          { key: 'all', label: 'All Documents' },
          { key: 'processed', label: 'Processed Only' },
          { key: 'pending', label: 'Pending Only' },
          { key: 'verified', label: 'Verified Only' }
        ].map((option) => (
          <TouchableOpacity
            key={option.key}
            style={[
              styles.modalOption,
              filterBy === option.key && styles.modalOptionSelected
            ]}
            onPress={() => setFilterBy(option.key)}
          >
            <Text style={[
              styles.modalOptionText,
              filterBy === option.key && styles.modalOptionTextSelected
            ]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}

        <Button
          mode="contained"
          onPress={() => setShowSortModal(false)}
          style={styles.modalCloseButton}
        >
          Apply
        </Button>
      </Modal>
    </Portal>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <Surface style={styles.header}>
        <Text style={styles.headerTitle}>Training Plan Documents</Text>
        <Text style={styles.headerSubtitle}>
          Upload, process, and manage your coaching documents
        </Text>
      </Surface>

      {/* Search and Controls */}
      <View style={styles.controlsContainer}>
        <Searchbar
          placeholder="Search documents..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
        />
        <View style={styles.controlButtons}>
          <IconButton
            icon="filter-variant"
            mode="contained-tonal"
            onPress={() => setShowSortModal(true)}
          />
        </View>
      </View>

      {/* Documents List */}
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
          />
        }
      >
        {uploading && renderUploadingState()}

        {!uploading && filteredDocuments.length === 0 && renderEmptyState()}

        {!uploading && filteredDocuments.length > 0 && (
          <View style={styles.documentsContainer}>
            <Text style={styles.documentsCount}>
              {filteredDocuments.length} document{filteredDocuments.length !== 1 ? 's' : ''}
              {searchQuery && ` matching "${searchQuery}"`}
            </Text>
            {filteredDocuments.map(renderDocumentCard)}
          </View>
        )}
      </ScrollView>

      {/* Floating Action Button */}
      <FAB
        icon="plus"
        label="Upload"
        onPress={handleUploadDocument}
        style={styles.fab}
        disabled={uploading}
      />

      {/* Sort/Filter Modal */}
      {renderSortModal()}

      {/* Snackbar */}
      <Portal>
        <Snackbar
          visible={snackbar.visible}
          onDismiss={() => setSnackbar(prev => ({ ...prev, visible: false }))}
          duration={3000}
          style={[
            styles.snackbar,
            snackbar.type === 'error' && styles.errorSnackbar,
            snackbar.type === 'success' && styles.successSnackbar
          ]}
        >
          {snackbar.message}
        </Snackbar>
      </Portal>
    </View>
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
    elevation: 2,
  },
  headerTitle: {
    ...TEXT_STYLES.h2,
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    ...TEXT_STYLES.body2,
    color: COLORS.textSecondary,
  },
  controlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  searchBar: {
    flex: 1,
    elevation: 2,
  },
  controlButtons: {
    flexDirection: 'row',
  },
  scrollView: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: SPACING.lg,
  },
  emptyTitle: {
    ...TEXT_STYLES.h3,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  emptySubtitle: {
    ...TEXT_STYLES.body1,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  emptyButton: {
    paddingHorizontal: SPACING.lg,
  },
  uploadingContainer: {
    padding: SPACING.md,
  },
  uploadingCard: {
    elevation: 4,
  },
  uploadingTitle: {
    ...TEXT_STYLES.h3,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  uploadProgressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: SPACING.md,
  },
  uploadingStatus: {
    ...TEXT_STYLES.body2,
    textAlign: 'center',
    color: COLORS.primary,
    marginBottom: SPACING.sm,
  },
  uploadingProgress: {
    ...TEXT_STYLES.caption,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  documentsContainer: {
    padding: SPACING.md,
  },
  documentsCount: {
    ...TEXT_STYLES.body2,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  documentCard: {
    marginBottom: SPACING.md,
    elevation: 2,
  },
  documentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  documentInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  fileIcon: {
    fontSize: 24,
    marginRight: SPACING.md,
  },
  documentDetails: {
    flex: 1,
  },
  documentName: {
    ...TEXT_STYLES.subtitle1,
    marginBottom: SPACING.xs,
  },
  documentMeta: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
  },
  documentActions: {
    flexDirection: 'row',
  },
  documentStatus: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  statusChip: {
    height: 28,
  },
  statusChipText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  processedChip: {
    height: 28,
  },
  processedChipText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  processingContainer: {
    marginTop: SPACING.sm,
  },
  processingProgressBar: {
    height: 4,
    borderRadius: 2,
    marginBottom: SPACING.xs,
  },
  processingStatus: {
    ...TEXT_STYLES.caption,
    color: COLORS.primary,
    textAlign: 'center',
  },
  actionContainer: {
    marginTop: SPACING.sm,
  },
  processButton: {
    borderColor: COLORS.primary,
  },
  fab: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: COLORS.primary,
  },
  modalContent: {
    backgroundColor: 'white',
    padding: SPACING.lg,
    margin: SPACING.lg,
    borderRadius: 8,
    maxHeight: '80%',
  },
  modalTitle: {
    ...TEXT_STYLES.h3,
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  modalSectionTitle: {
    ...TEXT_STYLES.subtitle1,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
    fontWeight: 'bold',
  },
  modalOption: {
    padding: SPACING.md,
    borderRadius: 8,
    marginBottom: SPACING.xs,
  },
  modalOptionSelected: {
    backgroundColor: COLORS.primary + '20',
  },
  modalOptionText: {
    ...TEXT_STYLES.body1,
  },
  modalOptionTextSelected: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  modalCloseButton: {
    marginTop: SPACING.lg,
  },
  snackbar: {
    marginBottom: 80,
  },
  errorSnackbar: {
    backgroundColor: '#F44336',
  },
  successSnackbar: {
    backgroundColor: '#4CAF50',
  },
});

export default IntegratedDocumentManager;