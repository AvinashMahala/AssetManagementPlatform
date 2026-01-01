import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { getRole, getPermissions, setRolePermissions, assignUser, removeUser } from '../services/adminService';
import { Button } from '@/componentDesignLibrary';
import type { RoleDto, PermissionDto } from '../types/roles';
import { useNotifications } from '@/contexts';
import PermissionSearchList from '../components/PermissionSearchList';
import UserPickerModal from '../components/UserPickerModal';

export const RoleEdit: React.FC = () => {
  const { id } = useParams();
  const [role, setRole] = useState<RoleDto | null>(null);
  const [perms, setPerms] = useState<PermissionDto[]>([]);
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const { showSuccess, showError } = useNotifications();

  useEffect(() => {
    (async () => {
      if (!id) return;
      try {
        const [r, p] = await Promise.all([getRole(id), getPermissions()]);
        setRole(r);
        setPerms(p);
        const map: Record<string, boolean> = {};
        const rolePermIds = (r.rolePermissions || []).map(rp => rp.permissionId);
        p.forEach(pp => (map[pp.id] = rolePermIds.includes(pp.id)));
        setChecked(map);
      } catch (e) {
        console.error(e);
        showError('Load failed', 'Could not load role data');
      }
      setLoading(false);
    })();
  }, [id, showError]);

  const toggle = (pid: string) => {
    setChecked(prev => ({ ...prev, [pid]: !prev[pid] }));
  };

  const [savingPerms, setSavingPerms] = useState(false);

  const savePerms = async () => {
    if (!id) return;
    const ids = Object.entries(checked).filter(([_, v]) => v).map(([k]) => k);
    setSavingPerms(true);
    try {
      await setRolePermissions(id, ids);
      showSuccess('Saved', 'Permissions saved');
    } catch (e) {
      console.error(e);
      showError('Save failed', 'Could not save permissions');
    } finally {
      setSavingPerms(false);
    }
  };

  const [userPickerOpen, setUserPickerOpen] = React.useState(false);

  const handleSelectUser = async (userId: string) => {
    if (!id) return;
    try {
      await assignUser(id, userId);
      showSuccess('Assigned', 'User assigned to role');
      const r = await getRole(id);
      setRole(r);
    } catch (e) {
      console.error(e);
      showError('Assign failed', 'Could not assign user');
    }
  };

  const handleRemoveUser = async (userId: string) => {
    if (!id) return;
    const ok = window.confirm('Remove user from role?');
    if (!ok) return;
    try {
      await removeUser(id, userId);
      showSuccess('Removed', 'User removed from role');
      const r = await getRole(id);
      setRole(r);
    } catch (e) {
      console.error(e);
      showError('Remove failed', 'Could not remove user');
    }
  };

  return (
    <AppLayout title={role?.name || 'Role'}>
      <div className="p-6">
        {loading ? <div>Loading...</div> : (
          <div>
            <h3 className="text-lg font-medium mb-2">{role?.name}</h3>
            <p className="mb-4">{role?.description}</p>

            <div className="mb-4">
              <h4 className="font-semibold">Permissions</h4>
              <div className="mt-2">
                <PermissionSearchList permissions={perms} checked={checked} onToggle={toggle} />
              </div>
              <div className="mt-3">
                <Button onClick={savePerms} disabled={savingPerms}>{savingPerms ? 'Saving...' : 'Save Permissions'}</Button>
              </div>
            </div>

            <div>
              <h4 className="font-semibold">Users</h4>
              <div className="mt-2">
                <Button onClick={() => setUserPickerOpen(true)}>Assign User</Button>
                <div className="mt-2 space-y-2">
                  {(role?.userRoles || []).map((ur) => (
                    <div key={`${ur.userId}`} className="flex items-center gap-2 py-1 justify-between">
                      <div className="text-sm text-gray-800">{ur.userId}</div>
                      <div>
                        <Button variant="ghost" onClick={() => handleRemoveUser(ur.userId)}>Remove</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {userPickerOpen && (
              <React.Suspense fallback={<div>Loading...</div>}>
                <UserPickerModal open={userPickerOpen} onOpenChange={setUserPickerOpen} onSelect={handleSelectUser} />
              </React.Suspense>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
};