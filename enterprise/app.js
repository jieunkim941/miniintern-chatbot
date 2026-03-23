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
let navState = { userType: null, category: null };
let sessionDate = null;  // 세션 최초 생성 시간 보존
let isLoggedIn = false;
let pendingLoginQuestion = null;
let freeInputCount = 0;
const FREE_INPUT_LIMIT = 5;

// ===== Input bar show/hide =====
function hideInput() {
  inputBar.style.display = 'none';
}
function showInput() {
  inputBar.style.display = '';
  inputField.disabled = false;
  inputField.placeholder = '메시지를 입력하세요...';
  inputField.focus();
}

// =============================================================
//  FAQ Tree — 시나리오 기반 데이터
//  ※ 동적 정보 조회형: 날짜는 샘플 데이터입니다.
//    실제 서비스에서는 어드민 API를 통해 기수별 날짜를 조회해야 합니다.
//    필드: {제출마감일}, {중간피드백일}, {결과발표일}
// =============================================================
const FAQ_TREE = {
  '기업회원': {
    label: '기업회원',
    categories: {
      '계정·권한': {
        questions: [
          {
            question: '기업 정보(로고, 소개)를 수정하고 싶어요',
            requiresLogin: true,
            answerType: 'image',
            answer: '안녕하세요, 미니인턴 운영팀입니다 :)<br><br>채용관 설정 > 기업 프로필에서 로고·소개 등을 수정하실 수 있습니다.<br><br>감사합니다.',
            imagePlaceholder: '기업 프로필 수정 화면 안내 스크린샷',
            keywords: ['기업', '정보', '로고', '소개', '수정']
          },
          {
            question: '퇴사한 담당자 권한을 제거하고 싶어요',
            requiresLogin: true,
            answerType: 'image',
            answer: '안녕하세요, 미니인턴 운영팀입니다 :)<br><br>채용관 설정 > 멤버 관리에서 해당 담당자의 권한을 [퇴사]로 변경해 주시면 됩니다.<br><br>감사합니다.',
            imagePlaceholder: '권한 변경 화면 안내 스크린샷',
            keywords: ['퇴사', '권한', '제거', '담당자']
          },
          {
            question: '권한 종류가 어떻게 되나요?',
            answerType: 'text',
            answer: '안녕하세요, 미니인턴 운영팀입니다 :)<br><br>마스터 / 인사담당자 / 구성원 / 퇴사 4가지 권한이 있습니다.<br>최초 가입자는 마스터 권한을 자동으로 부여받으며, 이후 가입자의 권한을 지정·변경할 수 있습니다.<br><br>감사합니다.',
            keywords: ['권한', '종류', '마스터', '인사']
          },
          {
            question: '담당자를 추가로 초대하고 싶어요',
            requiresLogin: true,
            answerType: 'image',
            answer: '안녕하세요, 미니인턴 운영팀입니다 :)<br><br>채용관 설정 > 멤버 관리 > [초대] 버튼을 통해 추가 담당자를 초대할 수 있습니다.<br><br>감사합니다.',
            imagePlaceholder: '멤버 초대 화면 안내 스크린샷',
            keywords: ['초대', '추가', '담당자', '멤버']
          }
        ]
      },
      '프로그램 개설': {
        questions: [
          {
            question: '미니인턴 기업 프로그램은 어떻게 개설하나요?',
            answerType: 'contact',
            answer: '안녕하세요, 미니인턴 운영팀입니다 :)<br><br>기업 프로그램 개설은 운영팀과 사전 협의가 필요합니다.<br>아래 채널로 문의해 주시면 안내드리겠습니다.<br><br>감사합니다.',
            keywords: ['개설', '프로그램', '만들기']
          },
          {
            question: '기획안 평가는 기업이 직접 하나요?',
            answerType: 'text',
            answer: '안녕하세요, 미니인턴 운영팀입니다 :)<br><br>네, 기업 담당자가 직접 기획안을 검토하고 피드백을 제공하는 방식으로 진행됩니다.<br>운영팀이 과정 전반을 함께 지원합니다.<br><br>감사합니다.',
            keywords: ['평가', '기획안', '검토', '기업']
          }
        ]
      },
      '지원자 관리': {
        questions: [
          {
            question: '지원자 이력서와 기획안은 어디서 확인하나요?',
            requiresLogin: true,
            answerType: 'image',
            answer: '안녕하세요, 미니인턴 운영팀입니다 :)<br><br>채용관리 > 지원자 목록 > 해당 지원자 클릭 시 이력서와 기획안을 열람할 수 있습니다.<br><br>감사합니다.',
            imagePlaceholder: '지원자 상세 열람 화면 안내 스크린샷',
            keywords: ['지원자', '이력서', '기획안', '열람']
          },
          {
            question: '지원자 평가 상태는 어떻게 변경하나요?',
            requiresLogin: true,
            answerType: 'image',
            answer: '안녕하세요, 미니인턴 운영팀입니다 :)<br><br>평가 상태는 미열람 > 검토중 > 서류합격 > 최종합격 / 불합격 순으로 변경 가능합니다.<br>기업회원 메인 > 지원자 관리 > [평가하기]에서 진행하세요.<br><br>감사합니다.',
            imagePlaceholder: '평가 상태 변경 화면 안내 스크린샷',
            keywords: ['평가', '상태', '변경', '합격']
          }
        ]
      },
      '결제·수수료': {
        questions: [
          {
            question: '채용 수수료는 얼마인가요?',
            requiresLogin: true,
            answerType: 'text',
            answer: '안녕하세요, 미니인턴 운영팀입니다 :)<br><br>채용관을 통해 정규직·계약직 전환 시 계약 연봉의 6% 수수료가 발생합니다.<br>수습 기간 중에는 별도 비용이 발생하지 않습니다.<br><br>감사합니다.',
            keywords: ['수수료', '비용', '얼마', '가격']
          },
          {
            question: '세금계산서 발행은 어떻게 하나요?',
            answerType: 'contact',
            answer: '안녕하세요, 미니인턴 운영팀입니다 :)<br><br>세금계산서 발행은 운영팀으로 직접 문의해 주세요.<br><br>감사합니다.',
            keywords: ['세금', '계산서', '발행', '영수증']
          }
        ]
      },
      '채용공고': {
        questions: [
          {
            question: '등록한 공고를 수정하거나 마감할 수 있나요?',
            requiresLogin: true,
            answerType: 'text',
            answer: '안녕하세요, 미니인턴 운영팀입니다 :)<br><br>채용관리 > 공고 목록 > 해당 공고 선택 > [수정] 또는 [마감] 버튼을 이용해 주세요.<br><br>감사합니다.',
            keywords: ['공고', '수정', '마감', '변경']
          },
          {
            question: '채용공고는 어떻게 등록하나요?',
            requiresLogin: true,
            answerType: 'image',
            answer: '안녕하세요, 미니인턴 운영팀입니다 :)<br><br>recruitment.miniintern.com 접속 > 채용관리 > [공고 등록] 버튼을 눌러 진행해 주세요.<br><br>감사합니다.',
            imagePlaceholder: '공고 등록 화면 안내 스크린샷',
            keywords: ['공고', '등록', '작성']
          }
        ]
      }
    }
  }
};

