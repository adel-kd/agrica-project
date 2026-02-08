# Agrica IVR Demo - Quick Start README

## 🎯 What is This?

This is an **interactive demo** of the Agrica AI-Powered IVR System - a voice interface that allows Ethiopian farmers to get agricultural advice by phone in Amharic.

## 🚀 How to Run the Demo

### Method 1: Double-click to Open (Easiest)
1. Open the `demo` folder
2. Double-click `index.html`
3. It will open in your default browser
4. Click "Start Call" to begin!

### Method 2: Run with HTTP Server (Recommended for Presentation)
```bash
cd /home/adel/Desktop/addew/agrica/agrica-project/demo
python3 -m http.server 8080
```
Then open: **http://localhost:8080**

## 📱 How to Use the Demo

1. **Click "Start Call"** - Simulates a farmer calling the system
2. **Click "Speak (Amharic)"** - Simulates the farmer asking a question
3. Watch the conversation unfold with:
   - Amharic text (what the farmer says)
   - English translation (for judges who don't speak Amharic)
   - AI responses in Amharic
   - Real-time system logs showing the technical process
4. **Click "End Call"** when done

## 📂 Files Included

- **index.html** - Main demo interface
- **styles.css** - Beautiful, modern styling
- **demo.js** - Interactive functionality
- **PRESENTATION_GUIDE.md** - How to present to judges
- **TECHNICAL_DOCS.md** - Technical architecture details
- **README.md** - This file

## 🎤 For Judges

This demo shows:
- ✅ **Working concept** - Interactive simulation of the IVR flow
- ✅ **Technical feasibility** - We have real backend code (in `/backend`)
- ✅ **Amharic support** - All conversations in native language
- ✅ **AI intelligence** - Smart responses, not scripted menus
- ✅ **Professional UI** - Production-ready design

## 🔧 Technical Stack

- **Frontend**: HTML, CSS, JavaScript (this demo)
- **Backend**: Node.js + Express (in `/backend` folder)
- **AI**: Google Gemini 2.0
- **Speech**: Hasab STT/TTS (Amharic specialist)
- **Telephony**: Infobip

## 📖 Learn More

- Read **PRESENTATION_GUIDE.md** for presentation tips
- Read **TECHNICAL_DOCS.md** for architecture details
- Check `/backend` folder for actual working code

## 💡 Key Selling Points

1. **Accessible** - Works on any phone, no smartphone needed
2. **Natural** - AI conversation, not button menus
3. **Local** - Amharic language, culturally relevant
4. **Scalable** - Cloud infrastructure
5. **Proven** - Working code, not just slides

---

**Ready to impress the judges? Open `index.html` and click "Start Call"!** 🚀
