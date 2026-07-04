import React, { useEffect, useMemo, useState } from "react";
import { apiGet, apiPost, apiUpload } from "../lib/api";

const getCurrentUserId = () => {
  const rawUser = localStorage.getItem("user");
  if (rawUser) {
    try {
      const user = JSON.parse(rawUser);
      if (user?.id || user?._id) return user.id || user._id;
    } catch {
      localStorage.removeItem("user");
    }
  }

  const stored = localStorage.getItem("agricaChatUserId");
  if (stored) return stored;

  const guestId = `guest-${Date.now()}`;
  localStorage.setItem("agricaChatUserId", guestId);
  return guestId;
};

const AIAgronomist = () => {
  const userId = useMemo(getCurrentUserId, []);
  const [messages, setMessages] = useState([]);
  const [prompt, setPrompt] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState("");

  useEffect(() => {
    let active = true;

    const loadHistory = async () => {
      try {
        // Fetches conversation context from your Gemini backend on component mount
        const data = await apiGet(`/ai/history/${encodeURIComponent(userId)}`);
        if (active) setMessages(data.messages || []);
      } catch (err) {
        console.error("Failed to load chat history:", err);
      }
    };

    loadHistory();
    return () => {
      active = false;
    };
  }, [userId]);

  useEffect(() => {
    if (!imageFile) {
      setImagePreview("");
      return undefined;
    }

    const url = URL.createObjectURL(imageFile);
    setImagePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  const handleSend = async (event) => {
    event.preventDefault();
    const cleanPrompt = prompt.trim();
    if (!cleanPrompt || chatLoading) return;

    setChatLoading(true);
    setChatError("");
    setPrompt("");
    
    // Optimistically update the UI with user message
    setMessages((prev) => [...prev, { role: "user", content: cleanPrompt }]);

    try {
      // Sends payload matching the Express controller: { userId, prompt }
      const data = await apiPost("/ai/chat", { userId, prompt: cleanPrompt });
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
    } catch (err) {
      console.error("Chat error:", err);
      setChatError("AI chat is unavailable right now. Please try again.");
      // Rollback optimistic update on failure
      setMessages((prev) => prev.slice(0, -1));
      setPrompt(cleanPrompt);
    } finally {
      setChatLoading(false);
    }
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0] || null;
    setImageFile(file);
    setAnalysis(null);
    setAnalysisError("");
  };

  // --- Inside your AIAgronomist.jsx file ---
const handleAnalyze = async (event) => {
  event.preventDefault();
  if (!imageFile || analysisLoading) return;

  setAnalysisLoading(true);
  setAnalysisError("");

  try {
    const form = new FormData();
    // Change "file" to "cropImage" to match our updated backend key
    form.append("cropImage", imageFile); 
    
    // FIX: Changed from "/v1/verify-crop" to "/ai/verify-crop" to align with your API setup
    const data = await apiUpload("/ai/verify-crop", form); 
    
    setAnalysis({
      diagnosis: data.response_text,
      healthScore: data.healthScore ?? 0
    });
  } catch (err) {
    console.error("Analysis error:", err);
    setAnalysisError("Image analysis failed. Upload a clear crop photo and try again.");
  } finally {
    setAnalysisLoading(false);
  }
};

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Crop Assistant</h1>
        <p className="mt-1 max-w-xl text-sm text-gray-500">
          Ask crop questions by text, or upload a crop photo for a health rating.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(320px,2fr)]">
        {/* Text Chat Section */}
        <section className="space-y-4 rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold text-gray-900">Text Chat</h2>
          </div>

          <div className="flex min-h-[360px] max-h-[460px] flex-col gap-3 overflow-y-auto rounded-lg border border-gray-100 bg-slate-50 p-3">
            {messages.length === 0 ? (
              <div className="flex h-full items-center justify-center text-center text-xs text-gray-500">
                Start with a crop question or describe a harvest listing you want to publish.
              </div>
            ) : (
              messages.map((message, index) => (
                <div
                  key={`${message.role}-${index}`}
                  className={`max-w-[84%] whitespace-pre-wrap rounded-lg px-3 py-2 text-sm leading-relaxed ${
                    message.role === "user"
                      ? "ml-auto bg-emerald-600 text-white"
                      : "mr-auto border border-gray-200 bg-white text-gray-800"
                  }`}
                >
                  {message.content}
                </div>
              ))
            )}
            {chatLoading && (
              <div className="mr-auto rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-500">
                Thinking...
              </div>
            )}
          </div>

          <form onSubmit={handleSend} className="space-y-3">
            <textarea
              rows={3}
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              placeholder="Describe your crop issue or listing details..."
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={chatLoading || !prompt.trim()}
                className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {chatLoading ? "Sending..." : "Send"}
              </button>
              {chatError && <p className="text-xs text-red-600">{chatError}</p>}
            </div>
          </form>
        </section>

        {/* Picture Analysis Section */}
        <section className="space-y-4 rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-900">Picture Analysis</h2>

          <form onSubmit={handleAnalyze} className="space-y-4">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="block w-full text-xs text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-emerald-50 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-emerald-700 hover:file:bg-emerald-100"
            />

            {imagePreview && (
              <img
                src={imagePreview}
                alt="Selected crop"
                className="h-56 w-full rounded-lg border border-gray-200 object-cover"
              />
            )}

            <button
              type="submit"
              disabled={!imageFile || analysisLoading}
              className="w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {analysisLoading ? "Analyzing..." : "Analyze Image"}
            </button>
          </form>

          {analysisError && <p className="text-xs text-red-600">{analysisError}</p>}

          {analysis && (
            <div className="space-y-3 rounded-lg border border-gray-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-semibold uppercase text-gray-700">Health Rating</span>
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-800">
                  {analysis.healthScore}/100
                </span>
              </div>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700">{analysis.diagnosis}</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default AIAgronomist;