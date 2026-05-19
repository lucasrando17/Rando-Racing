import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  BadgeCheck,
  CalendarDays,
  ClipboardList,
  DollarSign,
  HeartPulse,
  Home,
  Plus,
  Search,
  Settings,
  Trash2,
  Trophy,
  Wheat,
  X
} from "lucide-react";
import "./styles.css";

const STORAGE_KEY = "stable-manager-fresh-v1";

const starterData = {
  horses: [
    {
      id: "h-001",
      name: "Red Reactor",
      stableName: "Red",
      status: "Racing",
      age: 5,
      sex: "Gelding",
      trainer: "James Rando",
      owner: "Punthub x Rando Racing",
      nextTarget: "Menangle — 24 May"
    },
    {
      id: "h-002",
      name: "Miss Camden",
      stableName: "Missy",
      status: "Building",
      age: 4,
      sex: "Mare",
      trainer: "James Rando",
      owner: "Rando Racing",
      nextTarget: "Trial — 27 May"
    },
    {
      id: "h-003",
      name: "Western Voltage",
      stableName: "Volt",
      status: "Rehab",
      age: 6,
      sex: "Horse",
      trainer: "James Rando",
      owner: "Private Syndicate",
      nextTarget: "TBC"
    }
  ],
  work: [
    {
      id: "w-001",
      date: "2026-05-19",
      horse: "Red Reactor",
      type: "Fast work",
      distance: "2400m",
      time: "3:18",
      driver: "Lucas",
      notes: "Strong last 400m. Pulled up well."
    },
    {
      id: "w-002",
      date: "2026-05-17",
      horse: "Red Reactor",
      type: "Jog",
      distance: "6km",
      time: "",
      driver: "Lucas",
      notes: "Quiet jog. Relaxed."
    },
    {
      id: "w-003",
      date: "2026-05-18",
      horse: "Miss Camden",
      type: "Hopple",
      distance: "2200m",
      time: "3:08",
      driver: "James",
      notes: "Needed steering early. Better late."
    }
  ],
  treatments: [
    {
      id: "t-001",
      date: "2026-05-18",
      horse: "Western Voltage",
      treatment: "Leg check",
      vet: "Camden Equine",
      nextDue: "2026-05-25",
      notes: "Continue light work."
    },
    {
      id: "t-002",
      date: "2026-05-12",
      horse: "Red Reactor",
      treatment: "Dental",
      vet: "Equine Dentist",
      nextDue: "2027-05-12",
      notes: "Routine float."
    }
  ],
  feed: [
    {
      id: "f-001",
      horse: "Red Reactor",
      morning: "1kg Release, lucerne, bran",
      night: "2kg Release, beet, oil, hay",
      supplements: "Enduralyte, Muslamax"
    },
    {
      id: "f-002",
      horse: "Miss Camden",
      morning: "0.75kg Release, chaff",
      night: "1.5kg Release, beet, hay",
      supplements: "Magnesium, probiotic"
    }
  ],
  finance: [
    {
      id: "m-001",
      date: "2026-05-15",
      horse: "Red Reactor",
      type: "Income",
      category: "Prizemoney",
      amount: 1200,
      notes: "3rd at Penrith"
    },
    {
      id: "m-002",
      date: "2026-05-16",
      horse: "Red Reactor",
      type: "Expense",
      category: "Feed",
      amount: -86,
      notes: "Weekly feed allocation"
    },
    {
      id: "m-003",
      date: "2026-05-18",
      horse: "Western Voltage",
      type: "Expense",
      category: "Vet",
      amount: -240,
      notes: "Rehab check"
    }
  ]
};

function loadSavedData() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : starterData;
  } catch {
    return starterData;
  }
}

