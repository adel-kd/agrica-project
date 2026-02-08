import { useState } from "react";
import { apiPost, apiUpload } from "../lib/api";
import { VoiceRecorder } from "../components/VoiceRecorder";

export function AIAgronomist() {
  const [message, setMessage] = useState("");
  const [reply, setReply] = useState("");
  const [loadingChat, setLoadingChat] = useState(false);

  const [imageFile, setImageFile] = useState(null);
  const [imageResult, setImageResult] = useState(null);
  const [loadingImage, setLoadingImage] = useState(false);

  const sendChat = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    setLoadingChat(true);
    setReply("");
    try {
      const res = await apiPost("/ai/chat", { message });
      setReply(res.reply);
    } catch (err) {
      console.error(err);
      setReply("AI agronomist is currently unavailable. Please try again later.");
    } finally {
      setLoadingChat(false);
    }
  };

  const onImageChange = (e) => {
    const file = e.target.files?.[0];
    setImageResult(null);
    if (file) {
      setImageFile(file);
    } else {
      setImageFile(null);
    }
  };

  const analyzeImage = async (e) => {
    e.preventDefault();
    if (!imageFile) return;
    setLoadingImage(true);
    setImageResult(null);
    try {
      const form = new FormData();
      form.append("file", imageFile);
      const res = await apiUpload("/ai/image", form);
      setImageResult(res);
    } catch (err) {
      console.error(err);
      setImageResult({
        diagnosis: "Image analysis failed. Please try a clearer photo or later.",
        health_score: 0,
        issues: [],
        treatment: "",
        prevention: ""
      });
    } finally {
      setLoadingImage(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">AI agronomist</h1>
        <p className="text-sm text-gray-500 max-w-xl">
          Ask questions in simple language, or upload photos of sick crops. The same AI also powers
          the IVR service for farmers without internet.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <section className="space-y-4 rounded-2xl border border-gray-100 bg-white shadow-sm p-4">
          <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            Chat with the agronomist
            <span className="text-[10px] bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full">Voice enabled</span>
          </h2>

          {/* Chat List would go here, for now just input/output single turn */}

          <form onSubmit={sendChat} className="space-y-3">
            <div className="relative">
              <textarea
                rows={3}
                className="w-full rounded-xl bg-white border border-gray-200 px-3 py-2 text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 pr-10"
                placeholder="Describe your crop problem in your own words..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />

            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={loadingChat}
                className="flex-1 inline-flex items-center justify-center rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              >
                {loadingChat ? "Thinking..." : "Ask AI"}
              </button>

              <VoiceRecorder onResponse={(data) => {
                setMessage(data.user_text || message); // Update text box with STT
                setReply(data.reply_text);
                // Audio playback is handled in component or we play it here
                // The VoiceRecorder below handles the playback logic or returns the url
                if (data.audio_url) {
                  const audio = new Audio(window.location.origin.replace(":5173", ":5000") + data.audio_url);
                  audio.play().catch(e => console.error("Audio play failed", e));
                }
              }} />
            </div>
          </form>

          {reply && (
            <div className="mt-3 rounded-xl bg-emerald-50/50 border border-emerald-100 p-3 text-xs text-gray-800 whitespace-pre-wrap">
              {reply}
            </div>
          )}
        </section>

        <section className="space-y-4 rounded-2xl border border-gray-100 bg-white shadow-sm p-4">
          <h2 className="text-sm font-semibold text-gray-900">Photo-based diagnosis</h2>
          <p className="text-[11px] text-gray-500">
            Take a clear photo of the affected leaves or area. Upload the image and AGRICA will try
            to detect diseases, pests, or diseases.
          </p>
          <form onSubmit={analyzeImage} className="space-y-3">
            <input
              type="file"
              accept="image/*"
              onChange={onImageChange}
              className="block w-full text-xs text-gray-600 file:mr-3 file:rounded-full file:border-0 file:bg-emerald-50 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-emerald-700 hover:file:bg-emerald-100"
            />
            <button
              type="submit"
              disabled={!imageFile || loadingImage}
              className="inline-flex items-center justify-center rounded-full bg-gray-100 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-200 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {loadingImage ? "Analyzing…" : "Analyze image"}
            </button>
          </form>

          {imageResult && (
            <div className="mt-3 space-y-2 text-[11px] text-gray-800 rounded-xl bg-gray-50 border border-gray-100 p-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-900">Diagnosis</span>
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] text-emerald-800">
                  Health score: {imageResult.health_score ?? 0}/100
                </span>
              </div>
              <p>{imageResult.diagnosis}</p>
              {Array.isArray(imageResult.issues) && imageResult.issues.length > 0 && (
                <div>
                  <div className="mt-1 font-semibold text-gray-800">Issues</div>
                  <ul className="list-disc list-inside">
                    {imageResult.issues.map((issue, idx) => (
                      <li key={idx}>{issue}</li>
                    ))}
                  </ul>
                </div>
              )}
              {imageResult.treatment && (
                <div>
                  <div className="mt-1 font-semibold text-gray-800">Treatment</div>
                  <p>{imageResult.treatment}</p>
                </div>
              )}
              {imageResult.prevention && (
                <div>
                  <div className="mt-1 font-semibold text-gray-800">Prevention</div>
                  <p>{imageResult.prevention}</p>
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

