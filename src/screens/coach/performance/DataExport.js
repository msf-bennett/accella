import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Dimensions,
  StatusBar,
  Animated,
  FlatList,
  Share,
  Platform,
  PermissionsAndroid,
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
  Searchbar,
  Portal,
  Modal,
  TextInput,
  RadioButton,
  Divider,
  Switch,
  Checkbox,
  List,
} from 'react-native-paper';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/LinearGradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';
import * as FileSystem from 'expo-file-system';
import DatePicker from 'react-native-date-picker';

// Import your established constants
import { COLORS } from '../../../styles/colors';
import { SPACING } from '../../../styles/spacing';
import { TEXT_STYLES } from '../../../styles/textStyles';
import { TYPOGRAPHY } from '../../../styles/typography';
import { LAYOUT } from '../../../styles/layout';

const { width } = Dimensions.get('window');

const DataExport = ({ navigation }) => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const teams = useSelector(state => state.teams.teams);
  const players = useSelector(state => state.players.players);

  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [modalVisible, setModalVisible] = useState(false);
  const [exportConfigModal, setExportConfigModal] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [exporting, setExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  // Date range selection
  const [startDate, setStartDate] = useState(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)); // 30 days ago
  const [endDate, setEndDate] = useState(new Date());
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  // Export configuration
  const [exportConfig, setExportConfig] = useState({
    format: 'csv', // csv, excel, pdf, json
    includeHeaders: true,
    includeMetadata: true,
    dateRange: 'custom',
    selectedTeams: [],
    selectedPlayers: [],
    dataTypes: {
      playerStats: true,
      trainingData: true,
      competitionResults: true,
      attendanceRecords: true,
      performanceMetrics: true,
      nutritionData: false,
      injuryReports: true,
      parentFeedback: false,
    }
  });

  // Export templates and history
  const [exportTemplates] = useState([
    {
      id: 1,
      name: 'Weekly Performance Report',
      description: 'Player stats, training progress, and match results',
      icon: 'assessment',
      color: COLORS.primary,
      dataTypes: ['playerStats', 'trainingData', 'competitionResults'],
      format: 'pdf',
      popular: true,
    },
    {
      id: 2,
      name: 'Season Summary',
      description: 'Complete season statistics and achievements',
      icon: 'jump-rope',
      color: COLORS.success,
      dataTypes: ['playerStats', 'competitionResults', 'performanceMetrics'],
      format: 'excel',
      popular: true,
    },
    {
      id: 3,
      name: 'Attendance Report',
      description: 'Training and match attendance records',
      icon: 'event-available',
      color: COLORS.warning,
      dataTypes: ['attendanceRecords'],
      format: 'csv',
      popular: false,
    },
    {
      id: 4,
      name: 'Medical Summary',
      description: 'Injury reports and health data',
      icon: 'local-hospital',
      color: COLORS.error,
      dataTypes: ['injuryReports', 'performanceMetrics'],
      format: 'pdf',
      popular: false,
    },
    {
      id: 5,
      name: 'Parent Communication Pack',
      description: 'Progress reports and feedback for parents',
      icon: 'family-restroom',
      color: COLORS.secondary,
      dataTypes: ['playerStats', 'trainingData', 'parentFeedback'],
      format: 'pdf',
      popular: true,
    },
    {
      id: 6,
      name: 'Training Analytics',
      description: 'Detailed training session data and metrics',
      icon: 'fitness-center',
      color: COLORS.primary,
      dataTypes: ['trainingData', 'performanceMetrics', 'attendanceRecords'],
      format: 'excel',
      popular: false,
    }
  ]);

  const [exportHistory] = useState([
    {
      id: 1,
      templateName: 'Weekly Performance Report',
      exportDate: '2024-08-15',
      format: 'PDF',
      fileSize: '2.4 MB',
      status: 'completed',
      downloadCount: 3,
    },
    {
      id: 2,
      templateName: 'Season Summary',
      exportDate: '2024-08-10',
      format: 'Excel',
      fileSize: '5.1 MB',
      status: 'completed',
      downloadCount: 1,
    },
    {
      id: 3,
      templateName: 'Attendance Report',
      exportDate: '2024-08-08',
      format: 'CSV',
      fileSize: '0.8 MB',
      status: 'expired',
      downloadCount: 2,
    }
  ]);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    loadExportData();
  }, []);

  const loadExportData = useCallback(async () => {
    try {
      // In real app, fetch export history and templates
      // const history = await exportAPI.getHistory(user.id);
      // setExportHistory(history);
    } catch (error) {
      console.error('Error loading export data:', error);
      Alert.alert('Error', 'Failed to load export data');
    }
  }, [user.id]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadExportData().finally(() => setRefreshing(false));
  }, [loadExportData]);

  const filteredTemplates = exportTemplates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || 
                         (selectedFilter === 'popular' && template.popular) ||
                         template.format === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const handleTemplateSelect = (template) => {
    // Pre-configure export settings based on template
    const newConfig = {
      ...exportConfig,
      format: template.format,
      dataTypes: Object.keys(exportConfig.dataTypes).reduce((acc, key) => ({
        ...acc,
        [key]: template.dataTypes.includes(key)
      }), {})
    };
    setExportConfig(newConfig);
    setExportConfigModal(true);
  };

  const handleCustomExport = () => {
    setExportConfigModal(true);
  };

  const validateExportConfig = () => {
    const hasDataTypes = Object.values(exportConfig.dataTypes).some(Boolean);
    if (!hasDataTypes) {
      Alert.alert('Error', 'Please select at least one data type to export');
      return false;
    }
    return true;
  };

  const simulateExport = async () => {
    setExportProgress(0);
    
    const steps = [
      'Collecting data...',
      'Processing records...',
      'Applying filters...',
      'Formatting output...',
      'Generating file...',
      'Finalizing export...'
    ];

    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 800));
      setExportProgress((i + 1) / steps.length * 100);
    }
  };

  const handleExport = async () => {
    if (!validateExportConfig()) return;

    try {
      setExporting(true);
      
      // Request storage permissions on Android
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert('Permission Required', 'Storage permission is needed to export files');
          return;
        }
      }

      await simulateExport();

      // Generate filename
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `export_${timestamp}.${exportConfig.format}`;
      
      // In real implementation, you would:
      // 1. Fetch data based on config
      // 2. Format data according to selected format
      // 3. Save file to device storage
      // 4. Optionally share the file

