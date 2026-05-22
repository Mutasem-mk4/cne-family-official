/**
 * CNE AI Assistant (مساعد CNE الذكي)
 * Layer 2 & 3: UI and Logic Implementation
 */

class AIChatAssistant {
  constructor() {
    this.kb = {};
    this.isOpen = false;
    this.messages = [];
    this.init();
  }

  async init() {
    // 1. Fetch the Knowledge Base
    try {
      const response = await fetch('/data/ai-knowledge.json');
      this.kb = await response.json();
    } catch (e) {
      console.warn('AI Knowledge base not loaded, using fallback greetings.');
    }

    // 2. Create the UI
    this.renderUI();
    this.addEventListeners();
    
    // 3. Initial greeting after a small delay
    setTimeout(() => {
      this.addMessage('bot', 'أهلاً بك! أنا مساعد CNE الذكي 🤖. يمكنني مساعدتك في الوصول إلى روابط المواد أو الخطط الدراسية أو تزويدك بتفاصيل عن تخصصك. كيف يمكنني خدمتك اليوم؟');
    }, 2000);
  }

  renderUI() {
    const html = `
      <!-- Floating Action Button -->
      <button id="ai-fab" class="ai-fab" aria-label="Open AI Assistant">
        <span class="ai-fab-icon">✨</span>
      </button>

      <!-- Chat Window -->
      <div id="ai-chat-window" class="ai-chat-window">
        <div class="ai-chat-header">
          <div class="ai-chat-header-info">
            <span class="ai-chat-dot"></span>
            <strong>مساعد CNE الذكي</strong>
          </div>
          <button id="ai-chat-close" class="ai-chat-close material-symbols-outlined">close</button>
        </div>
        
        <div id="ai-chat-messages" class="ai-chat-messages">
          <!-- Messages go here -->
        </div>

        <div class="ai-chat-input-container">
          <div class="ai-chat-suggestions" id="ai-suggestions">
            <button class="ai-suggestion-btn">رابط التفاضل والتكامل 1</button>
            <button class="ai-suggestion-btn">الخطة الدراسية</button>
            <button class="ai-suggestion-btn">حاسبة المعدل</button>
          </div>
          <div class="ai-chat-input-wrapper">
            <input type="text" id="ai-input" placeholder="اسألني عن مادة أو رابط ما..." autocomplete="off">
            <button id="ai-send" class="ai-send material-symbols-outlined">send</button>
          </div>
        </div>
      </div>

      <style>
        .ai-fab {
          position: fixed;
          bottom: 32px;
          right: 32px;
          width: 64px;
          height: 64px;
          border-radius: 22px;
          background: linear-gradient(135deg, var(--blue), #1a4cd8);
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 12px 30px rgba(32, 88, 245, 0.35);
          cursor: pointer;
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28px;
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        .ai-fab:hover {
          transform: scale(1.1) rotate(8deg);
          box-shadow: 0 18px 40px rgba(32, 88, 245, 0.45);
        }

        .ai-chat-window {
          position: fixed;
          bottom: 110px;
          right: 32px;
          width: min(400px, calc(100vw - 64px));
          height: min(580px, calc(100vh - 160px));
          background: var(--surface);
          border: 1px solid var(--line);
          border-radius: 28px;
          box-shadow: 0 25px 60px rgba(0,0,0,0.3);
          z-index: 1001;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          opacity: 0;
          transform: translateY(30px) scale(0.92);
          pointer-events: none;
          transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
          backdrop-filter: blur(20px);
        }

        .ai-chat-window.active {
          opacity: 1;
          transform: translateY(0) scale(1);
          pointer-events: all;
        }

        .ai-chat-header {
          padding: 20px 24px;
          background: var(--surface-2);
          border-bottom: 1px solid var(--line);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .ai-chat-header-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .ai-chat-dot {
          width: 10px;
          height: 10px;
          background: #10b981;
          border-radius: 50%;
          box-shadow: 0 0 12px rgba(16, 185, 129, 0.5);
        }

        .ai-chat-header-info strong {
          font-family: var(--font-display);
          font-size: 1.1rem;
        }

        .ai-chat-close {
          width: 32px;
          height: 32px;
          border-radius: 10px;
          background: var(--line);
          border: none;
          font-size: 20px;
          color: var(--muted);
          cursor: pointer;
          display: grid;
          place-items: center;
          transition: all 0.2s;
        }

        .ai-chat-close:hover {
          background: var(--red);
          color: white;
        }

        .ai-chat-messages {
          flex: 1;
          padding: 24px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 18px;
          scrollbar-width: thin;
          background: radial-gradient(circle at top right, rgba(32, 88, 245, 0.03), transparent 40%);
        }

        .message {
          max-width: 88%;
          padding: 14px 18px;
          border-radius: 20px;
          font-size: 0.95rem;
          line-height: 1.6;
          position: relative;
          box-shadow: 0 2px 8px rgba(0,0,0,0.02);
          animation: messageAppear 0.4s var(--ease);
        }

        @keyframes messageAppear {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .message.bot {
          align-self: flex-start;
          background: var(--surface-3);
          color: var(--ink);
          border-bottom-left-radius: 4px;
          border: 1px solid var(--line);
        }

        .message.user {
          align-self: flex-end;
          background: var(--blue);
          color: white;
          border-bottom-right-radius: 4px;
          text-align: right;
          box-shadow: 0 8px 20px rgba(32, 88, 245, 0.2);
        }

        .ai-chat-input-container {
          padding: 20px;
          border-top: 1px solid var(--line);
          background: var(--surface-2);
        }

        .ai-chat-suggestions {
          display: flex;
          gap: 10px;
          margin-bottom: 16px;
          overflow-x: auto;
          padding-bottom: 8px;
          scrollbar-width: none;
        }

        .ai-chat-suggestions::-webkit-scrollbar { display: none; }

        .ai-suggestion-btn {
          white-space: nowrap;
          padding: 8px 14px;
          background: var(--surface-3);
          border: 1px solid var(--line);
          border-radius: 12px;
          font-size: 0.82rem;
          font-weight: 700;
          color: var(--muted);
          cursor: pointer;
          transition: all 0.2s;
        }

        .ai-suggestion-btn:hover {
          color: var(--blue);
          border-color: var(--blue);
          background: rgba(32, 88, 245, 0.05);
        }

        .ai-chat-input-wrapper {
          display: flex;
          gap: 12px;
          background: var(--surface-3);
          border: 1px solid var(--line);
          border-radius: 18px;
          padding: 6px 16px;
          align-items: center;
          box-shadow: var(--shadow-soft);
          transition: border-color 0.2s;
        }

        .ai-chat-input-wrapper:focus-within {
          border-color: var(--blue);
        }

        .ai-chat-input-wrapper input {
          flex: 1;
          border: none;
          background: none;
          padding: 10px 0;
          color: var(--ink);
          outline: none;
          font-family: inherit;
        }

        .ai-send {
          width: 40px;
          height: 40px;
          background: var(--blue);
          border: none;
          color: white;
          border-radius: 12px;
          cursor: pointer;
          display: grid;
          place-items: center;
          transition: all 0.2s;
        }

        .ai-send:hover {
          background: #1a4cd8;
          transform: scale(1.05);
        }

        .typing-indicator {
          display: flex;
          gap: 4px;
          padding: 12px 18px;
          background: var(--surface-3);
          border-radius: 20px;
          width: fit-content;
          border: 1px solid var(--line);
          align-self: flex-start;
          animation: messageAppear 0.3s var(--ease);
        }

        .typing-dot {
          width: 6px;
          height: 6px;
          background: var(--muted);
          border-radius: 50%;
          animation: typingPulse 1.4s infinite ease-in-out both;
          opacity: 0.4;
        }

        .typing-dot:nth-child(2) { animation-delay: 0.2s; }
        .typing-dot:nth-child(3) { animation-delay: 0.4s; }

        @keyframes typingPulse {
          0%, 80%, 100% { transform: scale(0.6); }
          40% { transform: scale(1.2); opacity: 1; }
        }

        @media (max-width: 640px) {
          .ai-fab { bottom: 20px; right: 20px; width: 56px; height: 56px; }
          .ai-chat-window { bottom: 84px; right: 20px; width: calc(100vw - 40px); height: calc(100vh - 120px); border-radius: 24px; }
        }
      </style>
    `;

    const container = document.createElement('div');
    container.id = 'ai-assistant-root';
    container.innerHTML = html;
    document.body.appendChild(container);
  }