function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function StatCard({ icon: Icon, label, value, hint }) {
  return (
    <section className="stat-card">
      <div className="stat-icon">
        <Icon size={22} />
      </div>
      <div>
        <p>{label}</p>
        <strong>{value}</strong>
        {hint && <small>{hint}</small>}
      </div>
    </section>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div className="modal-backdrop">
      <section className="modal-card">
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="icon-button" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>
        {children}
      </section>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
    </label>
  );
}

function App() {
  const [data, setData] = useState(loadSavedData);
  const [tab, setTab] = useState("dashboard");
  const [horseSearch, setHorseSearch] = useState("");
  const [workHorseFilter, setWorkHorseFilter] = useState("All");
  const [activeModal, setActiveModal] = useState(null);

  useEffect(() => {
    saveData(data);
  }, [data]);

  const horseNames = data.horses.map((item) => item.name);

  const filteredHorses = data.horses.filter((item) => {
    const searchable = `${item.name} ${item.stableName} ${item.status} ${item.owner} ${item.trainer}`;
    return searchable.toLowerCase().includes(horseSearch.toLowerCase());
  });

  const filteredWork = useMemo(() => {
    return data.work
      .filter((item) => workHorseFilter === "All" || item.horse === workHorseFilter)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [data.work, workHorseFilter]);

  const netPosition = data.finance.reduce((total, item) => total + Number(item.amount || 0), 0);
  const horsesInWork = data.horses.filter((item) => item.status !== "Rehab").length;
  const dueTreatments = data.treatments.filter((item) => {
    if (!item.nextDue) return false;
    const dueDate = new Date(item.nextDue);
    const today = new Date();
    const sevenDays = new Date();
    sevenDays.setDate(today.getDate() + 7);
    return dueDate <= sevenDays;
  }).length;

  function addRow(collection, row) {
    setData((current) => ({
      ...current,
      [collection]: [{ id: crypto.randomUUID(), ...row }, ...current[collection]]
    }));
    setActiveModal(null);
  }

  function deleteRow(collection, id) {
    setData((current) => ({
      ...current,
      [collection]: current[collection].filter((item) => item.id !== id)
    }));
  }

  function resetDemoData() {
    localStorage.removeItem(STORAGE_KEY);
    setData(starterData);
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <h1>Stable Manager</h1>
          <p>Horses, work, vet, feed, racing and finance.</p>
        </div>
        <button className="primary-button" onClick={() => setActiveModal(tab === "dashboard" ? "work" : tab)}>
          <Plus size={18} />
          Add
        </button>
      </header>

      {tab === "dashboard" && (
        <main className="page">
          <section className="stats-grid">
            <StatCard icon={BadgeCheck} label="Horses" value={data.horses.length} hint={`${horsesInWork} currently in work`} />
            <StatCard icon={ClipboardList} label="Work Entries" value={data.work.length} hint="Training records" />
            <StatCard icon={HeartPulse} label="Due Treatments" value={dueTreatments} hint="Due within 7 days" />
            <StatCard icon={DollarSign} label="Net Position" value={`$${netPosition.toLocaleString()}`} hint="Saved finance data" />
          </section>

          <section className="card">
            <div className="section-title">
              <h2>Recent Work</h2>
              <button className="text-button" onClick={() => setTab("work")}>View all</button>
            </div>
            <WorkList rows={filteredWork.slice(0, 4)} onDelete={(id) => deleteRow("work", id)} />
          </section>

          <section className="card">
            <div className="section-title">
              <h2>Upcoming Targets</h2>
            </div>
            <div className="target-list">
              {data.horses.map((item) => (
                <div className="target-row" key={item.id}>
                  <strong>{item.name}</strong>
                  <span>{item.nextTarget}</span>
                </div>
              ))}
            </div>
          </section>
        </main>
      )}

      {tab === "horses" && (
        <main className="page">
          <div className="search-box">
            <Search size={18} />
            <input value={horseSearch} onChange={(event) => setHorseSearch(event.target.value)} placeholder="Search horses..." />
          </div>

          <div className="horse-grid">
            {filteredHorses.map((item) => (
              <article className="horse-card" key={item.id}>
                <div className="horse-head">
                  <div>
                    <h2>{item.name}</h2>
                    <p>Stable name: {item.stableName}</p>
                  </div>
                  <span className={`pill ${item.status.toLowerCase()}`}>{item.status}</span>
                </div>
                <dl>
                  <div><dt>Age/Sex</dt><dd>{item.age}yo {item.sex}</dd></div>
                  <div><dt>Owner</dt><dd>{item.owner}</dd></div>
                  <div><dt>Trainer</dt><dd>{item.trainer}</dd></div>
                  <div><dt>Next</dt><dd>{item.nextTarget}</dd></div>
                </dl>
              </article>
            ))}
          </div>
        </main>
      )}

      {tab === "work" && (
        <main className="page">
          <div className="toolbar">
            <select value={workHorseFilter} onChange={(event) => setWorkHorseFilter(event.target.value)}>
              <option>All</option>
              {horseNames.map((name) => <option key={name}>{name}</option>)}
            </select>
            <button className="primary-button" onClick={() => setActiveModal("work")}>
              <Plus size={18} />
              Add Work
            </button>
          </div>
          <WorkList rows={filteredWork} onDelete={(id) => deleteRow("work", id)} />
        </main>
      )}

      {tab === "treatments" && (
        <main className="page">
          <div className="toolbar">
            <h2>Vet & Treatments</h2>
            <button className="primary-button" onClick={() => setActiveModal("treatments")}>
              <Plus size={18} />
              Add
            </button>
          </div>
          <RecordList rows={data.treatments} fields={["date", "horse", "treatment", "vet", "nextDue", "notes"]} onDelete={(id) => deleteRow("treatments", id)} />
        </main>
      )}

      {tab === "feed" && (
        <main className="page">
          <div className="toolbar">
            <h2>Feed Programs</h2>
            <button className="primary-button" onClick={() => setActiveModal("feed")}>
              <Plus size={18} />
              Add
            </button>
          </div>
          <RecordList rows={data.feed} fields={["horse", "morning", "night", "supplements"]} onDelete={(id) => deleteRow("feed", id)} />
        </main>
      )}

      {tab === "finance" && (
        <main className="page">
          <div className="toolbar">
            <h2>Finance</h2>
            <button className="primary-button" onClick={() => setActiveModal("finance")}>
              <Plus size={18} />
              Add
            </button>
          </div>
          <RecordList rows={data.finance} fields={["date", "horse", "type", "category", "amount", "notes"]} onDelete={(id) => deleteRow("finance", id)} />
        </main>
      )}

      {tab === "racing" && (
        <main className="page">
          <div className="card">
            <div className="section-title">
              <h2>Race Planning</h2>
              <Trophy size={22} />
            </div>
            <div className="target-list">
              {data.horses.map((item) => (
                <div className="target-row" key={item.id}>
                  <strong>{item.name}</strong>
                  <span>{item.nextTarget}</span>
                </div>
              ))}
            </div>
          </div>
        </main>
      )}

      {tab === "settings" && (
        <main className="page">
          <section className="card">
            <h2>Install on iPhone</h2>
            <p>After deployment, open the site in Safari, tap Share, then tap Add to Home Screen.</p>
          </section>
          <section className="card">
            <h2>Data Storage</h2>
            <p>This fresh version stores data locally in the browser. For staff sharing across multiple phones, connect it to Supabase, Firebase, Airtable or Google Sheets later.</p>
            <button className="danger-button" onClick={resetDemoData}>Reset Demo Data</button>
          </section>
        </main>
      )}

      <nav className="bottom-nav">
        <button className={tab === "dashboard" ? "active" : ""} onClick={() => setTab("dashboard")}><Home size={20} /><span>Home</span></button>
        <button className={tab === "horses" ? "active" : ""} onClick={() => setTab("horses")}><BadgeCheck size={20} /><span>Horses</span></button>
        <button className={tab === "work" ? "active" : ""} onClick={() => setTab("work")}><ClipboardList size={20} /><span>Work</span></button>
        <button className={tab === "treatments" ? "active" : ""} onClick={() => setTab("treatments")}><HeartPulse size={20} /><span>Vet</span></button>
        <button className={tab === "feed" ? "active" : ""} onClick={() => setTab("feed")}><Wheat size={20} /><span>Feed</span></button>
        <button className={tab === "racing" ? "active" : ""} onClick={() => setTab("racing")}><CalendarDays size={20} /><span>Race</span></button>
        <button className={tab === "finance" ? "active" : ""} onClick={() => setTab("finance")}><DollarSign size={20} /><span>$</span></button>
        <button className={tab === "settings" ? "active" : ""} onClick={() => setTab("settings")}><Settings size={20} /><span>More</span></button>
      </nav>

      {activeModal === "work" && <WorkForm horseNames={horseNames} onClose={() => setActiveModal(null)} onSave={(row) => addRow("work", row)} />}
      {activeModal === "treatments" && <TreatmentForm horseNames={horseNames} onClose={() => setActiveModal(null)} onSave={(row) => addRow("treatments", row)} />}
      {activeModal === "feed" && <FeedForm horseNames={horseNames} onClose={() => setActiveModal(null)} onSave={(row) => addRow("feed", row)} />}
      {activeModal === "finance" && <FinanceForm horseNames={horseNames} onClose={() => setActiveModal(null)} onSave={(row) => addRow("finance", row)} />}
    </div>
  );
}

function WorkList({ rows, onDelete }) {
  if (!rows.length) return <p className="empty">No work records yet.</p>;

  return (
    <div className="list">
      {rows.map((item) => (
        <article className="record-card" key={item.id}>
          <div className="record-head">
            <div>
              <h3>{item.horse}</h3>
              <p>{item.date} · {item.type}</p>
            </div>
            {onDelete && (
              <button className="delete-button" onClick={() => onDelete(item.id)}>
                <Trash2 size={16} />
              </button>
            )}
          </div>
          <div className="record-grid">
            <span><b>Distance:</b> {item.distance || "-"}</span>
            <span><b>Time:</b> {item.time || "-"}</span>
            <span><b>Driver:</b> {item.driver || "-"}</span>
          </div>
          {item.notes && <p className="notes">{item.notes}</p>}
        </article>
      ))}
    </div>
  );
}

function RecordList({ rows, fields, onDelete }) {
  if (!rows.length) return <p className="empty">No records yet.</p>;

  return (
    <div className="list">
      {rows.map((item) => (
        <article className="record-card" key={item.id}>
          <div className="record-head">
            <h3>{item.horse || item.category || "Record"}</h3>
            {onDelete && (
              <button className="delete-button" onClick={() => onDelete(item.id)}>
                <Trash2 size={16} />
              </button>
            )}
          </div>
          <div className="detail-list">
            {fields.map((field) => (
              <div key={field}>
                <span>{field}</span>
                <strong>{String(item[field] ?? "-")}</strong>
              </div>
            ))}
          </div>
        </article>
      ))}
    </div>
  );
}

function WorkForm({ horseNames, onClose, onSave }) {
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    horse: horseNames[0] || "",
    type: "Jog",
    distance: "",
    time: "",
    driver: "",
    notes: ""
  });

  return (
    <Modal title="Add Work" onClose={onClose}>
      <div className="form-grid">
        <Field label="Date"><input type="date" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} /></Field>
        <Field label="Horse"><select value={form.horse} onChange={(event) => setForm({ ...form, horse: event.target.value })}>{horseNames.map((name) => <option key={name}>{name}</option>)}</select></Field>
        <Field label="Type"><input value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })} /></Field>
        <Field label="Distance"><input value={form.distance} onChange={(event) => setForm({ ...form, distance: event.target.value })} /></Field>
        <Field label="Time"><input value={form.time} onChange={(event) => setForm({ ...form, time: event.target.value })} /></Field>
        <Field label="Driver"><input value={form.driver} onChange={(event) => setForm({ ...form, driver: event.target.value })} /></Field>
        <Field label="Notes"><textarea value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} /></Field>
      </div>
      <button className="primary-button full" onClick={() => onSave(form)}>Save Work</button>
    </Modal>
  );
}

