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

export interface InterfaceParameter {
  name: string;
  type: string;
  value?: string;
  auth_type?: string;
  period_type?: string;
  format?: string;
  fields?: Field[];
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
  description: string;
  endpoint?: string;
  method?: string;
  type: 'rest' | 'loop';
  pagination?: Pagination;
  variables_output?: VariableOutput[];
  loop?: Loop;
  steps?: Step[];
  interface_parameters?: InterfaceParameter[];
}

export interface VariableMetadata {
  format: string;
  storage_name: string;
  variable_name: string;
}

export interface Connector {
  name: string;
  base_url: string;
  default_headers: Record<string, any>;
  default_retry_strategy: Record<string, any>;
  variables_metadata: Record<string, VariableMetadata>;
  variables_storages: Array<{
    name: string;
    path: string;
    type: string;
  }>;
} 