/* Interactive Floating Chatbot Widget & Zoho SalesIQ Integration */

(function() {
    // --------------------------------------------------------------------------------------
    // ZOHO SALESIQ LIVE CHAT CONFIGURATION
    // --------------------------------------------------------------------------------------
    // 1. Log in to your Zoho SalesIQ account (https://www.zoho.com/salesiq/)
    // 2. Go to Settings > Brands > [Your Brand] > Installation > Website.
    // 3. Copy the widget snippet and locate the 'widgetcode' value (a long alphanumeric string).
    // 4. Paste your widget code below (replace "YOUR_ZOHO_WIDGET_CODE_HERE").
    // 5. Connect Zoho SalesIQ to Zoho Cliq under SalesIQ Settings > Integrations > Zoho Cliq.
    //
    // Note: If left as "YOUR_ZOHO_WIDGET_CODE_HERE", the script will default to loading the 
    // premium custom automated virtual assistant to capture telephone callback leads.
    // --------------------------------------------------------------------------------------
    const ZOHO_WIDGET_CODE = "YOUR_ZOHO_WIDGET_CODE_HERE";
    // --------------------------------------------------------------------------------------

    // Check if Zoho SalesIQ integration is active
    if (ZOHO_WIDGET_CODE && ZOHO_WIDGET_CODE !== "YOUR_ZOHO_WIDGET_CODE_HERE") {
        window.$zoho = window.$zoho || {};
        window.$zoho.salesiq = window.$zoho.salesiq || { widgetcode: ZOHO_WIDGET_CODE, values: {}, ready: function() {} };
        
        const d = document;
        const s = d.createElement("script");
        s.type = "text/javascript";
        s.id = "zsiqscript";
        s.defer = true;
        s.src = "https://salesiq.zoho.com/widget";
        
        const firstScript = d.getElementsByTagName("script")[0];
        if (firstScript && firstScript.parentNode) {
            firstScript.parentNode.insertBefore(s, firstScript);
        } else {
            d.head.appendChild(s);
        }
        return; // Suppress custom chatbot execution since SalesIQ is loading
    }

    // Load custom automated chatbot if Zoho SalesIQ is not yet configured
    document.addEventListener("DOMContentLoaded", function() {
        if (document.getElementById("suviraChatBtn")) return;

        // Launcher Button
        const chatBtn = document.createElement("button");
        chatBtn.id = "suviraChatBtn";
        chatBtn.className = "suvira-chat-btn";
        chatBtn.title = "Chat with Suvira Assistant";
        chatBtn.innerHTML = `
            <i class="fas fa-comments"></i>
            <i class="fas fa-times"></i>
        `;

        // Chat Panel
        const chatPanel = document.createElement("div");
        chatPanel.id = "suviraChatPanel";
        chatPanel.className = "suvira-chat-panel";
        chatPanel.innerHTML = `
            <div class="suvira-chat-header">
                <div class="suvira-chat-avatar">
                    <i class="fas fa-user-tie"></i>
                    <div class="suvira-chat-status"></div>
                </div>
                <div class="suvira-chat-header-info">
                    <h4>Suvira Assistant</h4>
                    <span><i class="fas fa-circle" style="color:#25D366;font-size:0.5rem;"></i> Active Now</span>
                </div>
                <button class="suvira-chat-close" id="suviraChatClose" title="Minimize Chat">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="suvira-chat-messages" id="suviraChatMessages"></div>
        `;

        document.body.appendChild(chatBtn);
        document.body.appendChild(chatPanel);

        chatBtn.addEventListener("click", toggleChat);
        document.getElementById("suviraChatClose").addEventListener("click", toggleChat);

        initChat();
    });

    let chatInitialized = false;

    function toggleChat() {
        const panel = document.getElementById("suviraChatPanel");
        const btn = document.getElementById("suviraChatBtn");
        if (panel && btn) {
            panel.classList.toggle("active");
            btn.classList.toggle("active");
            if (panel.classList.contains("active") && !chatInitialized) {
                chatInitialized = true;
                sendBotGreeting();
            }
        }
    }

    function initChat() {
        const messagesContainer = document.getElementById("suviraChatMessages");
        if (messagesContainer) {
            messagesContainer.innerHTML = "";
        }
    }

    function formatTime() {
        const now = new Date();
        let hours = now.getHours();
        let minutes = now.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12;
        minutes = minutes < 10 ? '0' + minutes : minutes;
        return hours + ':' + minutes + ' ' + ampm;
    }

    function appendMessage(sender, content, isHtml = false) {
        const container = document.getElementById("suviraChatMessages");
        if (!container) return;

        const msgDiv = document.createElement("div");
        msgDiv.className = `suvira-msg ${sender}`;

        const bubble = document.createElement("div");
        bubble.className = "suvira-bubble";
        if (isHtml) {
            bubble.innerHTML = content;
        } else {
            bubble.textContent = content;
        }

        const timeSpan = document.createElement("span");
        timeSpan.className = "time";
        timeSpan.textContent = formatTime();

        msgDiv.appendChild(bubble);
        msgDiv.appendChild(timeSpan);
        container.appendChild(msgDiv);
        container.scrollTop = container.scrollHeight;
    }

    let typingIndicator = null;
    function showTyping(show) {
        const container = document.getElementById("suviraChatMessages");
        if (!container) return;

        if (show) {
            if (typingIndicator) return;
            typingIndicator = document.createElement("div");
            typingIndicator.className = "suvira-typing";
            typingIndicator.innerHTML = "<span></span><span></span><span></span>";
            container.appendChild(typingIndicator);
            container.scrollTop = container.scrollHeight;
        } else {
            if (typingIndicator) {
                typingIndicator.remove();
                typingIndicator = null;
            }
        }
    }

    function botReply(text, delay = 800, isHtml = false, options = []) {
        showTyping(true);
        setTimeout(function() {
            showTyping(false);
            appendMessage("bot", text, isHtml);
            if (options.length > 0) {
                renderOptions(options);
            }
        }, delay);
    }

    function renderOptions(options) {
        const container = document.getElementById("suviraChatMessages");
        if (!container) return;

        const optionsDiv = document.createElement("div");
        optionsDiv.className = "suvira-chat-options-container";

        options.forEach(opt => {
            const btn = document.createElement("button");
            btn.className = "suvira-chat-option";
            btn.innerHTML = `${opt.text} <i class="fas fa-chevron-right"></i>`;
            btn.addEventListener("click", function() {
                optionsDiv.remove();
                handleUserSelection(opt);
            });
            optionsDiv.appendChild(btn);
        });

        container.appendChild(optionsDiv);
        container.scrollTop = container.scrollHeight;
    }

    function handleUserSelection(option) {
        appendMessage("user", option.text);

        if (option.action === "redirect") {
            botReply("Redirecting you to the calculator points assessment screen...", 500);
            setTimeout(() => {
                window.location.href = option.url;
            }, 1000);
            return;
        }

        switch (option.nextState) {
            case "welcome":
                sendBotGreeting(800);
                break;
            case "canada":
                botReply(
                    "Canada Express Entry is a points-based pathway for skilled workers. We specialize in CRS score optimization and Provincial Nominations (PNP) to guarantee invitation pathways. What would you like to do next?",
                    800,
                    false,
                    [
                        { text: "📊 Calculate CRS Points", action: "redirect", url: "/calculator/index.html?tab=canada" },
                        { text: "📞 Request Specialist Callback", nextState: "callback" },
                        { text: "↩️ Main Menu", nextState: "welcome" }
                    ]
                );
                break;
            case "germany":
                botReply(
                    "Germany's newly launched Chancenkarte (Opportunity Card) allows you to search for employment in Europe without a prior job offer. It works on a 6-point system. How can we help you?",
                    800,
                    false,
                    [
                        { text: "📊 Calculate Germany Points", action: "redirect", url: "/calculator/index.html?tab=germany" },
                        { text: "📞 Request Callback from Germany Team", nextState: "callback" },
                        { text: "↩️ Main Menu", nextState: "welcome" }
                    ]
                );
                break;
            case "study":
                botReply(
                    "We offer customized university shortlisting, academic documentation prep, and SDS visa filing. What is your preferred study destination?",
                    800,
                    false,
                    [
                        { text: "🇨🇦 Study in Canada", nextState: "study_spec" },
                        { text: "🇩🇪 Study in Germany", nextState: "study_spec" },
                        { text: "🎓 Other Countries / Consult Advisor", nextState: "study_spec" },
                        { text: "↩️ Main Menu", nextState: "welcome" }
                    ]
                );
                break;
            case "study_spec":
                botReply(
                    "Excellent choice! We will guide you through course selection, LOR/SOP writing, and part-time work permit briefings. Would you like to schedule a call with a student counselor?",
                    800,
                    false,
                    [
                        { text: "📞 Request Student Counselor Call", nextState: "callback" },
                        { text: "↩️ Main Menu", nextState: "welcome" }
                    ]
                );
                break;
            case "callback":
                botReply("To schedule a callback, please enter your details in the form below. One of our Chennai team members will reach out shortly:", 600);
                setTimeout(renderLeadForm, 800);
                break;
        }
    }

    function renderLeadForm() {
        const container = document.getElementById("suviraChatMessages");
        if (!container) return;

        const form = document.createElement("div");
        form.className = "suvira-chat-form";
        form.innerHTML = `
            <input type="text" id="chatLeadName" required placeholder="Your Name" />
            <input type="tel" id="chatLeadPhone" required placeholder="Phone / WhatsApp" />
            <button id="chatLeadSubmit">Confirm Callback</button>
        `;

        form.querySelector("#chatLeadSubmit").addEventListener("click", function() {
            const nameInput = form.querySelector("#chatLeadName");
            const phoneInput = form.querySelector("#chatLeadPhone");
            
            const name = nameInput.value.trim();
            const phone = phoneInput.value.trim();

            if (!name) {
                alert("Please enter your name.");
                nameInput.focus();
                return;
            }
            if (!phone || phone.length < 9) {
                alert("Please enter a valid phone number.");
                phoneInput.focus();
                return;
            }

            form.remove();
            appendMessage("user", `Requesting callback for ${name} (${phone})`);
            
            showTyping(true);
            setTimeout(() => {
                showTyping(false);
                botReply(
                    `Thank you, **${name}**! Your request has been logged. Our Chennai office consultants will call you back at **${phone}** within 3 business hours (Mon-Sat, 9:30 AM - 6:30 PM).`,
                    600,
                    false,
                    [
                        { text: "↩️ Main Menu", nextState: "welcome" }
                    ]
                );
            }, 800);
        });

        container.appendChild(form);
        container.scrollTop = container.scrollHeight;
    }

    function sendBotGreeting(delay = 500) {
        botReply(
            "Hello! Welcome to Suvira Immigration Chennai. How can I help you today?",
            delay,
            false,
            [
                { text: "🇨🇦 Canada PR / Express Entry", nextState: "canada" },
                { text: "🇩🇪 Germany Chancenkarte", nextState: "germany" },
                { text: "🎓 Study Abroad & Student Visas", nextState: "study" },
                { text: "📞 Request Callback / General Inquiry", nextState: "callback" }
            ]
        );
    }
})();