function TreatmentForm({ horseNames, onClose, onSave }) {
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    horse: horseNames[0] || "",
    treatment: "",
    vet: "",
    nextDue: "",
    notes: ""
  });

  return (
    <Modal title="Add Treatment" onClose={onClose}>
      <div className="form-grid">
        <Field label="Date"><input type="date" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} /></Field>
        <Field label="Horse"><select value={form.horse} onChange={(event) => setForm({ ...form, horse: event.target.value })}>{horseNames.map((name) => <option key={name}>{name}</option>)}</select></Field>
        <Field label="Treatment"><input value={form.treatment} onChange={(event) => setForm({ ...form, treatment: event.target.value })} /></Field>
        <Field label="Vet"><input value={form.vet} onChange={(event) => setForm({ ...form, vet: event.target.value })} /></Field>
        <Field label="Next Due"><input type="date" value={form.nextDue} onChange={(event) => setForm({ ...form, nextDue: event.target.value })} /></Field>
        <Field label="Notes"><textarea value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} /></Field>
      </div>
      <button className="primary-button full" onClick={() => onSave(form)}>Save Treatment</button>
    </Modal>
  );
}

function FeedForm({ horseNames, onClose, onSave }) {
  const [form, setForm] = useState({
    horse: horseNames[0] || "",
    morning: "",
    night: "",
    supplements: ""
  });

  return (
    <Modal title="Add Feed Program" onClose={onClose}>
      <div className="form-grid">
        <Field label="Horse"><select value={form.horse} onChange={(event) => setForm({ ...form, horse: event.target.value })}>{horseNames.map((name) => <option key={name}>{name}</option>)}</select></Field>
        <Field label="Morning"><textarea value={form.morning} onChange={(event) => setForm({ ...form, morning: event.target.value })} /></Field>
        <Field label="Night"><textarea value={form.night} onChange={(event) => setForm({ ...form, night: event.target.value })} /></Field>
        <Field label="Supplements"><textarea value={form.supplements} onChange={(event) => setForm({ ...form, supplements: event.target.value })} /></Field>
      </div>
      <button className="primary-button full" onClick={() => onSave(form)}>Save Feed</button>
    </Modal>
  );
}

