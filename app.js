const chatBody = document.getElementById('chatBody');
const inputField = document.getElementById('inputField');
const backBtn = document.getElementById('backBtn');
const headerTitle = document.getElementById('headerTitle');

const historyPanel = document.getElementById('historyPanel');
const historyBtn = document.getElementById('historyBtn');
const inputBar = document.querySelector('.input-bar');

let messageLog = [];
let currentTab = 'chat';
let csInquiryMode = false;

// ===== FAQ Data =====
const FAQ_DATA = [
  {
    keywords: ['뭐', '뭔', '무엇', '어떤', '서비스', '소개'],
    question: '미니인턴이 뭔가요?',
    answer: '미니인턴은 2013년부터 시작된 <b>실무역량 중심의 채용 플랫폼</b>이에요.<br><br>구직자가 기업의 과제를 수행하여 실무 경험을 쌓고, 현직자 멘토링과 수료평가까지 받을 수 있는 실무역량강화 교육입니다.<br><br>이력서가 아닌 <b>과제 결과물로 실무역량을 평가</b>받고 건강한 취업을 이뤄보세요!'
  },
  {
    keywords: ['교육', '교육형', '과정', '어떻게', '진행'],
    question: '교육형 미니인턴은 어떻게 진행되나요?',
    answer: '<b>교육형 미니인턴 전형 과정</b><br><br>1. <b>신청</b> — 수행계획서 제출<br>2. <b>선발</b><br>3. <b>OT</b> — 실시간 온라인 진행<br>4. <b>중간 결과물 제출</b><br>5. <b>최종 결과물 제출</b><br>6. <b>평가</b><br><br>* 100% 비대면으로 진행되며, 별도 출퇴근은 없어요.<br>* 과제수행 기간은 약 2주입니다.'
  },
  {
    keywords: ['혜택', '참여', '왜', '좋은점', '장점', '수료증', '피드백'],
    question: '미니인턴 참여 혜택이 뭔가요?',
    answer: '<b>미니인턴 참여 혜택</b><br><br>• 3년 차 이상의 현직자 피드백 무료 제공<br>• 수료 시 참여 기업명의 <b>수료증 발급</b><br>• 결과물을 포트폴리오로 활용하여 채용관 내 타 기업 지원 가능<br><br>* 채용관 지원 후 정규직 전환 시, 최대 <b>110만원 취업성과금</b>도 제공돼요!'
  },
  {
    keywords: ['기획안', '제출', '제안서', '업로드', '결과물'],
    question: '기획안은 어떻게 제출하나요?',
    answer: '[미니인턴 홈페이지] → [마이커리어] → 신청한 [미니인턴 카드] 선택 → [신청내역 정보] 내 제안서 제출에 업로드하시면 됩니다.<br><br><b>유의사항:</b><br>• PDF 형식, 30MB 이내<br>• 추가 파일은 압축 파일로 제출<br>• 작성자 개인 정보는 표기하지 마세요'
  },
  {
    keywords: ['중간', '피드백', '멘토링', '멘토'],
    question: '중간 피드백은 어떻게 보나요?',
    answer: '[미니인턴 홈페이지] → [마이커리어] → 신청한 [미니인턴 카드] 선택 → [신청내역 정보] 내 피드백 보기에서 확인할 수 있어요.<br><br>* 중간 피드백 업로드 완료 후 안내 문자가 발송됩니다.<br>* 중간기획안에 대한 피드백은 현직자 멘토가 1:1로 첨삭해드려요!'
  },
  {
    keywords: ['수료증', '수료', '발급', '증명'],
    question: '수료증은 어떻게 발급받나요?',
    answer: '[미니인턴 홈페이지] → [마이커리어] → 신청한 [미니인턴 카드] 선택 → [신청내역 정보] 내 수료증 발급에서 다운받으실 수 있어요.'
  },
  {
    keywords: ['채용', '채용형', '정규직', '취업', '지원'],
    question: '채용형 미니인턴은 뭔가요?',
    answer: '<b>채용형 미니인턴</b>은 이력서 중심의 채용문화를 실무역량 중심으로 바꾸기 위한 프로그램이에요.<br><br>이력서가 아닌 <b>과제 결과물로 실무역량을 평가</b>받고 건강한 취업을 이뤄보세요!<br><br>미니인턴은 구직자와 기업의 건강한 채용 문화를 지지합니다.'
  },
  {
    keywords: ['비용', '가격', '무료', '유료', '결제', '돈'],
    question: '미니인턴은 무료인가요?',
    answer: '네! 미니인턴 참여는 <b>무료</b>예요.<br><br>참여 시 실무에 바로 활용할 수 있는 10만원 상당의 기획안 작성법 교육도 무료로 제공됩니다.'
  },
  {
    keywords: ['비대면', '온라인', '출퇴근', '재택', '원격'],
    question: '미니인턴은 비대면으로 진행되나요?',
    answer: '네! 미니인턴은 <b>100% 비대면</b>으로 진행돼요.<br><br>별도 출퇴근은 없으며, OT는 실시간 온라인으로 진행됩니다. 불참 시 해당 미니인턴에 참여할 수 없으니 꼭 참석해주세요!'
  },
  {
    keywords: ['해피폴리오', '콘텐츠', '아티클', '읽을거리', '정보'],
    question: '해피폴리오가 뭔가요?',
    answer: '해피폴리오는 미니인턴의 커리어 콘텐츠 서비스예요.<br><br>직무 인터뷰, 취업 팁, 현직자 이야기 등 취업 준비에 도움이 되는 다양한 아티클을 제공합니다.'
  },
  {
    keywords: ['문의', '고객센터', '연락', '상담', '도움', '문제', '오류', '에러', '버그'],
    question: '문의는 어디로 하나요?',
    answer: '미니인턴 고객센터로 문의해주세요!<br><br>홈페이지 하단 "문의하기" 또는 이메일(help@miniintern.com)로 연락하시면 빠르게 답변드리겠습니다.'
  },
  {
    keywords: ['비밀번호', '패스워드', '로그인', '접속', '못'],
    question: '비밀번호를 잊어버렸어요',
    answer: '로그인 화면에서 "비밀번호 찾기"를 클릭해주세요.<br><br>가입 시 사용한 이메일로 비밀번호 재설정 링크가 발송됩니다. 소셜 로그인 사용자는 해당 소셜 서비스에서 비밀번호를 변경해주세요.'
  },
  {
    keywords: ['평가', '수료', '결과', '합격', '점수'],
    question: '최종 평가는 어떻게 이루어지나요?',
    answer: '결과물(최종 기획안)에 대한 수료 평가는 <b>전문 평가 위원단</b>에서 진행해요.<br><br>기업의 평가(기업 측 의견 및 평가 내용)와는 무관하게 독립적으로 평가됩니다.'
  },
];

