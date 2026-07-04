export default function About() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-[#10B981]">AGRICA</h1>
        <p className="text-sm text-gray-500">
          AI-powered agriculture platform for Africa (starting with Ethiopia)
        </p>
      </div>

      {/* Card */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4">
        <p className="text-sm text-gray-700 leading-relaxed">
          AGRICA is an AI-driven agriculture platform that connects farmers and buyers while
          providing smart agronomy support using AI.
        </p>

        <p className="text-sm text-gray-700 leading-relaxed">
          Farmers can get farming advice, create crop listings, and optionally upload crop
          images for AI-based verification that may grant a <b className="text-[#10B981]">Verified Badge</b>.
        </p>

        <p className="text-sm text-gray-700 leading-relaxed">
          The current version is a demo for Ethiopia with Amharic support, designed to expand
          across Africa with local languages and markets.
        </p>
      </div>

      {/* Vision Card */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-2">
        <h2 className="text-lg font-semibold text-[#10B981]">Vision</h2>
        <p className="text-sm text-gray-700 leading-relaxed">
          AGRICA will scale into country-based platforms like AGRICA Kenya, Tanzania, and Nigeria,
          each adapted to local languages, crops, and farming systems.
        </p>
      </div>
    </div>
  );
}