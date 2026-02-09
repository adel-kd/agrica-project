export const API_ASSET_BASE = "https://agrica-project-1.onrender.com";
const API_BASE = `${API_ASSET_BASE}/api`;

function getHeaders(contentType = "application/json") {
  const token = localStorage.getItem("token");
  const headers = {};
  if (contentType) headers["Content-Type"] = contentType;
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}

export async function apiGet(path) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: getHeaders(null)
  });
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
}

export async function apiPost(path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
}

export async function apiUpload(path, formData) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: getHeaders(null), // Browser sets Content-Type for FormData
    body: formData
  });
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
}

