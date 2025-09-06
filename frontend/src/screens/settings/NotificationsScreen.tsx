import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, RefreshControl, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NepalColors, FontSizes, Spacing } from '@/constants/theme';
import { getNotifications, markRead, markAllRead } from '@/services/notifications';
import { connectNotifications } from '@/services/ws';

export default function NotificationsScreen({ navigation }: any) {
  const [items, setItems] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getNotifications(0);
      if (res.ok) setItems(res.data?.content || res.data || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const disconnect = connectNotifications(() => {
      // On live notification, refresh list
      load();
    });
    return disconnect;
  }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const handleMarkRead = async (id: string) => {
    const res = await markRead(id);
    if (res.ok) setItems(prev => prev.map(n => (String(n.id) === String(id) ? { ...n, read: true } : n)));
    else Alert.alert('Error', res.data?.message || 'Failed to mark read');
  };

  const handleMarkAll = async () => {
    const res = await markAllRead();
    if (res.ok) setItems(prev => prev.map(n => ({ ...n, read: true })));
    else Alert.alert('Error', res.data?.message || 'Failed to mark all read');
  };

  const renderItem = ({ item }: any) => (
    <View style={[styles.item, !item.read && styles.unread] }>
      <View style={styles.itemLeft}>
        <Ionicons name={item.read ? 'notifications-outline' : 'notifications'} size={22} color={NepalColors.textLight} />
        <View style={styles.itemText}>
          <Text style={styles.itemTitle}>{item.title || 'Notification'}</Text>
          <Text style={styles.itemSubtitle}>{item.message || item.body || ''}</Text>
        </View>
      </View>
      {!item.read && (
        <TouchableOpacity style={styles.markBtn} onPress={() => handleMarkRead(item.id)}>
          <Text style={styles.markBtnText}>Mark Read</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={NepalColors.textLight} />
        </TouchableOpacity>
        <Text style={styles.title}>Notifications</Text>
        <TouchableOpacity onPress={handleMarkAll}>
          <Text style={styles.markAll}>Mark All</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={items}
        keyExtractor={(item) => String(item.id || Math.random())}
        renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={{ padding: Spacing.lg }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: NepalColors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.lg, paddingTop: Spacing['2xl'], paddingBottom: Spacing.md, backgroundColor: NepalColors.primary },
  title: { color: NepalColors.textLight, fontSize: FontSizes.lg, fontWeight: '700' },
  markAll: { color: NepalColors.textLight, fontWeight: '600' },
  item: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(0,0,0,0.6)', padding: Spacing.md, borderRadius: 12, marginBottom: Spacing.md },
  unread: { backgroundColor: 'rgba(220,20,60,0.18)' },
  itemLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  itemText: { marginLeft: Spacing.md, flex: 1 },
  itemTitle: { color: NepalColors.textLight, fontSize: FontSizes.base, fontWeight: '600' },
  itemSubtitle: { color: 'rgba(255,255,255,0.8)', fontSize: FontSizes.sm, marginTop: 2 },
  markBtn: { paddingHorizontal: 10, paddingVertical: 6, backgroundColor: NepalColors.secondary, borderRadius: 999 },
  markBtnText: { color: '#fff', fontWeight: '700', fontSize: FontSizes.sm },
});
