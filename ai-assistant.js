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
          <button id="ai-chat-close" class="ai-chat-close">&times;</button>
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
            <button id="ai-send" class="ai-send">
              <svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
            </button>
          </div>
        </div>
      </div>

      <style>
        .ai-fab {
          position: fixed;
          bottom: 30px;
          right: 30px;
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--primary), var(--primary-light, #4a90e2));
          color: white;
          border: none;
          box-shadow: 0 10px 25px rgba(53, 116, 200, 0.4);
          cursor: pointer;
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          transition: transform 0.3s var(--ease), box-shadow 0.3s;
        }

        .ai-fab:hover {
          transform: scale(1.1) rotate(5deg);
          box-shadow: 0 15px 30px rgba(53, 116, 200, 0.5);
        }

        .ai-chat-window {
          position: fixed;
          bottom: 100px;
          right: 30px;
          width: 380px;
          height: 500px;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 20px;
          box-shadow: 0 20px 50px rgba(0,0,0,0.2);
          z-index: 1001;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          opacity: 0;
          transform: translateY(20px) scale(0.95);
          pointer-events: none;
          transition: all 0.3s var(--ease);
          backdrop-filter: blur(15px);
        }

        .ai-chat-window.active {
          opacity: 1;
          transform: translateY(0) scale(1);
          pointer-events: all;
        }

        .ai-chat-header {
          padding: 16px 20px;
          background: rgba(53, 116, 200, 0.05);
          border-bottom: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .ai-chat-header-info {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .ai-chat-dot {
          width: 8px;
          height: 8px;
          background: #4caf50;
          border-radius: 50%;
          box-shadow: 0 0 10px #4caf50;
        }

        .ai-chat-close {
          background: none;
          border: none;
          font-size: 24px;
          color: var(--text-muted);
          cursor: pointer;
        }

        .ai-chat-messages {
          flex: 1;
          padding: 20px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 15px;
          scrollbar-width: thin;
        }

        .message {
          max-width: 85%;
          padding: 12px 16px;
          border-radius: 15px;
          font-size: 0.95rem;
          line-height: 1.5;
          position: relative;
          animation: messageAppear 0.3s var(--ease);
        }

        @keyframes messageAppear {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .message.bot {
          align-self: flex-start;
          background: var(--surface-light, #f0f4f8);
          color: var(--text);
          border-bottom-left-radius: 2px;
          border: 1px solid var(--border);
        }

        .message.user {
          align-self: flex-end;
          background: var(--primary);
          color: white;
          border-bottom-right-radius: 2px;
          text-align: right;
        }

        .ai-chat-input-container {
          padding: 15px;
          border-top: 1px solid var(--border);
          background: rgba(var(--surface-rgb), 0.5);
        }

        .ai-chat-suggestions {
          display: flex;
          gap: 8px;
          margin-bottom: 12px;
          overflow-x: auto;
          padding-bottom: 5px;
          scrollbar-width: none;
        }

        .ai-suggestion-btn {
          white-space: nowrap;
          padding: 6px 12px;
          background: rgba(53, 116, 200, 0.1);
          border: 1px solid rgba(53, 116, 200, 0.2);
          border-radius: 20px;
          font-size: 0.8rem;
          color: var(--primary);
          cursor: pointer;
          transition: all 0.2s;
        }

        .ai-suggestion-btn:hover {
          background: var(--primary);
          color: white;
        }

        .ai-chat-input-wrapper {
          display: flex;
          gap: 10px;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 25px;
          padding: 5px 15px;
          align-items: center;
        }

        .ai-chat-input-wrapper input {
          flex: 1;
          border: none;
          background: none;
          padding: 8px 0;
          color: var(--text);
          outline: none;
          font-family: inherit;
        }

        .ai-send {
          background: none;
          border: none;
          color: var(--primary);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .ai-typing {
          font-size: 0.8rem;
          color: var(--text-muted);
          margin-left: 20px;
          display: none;
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
    
    // Store in history
    this.messages.push({ role, text });
  }

  async handleUserInput() {
    const input = document.getElementById('ai-input');
    const query = input.value.trim();
    if (!query) return;

    // 1. Add user message
    this.addMessage('user', query);
    input.value = '';

    // 2. Show typing
    const typing = document.createElement('div');
    typing.className = 'message bot typing';
    typing.innerText = 'جاري معالجة طلبك...';
    document.getElementById('ai-chat-messages').appendChild(typing);

    // 3. Simple Search Logic
    const response = await this.generateResponse(query);

    // 4. Reveal response after delay
    setTimeout(() => {
      typing.remove();
      this.addMessage('bot', response);
    }, 1000);
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