// ===== Scroll to bottom =====
function formatDateTime(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const h = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  return `${y}.${m}.${d} ${h}:${min}`;
}

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

// ===== Dev Comment (동적 정보 안내) =====
function addDevComment(comment) {
  const row = document.createElement('div');
  row.className = 'msg-row';
  row.innerHTML = `
    <div class="msg-avatar" style="visibility:hidden;"><img src="./mi-bot.svg" width="28" height="28" style="border-radius:50%;"></div>
    <div class="dev-comment">
      <span class="dev-comment-label">DEV</span>
      <span>${comment}</span>
    </div>`;
  chatBody.appendChild(row);
  scrollBottom();
}

// ===== Unified Answer Renderer =====
async function renderAnswer(questionObj, showThinking = false) {
  if (questionObj.answerType === 'image') {
    await addBotMsgWithImage(questionObj.answer, questionObj.imagePlaceholder, 600, showThinking);
  } else {
    await addBotMsg(questionObj.answer, 600, showThinking);
  }

  switch (questionObj.answerType) {
    case 'contact':
      addContactCard();
      break;
    case 'dynamic':
      // devComment는 개발 문서 참고용 — 챗봇 UI에는 출력하지 않음
      break;
  }
}

// ===== Bot message with image placeholder =====
function addBotMsgWithImage(text, imagePlaceholder, delay = 600, showThinking = false) {
  const bubbleHTML = `
    <div class="msg-avatar"><img src="./mi-bot.svg" width="28" height="28" style="border-radius:50%;"></div>
    <div class="msg-bubble bot bubble-with-image">
      <div class="bubble-text">${text}</div>
      <div class="image-placeholder">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2M8.5 13.5l2.5 3.01L14.5 12l4.5 6H5z"/></svg>
        <span>${imagePlaceholder}</span>
      </div>
    </div>`;

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
        row.innerHTML = bubbleHTML;
        chatBody.appendChild(row);
        messageLog.push({ type: 'bot', text: text + `\n[이미지: ${imagePlaceholder}]` });
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
      row.innerHTML = bubbleHTML;
      chatBody.appendChild(row);
      messageLog.push({ type: 'bot', text: text + `\n[이미지: ${imagePlaceholder}]` });
      scrollBottom();
      resolve();
    }, 3500);
  });
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

