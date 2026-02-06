import { Link } from "react-router-dom";

export function ListingCard({ listing }) {
  const verified = listing?.verification?.status === "verified";

  return (
    <Link
      to={`/market/${listing._id}`}
      className="group rounded-2xl border border-slate-800 bg-slate-900/40 p-4 hover:border-primary-500 hover:bg-slate-900 transition-colors flex flex-col gap-3"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-slate-50 capitalize">{listing.cropType}</h3>
          <p className="text-xs text-slate-400">
            {listing.quantity} {listing.unit} · {listing.location}
          </p>
        </div>
        {verified && (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-semibold text-emerald-400 border border-emerald-500/30">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Gemini verified
          </span>
        )}
      </div>
      <div className="flex items-center justify-between text-xs text-slate-300">
        <span className="font-semibold">{listing.expectedPrice.toLocaleString()} ETB</span>
        <span className="text-slate-500">
          {listing.farmer?.region || "Unknown region"}, {listing.farmer?.woreda || "Unknown woreda"}
        </span>
      </div>
    </Link>
  );
}

