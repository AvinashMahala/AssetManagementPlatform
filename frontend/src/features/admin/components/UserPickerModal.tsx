import React, { useEffect, useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/componentDesignLibrary';
import { Button } from '@/componentDesignLibrary';
import { getUsers } from '../services/adminService';

export const UserPickerModal: React.FC<{ open: boolean; onOpenChange: (v: boolean) => void; onSelect: (userId: string) => void }> = ({ open, onOpenChange, onSelect }) => {
  const [q, setQ] = useState('');
  const [results, setResults] = useState<Array<{ id: string; email: string; username?: string; name?: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (!open) return;
    setSelectedIndex(0);
  }, [open]);

  useEffect(() => {
    // debounce searches
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(async () => {
      let active = true;
      setLoading(true);
      try {
        const data = await getUsers(q || undefined);
        if (active) setResults(data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
      return () => { active = false };
    }, 250);
    return () => { if (timeoutRef.current) window.clearTimeout(timeoutRef.current); };
  }, [q]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(i => Math.min(i + 1, Math.max(0, results.length - 1)));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(i => Math.max(0, i - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const sel = results[selectedIndex];
      if (sel) { onSelect(sel.id); onOpenChange(false); }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="dialog-content">
        <DialogHeader>
          <DialogTitle>Pick a user to assign</DialogTitle>
        </DialogHeader>
        <div className="mt-2">
          <input aria-label="Search users" onKeyDown={handleKeyDown} className="input w-full" placeholder="Search by email or name" value={q} onChange={e => setQ(e.target.value)} />
          <div className="mt-3 max-h-64 overflow-auto border rounded bg-white">
            {loading ? <div className="p-4">Searching...</div> : (
              results.length === 0 ? <div className="p-4 text-gray-500">No users found</div> : results.map((u, idx) => (
                <div key={u.id} className={`p-3 hover:bg-gray-50 flex justify-between items-center ${selectedIndex === idx ? 'bg-blue-50' : ''}`}>
                  <div>
                    <div className="font-medium">{u.email}</div>
                    <div className="text-sm text-gray-500">{u.name || u.username}</div>
                  </div>
                  <div>
                    <Button onClick={() => { onSelect(u.id); onOpenChange(false); }} variant="ghost">Select</Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UserPickerModal;