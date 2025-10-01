// src/components/settings/SessionSetupModal.js
import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet
} from 'react-native';
import { Button, Surface, IconButton } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS, SPACING, TEXT_STYLES } from '../../styles/themes';

const SessionSetupModal = ({ 
  visible, 
  onDismiss, 
  onComplete,
  totalWeeks = 12,
  documentName = ''
}) => {
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [startDate, setStartDate] = useState(new Date());

  const handleComplete = () => {
    onComplete({
      startingWeek: selectedWeek,
      startDate: startDate.toISOString().split('T')[0]
    });
  };

  const adjustDate = (days) => {
    const newDate = new Date(startDate);
    newDate.setDate(newDate.getDate() + days);
    setStartDate(newDate);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onDismiss}
    >
      <View style={styles.overlay}>
        <Surface style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <Icon name="event" size={24} color={COLORS.primary} />
              <Text style={styles.headerTitle}>Setup Training Schedule</Text>
            </View>
            <IconButton
              icon="close"
              size={24}
              onPress={onDismiss}
            />
          </View>

          <ScrollView style={styles.content}>
            {/* Document Info */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Document</Text>
              <Text style={styles.documentName}>{documentName}</Text>
              <Text style={styles.documentInfo}>
                {totalWeeks} weeks • Auto-scheduling enabled
              </Text>
            </View>

            {/* Starting Week Selection */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Starting Week</Text>
              <Text style={styles.sectionDescription}>
                Choose which week to start from
              </Text>
              
              <View style={styles.weekSelector}>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.weekList}
                >
                  {Array.from({ length: totalWeeks }, (_, i) => i + 1).map(week => (
                    <TouchableOpacity
                      key={week}
                      onPress={() => setSelectedWeek(week)}
                      style={[
                        styles.weekOption,
                        selectedWeek === week && styles.weekOptionSelected
                      ]}
                    >
                      <Text style={[
                        styles.weekOptionText,
                        selectedWeek === week && styles.weekOptionTextSelected
                      ]}>
                        Week {week}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>

            {/* Start Date Selection */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Start Date</Text>
              <Text style={styles.sectionDescription}>
                When do you want to begin training?
              </Text>
              
              <View style={styles.dateSelector}>
                <IconButton
                  icon="chevron-left"
                  size={24}
                  onPress={() => adjustDate(-1)}
                />
                <View style={styles.dateDisplay}>
                  <Text style={styles.dateText}>
                    {startDate.toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </Text>
                </View>
                <IconButton
                  icon="chevron-right"
                  size={24}
                  onPress={() => adjustDate(1)}
                />
              </View>

              <View style={styles.quickDateOptions}>
                <TouchableOpacity
                  style={styles.quickDateButton}
                  onPress={() => setStartDate(new Date())}
                >
                  <Text style={styles.quickDateText}>Today</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.quickDateButton}
                  onPress={() => {
                    const tomorrow = new Date();
                    tomorrow.setDate(tomorrow.getDate() + 1);
                    setStartDate(tomorrow);
                  }}
                >
                  <Text style={styles.quickDateText}>Tomorrow</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.quickDateButton}
                  onPress={() => {
                    const nextMonday = new Date();
                    const day = nextMonday.getDay();
                    const daysUntilMonday = (8 - day) % 7 || 7;
                    nextMonday.setDate(nextMonday.getDate() + daysUntilMonday);
                    setStartDate(nextMonday);
                  }}
                >
                  <Text style={styles.quickDateText}>Next Monday</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Summary */}
            <Surface style={styles.summary}>
              <Text style={styles.summaryTitle}>Setup Summary</Text>
              <View style={styles.summaryItem}>
                <Icon name="play-circle-outline" size={20} color={COLORS.textSecondary} />
                <Text style={styles.summaryText}>
                  Starting from Week {selectedWeek} of {totalWeeks}
                </Text>
              </View>
              <View style={styles.summaryItem}>
                <Icon name="calendar-today" size={20} color={COLORS.textSecondary} />
                <Text style={styles.summaryText}>
                  Beginning on {startDate.toLocaleDateString()}
                </Text>
              </View>
              <View style={styles.summaryItem}>
                <Icon name="auto-awesome" size={20} color={COLORS.textSecondary} />
                <Text style={styles.summaryText}>
                  Sessions will auto-advance daily
                </Text>
              </View>
            </Surface>
          </ScrollView>

          {/* Actions */}
          <View style={styles.actions}>
            <Button
              mode="outlined"
              onPress={onDismiss}
              style={styles.actionButton}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleComplete}
              style={styles.actionButton}
              buttonColor={COLORS.primary}
            >
              Start Training
            </Button>
          </View>
        </Surface>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg
  },
  container: {
    width: '100%',
    maxWidth: 500,
    maxHeight: '90%',
    borderRadius: 16,
    overflow: 'hidden'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  headerTitle: {
    ...TEXT_STYLES.h3,
    marginLeft: SPACING.sm
  },
  content: {
    padding: SPACING.lg
  },
  section: {
    marginBottom: SPACING.xl
  },
  sectionTitle: {
    ...TEXT_STYLES.subtitle1,
    fontWeight: 'bold',
    marginBottom: SPACING.xs
  },
  sectionDescription: {
    ...TEXT_STYLES.body2,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md
  },
  documentName: {
    ...TEXT_STYLES.body1,
    fontWeight: '600',
    marginBottom: SPACING.xs
  },
  documentInfo: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary
  },
  weekSelector: {
    marginTop: SPACING.sm
  },
  weekList: {
    paddingVertical: SPACING.sm
  },
  weekOption: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginRight: SPACING.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface
  },
  weekOptionSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary
  },
  weekOptionText: {
    ...TEXT_STYLES.body2,
    color: COLORS.textPrimary
  },
  weekOptionTextSelected: {
    color: COLORS.white,
    fontWeight: 'bold'
  },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.sm
  },
  dateDisplay: {
    flex: 1,
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.background,
    borderRadius: 8,
    marginHorizontal: SPACING.sm
  },
  dateText: {
    ...TEXT_STYLES.body1,
    fontWeight: '600'
  },
  quickDateOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: SPACING.md
  },
  quickDateButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
    backgroundColor: COLORS.background
  },
  quickDateText: {
    ...TEXT_STYLES.caption,
    color: COLORS.primary,
    fontWeight: '600'
  },
  summary: {
    padding: SPACING.md,
    borderRadius: 12,
    backgroundColor: COLORS.background,
    marginTop: SPACING.md
  },
  summaryTitle: {
    ...TEXT_STYLES.subtitle2,
    fontWeight: 'bold',
    marginBottom: SPACING.sm
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs
  },
  summaryText: {
    ...TEXT_STYLES.body2,
    marginLeft: SPACING.sm,
    flex: 1
  },
  actions: {
    flexDirection: 'row',
    padding: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border
  },
  actionButton: {
    flex: 1,
    marginHorizontal: SPACING.xs
  }
});

export default SessionSetupModal;