const SUGGESTED_QUESTIONS = [
  '미니인턴이 뭔가요?',
  '참여 혜택이 뭔가요?',
  '어떻게 진행되나요?',
  '미니인턴은 무료인가요?',
];

// ===== Scroll to bottom =====
function scrollBottom() {
  setTimeout(() => { chatBody.scrollTop = chatBody.scrollHeight; }, 50);
}

// ===== Add bot message =====
const THINKING_STEPS = ['답변 생각 중', '추론 중', '답변 검토 중'];

function addBotMsg(text, delay = 600, showThinking = false) {
  return new Promise(resolve => {
    if (!showThinking) {
      const loader = document.createElement('div');
      loader.className = 'msg-row';
      loader.innerHTML = `
        <div class="msg-avatar"><img src="./mi-bot.svg" width="28" height="28" style="border-radius:50%;"></div>
        <div class="msg-bubble bot loading-bubble">
          <div class="thinking-dots"><div class="thinking-dot"></div><div class="thinking-dot"></div><div class="thinking-dot"></div></div>
        </div>`;
      chatBody.appendChild(loader);
      scrollBottom();

      setTimeout(() => {
        loader.remove();
        const row = document.createElement('div');
        row.className = 'msg-row';
        row.innerHTML = `
          <div class="msg-avatar"><img src="./mi-bot.svg" width="28" height="28" style="border-radius:50%;"></div>
          <div class="msg-bubble bot">${text}</div>`;
        chatBody.appendChild(row);
        messageLog.push({ type: 'bot', text });
        scrollBottom();
        resolve();
      }, delay);
      return;
    }

    const typing = document.createElement('div');
    typing.className = 'msg-row';
    typing.innerHTML = `
      <div class="msg-avatar"><img src="./mi-bot.svg" width="28" height="28" style="border-radius:50%;"></div>
      <div class="thinking-indicator">
        <div class="thinking-step active">
          <span class="step-text">${THINKING_STEPS[0]}</span>
          <div class="thinking-dots"><div class="thinking-dot"></div><div class="thinking-dot"></div><div class="thinking-dot"></div></div>
        </div>
      </div>`;
    chatBody.appendChild(typing);
    scrollBottom();

    const stepEl = typing.querySelector('.thinking-step');
    const textEl = stepEl.querySelector('.step-text');
    let step = 0;
    const stepInterval = setInterval(() => {
      step++;
      if (step < THINKING_STEPS.length) {
        stepEl.classList.remove('active');
        stepEl.classList.add('done');
        setTimeout(() => {
          stepEl.classList.remove('done');
          stepEl.classList.add('active');
          textEl.textContent = THINKING_STEPS[step];
        }, 500);
      } else {
        clearInterval(stepInterval);
        stepEl.classList.remove('active');
        stepEl.classList.add('done');
      }
    }, 1000);

    setTimeout(() => {
      typing.remove();
      const row = document.createElement('div');
      row.className = 'msg-row';
      row.innerHTML = `
        <div class="msg-avatar"><img src="./mi-bot.svg" width="28" height="28" style="border-radius:50%;"></div>
        <div class="msg-bubble bot">${text}</div>`;
      chatBody.appendChild(row);
      messageLog.push({ type: 'bot', text });
      scrollBottom();
      resolve();
    }, 3500);
  });
}