function addChatHistoryEmailCard() {
  const row = document.createElement('div');
  row.className = 'msg-row';
  row.innerHTML = `
    <div class="msg-avatar"><img src="./mi-bot.svg" width="28" height="28" style="border-radius:50%;"></div>
    <div class="cs-card">
      <div class="cs-card-header">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="m3.4 20.4l17.45-7.48a1 1 0 0 0 0-1.84L3.4 3.6a.993.993 0 0 0-1.39.91L2 9.12c0 .5.37.93.87.99L17 12L2.87 13.88c-.5.07-.87.5-.87 1l.01 4.61c0 .71.73 1.2 1.39.91"/></svg>
        <span>대화 내역 메일 전송</span>
      </div>
      <p class="cs-card-desc">지금까지의 대화 내용이 운영팀(example@miniintern.com)에 자동 전송됩니다.</p>
      <div class="cs-card-actions">
        <button class="cs-btn cs-btn-primary" onclick="sendChatHistoryEmailDemo()">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="m3.4 20.4l17.45-7.48a1 1 0 0 0 0-1.84L3.4 3.6a.993.993 0 0 0-1.39.91L2 9.12c0 .5.37.93.87.99L17 12L2.87 13.88c-.5.07-.87.5-.87 1l.01 4.61c0 .71.73 1.2 1.39.91"/></svg>
          대화 내역 전송하기
        </button>
        <button class="cs-btn cs-btn-secondary" onclick="dismissEmailInquiry()">
          다음에 할게요
        </button>
      </div>
    </div>`;
  chatBody.appendChild(row);
  scrollBottom();
}

async function sendChatHistoryEmailDemo() {
  // ※ 프로토타입: 실제 메일 전송 없이 UI만 동작
  chatBody.querySelectorAll('.cs-card').forEach(el => {
    const r = el.closest('.msg-row');
    if (r) r.remove();
  });
  await addBotMsg('대화 내역이 운영팀(example@miniintern.com)에 전송되었습니다!<br>담당자가 확인 후 연락드릴게요.');
  showPostAnswerChips();
}

async function dismissEmailInquiry() {
  chatBody.querySelectorAll('.cs-card').forEach(el => {
    const r = el.closest('.msg-row');
    if (r) r.remove();
  });
  await addBotMsg('네, 알겠습니다! 다른 궁금한 점이 있으면 언제든 물어보세요.');
  showPostAnswerChips();
}

