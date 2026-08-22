/* ===== LifeLink Floating Messaging Widget & User-to-User Chat Module ===== */

// Default Seed Conversations
const DEFAULT_CHAT_CONVERSATIONS = [
  {
    id: 'conv_ayan_das',
    participant: {
      id: 'donor_ayan',
      name: 'Ayan Das',
      blood: 'O+',
      city: 'Mumbai',
      role: 'Donor',
      status: 'Available Now'
    },
    unreadCount: 0,
    lastUpdated: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    messages: [
      { id: 'm1', sender: 'them', text: 'Hello! I saw your urgent request for O+ blood in Mumbai. Is it still needed?', timestamp: '12:40 PM' },
      { id: 'm2', sender: 'user', text: 'Yes! We urgently need 2 units at Lilavati Hospital.', timestamp: '12:42 PM' },
      { id: 'm3', sender: 'them', text: 'I can reach the hospital by 4 PM today. Please confirm the patient details.', timestamp: '12:45 PM' }
    ]
  },
  {
    id: 'conv_priya_patel',
    participant: {
      id: 'donor_priya',
      name: 'Priya Patel',
      blood: 'A+',
      city: 'Delhi',
      role: 'Donor',
      status: 'Available Now'
    },
    unreadCount: 0,
    lastUpdated: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    messages: [
      { id: 'm4', sender: 'them', text: 'Hi! I am registered as an A+ donor in Delhi.', timestamp: '10:15 AM' },
      { id: 'm5', sender: 'user', text: 'Thank you Priya! We will contact you if any emergency arises.', timestamp: '10:18 AM' }
    ]
  },
  {
    id: 'conv_city_bank',
    participant: {
      id: 'bank_city',
      name: 'City Life Blood Bank',
      blood: 'BANK',
      city: 'Mumbai',
      role: 'Blood Bank',
      status: 'Stock Available'
    },
    unreadCount: 0,
    lastUpdated: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    messages: [
      { id: 'm6', sender: 'them', text: 'Welcome to LifeLink Chat! We currently have adequate reserved stock for O+, A+, and B+ units.', timestamp: 'Yesterday' }
    ]
  }
];

// Chat Global State
let chatConversations = [];
let isChatExpanded = false;
let activeChatId = null;
let mobileChatView = 'list'; // 'list' or 'chat'
let chatSearchFilter = '';
let currentSenderRole = 'user'; // 'user' (You) or 'them' (Participant)

// Initialize Chat Module
function initChatModule() {
  const savedData = localStorage.getItem('lifelink_chat_conversations');
  if (savedData) {
    try {
      chatConversations = JSON.parse(savedData);
    } catch (e) {
      chatConversations = [...DEFAULT_CHAT_CONVERSATIONS];
    }
  } else {
    chatConversations = [...DEFAULT_CHAT_CONVERSATIONS];
  }

  // Ensure DOM contains the floating chat widget
  injectChatWidgetDOM();
  updateChatUnreadBadge();
}

function saveChatState() {
  try {
    localStorage.setItem('lifelink_chat_conversations', JSON.stringify(chatConversations));
  } catch (e) {
    console.error('Failed to save chat state:', e);
  }
}

// Calculate total unread messages
function getChatTotalUnread() {
  return chatConversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0);
}

function updateChatUnreadBadge() {
  const launcherBadge = document.getElementById('chat-launcher-unread-badge');
  const totalUnread = getChatTotalUnread();

  if (launcherBadge) {
    if (totalUnread > 0) {
      launcherBadge.textContent = totalUnread > 99 ? '99+' : totalUnread;
      launcherBadge.style.display = 'flex';
    } else {
      launcherBadge.style.display = 'none';
    }
  }
}

// Inject DOM Elements for Floating Chat
function injectChatWidgetDOM() {
  if (document.getElementById('lifelink-chat-launcher')) return;

  // Floating Launcher Button
  const launcherBtn = document.createElement('button');
  launcherBtn.id = 'lifelink-chat-launcher';
  launcherBtn.className = 'chat-launcher-btn';
  launcherBtn.setAttribute('aria-label', 'Open LifeLink Messages');
  launcherBtn.setAttribute('title', 'Open LifeLink Messages');
  launcherBtn.onclick = toggleChatWindow;
  launcherBtn.innerHTML = `
    ${SVG_ICONS.message(26, '#ffffff')}
    <span id="chat-launcher-unread-badge" class="chat-launcher-badge" style="display: none;">0</span>
  `;

  // Expanded Chat Window Container
  const chatWindow = document.createElement('div');
  chatWindow.id = 'lifelink-chat-window';
  chatWindow.className = 'chat-window hidden';

  document.body.appendChild(launcherBtn);
  document.body.appendChild(chatWindow);

  renderChatWindowContent();
}