// ===== Add user message =====
function addUserMsg(text) {
  const row = document.createElement('div');
  row.className = 'msg-row user';
  row.innerHTML = `
    <div class="msg-bubble user">${text}</div>`;
  chatBody.appendChild(row);
  messageLog.push({ type: 'user', text });
  scrollBottom();
}

// ===== Add quick replies =====
function addQuickReplies(options, callback) {
  const wrap = document.createElement('div');
  wrap.className = 'quick-replies';
  options.forEach(opt => {
    const btn = document.createElement('button');
    btn.className = 'chip';
    btn.textContent = opt;
    btn.onclick = () => {
      wrap.remove();
      addUserMsg(opt);
      callback(opt);
    };
    wrap.appendChild(btn);
  });
  chatBody.appendChild(wrap);
  scrollBottom();
}

// ===== FAQ Matching =====
function findFaqAnswer(text) {
  const normalized = text.toLowerCase().replace(/[?!.,]/g, '');
  let bestMatch = null;
  let bestScore = 0;

  for (const faq of FAQ_DATA) {
    let score = 0;
    for (const kw of faq.keywords) {
      if (normalized.includes(kw)) score++;
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = faq;
    }
  }

  return bestScore > 0 ? bestMatch : null;
}

// ===== Fallback Answers =====
const FALLBACK_ANSWERS = [
  '좋은 질문이에요! 미니인턴에서는 인턴십 탐색부터 지원까지 한 번에 할 수 있어요.<br><br>더 자세한 내용이 궁금하시면 홈페이지를 방문하시거나, 고객센터(help@miniintern.com)로 문의해주세요!',
  '해당 내용은 미니인턴 홈페이지에서 더 자세히 확인하실 수 있어요.<br><br>마이페이지에서 프로필을 완성하시면 맞춤 정보도 받아보실 수 있습니다!',
  '미니인턴은 대학생과 취준생의 커리어 성장을 돕는 플랫폼이에요.<br><br>관련해서 더 궁금한 점이 있으시면 편하게 질문해주세요!',
  '네, 이해했어요! 해당 사항은 미니인턴 고객센터에서 빠르게 도움받으실 수 있어요.<br><br>이메일: help@miniintern.com 으로 문의해주시면 담당자가 안내해드릴게요.',
];

