export interface PropertySpecFieldOption {
  value: string;
  label: string;
}

export interface PropertySpecField {
  type: 'string' | 'number' | 'boolean' | 'enum';
  label: string;
  required: boolean;
  filterable?: boolean;
  min?: number;
  max?: number;
  options?: PropertySpecFieldOption[];
}

export interface PropertySpecSchema {
  fields: Record<string, PropertySpecField>;
}

export interface PublicPropertySubtype {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  property_type_id: string;
  spec_schema_version: number;
  spec_schema: PropertySpecSchema;
}
