const BASE = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
export const auth = {
  get: () => JSON.parse(localStorage.getItem("sh_auth") || "null"),
  set: (v) => localStorage.setItem("sh_auth", JSON.stringify(v)),
  clear: () => localStorage.removeItem("sh_auth"),
};
export async function api(path, opts = {}) {
  const a = auth.get();
  const isFormData = opts.body instanceof FormData;
  const res = await fetch(BASE + path, {
    ...opts,
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(a ? { Authorization: `Bearer ${a.access}` } : {}),
    },
    body: opts.body && (isFormData ? opts.body : JSON.stringify(opts.body)),
  });
  if (res.status === 401 && a) {
    auth.clear();
    location.href = "/";
  }
  const data = res.status === 204 ? null : await res.json();
  if (!res.ok) throw new Error(data?.detail || "Request failed");
  return data;
}
