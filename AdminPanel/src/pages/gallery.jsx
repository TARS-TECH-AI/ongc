import React, { useState, useMemo, useRef, useEffect } from "react";
import { Image, Plus, Eye, Download, Trash2 } from "lucide-react";
import placeholder from "../assets/photo-placeholder.svg";

const sample = [
  {
    id: 1,
    title: "PM Meeting 2024",
    caption: "Meetings",
    date: "2024-01-15",
    src: placeholder,
  },
  {
    id: 2,
    title: "PM Meeting 2024",
    caption: "Meeting",
    date: "2024-01-15",
    src: placeholder,
  },
  {
    id: 3,
    title: "PM Meeting 2024",
    caption: "Meeting",
    date: "2024-01-15",
    src: placeholder,
  },
  {
    id: 4,
    title: "PM Meeting 2024",
    caption: "Meeting",
    date: "2024-01-15",
    src: placeholder,
  },
  {
    id: 5,
    title: "PM Meeting 2024",
    caption: "Meeting",
    date: "2024-01-15",
    src: placeholder,
  },
  {
    id: 6,
    title: "PM Meeting 2024",
    caption: "Meeting",
    date: "2024-01-15",
    src: placeholder,
  },
  {
    id: 7,
    title: "PM Meeting 2024",
    caption: "Meeting",
    date: "2024-01-15",
    src: placeholder,
  },
];

const Gallery = () => {
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem('gallery-items');
      return saved ? JSON.parse(saved) : sample;
    } catch {
      return sample;
    }
  });

  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({ title: '', caption: '' });
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [error, setError] = useState("");
  const fileRef = useRef(null);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const onSelectFile = (f) => {
    if (!f) return;
    if (!f.type.startsWith("image/"))
      return setError("Only JPG/PNG images allowed");
    if (f.size > 5 * 1024 * 1024) return setError("Max file size 5MB");

    setFile(f);
    setError("");

    // create data URL preview so we can persist image in localStorage
    const reader = new FileReader();
    reader.onload = (ev) => setFilePreview(ev.target.result);
    reader.readAsDataURL(f);
  };
  const onDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files[0]) onSelectFile(e.dataTransfer.files[0]);
  };
  const onDragOver = (e) => e.preventDefault();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((i) =>
      (i.title + i.caption + i.date).toLowerCase().includes(q)
    );
  }, [items, query]);

  const submit = async (e) => {
    e && e.preventDefault();
    if (!file) return setError("Please select an image");
    setUploading(true);

    try {
      // Attempt real upload
      const API =
        import.meta.env.VITE_API_URL ||
        import.meta.env.VITE_API_BASE ||
        "https://ongc-q48j.vercel.app/api";
      const fd = new FormData();
      fd.append("image", file);
      fd.append("title", form.title);
      fd.append("caption", form.caption);

      const res = await fetch(`${API}/gallery`, { method: "POST", body: fd });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json().catch(() => ({}));
      const newItem = {
        id: data.id || Date.now(),
        title: data.title || form.title || file.name,
        caption: data.caption || form.caption || "",
        date: data.date || new Date().toLocaleDateString(),
        src: data.url || filePreview,
      };
      const updated = [newItem, ...items];
      setItems(updated);
      localStorage.setItem('gallery-items', JSON.stringify(updated));
      setIsOpen(false);
      setForm({ title: "", caption: "" });
      setFile(null);
      setFilePreview(null);
    } catch (err) {
      // fallback: simulate upload locally
      const newItem = {
        id: Date.now(),
        title: form.title || file.name,
        caption: form.caption || "",
        date: new Date().toLocaleDateString(),
        src: filePreview,
      };
      const updated = [newItem, ...items];
      setItems(updated);
      localStorage.setItem('gallery-items', JSON.stringify(updated));
      setIsOpen(false);
      setForm({ title: "", caption: "" });
      setFile(null);
      setFilePreview(null);
    } finally {
      setUploading(false);
    }
  };

  const onDelete = (id) => {
    if (!confirm("Delete image?")) return;
    const updated = items.filter((i) => i.id !== id);
    setItems(updated);
    try { localStorage.setItem('gallery-items', JSON.stringify(updated)); } catch {}
  };
  const onDownload = (item) => {
    const a = document.createElement("a");
    a.href = item.src;
    a.download = item.title;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };
  const onView = (item) => {
    window.open(item.src, "_blank");
  };

  return (
    <div className="min-h-screen bg-slate-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-4 gap-4">
          <div>
            <h1 className="font-bold text-xl">Manage Gallery Images</h1>
            <span className="font-slate-300">
              Upload and organize gallery images
            </span>
          </div>

          <button
            onClick={() => setIsOpen(true)}
            className="bg-slate-900 text-white px-4 py-2 rounded inline-flex items-center gap-2"
          >
            <Plus size={16} /> Upload Image
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {filtered.map((i) => (
            <div
              key={i.id}
              className="bg-white rounded-lg shadow overflow-hidden"
            >
              <div className="h-36 bg-slate-100 flex items-center justify-center">
                <img
                  src={i.src}
                  alt={i.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-3 flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-slate-800">
                    {i.title}
                  </div>
                  <div className="text-xs text-slate-500">{i.caption}</div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="text-xs text-slate-400">{i.date}</div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onView(i)}
                      className="text-slate-700"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={() => onDownload(i)}
                      className="text-slate-700"
                    >
                      <Download size={16} />
                    </button>
                    <button
                      onClick={() => onDelete(i.id)}
                      className="text-rose-600"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/50 cursor-pointer"
            onClick={() => !uploading && setIsOpen(false)}
          />

          <form
            onSubmit={submit}
            className="relative z-50 w-full max-w-2xl bg-white rounded-lg shadow-lg p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-lg font-semibold">Upload Image</h2>
              <button
                type="button"
                onClick={() => !uploading && setIsOpen(false)}
                className="text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Image Title</label>
                <input
                  required
                  value={form.title}
                  onChange={(e) =>
                    setForm((s) => ({ ...s, title: e.target.value }))
                  }
                  placeholder="Enter title"
                  className="w-full mt-2 border rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Upload Image</label>
                <div
                  onDrop={onDrop}
                  onDragOver={onDragOver}
                  onClick={() => fileRef.current?.click()}
                  className="mt-2 border-2 border-dashed border-slate-300 rounded p-6 text-center cursor-pointer"
                >
                  {!file ? (
                    <>
                      <div className="text-2xl mb-2">⤴</div>
                      <div className="text-sm text-slate-500">
                        Click to upload
                        <br />
                        JPG, PNG (Max 5MB)
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center gap-3 justify-center">
                      <img
                        src={filePreview}
                        alt="preview"
                        className="w-20 h-20 object-cover rounded"
                      />
                      <div className="text-sm text-slate-700">
                        {file.name} • {(file.size / 1024 / 1024).toFixed(2)} MB
                      </div>
                    </div>
                  )}
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => onSelectFile(e.target.files[0])}
                    className="hidden"
                  />
                </div>
                {error && (
                  <div className="text-sm text-rose-600 mt-2">{error}</div>
                )}
              </div>

              <div className="flex items-center  gap-3 mt-4">
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-8 py-2 bg-slate-900 text-white rounded"
                >
                  {uploading ? "Uploading..." : "Upload Image"}
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  disabled={uploading}
                  className="px-8 py-2 border rounded"
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Gallery;
