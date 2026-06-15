// components/Home/TodaySitesCard.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export interface SiteVisit {
  site: string;
  checkIn: string;
  checkOut?: string;
}

interface TodaySitesCardProps {
  sites: SiteVisit[];
  isPunchedIn: boolean;
}

export default function TodaySitesCard({ sites, isPunchedIn }: TodaySitesCardProps) {
  if (sites.length === 0) {
    return null;
  }

  return (
    <View style={styles.sitesCard}>
      <View style={styles.sitesHeader}>
        <MaterialCommunityIcons name="map-marker-multiple" size={15} color="#4b5563" />
        <Text style={styles.sitesTitle}>Today's Sites</Text>
        <View style={styles.sitesBadge}>
          <Text style={styles.sitesBadgeText}>{sites.length}</Text>
        </View>
      </View>

      {sites.map((site, index) => {
        const isLast = index === sites.length - 1;
        const showActiveBadge = isLast && isPunchedIn;

        return (
          <View key={index} style={styles.siteRow}>
            <View
              style={[
                styles.siteIndexDot,
                { backgroundColor: showActiveBadge ? '#22c55e' : '#d1d5db' },
              ]}
            />
            <View style={styles.siteInfo}>
              <Text style={styles.siteName}>{site.site}</Text>
              <Text style={styles.siteTime}>
                {site.checkOut
                  ? `${site.checkIn} → ${site.checkOut}`
                  : showActiveBadge
                  ? `${site.checkIn} · active`
                  : site.checkIn}
              </Text>
            </View>
            {showActiveBadge && (
              <View style={styles.activePill}>
                <Text style={styles.activePillText}>Active</Text>
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  sitesCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  sitesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  sitesTitle: {
    color: '#111827',
    fontSize: 14,
    fontWeight: '700',
    flex: 1,
  },
  sitesBadge: {
    backgroundColor: '#f3f4f6',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  sitesBadgeText: {
    color: '#6b7280',
    fontSize: 11,
    fontWeight: '800',
  },
  siteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
  },
  siteIndexDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  siteInfo: {
    flex: 1,
  },
  siteName: {
    color: '#111827',
    fontSize: 13,
    fontWeight: '700',
  },
  siteTime: {
    color: '#9ca3af',
    fontSize: 11,
    marginTop: 1,
  },
  activePill: {
    backgroundColor: '#dcfce7',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  activePillText: {
    color: '#16a34a',
    fontSize: 10,
    fontWeight: '700',
  },
});