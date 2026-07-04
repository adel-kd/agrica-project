import { Link } from "react-router-dom";
// import { API_ASSET_BASE } from "../lib/api";

export function ListingCard({ listing }) {
  const verified =
    listing?.verification?.status === "verified";

  const firstImage =
  listing?.images?.length > 0
    ? listing.images[0]
    : null;
  return (
    <Link
      to={`/market/${listing?._id}`}
      className="group rounded-2xl border border-gray-100 bg-white p-4 hover:border-emerald-300 hover:shadow-sm transition-all flex flex-col gap-3"
    >
      {firstImage && (
        <img
          src={firstImage}
          alt={listing?.cropType || "crop"}
          className="h-40 w-full rounded-xl object-cover"
        />
      )}

      <div className="flex justify-between">
        <div>
          <h3 className="font-semibold capitalize">
            {listing?.cropType || "Unknown crop"}
          </h3>

          <p className="text-xs text-gray-500">
            {listing?.quantity || 0} {listing?.unit || ""} · {listing?.location || "Unknown"}
          </p>
        </div>

        {verified && (
          <span className="text-green-600 text-xs font-semibold">
            AI Verified
          </span>
        )}
      </div>

      <div className="flex justify-between text-sm">
        <span className="font-bold">
          {Number(listing?.expectedPrice || 0).toLocaleString()} ETB
        </span>

        <span className="text-gray-400">
          {listing?.farmer?.region || "—"} / {listing?.farmer?.woreda || "—"}
        </span>
      </div>
    </Link>
  );
}