import React, { useState, useEffect, useCallback } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/componentDesignLibrary';
import { Input } from '@/componentDesignLibrary';
import { propertyService } from '../../../services';
import { unitService } from '../../../services';
import { tenantService } from '../../../services';
import type { EntitySelectorProps, EntityOption } from './EntitySelector.types';

export const EntitySelector: React.FC<EntitySelectorProps> = ({
  entityType,
  onEntitySelect,
  selectedEntity
}) => {
  const [entities, setEntities] = useState<EntityOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const loadEntities = useCallback(async () => {
    setLoading(true);
    try {
      let result;
      switch (entityType) {
        case 'property':
          result = await propertyService.getAll({ limit: 50 });
          if (result.success && result.data) {
            setEntities(result.data.map(p => ({
              id: p.id,
              name: `${p.name} - ${p.address.city}`,
              type: 'property'
            })));
          }
          break;
        case 'unit':
          result = await unitService.getAll();
          if (result.success && result.data) {
            setEntities(result.data.map(u => ({
              id: u.id,
              name: `${u.unitNumber}${u.unitName ? ` (${u.unitName})` : ''}`,
              type: 'unit'
            })));
          }
          break;
        case 'tenant':
          result = await tenantService.getAll();
          if (result.success && result.data) {
            setEntities(result.data.map(t => ({
              id: t.id,
              name: `${t.firstName} ${t.lastName} - ${t.email}`,
              type: 'tenant'
            })));
          }
          break;
      }
    } catch (error) {
      console.error('Failed to load entities:', error);
    } finally {
      setLoading(false);
    }
  }, [entityType]);

  useEffect(() => {
    loadEntities();
  }, [loadEntities]);

  const filteredEntities = entities.filter(entity =>
    entity.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {entityType.charAt(0).toUpperCase() + entityType.slice(1)}
      </label>
      <Select
        value={selectedEntity?.id || ''}
        onValueChange={(value) => {
          const entity = entities.find(e => e.id === value);
          onEntitySelect(entity || null);
        }}
      >
        <SelectTrigger>
          <SelectValue placeholder={`Select ${entityType}`} />
        </SelectTrigger>
        <SelectContent className="bg-white dark:bg-gray-900 border shadow-lg max-h-60">
          <div className="p-2">
            <Input
              placeholder={`Search ${entityType}s...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="mb-2"
            />
          </div>
          {loading ? (
            <div className="p-4 text-center text-sm text-gray-500">Loading...</div>
          ) : filteredEntities.length === 0 ? (
            <div className="p-4 text-center text-sm text-gray-500">No {entityType}s found</div>
          ) : (
            filteredEntities.map((entity) => (
              <SelectItem key={entity.id} value={entity.id}>
                {entity.name}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
    </div>
  );
};