function getFallbackAnswer(text) {
  const idx = Math.abs(text.split('').reduce((a, c) => a + c.charCodeAt(0), 0)) % FALLBACK_ANSWERS.length;
  return FALLBACK_ANSWERS[idx];
}

// ===== Send message =====
async function sendMessage() {
  const text = inputField.value.trim();
  if (!text) return;
  inputField.value = '';
  document.getElementById('sendBtn').disabled = true;
  chatBody.querySelectorAll('.quick-replies').forEach(el => el.remove());
  addUserMsg(text);

  if (csInquiryMode) {
    csInquiryMode = false;
    await addBotMsg(`이 내용으로 문의를 작성할게요.`);
    await addBotMsg('운영팀에 문의가 전송되었습니다! 담당자가 확인 후 연락드릴게요.');
    await addBotMsg('다른 궁금한 점이 있으신가요?');
    addQuickReplies(['미니인턴은 무료인가요?', '문의는 어디로 하나요?', '해피폴리오가 뭔가요?'], handleUserInput);
    return;
  }

  handleUserInput(text, true);
}

// ===== CS Handoff =====
function addCsCard() {
  const row = document.createElement('div');
  row.className = 'msg-row';
  row.innerHTML = `
    <div class="msg-avatar"><img src="./mi-bot.svg" width="28" height="28" style="border-radius:50%;"></div>
    <div class="cs-card">
      <div class="cs-card-header">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2"/></svg>
        <span>운영팀 직접 문의</span>
      </div>
      <p class="cs-card-desc">더 정확한 답변을 위해 운영팀이 직접 도와드릴게요.</p>
      <div class="cs-card-actions">
        <button class="cs-btn cs-btn-primary" onclick="sendChatHistory()">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="m3.4 20.4l17.45-7.48a1 1 0 0 0 0-1.84L3.4 3.6a.993.993 0 0 0-1.39.91L2 9.12c0 .5.37.93.87.99L17 12L2.87 13.88c-.5.07-.87.5-.87 1l.01 4.61c0 .71.73 1.2 1.39.91"/></svg>
          채팅 내역 전송하기
        </button>
        <button class="cs-btn cs-btn-secondary" onclick="startCsInquiry()">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83l3.75 3.75z"/></svg>
          문의 작성하기
        </button>
      </div>
    </div>`;
  chatBody.appendChild(row);
  scrollBottom();
}

async function sendChatHistory() {
  chatBody.querySelectorAll('.cs-card').forEach(el => {
    const row = el.closest('.msg-row');
    if (row) row.remove();
  });
  await addBotMsg('채팅 내역이 운영팀에 전송되었습니다! 담당자가 확인 후 연락드릴게요.');
  await addBotMsg('다른 궁금한 점이 있으신가요?');
  addQuickReplies(['미니인턴은 무료인가요?', '문의는 어디로 하나요?', '해피폴리오가 뭔가요?'], handleUserInput);
}

async function startCsInquiry() {
  chatBody.querySelectorAll('.cs-card').forEach(el => {
    const row = el.closest('.msg-row');
    if (row) row.remove();
  });
  csInquiryMode = true;
  await addBotMsg('운영팀에게 보낼 문의사항을 작성해주세요.');
}