function addContactCard() {
  const row = document.createElement('div');
  row.className = 'msg-row';
  row.innerHTML = `
    <div class="msg-avatar"><img src="./mi-bot.svg" width="28" height="28" style="border-radius:50%;"></div>
    <div class="contact-card">
      <div class="contact-card-header">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2"/></svg>
        운영팀 문의 채널
      </div>
      <div class="contact-card-list">
        <div class="contact-row" onclick="copyText('help@miniintern.com', this)">
          <span class="contact-label">이메일</span>
          <span class="contact-value">help@miniintern.com</span>
          <svg class="contact-copy" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"><path fill="currentColor" d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2m0 16H8V7h11z"/></svg>
        </div>
        <div class="contact-row" onclick="copyText('010-0000-0000', this)">
          <span class="contact-label">연락처</span>
          <span class="contact-value">010-0000-0000</span>
          <svg class="contact-copy" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"><path fill="currentColor" d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2m0 16H8V7h11z"/></svg>
        </div>
      </div>
    </div>`;
  chatBody.appendChild(row);
  scrollBottom();
}

function copyText(text, el) {
  navigator.clipboard.writeText(text).then(() => {
    const valueEl = el.querySelector('.contact-value');
    if (valueEl) {
      const original = valueEl.textContent;
      valueEl.textContent = '복사 완료!';
      valueEl.classList.add('copied');
      setTimeout(() => {
        valueEl.textContent = original;
        valueEl.classList.remove('copied');
      }, 1500);
    }
  });
}

async function sendChatHistory() {
  chatBody.querySelectorAll('.cs-card').forEach(el => {
    const r = el.closest('.msg-row');
    if (r) r.remove();
  });
  await addBotMsg('채팅 내역이 운영팀에 전송되었습니다! 담당자가 확인 후 연락드릴게요.');
  showPostAnswerChips();
}

async function startCsInquiry() {
  chatBody.querySelectorAll('.cs-card').forEach(el => {
    const r = el.closest('.msg-row');
    if (r) r.remove();
  });
  csInquiryMode = true;
  await addBotMsg('운영팀에게 보낼 문의사항을 작성해주세요.');
  showInput();
}

// ===== Free Input Limit Check =====
function isFreeInputLimitReached() {
  return freeInputCount >= FREE_INPUT_LIMIT;
}

// ===== Login Prompt =====
function addLoginPrompt() {
  const row = document.createElement('div');
  row.className = 'msg-row';
  row.innerHTML = `
    <div class="msg-avatar"><img src="./mi-bot.svg" width="28" height="28" style="border-radius:50%;"></div>
    <div class="msg-bubble bot login-prompt-bubble">
      <div>로그인 유저에 한해 답변 가능한 내용입니다. 로그인 후 다시 질문해 주세요.</div>
      <button class="cs-btn cs-btn-primary" onclick="handleLogin()" style="margin-top:12px; width:100%;">로그인하기</button>
    </div>`;
  chatBody.appendChild(row);
  messageLog.push({ type: 'bot', text: '로그인 유저에 한해 답변 가능한 내용입니다.' });
  scrollBottom();
}

async function handleLogin() {
  // 프로토타입: 실제로는 로그인 페이지로 이동
  isLoggedIn = true;
  chatBody.querySelectorAll('.login-prompt-bubble').forEach(el => {
    const r = el.closest('.msg-row');
    if (r) r.remove();
  });
  await addBotMsg('로그인되었습니다!');

  if (pendingLoginQuestion) {
    const q = pendingLoginQuestion;
    pendingLoginQuestion = null;
    await renderAnswer(q);
  }
  showPostAnswerChips();
}

// ===== Tree Navigation =====
function handleUserTypeSelect(type) {
  const key = '기업회원';
  navState.userType = key;
  navState.category = null;

  const categories = Object.keys(FAQ_TREE[key].categories);
  addBotMsg('궁금한 카테고리를 선택해주세요!');
  addQuickReplies([...categories, '직접 입력'], handleCategorySelect);
}