function toggleChatWindow() {
  isChatExpanded = !isChatExpanded;
  const chatWindow = document.getElementById('lifelink-chat-window');
  if (!chatWindow) return;

  if (isChatExpanded) {
    chatWindow.classList.remove('hidden');
    // Default active chat to first if none selected
    if (!activeChatId && chatConversations.length > 0) {
      activeChatId = chatConversations[0].id;
    }
    renderChatWindowContent();
    scrollChatFeedToBottom();
  } else {
    chatWindow.classList.add('hidden');
  }
}

function closeChatWindow() {
  isChatExpanded = false;
  const chatWindow = document.getElementById('lifelink-chat-window');
  if (chatWindow) {
    chatWindow.classList.add('hidden');
  }
}

function setMobileChatView(view) {
  mobileChatView = view;
  const bodyEl = document.getElementById('chat-body-container');
  if (bodyEl) {
    bodyEl.className = `chat-body view-${view}`;
  }
}

// Toggle sender mode between 'user' (You) and 'them' (Participant) for multi-person testing
function toggleSenderRole() {
  currentSenderRole = currentSenderRole === 'user' ? 'them' : 'user';
  renderChatWindowContent();
  setTimeout(() => {
    const input = document.getElementById('chat-msg-input');
    if (input) input.focus();
  }, 50);
}

// Render Complete Chat Window Structure
function renderChatWindowContent() {
  const chatWindow = document.getElementById('lifelink-chat-window');
  if (!chatWindow) return;

  const activeConv = chatConversations.find(c => c.id === activeChatId);

  chatWindow.innerHTML = `
    <!-- Header -->
    <div class="chat-header">
      <div class="chat-header-left">
        <button class="chat-header-back-btn" onclick="setMobileChatView('list')" aria-label="Back to conversations">
          ${SVG_ICONS.arrowLeft(16)} Back
        </button>
        <div class="chat-header-title">
          <div class="chat-header-title-icon">
            ${SVG_ICONS.message(16, 'var(--red-600)')}
          </div>
          <span>LifeLink User Chat</span>
        </div>
      </div>
      <div class="chat-header-controls">
        <button class="chat-minimize-btn" onclick="toggleChatWindow()" aria-label="Minimize Chat" title="Minimize Chat">
          ${SVG_ICONS.chevronDown(20)}
        </button>
      </div>
    </div>

    <!-- Body -->
    <div id="chat-body-container" class="chat-body view-${mobileChatView}">
      <!-- Sidebar / Conversation List -->
      <div class="chat-sidebar">
        <div class="chat-search-container">
          <div class="chat-search-wrapper">
            <span class="chat-search-icon">${SVG_ICONS.search(14)}</span>
            <input type="text" class="chat-search-input" placeholder="Search conversations..." value="${chatSearchFilter}" oninput="handleChatSearch(event)">
          </div>
        </div>
        <div class="chat-conv-list" id="chat-conv-list-inner">
          ${renderConversationListHtml()}
        </div>
      </div>

      <!-- Main Active Conversation View -->
      <div class="chat-main" id="chat-main-container">
        ${renderActiveChatHtml(activeConv)}
      </div>
    </div>
  `;

  updateChatUnreadBadge();
}

function handleChatSearch(e) {
  chatSearchFilter = e.target.value.toLowerCase().trim();
  const listInner = document.getElementById('chat-conv-list-inner');
  if (listInner) {
    listInner.innerHTML = renderConversationListHtml();
  }
}

