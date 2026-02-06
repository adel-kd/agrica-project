import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { apiGet } from "../lib/api";

export function ListingDetail() {
  const { id } = useParams();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError("");
        const data = await apiGet(`/market/listings/${id}`);
        setListing(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load listing.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) {
    return <p className="text-sm text-slate-400">Loading listing…</p>;
  }

  if (error || !listing) {
    return <p className="text-sm text-red-400">{error || "Listing not found."}</p>;
  }

  const verified = listing?.verification?.status === "verified";

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-50 capitalize">{listing.cropType}</h1>
          <p className="text-sm text-slate-400">
            {listing.quantity} {listing.unit} · {listing.location}
          </p>
        </div>
        {verified ? (
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300 border border-emerald-500/30">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Gemini verified crop
          </div>
        ) : (
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-1 text-[11px] text-slate-400 border border-slate-700">
            Unverified listing – consider higher caution.
          </div>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-[minmax(0,2fr)_minmax(0,1.3fr)]">
        <div className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
          <h2 className="text-sm font-semibold text-slate-100">Offer details</h2>
          <dl className="grid grid-cols-2 gap-3 text-xs text-slate-300">
            <div>
              <dt className="text-slate-500">Expected price</dt>
              <dd className="font-semibold">{listing.expectedPrice.toLocaleString()} ETB</dd>
            </div>
            <div>
              <dt className="text-slate-500">Status</dt>
              <dd className="capitalize">{listing.status}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Harvest date</dt>
              <dd>{listing.harvestDate}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Source</dt>
              <dd className="uppercase text-[11px]">{listing.source}</dd>
            </div>
          </dl>
          <p className="mt-2 text-[11px] text-slate-400">
            To buy, contact the farmer directly using the phone number below. Future versions can
            add escrow or digital payments.
          </p>
        </div>

        <div className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
          <h2 className="text-sm font-semibold text-slate-100">Farmer</h2>
          <p className="text-sm text-slate-200">{listing.farmer?.fullName || "Unknown farmer"}</p>
          <p className="text-xs text-slate-400">
            {listing.farmer?.region}, {listing.farmer?.woreda}
          </p>
          <div className="mt-3 space-y-1 text-xs text-slate-300">
            <p>
              Phone: <span className="font-mono">{listing.phoneNumber}</span>
            </p>
          </div>

          {Array.isArray(listing.images) && listing.images.length > 0 ? (
            <div className="mt-4 space-y-2">
              <h3 className="text-xs font-semibold text-slate-200">Crop photos</h3>
              <div className="grid grid-cols-3 gap-2">
                {listing.images.map((url, idx) => (
                  <img
                    key={idx}
                    src={url}
                    alt={`Crop ${idx + 1}`}
                    className="h-20 w-full rounded-lg object-cover border border-slate-800"
                  />
                ))}
              </div>
            </div>
          ) : (
            <p className="mt-4 text-[11px] text-slate-500">
              No photos attached. Web farmers can upload images to get Gemini verification.
            </p>
          )}

          {verified && Array.isArray(listing.verification?.reasons) && (
            <div className="mt-4 rounded-xl bg-emerald-500/5 border border-emerald-500/30 p-3 text-[11px] text-emerald-100 space-y-1">
              <div className="font-semibold text-emerald-200 text-xs">Why this listing is trusted</div>
              <ul className="list-disc list-inside">
                {listing.verification.reasons.map((reason, idx) => (
                  <li key={idx}>{reason}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

