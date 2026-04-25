import React from 'react';
import { 
  StyleSheet, Text, View, TouchableOpacity, 
  FlatList, SafeAreaView, Platform 
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSocket, User } from '../context/SocketContext';

export default function HomeScreen() {
  const router = useRouter();
  const { users, currentUser, isConnected } = useSocket();

  // Filter out ourselves from the list
  const otherUsers = users.filter(u => u.id !== currentUser?.id);

  const renderUser = ({ item }: { item: User }) => {
    return (
      <TouchableOpacity 
        style={styles.userCard}
        onPress={() => router.push(`/chat/${item.id}`)}
      >
        <View style={styles.avatarContainer}>
          <Image 
            source={{ uri: item.avatar }} 
            style={styles.avatar} 
            contentFit="cover"
            transition={200}
          />
          {item.isOnline && <View style={styles.onlineBadge} />}
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.name}</Text>
          <Text style={styles.userStatus} numberOfLines={1}>
            {item.isOnline 
              ? "Online now" 
              : `Last active ${new Date(item.lastActive).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <LinearGradient 
          colors={['#ffffff', '#ffffff']} 
          style={styles.header}
        >
          <View style={styles.headerTop}>
            <Text style={styles.headerTitle}>Messages</Text>
            <View style={[styles.statusDot, { backgroundColor: isConnected ? '#4ade80' : '#f87171' }]} />
          </View>
          {currentUser && (
            <View style={styles.myProfile}>
               <Image source={{ uri: currentUser.avatar }} style={styles.myAvatar} />
               <Text style={styles.myName}>My Profile: {currentUser.name}</Text>
            </View>
          )}
        </LinearGradient>

        {otherUsers.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No other users right now.</Text>
            <Text style={styles.emptySubText}>Waiting for someone to join...</Text>
          </View>
        ) : (
          <FlatList
            data={otherUsers}
            keyExtractor={(item) => item.id}
            renderItem={renderUser}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f9fafb', },
  container: { flex: 1, },
  header: {
    paddingTop: Platform.OS === 'android' ? 40 : 20,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    zIndex: 10,
  },
  headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 15 },
  headerTitle: { color: '#111827', fontSize: 28, fontWeight: '800', letterSpacing: 0.5, },
  statusDot: { width: 10, height: 10, borderRadius: 5, },
  myProfile: { flexDirection: 'row', alignItems: 'center' },
  myAvatar: { width: 32, height: 32, borderRadius: 16, marginRight: 10, backgroundColor: '#e5e7eb' },
  myName: { color: '#6b7280', fontSize: 14, fontWeight: '500' },
  listContent: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 40, },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  avatarContainer: { position: 'relative', marginRight: 16, },
  avatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#e5e7eb' },
  onlineBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#4ade80',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  userInfo: { flex: 1, justifyContent: 'center', },
  userName: { color: '#111827', fontSize: 17, fontWeight: '600', marginBottom: 4, },
  userStatus: { color: '#6b7280', fontSize: 14, },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40, },
  emptyText: { color: '#111827', fontSize: 18, fontWeight: '600', textAlign: 'center', marginBottom: 8, },
  emptySubText: { color: '#6b7280', fontSize: 14, textAlign: 'center', }
});
