import { useState } from "react";
import { apiPost } from "../lib/api";

export function FarmerDashboard() {
  const [form, setForm] = useState({
    fullName: "",
    phoneNumber: "",
    region: "",
    woreda: "",
    cropType: "",
    quantity: "",
    unit: "kg",
    expectedPrice: "",
    location: "",
    harvestDate: ""
  });
  const [imageFiles, setImageFiles] = useState([]); // File state
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const onFileChange = (e) => {
    if (e.target.files) {
      setImageFiles(Array.from(e.target.files));
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage("");
    setError("");
    try {
      const formData = new FormData();
      Object.keys(form).forEach(key => formData.append(key, form[key]));
      imageFiles.forEach(file => formData.append("images", file));

      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:5000/api/market/listings", {
        method: "POST",
        body: formData,
        headers: token ? { "Authorization": `Bearer ${token}` } : {}
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed");
      }

      setMessage("Your crop has been listed. Gemini is verifying your images...");
      setForm((f) => ({ ...f, cropType: "", quantity: "", expectedPrice: "", location: "", harvestDate: "" }));
      setImageFiles([]);
    } catch (err) {
      console.error(err);
      setError("Failed to create listing. Please check inputs and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Farmer dashboard</h1>
        <p className="text-sm text-gray-500 max-w-xl">
          For farmers with internet access. List your crops and upload photos for faster verification.
        </p>
      </div>

      <form
        onSubmit={onSubmit}
        className="space-y-5 rounded-2xl border border-gray-100 bg-white shadow-sm p-4 md:p-6"
      >
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs text-gray-700 font-medium">Full name</label>
            <input
              name="fullName"
              value={form.fullName}
              onChange={onChange}
              required
              className="w-full rounded-xl bg-white border border-gray-200 px-3 py-2 text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              placeholder="e.g. Abebe Bekele"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-gray-700 font-medium">Phone number</label>
            <input
              name="phoneNumber"
              value={form.phoneNumber}
              onChange={onChange}
              required
              className="w-full rounded-xl bg-white border border-gray-200 px-3 py-2 text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              placeholder="+2519..."
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-gray-700 font-medium">Region</label>
            <input
              name="region"
              value={form.region}
              onChange={onChange}
              required
              className="w-full rounded-xl bg-white border border-gray-200 px-3 py-2 text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              placeholder="e.g. Oromia"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-gray-700 font-medium">Woreda</label>
            <input
              name="woreda"
              value={form.woreda}
              onChange={onChange}
              required
              className="w-full rounded-xl bg-white border border-gray-200 px-3 py-2 text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              placeholder="e.g. Ada'a"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs text-gray-700 font-medium">Crop type</label>
            <input
              name="cropType"
              value={form.cropType}
              onChange={onChange}
              required
              className="w-full rounded-xl bg-white border border-gray-200 px-3 py-2 text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              placeholder="e.g. teff, wheat, maize"
            />
          </div>
          <div className="grid grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-2">
            <div className="space-y-1">
              <label className="text-xs text-gray-700 font-medium">Quantity</label>
              <input
                name="quantity"
                value={form.quantity}
                onChange={onChange}
                required
                className="w-full rounded-xl bg-white border border-gray-200 px-3 py-2 text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                placeholder="e.g. 20"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-gray-700 font-medium">Unit</label>
              <select
                name="unit"
                value={form.unit}
                onChange={onChange}
                className="w-full rounded-xl bg-white border border-gray-200 px-3 py-2 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="kg">kg</option>
                <option value="quintal">quintal</option>
              </select>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs text-gray-700 font-medium">Expected price (ETB)</label>
            <input
              name="expectedPrice"
              value={form.expectedPrice}
              onChange={onChange}
              required
              className="w-full rounded-xl bg-white border border-gray-200 px-3 py-2 text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              placeholder="e.g. 28000"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-gray-700 font-medium">Location</label>
            <input
              name="location"
              value={form.location}
              onChange={onChange}
              required
              className="w-full rounded-xl bg-white border border-gray-200 px-3 py-2 text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              placeholder="Town / village"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs text-gray-700 font-medium">Harvest date</label>
          <input
            name="harvestDate"
            value={form.harvestDate}
            onChange={onChange}
            required
            className="w-full rounded-xl bg-white border border-gray-200 px-3 py-2 text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            placeholder="e.g. January 2026"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs text-gray-700 font-medium">Crop Images (Optional - for Verification)</label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={onFileChange}
            className="block w-full text-xs text-gray-600 file:mr-3 file:rounded-full file:border-0 file:bg-emerald-50 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-emerald-700 hover:file:bg-emerald-100"
          />
          <p className="text-[10px] text-gray-400">Upload clear photos of your crop for Gemini AI to verify quality.</p>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? "Listing crop..." : "List crop"}
          </button>
          {message && <p className="text-[11px] text-emerald-600">{message}</p>}
          {error && <p className="text-[11px] text-red-600">{error}</p>}
        </div>
      </form>
    </div>
  );
}
