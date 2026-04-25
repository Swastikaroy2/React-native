import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, Text, View, TextInput, TouchableOpacity, 
  FlatList, KeyboardAvoidingView, Platform, SafeAreaView 
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useSocket, Message } from '../../context/SocketContext';

export default function ChatScreen() {
  const { id: targetUserId } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { socket, currentUser, users, messages } = useSocket();
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef<FlatList>(null);

  const targetUser = users.find(u => u.id === targetUserId);

  // Filter messages for this specific conversation
  const conversation = messages.filter(
    (m) => 
      (m.senderId === currentUser?.id && m.targetUserId === targetUserId) ||
      (m.senderId === targetUserId && m.targetUserId === currentUser?.id)
  );

  useEffect(() => {
    if (!socket || !currentUser || !targetUserId) return;

    // Mark all received messages from this user as seen
    const unreadMessages = conversation.filter(
      (m) => m.senderId === targetUserId && m.status !== 'seen'
    );

    unreadMessages.forEach((msg) => {
      socket.emit('mark-seen', msg.id);
    });

  }, [conversation.length, targetUserId, socket, currentUser]);

  const sendMessage = () => {
    if (inputText.trim().length === 0 || !socket || !targetUserId) return;
    
    socket.emit('send-message', {
      text: inputText.trim(),
      targetUserId,
    });
    
    setInputText('');
  };

  const renderStatus = (status: string) => {
    switch (status) {
      case 'sent':
        return <Ionicons name="checkmark-outline" size={14} color="rgba(255,255,255,0.7)" />;
      case 'delivered':
        return <Ionicons name="checkmark-done-outline" size={14} color="rgba(255,255,255,0.7)" />;
      case 'seen':
        return <Ionicons name="checkmark-done-outline" size={14} color="#a7f3d0" />;
      default:
        return null;
    }
  };

  const renderBubble = ({ item }: { item: Message }) => {
    const isMe = item.senderId === currentUser?.id;
    return (
      <View style={[styles.messageBubbleWrapper, isMe ? styles.myBubbleWrapper : styles.theirBubbleWrapper]}>
        {!isMe && targetUser && (
          <Image source={{ uri: targetUser.avatar }} style={styles.bubbleAvatar} />
        )}
        <View style={isMe ? styles.myBubbleContainer : styles.theirBubbleContainer}>
          {isMe ? (
            <LinearGradient 
              colors={['#6C63FF', '#8B5CF6']} 
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={[styles.messageBubble, styles.myBubble]}
            >
              <Text style={styles.myMessageText}>{item.text}</Text>
              <View style={styles.metaContainer}>
                <Text style={styles.timestampMuted}>
                  {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
                <View style={styles.statusIcon}>{renderStatus(item.status)}</View>
              </View>
            </LinearGradient>
          ) : (
            <View style={[styles.messageBubble, styles.theirBubble]}>
              <Text style={styles.theirMessageText}>{item.text}</Text>
              <Text style={styles.theirTimestamp}>
                {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  if (!targetUser) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={{color: '#111827'}}>User not found or disconnected.</Text>
        <TouchableOpacity onPress={() => router.back()} style={{marginTop: 20}}>
            <Text style={{color: '#8B5CF6', fontWeight: 'bold'}}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <LinearGradient 
          colors={['#ffffff', '#ffffff']} 
          style={styles.header}
        >
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="#111827" />
          </TouchableOpacity>
          <Image source={{ uri: targetUser.avatar }} style={styles.headerAvatar} />
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>{targetUser.name}</Text>
            <Text style={styles.headerSubtitle}>
               {targetUser.isOnline 
                 ? 'Online' 
                 : `Last active ${new Date(targetUser.lastActive).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
            </Text>
          </View>
        </LinearGradient>

        <FlatList
          ref={flatListRef}
          data={conversation}
          keyExtractor={(item) => item.id}
          renderItem={renderBubble}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />

        <BlurView intensity={80} tint="light" style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Type your message..."
            placeholderTextColor="#9ca3af"
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={1000}
          />
          <TouchableOpacity 
            style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]} 
            onPress={sendMessage}
            disabled={!inputText.trim()}
          >
            <LinearGradient
              colors={inputText.trim() ? ['#6C63FF', '#8B5CF6'] : ['#d1d5db', '#e5e7eb']}
              style={styles.sendButtonGradient}
            >
              <Ionicons name="send" size={18} color="white" />
            </LinearGradient>
          </TouchableOpacity>
        </BlurView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f9fafb', },
  container: { flex: 1, },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f9fafb' },
  header: {
    paddingTop: Platform.OS === 'android' ? 40 : 20,
    paddingHorizontal: 16,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    zIndex: 10,
  },
  backButton: { marginRight: 12, },
  headerAvatar: { width: 40, height: 40, borderRadius: 20, marginRight: 12, backgroundColor: '#e5e7eb' },
  headerInfo: { flex: 1, },
  headerTitle: { color: '#111827', fontSize: 18, fontWeight: '700', },
  headerSubtitle: { color: '#6b7280', fontSize: 13, },
  listContent: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 100, },
  messageBubbleWrapper: { flexDirection: 'row', marginBottom: 16, alignItems: 'flex-end', },
  myBubbleWrapper: { justifyContent: 'flex-end', },
  theirBubbleWrapper: { justifyContent: 'flex-start', },
  bubbleAvatar: { width: 28, height: 28, borderRadius: 14, marginRight: 8, backgroundColor: '#e5e7eb', marginBottom: 4 },
  myBubbleContainer: { maxWidth: '80%', },
  theirBubbleContainer: { maxWidth: '80%', },
  messageBubble: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 20, },
  myBubble: { borderBottomRightRadius: 4, },
  theirBubble: { backgroundColor: '#ffffff', borderBottomLeftRadius: 4, borderWidth: 1, borderColor: '#f3f4f6', shadowColor: '#000', shadowOffset: {width: 0, height: 1}, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  myMessageText: { color: '#fff', fontSize: 16, lineHeight: 22, },
  theirMessageText: { color: '#111827', fontSize: 16, lineHeight: 22, },
  metaContainer: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-end', marginTop: 4 },
  timestampMuted: { color: 'rgba(255,255,255,0.7)', fontSize: 10, marginTop: 4 },
  theirTimestamp: { color: '#9ca3af', fontSize: 10, alignSelf: 'flex-end', marginTop: 4 },
  statusIcon: { marginLeft: 4, marginTop: 4 },
  inputContainer: {
    paddingHorizontal: 16, paddingTop: 12, paddingBottom: Platform.OS === 'ios' ? 32 : 20,
    borderTopWidth: 1, borderTopColor: '#e5e7eb', flexDirection: 'row', alignItems: 'center',
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: 'rgba(255,255,255,0.9)'
  },
  input: {
    flex: 1, backgroundColor: '#f3f4f6', color: '#111827', borderRadius: 24, paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 14 : 12, paddingBottom: Platform.OS === 'ios' ? 14 : 12,
    fontSize: 16, maxHeight: 120, borderWidth: 1, borderColor: '#e5e7eb',
  },
  sendButton: { marginLeft: 12, },
  sendButtonDisabled: { opacity: 0.7, },
  sendButtonGradient: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center',
    shadowColor: '#8B5CF6', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 3,
  },
});
