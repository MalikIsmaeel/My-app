// App.js - الكود الكامل جاهز للتشغيل
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';

const LiveSessionDashboard = () => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Top Navigation Bar */}
      <View style={styles.header}>
        <View>
          <Text style={styles.brand}>ProAnalytics Medical</Text>
          <Text style={styles.title}>Motion Performance</Text>
        </View>
        <View style={styles.liveBadge}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>LIVE</Text>
        </View>
      </View>

      {/* Session Timer Bar */}
      <View style={styles.sectionWrapper}>
        <View style={[styles.glassCard, styles.timerCard]}>
          <View>
            <Text style={styles.timerLabel}>SESSION TIME</Text>
            <Text style={styles.timerValue}>
              04:25
              <Text style={styles.timerSub}>.82</Text>
            </Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.sensorLabel}>SENSOR STATUS</Text>
            <Text style={styles.sensorValue}>MPU6050 Connected</Text>
          </View>
        </View>
      </View>

      {/* Main Content */}
      <View style={styles.main}>
        {/* Accelerometer */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              Accelerometer <Text style={styles.sectionUnit}>(m/s²)</Text>
            </Text>
            <View style={styles.sectionDivider} />
          </View>
          <View style={styles.grid3}>
            <AxisCard label="AXIS X" value="42" highlight />
            <AxisCard label="AXIS Y" value="88" highlight />
            <AxisCard label="AXIS Z" value="15" highlight />
          </View>
        </View>

        {/* Gyroscope */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitleMuted}>
              Gyroscope <Text style={styles.sectionUnit}>(deg/s)</Text>
            </Text>
            <View style={styles.sectionDividerMuted} />
          </View>
          <View style={styles.grid3}>
            <AxisCard label="AXIS X" value="09" />
            <AxisCard label="AXIS Y" value="12" />
            <AxisCard label="AXIS Z" value="04" />
          </View>
        </View>

        {/* Secondary Stats */}
        <View style={styles.grid2}>
          <View style={[styles.glassCard, styles.secondaryCard, styles.borderPrimary]}>
            <Text style={styles.secondaryLabel}>PEAK FORCE</Text>
            <View style={styles.secondaryRow}>
              <Text style={styles.secondaryValue}>12.4</Text>
              <Text style={styles.secondaryUnitPrimary}>G</Text>
            </View>
          </View>
          <View style={[styles.glassCard, styles.secondaryCard, styles.borderGreen]}>
            <Text style={styles.secondaryLabel}>EFFICIENCY</Text>
            <View style={styles.secondaryRow}>
              <Text style={styles.secondaryValue}>94</Text>
              <Text style={styles.secondaryUnitGreen}>%</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Bottom Controls */}
      <View style={styles.bottomContainer}>
        <View style={styles.controlsRow}>
          <TouchableOpacity style={styles.startButton}>
            <Text style={styles.startButtonText}>Start Session</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.pauseButton}>
            <Text style={styles.pauseButtonText}>Pause</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.endButton}>
          <View style={styles.endDot} />
          <Text style={styles.endButtonText}>End Analysis Session</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const AxisCard = ({ label, value, highlight = false }) => (
  <View style={[styles.glassCard, styles.axisCard, highlight && styles.axisCardHighlight]}>
    <Text style={styles.axisLabel}>{label}</Text>
    <Text style={[styles.axisValue, highlight && styles.axisValueHighlight]}>{value}</Text>
  </View>
);

export default function App() {
  return <LiveSessionDashboard />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0F14',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brand: {
    fontSize: 10,
    letterSpacing: 2,
    color: 'rgba(13,166,242,0.7)',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#F9FAFB',
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(57,255,20,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(57,255,20,0.2)',
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: '#39ff14',
    marginRight: 6,
  },
  liveText: {
    fontSize: 10,
    letterSpacing: 2,
    color: '#39ff14',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
