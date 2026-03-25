const chatBody = document.getElementById('chatBody');
const inputField = document.getElementById('inputField');
const backBtn = document.getElementById('backBtn');
const headerTitle = document.getElementById('headerTitle');

const historyPanel = document.getElementById('historyPanel');
const historyBtn = document.getElementById('historyBtn');

let messageLog = [];
let currentTab = 'chat';
let csInquiryMode = false;
let navState = { userType: null, category: null };
let sessionDate = null;  // 세션 최초 생성 시간 보존
let isLoggedIn = false;
let pendingLoginQuestion = null;  // 로그인 후 답변할 질문 저장
let freeInputCount = 0;  // 자유 입력 횟수 (일일 최대 5회)
const FREE_INPUT_LIMIT = 5;

// ===== Input bar show/hide =====
const inputBarWrap = document.querySelector('.input-bar-wrap');
const inputError = document.getElementById('inputError');
const inputContainer = document.getElementById('inputContainer');
const MAX_INPUT_LENGTH = 300;

function hideInput() {
  if (inputBarWrap) inputBarWrap.style.display = 'none';
}
function showInput() {
  if (inputBarWrap) inputBarWrap.style.display = '';
  inputField.disabled = false;
  inputField.value = '';
  inputField.style.height = 'auto';
  if (inputError) inputError.style.display = 'none';
  if (inputContainer) inputContainer.classList.remove('error');
  const counter = document.getElementById('inputCounter');
  if (counter) { counter.textContent = `0 / ${MAX_INPUT_LENGTH}`; counter.classList.remove('error'); }
  const sendBtn = document.getElementById('sendBtn');
  if (sendBtn) sendBtn.classList.remove('active');
  inputField.focus();
}
let inputOverLimit = false;

function handleInputChange(el) {
  if (el.value.length > MAX_INPUT_LENGTH) {
    const cursorPos = el.selectionStart;
    const newChar = el.value.charAt(cursorPos - 1);
    el.value = el.value.slice(0, MAX_INPUT_LENGTH - 1) + newChar;
    el.selectionStart = el.selectionEnd = MAX_INPUT_LENGTH;
    inputOverLimit = true;
  } else if (el.value.length < MAX_INPUT_LENGTH) {
    inputOverLimit = false;
  }
  const len = el.value.length;
  const over = inputOverLimit;
  const hasText = el.value.trim().length > 0;
  const counter = document.getElementById('inputCounter');
  const sendBtn = document.getElementById('sendBtn');

  // 에러 상태
  if (inputError) inputError.style.display = over ? 'flex' : 'none';
  if (inputContainer) inputContainer.classList.toggle('error', over);
  if (counter) {
    counter.textContent = `${len} / ${MAX_INPUT_LENGTH}`;
    counter.classList.toggle('error', over);
  }

  // 전송 버튼 활성/비활성
  if (sendBtn) {
    sendBtn.disabled = !hasText || over;
    sendBtn.classList.toggle('active', hasText && !over);
  }

  // Auto-resize
  el.style.height = 'auto';
  el.style.height = Math.min(el.scrollHeight, 98) + 'px';
}
function handleInputKeydown(e) {
  if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) {
    e.preventDefault();
    sendMessage();
  }
}

