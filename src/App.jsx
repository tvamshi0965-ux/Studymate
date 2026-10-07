import { useEffect, useState } from "react";
import { Routes, Route, Navigate, useNavigate, NavLink } from "react-router-dom";
import { api, auth } from "./api";

const ROLES = { ADMIN: "Admin", FACULTY: "Faculty", STUDENT: "Student" };
const HOME = { ADMIN: "/admin/dashboard", FACULTY: "/faculty/dashboard", STUDENT: "/student/dashboard" };
const MENU = {
  ADMIN: ["Dashboard","Colleges","Courses","Branches","Faculty","Students","Subjects","Attendance","Notes","Ideas","Notifications"],
  FACULTY: ["Dashboard","My Students","Attendance","Notes","Ideas","Notifications"],
  STUDENT: ["Dashboard","Attendance","Notes","Ideas","Notifications"] };
const TINTS = ["from-violet-500 to-fuchsia-500","from-pink-500 to-orange-400","from-cyan-500 to-blue-500",
  "from-emerald-500 to-teal-400","from-amber-400 to-rose-500","from-indigo-500 to-sky-400"];

function Login() {
  const nav = useNavigate(); const [role, setRole] = useState("STUDENT");
  const [identifier, setId] = useState(""); const [password, setPw] = useState(""); const [err, setErr] = useState(""); const [busy, setBusy] = useState(false);
  const submit = async (e) => { e.preventDefault(); setBusy(true); setErr("");
    try { const d = await api("/auth/login/", { method: "POST", body: { role, identifier, password } });
      auth.set(d); nav(HOME[d.user.role]); } catch (x) { setErr(x.message); } finally { setBusy(false); } };
  return (
    <div className="aurora min-h-screen grid place-items-center p-4">
      <form onSubmit={submit} className="pop w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">
        <h1 className="text-3xl font-extrabold bg-gradient-to-r from-violet-600 to-pink-500 bg-clip-text text-transparent">StudentHub</h1>
        <p className="text-slate-500 mb-5">Choose how you sign in</p>
        <div className="grid grid-cols-3 gap-2 mb-5 p-1 rounded-2xl bg-slate-100">
          {Object.entries(ROLES).map(([k, v]) => (
            <button type="button" key={k} onClick={() => { setRole(k); setId(""); }}
              className={`py-2 rounded-xl text-sm font-semibold transition-all ${role === k ? "bg-gradient-to-r from-violet-600 to-pink-500 text-white shadow scale-105" : "text-slate-600 hover:bg-white"}`}>{v}</button>))}
        </div>
        <input className="w-full mb-3 rounded-xl border px-4 py-3 focus:ring-2 ring-violet-400 outline-none" required
          type={role === "STUDENT" ? "text" : "email"} placeholder={role === "STUDENT" ? "Roll number" : "Email"} value={identifier} onChange={(e) => setId(e.target.value)} />
        <input className="w-full mb-3 rounded-xl border px-4 py-3 focus:ring-2 ring-violet-400 outline-none" required type="password" placeholder="Password" value={password} onChange={(e) => setPw(e.target.value)} />
        {err && <p role="alert" className="text-sm text-rose-600 mb-3">{err}</p>}
        <button disabled={busy} className="w-full rounded-xl py-3 font-semibold text-white bg-gradient-to-r from-violet-600 via-fuchsia-500 to-orange-400 hover:scale-[1.02] transition disabled:opacity-60">{busy ? "Signing in…" : "Sign in"}</button>
      </form>
    </div>);
}

function Dashboard() {
  const [cards, setCards] = useState(null); const [err, setErr] = useState("");
  useEffect(() => { api("/dashboard/").then((d) => setCards(d.cards)).catch((e) => setErr(e.message)); }, []);
  if (err) return <p className="text-rose-600">{err}</p>;
  if (!cards) return <p className="text-slate-500">Loading…</p>;
  return <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">{cards.map(([label, val], i) => (
    <div key={label} style={{ animationDelay: `${i * 90}ms` }} className={`pop rounded-3xl p-6 text-white bg-gradient-to-br ${TINTS[i % 6]} shadow-lg hover:-translate-y-1 transition`}>
      <div className="text-4xl font-extrabold">{val}</div><div className="opacity-90">{label}</div></div>))}</div>;
}

