import { useState, useRef } from "react";
import { apiUpload } from "../lib/api";

export function VoiceRecorder({ onResponse }) {
    const [isRecording, setIsRecording] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const mediaRecorderRef = useRef(null);
    const chunksRef = useRef([]);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(chunksRef.current, { type: mediaRecorder.mimeType || "audio/webm" });
                await uploadAudio(audioBlob);
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
        } catch (err) {
            console.error("Error accessing microphone:", err);
            alert("Could not access microphone. Please check permissions.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    const uploadAudio = async (blob) => {
        setIsUploading(true);
        try {
            const formData = new FormData();
            const extension = blob.type.includes("webm") ? "webm" : "wav";
            formData.append("audio", blob, `recording.${extension}`);
            console.log(`📡 [VoiceRecorder] Uploading ${blob.size} bytes (${blob.type})...`);
            const data = await apiUpload("/ai/voice", formData);
            console.log("📥 [VoiceRecorder] Response received:", data);
            onResponse(data);
        } catch (err) {
            console.error("❌ [VoiceRecorder] Upload failed:", err);
            alert(`Voice transcription failed: ${err.message}`);
        } finally {
            setIsUploading(false);
        }
    };

    const toggleRecording = () => {
        if (isRecording) {
            stopRecording();
        } else {
            startRecording();
        }
    };

    return (
        <button
            onClick={(e) => {
                e.preventDefault();
                toggleRecording();
            }}
            disabled={isUploading}
            className={`inline-flex items-center justify-center rounded-full px-4 py-2 text-xs font-semibold transition-colors ${isRecording
                ? "bg-red-600 text-white animate-pulse"
                : "bg-slate-800 text-slate-100 hover:bg-slate-700 disabled:opacity-50"
                }`}
        >
            {isUploading ? (
                <>
                    <span className="w-2 h-2 mr-2 bg-white rounded-full animate-ping"></span>
                    Processing...
                </>
            ) : isRecording ? (
                "🔴 Stop Recording"
            ) : (
                "🎤 Record Voice"
            )}
        </button>
    );
}
