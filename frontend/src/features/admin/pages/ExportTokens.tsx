import React, { useEffect, useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/componentDesignLibrary';
import { getExportTokens, revokeExportToken } from '../services/adminService';
import type { ExportTokenDto } from '../types/exports';
import { useNotifications } from '@/contexts';

export const ExportTokens: React.FC = () => {
  const [tokens, setTokens] = useState<ExportTokenDto[]>([]);
  const [loading, setLoading] = useState(true);
  const { showError, showSuccess } = useNotifications();

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      try {
        const data = await getExportTokens();
        if (!active) return;
        setTokens(data || []);
      } catch (e) {
        console.error(e);
        showError('Load failed', 'Could not load export tokens');
      } finally {
        setLoading(false);
      }
    })();
    return () => { active = false };
  }, [showError]);

  const handleRevoke = async (token: string) => {
    if (!confirm('Revoke this token? This prevents further downloads')) return;
    try {
      await revokeExportToken(token);
      setTokens(prev => prev.map(t => t.token === token ? { ...t, revoked: true } : t));
      showSuccess('Revoked', 'Token revoked');
    } catch (e) {
      console.error(e);
      showError('Revoke failed', 'Could not revoke token');
    }
  };

  return (
    <AppLayout title="Export Tokens">
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Export Tokens</h2>
        </div>

        {loading ? <div>Loading...</div> : (
          <div className="bg-white shadow rounded overflow-hidden">
            <div className="w-full overflow-auto">
              <table className="w-full table-auto border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left p-3">Token</th>
                    <th className="text-left p-3">Created</th>
                    <th className="text-left p-3">Expires</th>
                    <th className="text-left p-3">Used</th>
                    <th className="text-left p-3">Revoked</th>
                    <th className="text-left p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tokens.map(t => (
                    <tr key={t.token} className="border-t hover:bg-gray-50">
                      <td className="p-3 font-mono text-sm">{t.token}</td>
                      <td className="p-3">{new Date(t.createdAt).toLocaleString()}</td>
                      <td className="p-3">{new Date(t.expiresAt).toLocaleString()}</td>
                      <td className="p-3">{t.used ? 'Yes' : 'No'}</td>
                      <td className="p-3">{t.revoked ? 'Yes' : 'No'}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" onClick={() => window.open(`/api/v1/admin/exports/${t.token}`, '_blank')} disabled={t.used || t.revoked}>Download</Button>
                          <Button variant="destructive" onClick={() => handleRevoke(t.token)} disabled={t.used || t.revoked}>Revoke</Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default ExportTokens;
