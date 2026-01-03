import React, { useEffect, useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/componentDesignLibrary';
import { getRoles, deleteRole, createRoleExport } from '../services/adminService';
import type { RoleDto } from '../types/roles';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '@/contexts';
import { useCan } from '@/contexts/RBACContext';
const RoleCreateModal = React.lazy(() => import('../components/RoleCreateModal').then(m => ({ default: m.RoleCreateModal })));


export const RolesList: React.FC = () => {
  const [roles, setRoles] = useState<RoleDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name?: string } | null>(null);
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotifications();
  const canCreate = useCan('admin:roles:create');
  const canUpdate = useCan('admin:roles:update');
  const canDelete = useCan('admin:roles:delete');
  const canExport = useCan('admin:roles:export');

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      try {
        const data = await getRoles(q || undefined, page, pageSize);
        if (!active) return;
        setRoles(data.items || []);
        setTotal(data.total || 0);
        // reset selection for current page
        setSelected({});
      } catch (e) {
        console.error(e);
        showError('Load failed', 'Could not load roles');
      } finally {
        setLoading(false);
      }
    })();
    return () => { active = false };
  }, [showError, q, page, pageSize]);

  const openCreate = () => setCreateOpen(true);
  const onCreated = (id: string) => { showSuccess('Created', 'Role created'); navigate(`/admin/roles/${id}`); };

  const confirmDelete = (id: string, name?: string) => { setDeleteTarget({ id, name }); setDeleteDialogOpen(true); };
  const handleDeleteConfirmed = async () => {
    if (!deleteTarget) return;
    setDeletingId(deleteTarget.id);
    try {
      await deleteRole(deleteTarget.id);
      setRoles(prev => prev.filter(r => r.id !== deleteTarget.id));
      showSuccess('Deleted', `${deleteTarget.name || 'Role'} deleted`);
    } catch (e) {
      console.error(e);
      showError('Delete failed', 'Could not delete role');
    } finally {
      setDeletingId(null);
      setDeleteDialogOpen(false);
      setDeleteTarget(null);
    }
  };

  const exportSelected = () => {
    const rows = roles
      .filter(r => selected[r.id])
      .map(r => ({
        id: r.id,
        name: r.name,
        description: r.description || '',
        permissions: r.permissions ? r.permissions.map(p => p.name).join('; ') : '',
        usersCount: r.userRoles ? r.userRoles.length : (r.userCount || 0),
      }));

    if (rows.length === 0) {
      showError('No selection', 'Please select at least one role to export');
      return;
    }

    import('../utils/csv').then(m => {
      const csv = m.jsonToCsv(rows, ['id', 'name', 'description', 'permissions', 'usersCount']);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `roles-export-${new Date().toISOString()}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    }).catch(e => {
      console.error(e);
      showError('Export failed', 'Could not generate CSV');
    });
  };

  return (
    <AppLayout title="Roles">
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Roles</h2>
          <div className="flex items-center gap-2">
            <input className="input" placeholder="Search roles" value={q} onChange={e => { setQ(e.target.value); setPage(1); }} />
            {canCreate && <Button onClick={openCreate} disabled={loading}>Create Role</Button>}
            {canExport && <Button onClick={exportSelected} disabled={loading}>Export CSV</Button>}
            {canExport && <Button onClick={async () => {
              try {
                const ids = Object.keys(selected).filter(k => selected[k]);
                const resp = await createRoleExport(ids.length ? ids : undefined, q || undefined);
                // Open the returned pre-signed URL (no auth header required)
                window.open(resp.url, '_blank');
              } catch (e) {
                console.error(e);
                showError('Export failed', 'Could not create export token');
              }
            }} disabled={loading}>Export (Server)</Button>}
          </div>
        </div>
        {loading ? <div>Loading...</div> : (
          <div className="bg-white shadow rounded overflow-hidden">
            <div className="w-full overflow-auto">
              <table className="w-full table-auto border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left p-3"><input type="checkbox" onChange={(e) => {
                      const checked = e.target.checked;
                      const newSel: Record<string, boolean> = {};
                      roles.forEach(r => newSel[r.id] = checked);
                      setSelected(newSel);
                    }} /></th>
                    <th className="text-left p-3">Name</th>
                    <th className="text-left p-3">Description</th>
                    <th className="text-left p-3">#Users</th>
                    <th className="text-left p-3">#Permissions</th>
                    <th className="text-left p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {roles.map(r => (
                    <tr key={r.id} className="border-t hover:bg-gray-50">
                      <td className="p-3"><input type="checkbox" checked={!!selected[r.id]} onChange={(e) => setSelected(prev => ({ ...prev, [r.id]: e.target.checked }))} /></td>
                      <td className="p-3">{r.name}</td>
                      <td className="p-3">{r.description}</td>
                      <td className="p-3">{(r.userRoles || []).length}</td>
                      <td className="p-3">{(r.permissions || r.rolePermissions || []).length}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          {canUpdate && <Button variant="ghost" onClick={() => navigate(`/admin/roles/${r.id}`)} disabled={!!deletingId}>Edit</Button>}
                          {canDelete && <Button variant="destructive" onClick={() => confirmDelete(r.id, r.name)} disabled={!!deletingId}> {deletingId === r.id ? 'Deleting...' : 'Delete'}</Button>}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pagination */}
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-600">{`Showing ${roles.length} of ${total} roles`}</div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Prev</Button>
            <div className="px-2">{page}</div>
            <Button variant="ghost" onClick={() => setPage(p => p + 1)} disabled={page * pageSize >= total}>Next</Button>
          </div>
        </div>

        {/* Create modal */}
        {createOpen && (
          <React.Suspense fallback={<div>Loading...</div>}>
            <RoleCreateModal open={createOpen} onOpenChange={setCreateOpen} onCreated={onCreated} />
          </React.Suspense>
        )}

        {/* Delete confirmation dialog */}
        {deleteDialogOpen && (
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="bg-white rounded shadow p-6 w-96">
              <h3 className="text-lg font-semibold">Delete role</h3>
              <p className="mt-2">Are you sure you want to delete <strong>{deleteTarget?.name}</strong>? This action cannot be undone.</p>
              <div className="mt-4 flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                <Button variant="destructive" onClick={handleDeleteConfirmed} disabled={!!deletingId}>{deletingId ? 'Deleting...' : 'Delete'}</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};
