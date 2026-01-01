import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/componentDesignLibrary';
import { Button } from '@/componentDesignLibrary';
import { getRoles, assignUser, removeUser } from '../services/adminService';
import { useNotifications } from '@/contexts';

export const RolePickerModal: React.FC<{ open: boolean; onOpenChange: (v: boolean) => void; user: { id: string; email: string; name?: string }; onAssigned?: () => void }> = ({ open, onOpenChange, user, onAssigned }) => {
  const { showSuccess, showError } = useNotifications();
  const [roles, setRoles] = useState<Array<{ id: string; name: string; assigned?: boolean }>>([]);
  const [loading, setLoading] = useState(false);
  const [processingRoleId, setProcessingRoleId] = useState<string | null>(null);
  const [filter, setFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [confirmingRevokeRoleId, setConfirmingRevokeRoleId] = useState<string | null>(null);

  const loadRoles = async (p = page, q = filter) => {
    setLoading(true);
    try {
      const data = await getRoles(q || undefined, p, pageSize);
      const userIdLc = String(user.id).toLowerCase();
      setRoles((data.items || []).map((r: any) => ({ id: r.id, name: r.name, assigned: !!((r.userRoles && r.userRoles.some((ur: any) => String(ur.userId).toLowerCase() === userIdLc)) || (r.users && r.users.includes(userIdLc))) })));

      setTotal(data.total || 0);
    } catch (e: any) {
      console.error(e);
      showError('Failed to load roles', e?.message || String(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!open) return;
    setPage(1);
    setFilter('');
  }, [open]);

  useEffect(() => { loadRoles(page, filter); }, [user, page, filter]);

  const handleAssign = async (roleId: string) => {
    setProcessingRoleId(roleId);
    try {
      await assignUser(roleId, user.id);
      await loadRoles(page, filter);
      showSuccess('Role assigned', 'Role was successfully assigned to the user.');
      onAssigned?.();
    } catch (e: any) {
      console.error(e);
      showError('Failed to assign role', e?.message || String(e));
    } finally {
      setProcessingRoleId(null);
    }
  };

  const handleRevokeConfirmed = async (roleId: string) => {
    setProcessingRoleId(roleId);
    try {
      await removeUser(roleId, user.id);
      await loadRoles(page, filter);
      showSuccess('Role removed', 'Role was successfully removed from the user.');
      onAssigned?.();
      setConfirmingRevokeRoleId(null);
    } catch (e: any) {
      console.error(e);
      showError('Failed to remove role', e?.message || String(e));
    } finally {
      setProcessingRoleId(null);
    }
  };

  const filtered = roles.filter(r => r.name.toLowerCase().includes(filter.toLowerCase()));
  const totalPages = Math.max(1, Math.ceil((total || roles.length) / pageSize));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="dialog-content">
        <DialogHeader>
          <DialogTitle>Manage roles for {user.email}</DialogTitle>
        </DialogHeader>
        <div className="mt-2">
          <div className="mb-3 flex gap-2">
            <input className="input flex-1" placeholder="Filter roles" value={filter} onChange={e => { setFilter(e.target.value); setPage(1); }} />
            <div className="text-sm text-gray-500 self-center">Page {page} / {totalPages}</div>
          </div>

          {loading ? <div>Loading roles...</div> : (
            <div className="space-y-2 max-h-72 overflow-auto">
              {filtered.length === 0 ? <div className="text-sm text-gray-500">No roles match</div> : filtered.map(r => (
                <div key={r.id} className="flex items-center justify-between p-2 border rounded hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="font-medium">{r.name}</div>
                    {r.assigned && <div className="text-xs text-gray-600">(assigned)</div>}
                  </div>
                  <div className="flex items-center gap-2">
                    {r.assigned ? (
                      confirmingRevokeRoleId === r.id ? (
                        <>
                          <Button variant="destructive" onClick={() => handleRevokeConfirmed(r.id)} disabled={!!processingRoleId && processingRoleId !== r.id}>{processingRoleId === r.id ? 'Processing...' : 'Confirm'}</Button>
                          <Button variant="ghost" onClick={() => setConfirmingRevokeRoleId(null)}>Cancel</Button>
                        </>
                      ) : (
                        <Button variant="destructive" onClick={() => setConfirmingRevokeRoleId(r.id)} disabled={!!processingRoleId && processingRoleId !== r.id}>{processingRoleId === r.id ? 'Processing...' : 'Revoke'}</Button>
                      )
                    ) : (
                      <Button variant="primary" onClick={() => handleAssign(r.id)} disabled={!!processingRoleId && processingRoleId !== r.id}>{processingRoleId === r.id ? 'Processing...' : 'Assign'}</Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-3 flex items-center justify-between">
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Prev</Button>
            <Button variant="ghost" onClick={() => setPage(p => p + 1)} disabled={page >= totalPages}>Next</Button>
          </div>
          <div className="text-sm text-gray-500">{total || roles.length} roles</div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RolePickerModal;