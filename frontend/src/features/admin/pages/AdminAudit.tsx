import React, { useEffect, useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';

export const AdminAudit: React.FC = () => {
  const [actor, setActor] = useState('');
  const [action, setAction] = useState('');
  const [resourceType, setResourceType] = useState('');
  const [items, setItems] = useState<Array<any>>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const qs = `?actor=${encodeURIComponent(actor)}&action=${encodeURIComponent(action)}&resourceType=${encodeURIComponent(resourceType)}`;
      const r = await apiClient.get(`/api/v1/admin/audit${qs}`);
      if (r.success && r.data) setItems(r.data.items || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <AppLayout title="Audit">
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-4">Audit</h2>

        <div className="flex gap-2 mb-4">
          <input className="input" placeholder="Actor" value={actor} onChange={e => setActor(e.target.value)} />
          <input className="input" placeholder="Action" value={action} onChange={e => setAction(e.target.value)} />
          <input className="input" placeholder="ResourceType" value={resourceType} onChange={e => setResourceType(e.target.value)} />
          <button className="btn" onClick={load} disabled={loading}>{loading ? 'Loading...' : 'Filter'}</button>
        </div>

        <div className="bg-white shadow rounded overflow-hidden">
          <div className="w-full overflow-auto">
            <table className="w-full table-auto border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left p-3">Actor</th>
                  <th className="text-left p-3">Action</th>
                  <th className="text-left p-3">Resource</th>
                  <th className="text-left p-3">Data</th>
                  <th className="text-left p-3">When</th>
                </tr>
              </thead>
              <tbody>
                {items.map((it: any) => (
                  <tr key={it.id} className="border-t hover:bg-gray-50">
                    <td className="p-3">{it.actor}</td>
                    <td className="p-3">{it.action}</td>
                    <td className="p-3">{it.resourceType} {it.resourceId}</td>
                    <td className="p-3 text-sm text-gray-600"><pre className="whitespace-pre-wrap">{JSON.stringify(it.data)}</pre></td>
                    <td className="p-3">{new Date(it.occurredAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default AdminAudit;