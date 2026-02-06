// Demo State
let callActive = false;
let conversationHistory = [];

// Sample conversation scenarios in Amharic
const adviceScenario = [
    {
        user: "ጤና ይስጥልኝ፣ ስለ ሰብል ጥበቃ ጥያቄ ነበረኝ።",
        userTranslation: "(Hello, I have a question about crop protection.)",
        ai: "ጤና ይስጥልኝ! እንኳን ደህና መጡ። ስለ ሰብል ጥበቃ እንዴት ልረዳዎት እችላለሁ?",
        aiTranslation: "(Hello! Welcome. How can I help you with crop protection?)"
    },
    {
        user: "የስንዴ ሰብሌ ላይ ነፍሳት አሉ። ምን ማድረግ አለብኝ?",
        userTranslation: "(There are insects on my wheat crop. What should I do?)",
        ai: "የስንዴ ሰብልዎ ላይ ነፍሳት ካሉ፣ መጀመሪያ የነፍሳቱን አይነት መለየት ያስፈልጋል። ብዙውን ጊዜ ኦርጋኒክ ፀረ-ተባይ መድሃኒቶችን መጠቀም ይችላሉ። የአካባቢዎን የግብርና ባለሙያ ማማከር ይመከራል።",
        aiTranslation: "(If there are insects on your wheat crop, you first need to identify the type of insects. You can usually use organic pesticides. It is recommended to consult your local agricultural expert.)"
    },
    {
        user: "የዝናብ መጠን ምን ያህል ነው የሚያስፈልገው?",
        userTranslation: "(How much rainfall is needed?)",
        ai: "የስንዴ ሰብል በአመት ከ450-650 ሚሊሜትር ዝናብ ይፈልጋል። በደረቅ ወቅት ተጨማሪ መስኖ ያስፈልጋል። የአፈር እርጥበት በየጊዜው መከታተል አስፈላጊ ነው።",
        aiTranslation: "(Wheat crops need 450-650mm of rainfall per year. Additional irrigation is needed during dry seasons. Regular soil moisture monitoring is important.)"
    }
];

const sellCropScenario = [
    {
        user: "ምርት መሸጥ እፈልጋለው።",
        userTranslation: "(I want to sell crops.)",
        ai: "በጣም ጥሩ። ምን ዓይነት ሰብል ለመሸጥ ትፈልጋላችሁ? ለምሳሌ ጤፍ ወይም ስንዴ።",
        aiTranslation: "(Great. What kind of crop do you want to sell? For example, Teff or Wheat.)"
    },
    {
        user: "ጤፍ መሸጥ እፈልጋለሁ።",
        userTranslation: "(I want to sell Teff.)",
        ai: "መጠኑ ስንት ነው? ቁጥር ብቻ ይናገሩ።",
        aiTranslation: "(What is the quantity? Please say only the number.)"
    },
    {
        user: "ሃምሳ።",
        userTranslation: "(Fifty.)",
        ai: "የመጠኑ መለኪያ ምንድነው? ኪሎ ወይም ቂንጣር ይናገሩ።",
        aiTranslation: "(What is the unit of measurement? Say Kilo or Quintal.)"
    },
    {
        user: "ቂንጣር።",
        userTranslation: "(Quintal.)",
        ai: "ተፈላጊ ዋጋ ስንት ነው? ቁጥር ብቻ ይናገሩ።",
        aiTranslation: "(What is your expected price? Please say only the number.)"
    },
    {
        user: "አምስት ሺህ።",
        userTranslation: "(Five thousand.)",
        ai: "ምርቱ የሚገኝበት ቦታ ይናገሩ።",
        aiTranslation: "(Where is the product located?)"
    },
    {
        user: "ባህር ዳር።",
        userTranslation: "(Bahir Dar.)",
        ai: "የመከር ቀን መቼ ነው? ቀን ወይም ወር በቃል ይናገሩ።",
        aiTranslation: "(When is the harvest date? Name the day or month.)"
    },
    {
        user: "በጥቅምት።",
        userTranslation: "(In October.)",
        ai: "ምርትዎ ተመዝግቧል። እናመሰግናለን።",
        aiTranslation: "(Your crop has been registered. Thank you.)"
    }
];

let demoScenarios = adviceScenario;

let currentScenarioIndex = 0;

// Initialize
function init() {
    addLog('System initialized and ready', 'info');
}

// Start Call
function startCall() {
    callActive = true;
    currentScenarioIndex = 0;
    conversationHistory = [];

    // Update UI
    document.getElementById('startCallBtn').disabled = true;
    document.getElementById('speakBtn').disabled = false;
    document.getElementById('endCallBtn').disabled = false;

    document.getElementById('callStatus').innerHTML = `
        <div class="status-icon">📞</div>
        <div class="status-text">Call Connected</div>
    `;

    // Clear conversation display
    const conversationDisplay = document.getElementById('conversationDisplay');
    conversationDisplay.innerHTML = '';

    // Add system message
    addMessage('system', 'Call connected. IVR system ready.');

    addLog('Incoming call received from +251912345678', 'info');
    addLog('Call connected successfully', 'success');
    addLog('Waiting for user input...', 'info');

    // Play greeting after short delay
    setTimeout(() => {
        playGreeting();
    }, 1000);
}

