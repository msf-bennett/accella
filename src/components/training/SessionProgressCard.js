import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card, ProgressBar } from 'react-native-paper';
import { COLORS, SPACING, TEXT_STYLES } from '../../styles/themes';

const SessionProgressCard = ({ stats }) => {
  if (!stats) return null;
  
  return (
    <Card style={styles.card}>
      <Card.Content>
        <Text style={styles.title}>Completion Progress</Text>
        
        {/* Daily */}
        <View style={styles.statRow}>
          <Text style={styles.label}>Today:</Text>
          <Text style={styles.ratio}>
            {stats.daily.completed}/{stats.daily.total}
          </Text>
          <Text style={styles.visualBar}>{stats.daily.visualBar}</Text>
          <Text style={styles.percentage}>{stats.daily.percentage}%</Text>
        </View>
        
        {/* Weekly */}
        <View style={styles.statRow}>
          <Text style={styles.label}>This Week:</Text>
          <Text style={styles.ratio}>
            {stats.weekly.completed}/{stats.weekly.total}
          </Text>
          <Text style={styles.visualBar}>{stats.weekly.visualBar}</Text>
          <Text style={styles.percentage}>{stats.weekly.percentage}%</Text>
        </View>
        
        {/* Monthly */}
        <View style={styles.statRow}>
          <Text style={styles.label}>This Month:</Text>
          <Text style={styles.ratio}>
            {stats.monthly.completed}/{stats.monthly.total}
          </Text>
          <Text style={styles.visualBar}>{stats.monthly.visualBar}</Text>
          <Text style={styles.percentage}>{stats.monthly.percentage}%</Text>
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: SPACING.md,
    elevation: 2,
  },
  title: {
    ...TEXT_STYLES.h3,
    marginBottom: SPACING.md,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  label: {
    ...TEXT_STYLES.body2,
    width: 100,
    fontWeight: '600',
  },
  ratio: {
    ...TEXT_STYLES.body2,
    width: 50,
    color: COLORS.textSecondary,
  },
  visualBar: {
    ...TEXT_STYLES.body1,
    flex: 1,
    fontFamily: 'monospace',
    letterSpacing: 2,
  },
  percentage: {
    ...TEXT_STYLES.body2,
    width: 50,
    textAlign: 'right',
    fontWeight: 'bold',
    color: COLORS.primary,
  },
});

export default SessionProgressCard;