function ListPage({ title, path, cols }) {
  const [rows, setRows] = useState(null); const [q, setQ] = useState(""); const [err, setErr] = useState("");
  useEffect(() => { api(`${path}${path.includes("?") ? "&" : "?"}search=${encodeURIComponent(q)}`).then((d) => setRows(d.results ?? d)).catch((e) => setErr(e.message)); }, [path, q]);
  return <div><div className="flex justify-between mb-4"><h2 className="text-2xl font-bold">{title}</h2>
    <input placeholder="Search" value={q} onChange={(e) => setQ(e.target.value)} className="rounded-xl border px-3 py-2 dark:bg-slate-800" /></div>
    {err ? <p className="text-rose-600">{err}</p> : !rows ? <p>Loading…</p> : rows.length === 0 ? <p className="text-slate-500">Nothing here yet.</p> :
    <div className="overflow-x-auto rounded-2xl shadow bg-white dark:bg-slate-800"><table className="w-full text-left"><thead className="bg-gradient-to-r from-violet-500 to-pink-500 text-white">
      <tr>{cols.map((c) => <th key={c} className="p-3 capitalize">{c.replace("_", " ")}</th>)}</tr></thead>
      <tbody>{rows.map((r) => <tr key={r.id} className="border-t hover:bg-violet-50 dark:hover:bg-slate-700">{cols.map((c) => <td key={c} className="p-3">{String(r[c] ?? "")}</td>)}</tr>)}</tbody></table></div>}</div>;
}

const PAGES = { Colleges: ["/colleges/", ["name","code","university"]], Courses: ["/courses/", ["name","college","duration_years"]],
  Branches: ["/branches/", ["name","course"]], Faculty: ["/faculty/", ["faculty_id","full_name","email"]],
  Students: ["/students/", ["roll_number","full_name","email"]], "My Students": ["/students/", ["roll_number","full_name","email"]],
  Subjects: ["/subjects/", ["code","name"]], Attendance: ["/attendance/", ["date","subject","present"]],
  Notes: ["/notes/", ["title","kind","created_at"]], Ideas: ["/ideas/", ["title","category","status"]],
  Notifications: ["/notifications/", ["category","title","is_read"]] };

function Shell({ role }) {
  const a = auth.get(); const nav = useNavigate(); const [dark, setDark] = useState(false);
  if (!a) return <Navigate to="/" />;
  if (a.user.role !== role) return <Navigate to={HOME[a.user.role]} />;  // UX guard; backend enforces real 403s
  const base = `/${role.toLowerCase()}`; const slug = (s) => s.toLowerCase().replace(/ /g, "-");
  return <div className={dark ? "dark" : ""}><div className="min-h-screen md:flex bg-slate-50 dark:bg-slate-900 dark:text-slate-100">
    <aside className="md:w-60 p-4 bg-gradient-to-b from-violet-700 via-fuchsia-600 to-pink-500 text-white md:min-h-screen">
      <div className="text-2xl font-extrabold mb-4">StudentHub</div>
      <nav className="flex md:flex-col gap-1 overflow-x-auto">{MENU[role].map((m) => <NavLink key={m} to={`${base}/${slug(m)}`}
        className={({ isActive }) => `px-3 py-2 rounded-xl whitespace-nowrap transition ${isActive ? "bg-white text-violet-700 font-semibold" : "hover:bg-white/20"}`}>{m}</NavLink>)}
        <button onClick={() => { auth.clear(); nav("/"); }} className="px-3 py-2 rounded-xl text-left hover:bg-white/20">Logout</button></nav></aside>
    <main className="flex-1 p-6"><div className="flex justify-between mb-6"><p className="font-semibold">Hello, {a.user.name}</p>
      <button onClick={() => setDark(!dark)} className="rounded-full px-3 py-1 border">{dark ? "Light" : "Dark"} mode</button></div>
      <Routes><Route path="dashboard" element={<Dashboard />} />
        {MENU[role].filter((m) => PAGES[m]).map((m) => <Route key={m} path={slug(m)} element={<ListPage title={m} path={PAGES[m][0]} cols={PAGES[m][1]} />} />)}
        <Route path="*" element={<Navigate to="dashboard" />} /></Routes></main></div></div>;
}

export default function App() {
  return <Routes><Route path="/" element={<Login />} />
    {["ADMIN","FACULTY","STUDENT"].map((r) => <Route key={r} path={`/${r.toLowerCase()}/*`} element={<Shell role={r} />} />)}</Routes>;
}