// Mock file creation
const mockData = generateMockExportData();
const filePath = `${FileSystem.documentDirectory}${filename}`;

if (exportConfig.format === 'csv') {
  await FileSystem.writeAsStringAsync(filePath, mockData.csv, {
    encoding: FileSystem.EncodingType.UTF8,
  });
} else if (exportConfig.format === 'json') {
  await FileSystem.writeAsStringAsync(
    filePath,
    JSON.stringify(mockData.json, null, 2),
    { encoding: FileSystem.EncodingType.UTF8 }
  );
}

      setExporting(false);
      setExportConfigModal(false);
      
      Alert.alert(
        'Export Complete! 🎉',
        `Your data has been exported successfully as ${filename}`,
        [
          { text: 'View File', onPress: () => handleViewFile(filePath) },
          { text: 'Share', onPress: () => handleShareFile(filePath) },
          { text: 'OK', style: 'default' }
        ]
      );

    } catch (error) {
      setExporting(false);
      console.error('Export error:', error);
      Alert.alert('Export Failed', 'An error occurred while exporting data. Please try again.');
    }
  };

  const generateMockExportData = () => {
    const csvData = `Name,Position,Goals,Assists,Rating,Attendance
John Doe,Forward,12,8,8.5,95%
Mike Johnson,Midfielder,5,15,8.2,88%
Alex Smith,Defender,2,3,7.8,92%`;

    const jsonData = {
      exportInfo: {
        generatedAt: new Date().toISOString(),
        dateRange: { start: startDate, end: endDate },
        format: exportConfig.format,
        coach: user.name
      },
      players: [
        { name: 'John Doe', position: 'Forward', goals: 12, assists: 8, rating: 8.5, attendance: '95%' },
        { name: 'Mike Johnson', position: 'Midfielder', goals: 5, assists: 15, rating: 8.2, attendance: '88%' },
        { name: 'Alex Smith', position: 'Defender', goals: 2, assists: 3, rating: 7.8, attendance: '92%' }
      ]
    };

    return { csv: csvData, json: jsonData };
  };

  const handleViewFile = (filePath) => {
    // In real implementation, open file with system viewer
    Alert.alert('File Location', `File saved at: ${filePath}`);
  };

  const handleShareFile = async (filePath) => {
    try {
      await Share.share({
        url: filePath,
        title: 'Training Data Export'
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  const renderTemplateCard = ({ item }) => (
    <Animated.View style={{ opacity: fadeAnim }}>
      <Card style={styles.templateCard}>
        <TouchableOpacity onPress={() => handleTemplateSelect(item)}>
          <Card.Content>
            <View style={styles.templateHeader}>
              <View style={[styles.templateIcon, { backgroundColor: item.color + '20' }]}>
                <Icon name={item.icon} size={32} color={item.color} />
              </View>
              {item.popular && (
                <Chip mode="flat" compact style={styles.popularChip}>
                  ⭐ Popular
                </Chip>
              )}
            </View>
            
            <Text style={styles.templateName}>{item.name}</Text>
            <Text style={styles.templateDescription}>{item.description}</Text>
            
            <View style={styles.templateDetails}>
              <View style={styles.templateFormat}>
                <Icon name="description" size={16} color={COLORS.secondary} />
                <Text style={styles.formatText}>{item.format.toUpperCase()}</Text>
              </View>
              
              <View style={styles.dataTypesList}>
                {item.dataTypes.slice(0, 2).map((type, index) => (
                  <Chip key={index} mode="outlined" compact style={styles.dataTypeChip}>
                    {type.replace(/([A-Z])/g, ' $1').trim()}
                  </Chip>
                ))}
                {item.dataTypes.length > 2 && (
                  <Chip mode="outlined" compact style={styles.dataTypeChip}>
                    +{item.dataTypes.length - 2} more
                  </Chip>
                )}
              </View>
            </View>
          </Card.Content>
        </TouchableOpacity>
      </Card>
    </Animated.View>
  );

  const renderHistoryItem = ({ item }) => (
    <Surface style={styles.historyItem}>
      <View style={styles.historyContent}>
        <View style={styles.historyIcon}>
          <Icon 
            name={item.status === 'completed' ? 'check-circle' : 'schedule'} 
            size={24} 
            color={item.status === 'completed' ? COLORS.success : COLORS.warning} 
          />
        </View>
        
        <View style={styles.historyDetails}>
          <Text style={styles.historyName}>{item.templateName}</Text>
          <Text style={styles.historyDate}>{new Date(item.exportDate).toLocaleDateString()}</Text>
          <View style={styles.historyMeta}>
            <Text style={styles.historyFormat}>{item.format}</Text>
            <Text style={styles.historySize}>{item.fileSize}</Text>
            <Text style={styles.historyDownloads}>📥 {item.downloadCount}</Text>
          </View>
        </View>
        
        <View style={styles.historyActions}>
          {item.status === 'completed' ? (
            <>
              <IconButton icon="download" size={20} onPress={() => Alert.alert('Download', 'File download started')} />
              <IconButton icon="share" size={20} onPress={() => Alert.alert('Share', 'File sharing options')} />
            </>
          ) : (
            <IconButton icon="delete" size={20} iconColor={COLORS.error} onPress={() => Alert.alert('Delete', 'Remove expired file')} />
          )}
        </View>
      </View>
    </Surface>
  );

  const renderExportConfigModal = () => (
    <Portal>
      <Modal
        visible={exportConfigModal}
        onDismiss={() => setExportConfigModal(false)}
        contentContainerStyle={styles.configModalContainer}
      >
        <ScrollView style={styles.configModalContent}>
          <Text style={styles.configModalTitle}>Configure Export</Text>

          {/* Date Range Selection */}
          <View style={styles.configSection}>
            <Text style={styles.configSectionTitle}>📅 Date Range</Text>
            <View style={styles.dateRangeContainer}>
              <TouchableOpacity 
                style={styles.dateButton} 
                onPress={() => setShowStartDatePicker(true)}
              >
                <Text style={styles.dateButtonText}>From: {startDate.toDateString()}</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.dateButton} 
                onPress={() => setShowEndDatePicker(true)}
              >
                <Text style={styles.dateButtonText}>To: {endDate.toDateString()}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Format Selection */}
          <View style={styles.configSection}>
            <Text style={styles.configSectionTitle}>📄 Export Format</Text>
            <RadioButton.Group
              onValueChange={value => setExportConfig(prev => ({ ...prev, format: value }))}
              value={exportConfig.format}
            >
              <View style={styles.formatOptions}>
                {[
                  { value: 'csv', label: 'CSV', icon: 'table-chart' },
                  { value: 'excel', label: 'Excel', icon: 'grid-on' },
                  { value: 'pdf', label: 'PDF', icon: 'picture-as-pdf' },
                  { value: 'json', label: 'JSON', icon: 'code' }
                ].map(format => (
                  <TouchableOpacity 
                    key={format.value}
                    style={styles.formatOption}
                    onPress={() => setExportConfig(prev => ({ ...prev, format: format.value }))}
                  >
                    <RadioButton value={format.value} />
                    <Icon name={format.icon} size={24} color={COLORS.primary} />
                    <Text style={styles.formatLabel}>{format.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </RadioButton.Group>
          </View>

          {/* Data Types Selection */}
          <View style={styles.configSection}>
            <Text style={styles.configSectionTitle}>🗂️ Data to Include</Text>
            {Object.entries(exportConfig.dataTypes).map(([key, value]) => (
              <View key={key} style={styles.dataTypeRow}>
                <Checkbox
                  status={value ? 'checked' : 'unchecked'}
                  onPress={() => setExportConfig(prev => ({
                    ...prev,
                    dataTypes: { ...prev.dataTypes, [key]: !value }
                  }))}
                />
                <Text style={styles.dataTypeLabel}>
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </Text>
              </View>
            ))}
          </View>

          {/* Export Options */}
          <View style={styles.configSection}>
            <Text style={styles.configSectionTitle}>⚙️ Options</Text>
            <View style={styles.optionRow}>
              <Text style={styles.optionLabel}>Include Headers</Text>
              <Switch
                value={exportConfig.includeHeaders}
                onValueChange={(value) => setExportConfig(prev => ({ ...prev, includeHeaders: value }))}
              />
            </View>
            <View style={styles.optionRow}>
              <Text style={styles.optionLabel}>Include Metadata</Text>
              <Switch
                value={exportConfig.includeMetadata}
                onValueChange={(value) => setExportConfig(prev => ({ ...prev, includeMetadata: value }))}
              />
            </View>
          </View>

          {/* Export Progress */}
          {exporting && (
            <View style={styles.progressContainer}>
              <Text style={styles.progressText}>Exporting data...</Text>
              <ProgressBar 
                progress={exportProgress / 100} 
                color={COLORS.primary}
                style={styles.progressBar}
              />
              <Text style={styles.progressPercentage}>{Math.round(exportProgress)}%</Text>
            </View>
          )}

          {/* Modal Actions */}
          <View style={styles.configModalActions}>
            <Button
              mode="outlined"
              onPress={() => setExportConfigModal(false)}
              style={styles.modalActionButton}
              disabled={exporting}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleExport}
              style={styles.modalActionButton}
              loading={exporting}
              disabled={exporting}
            >
              {exporting ? 'Exporting...' : 'Export'}
            </Button>
          </View>
        </ScrollView>

        {/* Date Pickers */}
        <DatePicker
          modal
          open={showStartDatePicker}
          date={startDate}
          mode="date"
          onConfirm={(date) => {
            setStartDate(date);
            setShowStartDatePicker(false);
          }}
          onCancel={() => setShowStartDatePicker(false)}
        />
        <DatePicker
          modal
          open={showEndDatePicker}
          date={endDate}
          mode="date"
          onConfirm={(date) => {
            setEndDate(date);
            setShowEndDatePicker(false);
          }}
          onCancel={() => setShowEndDatePicker(false)}
        />
      </Modal>
    </Portal>
  );

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
        <Text style={styles.headerTitle}>Data Export 📊</Text>
        <Text style={styles.headerSubtitle}>Export and share your coaching data</Text>
      </LinearGradient>

      <View style={styles.content}>
        <Searchbar
          placeholder="Search export templates..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
          iconColor={COLORS.primary}
        />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterContainer}
          contentContainerStyle={styles.filterContent}
        >
          {[
            { key: 'all', label: 'All', icon: 'apps' },
            { key: 'popular', label: 'Popular', icon: 'star' },
            { key: 'csv', label: 'CSV', icon: 'table-chart' },
            { key: 'excel', label: 'Excel', icon: 'grid-on' },
            { key: 'pdf', label: 'PDF', icon: 'picture-as-pdf' },
          ].map(filter => (
            <Chip
              key={filter.key}
              mode={selectedFilter === filter.key ? 'flat' : 'outlined'}
              selected={selectedFilter === filter.key}
              onPress={() => setSelectedFilter(filter.key)}
              style={[
                styles.filterChip,
                selectedFilter === filter.key && { backgroundColor: COLORS.primary + '20' }
              ]}
              icon={filter.icon}
            >
              {filter.label}
            </Chip>
          ))}
        </ScrollView>

        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Export Templates Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>📋 Export Templates</Text>
              <Button 
                mode="outlined" 
                compact 
                onPress={handleCustomExport}
                style={styles.customButton}
              >
                Custom Export
              </Button>
            </View>
            
            <FlatList
              data={filteredTemplates}
              renderItem={renderTemplateCard}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          </View>

          {/* Export History Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📁 Recent Exports</Text>
            <FlatList
              data={exportHistory}
              renderItem={renderHistoryItem}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={() => (
                <View style={styles.emptyContainer}>
                  <Icon name="history" size={64} color={COLORS.secondary} />
                  <Text style={styles.emptyTitle}>No Export History</Text>
                  <Text style={styles.emptySubtitle}>Your exported files will appear here</Text>
                </View>
              )}
            />
          </View>
        </ScrollView>
      </View>

      <FAB
        icon="download"
        label="Quick Export"
        style={[styles.fab, { backgroundColor: COLORS.primary }]}
        onPress={handleCustomExport}
      />

      {renderExportConfigModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: StatusBar.currentHeight + SPACING.lg,
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.lg,
  },
  headerTitle: {
    ...TEXT_STYLES.heading,
    color: 'white',
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    ...TEXT_STYLES.body,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.md,
  },
  searchbar: {
    marginVertical: SPACING.md,
    elevation: 2,
  },
  filterContainer: {
    marginBottom: SPACING.md,
  },
  filterContent: {
    paddingHorizontal: SPACING.xs,
  },
  filterChip: {
    marginHorizontal: SPACING.xs,
  },
  scrollContent: {
    paddingBottom: SPACING.xl * 2,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    ...TEXT_STYLES.subheading,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  customButton: {
    borderColor: COLORS.primary,
  },
  templateCard: {
    marginBottom: SPACING.md,
    elevation: 3,
  },
  templateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  templateIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  popularChip: {
    backgroundColor: COLORS.warning + '20',
  },
  templateName: {
    ...TEXT_STYLES.subheading,
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  templateDescription: {
    ...TEXT_STYLES.body,
    color: COLORS.secondary,
    marginBottom: SPACING.sm,
  },
  templateDetails: {
    marginTop: SPACING.sm,
  },
  templateFormat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  formatText: {
    ...TEXT_STYLES.caption,
    marginLeft: SPACING.xs,
    fontWeight: 'bold',
    color: COLORS.secondary,
  },
  dataTypesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dataTypeChip: {
    marginRight: SPACING.xs,
    marginBottom: SPACING.xs,
    height: 24,
  },
  historyItem: {
    marginBottom: SPACING.sm,
    padding: SPACING.md,
    borderRadius: SPACING.sm,
    elevation: 1,
  },
  historyContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  historyIcon: {
    marginRight: SPACING.md,
  },
  historyDetails: {
    flex: 1,
  },
  historyName: {
    ...TEXT_STYLES.body,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  historyDate: {
    ...TEXT_STYLES.caption,
    color: COLORS.secondary,
    marginBottom: SPACING.xs,
  },
  historyMeta: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  historyFormat: {
    ...TEXT_STYLES.caption,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  historySize: {
    ...TEXT_STYLES.caption,
    color: COLORS.secondary,
  },
  historyDownloads: {
    ...TEXT_STYLES.caption,
    color: COLORS.secondary,
  },
  historyActions: {
    flexDirection: 'row',
  },
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  emptyTitle: {
    ...TEXT_STYLES.subheading,
    color: COLORS.secondary,
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
  },
  emptySubtitle: {
    ...TEXT_STYLES.body,
    color: COLORS.secondary,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    margin: SPACING.md,
    right: 0,
    bottom: 0,
  },
  configModalContainer: {
    backgroundColor: 'white',
    margin: SPACING.md,
    borderRadius: SPACING.md,
    maxHeight: '90%',
  },
  configModalContent: {
    padding: SPACING.md,
  },
  configModalTitle: {
    ...TEXT_STYLES.subheading,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: SPACING.lg,
    color: COLORS.primary,
  },
  configSection: {
    marginBottom: SPACING.lg,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  configSectionTitle: {
    ...TEXT_STYLES.body,
    fontWeight: 'bold',
    marginBottom: SPACING.sm,
    color: COLORS.primary,
  },
  dateRangeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dateButton: {
    flex: 0.48,
    backgroundColor: COLORS.background,
    padding: SPACING.sm,
    borderRadius: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  dateButtonText: {
    ...TEXT_STYLES.body,
    textAlign: 'center',
    color: COLORS.primary,
  },
  formatOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  formatOption: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.sm,
    marginBottom: SPACING.sm,
    backgroundColor: COLORS.background,
    borderRadius: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  formatLabel: {
    ...TEXT_STYLES.body,
    marginLeft: SPACING.sm,
    flex: 1,
  },
  dataTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  dataTypeLabel: {
    ...TEXT_STYLES.body,
    marginLeft: SPACING.sm,
    flex: 1,
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  optionLabel: {
    ...TEXT_STYLES.body,
    flex: 1,
  },
  progressContainer: {
    marginVertical: SPACING.lg,
    padding: SPACING.md,
    backgroundColor: COLORS.background,
    borderRadius: SPACING.sm,
    alignItems: 'center',
  },
  progressText: {
    ...TEXT_STYLES.body,
    marginBottom: SPACING.sm,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  progressBar: {
    width: '100%',
    height: 8,
    marginBottom: SPACING.sm,
  },
  progressPercentage: {
    ...TEXT_STYLES.caption,
    color: COLORS.secondary,
  },
  configModalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.lg,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  modalActionButton: {
    flex: 0.45,
  },
});

export default DataExport;