// Play Greeting
function playGreeting() {
    const greeting = "እንኳን ደህና መጡ ወደ አግሪካ። እኔ የእርስዎ AI ረዳት ነኝ። እንዴት ልረዳዎት እችላለሁ?";
    const translation = "(Welcome to Agrica. I am your AI assistant. How can I help you?)";

    addMessage('ai', greeting, translation);
    addLog('TTS: Generating Amharic speech...', 'info');

    // Simulate audio playback
    playAudioAnimation(2000);

    setTimeout(() => {
        addLog('TTS: Audio played successfully', 'success');
    }, 2000);
}

// Simulate User Speech
function simulateUserSpeech() {
    if (!callActive || currentScenarioIndex >= demoScenarios.length) {
        if (currentScenarioIndex >= demoScenarios.length) {
            addMessage('system', 'Demo scenario completed. You can end the call or continue with custom questions.');
        }
        return;
    }

    const scenario = demoScenarios[currentScenarioIndex];

    // Disable speak button temporarily
    document.getElementById('speakBtn').disabled = true;

    addLog('User speaking...', 'info');
    playAudioAnimation(1500);

    setTimeout(() => {
        // User message
        addMessage('user', scenario.user, scenario.userTranslation);
        addLog('STT: Processing Amharic audio...', 'info');

        setTimeout(() => {
            addLog(`STT: Transcribed: "${scenario.user}"`, 'success');
            addLog('AI: Sending to Gemini for processing...', 'info');

            setTimeout(() => {
                // AI response
                addMessage('ai', scenario.ai, scenario.aiTranslation);
                addLog(`AI: Response generated`, 'success');
                addLog('TTS: Converting to speech...', 'info');

                playAudioAnimation(2500);

                setTimeout(() => {
                    addLog('TTS: Audio played successfully', 'success');
                    addLog('Waiting for user input...', 'info');

                    currentScenarioIndex++;
                    document.getElementById('speakBtn').disabled = false;
                }, 2500);
            }, 1000);
        }, 1000);
    }, 1500);
}

// End Call
function endCall() {
    callActive = false;

    document.getElementById('startCallBtn').disabled = false;
    document.getElementById('speakBtn').disabled = true;
    document.getElementById('endCallBtn').disabled = true;

    document.getElementById('callStatus').innerHTML = `
        <div class="status-icon">📞</div>
        <div class="status-text">Call Ended</div>
    `;

    addMessage('system', 'Call ended. Thank you for using Agrica IVR.');
    addLog('Call ended by user', 'warning');
    addLog('Session duration: ' + Math.floor(Math.random() * 180 + 60) + ' seconds', 'info');

    stopAudioAnimation();
}

// Add Message to Conversation
function addMessage(type, text, translation = '') {
    const conversationDisplay = document.getElementById('conversationDisplay');

    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;

    if (type === 'system') {
        messageDiv.innerHTML = `<div class="message-text">${text}</div>`;
    } else {
        const label = type === 'user' ? 'Farmer' : 'AI Assistant';
        messageDiv.innerHTML = `
            <div class="message-label">${label}</div>
            <div class="message-text">${text}</div>
            ${translation ? `<div class="message-text" style="opacity: 0.7; font-size: 0.85rem; margin-top: 5px;">${translation}</div>` : ''}
        `;
    }

    conversationDisplay.appendChild(messageDiv);
    conversationDisplay.scrollTop = conversationDisplay.scrollHeight;
}

// Add Log Entry
function addLog(message, type = 'info') {
    const logsContainer = document.getElementById('logsContainer');

    const logEntry = document.createElement('div');
    logEntry.className = `log-entry ${type}`;

    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', { hour12: false });

    logEntry.innerHTML = `
        <span class="log-time">${timeString}</span>
        <span class="log-message">${message}</span>
    `;

    logsContainer.appendChild(logEntry);
    logsContainer.scrollTop = logsContainer.scrollHeight;
}

// Audio Animation
function playAudioAnimation(duration) {
    const visualizer = document.getElementById('audioVisualizer');
    visualizer.classList.add('active');

    if (duration) {
        setTimeout(() => {
            visualizer.classList.remove('active');
        }, duration);
    }
}

function stopAudioAnimation() {
    const visualizer = document.getElementById('audioVisualizer');
    visualizer.classList.remove('active');
}

// Initialize on load
function changeScenario() {
    const selector = document.getElementById('scenarioSelect');
    const selected = selector.value;

    if (selected === 'sell') {
        demoScenarios = sellCropScenario;
    } else {
        demoScenarios = adviceScenario;
    }

    if (callActive) {
        endCall();
    }

    addLog(`Scenario changed to: ${selected === 'sell' ? 'Sell Crop' : 'Agricultural Advice'}`, 'info');
}

window.addEventListener('DOMContentLoaded', init);
