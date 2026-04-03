'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Plus, Pencil, Trash2, Save, X, GripVertical } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  sort_order: number | null;
  created_at: string;
  question_count?: number;
}

export default function AdminCategoriesClient() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    slug: '',
    description: '',
    icon: '',
    color: '#3b82f6',
    sort_order: 0,
  });

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true });

    if (data) {
      const enriched = await Promise.all(
        data.map(async (cat) => {
          const { count } = await supabase
            .from('questions')
            .select('*', { count: 'exact', head: true })
            .eq('category_id', cat.id);
          return { ...cat, question_count: count ?? 0 };
        }),
      );
      setCategories(enriched);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const startEdit = (cat: Category) => {
    setEditing(cat.id);
    setCreating(false);
    setForm({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || '',
      icon: cat.icon || '',
      color: cat.color || '#3b82f6',
      sort_order: cat.sort_order ?? 0,
    });
  };

  const startCreate = () => {
    setCreating(true);
    setEditing(null);
    setForm({
      name: '',
      slug: '',
      description: '',
      icon: '',
      color: '#3b82f6',
      sort_order: categories.length,
    });
  };

  const cancel = () => {
    setEditing(null);
    setCreating(false);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setActionLoading(true);
    const supabase = createClient();
    const slug =
      form.slug.trim() ||
      form.name
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');

    if (creating) {
      const { error } = await supabase.from('categories').insert({
        name: form.name.trim(),
        slug,
        description: form.description.trim() || null,
        icon: form.icon.trim() || null,
        color: form.color || null,
        sort_order: form.sort_order,
      });
      if (!error) {
        setCreating(false);
        fetchCategories();
      }
    } else if (editing) {
      const { error } = await supabase
        .from('categories')
        .update({
          name: form.name.trim(),
          slug,
          description: form.description.trim() || null,
          icon: form.icon.trim() || null,
          color: form.color || null,
          sort_order: form.sort_order,
        })
        .eq('id', editing);
      if (!error) {
        setEditing(null);
        fetchCategories();
      }
    }
    setActionLoading(false);
  };

  const handleDelete = async (id: string) => {
    const cat = categories.find((c) => c.id === id);
    if (!cat) return;
    if (
      !confirm(
        `Xóa danh mục "${cat.name}"? ${cat.question_count ? `${cat.question_count} câu hỏi liên quan sẽ mất liên kết danh mục.` : ''}`,
      )
    )
      return;
    const supabase = createClient();
    // Unlink questions before deleting
    await supabase
      .from('questions')
      .update({ category_id: null })
      .eq('category_id', id);
    await supabase.from('categories').delete().eq('id', id);
    setCategories((prev) => prev.filter((c) => c.id !== id));
  };

  const inputClass =
    'w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-orange-500/50';

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Quản lý danh mục</h1>
          <p className="mt-1 text-sm text-zinc-400">
            {categories.length} danh mục
          </p>
        </div>
        <button
          onClick={startCreate}
          className="inline-flex items-center gap-2 rounded-xl bg-linear-to-r from-orange-500 to-red-500 px-4 py-2 text-sm font-medium text-white transition-transform hover:scale-105"
        >
          <Plus className="h-4 w-4" /> Thêm danh mục
        </button>
      </div>

      {/* Create / Edit Form */}
      <AnimatePresence>
        {(creating || editing) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 overflow-hidden rounded-2xl border border-orange-500/30 bg-orange-500/5 p-5"
          >
            <h3 className="mb-4 text-sm font-semibold text-white">
              {creating ? 'Tạo danh mục mới' : 'Chỉnh sửa danh mục'}
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className="mb-1 block text-xs text-zinc-400">
                  Tên *
                </label>
                <input
                  className={inputClass}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="React"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-zinc-400">Slug</label>
                <input
                  className={inputClass}
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  placeholder="Tự tạo từ tên nếu bỏ trống"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-zinc-400">
                  Mô tả
                </label>
                <input
                  className={inputClass}
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  placeholder="Câu hỏi về React"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-zinc-400">
                  Icon (emoji hoặc text)
                </label>
                <input
                  className={inputClass}
                  value={form.icon}
                  onChange={(e) => setForm({ ...form, icon: e.target.value })}
                  placeholder="⚛️"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-zinc-400">
                  Màu sắc
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={form.color}
                    onChange={(e) =>
                      setForm({ ...form, color: e.target.value })
                    }
                    className="h-9 w-12 cursor-pointer rounded border-0 bg-transparent"
                  />
                  <input
                    className={inputClass}
                    value={form.color}
                    onChange={(e) =>
                      setForm({ ...form, color: e.target.value })
                    }
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs text-zinc-400">
                  Thứ tự
                </label>
                <input
                  type="number"
                  className={inputClass}
                  value={form.sort_order}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      sort_order: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <button
                onClick={handleSave}
                disabled={actionLoading || !form.name.trim()}
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600 disabled:opacity-50"
              >
                <Save className="h-4 w-4" /> Lưu
              </button>
              <button
                onClick={cancel}
                className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/20"
              >
                <X className="h-4 w-4" /> Hủy
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Categories List */}
      <div className="space-y-2">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/20 border-t-orange-500" />
          </div>
        ) : categories.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/3 py-16 text-center">
            <p className="text-sm text-zinc-500">Chưa có danh mục nào</p>
            <button
              onClick={startCreate}
              className="mt-3 text-sm text-orange-400 hover:underline"
            >
              Tạo danh mục đầu tiên →
            </button>
          </div>
        ) : (
          categories.map((cat) => (
            <motion.div
              key={cat.id}
              layout
              className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/3 px-5 py-4 transition-colors hover:bg-white/5"
            >
              <GripVertical className="h-4 w-4 shrink-0 text-zinc-600" />
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg"
                style={{ backgroundColor: (cat.color || '#3b82f6') + '20' }}
              >
                {cat.icon || cat.name[0]}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-white">
                    {cat.name}
                  </h3>
                  <span className="rounded bg-white/5 px-1.5 py-0.5 text-[10px] text-zinc-400">
                    {cat.slug}
                  </span>
                </div>
                {cat.description && (
                  <p className="mt-0.5 text-xs text-zinc-400">
                    {cat.description}
                  </p>
                )}
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-white">
                  {cat.question_count}
                </p>
                <p className="text-[10px] text-zinc-500">câu hỏi</p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => startEdit(cat)}
                  className="rounded-lg p-1.5 text-zinc-400 hover:bg-white/5 hover:text-white"
                  title="Sửa"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(cat.id)}
                  className="rounded-lg p-1.5 text-red-400 hover:bg-red-500/10"
                  title="Xóa"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
