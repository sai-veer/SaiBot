const sidebarTabs = document.querySelector('.tab-list');
const chatForm = document.getElementById('chat-form');
const userInput = document.getElementById('user-input');
const chatBox = document.querySelector('.chat-box');
const logoutBtn = document.getElementById('logout-btn');
const newTabBtn = document.getElementById('new-tab-btn');
const clearChatBtn = document.getElementById('clear-chat-btn');
const clearTabBtn = document.getElementById('clear-tab-btn');
const usernameDisplay = document.getElementById('username-display');

const userId = localStorage.getItem('userId');
const token = localStorage.getItem('token');
let currentSessionId = localStorage.getItem('sessionId');
const userAvatar = {
  avatarType: localStorage.getItem('avatarType'),
  avatarUrl: localStorage.getItem('avatarUrl'),
  avatarEmoji: localStorage.getItem('avatarEmoji')
};
if (!userId || !token) window.location.href = 'login.html';

function showAlert(message, type = 'error') {
  const alertBox = document.getElementById('custom-alert');
  if (!alertBox) return;

  alertBox.textContent = message;
  alertBox.className = `alert-box ${type}`;
  alertBox.style.display = 'block';
  alertBox.style.opacity = 1;

  setTimeout(() => {
    alertBox.style.opacity = 0;
    setTimeout(() => {
      alertBox.style.display = 'none';
    }, 300);
  }, 3000);
}