// Render Conversation List Items
function renderConversationListHtml() {
  const filtered = chatConversations.filter(c => {
    if (!chatSearchFilter) return true;
    const nameMatch = c.participant.name.toLowerCase().includes(chatSearchFilter);
    const bloodMatch = c.participant.blood.toLowerCase().includes(chatSearchFilter);
    const cityMatch = (c.participant.city || '').toLowerCase().includes(chatSearchFilter);
    const roleMatch = (c.participant.role || '').toLowerCase().includes(chatSearchFilter);
    return nameMatch || bloodMatch || cityMatch || roleMatch;
  });

  if (filtered.length === 0) {
    return `
      <div style="padding: 30px 16px; text-align: center; color: var(--text-muted); font-size: 0.82rem;">
        No conversations found.
      </div>
    `;
  }

  return filtered.map(c => {
    const isActive = c.id === activeChatId;
    const p = c.participant;
    const lastMsg = c.messages && c.messages.length > 0 ? c.messages[c.messages.length - 1] : null;
    const lastText = lastMsg ? (lastMsg.sender === 'user' ? 'You: ' + lastMsg.text : lastMsg.text) : 'No messages yet';
    const roleClass = (p.role || 'donor').toLowerCase().replace(/\s+/g, '');
    const avatarBgClass = p.role === 'Blood Bank' ? 'bank' : (p.role === 'Blood Requester' ? 'requester' : '');

    return `
      <div class="chat-conv-item ${isActive ? 'active' : ''}" onclick="selectConversation('${c.id}')">
        <div class="chat-avatar ${avatarBgClass}">
          ${p.blood && p.blood !== 'BANK' ? p.blood : SVG_ICONS.hospital(18, '#ffffff')}
        </div>
        <div class="chat-conv-content">
          <div class="chat-conv-meta">
            <span class="chat-conv-name">${p.name}</span>
            <span class="chat-conv-time">${lastMsg ? lastMsg.timestamp : ''}</span>
          </div>
          <div class="chat-conv-bottom">
            <span class="chat-conv-preview ${c.unreadCount > 0 ? 'unread' : ''}">${escapeHtml(lastText)}</span>
            <span class="chat-role-badge ${roleClass}">${p.role || 'Donor'}</span>
            ${c.unreadCount > 0 ? `<span class="chat-item-unread-badge">${c.unreadCount}</span>` : ''}
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// Select Conversation
function selectConversation(convId) {
  activeChatId = convId;
  const conv = chatConversations.find(c => c.id === convId);
  if (conv) {
    conv.unreadCount = 0;
    saveChatState();
  }

  mobileChatView = 'chat';
  renderChatWindowContent();
  scrollChatFeedToBottom();

  // Focus message input box
  setTimeout(() => {
    const input = document.getElementById('chat-msg-input');
    if (input) input.focus();
  }, 100);
}

// Render Active Chat Area HTML
function renderActiveChatHtml(conv) {
  if (!conv) {
    return `
      <div class="chat-empty-state">
        <div class="chat-empty-icon">
          ${SVG_ICONS.message(28, 'var(--red-600)')}
        </div>
        <div class="chat-empty-title">Your Messages</div>
        <div class="chat-empty-text">
          Select a donor or blood bank conversation from the left to start messaging.
        </div>
      </div>
    `;
  }

  const p = conv.participant;
  const roleClass = (p.role || 'donor').toLowerCase().replace(/\s+/g, '');
  const avatarBgClass = p.role === 'Blood Bank' ? 'bank' : (p.role === 'Blood Requester' ? 'requester' : '');

  return `
    <!-- Active Chat Header -->
    <div class="chat-main-header">
      <div class="chat-main-user-info">
        <div class="chat-avatar ${avatarBgClass}">
          ${p.blood && p.blood !== 'BANK' ? p.blood : SVG_ICONS.hospital(18, '#ffffff')}
        </div>
        <div>
          <div class="chat-main-user-name">
            ${p.name}
            <span class="chat-role-badge ${roleClass}">${p.role || 'Donor'}</span>
          </div>
          <div class="chat-main-user-sub">
            <span class="chat-status-indicator">
              <span class="chat-status-dot"></span>
              ${p.status || 'Available Now'}
            </span>
            ${p.city ? `<span>• ${p.city}</span>` : ''}
          </div>
        </div>
      </div>
    </div>

    <!-- Active Messages Scroll Feed -->
    <div class="chat-feed" id="chat-feed-scroll">
      <div class="chat-date-line">
        <span>Today</span>
      </div>

      ${conv.messages && conv.messages.length > 0 ? conv.messages.map(m => `
        <div class="chat-msg-row ${m.sender === 'user' ? 'sent' : 'received'}">
          <div class="chat-msg-bubble">
            ${escapeHtml(m.text)}
          </div>
          <div class="chat-msg-time">${m.timestamp}</div>
        </div>
      `).join('') : `
        <div style="text-align: center; color: var(--text-muted); font-size: 0.8rem; margin: 20px 0;">
          No messages in this chat yet. Start typing below!
        </div>
      `}
    </div>

    <!-- Input Footer -->
    <div class="chat-input-container">
      <button type="button" class="chat-sender-toggle-btn" onclick="toggleSenderRole()" title="Click to switch sender perspective">
        ${currentSenderRole === 'user' ? '👤 You' : '💬 ' + p.name}
      </button>
      <input type="text" id="chat-msg-input" class="chat-input" placeholder="Write a message as ${currentSenderRole === 'user' ? 'You' : p.name}…" onkeydown="handleChatInputKeyDown(event)" autocomplete="off">
      <button type="button" class="chat-send-btn" onclick="sendChatMessage()" aria-label="Send Message" title="Send Message">
        ${SVG_ICONS.send(16, '#ffffff')}
      </button>
    </div>
  `;
}

function handleChatInputKeyDown(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendChatMessage();
  }
}

function scrollChatFeedToBottom() {
  setTimeout(() => {
    const feed = document.getElementById('chat-feed-scroll');
    if (feed) {
      feed.scrollTop = feed.scrollHeight;
    }
  }, 50);
}

// Send Message Logic (Real User-to-User Chat - No Automated Bot Replies)
function sendChatMessage() {
  const input = document.getElementById('chat-msg-input');
  if (!input) return;

  const text = input.value.trim();
  if (!text || !activeChatId) return;

  const conv = chatConversations.find(c => c.id === activeChatId);
  if (!conv) return;

  const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Add Message directly from current selected sender role ('user' or 'them')
  conv.messages.push({
    id: 'msg_' + Date.now(),
    sender: currentSenderRole,
    text: text,
    timestamp: timeStr
  });

  conv.lastUpdated = new Date().toISOString();

  // Move active conversation to top of list
  chatConversations = [conv, ...chatConversations.filter(c => c.id !== activeChatId)];
  saveChatState();

  input.value = '';

  // Re-render feed & conversation list
  renderChatWindowContent();
  scrollChatFeedToBottom();
}

// Public API: Open chat with specific user/donor directly from donor card
function openChatWithUser(userObj) {
  if (!userObj || !userObj.name) return;

  const targetId = userObj.id || ('conv_' + userObj.name.toLowerCase().replace(/\s+/g, '_'));

  let conv = chatConversations.find(c => c.id === targetId || c.participant.name.toLowerCase() === userObj.name.toLowerCase());

  if (!conv) {
    conv = {
      id: targetId,
      participant: {
        id: userObj.id || targetId,
        name: userObj.name,
        blood: userObj.blood || 'O+',
        city: userObj.city || 'Local',
        role: userObj.role || 'Donor',
        status: 'Available Now'
      },
      unreadCount: 0,
      lastUpdated: new Date().toISOString(),
      messages: []
    };
    chatConversations.unshift(conv);
  }

  activeChatId = conv.id;
  conv.unreadCount = 0;
  currentSenderRole = 'user';
  saveChatState();

  isChatExpanded = true;
  mobileChatView = 'chat';

  const chatWindow = document.getElementById('lifelink-chat-window');
  if (chatWindow) {
    chatWindow.classList.remove('hidden');
  }

  renderChatWindowContent();
  scrollChatFeedToBottom();

  setTimeout(() => {
    const input = document.getElementById('chat-msg-input');
    if (input) input.focus();
  }, 120);
}

// Global click handler for "Msg Now" button on donor cards
function handleMsgDonorClick(e, donorId, donorName, bloodGroup, city) {
  if (e) {
    e.preventDefault();
    e.stopPropagation();
  }

  openChatWithUser({
    id: donorId || ('donor_' + donorName.toLowerCase().replace(/\s+/g, '_')),
    name: donorName,
    blood: bloodGroup,
    city: city,
    role: 'Donor'
  });
}

// Utility: HTML Escape
function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
}

// Auto Init on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  initChatModule();
});
