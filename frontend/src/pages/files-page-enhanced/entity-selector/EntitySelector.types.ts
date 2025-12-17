export interface EntityOption {
  id: string;
  name: string;
  type: 'property' | 'unit' | 'tenant';
}

export interface EntitySelectorProps {
  entityType: 'property' | 'unit' | 'tenant';
  onEntitySelect: (entity: EntityOption | null) => void;
  selectedEntity: EntityOption | null;
}