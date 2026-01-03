import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/componentDesignLibrary';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/componentDesignLibrary';
import { Button } from '@/componentDesignLibrary';
import { Trash2, Smartphone, Globe } from 'lucide-react';
import { authService } from '@/features/auth/services/authService';
import type { SessionInfo } from '@/features/auth/types/auth';
import { postSessionRevoked, postLogoutAll } from '@/lib/authBroadcast';
import { useAuthContext } from '@/contexts/AuthContext';

export const SessionsPanel: React.FC = () => {
  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const { logout } = useAuthContext();

  const load = async () => {
    setLoading(true);
    try {
      const res = await authService.getSessions();
      setSessions(res.sessions || []);
    } catch (err) {
      console.error('Failed to load sessions', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleRevoke = async (id: string) => {
    if (!window.confirm('Revoke this session? This will log out the device.')) return;
    try {
      await authService.revokeSession(id);
      // Notify other tabs
      postSessionRevoked(id);
      // If we revoked our own session, also clear local state by calling logout
      const cur = sessionStorage.getItem('sessionId');
      if (cur && cur === id) {
        await logout();
      }
      await load();
    } catch (err) {
      console.error('Revoke failed', err);
      alert('Failed to revoke session');
    }
  };

  const handleLogoutAll = async () => {
    if (!window.confirm('Log out of all sessions (including this one)?')) return;
    try {
      await authService.logoutAll();
      postLogoutAll();
      await logout();
    } catch (err) {
      console.error('Logout all failed', err);
      alert('Failed to logout all sessions');
    }
  };

  const currentId = sessionStorage.getItem('sessionId');

  return (
    <Card className="shadow-xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
      <CardHeader className="pb-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
            <Smartphone className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
          </div>
          <div>
            <CardTitle className="text-lg">Active Sessions</CardTitle>
            <CardDescription className="text-sm">View and revoke devices that are currently signed in.</CardDescription>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={handleLogoutAll} className="flex items-center space-x-2">
            <Globe className="h-4 w-4" />
            <span>Logout All</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {!loading && sessions.length === 0 && (
          <div className="text-sm text-gray-500">No active sessions found.</div>
        )}

        {!loading && sessions.length > 0 && (
          <div className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Device</TableHead>
                  <TableHead>IP</TableHead>
                  <TableHead>Issued</TableHead>
                  <TableHead>Last Used</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessions.map(s => (
                  <TableRow key={s.id}>
                    <TableCell className="w-48 truncate">{s.deviceInfo || 'Unknown'}</TableCell>
                    <TableCell className="w-36">{s.ipAddress || '—'}</TableCell>
                    <TableCell>{new Date(s.issuedAt).toLocaleString()}</TableCell>
                    <TableCell>{s.lastUsedAt ? new Date(s.lastUsedAt).toLocaleString() : '—'}</TableCell>
                    <TableCell>{new Date(s.expiresAt).toLocaleString()}</TableCell>
                    <TableCell>{s.revoked ? 'Revoked' : (s.id === currentId ? 'This device' : 'Active')}</TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="destructive" onClick={() => handleRevoke(s.id)} disabled={s.revoked}>
                        <Trash2 className="h-4 w-4" />
                        <span className="ml-2">Revoke</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
