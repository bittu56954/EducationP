import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import { Search, Send, MessageSquare, Sparkles, User, Clock, CheckCircle } from './Icons';

export function TeacherChatView({ user }) {
  const [activeSubTab, setActiveSubTab] = useState('chats'); // 'chats' | 'doubts'
  
  // Direct Messaging State
  const [conversations, setConversations] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [showNewChatDropdown, setShowNewChatDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingChat, setLoadingChat] = useState(false);

  // Doubts Desk State
  const [doubts, setDoubts] = useState([]);
  const [answersMap, setAnswersMap] = useState({});
  const [loadingDoubts, setLoadingDoubts] = useState(true);

  const chatEndRef = useRef(null);
  const pollingInterval = useRef(null);

  // Fetch initial chats, students list and doubts
  const loadInitialData = async () => {
    try {
      const [convRes, studentsRes] = await Promise.all([
        api.getConversations(),
        api.getEnrolledStudents()
      ]);
      setConversations(convRes.conversations || []);
      setStudents(studentsRes.students || []);
    } catch (err) {
      console.error('Error loading teacher chat data:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadDoubts = async () => {
    setLoadingDoubts(true);
    try {
      // In fallback or real backend, we load doubts using classId: null to get general course doubts,
      // or check doubts where this teacher is assigned. Let's fetch using a fallback query.
      // We pass undefined/null classId to query all doubts
      const res = await api.getClassDoubts('null');
      if (res.success) {
        // Filter doubts where teacher is this user
        const teacherDoubts = (res.doubts || []).filter(d => 
          (d.teacher?._id || d.teacher) === user._id
        );
        setDoubts(teacherDoubts);
      }
    } catch (err) {
      console.error('Error loading doubts:', err);
    } finally {
      setLoadingDoubts(false);
    }
  };

  useEffect(() => {
    loadInitialData();
    loadDoubts();
    return () => {
      if (pollingInterval.current) clearInterval(pollingInterval.current);
    };
  }, []);

  // Fetch chat history for selected student
  const fetchMessages = async (studentId, silent = false) => {
    if (!silent) setLoadingChat(true);
    try {
      const res = await api.getChatHistory(studentId);
      if (res.success) {
        setMessages(res.messages || []);
      }
    } catch (err) {
      console.error('Error fetching chat history:', err);
    } finally {
      if (!silent) setLoadingChat(false);
    }
  };

  // Start polling when selected student changes
  useEffect(() => {
    if (pollingInterval.current) {
      clearInterval(pollingInterval.current);
      pollingInterval.current = null;
    }

    if (selectedStudent) {
      fetchMessages(selectedStudent._id);
      
      pollingInterval.current = setInterval(() => {
        fetchMessages(selectedStudent._id, true);
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
  }, [selectedStudent]);

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageInput.trim() || !selectedStudent) return;

    const content = messageInput.trim();
    setMessageInput('');

    try {
      const res = await api.sendMessage(selectedStudent._id, content);
      if (res.success) {
        setMessages(prev => [...prev, res.message]);
        const convRes = await api.getConversations();
        if (convRes.success) setConversations(convRes.conversations || []);
      }
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  const handleSelectStudent = (student) => {
    setSelectedStudent(student);
    setShowNewChatDropdown(false);
    setSearchQuery('');
  };

  const handleReplyDoubt = async (doubtId) => {
    const answer = answersMap[doubtId];
    if (!answer || !answer.trim()) return;

    try {
      const res = await api.replyToDoubt(doubtId, answer.trim());
      if (res.success) {
        // Update doubts list
        setDoubts(prev => prev.map(d => d._id === doubtId ? { ...d, answer: answer.trim(), isResolved: true } : d));
        setAnswersMap(prev => ({ ...prev, [doubtId]: '' }));
      }
    } catch (err) {
      console.error('Error replying to doubt:', err);
    }
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* Sub tabs: Chats vs doubts */}
      <div style={{ display: 'flex', gap: '0.75rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
        <button
          onClick={() => setActiveSubTab('chats')}
          style={{
            padding: '0.5rem 1.2rem',
            borderRadius: '8px',
            border: activeSubTab === 'chats' ? '1px solid #a855f7' : '1px solid transparent',
            backgroundColor: activeSubTab === 'chats' ? 'rgba(168, 85, 247, 0.15)' : 'transparent',
            color: activeSubTab === 'chats' ? '#a855f7' : 'var(--text-muted)',
            fontWeight: 700,
            fontSize: '0.85rem',
            cursor: 'pointer'
          }}
        >
          💬 Student Messages ({conversations.length})
        </button>
        <button
          onClick={() => { setActiveSubTab('doubts'); loadDoubts(); }}
          style={{
            padding: '0.5rem 1.2rem',
            borderRadius: '8px',
            border: activeSubTab === 'doubts' ? '1px solid #a855f7' : '1px solid transparent',
            backgroundColor: activeSubTab === 'doubts' ? 'rgba(168, 85, 247, 0.15)' : 'transparent',
            color: activeSubTab === 'doubts' ? '#a855f7' : 'var(--text-muted)',
            fontWeight: 700,
            fontSize: '0.85rem',
            cursor: 'pointer'
          }}
        >
          ❓ Doubt Desk ({doubts.filter(d => !d.isResolved).length} pending)
        </button>
      </div>

      {activeSubTab === 'chats' ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: '320px 1fr',
          gap: '1.5rem',
          height: 'calc(100vh - 20rem)',
          minHeight: '480px',
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '20px',
          overflow: 'hidden',
          boxShadow: 'var(--card-shadow)'
        }}>
          
          {/* Left Pane: Conversations */}
          <div style={{
            borderRight: '1px solid var(--border-color)',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: 'rgba(255, 255, 255, 0.01)',
            height: '100%'
          }}>
            <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border-color)', position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <MessageSquare size={18} style={{ color: '#a855f7' }} /> Conversations
                </h3>
                <button
                  onClick={() => setShowNewChatDropdown(!showNewChatDropdown)}
                  className="curious-btn-primary"
                  style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', backgroundColor: '#a855f7', borderColor: '#a855f7' }}
                >
                  + Start Chat
                </button>
              </div>

              {/* New Chat popup */}
              {showNewChatDropdown && (
                <div className="glass-panel" style={{
                  position: 'absolute',
                  top: '100%',
                  left: '1.25rem',
                  right: '1.25rem',
                  zIndex: 10,
                  maxHeight: '260px',
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
                      placeholder="Search students..."
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

                  {filteredStudents.length === 0 ? (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1rem' }}>
                      No students found.
                    </div>
                  ) : (
                    filteredStudents.map(s => (
                      <div
                        key={s._id}
                        onClick={() => handleSelectStudent(s)}
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
                        <img
                          src={s.profile?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=student'}
                          alt={s.name}
                          style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }}
                        />
                        <div>
                          <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)' }}>{s.name}</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{s.email}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
              {loading ? (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', padding: '2rem', textAlign: 'center' }}>
                  Loading conversations...
                </div>
              ) : conversations.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', padding: '3rem 1.5rem', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center' }}>
                  <MessageSquare size={32} style={{ opacity: 0.3 }} />
                  <div>No active chats</div>
                  <button
                    onClick={() => setShowNewChatDropdown(true)}
                    className="curious-btn-outline"
                    style={{ padding: '0.35rem 0.8rem', fontSize: '0.75rem', marginTop: '0.5rem' }}
                  >
                    Start messaging
                  </button>
                </div>
              ) : (
                conversations.map((conv) => {
                  const otherUser = conv.user;
                  const isSelected = selectedStudent && selectedStudent._id === otherUser._id;
                  const lastMsgText = conv.lastMessage?.content || '';
                  const timeStr = conv.lastMessage?.createdAt 
                    ? new Date(conv.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : '';

                  return (
                    <div
                      key={otherUser._id}
                      onClick={() => setSelectedStudent(otherUser)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '1rem',
                        borderBottom: '1px solid rgba(255,255,255,0.03)',
                        cursor: 'pointer',
                        backgroundColor: isSelected ? 'rgba(168, 85, 247, 0.12)' : 'transparent',
                        borderLeft: isSelected ? '4px solid #a855f7' : '4px solid transparent',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)'; }}
                      onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent'; }}
                    >
                      <img
                        src={otherUser.profile?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=student'}
                        alt={otherUser.name}
                        style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border-color)' }}
                      />

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
                          backgroundColor: '#a855f7',
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

          {/* Right Pane: Thread */}
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.05)' }}>
            {selectedStudent ? (
              <>
                <div style={{
                  padding: '1rem 1.25rem',
                  borderBottom: '1px solid var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: 'rgba(255, 255, 255, 0.02)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <img
                      src={selectedStudent.profile?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=student'}
                      alt={selectedStudent.name}
                      style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #a855f7' }}
                    />
                    <div>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                        {selectedStudent.name}
                      </h4>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Student • {selectedStudent.email}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Messages List */}
                <div style={{
                  flex: 1,
                  padding: '1.25rem',
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem'
                }}>
                  {loadingChat ? (
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 'auto', textAlign: 'center' }}>
                      Loading chat...
                    </div>
                  ) : messages.length === 0 ? (
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 'auto', textAlign: 'center' }}>
                      No messages yet. Send a message to start conversation.
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
                            lineHeight: 1.5
                          }}>
                            {msg.content}
                          </div>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '0.25rem' }}>
                            {time}
                          </span>
                        </div>
                      );
                    })
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Input form */}
                <form onSubmit={handleSendMessage} style={{
                  padding: '1rem 1.25rem',
                  borderTop: '1px solid var(--border-color)',
                  backgroundColor: 'rgba(255, 255, 255, 0.02)',
                  display: 'flex',
                  gap: '0.75rem'
                }}>
                  <input
                    type="text"
                    placeholder={`Type message for ${selectedStudent.name}...`}
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
                    style={{ padding: '0.7rem 1.2rem', display: 'flex', alignItems: 'center', gap: '0.4rem', backgroundColor: '#a855f7', borderColor: '#a855f7' }}
                  >
                    <Send size={16} /> Send
                  </button>
                </form>
              </>
            ) : (
              <div style={{ margin: 'auto', textAlign: 'center', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center', color: 'var(--text-muted)' }}>
                <MessageSquare size={48} style={{ opacity: 0.2, color: '#a855f7' }} />
                <h3 style={{ margin: 0 }}>Student Communications</h3>
                <p style={{ fontSize: '0.85rem', maxWidth: '360px' }}>
                  Select a student from the sidebar or click "Start Chat" to send a direct message.
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Doubt Desk tab content */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
            ❓ Doubt Resolution Board
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
            Resolve questions posted by students inside classroom modules or live interactive sessions.
          </p>

          {loadingDoubts ? (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.88rem', padding: '3rem', textAlign: 'center' }}>
              Loading student doubts...
            </div>
          ) : doubts.length === 0 ? (
            <div className="glass-panel" style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🎉</div>
              <h4 style={{ color: 'var(--text-main)' }}>Doubt Desk is Clean!</h4>
              <p style={{ fontSize: '0.88rem' }}>No student doubts assigned or pending. You will receive notifications when doubts are posted.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {doubts.map((doubt) => {
                const isPending = !doubt.isResolved;
                const studentName = doubt.student?.name || 'Student';
                const studentAvatar = doubt.student?.profile?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=student';
                const dateStr = new Date(doubt.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

                return (
                  <div
                    key={doubt._id}
                    className="glass-card"
                    style={{
                      padding: '1.25rem',
                      borderLeft: isPending ? '4px solid #ef4444' : '4px solid #10b981',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.85rem'
                    }}
                  >
                    {/* Header info */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <img src={studentAvatar} alt={studentName} style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }} />
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>{studentName}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>• {dateStr}</span>
                      </div>
                      <span className="badge" style={{
                        backgroundColor: isPending ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                        color: isPending ? '#ef4444' : '#10b981',
                        border: `1px solid ${isPending ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`,
                        fontSize: '0.75rem'
                      }}>
                        {isPending ? '⏳ Pending Answer' : '✓ Resolved'}
                      </span>
                    </div>

                    {/* Question text */}
                    <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)', paddingLeft: '2rem' }}>
                      💡 Question: "{doubt.question}"
                    </div>

                    {/* Answer section */}
                    {isPending ? (
                      <div style={{ display: 'flex', gap: '0.5rem', paddingLeft: '2rem' }}>
                        <input
                          type="text"
                          placeholder="Type your explanation or answer..."
                          value={answersMap[doubt._id] || ''}
                          onChange={(e) => setAnswersMap(prev => ({ ...prev, [doubt._id]: e.target.value }))}
                          style={{
                            flex: 1,
                            padding: '0.5rem 0.8rem',
                            borderRadius: '8px',
                            backgroundColor: 'var(--bg-dark)',
                            border: '1px solid var(--border-color)',
                            color: 'var(--text-main)',
                            fontSize: '0.85rem'
                          }}
                        />
                        <button
                          onClick={() => handleReplyDoubt(doubt._id)}
                          className="curious-btn-primary"
                          style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', backgroundColor: '#a855f7', borderColor: '#a855f7' }}
                        >
                          Resolve & Reply
                        </button>
                      </div>
                    ) : (
                      <div style={{
                        marginLeft: '2rem',
                        padding: '0.75rem 1rem',
                        borderRadius: '8px',
                        backgroundColor: 'rgba(16, 185, 129, 0.05)',
                        border: '1px solid rgba(16, 185, 129, 0.2)',
                        fontSize: '0.88rem',
                        color: 'var(--text-muted)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.2rem'
                      }}>
                        <strong style={{ color: '#10b981', fontSize: '0.8rem', textTransform: 'uppercase' }}>✓ Your Response:</strong>
                        <div>{doubt.answer}</div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