async function handleCategorySelect(category) {
  if (category === '직접 입력') {
    if (!isLoggedIn) {
      addLoginPrompt();
      return;
    }
    if (isFreeInputLimitReached()) {
      await addBotMsg('일일 최대 요청을 초과하였습니다. 0시 이후 다시 요청해 주세요.');
      showPostAnswerChips();
      return;
    }
    enterChatSession('직접 입력');
    chatBody.innerHTML = '';
    messageLog = [];
    await addBotMsg('궁금한 내용을 직접 입력해주세요!');
    showInput();
    return;
  }

  enterChatSession(category);
  chatBody.innerHTML = '';
  messageLog = [];

  // 카테고리가 현재 유저 타입에 없으면 전체에서 찾기
  let userType = navState.userType;
  if (!userType || !FAQ_TREE[userType]?.categories[category]) {
    for (const ut of Object.keys(FAQ_TREE)) {
      if (FAQ_TREE[ut].categories[category]) {
        userType = ut;
        navState.userType = ut;
        break;
      }
    }
  }

  navState.category = category;
  const questions = FAQ_TREE[userType].categories[category].questions.map(q => q.question);

  await addBotMsg(`<b>${category}</b> 관련 질문이에요. 원하시는 질문을 선택해주세요!`);
  addQuickReplies([...questions, '다른게 궁금해요', '직접 입력'], handleQuestionSelect);
}

async function handleQuestionSelect(questionText) {
  if (questionText === '직접 입력') {
    if (!isLoggedIn) {
      addLoginPrompt();
      return;
    }
    if (isFreeInputLimitReached()) {
      await addBotMsg('일일 최대 요청을 초과하였습니다. 0시 이후 다시 요청해 주세요.');
      showPostAnswerChips();
      return;
    }
    await addBotMsg('궁금한 내용을 직접 입력해주세요!');
    showInput();
    return;
  }

  if (questionText === '다른 카테고리 보기') {
    if (navState.userType) {
      const categories = Object.keys(FAQ_TREE[navState.userType].categories);
      await addBotMsg('카테고리를 선택해주세요!');
      addQuickReplies([...categories, '직접 입력'], handleCategorySelect);
    } else {
      showUserTypeSelection();
    }
    return;
  }

  if (questionText === '처음으로') {
    navState = { userType: '기업회원', category: null };
    await addBotMsg('처음으로 돌아갑니다!');
    const categories = Object.keys(FAQ_TREE['기업회원'].categories);
    addQuickReplies([...categories, '직접 입력'], handleCategorySelect);
    return;
  }

  // 로그인 필요 질문 체크
  const qObjCheck = findQuestionObj(questionText);
  if (qObjCheck && qObjCheck.requiresLogin && !isLoggedIn) {
    pendingLoginQuestion = qObjCheck;
    addLoginPrompt();
    return;
  }

  // Find the question object in the tree
  const qObj = qObjCheck;
  if (qObj) {
    await renderAnswer(qObj);
    showPostAnswerChips();
  } else {
    await addBotMsg('죄송해요, 해당 질문을 찾을 수 없어요.');
    showPostAnswerChips();
  }
}

function findQuestionObj(questionText) {
  for (const ut of Object.values(FAQ_TREE)) {
    for (const cat of Object.values(ut.categories)) {
      for (const q of cat.questions) {
        if (q.question === questionText) return q;
      }
    }
  }
  return null;
}

function showPostAnswerChips() {
  const chips = [];

  // Same category questions directly
  if (navState.userType && navState.category) {
    const catQuestions = FAQ_TREE[navState.userType].categories[navState.category]?.questions || [];
    catQuestions.forEach(q => chips.push(q.question));
  }

  chips.push('다른게 궁금해요', '직접 입력');
  addQuickReplies(chips, handlePostAnswerAction);
}