async function fetchUsername() {
  const res = await fetch('http://localhost:5000/api/auth/username', {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  const usernameSpan = document.getElementById('username-display');

  usernameSpan.textContent = data.username || 'User';
  const container = document.getElementById('avatar-container');
  container.innerHTML = '';           // clear out any old content

  if (data.avatarUrl) {
    // inject the <img> tag
    const img = document.createElement('img');
    img.src = `http://localhost:5000${data.avatarUrl}`;
    img.alt = 'avatar';
    img.className = 'avatar-image';
    container.appendChild(img);
  } else {
    // inject emoji fallback
    const span = document.createElement('span');
    span.className = 'avatar-emoji';
    span.textContent = data.avatarEmoji || '🙂';
    container.appendChild(span);
  }
   localStorage.setItem('avatarType', data.avatarType);
  localStorage.setItem('avatarUrl', data.avatarUrl || '');
  localStorage.setItem('avatarEmoji', data.avatarEmoji || '🙂');
    // …existing code that populates container…
     userAvatar.avatarType  = data.avatarType;
 userAvatar.avatarUrl   = data.avatarUrl   || '';
userAvatar.avatarEmoji = data.avatarEmoji || '🙂';

  // now that avatar is set, show it
  container.style.visibility = 'visible';

}

async function loadTabs() {
  const res = await fetch('http://localhost:5000/api/chat/sessions', {
    headers: { Authorization: `Bearer ${token}` }
  });
  const sessions = await res.json();

  sidebarTabs.innerHTML = '';
  if (!sessions.length) return;

  if (!currentSessionId || !sessions.find(s => s._id === currentSessionId)) {
    currentSessionId = sessions[0]?._id;
    localStorage.setItem('sessionId', currentSessionId);
  }

  sessions.forEach((session) => {
    const li = document.createElement('li');
    li.className = session._id === currentSessionId ? 'active' : '';
    li.textContent = session.name;
    li.dataset.id = session._id;

    const renameBtn = document.createElement('span');
    renameBtn.textContent = ' 🖉';
    renameBtn.style.cursor = 'pointer';
   renameBtn.onclick = (e) => {
  e.stopPropagation();

  const modal = document.getElementById('rename-modal');
  const input = document.getElementById('rename-input');
  const confirm = document.getElementById('rename-confirm');
  const cancel = document.getElementById('rename-cancel');

  input.value = session.name;
  modal.style.display = 'flex';
  input.focus(); // auto-focus input

  const closeModal = () => {
    modal.style.display = 'none';
    input.removeEventListener('keydown', handleEnter);
    confirm.onclick = null;
    cancel.onclick = null;
  };

  const handleRename = async () => {
    const newName = input.value.trim();
    if (newName && newName !== session.name) {
      await fetch(`http://localhost:5000/api/chat/${session._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name: newName })
      });
      await loadTabs();
    }
    closeModal();
  };

  function handleEnter(e) {
    if (e.key === 'Enter') handleRename();
    else if (e.key === 'Escape') closeModal();
  }

  confirm.onclick = handleRename;
  cancel.onclick = closeModal;
  input.addEventListener('keydown', handleEnter);
};



    li.appendChild(renameBtn);
    li.onclick = () => {
      currentSessionId = session._id;
      localStorage.setItem('sessionId', currentSessionId);
      loadTabs().then(loadMessages);
    };

    sidebarTabs.appendChild(li);
  });
}

async function loadMessages() {
  const res = await fetch(`http://localhost:5000/api/chat/${currentSessionId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const messages = await res.json();

  chatBox.innerHTML = '';
  messages.forEach(msg => {
    if (msg.sender === 'user') {
      addMessage(msg.message, 'user', userAvatar);
    } else {
      addMessage(msg.message, 'bot');
    }
  });
}


function addMessage(message, sender, avatar = null) {
  const div = document.createElement('div');
  div.className = `message ${sender}`;

  // Avatar
  const avatarSpan = document.createElement('span');
  avatarSpan.className = 'chat-avatar';
  if (sender === 'user') {
    if (avatar.avatarUrl) {
      avatarSpan.innerHTML = `<img src="http://localhost:5000${avatar.avatarUrl}" class="chat-avatar-img" alt="avatar" />`;
    } else {
      avatarSpan.innerHTML = `<span class="chat-avatar-emoji">${avatar.avatarEmoji || '🙂'}</span>`;
    }
  } else {
    avatarSpan.innerHTML = `<span class="chat-avatar-emoji">🤖</span>`;
  }

  // Message text container
  const messageSpan = document.createElement('span');
  messageSpan.className = 'chat-text';
  messageSpan.textContent = message;

  // Build and append
  div.appendChild(avatarSpan);
  div.appendChild(messageSpan);
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;

  // Return both the div and the messageSpan so we can update just the text later
  return { container: div, textNode: messageSpan };
}



chatForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const message = userInput.value.trim();
  if (!message || !currentSessionId) return;

  // 1) Add user message
  addMessage(message, 'user', userAvatar);

  userInput.value = '';

  // 2) Add bot typing bubble and get back refs
  const { container: typingDiv, textNode: typingText } = addMessage('Typing...', 'bot');

  // 3) Start your loader animation
  let dots = 0;
  const dotInterval = setInterval(() => {
    typingText.textContent = 'Typing' + '.'.repeat(dots);
    dots = (dots + 1) % 4;
  }, 500);

  try {
    const res = await fetch(`http://localhost:5000/api/chat/${currentSessionId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ message })
    });
    const data = await res.json();
    const botReply = data.find(m => m.sender === 'bot');

    clearInterval(dotInterval);

    if (botReply && botReply.message) {
      // 4) Type out the real text word-by-word inside the same messageSpan
      typingText.textContent = ''; 
      const words = botReply.message.trim().split(' ');
      for (const word of words) {
        typingText.textContent += word + ' ';
        await new Promise(r => setTimeout(r, 80));
        chatBox.scrollTop = chatBox.scrollHeight;
      }
    } else {
      typingText.textContent = "🤖 Bot didn't respond.";
    }
  } catch (err) {
    clearInterval(dotInterval);
    typingText.textContent = "❌ Error fetching response.";
    console.error(err);
  }
});



userInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    chatForm.requestSubmit();
  }
});

logoutBtn.onclick = () => {
  localStorage.clear();
  window.location.href = 'login.html';
};

newTabBtn.onclick = async () => {
  const existingTabs = document.querySelectorAll('.tab-list li');
  const tabCount = existingTabs.length + 1;
  const name = `Chat ${tabCount}`;

  const res = await fetch('http://localhost:5000/api/chat/session', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ name })
  });

  const session = await res.json();
  currentSessionId = session._id;
  localStorage.setItem('sessionId', currentSessionId);
  await loadTabs();
  await loadMessages();
};

clearChatBtn.onclick = async () => {
  await fetch(`http://localhost:5000/api/chat/${currentSessionId}/messages`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });
  chatBox.innerHTML = '';
};

clearTabBtn.onclick = async () => {
  const res = await fetch('http://localhost:5000/api/chat/sessions', {
    headers: { Authorization: `Bearer ${token}` }
  });
  const sessions = await res.json();

  if (sessions.length <= 1) {
    showAlert('Cannot delete the last tab!');
    return;
  }

  const index = sessions.findIndex(s => s._id === currentSessionId);
  const newActive = sessions[index - 1] || sessions[index + 1];

  await fetch(`http://localhost:5000/api/chat/${currentSessionId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });

  currentSessionId = newActive._id;
  localStorage.setItem('sessionId', currentSessionId);
  await loadTabs();
  await loadMessages();
};

const themeToggle = document.getElementById('theme-toggle');

// Load and apply theme on startup
const savedTheme = localStorage.getItem('theme') || 'dark';
document.body.classList.toggle('light-mode', savedTheme === 'light');
themeToggle.innerText = savedTheme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode';

// Toggle logic
themeToggle.addEventListener('click',async () => {
  const isLight = document.body.classList.toggle('light-mode');
  const newTheme = isLight ? 'light' : 'dark';
  localStorage.setItem('theme', newTheme);
  themeToggle.innerText = isLight ? '🌙 Dark Mode' : '☀️ Light Mode';
  try {
    await fetch('http://localhost:5000/api/auth/theme', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ theme: newTheme })
    });
  } catch (err) {
    showAlert('⚠️ Failed to save theme to DB');
    console.error(err);
  }
  
});


// Initial Load

async function initTabsAndMessages() {
  let retries = 0;
  while (!localStorage.getItem('sessionId') && retries < 5) {
    await new Promise(resolve => setTimeout(resolve, 300));
    retries++;
  }
  await loadTabs();
  await loadMessages();
}

fetchUsername().then(initTabsAndMessages);
