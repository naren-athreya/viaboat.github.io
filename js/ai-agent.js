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
            console.log("No API Key found. Running in Simulation Mode.");
            // We no longer prompt. We just let it fall back to simulation.
        }
    }

    // Simulated Responses for "Offline" Mode
    function getSimulatedResponse(prompt, isChat) {
        if (!isChat) {
            // Simulated Planner Response
            return `
                <h3>Varanasi Spiritual Journey (Simulated Plan)</h3>
                <p><strong>Note:</strong> This is a sample itinerary. Add an API Key for a custom plan.</p>
                
                <h4>Day 1: The Divine Beginning</h4>
                <ul>
                    <li><strong>Morning:</strong> Boat ride at Assi Ghat for sunrise aarti. Breakfast at Kashi chat bhandar.</li>
                    <li><strong>Afternoon:</strong> Visit Kashi Vishwanath Temple and Annapurna Devi.</li>
                    <li><strong>Evening:</strong> Witness the grand Ganga Aarti at Dashashwamedh Ghat.</li>
                </ul>

                <h4>Day 2: Culture & Heritage</h4>
                <ul>
                    <li><strong>Morning:</strong> Trip to Sarnath (Dhamek Stupa).</li>
                    <li><strong>Afternoon:</strong> Explore Banaras Hindu University (BHU) and Bharat Kala Bhavan.</li>
                    <li><strong>Evening:</strong> Silent meditation loop on a boat near Manikarnika.</li>
                </ul>
            `;
        }

        // Simulated Chatbot Logic
        const p = prompt.toLowerCase();

        if (p.includes("food") || p.includes("eat") || p.includes("kachori") || p.includes("chat")) {
            return "Ah, the taste of Kashi! You must try the <strong>Kachori Sabzi</strong> at Ram Bhandar for breakfast, and the <strong>Tamatar Chaat</strong> at Deena Chaat Bhandar in the evening. And do not forget the <strong>Blue Lassi</strong> near Manikarnika!";
        }

        if (p.includes("ghat") || p.includes("river") || p.includes("boat")) {
            return "The Ghats are the soul of Varanasi. <strong>Dashashwamedh Ghat</strong> is for the vibrant Aarti, while <strong>Assi Ghat</strong> offers a peaceful sunrise. For the ultimate truth of life, witness the fires of <strong>Manikarnika</strong>.";
        }

        if (p.includes("temple") || p.includes("god") || p.includes("shiva")) {
            return "Kashi is the city of Shiva. The <strong>Kashi Vishwanath Corridor</strong> is magnificent. Also visit the <strong>Sankat Mochan Hanuman Temple</strong> for peace, and the <strong>Durga Kund</strong> for power.";
        }

        if (p.includes("hello") || p.includes("hi") || p.includes("namaste")) {
            return "Namaste! I am Kashi Mitra. I can guide you through the ancient alleys, tell you where to eat, and help you find peace. What do you seek?";
        }

        return "I am listening. My connection to the cosmic knowledge is currently limited (Simulated Mode), but I can tell you about the <strong>Ghats</strong>, <strong>Food</strong>, and <strong>Temples</strong> of Varanasi. What would you like to know?";
    }

    // Call Gemini API (with Fallback)
    async function callGemini(prompt, isChat = true) {
        if (!GEMINI_API_KEY) {
            // Fallback to Simulation
            await new Promise(r => setTimeout(r, 1000)); // Fake network delay
            return getSimulatedResponse(prompt, isChat);
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
                // If the key is invalid, fallback might be nice, but usually we just show the error.
                // Or we can automatically fallback? Let's just throw for now.
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
