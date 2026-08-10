import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import { Search, Send, MessageSquare, Sparkles, User, Clock } from './Icons';

export function StudentChatView({ user }) {
  const [conversations, setConversations] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingChat, setLoadingChat] = useState(false);
  const [showNewChatDropdown, setShowNewChatDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const chatEndRef = useRef(null);
  const pollingInterval = useRef(null);

  // Load conversations and teachers
  const loadInitialData = async () => {
    try {
      const [convRes, teachersRes] = await Promise.all([
        api.getConversations(),
        api.getOnlineTeachers()
      ]);
      setConversations(convRes.conversations || []);
      setTeachers(teachersRes.teachers || []);
    } catch (err) {
      console.error('Error loading chat data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
    return () => {
      if (pollingInterval.current) clearInterval(pollingInterval.current);
    };
  }, []);

  // Fetch messages for selected teacher
  const fetchMessages = async (teacherId, silent = false) => {
    if (!silent) setLoadingChat(true);
    try {
      const res = await api.getChatHistory(teacherId);
      if (res.success) {
        setMessages(res.messages || []);
      }
    } catch (err) {
      console.error('Error fetching chat history:', err);
    } finally {
      if (!silent) setLoadingChat(false);
    }
  };

  // Start polling when selected teacher changes
  useEffect(() => {
    if (pollingInterval.current) {
      clearInterval(pollingInterval.current);
      pollingInterval.current = null;
    }

    if (selectedTeacher) {
      fetchMessages(selectedTeacher._id);
      
      // Poll every 3 seconds for new messages
      pollingInterval.current = setInterval(() => {
        fetchMessages(selectedTeacher._id, true);
        // Refresh conversations in background to update unread counts
        api.getConversations().then(res => {
          if (res.success) setConversations(res.conversations || []);
        });
      }, 3000);
    } else {
      setMessages([]);
    }

    return () => {
      if (pollingInterval.current) clearInterval(pollingInterval.current);
    };
  }, [selectedTeacher]);

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageInput.trim() || !selectedTeacher) return;

    const content = messageInput.trim();
    setMessageInput('');

    try {
      const res = await api.sendMessage(selectedTeacher._id, content);
      if (res.success) {
        setMessages(prev => [...prev, res.message]);
        // Refresh conversations list
        const convRes = await api.getConversations();
        if (convRes.success) setConversations(convRes.conversations || []);
      }
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  const handleSelectTeacher = (teacher) => {
    setSelectedTeacher(teacher);
    setShowNewChatDropdown(false);
    setSearchQuery('');
  };

  const filteredTeachers = teachers.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '320px 1fr',
      gap: '1.5rem',
      height: 'calc(100vh - 16rem)',
      minHeight: '500px',
      backgroundColor: 'var(--bg-card)',
      border: '1px solid var(--border-color)',
      borderRadius: '20px',
      overflow: 'hidden',
      boxShadow: 'var(--card-shadow)'
    }}>
      
      {/* Left Pane: Conversations & Online Teachers */}
      <div style={{
        borderRight: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'rgba(255, 255, 255, 0.01)',
        height: '100%'
      }}>
        
        {/* Pane Header */}
        <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border-color)', position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <MessageSquare size={18} style={{ color: 'var(--primary)' }} /> Messaging
            </h3>
            <button
              onClick={() => setShowNewChatDropdown(!showNewChatDropdown)}
              className="curious-btn-primary"
              style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', backgroundColor: 'var(--primary)', borderColor: 'var(--primary)' }}
            >
              + New Chat
            </button>
          </div>

          {/* New Chat Dropdown Popup */}
          {showNewChatDropdown && (
            <div className="glass-panel" style={{
              position: 'absolute',
              top: '100%',
              left: '1.25rem',
              right: '1.25rem',
              zIndex: 10,
              maxHeight: '300px',
              overflowY: 'auto',
              padding: '0.75rem',
              boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem'
            }}>
              <div style={{ position: 'relative', marginBottom: '0.5rem' }}>
                <Search size={14} style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
                <input
                  type="text"
                  placeholder="Search teachers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    padding: '0.4rem 0.5rem 0.4rem 2rem',
                    fontSize: '0.8rem',
                    width: '100%',
                    backgroundColor: 'rgba(0,0,0,0.2)'
                  }}
                />
              </div>

              {filteredTeachers.length === 0 ? (
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1rem' }}>
                  No teachers found.
                </div>
              ) : (
                filteredTeachers.map(t => (
                  <div
                    key={t._id}
                    onClick={() => handleSelectTeacher(t)}
                    style={{
                      padding: '0.5rem',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      transition: 'background 0.2s',
                      backgroundColor: 'rgba(255,255,255,0.02)'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)'}
                  >
                    <div style={{ position: 'relative' }}>
                      <img
                        src={t.profile?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                        alt={t.name}
                        style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
                      />
                      <span style={{
                        position: 'absolute',
                        bottom: 0,
                        right: 0,
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: t.isOnline ? '#10b981' : '#64748b',
                        border: '1.5px solid var(--bg-card)'
                      }} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)' }}>{t.name}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{t.profile?.qualification || 'Faculty'}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Conversations List */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
          {loading ? (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', padding: '2rem', textAlign: 'center' }}>
              Loading chats...
            </div>
          ) : conversations.length === 0 ? (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', padding: '3rem 1.5rem', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center' }}>
              <MessageSquare size={32} style={{ opacity: 0.3 }} />
              <div>No active conversations</div>
              <button
                onClick={() => setShowNewChatDropdown(true)}
                className="curious-btn-outline"
                style={{ padding: '0.35rem 0.8rem', fontSize: '0.75rem', marginTop: '0.5rem' }}
              >
                Start a conversation
              </button>
            </div>
          ) : (
            conversations.map((conv) => {
              const otherUser = conv.user;
              const isSelected = selectedTeacher && selectedTeacher._id === otherUser._id;
              const isOnline = teachers.find(t => t._id === otherUser._id)?.isOnline;
              const lastMsgText = conv.lastMessage?.content || '';
              const timeStr = conv.lastMessage?.createdAt 
                ? new Date(conv.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : '';

              return (
                <div
                  key={otherUser._id}
                  onClick={() => setSelectedTeacher(otherUser)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '1rem',
                    borderBottom: '1px solid rgba(255,255,255,0.03)',
                    cursor: 'pointer',
                    backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.12)' : 'transparent',
                    borderLeft: isSelected ? '4px solid #3b82f6' : '4px solid transparent',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)'; }}
                  onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent'; }}
                >
                  <div style={{ position: 'relative', flexShrink: 0 }}>
                    <img
                      src={otherUser.profile?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                      alt={otherUser.name}
                      style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border-color)' }}
                    />
                    <span style={{
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      backgroundColor: isOnline ? '#10b981' : '#64748b',
                      border: '2px solid var(--bg-card)'
                    }} />
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.2rem' }}>
                      <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {otherUser.name}
                      </h4>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>{timeStr}</span>
                    </div>
                    <p style={{
                      fontSize: '0.78rem',
                      color: conv.unreadCount > 0 ? 'var(--text-main)' : 'var(--text-muted)',
                      fontWeight: conv.unreadCount > 0 ? 800 : 400,
                      margin: 0,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {lastMsgText}
                    </p>
                  </div>

                  {conv.unreadCount > 0 && (
                    <span style={{
                      backgroundColor: '#3b82f6',
                      color: '#fff',
                      borderRadius: '50%',
                      minWidth: '18px',
                      height: '18px',
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '0 0.2rem'
                    }}>
                      {conv.unreadCount}
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right Pane: Message Thread */}
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.05)' }}>
        {selectedTeacher ? (
          <>
            {/* Thread Header */}
            <div style={{
              padding: '1rem 1.25rem',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              justify: 'space-between',
              alignItems: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.02)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ position: 'relative' }}>
                  <img
                    src={selectedTeacher.profile?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                    alt={selectedTeacher.name}
                    style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary)' }}
                  />
                  <span style={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    backgroundColor: teachers.find(t => t._id === selectedTeacher._id)?.isOnline ? '#10b981' : '#64748b',
                    border: '2px solid var(--bg-card)'
                  }} />
                </div>
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                    {selectedTeacher.name}
                  </h4>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {selectedTeacher.profile?.qualification || 'BK Faculty Member'}
                    <span style={{ marginLeft: '0.5rem', color: teachers.find(t => t._id === selectedTeacher._id)?.isOnline ? '#10b981' : 'var(--text-dim)', fontWeight: 700 }}>
                      ● {teachers.find(t => t._id === selectedTeacher._id)?.isOnline ? 'Online / Available' : 'Offline'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Messages Scroll Area */}
            <div style={{
              flex: 1,
              padding: '1.25rem',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.01) 1px, transparent 0)',
              backgroundSize: '16px 16px'
            }}>
              {loadingChat ? (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 'auto', textAlign: 'center' }}>
                  Loading chat history...
                </div>
              ) : messages.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 'auto', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '0.4rem', alignItems: 'center' }}>
                  <Sparkles size={24} style={{ color: 'var(--primary)', opacity: 0.6 }} />
                  <div>This is the start of your conversation with {selectedTeacher.name}.</div>
                  <div style={{ fontSize: '0.75rem' }}>Ask doubt, send homework query, or seek academic advice!</div>
                </div>
              ) : (
                messages.map((msg) => {
                  const isMe = msg.sender === user._id;
                  const time = new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                  return (
                    <div
                      key={msg._id}
                      style={{
                        alignSelf: isMe ? 'flex-end' : 'flex-start',
                        maxWidth: '70%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: isMe ? 'flex-end' : 'flex-start'
                      }}
                    >
                      <div style={{
                        padding: '0.75rem 1rem',
                        borderRadius: isMe ? '18px 18px 2px 18px' : '18px 18px 18px 2px',
                        backgroundColor: isMe ? 'rgba(168, 85, 247, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                        border: isMe ? '1px solid rgba(168, 85, 247, 0.4)' : '1px solid var(--border-color)',
                        color: 'var(--text-main)',
                        fontSize: '0.88rem',
                        lineHeight: 1.5,
                        wordBreak: 'break-word',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                      }}>
                        {msg.content}
                      </div>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                        <Clock size={10} /> {time}
                      </span>
                    </div>
                  );
                })
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input Message Form */}
            <form onSubmit={handleSendMessage} style={{
              padding: '1rem 1.25rem',
              borderTop: '1px solid var(--border-color)',
              backgroundColor: 'rgba(255, 255, 255, 0.02)',
              display: 'flex',
              gap: '0.75rem'
            }}>
              <input
                type="text"
                placeholder={`Type message for ${selectedTeacher.name}...`}
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                style={{
                  flex: 1,
                  padding: '0.7rem 1rem',
                  borderRadius: '10px',
                  backgroundColor: 'var(--bg-dark)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-main)',
                  fontSize: '0.85rem'
                }}
              />
              <button
                type="submit"
                className="curious-btn-primary"
                style={{ padding: '0.7rem 1.2rem', display: 'flex', alignItems: 'center', gap: '0.4rem', backgroundColor: 'var(--primary)', borderColor: 'var(--primary)' }}
              >
                <Send size={16} /> Send
              </button>
            </form>
          </>
        ) : (
          <div style={{ margin: 'auto', textAlign: 'center', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center', color: 'var(--text-muted)' }}>
            <MessageSquare size={48} style={{ opacity: 0.2, color: 'var(--primary)' }} />
            <h3 style={{ margin: 0, fontWeight: 800 }}>Student-Teacher Chat Room</h3>
            <p style={{ fontSize: '0.85rem', maxWidth: '360px', lineHeight: 1.5 }}>
              Select a conversation from the sidebar or click "New Chat" to contact one of our 30 certified instructors.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
