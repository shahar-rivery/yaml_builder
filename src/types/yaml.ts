// Add these new interfaces
interface PaginationCondition {
  type: 'empty_property' | 'string_equal' | 'json_items_result_count';
  value?: any;
}

interface BreakCondition {
  condition: PaginationCondition;
  name: string;
  variable: string;
}

interface PaginationParameter {
  name: string;
  token_format?: string;
  token_location?: string;
  token_path?: string;
  value?: number;
  increment_by?: number;
}

interface Pagination {
  type: 'cursor' | 'offset' | 'page';
  location: string;
  parameters: PaginationParameter[];
  break_conditions: BreakCondition[];
}

export interface Field {
  name: string;
  type?: string;
  value: string;
}

export interface AuthField {
  name: string;
  type: string;
  value: string;
  is_encrypted?: boolean;
}

export interface InterfaceParameter {
  name: string;
  type: 'string' | 'authentication' | 'date_range';
  auth_type?: 'basic_http' | 'bearer' | 'api_key';
  location?: 'header' | 'query_param';
  fields?: AuthField[];
  description?: string;
  period_type?: string;
  format?: string;
  value?: string;
}

export interface InterfaceParametersSection {
  source: InterfaceParameter[];
}

export interface InterfaceParameters {
  section: InterfaceParametersSection;
}

// Update the Step interface
export interface Step {
  name: string;
  request: {
    method: string;
    url: string;
  };
}

export interface VariableMetadata {
  format: string;
  storage_name: string;
  variable_name: string;
}

export interface Connector {
  name: string;
  base_url: string;
  default_headers: Record<string, string>;
  variables_metadata: Record<string, any>;
  variables_storages: Array<{
    name: string;
    type: string;
  }>;
} 