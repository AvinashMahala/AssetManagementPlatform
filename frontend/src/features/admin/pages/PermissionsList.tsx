import React, { useEffect, useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { getPermissions } from '../services/adminService';
import type { PermissionDto } from '../types/roles';

export const PermissionsList: React.FC = () => {
  const [perms, setPerms] = useState<PermissionDto[]>([]);
  const [categories, setCategories] = useState<Array<{ id?: string | null; name?: string | null }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const p = await getPermissions();
        setPerms(p || []);

        // derive categories map
        const map = new Map<string, { id?: string | null; name?: string | null }>();
        p.forEach(pp => {
          const key = pp.categoryName || 'uncategorized';
          if (!map.has(key)) map.set(key, { id: pp.categoryId ?? null, name: key });
        });
        setCategories(Array.from(map.values()));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <AppLayout title="Permissions">
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-4">Permissions</h2>
        {loading ? (
          <div>Loading...</div>
        ) : (
          <div className="space-y-4">
            {categories.map(cat => (
              <div key={cat.name}>
                <h4 className="font-semibold mb-2">{cat.name}</h4>
                <div className="bg-white shadow rounded overflow-hidden">
                  <div className="w-full overflow-auto">
                    <table className="w-full table-auto border-collapse">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="text-left p-3">Name</th>
                          <th className="text-left p-3">Description</th>
                        </tr>
                      </thead>
                      <tbody>
                        {perms.filter(p => (p.categoryName || 'uncategorized') === (cat.name || 'uncategorized')).map(p => (
                          <tr key={p.id} className="border-t hover:bg-gray-50">
                            <td className="p-3 font-medium">{p.name}</td>
                            <td className="p-3 text-sm text-gray-600">{p.description}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default PermissionsList;