// ===== Handle user input =====
async function handleUserInput(text, showThinking = false) {
  // CS 테스트 트리거
  if (text.replace(/\s/g, '').toLowerCase() === 'cs테스트') {
    await addBotMsg('죄송해요, 해당 질문은 제가 답변하기 어려운 내용이에요.', 600, showThinking);
    await addBotMsg('운영팀에서 직접 도움을 드릴 수 있도록 안내해드릴게요!');
    addCsCard();
    return;
  }

  const faq = findFaqAnswer(text);

  if (faq) {
    await addBotMsg(faq.answer, 600, showThinking);
  } else {
    const fallback = getFallbackAnswer(text);
    await addBotMsg(fallback, 600, showThinking);
  }
  await addBotMsg('다른 궁금한 점이 있으신가요?');
  addQuickReplies(['미니인턴은 무료인가요?', '문의는 어디로 하나요?', '해피폴리오가 뭔가요?'], handleUserInput);
}

// ===== Welcome Flow =====
async function startWelcome() {
  await addBotMsg('안녕하세요! 미니인턴 AI 챗봇입니다 😊', 600);
  await addBotMsg('미니인턴 이용에 궁금한 점이 있으면 편하게 물어보세요!', 600);
  addQuickReplies(SUGGESTED_QUESTIONS, handleUserInput);
}

// ===== New Chat =====
function newChat() {
  saveSession();
  chatBody.innerHTML = '';
  messageLog = [];
  startWelcome();
}

// ===== Session Storage =====
function saveSession() {
  if (messageLog.length === 0) return;

  const sessions = JSON.parse(localStorage.getItem('chatbot_sessions') || '[]');
  const firstUserMsg = messageLog.find(m => m.type === 'user');
  const title = firstUserMsg ? firstUserMsg.text.replace(/<[^>]*>/g, '') : '새 대화';
  const lastMsg = [...messageLog].reverse().find(m => m.type === 'bot' || m.type === 'user');
  const preview = lastMsg ? lastMsg.text.replace(/<[^>]*>/g, '') : '';
  const now = new Date();

  sessions.unshift({
    id: Date.now().toString(),
    title,
    preview,
    date: now.toLocaleDateString('ko-KR'),
    time: now.toTimeString().slice(0, 8),
    messages: [...messageLog]
  });

  localStorage.setItem('chatbot_sessions', JSON.stringify(sessions));
  messageLog = [];
}

// ===== Tab Switching =====
function switchTab(tab) {
  currentTab = tab;
  if (tab === 'chat') {
    chatBody.style.display = '';
    historyPanel.style.display = 'none';
    inputBar.style.display = '';
    historyBtn.style.display = '';
    backBtn.style.display = 'none';
    backBtn.onclick = null;
    headerTitle.textContent = '미니인턴 AI 챗봇';
  } else {
    chatBody.style.display = 'none';
    historyPanel.style.display = '';
    inputBar.style.display = 'none';
    historyBtn.style.display = 'none';
    backBtn.style.display = 'flex';
    backBtn.onclick = () => switchTab('chat');
    headerTitle.textContent = '대화 내역';
    renderHistoryList();
  }
}

// ===== History List =====
function getCurrentSession() {
  const userMsgs = messageLog.filter(m => m.type === 'user');
  if (userMsgs.length === 0) return null;
  const title = userMsgs[0].text.replace(/<[^>]*>/g, '');
  const lastMsg = [...messageLog].reverse().find(m => m.type === 'bot' || m.type === 'user');
  const preview = lastMsg ? lastMsg.text.replace(/<[^>]*>/g, '') : '';
  const now = new Date();
  return {
    id: '_current',
    title,
    preview,
    date: now.toLocaleDateString('ko-KR'),
    time: now.toTimeString().slice(0, 8),
  };
}

