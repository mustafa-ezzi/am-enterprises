import { useEffect, useState, type FormEvent } from "react";
import { AdminLayout } from "../../components/layout/AdminLayout";
import { DataTable } from "../../components/admin/DataTable";
import { PageMeta } from "../../components/PageMeta";
import { ErrorBlock, LoadingBlock } from "../../components/StatusBlocks";
import {
  EmptyState,
  Input,
  Modal,
  PillFilledButton,
  PillGhostButton,
  Tag,
} from "../../components/ui";
import { useToast } from "../../context/ToastContext";
import { adminApi, listAllCategories } from "../../lib/adminApi";
import type { Category } from "../../types/catalog";

export function AdminCategoriesPage() {
  const { push } = useToast();
  const [rows, setRows] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [sortOrder, setSortOrder] = useState("0");
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      setRows(await listAllCategories());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  function openCreate() {
    setEditing(null);
    setName("");
    setDescription("");
    setSortOrder("0");
    setIsActive(true);
    setOpen(true);
  }

  function openEdit(cat: Category) {
    setEditing(cat);
    setName(cat.name);
    setDescription(cat.description);
    setSortOrder(String(cat.sort_order));
    setIsActive(cat.is_active);
    setOpen(true);
  }

  async function onSave(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    const payload = {
      name: name.trim(),
      description: description.trim(),
      sort_order: Number(sortOrder) || 0,
      is_active: isActive,
    };
    try {
      if (editing) {
        await adminApi.updateCategory(editing.slug, payload);
        push("Category updated");
      } else {
        await adminApi.createCategory(payload);
        push("Category created");
      }
      setOpen(false);
      await load();
    } catch (err) {
      push(err instanceof Error ? err.message : "Save failed", "error");
    } finally {
      setSaving(false);
    }
  }

  async function remove(cat: Category) {
    if (!window.confirm(`Delete category ${cat.name}?`)) return;
    try {
      await adminApi.deleteCategory(cat.slug);
      push("Category deleted");
      await load();
    } catch (err) {
      push(err instanceof Error ? err.message : "Delete failed", "error");
    }
  }

  return (
    <AdminLayout
      title="Categories"
      subtitle="Organize the catalogue"
      actions={<PillFilledButton onClick={openCreate}>New category</PillFilledButton>}
    >
      <PageMeta title="Admin categories" />
      {loading ? <LoadingBlock /> : null}
      {error ? <ErrorBlock message={error} /> : null}

      {!loading && !error ? (
        <DataTable
          rows={rows}
          rowKey={(r) => r.id}
          empty={
            <EmptyState
              title="No categories"
              action={<PillFilledButton onClick={openCreate}>New category</PillFilledButton>}
            />
          }
          columns={[
            {
              key: "name",
              header: "Name",
              render: (r) => (
                <div>
                  <strong>{r.name}</strong>
                  <div style={{ color: "var(--color-pewter)" }}>{r.slug}</div>
                </div>
              ),
            },
            {
              key: "sort",
              header: "Sort",
              render: (r) => r.sort_order,
            },
            {
              key: "status",
              header: "Status",
              render: (r) => (
                <Tag tone={r.is_active ? "ink" : "muted"}>
                  {r.is_active ? "Active" : "Hidden"}
                </Tag>
              ),
            },
            {
              key: "actions",
              header: "",
              render: (r) => (
                <div style={{ display: "flex", gap: 8 }}>
                  <PillGhostButton onClick={() => openEdit(r)}>Edit</PillGhostButton>
                  <PillGhostButton onClick={() => void remove(r)}>Delete</PillGhostButton>
                </div>
              ),
            },
          ]}
        />
      ) : null}

      <Modal
        open={open}
        title={editing ? "Edit category" : "New category"}
        onClose={() => setOpen(false)}
        footer={
          <>
            <PillGhostButton type="button" onClick={() => setOpen(false)}>
              Cancel
            </PillGhostButton>
            <PillFilledButton
              type="button"
              disabled={saving}
              onClick={(e) => {
                e.preventDefault();
                void onSave(e);
              }}
            >
              {saving ? "Saving…" : "Save"}
            </PillFilledButton>
          </>
        }
      >
        <form onSubmit={onSave} style={{ display: "grid", gap: 14 }}>
          <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} required />
          <Input
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <Input
            label="Sort order"
            type="number"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          />
          <label className="text-body-sm" style={{ display: "flex", gap: 8 }}>
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
            />
            Active
          </label>
        </form>
      </Modal>
    </AdminLayout>
  );
}
