import { useState, useEffect, useCallback } from "react";
import {
  Droplets,
  Plus,
  Wallet,
  CheckCircle,
  XCircle,
  Calendar,
  BarChart2,
  TrendingUp,
  Clock,
  CreditCard,
  Home,
  AlertCircle,
  X,
  Loader2,
  IndianRupee,
  History,
  Settings,
} from "lucide-react";

// ── API layer ──────────────────────────────────────────────────────────────
const BASE = import.meta.env.VITE_API_BASE_URL;
const api = {
  addBottle: () =>
    fetch(`${BASE}/add`, { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" }).then((r) => r.json()),
  getCurrent: () => fetch(`${BASE}/current`).then((r) => r.json()),
  pay: (bottlesToPay: number) =>
    fetch(`${BASE}/pay`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bottlesToPay }),
    }).then((r) => r.json()),
  report: (month: number, year: number) => fetch(`${BASE}/report?month=${month}&year=${year}`).then((r) => r.json()),
  history: () => fetch(`${BASE}/history`).then((r) => r.json()),
  payments: () => fetch(`${BASE}/payments`).then((r) => r.json()),
  getSettings: () => fetch(`${BASE}/settings`).then((r) => r.json()),
  updateSettings: (bottlePrice: number) =>
    fetch(`${BASE}/settings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bottlePrice }),
    }).then((r) => r.json()),
};

// ── Helpers ────────────────────────────────────────────────────────────────
const fmt = {
  currency: (n: any) => `₹${Number(n || 0).toFixed(2)}`,
  date: (s: any) =>
    new Date(s).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
  time: (s: any) =>
    new Date(s).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// ── Toast ──────────────────────────────────────────────────────────────────
function Toast({ toasts, remove }: any) {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-xs w-full">
      {toasts.map((t: any) => (
        <div
          key={t.id}
          className={`flex items-start gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium text-white backdrop-blur-sm transition-all
            ${t.type === "success" ? "bg-emerald-500/90" : "bg-red-500/90"}`}
        >
          {t.type === "success" ? <CheckCircle size={16} className="mt-0.5 shrink-0" /> : <AlertCircle size={16} className="mt-0.5 shrink-0" />}
          <span className="flex-1">{t.msg}</span>
          <button onClick={() => remove(t.id)}><X size={14} /></button>
        </div>
      ))}
    </div>
  );
}

function useToast() {
  const [toasts, setToasts] = useState<any[]>([]);
  const add = useCallback((msg: string, type = "success") => {
    const id = Date.now();
    setToasts((p) => [...p, { id, msg, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3500);
  }, []);
  const remove = useCallback((id: number) => setToasts((p) => p.filter((t) => t.id !== id)), []);
  return { toasts, add, remove };
}

// ── Spinner ────────────────────────────────────────────────────────────────
function Spinner() {
  return <Loader2 size={18} className="animate-spin inline-block" />;
}

// ── Summary Card ───────────────────────────────────────────────────────────
function Card({ icon: Icon, label, value, accent }: any) {
  const colors: any = {
    blue: "from-blue-500 to-cyan-400",
    emerald: "from-emerald-500 to-teal-400",
    amber: "from-amber-500 to-orange-400",
    violet: "from-violet-500 to-purple-400",
  };
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colors[accent]} flex items-center justify-center shadow-md shrink-0`}>
        <Icon size={22} className="text-white" />
      </div>
      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-bold text-slate-800 mt-0.5">{value}</p>
      </div>
    </div>
  );
}

