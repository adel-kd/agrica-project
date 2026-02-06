import { Link } from "react-router-dom";

export function Landing() {
  return (
    <div className="py-6 md:py-12 space-y-10">
      <section className="grid gap-8 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] items-center">
        <div className="space-y-6">
          <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300 border border-emerald-500/30">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Built for African farmers
          </span>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-slate-50 leading-tight">
            AI agronomist &amp; fair marketplace
            <span className="block text-primary-400">from button phones to the web.</span>
          </h1>
          <p className="text-sm md:text-base text-slate-300 max-w-xl">
            AGRICA connects farmers and buyers directly. Farmers without internet use IVR. Connected
            farmers and buyers use this web app. Gemini AI provides agronomy advice and verifies
            crop quality.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/market"
              className="inline-flex items-center justify-center rounded-full bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/30 hover:bg-primary-700 transition-colors"
            >
              Browse crops
            </Link>
            <Link
              to="/ai"
              className="inline-flex items-center justify-center rounded-full border border-slate-700 bg-slate-900/60 px-5 py-2.5 text-sm font-semibold text-slate-100 hover:border-slate-500 transition-colors"
            >
              Ask the AI agronomist
            </Link>
          </div>
          <div className="flex flex-wrap gap-4 text-[11px] text-slate-400">
            <div>
              <div className="font-semibold text-slate-200">Offline farmers</div>
              <div>Call the shortcode · IVR in Amharic &amp; Swahili-ready</div>
            </div>
            <div>
              <div className="font-semibold text-slate-200">Online farmers &amp; buyers</div>
              <div>Modern web app · mobile-first · AI-powered trust</div>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-4 space-y-4">
          <div className="rounded-2xl bg-slate-950/60 border border-slate-800 p-4 space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>IVR flow · farmer with button phone</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-200">
                No internet
              </span>
            </div>
            <div className="space-y-2 text-xs bg-slate-900/70 rounded-xl p-3">
              <div className="text-emerald-300">Farmer: እባክህ ድንች በተበላሸ ቅጠል ላይ ምን እርዳታ አለ?</div>
              <div className="text-slate-300">
                AGRICA AI: የቅጠሉ ቀለም እና ነጭ ሐምራዊ ነጥቦች ካሉ፣ ምናልባት ፈንገስ በሽታ ነው። ዛሬ ማለዳ ብርሃን ላይ ፎቶ እውሰዱና በዌብ ያስገቡ።
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-slate-950/60 border border-slate-800 p-4 space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Marketplace · buyer on web</span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <div className="font-semibold text-slate-50">Teff</div>
                    <div className="text-slate-400 text-[11px]">20 quintal · Debre Birhan</div>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-300 border border-emerald-500/30">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    Gemini verified
                  </span>
                </div>
                <div className="mt-2 text-[11px] text-slate-300">28,000 ETB · direct from farmer</div>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3">
                <div className="font-semibold text-slate-50">Maize</div>
                <div className="text-slate-400 text-[11px]">Unverified IVR listing</div>
                <div className="mt-2 text-[11px] text-slate-300">Filter by verified to reduce risk.</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

