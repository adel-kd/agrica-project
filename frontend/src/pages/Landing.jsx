import { Link } from "react-router-dom";

export function Landing() {
  return (
    <div className="relative overflow-hidden py-12 md:py-20">
      {/* Decorative gradient background blobs (fixed green) */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <svg
          className="absolute -left-20 top-0 w-[520px] opacity-30"
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
          className="absolute right-0 bottom-0 w-[420px] opacity-25"
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

      <div className="mx-auto max-w-7xl px-6">
        <section className="grid gap-10 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] items-center">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#ECFDF5]/80 px-3 py-1 text-xs font-semibold text-[#10B981] border border-[#D1FAE5] backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-[#10B981]" />
              Built for African farmers
            </span>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight">
              AI agronomist & fair marketplace
              <span className="block text-[#10B981]">from button phones to the web.</span>
            </h1>

            <p className="text-sm md:text-base text-gray-600 max-w-xl">
              AGRICA connects farmers and buyers directly. Farmers without internet
              use IVR. Connected farmers and buyers use this web app. Gemini AI
              provides agronomy advice and verifies crop quality — reducing risk and
              increasing trust.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link
                to="/market"
                className="inline-flex items-center justify-center rounded-full bg-[#10B981] px-6 py-3 text-sm font-semibold text-white shadow-lg transform transition-all hover:scale-[1.03] hover:shadow-2xl"
              >
                Browse crops
              </Link>

              <Link
                to="/ai"
                className="inline-flex items-center justify-center rounded-full border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-800 hover:bg-gray-50 transition-colors shadow-sm"
              >
                Ask the AI agronomist
              </Link>
            </div>

            <div className="flex flex-wrap gap-6 text-[13px] text-gray-500">
              <div className="flex items-start gap-3">
                <div className="pt-0.5">
                  <div className="font-semibold text-gray-800">Offline farmers</div>
                  <div className="text-gray-500">
                    Call the shortcode · IVR in there language ready
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="pt-0.5">
                  <div className="font-semibold text-gray-800">Online farmers &amp; buyers</div>
                  <div className="text-gray-500">
                    Mobile-first web app · AI-powered trust & verification
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-gray-100 bg-white/60 backdrop-blur-sm shadow-2xl p-5 space-y-4 transform transition-all hover:scale-[1.01]">
            <div className="rounded-2xl bg-white shadow-md p-4 space-y-3 border border-gray-100">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4 text-[#10B981]"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12 2v20"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M2 12h20"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  IVR flow · farmer with button phone
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#D1FAE5] text-[#065F46]">
                  No internet
                </span>
              </div>

              <div className="space-y-2 text-sm bg-gradient-to-b from-white to-gray-50 rounded-xl p-3 border border-gray-50">
                <div className="text-[#10B981] font-medium">
                  Farmer: እባክህ ድንች በተበላሸ ቅጠል ላይ ምን እርዳታ አለ?
                </div>
                <div className="text-gray-600">
                  AGRICA AI: የቅጠሉ ቀለም እና ነጭ ሐምራዊ ነጥቦች ካሉ፣ ምናልባት ፈንገስ በሽታ ነው። ዛሬ ማለዳ ብርሃን ላይ ፎቶ እውሰዱና በዌብ ያስገቡ።
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-white shadow-md p-4 space-y-3 border border-gray-100">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4 text-gray-400"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M3 7h18M3 12h18M3 17h18"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Marketplace · buyer on web
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-xl border border-gray-100 bg-white p-3 shadow transition-transform hover:-translate-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <div className="font-semibold text-gray-900">Teff</div>
                      <div className="text-gray-500 text-[11px]">
                        20 quintal · Debre Birhan
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#ECFDF5] px-2 py-0.5 text-[10px] font-semibold text-[#10B981] border border-[#D1FAE5]">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#10B981]" />
                      Gemini verified
                    </span>
                  </div>
                  <div className="mt-2 text-[11px] text-gray-600">
                    28,000 ETB · direct from farmer
                  </div>
                </div>

                <div className="rounded-xl border border-gray-100 bg-white p-3 shadow transition-transform hover:-translate-y-1">
                  <div className="font-semibold text-gray-900">Maize</div>
                  <div className="text-gray-500 text-[11px]">Unverified IVR listing</div>
                  <div className="mt-2 text-[11px] text-gray-600">
                    Filter by verified to reduce risk.
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-[12px] text-gray-500">
              <div className="flex items-center gap-3">
                <img
                  src="/image.png"
                  alt="logo"
                  className="w-8 h-8 rounded-full border border-white shadow-sm"
                />
                <div>
                  <div className="font-semibold text-gray-800">AGRICA</div>
                  <div className="text-gray-500">Trust-first marketplace · IVR + Web</div>
                </div>
              </div>

              <div className="text-xs text-gray-400">Live demo · no signup required</div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
