import { useState } from "react";
import { apiPost, apiUpload } from "../lib/api";

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
        <h1 className="text-2xl font-semibold text-slate-50">AI agronomist</h1>
        <p className="text-sm text-slate-400 max-w-xl">
          Ask questions in simple language, or upload photos of sick crops. The same AI also powers
          the IVR service for farmers without internet.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <section className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
          <h2 className="text-sm font-semibold text-slate-100">Chat with the agronomist</h2>
          <form onSubmit={sendChat} className="space-y-3">
            <textarea
              rows={3}
              className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              placeholder="Describe your crop problem in your own words..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <button
              type="submit"
              disabled={loadingChat}
              className="inline-flex items-center justify-center rounded-full bg-primary-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-emerald-600/30 hover:bg-primary-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {loadingChat ? "Thinking…" : "Ask AI agronomist"}
            </button>
          </form>
          {reply && (
            <div className="mt-3 rounded-xl bg-slate-950/60 border border-slate-800 p-3 text-xs text-slate-100 whitespace-pre-wrap">
              {reply}
            </div>
          )}
        </section>

        <section className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
          <h2 className="text-sm font-semibold text-slate-100">Photo-based diagnosis</h2>
          <p className="text-[11px] text-slate-400">
            Take a clear photo of the affected leaves or area. Upload the image and AGRICA will try
            to detect diseases, pests, or deficiencies.
          </p>
          <form onSubmit={analyzeImage} className="space-y-3">
            <input
              type="file"
              accept="image/*"
              onChange={onImageChange}
              className="block w-full text-xs text-slate-200 file:mr-3 file:rounded-full file:border-0 file:bg-slate-800 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-slate-100 hover:file:bg-slate-700"
            />
            <button
              type="submit"
              disabled={!imageFile || loadingImage}
              className="inline-flex items-center justify-center rounded-full bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-100 hover:bg-slate-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {loadingImage ? "Analyzing…" : "Analyze image"}
            </button>
          </form>

          {imageResult && (
            <div className="mt-3 space-y-2 text-[11px] text-slate-100 rounded-xl bg-slate-950/60 border border-slate-800 p-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-200">Diagnosis</span>
                <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] text-slate-200">
                  Health score: {imageResult.health_score ?? 0}/100
                </span>
              </div>
              <p>{imageResult.diagnosis}</p>
              {Array.isArray(imageResult.issues) && imageResult.issues.length > 0 && (
                <div>
                  <div className="mt-1 font-semibold text-slate-200">Issues</div>
                  <ul className="list-disc list-inside">
                    {imageResult.issues.map((issue, idx) => (
                      <li key={idx}>{issue}</li>
                    ))}
                  </ul>
                </div>
              )}
              {imageResult.treatment && (
                <div>
                  <div className="mt-1 font-semibold text-slate-200">Treatment</div>
                  <p>{imageResult.treatment}</p>
                </div>
              )}
              {imageResult.prevention && (
                <div>
                  <div className="mt-1 font-semibold text-slate-200">Prevention</div>
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

