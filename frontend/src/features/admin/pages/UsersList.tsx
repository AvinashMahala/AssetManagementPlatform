import React, { useEffect, useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { getUsers, getRoles } from '../services/adminService';
import RolePickerModal from '../components/RolePickerModal';

export const UsersList: React.FC = () => {
  const [q, setQ] = useState('');
  const [users, setUsers] = useState<Array<{ id: string; email: string; username?: string; name?: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [rolePickerOpen, setRolePickerOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<{ id: string; email: string; name?: string; username?: string } | null>(null);
  const [roles, setRoles] = useState<Array<{ id: string; name: string; userRoles?: Array<{ userId: string }> }>>([]);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      try {
        const data = await getUsers(q || undefined);
        if (active) setUsers(data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
    return () => { active = false };
  }, [q]);

  // fetch roles once to display assigned roles inline (normalize both `userRoles` and `users` shapes)
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await getRoles(undefined, 1, 200);
        if (active) {
          const normalized = (data.items || []).map((r: any) => {
            const usersFromUserRoles = r.userRoles ? r.userRoles.map((ur: any) => ur.userId) : undefined;
            const usersArray = r.users || usersFromUserRoles || [];
            return {
              ...r,
              users: usersArray,
              userRoles: r.userRoles || (usersArray.length ? usersArray.map((u: any) => ({ userId: u })) : []),
            } as any;
          });
          setRoles(normalized);
        }
      } catch (e) {
        console.error(e);
      }
    })();
    return () => { active = false };
  }, []);

  const getAssignedRoleNames = (userId: string) => {
    const uid = String(userId).toLowerCase();
    return roles.filter(r => (r.userRoles && r.userRoles.some((ur: any) => String(ur.userId).toLowerCase() === uid)) || (r.users && r.users.includes(uid))).map(r => r.name);
  };

  return (
    <AppLayout title="Users">
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-4">Users</h2>
        <div className="mb-4">
          <input className="input w-full" placeholder="Search users" value={q} onChange={e => setQ(e.target.value)} />
        </div>

        {loading ? <div>Searching...</div> : (
          <div className="bg-white shadow rounded overflow-hidden">
            <div className="w-full overflow-auto">
              <table className="w-full table-auto border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left p-3">Email</th>
                    <th className="text-left p-3">Name</th>
                    <th className="text-left p-3">Roles</th>
                    <th className="text-left p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => {
                    const assigned = getAssignedRoleNames(u.id);
                    return (
                      <tr key={u.id} className="border-t hover:bg-gray-50">
                        <td className="p-3">{u.email}</td>
                        <td className="p-3">{u.name || u.username}</td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            {assigned.length === 0 ? <span className="text-sm text-gray-500">No roles</span> : (
                              <>
                                {assigned.slice(0,3).map(name => (
                                  <span key={name} className="px-2 py-1 text-xs bg-gray-100 rounded">{name}</span>
                                ))}
                                {assigned.length > 3 && <span className="text-xs text-gray-500">+{assigned.length - 3}</span>}
                              </>
                            )}
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <button className="btn btn-sm" onClick={() => { setSelectedUser(u); setRolePickerOpen(true); }}>Manage Roles</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Role picker modal */}
        {selectedUser && (
          <RolePickerModal open={rolePickerOpen} onOpenChange={(v) => setRolePickerOpen(v)} user={selectedUser} onAssigned={() => { const refreshRoles = async () => { try { const data = await getRoles(undefined, 1, 200); setRoles(data.items || []); } catch (e) { console.error(e); } }; refreshRoles(); setQ(''); }} />
        )}

      </div>
    </AppLayout>
  );
};

export default UsersList;