import { Link } from "react-router-dom";

export function Landing() {
  return (
    <div className="relative overflow-hidden py-10 sm:py-12 md:py-20">
      {/* Background blobs (unchanged, just safe on mobile) */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <svg
          className="absolute -left-32 top-0 w-[420px] sm:w-[520px] opacity-30"
          viewBox="0 0 600 600"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g filter="url(#blur)">
            <circle cx="300" cy="300" r="200" fill="url(#g1)" />
          </g>
          <defs>
            <linearGradient id="g1" x1="0" x2="1">
              <stop offset="0%" stopColor="#10B981" />
              <stop offset="100%" stopColor="#10B981" />
            </linearGradient>
            <filter id="blur">
              <feGaussianBlur stdDeviation="60" />
            </filter>
          </defs>
        </svg>

        <svg
          className="absolute right-0 bottom-0 w-[320px] sm:w-[420px] opacity-25"
          viewBox="0 0 600 600"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g filter="url(#bblur)">
            <rect
              x="100"
              y="100"
              width="400"
              height="400"
              rx="120"
              fill="url(#g2)"
            />
          </g>
          <defs>
            <linearGradient id="g2" x1="0" x2="1">
              <stop offset="0%" stopColor="#10B981" />
              <stop offset="100%" stopColor="#10B981" />
            </linearGradient>
            <filter id="bblur">
              <feGaussianBlur stdDeviation="50" />
            </filter>
          </defs>
        </svg>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* GRID FIX */}
        <section className="grid grid-cols-1 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] gap-8 md:gap-10 items-start md:items-center">
          
          {/* LEFT */}
          <div className="space-y-5 sm:space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#ECFDF5]/80 px-3 py-1 text-xs font-semibold text-[#10B981] border border-[#D1FAE5] backdrop-blur-sm">
              Built for African farmers
            </span>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight">
              Crop support & fair marketplace
              <span className="block text-[#10B981]">
                for farmers and buyers.
              </span>
            </h1>

            <p className="text-sm md:text-base text-gray-600 max-w-xl">
              AGRICA connects farmers and buyers directly. Farmers list crops with
              photos, buyers compare trusted offers, and crop quality checks help
              reduce risk.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link
                to="/market"
                className="inline-flex items-center justify-center rounded-full bg-[#10B981] px-5 sm:px-6 py-3 text-sm font-semibold text-white shadow-lg transform transition-all hover:scale-[1.03]"
              >
                Browse crops
              </Link>

              <Link
                to="/ai"
                className="inline-flex items-center justify-center rounded-full border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-800 hover:bg-gray-50"
              >
                Ask crop questions
              </Link>
            </div>

            {/* TEXT BLOCKS FIX */}
            <div className="flex flex-col sm:flex-row flex-wrap gap-5 sm:gap-6 text-[13px] text-gray-500">
              <div className="flex items-start gap-3">
                <div>
                  <div className="font-semibold text-gray-800">Farmers</div>
                  <div className="text-gray-500">
                    List crops, upload photos, and reach buyers
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div>
                  <div className="font-semibold text-gray-800">
                    Online farmers &amp; buyers
                  </div>
                  <div className="text-gray-500">
                    Browse offers, compare quality, and contact farmers
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT PANEL */}
          <div className="rounded-3xl border border-gray-100 bg-white/60 backdrop-blur-sm shadow-2xl p-4 sm:p-5 space-y-4">

            {/* CARD 1 */}
            <div className="rounded-2xl bg-white shadow-md p-4 space-y-3 border border-gray-100">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span className="flex items-center gap-2 flex-wrap">
                  <svg
                    className="w-4 h-4 text-[#10B981]"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path d="M12 2v20" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M2 12h20" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                  Crop support · farmer question
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#D1FAE5] text-[#065F46] whitespace-nowrap">
                  Quick help
                </span>
              </div>

              <div className="space-y-2 text-sm bg-gradient-to-b from-white to-gray-50 rounded-xl p-3 border border-gray-50">
                <div className="text-[#10B981] font-medium break-words">
                  Farmer: እባክህ ድንች በተበላሸ ቅጠል ላይ ምን እርዳታ አለ?
                </div>
                <div className="text-gray-600 break-words">
                  AGRICA: የቅጠሉ ቀለም እና ነጭ ሐምራዊ ነጥቦች ካሉ፣ ምናልባት ፈንገስ በሽታ ነው። ዛሬ ማለዳ ብርሃን ላይ ፎቶ እውሰዱና በዌብ ያስገቡ።
                </div>
              </div>
            </div>

            {/* CARD 2 */}
            <div className="rounded-2xl bg-white shadow-md p-4 space-y-3 border border-gray-100">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4 text-gray-400"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path d="M3 7h18M3 12h18M3 17h18" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                  Marketplace · buyer on web
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="rounded-xl border border-gray-100 bg-white p-3 shadow">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-semibold text-gray-900">Teff</div>
                      <div className="text-gray-500 text-[11px]">
                        20 quintal · Debre Birhan
                      </div>
                    </div>

                    <span className="inline-flex items-center gap-1 rounded-full bg-[#ECFDF5] px-2 py-0.5 text-[10px] font-semibold text-[#10B981] border border-[#D1FAE5] whitespace-nowrap">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#10B981]" />
                      Quality checked
                    </span>
                  </div>

                  <div className="mt-2 text-[11px] text-gray-600">
                    28,000 ETB · direct from farmer
                  </div>
                </div>

                <div className="rounded-xl border border-gray-100 bg-white p-3 shadow">
                  <div className="font-semibold text-gray-900">Maize</div>
                  <div className="text-gray-500 text-[11px]">
                    No quality badge yet
                  </div>
                  <div className="mt-2 text-[11px] text-gray-600">
                    Filter by verified to reduce risk.
                  </div>
                </div>
              </div>
            </div>

            {/* FOOTER CARD */}
            <div className="flex items-center justify-between text-[12px] text-gray-500 gap-3">
              <div className="flex items-center gap-3">
                <img
                  src="/image.png"
                  alt="logo"
                  className="w-8 h-8 rounded-full border shadow-sm"
                />
                <div>
                  <div className="font-semibold text-gray-800">AGRICA</div>
                  <div className="text-gray-500">Trust-first marketplace</div>
                </div>
              </div>

              <div className="text-xs text-gray-400 text-right">
                Live marketplace demo
              </div>
            </div>

          </div>
        </section>
      </div>
    </div>
  );
}