  addEventListeners() {
    const fab = document.getElementById('ai-fab');
    const close = document.getElementById('ai-chat-close');
    const window = document.getElementById('ai-chat-window');
    const input = document.getElementById('ai-input');
    const send = document.getElementById('ai-send');
    const suggestions = document.querySelectorAll('.ai-suggestion-btn');

    fab.addEventListener('click', () => {
      this.isOpen = !this.isOpen;
      window.classList.toggle('active', this.isOpen);
    });

    close.addEventListener('click', () => {
      this.isOpen = false;
      window.classList.remove('active');
    });

    send.addEventListener('click', () => this.handleUserInput());
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.handleUserInput();
    });

    suggestions.forEach(btn => {
      btn.addEventListener('click', () => {
        input.value = btn.innerText;
        this.handleUserInput();
      });
    });
  }

  addMessage(role, text) {
    const container = document.getElementById('ai-chat-messages');
    const msg = document.createElement('div');
    msg.className = `message ${role}`;
    msg.innerText = text;
    container.appendChild(msg);
    container.scrollTop = container.scrollHeight;
    
    this.messages.push({ role, text });
  }

  showTypingIndicator() {
    const container = document.getElementById('ai-chat-messages');
    const indicator = document.createElement('div');
    indicator.id = 'ai-typing-indicator';
    indicator.className = 'typing-indicator';
    indicator.innerHTML = `
      <span class="typing-dot"></span>
      <span class="typing-dot"></span>
      <span class="typing-dot"></span>
    `;
    container.appendChild(indicator);
    container.scrollTop = container.scrollHeight;
    return indicator;
  }

  async handleUserInput() {
    const input = document.getElementById('ai-input');
    const query = input.value.trim();
    if (!query) return;

    this.addMessage('user', query);
    input.value = '';

    const typing = this.showTypingIndicator();
    const response = await this.generateResponse(query);

    setTimeout(() => {
      typing.remove();
      this.addMessage('bot', response);
    }, 800 + Math.random() * 800);
  }

  async generateResponse(query) {
    const q = query.toLowerCase();

    // Custom Triggers
    if (q.includes('أهلا') || q.includes('مرحبا') || q.includes('سلام')) {
      return 'أهلاً بك في منصة CNE. كيف يمكنني مساعدتك اليوم في مسيرتك الأكاديمية؟';
    }
    
    if (q.includes('خطة') || q.includes('شجرية')) {
      return 'بالتأكيد! الخطط الشجرية (Computer & Networking) موجودة في قسم "الخطط الشجرية" في القائمة العلوية، أو يمكنك الوصول إليها عبر واجهة "الأدوات الذكية" في الصفحة الرئيسية.';
    }

    if (q.includes('معدل') || q.includes('حاسبة')) {
      return 'يمكنك حساب معدلك الفصلي والتراكمي بسهولة عبر "حاسبة المعدل" المتوفرة في القائمة العلوية. بالتوفيق في دراستك!';
    }

    // Knowledge Base Search (Subject-based)
    for (const [subject, answer] of Object.entries(this.kb)) {
      if (q.includes(subject.toLowerCase())) {
        return answer;
      }
    }

    // Fallback
    return 'عذراً، هذه المعلومة غير متوفرة لدي حالياً، ولكن يمكنك التواصل مع فريق CNE الأكاديمي أو البحث في قسم "المواد الدراسية". هل هناك شيء آخر يمكنني مساعدتك به؟';
  }
}

// Initialize on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new AIChatAssistant());
} else {
  new AIChatAssistant();
}
