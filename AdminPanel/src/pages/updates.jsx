import React, { useState, useEffect } from "react";
import { Bell, Plus, Trash2, Edit2, Calendar, MapPin, X } from "lucide-react";

const API =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE ||
  "https://ongc-q48j.vercel.app/api";

const formatTime = (time) => {
  if (!time) return '';
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${displayHour}:${minutes} ${ampm}`;
};

const Updates = () => {
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUpdate, setEditingUpdate] = useState(null);
  const [form, setForm] = useState({
    title: "",
    venue: "",
    description: "",
    postedDate: new Date().toISOString().split("T")[0],
    date: new Date().toISOString().split("T")[0],
    hour: "",
    minute: "",
    ampm: "AM",
  });

  useEffect(() => {
    loadUpdates();
  }, []);

  const loadUpdates = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/updates`);
      if (res.ok) {
        const data = await res.json();
        setUpdates(data.updates || []);
      }
    } catch (err) {
      console.error("Failed to load updates:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.title || !form.venue || !form.date) {
      alert("Please fill all fields");
      return;
    }

    // Convert 12-hour time to 24-hour format
    let time = "";
    if (form.hour && form.minute) {
      let hour24 = parseInt(form.hour, 10);
      if (form.ampm === "PM" && hour24 !== 12) {
        hour24 += 12;
      } else if (form.ampm === "AM" && hour24 === 12) {
        hour24 = 0;
      }
      time = `${String(hour24).padStart(2, '0')}:${form.minute}`;
    }

    const submitData = {
      title: form.title,
      venue: form.venue,
      description: form.description,
      postedDate: form.postedDate,
      date: form.date,
      time: time,
    };

    console.log('Submitting update with data:', submitData);

    try {
      const token = sessionStorage.getItem("admin-token");
      const url = editingUpdate
        ? `${API}/updates/${editingUpdate.id}`
        : `${API}/updates`;
      const method = editingUpdate ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(submitData),
      });

      if (res.ok) {
        alert(editingUpdate ? "Update modified successfully" : "Update added successfully");
        setIsModalOpen(false);
        setEditingUpdate(null);
        setForm({ title: "", venue: "", description: "", postedDate: new Date().toISOString().split("T")[0], date: new Date().toISOString().split("T")[0], hour: "", minute: "", ampm: "AM" });
        loadUpdates();
      } else {
        const err = await res.json();
        alert(err.message || "Failed to save update");
      }
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const handleEdit = (update) => {
    setEditingUpdate(update);
    
    // Parse time back to 12-hour format
    let hour = "";
    let minute = "";
    let ampm = "AM";
    
    if (update.time) {
      const [h, m] = update.time.split(':');
      const hour24 = parseInt(h, 10);
      
      if (hour24 === 0) {
        hour = "12";
        ampm = "AM";
      } else if (hour24 === 12) {
        hour = "12";
        ampm = "PM";
      } else if (hour24 > 12) {
        hour = String(hour24 - 12);
        ampm = "PM";
      } else {
        hour = String(hour24);
        ampm = "AM";
      }
      minute = m;
    }
    
    setForm({
      title: update.title,
      venue: update.venue,
      description: update.description || '',
      postedDate: update.postedDate ? new Date(update.postedDate).toISOString().split("T")[0] : (update.createdAt ? new Date(update.createdAt).toISOString().split("T")[0] : new Date().toISOString().split("T")[0]),
      date: new Date(update.date).toISOString().split("T")[0],
      hour: hour,
      minute: minute,
      ampm: ampm,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this update?")) return;

    try {
      const token = sessionStorage.getItem("admin-token");
      const res = await fetch(`${API}/updates/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        alert("Update deleted successfully");
        loadUpdates();
      } else {
        alert("Failed to delete update");
      }
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const openAddModal = () => {
    setEditingUpdate(null);
    setForm({ title: "", venue: "", description: "", postedDate: new Date().toISOString().split("T")[0], date: new Date().toISOString().split("T")[0], hour: "", minute: "", ampm: "AM" });
    setIsModalOpen(true);
  };

  const upcomingUpdates = updates.filter((u) => u.isUpcoming);
  const pastUpdates = updates.filter((u) => !u.isUpcoming);

  return (
    <div className="min-h-screen bg-slate-50 py-6">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Important Updates</h1>
            <p className="text-slate-500 text-sm">Manage announcements and events</p>
          </div>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 bg-[#0C2E50] text-white px-4 py-2 rounded-lg hover:bg-[#0a2540] transition"
          >
            <Plus size={18} />
            Add Update
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-sm border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Bell className="text-blue-600" size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{updates.length}</p>
                <p className="text-sm text-slate-500">Total Updates</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Calendar className="text-orange-600" size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{upcomingUpdates.length}</p>
                <p className="text-sm text-slate-500">Upcoming</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <Calendar className="text-gray-600" size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{pastUpdates.length}</p>
                <p className="text-sm text-slate-500">Past Events</p>
              </div>
            </div>
          </div>
        </div>

        {/* Updates List */}
        {loading ? (
          <p className="text-center text-slate-500 py-10">Loading updates...</p>
        ) : updates.length === 0 ? (
          <div className="bg-white rounded-xl p-10 text-center shadow-sm border">
            <Bell className="mx-auto text-slate-300 mb-3" size={48} />
            <p className="text-slate-500">No updates yet. Add your first update!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Upcoming Events */}
            {upcomingUpdates.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                  Upcoming Events
                </h2>
                <div className="space-y-3">
                  {upcomingUpdates.map((update) => (
                    <UpdateCard
                      key={update.id}
                      update={update}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      isUpcoming={true}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Past Events */}
            {pastUpdates.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                  Past Events
                </h2>
                <div className="space-y-3">
                  {pastUpdates.map((update) => (
                    <UpdateCard
                      key={update.id}
                      update={update}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      isUpcoming={false}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-800">
                  {editingUpdate ? "Edit Update" : "Add New Update"}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Posted Date
                  </label>
                  <input
                    type="date"
                    value={form.postedDate}
                    onChange={(e) => setForm({ ...form, postedDate: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Meeting Date
                  </label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Meeting Time (Optional)
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <select
                      value={form.hour}
                      onChange={(e) => setForm({ ...form, hour: e.target.value })}
                      className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Hour</option>
                      {[...Array(12)].map((_, i) => (
                        <option key={i + 1} value={i + 1}>{i + 1}</option>
                      ))}
                    </select>
                    <select
                      value={form.minute}
                      onChange={(e) => setForm({ ...form, minute: e.target.value })}
                      className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Min</option>
                      {["00", "15", "30", "45"].map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                    <select
                      value={form.ampm}
                      onChange={(e) => setForm({ ...form, ampm: e.target.value })}
                      className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="AM">AM</option>
                      <option value="PM">PM</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="e.g., Notice for 42nd Annual General Meeting"
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Venue
                  </label>
                  <textarea
                    value={form.venue}
                    onChange={(e) => setForm({ ...form, venue: e.target.value })}
                    placeholder="e.g., ONGC Bhawan, New Delhi"
                    rows={2}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Detailed description of the update or event..."
                    rows={4}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-4 py-2 border rounded-lg text-slate-600 hover:bg-slate-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-[#0C2E50] text-white rounded-lg hover:bg-[#0a2540] transition"
                  >
                    {editingUpdate ? "Save Changes" : "Add Update"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const UpdateCard = ({ update, onEdit, onDelete, isUpcoming }) => (
  <div className={`bg-white rounded-xl p-4 shadow-sm border flex items-start gap-4 ${isUpcoming ? 'border-l-4 border-l-orange-400' : ''}`}>
    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isUpcoming ? 'bg-orange-100' : 'bg-gray-100'}`}>
      <Bell className={isUpcoming ? 'text-orange-600' : 'text-gray-500'} size={18} />
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2 mb-1">
        {isUpcoming && (
          <span className="text-xs font-semibold bg-orange-400 text-white px-2 py-0.5 rounded">
            Upcoming
          </span>
        )}
        <span className="text-xs text-slate-500 flex items-center gap-1">
          <Calendar size={12} />
          Posted: {new Date(update.postedDate || update.createdAt || update.date).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </span>
      </div>
      <h4 className="font-semibold text-slate-800 text-sm">{update.title}</h4>
      <p className="text-xs text-slate-500 mt-1 flex items-start gap-1">
        <MapPin size={12} className="shrink-0 mt-0.5" />
        {update.venue}
      </p>
      <p className="text-xs font-bold text-slate-700 mt-1">
        Meeting: {new Date(update.date).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })}
        {update.time && ` • ${formatTime(update.time)}`}
      </p>
    </div>
    <div className="flex gap-2 shrink-0">
      <button
        onClick={() => onEdit(update)}
        className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
        title="Edit"
      >
        <Edit2 size={16} />
      </button>
      <button
        onClick={() => onDelete(update.id)}
        className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
        title="Delete"
      >
        <Trash2 size={16} />
      </button>
    </div>
  </div>
);

export default Updates;