async function handlePostAnswerAction(action) {
  if (action === '직접 입력') {
    if (!isLoggedIn) {
      addLoginPrompt();
      return;
    }
    if (isFreeInputLimitReached()) {
      await addBotMsg('일일 최대 요청을 초과하였습니다. 0시 이후 다시 요청해 주세요.');
      showPostAnswerChips();
      return;
    }
    await addBotMsg('궁금한 내용을 직접 입력해주세요!');
    showInput();
  } else if (action === '다른게 궁금해요') {
    handleQuestionSelect('다른 카테고리 보기');
  } else {
    handleQuestionSelect(action);
  }
}

function showUserTypeSelection() {
  addQuickReplies(['기업회원'], handleUserTypeSelect);
}

// ===== FAQ Keyword Search (flat search across tree) =====
function findFaqAnswer(text) {
  const normalized = text.toLowerCase().replace(/[?!.,]/g, '');
  let bestMatch = null;
  let bestScore = 0;

  for (const ut of Object.values(FAQ_TREE)) {
    for (const cat of Object.values(ut.categories)) {
      for (const q of cat.questions) {
        let score = 0;
        for (const kw of q.keywords) {
          if (normalized.includes(kw)) score++;
        }
        if (score > bestScore) {
          bestScore = score;
          bestMatch = q;
        }
      }
    }
  }

  return bestScore > 0 ? bestMatch : null;
}

// ===== Fallback Answers =====
const FALLBACK_ANSWERS = [
  '좋은 질문이에요! 더 자세한 내용이 궁금하시면 홈페이지를 방문하시거나, 고객센터(help@miniintern.com)로 문의해주세요!',
  '해당 내용은 미니인턴 홈페이지에서 더 자세히 확인하실 수 있어요.',
  '미니인턴은 대학생과 취준생의 커리어 성장을 돕는 플랫폼이에요. 관련해서 더 궁금한 점이 있으시면 편하게 질문해주세요!',
  '해당 사항은 미니인턴 고객센터에서 빠르게 도움받으실 수 있어요.<br><br>이메일: help@miniintern.com 으로 문의해주시면 담당자가 안내해드릴게요.',
];

function getFallbackAnswer(text) {
  const idx = Math.abs(text.split('').reduce((a, c) => a + c.charCodeAt(0), 0)) % FALLBACK_ANSWERS.length;
  return FALLBACK_ANSWERS[idx];
}

