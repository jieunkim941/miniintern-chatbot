const chatBody = document.getElementById('chatBody');
const inputField = document.getElementById('inputField');
const backBtn = document.getElementById('backBtn');
const headerTitle = document.getElementById('headerTitle');
const progressBar = document.getElementById('progressBar');

const historyPanel = document.getElementById('historyPanel');
const historyBtn = document.getElementById('historyBtn');
const inputBar = document.querySelector('.input-bar');

let currentPhase = null;
let conversationStep = 0;
let messageLog = [];
let currentTab = 'chat';

// ===== Scroll to bottom =====
function scrollBottom() {
  setTimeout(() => { chatBody.scrollTop = chatBody.scrollHeight; }, 50);
}

// ===== Add bot message =====
function addBotMsg(text, delay = 800) {
  return new Promise(resolve => {
    // Show typing
    const typing = document.createElement('div');
    typing.className = 'msg-row';
    typing.innerHTML = `
      <div class="msg-avatar"><img src="./mi-bot.svg" width="28" height="28" style="border-radius:50%;"></div>
      <div class="typing-indicator">
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
      </div>`;
    chatBody.appendChild(typing);
    scrollBottom();

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
    }, delay);
  });
}

// ===== Add user message =====
function addUserMsg(text) {
  const row = document.createElement('div');
  row.className = 'msg-row user';
  row.innerHTML = `
    <div class="msg-avatar">나</div>
    <div class="msg-bubble user">${text}</div>`;
  chatBody.appendChild(row);
  messageLog.push({ type: 'user', text });
  scrollBottom();
}