function FinanceForm({ horseNames, onClose, onSave }) {
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    horse: horseNames[0] || "",
    type: "Expense",
    category: "",
    amount: "",
    notes: ""
  });

  function submit() {
    const numberAmount = Number(form.amount || 0);
    const signedAmount = form.type === "Expense" && numberAmount > 0 ? -numberAmount : numberAmount;
    onSave({ ...form, amount: signedAmount });
  }

  return (
    <Modal title="Add Finance Entry" onClose={onClose}>
      <div className="form-grid">
        <Field label="Date"><input type="date" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} /></Field>
        <Field label="Horse"><select value={form.horse} onChange={(event) => setForm({ ...form, horse: event.target.value })}>{horseNames.map((name) => <option key={name}>{name}</option>)}</select></Field>
        <Field label="Type"><select value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })}><option>Expense</option><option>Income</option></select></Field>
        <Field label="Category"><input value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} /></Field>
        <Field label="Amount"><input type="number" value={form.amount} onChange={(event) => setForm({ ...form, amount: event.target.value })} /></Field>
        <Field label="Notes"><textarea value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} /></Field>
      </div>
      <button className="primary-button full" onClick={submit}>Save Finance Entry</button>
    </Modal>
  );
}

createRoot(document.getElementById("root")).render(<App />);