// ===== Send message (free text) =====
async function sendMessage() {
  const text = inputField.value.trim();
  if (!text) return;
  inputField.value = '';
  document.getElementById('sendBtn').disabled = true;
  chatBody.querySelectorAll('.quick-replies').forEach(el => el.remove());

  // 조회 중인 세션에 새 메시지 → 스토리지에서 기존 세션 제거 (새 시간으로 업데이트)
  if (resumedSessionId) {
    const sessions = JSON.parse(localStorage.getItem('chatbot_sessions') || '[]');
    const filtered = sessions.filter(s => s.id !== resumedSessionId);
    localStorage.setItem('chatbot_sessions', JSON.stringify(filtered));
    resumedSessionId = null;
    sessionDate = null;
      }

  addUserMsg(text);

  if (csInquiryMode) {
    csInquiryMode = false;
    hideInput();
    await addBotMsg('이 내용으로 문의를 작성할게요.');
    await addBotMsg('운영팀에 문의가 전송되었습니다! 담당자가 확인 후 연락드릴게요.');
    showPostAnswerChips();
    return;
  }

  // 채팅 종료 트리거 (프로토타입 테스트용)
  if (text === '채팅 종료') {
    hideInput();
    const sysRow = document.createElement('div');
    sysRow.className = 'msg-system';
    sysRow.textContent = '종료된 대화입니다';
    chatBody.appendChild(sysRow);
    scrollBottom();

    if (resumedSessionId) {
      const sessions = JSON.parse(localStorage.getItem('chatbot_sessions') || '[]');
      const s = sessions.find(s => s.id === resumedSessionId);
      if (s) {
        s.expired = true;
        s.messages = [...messageLog];
        localStorage.setItem('chatbot_sessions', JSON.stringify(sessions));
      }
      resumedSessionId = null;
    } else {
      const sessions = JSON.parse(localStorage.getItem('chatbot_sessions') || '[]');
      const firstUserMsg = messageLog.find(m => m.type === 'user');
      const title = firstUserMsg ? firstUserMsg.text.replace(/<[^>]*>/g, '') : '새 대화';
      const lastMsg = [...messageLog].reverse().find(m => m.type === 'bot' || m.type === 'user');
      const preview = lastMsg ? lastMsg.text.replace(/<[^>]*>/g, '') : '';
      const now = new Date();
      sessions.unshift({
        id: Date.now().toString(),
        title, preview,
        date: sessionDate || now.toLocaleDateString('ko-KR'),
        messages: [...messageLog],
        expired: true
      });
      localStorage.setItem('chatbot_sessions', JSON.stringify(sessions));
      messageLog = [];
    }
    return;
  }

  // 로그인 토글 트리거 (프로토타입 테스트용)
  if (text === '로그인') {
    isLoggedIn = !isLoggedIn;
    hideInput();
    await addBotMsg(isLoggedIn ? '로그인 상태로 전환되었습니다.' : '비로그인 상태로 전환되었습니다.');
    showPostAnswerChips();
    return;
  }

  hideInput();

  // CS 테스트 트리거
  if (text.replace(/\s/g, '').toLowerCase() === 'cs테스트') {
    await addBotMsg('죄송해요, 해당 질문은 제가 답변하기 어려운 내용이에요.', 600, true);
    await addBotMsg('운영팀에서 직접 도움을 드릴 수 있도록 안내해드릴게요!');
    addCsCard();
    return;
  }

  // 어려운 질문 트리거 — 대화 내역을 메일로 전송
  if (text === '어려운 질문') {
    await addBotMsg('해당 질문은 AI가 바로 답변드리기 어려운 내용이에요.', 600, true);
    await addBotMsg('지금까지의 대화 내용을 운영팀에 전달해드릴게요.<br>아래 버튼을 누르시면 대화 내역이 포함된 메일이 바로 전송됩니다.');
    addChatHistoryEmailCard();
    return;
  }


  // 자유 입력 카운트 증가
  freeInputCount++;

  // Keyword search across entire tree
  const faq = findFaqAnswer(text);
  if (faq) {
    await renderAnswer(faq, true);
  } else {
    const fallback = getFallbackAnswer(text);
    await addBotMsg(fallback, 600, true);
  }
  showPostAnswerChips();
}

// ===== Handle user input (from chips — no thinking) =====
async function handleUserInput(text, showThinking = false) {
  const faq = findFaqAnswer(text);
  if (faq) {
    await renderAnswer(faq, showThinking);
  } else {
    const fallback = getFallbackAnswer(text);
    await addBotMsg(fallback, 600, showThinking);
  }
  showPostAnswerChips();
}

// ===== Welcome Flow =====
async function startWelcome() {
  navState = { userType: '기업회원', category: null };
  hideInput();
  await addBotMsg('안녕하세요, 미니인턴 운영팀입니다.<br>무엇이 궁금하신가요?', 600);
  const categories = Object.keys(FAQ_TREE['기업회원'].categories);
  addQuickReplies([...categories, '직접 입력'], handleCategorySelect);
}

// ===== New Chat =====
function newChat() {
  // 조회만 한 세션은 저장하지 않고, 그냥 넘어감
  if (!resumedSessionId) {
    saveSession();
  }
  resumedSessionId = null;
  inChatSession = false;
  backBtn.style.display = 'none';
  backBtn.onclick = null;
  headerTitle.textContent = '미니인턴 AI 챗봇';
  historyBtn.style.display = '';
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
    date: sessionDate || formatDateTime(now),
    messages: [...messageLog]
  });

  localStorage.setItem('chatbot_sessions', JSON.stringify(sessions));
  messageLog = [];
  sessionDate = null;
  }

// ===== Chat Session Depth (롤백 시 이 블록 제거) =====
let inChatSession = false;

