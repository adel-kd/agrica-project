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
    const timeout = setTimeout(async () => {
      try {
        setLoading(true);
        setError("");

        const params = new URLSearchParams();

        if (filters.cropType.trim()) {
          params.set("cropType", filters.cropType.trim());
        }

        if (filters.location.trim()) {
          params.set("location", filters.location.trim());
        }

        if (filters.verified === "verified") {
          params.set("verified", "true");
        }

        const query = params.toString();
        const endpoint = query
          ? `/market/listings?${query}`
          : `/market/listings`;

        const data = await apiGet(endpoint);
        setListings(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load listings.");
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(timeout);
  }, [filters]);

  const inputStyle =
    "rounded-full bg-white border border-gray-200 px-4 py-2 text-sm text-gray-900 placeholder:text-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition";

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Marketplace
          </h1>
          <p className="text-sm text-gray-500">
            Buy directly from farmers.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <input
            placeholder="Search crop..."
            value={filters.cropType}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                cropType: e.target.value
              }))
            }
            className={inputStyle}
          />

          <input
            placeholder="Search location..."
            value={filters.location}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                location: e.target.value
              }))
            }
            className={inputStyle}
          />

          <select
            value={filters.verified}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                verified: e.target.value
              }))
            }
            className={inputStyle}
          >
            <option value="all">All listings</option>
            <option value="verified">Verified only</option>
          </select>
        </div>
      </div>

      {loading && (
        <p className="text-sm text-gray-500">Loading listings...</p>
      )}

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      {!loading && !error && listings.length === 0 && (
        <p className="text-sm text-gray-500">
          No matching listings found.
        </p>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {listings.map((listing) => (
          <ListingCard key={listing._id} listing={listing} />
        ))}
      </div>
    </div>
  );
}