// ── Navbar ─────────────────────────────────────────────────────────────────
function Navbar({ page, setPage }: any) {
  const links = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "usage", label: "Usage", icon: History },
    { id: "payments", label: "Payments", icon: CreditCard },
    { id: "report", label: "Report", icon: BarChart2 },
    { id: "settings", label: "Settings", icon: Settings },
  ];
  return (
    <>
      {/* Top bar */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex items-center gap-3">
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center shadow">
          <Droplets size={18} className="text-white" />
        </div>
        <span className="font-bold text-slate-800 text-lg tracking-tight">AquaTrack</span>
      </header>
      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-md border-t border-slate-200 flex">
        {links.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setPage(id)}
            className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors
              ${page === id ? "text-blue-600" : "text-slate-400 hover:text-slate-600"}`}
          >
            <Icon size={20} strokeWidth={page === id ? 2.5 : 1.8} />
            {label}
          </button>
        ))}
      </nav>
    </>
  );
}

// ── Empty State ────────────────────────────────────────────────────────────
function Empty({ label }: any) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-slate-400">
      <Droplets size={40} strokeWidth={1.2} className="mb-3" />
      <p className="text-sm">{label}</p>
    </div>
  );
}

// ── DASHBOARD ─────────────────────────────────────────────────────────────
function Dashboard({ toast }: any) {
  const [current, setCurrent] = useState({ totalBottles: 0, totalAmount: 0 });
  const [payQty, setPayQty] = useState(1);
  const [loading, setLoading] = useState({ fetch: false, add: false, pay: false });
  const [confirm, setConfirm] = useState(false);

  const load = useCallback(async () => {
    setLoading((p) => ({ ...p, fetch: true }));
    try {
      const d = await api.getCurrent();
      setCurrent(d);
    } catch {
      toast("Failed to load summary", "error");
    } finally {
      setLoading((p) => ({ ...p, fetch: false }));
    }
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  const handleAdd = async () => {
    setLoading((p) => ({ ...p, add: true }));
    try {
      await api.addBottle();
      toast("Bottle added successfully!");
      await load();
    } catch {
      toast("Failed to add bottle", "error");
    } finally {
      setLoading((p) => ({ ...p, add: false }));
    }
  };

  const handlePay = async () => {
    setConfirm(false);
    setLoading((p) => ({ ...p, pay: true }));
    try {
      const res = await api.pay(payQty);
      toast(`Payment successful! ${res.bottlesPaid} bottle(s) paid.`);
      setPayQty(1);
      await load();
    } catch {
      toast("Payment failed", "error");
    } finally {
      setLoading((p) => ({ ...p, pay: false }));
    }
  };

  const canPay = payQty > 0 && payQty <= current.totalBottles;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-slate-800">Good day! 👋</h2>
        <p className="text-slate-500 text-sm mt-0.5">Here's your water usage summary</p>
      </div>

      {loading.fetch ? (
        <div className="flex justify-center py-8"><Spinner /></div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <Card icon={Droplets} label="Unpaid Bottles" value={current.totalBottles} accent="blue" />
          <Card icon={IndianRupee} label="Amount Due" value={fmt.currency(current.totalAmount)} accent="amber" />
        </div>
      )}

      {/* Add Bottle */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <h3 className="text-sm font-semibold text-slate-600 mb-3 flex items-center gap-2">
          <Plus size={16} /> Add Bottle
        </h3>
        <button
          onClick={handleAdd}
          disabled={loading.add}
          className="w-full py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-xl shadow-md hover:opacity-90 disabled:opacity-50 transition flex items-center justify-center gap-2"
        >
          {loading.add ? <Spinner /> : <Plus size={18} />}
          {loading.add ? "Adding..." : "Add 1 Bottle"}
        </button>
      </div>

      {/* Pay */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <h3 className="text-sm font-semibold text-slate-600 mb-3 flex items-center gap-2">
          <Wallet size={16} /> Quick Pay
        </h3>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-500 block mb-1.5">Bottles to pay</label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setPayQty(Math.max(1, payQty - 1))}
                disabled={payQty <= 1}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 disabled:opacity-50"
              >-</button>
              <div className="flex-1 text-center font-bold text-xl text-slate-700">{payQty}</div>
              <button
                onClick={() => setPayQty(Math.min(current.totalBottles, payQty + 1))}
                disabled={payQty >= current.totalBottles}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 disabled:opacity-50"
              >+</button>
            </div>
          </div>

          {!confirm ? (
            <button
              onClick={() => setConfirm(true)}
              disabled={!canPay}
              className="w-full py-3 bg-slate-800 text-white font-semibold rounded-xl shadow-md hover:bg-slate-700 disabled:opacity-50 transition"
            >
              Pay {fmt.currency((current.totalAmount / (current.totalBottles || 1)) * payQty)}
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => setConfirm(false)}
                className="flex-1 py-3 bg-slate-100 text-slate-600 font-semibold rounded-xl hover:bg-slate-200 transition"
              >
                Cancel
              </button>
              <button
                onClick={handlePay}
                disabled={loading.pay}
                className="flex-1 py-3 bg-emerald-500 text-white font-semibold rounded-xl shadow-md hover:bg-emerald-600 disabled:opacity-50 transition flex justify-center items-center gap-2"
              >
                {loading.pay ? <Spinner /> : <CheckCircle size={18} />}
                Confirm
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── USAGE HISTORY ──────────────────────────────────────────────────────────
function UsageHistory({ toast }: any) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.history()
      .then(setData)
      .catch(() => toast("Failed to load history", "error"))
      .finally(() => setLoading(false));
  }, [toast]);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-slate-800">Usage History</h2>
      {loading ? (
        <div className="flex justify-center py-12"><Spinner /></div>
      ) : data.length === 0 ? (
        <Empty label="No usage records yet" />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Time</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Price</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.map((row, i) => (
                  <tr key={row._id} className={`border-b border-slate-50 ${i % 2 === 0 ? "" : "bg-slate-50/40"}`}>
                    <td className="px-4 py-3 text-slate-700 font-medium">{fmt.date(row.createdAt)}</td>
                    <td className="px-4 py-3 text-slate-500 flex items-center gap-1.5">
                      <Clock size={12} className="text-slate-400" />{fmt.time(row.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-slate-700">{fmt.currency(row.price)}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center">
                        {row.isPaid ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                            <CheckCircle size={11} /> Paid
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-600">
                            <XCircle size={11} /> Unpaid
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ── PAYMENT HISTORY ────────────────────────────────────────────────────────
function PaymentHistory({ toast }: any) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.payments()
      .then(setData)
      .catch(() => toast("Failed to load payments", "error"))
      .finally(() => setLoading(false));
  }, [toast]);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-slate-800">Payment History</h2>
      {loading ? (
        <div className="flex justify-center py-12"><Spinner /></div>
      ) : data.length === 0 ? (
        <Empty label="No payment records yet" />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Bottles</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Amount</th>
                </tr>
              </thead>
              <tbody>
                {data.map((row, i) => (
                  <tr key={row._id} className={`border-b border-slate-50 ${i % 2 === 0 ? "" : "bg-slate-50/40"}`}>
                    <td className="px-4 py-3 text-slate-700 font-medium">{fmt.date(row.paidAt)}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                        <Droplets size={11} /> {row.bottlesPaid}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-emerald-600">{fmt.currency(row.totalAmount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ── MONTHLY REPORT ─────────────────────────────────────────────────────────
function MonthlyReport({ toast }: any) {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const d = await api.report(month, year);
      setData(d);
    } catch {
      toast("Failed to load report", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [month, year]);

  const years = Array.from({ length: 5 }, (_, i) => now.getFullYear() - i);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-slate-800">Monthly Report</h2>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex gap-3">
        <div className="flex-1">
          <label className="text-xs font-semibold text-slate-500 block mb-1.5">Month</label>
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
          </select>
        </div>
        <div className="flex-1">
          <label className="text-xs font-semibold text-slate-500 block mb-1.5">Year</label>
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            {years.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Spinner /></div>
      ) : data ? (
        <div className="grid grid-cols-2 gap-3">
          <Card icon={Droplets} label="Total Bottles" value={data.totalBottles ?? 0} accent="blue" />
          <Card icon={IndianRupee} label="Total Cost" value={fmt.currency(data.totalBottleAmount)} accent="amber" />
          <Card icon={CheckCircle} label="Total Paid" value={fmt.currency(data.totalPaid)} accent="emerald" />
          <Card icon={TrendingUp} label="Remaining" value={fmt.currency(data.remaining)} accent="violet" />

          {/* Visual bar */}
          {data.totalBottleAmount > 0 && (
            <div className="col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Payment Progress</p>
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full transition-all duration-1000"
                  style={{ width: `${Math.min(100, (data.totalPaid / data.totalBottleAmount) * 100)}%` }}
                />
              </div>
              <div className="flex justify-between mt-2 text-xs text-slate-500">
                <span>0%</span>
                <span>{Math.round((data.totalPaid / data.totalBottleAmount) * 100)}%</span>
                <span>100%</span>
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}

// ── SETTINGS ───────────────────────────────────────────────────────────────
function SettingsPage({ toast }: any) {
  const [price, setPrice] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.getSettings()
      .then((data) => setPrice(data.bottlePrice))
      .catch(() => toast("Failed to load settings", "error"))
      .finally(() => setLoading(false));
  }, [toast]);

  const handleSave = async () => {
    const val = Number(price);
    if (!val || val <= 0) {
      toast("Please enter a valid price", "error");
      return;
    }
    setSaving(true);
    try {
      await api.updateSettings(val);
      toast("Settings updated successfully!");
    } catch {
      toast("Failed to update settings", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <h2 className="text-xl font-bold text-slate-800">Settings</h2>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <h3 className="text-sm font-semibold text-slate-600 mb-4 flex items-center gap-2">
          <IndianRupee size={16} /> Global Bottle Price
        </h3>

        {loading ? (
          <div className="flex justify-center py-4"><Spinner /></div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-slate-500 block mb-1.5">Price per Bottle (₹)</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="20"
              />
              <p className="text-xs text-slate-400 mt-1.5">This price will be used for all new bottle entries.</p>
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full py-3 bg-slate-800 text-white font-semibold rounded-xl shadow-md hover:bg-slate-700 disabled:opacity-50 transition flex items-center justify-center gap-2"
            >
              {saving ? <Spinner /> : <CheckCircle size={18} />}
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── APP ────────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("dashboard");
  const { toasts, add: toast, remove } = useToast();

  const pages: any = {
    dashboard: <Dashboard toast={toast} />,
    usage: <UsageHistory toast={toast} />,
    payments: <PaymentHistory toast={toast} />,
    report: <MonthlyReport toast={toast} />,
    settings: <SettingsPage toast={toast} />,
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <Toast toasts={toasts} remove={remove} />
      <Navbar page={page} setPage={setPage} />
      <main className="max-w-lg mx-auto px-4 pt-5 pb-24">
        {pages[page]}
      </main>
    </div>
  );
}