// ===== Add system message =====
function addSystemMsg(text) {
  const el = document.createElement('div');
  el.className = 'msg-system';
  el.textContent = text;
  chatBody.appendChild(el);
  messageLog.push({ type: 'system', text });
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

// ===== Add rich card =====
function addRichCard(data) {
  const card = document.createElement('div');
  card.className = 'rich-card';
  card.innerHTML = `
    <div class="card-header">
      <div class="card-title">${data.title}</div>
      <div class="card-subtitle">${data.subtitle}</div>
    </div>
    <div class="card-body">
      ${data.rows.map(r => `
        <div class="card-row">
          <span class="card-row-label">${r.label}</span>
          <span class="card-row-value">${r.value}</span>
        </div>`).join('')}
    </div>
    <div class="card-footer">
      <button class="card-btn" onclick="${data.action || ''}">${data.btnText || '자세히 보기'}</button>
    </div>`;
  chatBody.appendChild(card);
  scrollBottom();
}

// ===== Add score card =====
function addScoreCard(data) {
  const card = document.createElement('div');
  card.className = 'score-card';
  card.innerHTML = `
    <div class="score-title">${data.title}</div>
    ${data.items.map(item => `
      <div class="score-item">
        <div class="score-item-row">
          <span class="score-name">${item.name}</span>
          <span class="score-val">${item.score}%</span>
        </div>
        <div class="score-track">
          <div class="score-fill" style="width: 0%;" data-target="${item.score}"></div>
        </div>
      </div>`).join('')}
    <div class="score-total">
      <span class="score-total-label">종합 점수</span>
      <span class="score-total-value">${data.total}점</span>
    </div>`;
  chatBody.appendChild(card);
  scrollBottom();

  // Animate score fills
  setTimeout(() => {
    card.querySelectorAll('.score-fill').forEach(el => {
      el.style.width = el.dataset.target + '%';
    });
  }, 100);
}

// ===== Set progress =====
function setProgress(label, step, total) {
  if (!progressBar) return;
  progressBar.classList.add('visible');
  document.getElementById('progressLabel').textContent = label;
  document.getElementById('progressValue').textContent = `${step}/${total}`;
  document.getElementById('progressFill').style.width = (step / total * 100) + '%';
}

// ===== Phase Navigation =====
function goBack() {
  if (currentPhase) {
    saveSession();
    currentPhase = null;
    conversationStep = 0;
    chatBody.innerHTML = '';
    backBtn.style.display = 'none';
    headerTitle.textContent = '미니인턴 AI 챗봇';
    if (progressBar) progressBar.classList.remove('visible');
    startWelcome();
  }
}

// ===== Send message =====
function sendMessage() {
  const text = inputField.value.trim();
  if (!text) return;
  inputField.value = '';
  addUserMsg(text);
  handleFreeText(text);
}

// ===== Handle free text =====
async function handleFreeText(text) {
  if (!currentPhase) {
    await addBotMsg('메뉴에서 원하는 단계를 선택해주세요! 😊');
    addQuickReplies(['🔍 직무 탐색', '📝 이력서 작성', '🎤 면접 준비', '💬 커리어 상담'], handlePhaseSelect);
  } else if (currentPhase === 'job') {
    await handleJobConversation(text);
  } else if (currentPhase === 'resume') {
    await handleResumeConversation(text);
  } else if (currentPhase === 'interview') {
    await handleInterviewConversation(text);
  } else {
    await addBotMsg('네, 알겠습니다! 더 자세히 도와드릴게요. 궁금한 점이 있으면 말씀해주세요 😊');
  }
}

// ===== Welcome Flow =====
async function startWelcome() {
  await addBotMsg('안녕하세요! 미니인턴 AI 커리어 어시스턴트입니다 😊', 600);
  await addBotMsg('취업 준비의 모든 단계를 도와드릴게요.<br>어떤 도움이 필요하신가요?', 600);
  addQuickReplies(['🔍 직무 탐색', '📝 이력서 작성', '🎤 면접 준비', '💬 커리어 상담'], handlePhaseSelect);
}

// ===== Phase Selection =====
async function handlePhaseSelect(option) {
  backBtn.style.display = 'flex';

  if (option.includes('직무 탐색')) {
    currentPhase = 'job';
    headerTitle.textContent = '직무 탐색';

    await addBotMsg('직무 탐색을 시작할게요! 🔍<br>어떤 분야에 관심이 있으신가요?', 600);
    addQuickReplies(['UX/UI 디자인', '프론트엔드 개발', '데이터 분석', '마케팅'], handleJobField);
  }
  else if (option.includes('이력서 작성')) {
    currentPhase = 'resume';
    headerTitle.textContent = '이력서 작성';

    await addBotMsg('이력서 작성을 도와드릴게요! 📝<br>어떤 도움이 필요하신가요?', 600);
    addQuickReplies(['이력서 검토', '자기소개서 작성', '포트폴리오 조언'], handleResumeOption);
  }
  else if (option.includes('면접 준비')) {
    currentPhase = 'interview';
    headerTitle.textContent = '면접 준비';

    await addBotMsg('면접 준비를 시작할게요! 🎤<br>어떤 유형의 면접을 준비하시나요?', 600);
    addQuickReplies(['인성 면접', '직무 면접', '포트폴리오 발표', 'PT 면접'], handleInterviewType);
  }
  else {
    currentPhase = 'consult';
    headerTitle.textContent = '커리어 상담';

    await addBotMsg('커리어 상담을 시작할게요! 💬<br>어떤 고민이 있으신가요?', 600);
    addQuickReplies(['진로 고민', '연봉 협상', '이직 준비', '직무 전환'], async (opt) => {
      await addBotMsg(`${opt}에 대해 상담해드릴게요!<br><br>현재 상황을 자유롭게 말씀해주시면, 맞춤 조언을 드리겠습니다.`, 800);
    });
  }
}

// ===== Job Exploration Flow =====
async function handleJobField(field) {
  conversationStep = 1;
  setProgress('직무 탐색', 1, 4);
  await addBotMsg(`${field} 분야를 분석해볼게요! 🎨<br><br>현재 채용 트렌드와 맞춤 인턴십 공고를 찾아드릴게요.`, 1000);

  addSystemMsg('맞춤 공고를 검색 중...');

  await new Promise(r => setTimeout(r, 1200));

  await addBotMsg('맞춤 인턴십 공고를 찾았어요! 👇');

  addRichCard({
    title: `${field} 인턴`,
    subtitle: '네이버 · 서울 강남구',
    rows: [
      { label: '기간', value: '3개월' },
      { label: '급여', value: '월 210만원' },
      { label: '마감', value: 'D-7' }
    ],
    btnText: '지원하기',
    action: "alert('지원 페이지로 이동합니다!')"
  });

  await new Promise(r => setTimeout(r, 300));

  addRichCard({
    title: `${field} 인턴`,
    subtitle: '토스 · 서울 강남구',
    rows: [
      { label: '기간', value: '6개월' },
      { label: '급여', value: '월 250만원' },
      { label: '마감', value: 'D-14' }
    ],
    btnText: '지원하기',
    action: "alert('지원 페이지로 이동합니다!')"
  });

  await new Promise(r => setTimeout(r, 500));
  addQuickReplies(['더 많은 공고 보기', '이력서 작성하기', '처음으로'], async (opt) => {
    if (opt === '처음으로') { goBack(); }
    else if (opt === '이력서 작성하기') {
      currentPhase = 'resume';
      headerTitle.textContent = '이력서 작성';

      await addBotMsg('이력서 작성을 도와드릴게요! 📝<br>어떤 도움이 필요하신가요?', 600);
      addQuickReplies(['이력서 검토', '자기소개서 작성', '포트폴리오 조언'], handleResumeOption);
    } else {
      await addBotMsg('더 많은 공고를 찾고 있어요... 🔍<br><br>원하는 조건이 있다면 말씀해주세요!<br>예: "주 3일 가능한 곳", "리모트 가능"');
    }
  });
}

async function handleJobConversation(text) {
  await addBotMsg(`"${text}" 조건으로 검색할게요!<br><br>잠시만 기다려주세요... 🔍`, 800);
  await new Promise(r => setTimeout(r, 1000));
  await addBotMsg('조건에 맞는 공고 3건을 찾았어요!<br>관심 있는 공고를 자세히 볼까요?');
  addQuickReplies(['네, 보여주세요!', '조건 변경', '처음으로'], async (opt) => {
    if (opt === '처음으로') goBack();
    else await addBotMsg('맞춤 공고를 준비하고 있어요! 곧 보여드릴게요 😊');
  });
}

// ===== Resume Flow =====
async function handleResumeOption(option) {
  if (option === '이력서 검토') {
    await addBotMsg('이력서를 검토해드릴게요! 📄<br><br>이력서 내용을 붙여넣기 해주시거나, 주요 경력사항을 알려주세요.', 800);
  } else if (option === '자기소개서 작성') {
    await addBotMsg('자기소개서 작성을 도와드릴게요!<br><br>지원하시는 회사와 직무를 알려주세요. 맞춤 자기소개서 구조를 제안해드릴게요.', 800);
  } else {
    await addBotMsg('포트폴리오 조언을 해드릴게요! 🎨<br><br>현재 포트폴리오 상태를 알려주세요.<br>어떤 직무에 지원하시나요?', 800);
    addQuickReplies(['UX/UI 디자인', '프론트엔드 개발', '그래픽 디자인'], async (field) => {
      await addBotMsg(`${field} 포트폴리오에서 가장 중요한 요소들을 분석해볼게요!`, 800);
      addScoreCard({
        title: `${field} 포트폴리오 체크리스트`,
        items: [
          { name: '프로젝트 다양성', score: 75 },
          { name: '문제 해결 과정', score: 60 },
          { name: '시각적 완성도', score: 85 },
          { name: '결과/성과 기술', score: 45 }
        ],
        total: '66'
      });
      await new Promise(r => setTimeout(r, 500));
      await addBotMsg('결과/성과 기술 부분을 보강하면 더 강력한 포트폴리오가 될 거예요!<br><br>구체적인 개선 방법을 알려드릴까요?');
      addQuickReplies(['네, 알려주세요!', '다른 항목 보기', '처음으로'], async (opt) => {
        if (opt === '처음으로') goBack();
        else await addBotMsg('각 프로젝트에서 <b>정량적 성과</b>를 추가해보세요!<br><br>예시:<br>• "사용성 테스트 만족도 40% 향상"<br>• "페이지 로딩 속도 2초 개선"<br>• "전환율 15% 증가"', 1000);
      });
    });
  }
}

async function handleResumeConversation(text) {
  await addBotMsg('내용을 확인하고 있어요... 📝', 600);
  await addBotMsg(`좋은 내용이네요! 몇 가지 개선 포인트를 찾았어요:<br><br>1. <b>성과 중심</b>으로 표현을 바꿔보세요<br>2. <b>액션 동사</b>로 시작하면 더 강력해요<br>3. <b>수치화</b>할 수 있는 부분을 추가해보세요`, 1200);
  addQuickReplies(['수정본 보기', '다른 부분 검토', '처음으로'], async (opt) => {
    if (opt === '처음으로') goBack();
    else await addBotMsg('더 자세한 피드백을 준비할게요! 😊');
  });
}

// ===== Interview Flow =====
async function handleInterviewType(type) {
  await addBotMsg(`${type} 준비를 시작할게요! 🎯<br><br>모의 면접을 진행해볼까요? 제가 면접관 역할을 해드릴게요.`, 800);
  addQuickReplies(['모의 면접 시작', '예상 질문 보기', '면접 팁 보기'], async (opt) => {
    if (opt === '모의 면접 시작') {
      addSystemMsg('모의 면접을 시작합니다');
      await addBotMsg('그럼 시작하겠습니다! 🎙️<br><br><b>Q1. 간단한 자기소개를 해주세요.</b><br><br>1분 이내로 답변해주세요.', 1000);
    } else if (opt === '예상 질문 보기') {
      await addBotMsg(`<b>${type} 예상 질문 TOP 5</b><br><br>1. 자기소개를 해주세요<br>2. 지원 동기가 무엇인가요?<br>3. 본인의 강점과 약점은?<br>4. 갈등 상황 해결 경험은?<br>5. 5년 후 목표가 무엇인가요?`, 800);
      addQuickReplies(['모의 면접 시작', '답변 예시 보기', '처음으로'], async (opt2) => {
        if (opt2 === '처음으로') goBack();
        else await addBotMsg('좋아요! 바로 시작할게요 🎯');
      });
    } else {
      await addBotMsg(`<b>면접 꿀팁 🍯</b><br><br>✅ STAR 기법으로 답변 구조화<br>✅ 두괄식으로 결론 먼저<br>✅ 구체적 수치와 사례 활용<br>✅ 1분 이내로 간결하게<br>✅ 역질문 2-3개 준비`, 800);
    }
  });
}

async function handleInterviewConversation(text) {
  await addBotMsg('답변을 분석하고 있어요... 🤔', 800);

  addScoreCard({
    title: '답변 분석 결과',
    items: [
      { name: '구조화', score: 70 },
      { name: '구체성', score: 55 },
      { name: '간결성', score: 80 },
    ],
    total: '68'
  });

  await new Promise(r => setTimeout(r, 800));
  await addBotMsg('전반적으로 좋은 답변이에요! 👏<br><br><b>개선 포인트:</b> 구체적인 사례나 수치를 추가하면 더 설득력 있는 답변이 됩니다.<br><br>다음 질문으로 넘어갈까요?');
  addQuickReplies(['다음 질문', '다시 답변하기', '처음으로'], async (opt) => {
    if (opt === '처음으로') goBack();
    else if (opt === '다음 질문') {
      await addBotMsg('<b>Q2. 이 직무에 지원한 동기가 무엇인가요?</b><br><br>회사와 직무에 대한 이해도를 보여주세요.', 800);
    } else {
      await addBotMsg('다시 답변해주세요! 이번에는 구체적인 사례를 포함해보세요 💪');
    }
  });
}

// ===== Session Storage =====
function saveSession() {
  if (messageLog.length === 0) return;

  const sessions = JSON.parse(localStorage.getItem('chatbot_sessions') || '[]');
  const title = headerTitle.textContent || '대화';
  const lastMsg = [...messageLog].reverse().find(m => m.type === 'bot' || m.type === 'user');
  const preview = lastMsg ? lastMsg.text.replace(/<[^>]*>/g, '') : '새 대화';
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
    backBtn.onclick = goBack;
    // Restore back button state based on currentPhase
    backBtn.style.display = currentPhase ? 'flex' : 'none';
    headerTitle.textContent = currentPhase
      ? { job: '직무 탐색', resume: '이력서 작성', interview: '면접 준비', consult: '커리어 상담' }[currentPhase] || '미니인턴 AI 챗봇'
      : '미니인턴 AI 챗봇';
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
function renderHistoryList() {
  const sessions = JSON.parse(localStorage.getItem('chatbot_sessions') || '[]');

  if (sessions.length === 0) {
    historyPanel.innerHTML = `
      <div class="history-empty">
        <div class="history-empty-icon">💬</div>
        <div>저장된 대화가 없습니다</div>
      </div>`;
    return;
  }

  historyPanel.innerHTML = sessions.map(s => `
      <div class="history-item" onclick="resumeSession('${s.id}')">
        <div class="history-item-content">
          <div class="history-item-title">${s.title}</div>
          <div class="history-item-preview">${s.preview}</div>
          <div class="history-item-date">${s.date}${s.time ? ', ' + s.time : ''}</div>
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
const TITLE_TO_PHASE = { '직무 탐색': 'job', '이력서 작성': 'resume', '면접 준비': 'interview', '커리어 상담': 'consult' };

function resumeSession(id) {
  const sessions = JSON.parse(localStorage.getItem('chatbot_sessions') || '[]');
  const idx = sessions.findIndex(s => s.id === id);
  if (idx === -1) return;

  const session = sessions[idx];

  // Remove from storage (it's now the active conversation)
  sessions.splice(idx, 1);
  localStorage.setItem('chatbot_sessions', JSON.stringify(sessions));

  // Restore phase
  currentPhase = TITLE_TO_PHASE[session.title] || null;
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
    } else if (msg.type === 'system') {
      const el = document.createElement('div');
      el.className = 'msg-system';
      el.textContent = msg.text;
      chatBody.appendChild(el);
    }
  });

  // Switch to chat view
  switchTab('chat');
  headerTitle.textContent = session.title;
  backBtn.style.display = 'flex';
  scrollBottom();
}

// ===== Session Menu =====
function toggleSessionMenu(id) {
  const menu = document.getElementById('menu-' + id);
  const isOpen = menu.classList.contains('open');
  // Close all menus first
  document.querySelectorAll('.history-menu.open').forEach(m => m.classList.remove('open'));
  if (!isOpen) menu.classList.add('open');
}

function deleteSession(id) {
  const sessions = JSON.parse(localStorage.getItem('chatbot_sessions') || '[]');
  const filtered = sessions.filter(s => s.id !== id);
  localStorage.setItem('chatbot_sessions', JSON.stringify(filtered));
  renderHistoryList();
}

// ===== Close menus on outside click =====
document.addEventListener('click', () => {
  document.querySelectorAll('.history-menu.open').forEach(m => m.classList.remove('open'));
});

// ===== Start =====
startWelcome();