// =============================================================
//  FAQ Tree — 시나리오 기반 데이터
//  ※ 동적 정보 조회형: 날짜는 샘플 데이터입니다.
//    실제 서비스에서는 어드민 API를 통해 기수별 날짜를 조회해야 합니다.
//    필드: {제출마감일}, {중간피드백일}, {결과발표일}
// =============================================================
const FAQ_TREE = {
  '구직자': {
    label: '구직자 (취준생)',
    categories: {
      '신청·참여': {
        questions: [
          {
            question: '여러 프로그램에 동시 신청할 수 있나요?',
            answerType: 'text',
            answer: '안녕하세요, 미니인턴 운영팀입니다 :)<br><br>복수의 프로그램에 동시 신청이 가능합니다!<br>단, 각 프로그램 일정이 겹치지 않는지 확인 후 신청해 주시기 바랍니다.<br><br>감사합니다.',
            keywords: ['동시', '여러', '복수', '중복', '신청']
          },
          {
            question: '미니인턴 신청 방법을 모르겠어요',
            answerType: 'image',
            answer: '안녕하세요, 미니인턴 운영팀입니다 :)<br><br>① miniintern.com 접속 ><br>② 원하는 프로그램 선택 ><br>③ [신청하기] 클릭 ><br>④ 신청서 작성 및 제출<br><br>순서로 진행하시면 됩니다.<br><br>감사합니다.',
            imagePlaceholder: '신청 화면 단계별 안내 스크린샷',
            imageSrc: './images/sample-guide.jpg',
            keywords: ['신청', '방법', '어떻게', '지원']
          }
        ]
      },
      '과제': {
        questions: [
          {
            question: '과제를 중도에 그만두면 어떻게 되나요?',
            answerType: 'text',
            answer: '안녕하세요, 미니인턴 운영팀입니다 :)<br><br>중도 포기 시 수료증 발급이 불가하며, 해당 프로그램 참여 이력이 남지 않을 수 있습니다.<br>불가피한 사정이 있으시면 운영팀으로 별도 연락 부탁드립니다.<br><br>감사합니다.',
            keywords: ['중도', '포기', '그만', '취소']
          },
          {
            question: '기획안 파일 형식(PDF, PPT 등)이 정해져 있나요?',
            answerType: 'text',
            answer: '안녕하세요, 미니인턴 운영팀입니다 :)<br><br>파일 형식은 PDF 또는 PPT(PPTX) 중 자유롭게 선택하여 제출해 주시면 됩니다!<br><br>감사합니다.',
            keywords: ['파일', '형식', 'pdf', 'ppt', '제출']
          },
          {
            question: '기업 내부 자료는 어디서 확인할 수 있나요?',
            answerType: 'image',
            answer: '안녕하세요, 미니인턴 운영팀입니다 :)<br><br>기업 내부 자료는 신청 페이지 내 [자료실] 탭에서 확인하실 수 있습니다.<br><br>감사합니다.',
            imagePlaceholder: '자료실 탭 위치 안내 스크린샷',
            imageSrc: './images/sample-guide.jpg',
            keywords: ['내부', '자료', '자료실', '기업']
          },
          {
            question: '기획안 분량(페이지 수)은 정해져 있나요?',
            answerType: 'text',
            answer: '안녕하세요, 미니인턴 운영팀입니다 :)<br><br>기획안 분량은 별도로 정해져 있지 않으며, 과제 내용을 충실히 담을 수 있는 분량으로 자유롭게 작성해 주시면 됩니다!<br><br>감사합니다.',
            keywords: ['분량', '페이지', '몇장', '몇 장']
          }
        ]
      },
      '수료·증명': {
        questions: [
          {
            question: '경력증명서도 발급 가능한가요?',
            answerType: 'contact',
            answer: '안녕하세요, 미니인턴 운영팀입니다 :)<br><br>수료증은 마이페이지에서 자체 발급 가능하나, 경력증명서는 운영팀에 별도 요청해 주셔야 합니다.<br>아래 채널로 문의해 주세요.<br><br>감사합니다.',
            keywords: ['경력', '증명서', '경력증명']
          },
          {
            question: '수료증은 어떻게 발급받나요?',
            answerType: 'image',
            answer: '안녕하세요, 미니인턴 운영팀입니다 :)<br><br>수료 후 마이페이지 > 수료증 탭에서 직접 출력 및 다운로드 가능합니다.<br><br>감사합니다.',
            imagePlaceholder: '마이페이지 수료증 탭 위치 안내 스크린샷',
            imageSrc: './images/sample-guide.jpg',
            keywords: ['수료증', '발급', '출력', '다운']
          },
          {
            question: '수료 조건이 어떻게 되나요?',
            answerType: 'text',
            answer: '안녕하세요, 미니인턴 운영팀입니다 :)<br><br>정해진 기한 내 최종 결과물을 제출하시면 수료 처리됩니다.<br>제출 기한은 [일정 > 최종 제출 기한]에서 확인하세요!<br><br>감사합니다.',
            keywords: ['수료', '조건', '기준']
          }
        ]
      },
      '계정·프로필': {
        questions: [
          {
            question: '이력서는 어디서 등록하나요?',
            requiresLogin: true,
            answerType: 'image',
            answer: '안녕하세요, 미니인턴 운영팀입니다 :)<br><br>마이페이지 > 이력서 탭에서 등록 및 수정하실 수 있습니다.<br><br>감사합니다.',
            imagePlaceholder: '마이페이지 이력서 탭 위치 안내 스크린샷',
            imageSrc: './images/sample-guide.jpg',
            keywords: ['이력서', '등록', '프로필']
          },
          {
            question: '비밀번호를 잊어버렸어요',
            answerType: 'text',
            answer: '안녕하세요, 미니인턴 운영팀입니다 :)<br><br>로그인 화면 > [비밀번호 찾기] 클릭 > 가입하신 이메일 주소로 재설정 링크가 발송됩니다.<br><br>감사합니다.',
            keywords: ['비밀번호', '패스워드', '로그인', '잊어']
          }
        ]
      },
      '일정': {
        questions: [
          {
            // ※ 동적 정보: {제출마감일} → 실제 서비스에서는 API 조회 필요
            question: '최종 결과물 제출 기한이 언제예요?',
            answerType: 'dynamic',
            answer: '안녕하세요, 미니인턴 운영팀입니다 :)<br><br>최종 결과물 제출 기한은 <b>3월 28일(금)</b> 오후 6시까지입니다.<br>기한 내 제출 부탁드립니다!<br><br>감사합니다.',
            devComment: '[동적 정보] 실제 값은 어드민 API에서 기수별 "제출마감일" 필드를 조회하여 삽입. 포맷: M월 D일(요일)',
            keywords: ['제출', '기한', '마감', '최종', '언제']
          },
          {
            // ※ 동적 정보: {중간피드백일} → 실제 서비스에서는 API 조회 필요
            question: '중간 피드백은 언제 올라오나요?',
            answerType: 'dynamic',
            answer: '안녕하세요, 미니인턴 운영팀입니다 :)<br><br>중간 피드백은 <b>3월 21일(금)</b> 오후 6시 이전 업로드 예정이며, 업로드 후 추가로 안내 연락을 드리고 있으니 참고 부탁드립니다.<br><br>감사합니다.',
            devComment: '[동적 정보] 실제 값은 어드민 API에서 기수별 "중간피드백일" 필드를 조회하여 삽입. 포맷: M월 D일(요일)',
            keywords: ['중간', '피드백', '멘토링']
          },
          {
            // ※ 동적 정보: {결과발표일} → 실제 서비스에서는 API 조회 필요
            question: '선발 결과는 언제 알 수 있나요?',
            answerType: 'dynamic',
            answer: '안녕하세요, 미니인턴 운영팀입니다 :)<br><br>선발 결과는 <b>3월 14일(금)</b> 오후 6시 이전에 개별적으로 안내드리고 있습니다.<br>미선발의 경우에도 개별적으로 연락드리고 있으니, 참고 부탁드립니다!<br><br>감사합니다.',
            devComment: '[동적 정보] 실제 값은 어드민 API에서 기수별 "결과발표일" 필드를 조회하여 삽입. 포맷: M월 D일(요일)',
            keywords: ['선발', '결과', '합격', '발표']
          }
        ]
      },
      '취업 연계': {
        questions: [
          {
            question: '취업성과금은 어떻게 받나요?',
            answerType: 'contact',
            answer: '안녕하세요, 미니인턴 운영팀입니다 :)<br><br>미니인턴을 통해 취업에 성공하신 경우, 운영팀으로 연락 주시면 취업성과금 지급 절차를 안내드립니다.<br><br>감사합니다.',
            keywords: ['성과금', '취업', '연계', '보상']
          }
        ]
      },
      '해피폴리오·콘텐츠': {
        questions: [
          {
            question: '구매한 콘텐츠는 어디에서 다운받을 수 있나요?',
            answerType: 'image',
            answer: '안녕하세요, 미니인턴 운영팀입니다 :)<br><br>[마이 커리어] - 해피폴리오 [구매 내역]에서 다운받으실 수 있습니다.<br><br>감사합니다.',
            imagePlaceholder: '마이 커리어 > 구매 내역 탭 위치 안내 스크린샷',
            imageSrc: './images/sample-guide.jpg',
            keywords: ['구매', '다운', '콘텐츠', '어디']
          },
          {
            question: '구매한 콘텐츠를 환불하고 싶어요',
            answerType: 'text',
            answer: '안녕하세요, 미니인턴 운영팀입니다 :)<br><br>해피폴리오는 디지털 콘텐츠 특성상 구매 후 환불이 불가합니다.<br>구매 전 콘텐츠 소개 페이지를 충분히 확인해 주시기 바랍니다.<br><br>감사합니다.',
            keywords: ['환불', '취소', '반품']
          },
          {
            question: '구매한 콘텐츠는 언제까지 이용할 수 있나요?',
            answerType: 'text',
            answer: '안녕하세요, 미니인턴 운영팀입니다 :)<br><br>구매 후 평생 이용 가능합니다.<br>단, Notion 링크로 제공되는 콘텐츠는 저자의 운영 정책에 따라 변경될 수 있습니다.<br>필요한 경우 콘텐츠 내 안내된 방법에 따라 미리 저장해 두시는 것을 추천드립니다.<br><br>감사합니다.',
            keywords: ['이용', '기간', '언제까지', '평생']
          },
          {
            question: '구매한 콘텐츠 다운로드가 안 돼요',
            requiresLogin: true,
            answerType: 'contact',
            answer: '안녕하세요, 미니인턴 운영팀입니다 :)<br><br>다운로드가 원활하지 않다면 아래를 시도해 주세요.<br><br>• <b>PDF 파일이 열리지 않는 경우</b><br>기기에 PDF 뷰어(Adobe Acrobat Reader, Chrome 등)가 설치되어 있는지 확인해 주세요.<br><br>• <b>일반 다운로드 오류</b><br>다른 브라우저에서 재시도 / 캐시 삭제 후 재시도<br><br>• <b>카카오톡·SNS 앱 내 다운로드 시 파일이 안 보이는 경우</b><br>링크를 복사하여 Chrome, Safari 등 웹 브라우저에서 열어서 다운로드를 재시도해 주세요.<br><br>문제가 지속되면 아래 채널로 문의해 주세요.',
            keywords: ['다운로드', '오류', '안돼', '안 돼', '열리지']
          }
        ]
      }
    }
  },
  '기업회원': {
    label: '기업회원',
    categories: {
      '계정·권한': {
        questions: [
          {
            question: '기업 정보(로고, 소개)를 수정하고 싶어요',
            answerType: 'image',
            answer: '안녕하세요, 미니인턴 운영팀입니다 :)<br><br>채용관 설정 > 기업 프로필에서 로고·소개 등을 수정하실 수 있습니다.<br><br>감사합니다.',
            imagePlaceholder: '기업 프로필 수정 화면 안내 스크린샷',
            imageSrc: './images/sample-guide.jpg',
            keywords: ['기업', '정보', '로고', '소개', '수정']
          },
          {
            question: '퇴사한 담당자 권한을 제거하고 싶어요',
            answerType: 'image',
            answer: '안녕하세요, 미니인턴 운영팀입니다 :)<br><br>채용관 설정 > 멤버 관리에서 해당 담당자의 권한을 [퇴사]로 변경해 주시면 됩니다.<br><br>감사합니다.',
            imagePlaceholder: '권한 변경 화면 안내 스크린샷',
            imageSrc: './images/sample-guide.jpg',
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
            answerType: 'image',
            answer: '안녕하세요, 미니인턴 운영팀입니다 :)<br><br>채용관 설정 > 멤버 관리 > [초대] 버튼을 통해 추가 담당자를 초대할 수 있습니다.<br><br>감사합니다.',
            imagePlaceholder: '멤버 초대 화면 안내 스크린샷',
            imageSrc: './images/sample-guide.jpg',
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
            answerType: 'image',
            answer: '안녕하세요, 미니인턴 운영팀입니다 :)<br><br>채용관리 > 지원자 목록 > 해당 지원자 클릭 시 이력서와 기획안을 열람할 수 있습니다.<br><br>감사합니다.',
            imagePlaceholder: '지원자 상세 열람 화면 안내 스크린샷',
            imageSrc: './images/sample-guide.jpg',
            keywords: ['지원자', '이력서', '기획안', '열람']
          },
          {
            question: '지원자 평가 상태는 어떻게 변경하나요?',
            answerType: 'image',
            answer: '안녕하세요, 미니인턴 운영팀입니다 :)<br><br>평가 상태는 미열람 > 검토중 > 서류합격 > 최종합격 / 불합격 순으로 변경 가능합니다.<br>기업회원 메인 > 지원자 관리 > [평가하기]에서 진행하세요.<br><br>감사합니다.',
            imagePlaceholder: '평가 상태 변경 화면 안내 스크린샷',
            imageSrc: './images/sample-guide.jpg',
            keywords: ['평가', '상태', '변경', '합격']
          }
        ]
      },
      '결제·수수료': {
        questions: [
          {
            question: '채용 수수료는 얼마인가요?',
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
            answerType: 'text',
            answer: '안녕하세요, 미니인턴 운영팀입니다 :)<br><br>채용관리 > 공고 목록 > 해당 공고 선택 > [수정] 또는 [마감] 버튼을 이용해 주세요.<br><br>감사합니다.',
            keywords: ['공고', '수정', '마감', '변경']
          },
          {
            question: '채용공고는 어떻게 등록하나요?',
            answerType: 'image',
            answer: '안녕하세요, 미니인턴 운영팀입니다 :)<br><br>recruitment.miniintern.com 접속 > 채용관리 > [공고 등록] 버튼을 눌러 진행해 주세요.<br><br>감사합니다.',
            imagePlaceholder: '공고 등록 화면 안내 스크린샷',
            imageSrc: './images/sample-guide.jpg',
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
const THINKING_STEPS = ['질문 파악 중', '데이터 조회 중', '답변 작성 중'];

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
    await addBotMsgWithImage(questionObj.answer, questionObj.imagePlaceholder, questionObj.imageSrc || null, 600, showThinking);
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
function addBotMsgWithImage(text, imagePlaceholder, imageSrc, delay = 600, showThinking = false) {
  const imageContent = imageSrc
    ? `<div class="image-thumb" onclick="openImageViewer('${imageSrc}')"><img src="${imageSrc}" alt="${imagePlaceholder}"></div>`
    : '';
  const bubbleHTML = `
    <div class="msg-avatar"><img src="./mi-bot.svg" width="28" height="28" style="border-radius:50%;"></div>
    <div class="msg-bubble bot bubble-with-image">
      <div class="bubble-text">${text}</div>
      ${imageContent}
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
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 32 32" fill="none"><path d="M23.999 4.69238L24.3037 4.70703C25.0086 4.77236 25.6605 5.05947 26.1484 5.50977C26.7033 6.02198 26.9991 6.69864 27 7.38574V27.0771C27 27.1113 26.9863 27.1624 26.9316 27.2129C26.8742 27.2659 26.7799 27.3075 26.667 27.3076L26.5869 27.2998C26.51 27.2854 26.4464 27.2518 26.4033 27.2119H26.4023L21.4609 22.6494L21.1729 22.3848H8.00098C7.18084 22.3839 6.40915 22.0819 5.85156 21.5674C5.36602 21.1192 5.07838 20.5451 5.01367 19.9482L5 19.6914V7.38574C5.00087 6.69864 5.29666 6.02198 5.85156 5.50977C6.33951 5.05947 6.9914 4.77236 7.69629 4.70703L8.00098 4.69238H23.999Z" stroke="currentColor" stroke-width="2"/></svg>
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

function addContactCard() {
  const row = document.createElement('div');
  row.className = 'msg-row';
  row.innerHTML = `
    <div class="msg-avatar"><img src="./mi-bot.svg" width="28" height="28" style="border-radius:50%;"></div>
    <div class="contact-card">
      <div class="contact-card-header">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 32 32" fill="none"><path d="M23.999 4.69238L24.3037 4.70703C25.0086 4.77236 25.6605 5.05947 26.1484 5.50977C26.7033 6.02198 26.9991 6.69864 27 7.38574V27.0771C27 27.1113 26.9863 27.1624 26.9316 27.2129C26.8742 27.2659 26.7799 27.3075 26.667 27.3076L26.5869 27.2998C26.51 27.2854 26.4464 27.2518 26.4033 27.2119H26.4023L21.4609 22.6494L21.1729 22.3848H8.00098C7.18084 22.3839 6.40915 22.0819 5.85156 21.5674C5.36602 21.1192 5.07838 20.5451 5.01367 19.9482L5 19.6914V7.38574C5.00087 6.69864 5.29666 6.02198 5.85156 5.50977C6.33951 5.05947 6.9914 4.77236 7.69629 4.70703L8.00098 4.69238H23.999Z" stroke="currentColor" stroke-width="2"/></svg>
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

// ===== Image Viewer =====
function openImageViewer(src) {
  const viewer = document.createElement('div');
  viewer.className = 'image-viewer';
  viewer.innerHTML = `
    <div class="image-viewer-backdrop" onclick="this.parentElement.remove()"></div>
    <div class="image-viewer-content">
      <img src="${src}" alt="이미지 전체보기">
      <button class="image-viewer-close" onclick="this.closest('.image-viewer').remove()">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12z"/></svg>
      </button>
    </div>`;
  document.body.appendChild(viewer);
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
  const key = type === '구직자 (취준생)' ? '구직자' : '기업회원';
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
    if (!inChatSession) {
      enterChatSession('직접 입력');
      chatBody.innerHTML = '';
      messageLog = [];
    }
    await addBotMsg('궁금한 내용을 직접 입력해주세요!');
    showInput();
    return;
  }

  if (!inChatSession) {
    enterChatSession(category);
    chatBody.innerHTML = '';
    messageLog = [];
  }

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
    navState = { userType: '구직자', category: null };
    await addBotMsg('처음으로 돌아갑니다!');
    const categories = Object.keys(FAQ_TREE['구직자'].categories);
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
  addQuickReplies(['구직자 (취준생)', '기업회원'], handleUserTypeSelect);
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
  inputField.style.height = 'auto';
  const sendBtn = document.getElementById('sendBtn');
  sendBtn.disabled = true;
  sendBtn.classList.remove('active');
  const counter = document.getElementById('inputCounter');
  if (counter) { counter.textContent = `0 / ${MAX_INPUT_LENGTH}`; counter.classList.remove('error'); }
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
    // 현재 세션을 expired로 저장
    const sysRow = document.createElement('div');
    sysRow.className = 'msg-system';
    sysRow.textContent = '종료된 대화입니다';
    chatBody.appendChild(sysRow);
    scrollBottom();

    // 세션 저장 시 expired 플래그 추가
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
      // 새 세션인 경우 expired로 저장
      const sessions = JSON.parse(localStorage.getItem('chatbot_sessions') || '[]');
      const firstUserMsg = messageLog.find(m => m.type === 'user');
      const title = firstUserMsg ? firstUserMsg.text.replace(/<[^>]*>/g, '') : '새 대화';
      const lastMsg = [...messageLog].reverse().find(m => m.type === 'bot' || m.type === 'user');
      const preview = lastMsg ? lastMsg.text.replace(/<[^>]*>/g, '') : '';
      const now = new Date();
      sessions.unshift({
        id: Date.now().toString(),
        title, preview,
        date: sessionDate || formatDateTime(now),
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
  navState = { userType: '구직자', category: null };
  hideInput();
  await addBotMsg('안녕하세요, 미니인턴 운영팀입니다.<br>무엇이 궁금하신가요?', 600);
  const categories = Object.keys(FAQ_TREE['구직자'].categories);
  addQuickReplies([...categories, '직접 입력'], handleCategorySelect);
}

// ===== New Chat =====
function newChatFromHistory() {
  switchTab('chat');
  newChat();
}

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
  navState = { userType: '구직자', category: null };
  hideInput();
  startWelcome();
}

// ===== Tab Switching =====
function switchTab(tab) {
  currentTab = tab;
  const newChatBtn = document.getElementById('newChatBtn');
  if (tab === 'chat') {
    chatBody.style.display = '';
    historyPanel.style.display = 'none';
    if (newChatBtn) newChatBtn.style.display = 'none';
    if (inputBarWrap) inputBarWrap.style.display = '';
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
    if (newChatBtn) newChatBtn.style.display = '';
    if (inputBarWrap) inputBarWrap.style.display = 'none';
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
  navState = { userType: '구직자', category: null };
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

  // 종료된 대화 판단: 세션에 expired 플래그가 있는 경우
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
  const wasOpen = phone.classList.contains('open');

  if (!wasOpen) {
    // 열 때: 만료 안 된 최근 대화가 있으면 진입
    const sessions = JSON.parse(localStorage.getItem('chatbot_sessions') || '[]');
    const activeSession = sessions.find(s => !s.expired);
    if (activeSession && !inChatSession && messageLog.length === 0) {
      resumeSession(activeSession.id);
    }
  }

  const isOpen = phone.classList.toggle('open');
  fab.classList.toggle('active', isOpen);
}

// ===== Auto-save on page unload =====
window.addEventListener('beforeunload', () => {
  if (!resumedSessionId) {
    saveSession();
  }
});

// ===== Migrate old session date format =====
(function migrateSessions() {
  const sessions = JSON.parse(localStorage.getItem('chatbot_sessions') || '[]');
  let changed = false;
  sessions.forEach(s => {
    // 기존 date + time 분리 포맷 → YYYY.MM.DD HH:MM 통합
    if (s.time) {
      const timePart = s.time.slice(0, 5); // "14:32:10" → "14:32"
      // 기존 date: "2026. 3. 23." → "2026.03.23"
      const dateParts = s.date.replace(/\.\s*/g, '.').replace(/\.$/, '').split('.');
      if (dateParts.length >= 3) {
        const y = dateParts[0];
        const m = dateParts[1].padStart(2, '0');
        const d = dateParts[2].padStart(2, '0');
        s.date = `${y}.${m}.${d} ${timePart}`;
      }
      delete s.time;
      changed = true;
    }
  });
  if (changed) {
    localStorage.setItem('chatbot_sessions', JSON.stringify(sessions));
  }
})();

// ===== Start =====
startWelcome();
