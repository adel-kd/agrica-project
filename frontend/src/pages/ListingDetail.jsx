import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { apiGet, API_ASSET_BASE } from "../lib/api";

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
    return <p className="text-sm text-gray-500">Loading listing…</p>;
  }

  if (error || !listing) {
    return <p className="text-sm text-red-600">{error || "Listing not found."}</p>;
  }

  const verified = listing?.verification?.status === "verified";

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 capitalize">{listing.cropType}</h1>
          <p className="text-sm text-gray-500">
            {listing.quantity} {listing.unit} · {listing.location}
          </p>
        </div>
        {verified ? (
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 border border-emerald-100">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Gemini verified crop
          </div>
        ) : (
          <div className="inline-flex items-center gap-2 rounded-full bg-gray-50 px-3 py-1 text-[11px] text-gray-500 border border-gray-100">
            Unverified listing – consider higher caution.
          </div>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-[minmax(0,2fr)_minmax(0,1.3fr)]">
        <div className="space-y-4 rounded-2xl border border-gray-100 bg-white shadow-sm p-4">
          <h2 className="text-sm font-semibold text-gray-900">Offer details</h2>
          <dl className="grid grid-cols-2 gap-3 text-xs text-gray-700">
            <div>
              <dt className="text-gray-400">Expected price</dt>
              <dd className="font-semibold">{listing.expectedPrice.toLocaleString()} ETB</dd>
            </div>
            <div>
              <dt className="text-gray-400">Status</dt>
              <dd className="capitalize">{listing.status}</dd>
            </div>
            <div>
              <dt className="text-gray-400">Harvest date</dt>
              <dd>{listing.harvestDate}</dd>
            </div>
            <div>
              <dt className="text-gray-400">Source</dt>
              <dd className="uppercase text-[11px]">{listing.source}</dd>
            </div>
          </dl>
          <p className="mt-2 text-[11px] text-gray-500">
            To buy, contact the farmer directly using the phone number below. Future versions can
            add escrow or digital payments.
          </p>
        </div>

        <div className="space-y-4 rounded-2xl border border-gray-100 bg-white shadow-sm p-4">
          <h2 className="text-sm font-semibold text-gray-900">Farmer</h2>
          <p className="text-sm text-gray-800">{listing.farmer?.fullName || "Unknown farmer"}</p>
          <p className="text-xs text-gray-500">
            {listing.farmer?.region}, {listing.farmer?.woreda}
          </p>
          <div className="mt-3 space-y-1 text-xs text-gray-700">
            <p>
              Phone: <span className="font-mono">{listing.phoneNumber}</span>
            </p>
          </div>

          {Array.isArray(listing.images) && listing.images.length > 0 ? (
            <div className="mt-4 space-y-2">
              <h3 className="text-xs font-semibold text-gray-700">Crop photos</h3>
              <div className="grid grid-cols-3 gap-2">
                {listing.images.map((url, idx) => (
                  <img
                    key={idx}
                    src={url.startsWith("http") ? url : `${API_ASSET_BASE}${url}`}
                    alt={`Crop ${idx + 1}`}
                    className="h-20 w-full rounded-lg object-cover border border-gray-200"
                  />
                ))}
              </div>
            </div>
          ) : (
            <p className="mt-4 text-[11px] text-gray-400">
              No photos attached. Web farmers can upload images to get Gemini verification.
            </p>
          )}

          {verified && Array.isArray(listing.verification?.reasons) && (
            <div className="mt-4 rounded-xl bg-emerald-50 border border-emerald-100 p-3 text-[11px] text-emerald-800 space-y-1">
              <div className="font-semibold text-emerald-900 text-xs">Why this listing is trusted</div>
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
