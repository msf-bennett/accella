//src/screens/shared/DocumentLibrary.js
import React, { useState, useEffect } from 'react';
import {
  View,
  FlatList,
  StatusBar,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Alert,
} from 'react-native';
import {
  Surface,
  IconButton,
  Text,
  Card,
  Chip,
  Portal,
  Modal,
  Button,
  FAB,
  Divider,
  RadioButton,
  Snackbar,
} from 'react-native-paper';
import { LinearGradient } from '../../components/shared/LinearGradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS, SPACING, TEXT_STYLES } from '../../styles/themes';
import DocumentProcessor from '../../services/DocumentProcessor';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DocumentLibrary = ({ navigation, route }) => {
  const { onDocumentChange, highlightDocument, showFavorites } = route?.params || {};
  const [documents, setDocuments] = useState([]);
  const [filteredDocuments, setFilteredDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [sortModalVisible, setSortModalVisible] = useState(false);
  const [customizeModalVisible, setCustomizeModalVisible] = useState(false);
  const [sortOption, setSortOption] = useState('recent');
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedDocumentForDelete, setSelectedDocumentForDelete] = useState(null);

  // Tab definitions
    const tabs = [
    { key: 'all', label: 'All', icon: 'list' },
    { key: 'sort', label: 'Sort', icon: 'sort', action: 'sort' },
    { key: 'recent', label: 'Recent', icon: 'history' },
    { 
        key: 'favorites', 
        label: 'Favorites', 
        icon: 'favorite',
        count: documents.filter(doc => doc.isFavorite).length
    },
    { key: 'clear', label: 'Clear All', icon: 'clear-all', action: 'clear' },
    { key: 'customize', label: '+', icon: 'add', action: 'customize' },
    ];

  // Sort options
  const sortOptions = [
    { key: 'recent', label: 'Most Recent', icon: 'access-time' },
    { key: 'az', label: 'A-Z (Name)', icon: 'sort-by-alpha' },
    { key: 'za', label: 'Z-A (Name)', icon: 'sort-by-alpha' },
    { key: 'size-desc', label: 'Largest First', icon: 'trending-up' },
    { key: 'size-asc', label: 'Smallest First', icon: 'trending-down' },
    { key: 'type', label: 'By File Type', icon: 'category' },
  ];

  useEffect(() => {
    loadDocuments();
    loadRecentlyViewed();
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
  }, [documents, activeTab, sortOption]);

  const loadDocuments = async () => {
    try {
      const docs = await DocumentProcessor.getStoredDocuments();
      setDocuments(docs);
    } catch (error) {
      console.error('Error loading documents:', error);
      showSnackbar('Error loading documents');
    } finally {
      setLoading(false);
    }
  };

  const loadRecentlyViewed = async () => {
    try {
      const recent = await AsyncStorage.getItem('documentViewingHistory');
      if (recent) {
        setRecentlyViewed(JSON.parse(recent));
      }
    } catch (error) {
      console.error('Error loading recent documents:', error);
    }
  };

  const applyFiltersAndSort = () => {
    let filtered = [...documents];

    // Apply tab filters
    switch (activeTab) {
      case 'favorites':
        filtered = filtered.filter(doc => doc.isFavorite);
        break;
      case 'recent':
        // Show recently viewed documents first
        const recentDocIds = recentlyViewed.map(r => r.documentId);
        filtered = filtered.filter(doc => recentDocIds.includes(doc.id));
        break;
      case 'all':
      default:
        // Show all documents
        break;
    }

    // Apply sorting
    switch (sortOption) {
      case 'az':
        filtered.sort((a, b) => a.originalName.localeCompare(b.originalName));
        break;
      case 'za':
        filtered.sort((a, b) => b.originalName.localeCompare(a.originalName));
        break;
      case 'size-desc':
        filtered.sort((a, b) => b.size - a.size);
        break;
      case 'size-asc':
        filtered.sort((a, b) => a.size - b.size);
        break;
      case 'type':
        filtered.sort((a, b) => a.type.localeCompare(b.type));
        break;
      case 'recent':
      default:
        // Sort by upload date (most recent first), with pinned items at top
        filtered.sort((a, b) => {
          if (a.isPinned && !b.isPinned) return -1;
          if (!a.isPinned && b.isPinned) return 1;
          return new Date(b.uploadedAt) - new Date(a.uploadedAt);
        });
        break;
    }

    setFilteredDocuments(filtered);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDocuments();
    await loadRecentlyViewed();
    setRefreshing(false);
  };

  const handleTabPress = (tab) => {
    if (tab.action === 'sort') {
      setSortModalVisible(true);
    } else if (tab.action === 'clear') {
      handleClearAll();
    } else if (tab.action === 'customize') {
      setCustomizeModalVisible(true);
    } else {
      setActiveTab(tab.key);
    }
  };

const handleClearAll = () => {
  const pinnedCount = documents.filter(doc => doc.isPinned).length;
  
  if (pinnedCount > 0) {
    Alert.alert(
      'Clear Documents',
      `${pinnedCount} document(s) are pinned and will be protected from deletion. Only unpinned documents will be deleted.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Unpinned Only',
          style: 'destructive',
          onPress: deleteUnpinnedDocuments
        }
      ]
    );
  } else {
    Alert.alert(
      'Clear All Documents',
      'Are you sure you want to delete all documents? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: deleteAllDocuments
        }
      ]
    );
  }
};

const deleteUnpinnedDocuments = async () => {
  try {
    const unpinnedDocs = documents.filter(doc => !doc.isPinned);
    
    for (const doc of unpinnedDocs) {
      await DocumentProcessor.deleteDocument(doc.id);
    }
    
    await loadDocuments();
    
    // After successful deletion, call the callback
    if (onDocumentChange) {
      await onDocumentChange();
    }
    
    showSnackbar(`${unpinnedDocs.length} unpinned document(s) deleted. ${documents.filter(doc => doc.isPinned).length} pinned document(s) preserved.`);
  } catch (error) {
    showSnackbar('Error deleting documents');
  }
};

const deleteAllDocuments = async () => {
  try {
    for (const doc of documents) {
      await DocumentProcessor.deleteDocument(doc.id);
    }
    await loadDocuments();
    
    // After successful deletion, call the callback
    if (onDocumentChange) {
      await onDocumentChange();
    }
    
    showSnackbar('All documents cleared');
  } catch (error) {
    showSnackbar('Error clearing documents');
  }
};

  const handleDocumentPress = (document) => {
    // Update recently viewed
    updateRecentlyViewed(document);
    navigation.navigate('DocumentViewer', { document });
  };

  const updateRecentlyViewed = async (document) => {
    try {
      const historyEntry = {
        documentId: document.id,
        documentName: document.originalName,
        viewedAt: new Date().toISOString(),
      };
      
      const updatedHistory = [
        historyEntry,
        ...recentlyViewed.filter(h => h.documentId !== document.id)
      ].slice(0, 20); // Keep only last 20
      
      setRecentlyViewed(updatedHistory);
      await AsyncStorage.setItem('documentViewingHistory', JSON.stringify(updatedHistory));
    } catch (error) {
      console.error('Error updating recent documents:', error);
    }
  };

const handleFavoriteDocument = async (document) => {
  try {
    const updatedDoc = {
      ...document,
      isFavorite: !document.isFavorite,
      favoritedAt: !document.isFavorite ? new Date().toISOString() : null
    };
    
    await DocumentProcessor.updateDocumentMetadata(updatedDoc);
    await loadDocuments();
    
    // After successful update, call the callback
    if (onDocumentChange) {
      await onDocumentChange();
    }
    
    showSnackbar(document.isFavorite ? 'Removed from favorites' : 'Added to favorites');
  } catch (error) {
    showSnackbar('Error updating favorite status');
  }
};

const handlePinDocument = async (document) => {
  try {
    if (!document.isPinned) {
      // Check if we already have 7 pinned documents
      const pinnedCount = documents.filter(doc => doc.isPinned).length;
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
    await loadDocuments();
    
    // After successful update, call the callback
    if (onDocumentChange) {
      await onDocumentChange();
    }
    
    showSnackbar(document.isPinned ? 'Document unpinned' : 'Document pinned to top');
  } catch (error) {
    showSnackbar('Error updating pin status');
  }
};

const handleDeleteDocument = async (document) => {
  if (document.isPinned) {
    Alert.alert(
      'Cannot Delete Pinned Document',
      'This document is pinned. Unpin it first to delete.',
      [{ text: 'OK' }]
    );
    return;
  }

  // Store the document and show modal instead of immediate alert
  setSelectedDocumentForDelete(document);
  setDeleteModalVisible(true);
};

const confirmSingleDelete = async () => {
  if (!selectedDocumentForDelete) return;
  
  try {
    await DocumentProcessor.deleteDocument(selectedDocumentForDelete.id);
    await loadDocuments();
    
    // After successful deletion, call the callback
    if (onDocumentChange) {
      await onDocumentChange();
    }
    
    showSnackbar('Document deleted successfully');
  } catch (error) {
    showSnackbar('Error deleting document');
  } finally {
    setDeleteModalVisible(false);
    setSelectedDocumentForDelete(null);
  }
};

const confirmDeleteAll = async () => {
  try {
    const allDocs = await DocumentProcessor.getStoredDocuments();
    const unpinnedDocs = allDocs.filter(doc => !doc.isPinned);
    const pinnedDocs = allDocs.filter(doc => doc.isPinned);
    
    if (unpinnedDocs.length === 0) {
      showSnackbar('No unpinned documents to delete');
      setDeleteModalVisible(false);
      setSelectedDocumentForDelete(null);
      return;
    }
    
    for (const doc of unpinnedDocs) {
      await DocumentProcessor.deleteDocument(doc.id);
    }
    
    await loadDocuments();
    
    // After successful deletion, call the callback
    if (onDocumentChange) {
      await onDocumentChange();
    }
    
    if (pinnedDocs.length > 0) {
      showSnackbar(`${unpinnedDocs.length} document(s) deleted. ${pinnedDocs.length} pinned document(s) preserved.`);
    } else {
      showSnackbar(`${unpinnedDocs.length} document(s) deleted successfully`);
    }
  } catch (error) {
    showSnackbar('Error deleting documents');
  } finally {
    setDeleteModalVisible(false);
    setSelectedDocumentForDelete(null);
  }
};

const cancelDelete = () => {
  setDeleteModalVisible(false);
  setSelectedDocumentForDelete(null);
};

  const handleUploadDocument = async () => {
    try {
      const file = await DocumentProcessor.selectDocument();
      if (!file) return;

      showSnackbar('Uploading document...');
      
      const result = await DocumentProcessor.storeDocumentWithIntegrityCheck(file);
      await loadDocuments();
      
      showSnackbar(`Document "${result.document.originalName}" uploaded successfully!`);
      
      // Navigate to document viewer immediately
      handleDocumentPress(result.document);
    } catch (error) {
      console.error('Document upload failed:', error);
      Alert.alert('Upload Failed', error.message || 'Failed to upload document. Please try again.');
    }
  };

  const formatFileSize = (bytes) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileIcon = (document) => {
    const type = document.type ? document.type.toLowerCase() : '';
    if (type.includes('pdf')) return 'picture-as-pdf';
    if (type.includes('doc')) return 'description';
    if (type.includes('xls') || type.includes('csv')) return 'grid-on';
    if (type.includes('image')) return 'image';
    return 'insert-drive-file';
  };

  const getFileColor = (document) => {
    const type = document.type ? document.type.toLowerCase() : '';
    if (type.includes('pdf')) return '#FF5722';
    if (type.includes('doc')) return '#2196F3';
    if (type.includes('xls') || type.includes('csv')) return '#4CAF50';
    if (type.includes('image')) return '#E91E63';
    return '#757575';
  };

  const showSnackbar = (message) => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
  };

const renderTabBar = () => (
  <Surface style={styles.tabContainer}>
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.key}
          style={[
            styles.tab,
            (activeTab === tab.key || tab.key === 'sort') && styles.activeTab
          ]}
          onPress={() => handleTabPress(tab)}
        >
          <Icon
            name={tab.icon}
            size={18}
            color={activeTab === tab.key ? COLORS.primary : COLORS.textSecondary}
          />
          <Text
            style={[
              styles.tabText,
              { color: activeTab === tab.key ? COLORS.primary : COLORS.textSecondary }
            ]}
          >
            {tab.label}
            {tab.count > 0 && ` (${tab.count})`}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  </Surface>
);

const renderDocument = ({ item: document }) => {
  // Determine card style based on document state
  let cardStyle = [styles.documentCard];
  
  if (document.isPinned && document.isFavorite) {
    cardStyle.push(styles.pinnedFavoriteCard);
  } else if (document.isPinned) {
    cardStyle.push(styles.pinnedCard);
  } else if (document.isFavorite) {
    cardStyle.push(styles.favoriteCard);
  }

  return (
    <Card style={cardStyle}>
      <TouchableOpacity
        onPress={() => handleDocumentPress(document)}
        activeOpacity={0.7}
      >
        <Card.Content style={styles.documentContent}>
          <View style={styles.documentHeader}>
            <View style={styles.documentIconContainer}>
              <Icon 
                name={getFileIcon(document)} 
                size={32} 
                color={getFileColor(document)} 
              />
            </View>
            
            <View style={styles.documentInfo}>
              <Text style={[TEXT_STYLES.subtitle1, { fontWeight: 'bold' }]}>
                {document.originalName}
              </Text>
              <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
                {document.type} • {formatFileSize(document.size)}
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
                    style={styles.processedBadge}
                    textStyle={styles.badgeText}
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
          <View style={styles.documentActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleFavoriteDocument(document)}
            >
              <Icon
                name={document.isFavorite ? "favorite" : "favorite-border"}
                size={20}
                color={document.isFavorite ? "#4CAF50" : COLORS.textSecondary} // Green when liked
              />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handlePinDocument(document)}
            >
              <Icon
                name="push-pin"
                size={18}
                color={document.isPinned ? "#2196F3" : COLORS.textSecondary} // Blue when pinned
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
          </View>
        </Card.Content>
      </TouchableOpacity>
    </Card>
  );
};

  const renderSortModal = () => (
    <Portal>
      <Modal
        visible={sortModalVisible}
        onDismiss={() => setSortModalVisible(false)}
        contentContainerStyle={styles.modalContent}
      >
        <Text style={[TEXT_STYLES.h3, styles.modalTitle]}>Sort Documents</Text>
        
        <ScrollView style={styles.sortOptions}>
          {sortOptions.map((option) => (
            <TouchableOpacity
              key={option.key}
              style={styles.sortOption}
              onPress={() => {
                setSortOption(option.key);
                setSortModalVisible(false);
              }}
            >
              <RadioButton
                value={option.key}
                status={sortOption === option.key ? 'checked' : 'unchecked'}
                color={COLORS.primary}
              />
              <Icon name={option.icon} size={20} color={COLORS.textSecondary} />
              <Text style={styles.sortOptionText}>{option.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Button
          mode="text"
          onPress={() => setSortModalVisible(false)}
          style={styles.modalCloseButton}
        >
          Close
        </Button>
      </Modal>
    </Portal>
  );

  const renderDeleteModal = () => (
  <Portal>
    <Modal
      visible={deleteModalVisible}
      onDismiss={cancelDelete}
      contentContainerStyle={styles.modalContent}
    >
      <Text style={[TEXT_STYLES.h3, styles.modalTitle]}>Delete Document</Text>
      
      {selectedDocumentForDelete && (
        <Text style={[TEXT_STYLES.body1, styles.deleteWarning]}>
          Are you sure you want to delete "{selectedDocumentForDelete.originalName}"?
        </Text>
      )}
      
      <Text style={[TEXT_STYLES.caption, styles.deleteSubtext]}>
        This action cannot be undone.
      </Text>

      <View style={styles.deleteButtonContainer}>
        <Button
          mode="text"
          onPress={cancelDelete}
          style={styles.modalButton}
        >
          Cancel
        </Button>
        
        <Button
          mode="contained"
          onPress={confirmSingleDelete}
          style={[styles.modalButton, { backgroundColor: '#F44336' }]}
          textColor="white"
        >
          Delete This
        </Button>
        
        <Button
          mode="contained"
          onPress={confirmDeleteAll}
          style={[styles.modalButton, { backgroundColor: '#D32F2F' }]}
          textColor="white"
        >
          Delete All
        </Button>
      </View>
    </Modal>
  </Portal>
);

  const renderCustomizeModal = () => (
    <Portal>
      <Modal
        visible={customizeModalVisible}
        onDismiss={() => setCustomizeModalVisible(false)}
        contentContainerStyle={styles.modalContent}
      >
        <Text style={[TEXT_STYLES.h3, styles.modalTitle]}>Customize View</Text>
        
        <Text style={[TEXT_STYLES.body1, styles.comingSoon]}>
          Custom view options coming soon! You'll be able to:
        </Text>
        
        <View style={styles.featureList}>
          <Text style={styles.featureItem}>• Create custom document categories</Text>
          <Text style={styles.featureItem}>• Set default sorting preferences</Text>
          <Text style={styles.featureItem}>• Choose display layout options</Text>
          <Text style={styles.featureItem}>• Configure auto-organization rules</Text>
        </View>

        <Button
          mode="contained"
          onPress={() => setCustomizeModalVisible(false)}
          style={styles.modalCloseButton}
        >
          Got it
        </Button>
      </Modal>
    </Portal>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} translucent />
        <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
          <View style={styles.headerContent}>
            <IconButton
              icon="arrow-back"
              iconColor="white"
              size={24}
              onPress={() => navigation.goBack()}
            />
            <Text style={styles.headerTitle}>Document Library</Text>
          </View>
        </LinearGradient>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={{ marginTop: SPACING.md }}>Loading documents...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} translucent />
      
      {/* Header */}
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
        <View style={styles.headerContent}>
          <IconButton
            icon="arrow-back"
            iconColor="white"
            size={24}
            onPress={() => navigation.goBack()}
          />
          <Text style={styles.headerTitle}>Document Library</Text>
          <Text style={styles.headerSubtitle}>
            {filteredDocuments.length} document{filteredDocuments.length !== 1 ? 's' : ''}
          </Text>
        </View>
      </LinearGradient>

      {/* Tab Bar */}
      {renderTabBar()}

      {/* Document List */}
      <FlatList
        data={filteredDocuments}
        renderItem={renderDocument}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Icon name="description" size={64} color={COLORS.textSecondary} />
            <Text style={styles.emptyText}>
              {activeTab === 'favorites' ? 'No favorite documents' : 
               activeTab === 'recent' ? 'No recently viewed documents' : 
               'No documents found'}
            </Text>
            <Text style={styles.emptySubtext}>
              {activeTab === 'favorites' ? 'Mark documents as favorites to see them here' :
               activeTab === 'recent' ? 'Documents you view will appear here' :
               'Upload your first document to get started'}
            </Text>
          </View>
        }
      />

      {/* Upload FAB */}
      <FAB
        icon="upload"
        style={styles.fab}
        onPress={handleUploadDocument}
        label="Upload"
      />

      {/* Modals */}
      {renderSortModal()}
      {renderDeleteModal()}
      {renderCustomizeModal()}

      {/* Snackbar */}
      <Portal>
        <Snackbar
          visible={snackbarVisible}
          onDismiss={() => setSnackbarVisible(false)}
          duration={3000}
          style={styles.snackbar}
        >
          {snackbarMessage}
        </Snackbar>
      </Portal>
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
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: StatusBar.currentHeight + SPACING.md,
    paddingBottom: SPACING.lg,
    elevation: 4,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: SPACING.sm,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  tabContainer: {
    elevation: 2,
    paddingVertical: SPACING.xs,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginHorizontal: SPACING.xs,
    borderRadius: 20,
  },
  activeTab: {
    backgroundColor: COLORS.primary + '20',
  },
  tabText: {
    marginLeft: SPACING.xs,
    fontSize: 12,
    fontWeight: '500',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: SPACING.md,
    paddingBottom: 100,
  },
  documentCard: {
    marginBottom: SPACING.md,
    elevation: 2,
    borderRadius: 12,
  },
  pinnedCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  documentContent: {
    padding: SPACING.md,
  },
  documentHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  documentIconContainer: {
    marginRight: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  documentInfo: {
    flex: 1,
  },
  statusBadges: {
    flexDirection: 'row',
    marginTop: SPACING.xs,
    gap: SPACING.xs,
  },
  pinnedBadge: {
    backgroundColor: '#4CAF50' + '20',
  },
  processedBadge: {
    backgroundColor: COLORS.success + '20',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  documentActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  actionButton: {
    padding: SPACING.xs,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  disabledAction: {
    opacity: 0.3,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
    marginTop: 50,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
    textAlign: 'center',
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
    maxHeight: '70%',
  },
  modalTitle: {
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  sortOptions: {
    maxHeight: 300,
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  sortOptionText: {
    marginLeft: SPACING.md,
    fontSize: 16,
  },
  modalCloseButton: {
    marginTop: SPACING.md,
  },
  comingSoon: {
    textAlign: 'center',
    marginBottom: SPACING.lg,
    color: COLORS.textSecondary,
  },
  featureList: {
    marginBottom: SPACING.lg,
  },
  featureItem: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
    paddingLeft: SPACING.sm,
  },
  snackbar: {
    marginBottom: 80,
  },
  deleteWarning: {
  textAlign: 'center',
  marginBottom: SPACING.md,
  color: COLORS.textPrimary,
},
deleteSubtext: {
  textAlign: 'center',
  marginBottom: SPACING.lg,
  color: COLORS.textSecondary,
  fontStyle: 'italic',
},
deleteButtonContainer: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  gap: SPACING.sm,
},
modalButton: {
  flex: 1,
},
favoriteIndicator: {
  position: 'absolute',
  top: 0,
  right: 0,
  backgroundColor: 'white',
  borderRadius: 10,
  padding: 2,
  elevation: 1,
},
favoriteBadge: {
  backgroundColor: '#FF6B6B' + '20',
},
   documentCard: {
    marginBottom: SPACING.md,
    elevation: 2,
    borderRadius: 12,
  },
  pinnedCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3', // Blue border for pinned
    backgroundColor: '#E3F2FD', // Light blue background for pinned
  },
  favoriteCard: {
    backgroundColor: '#E8F5E8', // Light green background for liked
  },
  
  // If both pinned AND liked, you might want a combined style
  pinnedFavoriteCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
    backgroundColor: '#E8F5E8', // Keep green background, blue border
  },
  
  pinnedBadge: {
    backgroundColor: '#2196F3' + '20', // Blue with transparency
  },
  favoriteBadge: {
    backgroundColor: '#4CAF50' + '20', // Green with transparency
  },
};

export default DocumentLibrary;