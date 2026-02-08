import { Link } from "react-router-dom";

export function ListingCard({ listing }) {
  const verified = listing?.verification?.status === "verified";

  return (
    <Link
      to={`/market/${listing._id}`}
      className="group rounded-2xl border border-gray-100 bg-white p-4 hover:border-emerald-300 hover:shadow-sm shadow-emerald-500/5 transition-all flex flex-col gap-3"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-gray-900 capitalize">{listing.cropType}</h3>
          <p className="text-xs text-gray-500">
            {listing.quantity} {listing.unit} · {listing.location}
          </p>
        </div>
        {verified && (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-700 border border-emerald-100">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Gemini verified
          </span>
        )}
      </div>
      <div className="flex items-center justify-between text-xs text-gray-600">
        <span className="font-semibold">{listing.expectedPrice.toLocaleString()} ETB</span>
        <span className="text-gray-400">
          {listing.farmer?.region || "Unknown region"}, {listing.farmer?.woreda || "Unknown woreda"}
        </span>
      </div>
    </Link>
  );
}

