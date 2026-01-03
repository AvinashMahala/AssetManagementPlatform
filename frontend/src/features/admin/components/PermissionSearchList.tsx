import React, { useMemo, useRef, useState, useCallback } from 'react';
import type { PermissionDto } from '../types/roles';

// Group permissions by prefix before ':' (e.g., 'properties:property:create' => group 'properties')
function groupPermissions(perms: PermissionDto[]) {
  const map = new Map<string, PermissionDto[]>();
  for (const p of perms) {
    const grp = (p.name?.split(':')?.[0] || 'other').toLowerCase();
    const arr = map.get(grp) || [];
    arr.push(p);
    map.set(grp, arr);
  }
  return map;
}

function capitalize(s: string) { return s?.length ? s[0].toUpperCase() + s.slice(1).toLowerCase() : s; }

function formatPermissionLabel(name: string) {
  if (!name) return name;
  const parts = name.split(':');
  if (parts.length >= 3) {
    // e.g., properties:property:create -> Create property
    return `${capitalize(parts[2].replace(/_/g, ' '))} ${parts[1]}`;
  }
  if (parts.length === 2) return `${capitalize(parts[1])}`;
  return name;
}

export const PermissionSearchList: React.FC<{ permissions: PermissionDto[]; checked: Record<string, boolean>; onToggle: (id: string) => void }> = ({ permissions, checked, onToggle }) => {
  const [q, setQ] = useState('');
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const listRef = useRef<HTMLDivElement | null>(null);
  const flatItems = useMemo(() => permissions.filter(p => p.name.toLowerCase().includes(q.toLowerCase()) || (p.description || '').toLowerCase().includes(q.toLowerCase())), [permissions, q]);
  const groups = useMemo(() => groupPermissions(flatItems), [flatItems]);
  const groupEntries = Array.from(groups.entries()).sort((a, b) => a[0].localeCompare(b[0]));

  const toggleGroup = (group: string) => setExpandedGroups(prev => ({ ...prev, [group]: !prev[group] }));

  const selectAllInGroup = (group: string) => {
    const items = groups.get(group) || [];
    for (const p of items) onToggle(p.id);
  };

  // Keyboard navigation: up/down to move between checkboxes, Enter toggles
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const focusable = listRef.current?.querySelectorAll<HTMLButtonElement | HTMLLabelElement>("[data-permission-item]");
    if (!focusable || focusable.length === 0) return;
    const active = document.activeElement;
    let index = Array.prototype.indexOf.call(focusable, active);
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const next = focusable[(index + 1) % focusable.length];
      next?.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const next = focusable[(index - 1 + focusable.length) % focusable.length];
      next?.focus();
    } else if (e.key === 'Enter' && index >= 0) {
      e.preventDefault();
      const el = focusable[index] as HTMLElement;
      el?.click();
    }
  }, []);

  return (
    <div>
      <div className="mb-3">
        <input aria-label="Search permissions" value={q} onChange={e => setQ(e.target.value)} placeholder="Search permissions..." className="input w-full" />
      </div>

      <div ref={listRef} onKeyDown={handleKeyDown} className="space-y-3 max-h-72 overflow-auto">
        {groupEntries.map(([group, items]) => {
          const isExpanded = expandedGroups[group] ?? true;
          return (
            <div key={group} className="border rounded">
              <div className="flex items-center justify-between p-2 bg-gray-50">
                <div className="flex items-center gap-3">
                  <button aria-expanded={isExpanded} onClick={() => toggleGroup(group)} className="font-medium text-sm">
                    {group}
                  </button>
                  <div className="text-xs text-gray-500">{items.length} perms</div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => selectAllInGroup(group)} className="text-sm text-blue-600 hover:underline">Select all</button>
                </div>
              </div>

              {isExpanded && (
                <div className="p-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {items.map(p => (
                    <label tabIndex={0} data-permission-item key={p.id} className="flex items-start gap-2 p-2 rounded hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400" onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); onToggle(p.id); } }}>
                      <input aria-label={`Toggle permission ${p.name}`} type="checkbox" checked={!!checked[p.id]} onChange={() => onToggle(p.id)} />
                      <div>
                        <div className="font-medium">{formatPermissionLabel(p.name)}</div>
                        <div className="text-xs text-gray-500">{p.name}</div>
                        {p.description && <div className="text-sm text-gray-500">{p.description}</div>}
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {groupEntries.length === 0 && (
          <div className="p-2 text-sm text-gray-500">No permissions found</div>
        )}
      </div>
    </div>
  );
};

export default PermissionSearchList;