function enterChatSession(title) {
  if (inChatSession) return;
  inChatSession = true;

  // 헤더 변경: 뒤로가기 + 제목, 채팅내역 숨김
  backBtn.style.display = 'flex';
  backBtn.onclick = exitChatSession;
  headerTitle.textContent = title;
  historyBtn.style.display = 'none';
}

function exitChatSession() {
  if (!inChatSession) return;
  inChatSession = false;

  // 현재 대화 저장
  if (messageLog.length > 0 && !resumedSessionId) {
    saveSession();
  }
  resumedSessionId = null;

  // 헤더 복원
  backBtn.style.display = 'none';
  backBtn.onclick = null;
  headerTitle.textContent = '미니인턴 AI 챗봇';
  historyBtn.style.display = '';

  // 웰컴 화면 새로 생성 (유저 선택 흔적 없이 깨끗하게)
  chatBody.innerHTML = '';
  messageLog = [];
  navState = { userType: '기업회원', category: null };
  hideInput();
  startWelcome();
}

// ===== Tab Switching =====
function switchTab(tab) {
  currentTab = tab;
  if (tab === 'chat') {
    chatBody.style.display = '';
    historyPanel.style.display = 'none';
    inputBar.style.display = '';
    if (inChatSession) {
      historyBtn.style.display = 'none';
      backBtn.style.display = 'flex';
      backBtn.onclick = exitChatSession;
    } else {
      historyBtn.style.display = '';
      backBtn.style.display = 'none';
      backBtn.onclick = null;
      headerTitle.textContent = '미니인턴 AI 챗봇';
    }
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
    date: sessionDate || formatDateTime(now),
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
          <div class="history-item-date">${s.date}</div>
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
let resumedSessionId = null;  // 조회 중인 세션 ID (수정 없이 조회만 할 때 보존)

function resumeSession(id) {
  if (id === '_current') { switchTab('chat'); return; }

  const sessions = JSON.parse(localStorage.getItem('chatbot_sessions') || '[]');
  const idx = sessions.findIndex(s => s.id === id);
  if (idx === -1) return;

  const session = sessions[idx];

  // 현재 진행 중인 대화가 있으면 저장
  if (messageLog.length > 0 && !resumedSessionId) {
    saveSession();
  }

  // 조회만 하는 것이므로 스토리지에서 삭제하지 않음
  resumedSessionId = id;
  messageLog = [...session.messages];
  sessionDate = session.date;

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
        <div class="msg-bubble user">${msg.text}</div>`;
      chatBody.appendChild(row);
    }
  });

  // 세션 제목으로 chat session 진입
  inChatSession = true;
  backBtn.style.display = 'flex';
  backBtn.onclick = exitChatSession;
  headerTitle.textContent = session.title;
  historyBtn.style.display = 'none';

  // navState 복원: 마지막 유저 메시지로 카테고리 추론
  navState = { userType: '기업회원', category: null };
  const userMsgs = session.messages.filter(m => m.type === 'user');
  if (userMsgs.length > 0) {
    const lastUserText = userMsgs[userMsgs.length - 1].text;
    const matchedQ = findQuestionObj(lastUserText);
    if (matchedQ) {
      // 해당 질문이 속한 카테고리 찾기
      for (const [ut, utData] of Object.entries(FAQ_TREE)) {
        for (const [catName, catData] of Object.entries(utData.categories)) {
          if (catData.questions.some(q => q.question === lastUserText)) {
            navState = { userType: ut, category: catName };
          }
        }
      }
    }
  }

  const isExpired = session.expired === true;

  switchTab('chat');
  hideInput();

  if (isExpired) {
    const sysRow = document.createElement('div');
    sysRow.className = 'msg-system';
    sysRow.textContent = '종료된 대화입니다';
    chatBody.appendChild(sysRow);
  } else {
    showPostAnswerChips();
  }
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
  if (!resumedSessionId) {
    saveSession();
  }
});

// ===== Start =====
startWelcome();