function renderHistoryList() {
  const sessions = JSON.parse(localStorage.getItem('chatbot_sessions') || '[]');
  const current = getCurrentSession();
  const allSessions = current ? [current, ...sessions] : sessions;

  if (allSessions.length === 0) {
    historyPanel.innerHTML = `
      <div class="history-empty">
        <div class="history-empty-icon">💬</div>
        <div>저장된 대화가 없습니다</div>
      </div>`;
    return;
  }

  historyPanel.innerHTML = allSessions.map(s => `
      <div class="history-item" onclick="resumeSession('${s.id}')">
        <div class="history-item-content">
          <div class="history-item-title">${s.title}</div>
          <div class="history-item-preview">${s.preview}</div>
          <div class="history-item-date">${s.date}${s.time ? ' ' + s.time : ''}</div>
        </div>
        <button class="history-more-btn" onclick="event.stopPropagation(); toggleSessionMenu('${s.id}')">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2s-2 .9-2 2s.9 2 2 2m0 2c-1.1 0-2 .9-2 2s.9 2 2 2s2-.9 2-2s-.9-2-2-2m0 6c-1.1 0-2 .9-2 2s.9 2 2 2s2-.9 2-2s-.9-2-2-2"/></svg>
        </button>
        <div class="history-menu" id="menu-${s.id}">
          <button onclick="event.stopPropagation(); deleteSession('${s.id}')">삭제</button>
        </div>
      </div>`).join('');
}

// ===== Resume Session =====
function resumeSession(id) {
  if (id === '_current') { switchTab('chat'); return; }

  const sessions = JSON.parse(localStorage.getItem('chatbot_sessions') || '[]');
  const idx = sessions.findIndex(s => s.id === id);
  if (idx === -1) return;

  const session = sessions[idx];

  // Save current conversation first, then remove resumed session
  saveSession();
  const updated = JSON.parse(localStorage.getItem('chatbot_sessions') || '[]');
  const newIdx = updated.findIndex(s => s.id === id);
  if (newIdx !== -1) updated.splice(newIdx, 1);
  localStorage.setItem('chatbot_sessions', JSON.stringify(updated));

  // Restore messages
  messageLog = [...session.messages];

  // Render messages into chatBody
  chatBody.innerHTML = '';
  session.messages.forEach(msg => {
    if (msg.type === 'bot') {
      const row = document.createElement('div');
      row.className = 'msg-row';
      row.innerHTML = `
        <div class="msg-avatar"><img src="./mi-bot.svg" width="28" height="28" style="border-radius:50%;"></div>
        <div class="msg-bubble bot">${msg.text}</div>`;
      chatBody.appendChild(row);
    } else if (msg.type === 'user') {
      const row = document.createElement('div');
      row.className = 'msg-row user';
      row.innerHTML = `
        <div class="msg-avatar">나</div>
        <div class="msg-bubble user">${msg.text}</div>`;
      chatBody.appendChild(row);
    }
  });

  // Switch to chat view
  switchTab('chat');
  scrollBottom();
}

// ===== Session Menu =====
function toggleSessionMenu(id) {
  const menu = document.getElementById('menu-' + id);
  const isOpen = menu.classList.contains('open');
  document.querySelectorAll('.history-menu.open').forEach(m => m.classList.remove('open'));
  if (!isOpen) menu.classList.add('open');
}

function deleteSession(id) {
  if (id === '_current') {
    messageLog = [];
    chatBody.innerHTML = '';
    startWelcome();
    renderHistoryList();
    return;
  }
  const sessions = JSON.parse(localStorage.getItem('chatbot_sessions') || '[]');
  const filtered = sessions.filter(s => s.id !== id);
  localStorage.setItem('chatbot_sessions', JSON.stringify(filtered));
  renderHistoryList();
}

// ===== Close menus on outside click =====
document.addEventListener('click', () => {
  document.querySelectorAll('.history-menu.open').forEach(m => m.classList.remove('open'));
});

// ===== FAB Toggle =====
function toggleChat() {
  const phone = document.querySelector('.phone');
  const fab = document.getElementById('fabBtn');
  const isOpen = phone.classList.toggle('open');
  fab.classList.toggle('active', isOpen);
}

// ===== Auto-save on page unload =====
window.addEventListener('beforeunload', () => {
  saveSession();
});

// ===== Start =====
startWelcome();
