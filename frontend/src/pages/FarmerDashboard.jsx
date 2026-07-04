import { useEffect, useState } from "react";
import axios from "axios";

const API = "http://localhost:5001/api/market";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export default function FarmerDashboard() {
  const [form, setForm] = useState({
    cropType: "",
    quantity: "",
    unit: "kg",
    expectedPrice: "",
    location: "",
    harvestDate: ""
  });

  const [images, setImages] = useState([]);
  const [listings, setListings] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  const rawUser = localStorage.getItem("user");
  let user = null;
  try {
    user = rawUser ? JSON.parse(rawUser) : null;
  } catch (err) {
    console.error("Failed to parse user", err);
  }

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      const headers = getAuthHeaders();
      const farmerId = user?.id || user?._id;
      const url = farmerId ? `${API}/listings?farmerId=${farmerId}` : `${API}/listings`;
      const res = await axios.get(url, { headers });
      setListings(res.data);
    } catch (err) {
      console.error(err?.response?.data || err.message);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const reset = () => {
    setForm({
      cropType: "",
      quantity: "",
      unit: "kg",
      expectedPrice: "",
      location: "",
      harvestDate: ""
    });
    setImages([]);
    setEditingId(null);
    // Clear file input
    const fileInput = document.getElementById("crop-image-input");
    if (fileInput) fileInput.value = "";
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const headers = getAuthHeaders();
      if (editingId) {
        await axios.patch(
          `${API}/listings/${editingId}`,
          {
            ...form,
            quantity: Number(form.quantity),
            expectedPrice: Number(form.expectedPrice)
          },
          { headers }
        );
      } else {
        const data = new FormData();

        Object.keys(form).forEach((k) =>
          data.append(k, form[k])
        );

        for (let i = 0; i < images.length; i++) {
          data.append("images", images[i]);
        }

        const res = await axios.post(`${API}/listings`, data, { headers });
        if (res.data.message) {
          alert(res.data.message);
        }
      }

      reset();
      fetchListings();
    } catch (err) {
      console.error(err?.response?.data || err.message);
      alert(err?.response?.data?.error || "Request failed");
    } finally {
      setLoading(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Are you sure you want to delete this listing?")) return;
    try {
      const headers = getAuthHeaders();
      await axios.delete(`${API}/listings/${id}`, { headers });
      fetchListings();
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.error || "Failed to delete listing");
    }
  };

  const edit = (item) => {
    setForm({
      cropType: item.cropType,
      quantity: item.quantity,
      unit: item.unit || "kg",
      expectedPrice: item.expectedPrice,
      location: item.location,
      harvestDate: item.harvestDate
    });

    setEditingId(item._id);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900"> Farmer Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage your crop listings and upload photos to request verified quality badges.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-[1.2fr_2fr]">
        {/* Form Section */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm h-fit space-y-6">
          <h2 className="text-lg font-semibold text-gray-900">
            {editingId ? "Update Crop Listing" : "Add Crop Listing"}
          </h2>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">Crop Type</label>
              <input
                name="cropType"
                required
                value={form.cropType}
                onChange={handleChange}
                placeholder="e.g. Wheat, Coffee, Teff"
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-emerald-500 focus:ring-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Quantity</label>
                <input
                  name="quantity"
                  type="number"
                  required
                  value={form.quantity}
                  onChange={handleChange}
                  placeholder="e.g. 50"
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-emerald-500 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Unit</label>
                <select
                  name="unit"
                  value={form.unit}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-emerald-500 focus:ring-emerald-500 bg-white"
                >
                  <option value="kg">kg</option>
                  <option value="quintal">quintal</option>
                  <option value="ton">ton</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">Expected Price (ETB)</label>
              <input
                name="expectedPrice"
                type="number"
                required
                value={form.expectedPrice}
                onChange={handleChange}
                placeholder="Price in ETB"
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-emerald-500 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">Location</label>
              <input
                name="location"
                required
                value={form.location}
                onChange={handleChange}
                placeholder="e.g. Oromia, Jimma"
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-emerald-500 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">Harvest Date</label>
              <input
                type="date"
                name="harvestDate"
                required
                value={form.harvestDate}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-emerald-500 focus:ring-emerald-500"
              />
            </div>

            {!editingId && (
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Crop Image (Optional)</label>
                <input
                  id="crop-image-input"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImages(e.target.files)}
                  className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                />
                <p className="text-[10px] text-gray-400 mt-1">
                  Upload a clear, high-resolution crop photo to automatically receive a Quality Badge.
                </p>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 rounded-full bg-emerald-600 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50 transition-all"
              >
                {loading ? "Processing..." : editingId ? "Update Listing" : "Add Listing"}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={reset}
                  className="flex-1 rounded-full border border-gray-200 py-2.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Listings Section */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Your Listings</h2>
          {listings.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-8 text-center text-gray-500">
              <span className="text-3xl"></span>
              <p className="mt-2 text-sm">You haven't listed any crops yet.</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {listings.map((l) => {
                const verified = l.verification?.status === "verified";
                const firstImage = l.images?.length > 0 ? `http://localhost:5001${l.images[0]}` : null;

                return (
                  <div
                    key={l._id}
                    className="group rounded-2xl border border-gray-100 bg-white p-4 hover:shadow-sm hover:border-emerald-200 transition-all flex flex-col gap-3 relative"
                  >
                    {firstImage && (
                      <img
                        src={firstImage}
                        alt={l.cropType}
                        className="h-32 w-full rounded-xl object-cover border border-gray-100"
                      />
                    )}

                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-gray-900 capitalize text-sm">{l.cropType}</h3>
                        <p className="text-xs text-gray-500">
                          {l.quantity} {l.unit} · {l.location}
                        </p>
                      </div>
                      {verified && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 border border-emerald-100">
                          Verified
                        </span>
                      )}
                    </div>

                    <div className="flex justify-between items-center text-xs pt-1 border-t border-gray-50">
                      <span className="font-bold text-gray-900">{l.expectedPrice.toLocaleString()} ETB</span>
                      <span className="text-[10px] text-gray-400">{l.harvestDate}</span>
                    </div>

                    <div className="flex gap-2 mt-1">
                      <button
                        onClick={() => edit(l)}
                        className="flex-1 rounded-lg border border-gray-200 py-1 text-[11px] font-medium text-gray-600 hover:bg-gray-50 hover:text-emerald-700 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => remove(l._id)}
                        className="flex-1 rounded-lg border border-red-100 py-1 text-[11px] font-medium text-red-600 hover:bg-red-50 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}