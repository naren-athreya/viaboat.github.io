document.addEventListener('DOMContentLoaded', () => {
    // Navbar Scroll Effect
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Fade In Animation Observer
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));


    // --- GEMINI AI INTEGRATION ---

    let GEMINI_API_KEY = localStorage.getItem('GEMINI_API_KEY');

    function checkApiKey() {
        if (!GEMINI_API_KEY) {
            const key = prompt("Please enter your Google Gemini API Key to enable Kashi Mitra & The Planner:", "");
            if (key) {
                GEMINI_API_KEY = key;
                localStorage.setItem('GEMINI_API_KEY', key);
                addMessage("API Key saved. Kashi Mitra is awakening...", 'ai');
            } else {
                addMessage("I need an API key to function. Please reload and provide one.", 'ai');
            }
        }
    }

    // Call Gemini API
    async function callGemini(prompt, isChat = true) {
        if (!GEMINI_API_KEY) {
            checkApiKey();
            if (!GEMINI_API_KEY) return "Error: API Key missing.";
        }

        const systemPrompt = isChat
            ? "You are Kashi Mitra, a 2000-year-old wise spirit and guide of Varanasi. You are poetic, spiritual, warm, and deeply knowledgeable about the city's history, rituals (Aarti), food, and temples. Keep answers concise (under 3 sentences) unless asked for detail. Always guide the user towards spiritual peace."
            : "You are an expert travel planner for Varanasi. Create a detailed day-by-day itinerary based on the user's constraints. Format the response with HTML tags like <h3>Day 1</h3>, <ul>, <li> for readability. Do not use Markdown, use raw HTML. Do not include ```html blocks.";

        const fullPrompt = `${systemPrompt}\n\nUser: ${prompt}\nOutput:`;

        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: fullPrompt }] }]
                })
            });

            const data = await response.json();
            if (data.error) {
                throw new Error(data.error.message);
            }
            return data.candidates[0].content.parts[0].text;
        } catch (error) {
            console.error("Gemini Error:", error);
            return "I apologize, my connection to the cosmos is weak right now. (Error: " + error.message + ")";
        }
    }

    // --- CHATBOT LOGIC ---

    // Kashi Mitra AI Agent Logic
    const aiAvatar = document.querySelector('.ai-avatar');
    const chatWindow = document.querySelector('.chat-window');
    const chatInput = document.querySelector('.chat-input-area input');
    const sendBtn = document.querySelector('.chat-input-area button');
    const messagesContainer = document.querySelector('.chat-messages');

    if (aiAvatar) {
        aiAvatar.addEventListener('click', () => {
            chatWindow.classList.toggle('active');
            if (chatWindow.classList.contains('active')) {
                if (messagesContainer.children.length === 0) {
                    addMessage("Namaste. I am Kashi Mitra. Ask me anything.", 'ai');
                }
                checkApiKey();
            }
        });
    }

    function addMessage(text, sender) {
        const div = document.createElement('div');
        div.classList.add('message', sender);
        // Allow HTML for Planner but text for Chat usually
        div.innerHTML = text;
        messagesContainer.appendChild(div);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    async function handleUserMessage() {
        const text = chatInput.value.trim();
        if (!text) return;

        addMessage(text, 'user');
        chatInput.value = '';

        // Simulate AI Thinking
        const loadingDiv = document.createElement('div');
        loadingDiv.classList.add('message', 'ai');
        loadingDiv.textContent = 'Consulting the stars...';
        messagesContainer.appendChild(loadingDiv);

        const response = await callGemini(text, true);

        messagesContainer.removeChild(loadingDiv);
        addMessage(response, 'ai');
    }

    if (sendBtn) sendBtn.addEventListener('click', handleUserMessage);
    if (chatInput) chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleUserMessage();
    });

    // --- PLANNER LOGIC ---

    const plannerBtn = document.querySelector('#planner-btn');
    if (plannerBtn) {
        plannerBtn.addEventListener('click', async () => {
            checkApiKey();
            if (!GEMINI_API_KEY) return;

            const days = document.querySelector('#days').value;
            const budget = document.querySelector('#budget').value;
            const interests = document.querySelector('#interests').value;

            if (!days || !budget) {
                alert("Please fill in Days and Budget.");
                return;
            }

            const prompt = `Plan a ${days}-day trip to Varanasi with a budget of ₹${budget}. Interests: ${interests}. Include food, temples, and ghats.`;

            // Show loading in a result area
            const resultArea = document.querySelector('#planner-result');
            resultArea.innerHTML = '<div class="fade-in">Consulting the AI Guide...</div>';
            resultArea.style.display = 'block';

            const plan = await callGemini(prompt, false);
            resultArea.innerHTML = `<div class="fade-in">${plan}</div>`;
        });
    }
});
