import { useEffect, useState } from "react";
import { ListingCard } from "../components/ListingCard";
import { apiGet } from "../lib/api";

export function Marketplace() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    cropType: "",
    location: "",
    verified: "all"
  });

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        setLoading(true);
        setError("");
        const params = new URLSearchParams();
        if (filters.cropType) params.set("cropType", filters.cropType);
        if (filters.location) params.set("location", filters.location);
        if (filters.verified === "verified") params.set("verified", "true");
        const data = await apiGet(`/market/listings?${params.toString()}`);
        setListings(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load listings.");
      } finally {
        setLoading(false);
      }
    }
    load();
    return () => controller.abort();
  }, [filters.cropType, filters.location, filters.verified]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-50">Marketplace</h1>
          <p className="text-sm text-slate-400">
            Buy directly from farmers. Filter by crop, location, and Gemini verification.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 text-xs">
          <input
            placeholder="Crop (e.g. teff, maize)"
            className="rounded-full bg-slate-950 border border-slate-700 px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            value={filters.cropType}
            onChange={(e) => setFilters((f) => ({ ...f, cropType: e.target.value }))}
          />
          <input
            placeholder="Location"
            className="rounded-full bg-slate-950 border border-slate-700 px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            value={filters.location}
            onChange={(e) => setFilters((f) => ({ ...f, location: e.target.value }))}
          />
          <select
            className="rounded-full bg-slate-950 border border-slate-700 px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-primary-500"
            value={filters.verified}
            onChange={(e) => setFilters((f) => ({ ...f, verified: e.target.value }))}
          >
            <option value="all">All listings</option>
            <option value="verified">Gemini verified only</option>
          </select>
        </div>
      </div>

      {loading && <p className="text-sm text-slate-400">Loading listings…</p>}
      {error && <p className="text-sm text-red-400">{error}</p>}

      {!loading && !error && listings.length === 0 && (
        <p className="text-sm text-slate-400">No listings found yet. Farmers will appear here soon.</p>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {listings.map((listing) => (
          <ListingCard key={listing._id} listing={listing} />
        ))}
      </div>
    </div>
  );
}

