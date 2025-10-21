 
// NOTE: This was generated from the Apify Input Schema by LLM
// https://github.com/apify/apify-shared-js/blob/master/packages/input_schema/src/schema.json
export type ApifyInputField = any;

// export type ApifyInputField =
//     | StringProperty
//     | StringEnumProperty
//     | ArrayProperty
//     | ObjectProperty
//     | IntegerProperty
//     | BooleanProperty
//     | ResourceProperty
//     | ResourceArrayProperty
//     | AnyProperty;

export interface StringProperty {
    type: 'string';
    title: string;
    description: string;
    nullable?: boolean;
    editor?: 'javascript' | 'python' | 'textfield' | 'textarea' | 'datepicker' | 'hidden';
    isSecret?: boolean;
    default?: string;
    prefill?: string;
    example?: string;
    pattern?: string;
    minLength?: number;
    maxLength?: number;
    sectionCaption?: string;
    sectionDescription?: string;
    dateType?: 'absolute' | 'relative' | 'absoluteOrRelative';
    enum?: string[];
    enumTitles?: string[];
}

export interface StringEnumProperty {
    type: 'string';
    editor: 'select';
    title: string;
    description: string;
    default?: string;
    prefill?: string;
    example?: string;
    nullable?: boolean;
    sectionCaption?: string;
    sectionDescription?: string;
    enum: string[];
    enumTitles?: string[];
}

export interface ArrayProperty {
    type: 'array';
    editor: 'json' | 'requestListSources' | 'pseudoUrls' | 'globs' | 'keyValue' | 'stringList' | 'select' | 'hidden';
    title: string;
    description: string;
    default?: any[];
    prefill?: any[];
    example?: any[];
    nullable?: boolean;
    minItems?: number;
    maxItems?: number;
    uniqueItems?: boolean;
    sectionCaption?: string;
    sectionDescription?: string;
    items?: { type: 'string'; enum?: string[]; enumTitles?: string[]; };
}

export interface ObjectProperty {
    type: 'object';
    title: string;
    description: string;
    default?: Record<string, any>;
    prefill?: Record<string, any>;
    example?: Record<string, any>;
    patternKey?: string;
    patternValue?: string;
    nullable?: boolean;
    minProperties?: number;
    maxProperties?: number;
    editor?: 'json' | 'proxy' | 'hidden';
    sectionCaption?: string;
    sectionDescription?: string;
}

export interface IntegerProperty {
    type: 'integer';
    title: string;
    description: string;
    default?: number;
    prefill?: number;
    example?: number;
    nullable?: boolean;
    minimum?: number;
    maximum?: number;
    unit?: string;
    editor?: 'number' | 'hidden';
    sectionCaption?: string;
    sectionDescription?: string;
}

export interface BooleanProperty {
    type: 'boolean';
    title: string;
    description: string;
    default?: boolean;
    prefill?: boolean;
    example?: boolean;
    nullable?: boolean;
    editor?: 'checkbox' | 'hidden';
    sectionCaption?: string;
    sectionDescription?: string;
}

export interface ResourceProperty {
    type: 'string';
    title: string;
    description: string;
    editor: 'resourcePicker' | 'hidden';
    resourceType: 'dataset' | 'keyValueStore' | 'requestQueue';
    default?: string;
    prefill?: string;
    example?: string;
    nullable?: boolean;
    sectionCaption?: string;
    sectionDescription?: string;
}

export interface ResourceArrayProperty {
    type: 'array';
    title: string;
    description: string;
    editor: 'resourcePicker' | 'hidden';
    resourceType: 'dataset' | 'keyValueStore' | 'requestQueue';
    default?: any[];
    prefill?: any[];
    example?: any[];
    nullable?: boolean;
    minItems?: number;
    maxItems?: number;
    uniqueItems?: boolean;
    sectionCaption?: string;
    sectionDescription?: string;
}

export interface AnyProperty {
    type: ('object' | 'array' | 'string' | 'integer' | 'boolean')[];
    title: string;
    description: string;
    default?: any;
    prefill?: any;
    example?: any;
    nullable?: boolean;
    editor?: 'json' | 'hidden';
    sectionCaption?: string;
    sectionDescription?: string;
}

export interface ApifyInputSchema {
    $schema?: string;
    title: string;
    schemaVersion: number;
    description?: string;
    type: string;
    required?: string[];
    additionalProperties?: boolean;
    properties: Record<string, ApifyInputField>;
}

// Types generated using LLM based on make.com documentation
export interface MakeParameter {
    name: string;
    label: string;
    help?: string;
    type: string;
    required?: boolean;
    default?: any;
    advanced?: boolean;
    editable?: boolean;
    disabled?: boolean;
     
    rpc?: RpcParameter;
    semantic?: string;
}

export interface RpcParameter {
    text: string;
    url: string;
    parameters: MakeParameter[];
}

export type MakeParameterType = Record<string, any>;
// export type MakeParameterType =
//     | TextParameter
//     | BooleanParameter
//     | SelectParameter
//     | NumberParameter
//     | IntegerParameter
//     | PortParameter
//     | ArrayParameter
//     | ObjectParameter
//     | DateParameter
//     | TimeParameter
//     | TimezoneParameter
//     | EmailParameter
//     | PasswordParameter
//     | UrlParameter
//     | PathParameter
//     | FilenameParameter
//     | ColorParameter
//     | CertParameter
//     | PkeyParameter
//     | HiddenParameter
//     | FilterParameter
//     | CollectionParameter
//     | TimestampParameter
//     | UUIDParameter;

export interface TextParameter extends MakeParameter {
    type: 'text';
    multiline?: boolean;
    tags?: string;
    validate?: {
        min?: number;
        max?: number;
        pattern?: string;
    };
}

export interface BooleanParameter extends MakeParameter {
    type: 'boolean';
    nested?: MakeParameter[];
}

export interface SelectParameter extends MakeParameter {
    type: 'select';
    multiple?: boolean;
    sort?: 'text' | 'number';
    grouped?: boolean;
    options?: { label: string; value: any }[] | string;
    validate?: {
        minItems?: number;
        maxItems?: number;
    };
    dynamic?: boolean;
    mappable?: boolean | { help?: string };
}

export interface NumberParameter extends MakeParameter {
    type: 'number';
    validate?: {
        min?: number;
        max?: number;
    };
}

export interface IntegerParameter extends MakeParameter {
    type: 'integer';
    validate?: {
        min?: number;
        max?: number;
    };
}

export interface PortParameter extends MakeParameter {
    type: 'port';
    validate?: {
        min?: number;
        max?: number;
    };
}

export interface ArrayParameter extends MakeParameter {
    type: 'array';
    spec?: MakeParameter;
    validate?: {
        minItems?: number;
        maxItems?: number;
        allowedValues?: any[];
    };
    mode?: 'edit' | 'choose';
    labels?: {
        addItem?: string;
        editItem?: string;
    };
}

export interface ObjectParameter extends MakeParameter {
    type: 'object';
    properties?: Record<string, MakeParameter>;
}

export interface DateParameter extends MakeParameter {
    type: 'date';
    time?: boolean;
}

export interface TimeParameter extends MakeParameter {
    type: 'time';
}

export interface TimezoneParameter extends MakeParameter {
    type: 'timezone';
    editable?: boolean;
}

export interface EmailParameter extends MakeParameter {
    type: 'email';
}

export interface PasswordParameter extends MakeParameter {
    type: 'password';
}

export interface UrlParameter extends MakeParameter {
    type: 'url';
}

export interface PathParameter extends MakeParameter {
    type: 'path';
}

export interface FilenameParameter extends MakeParameter {
    type: 'filename';
    extension?: string | string[];
}

export interface ColorParameter extends MakeParameter {
    type: 'color';
}

export interface CertParameter extends MakeParameter {
    type: 'cert';
}

export interface PkeyParameter extends MakeParameter {
    type: 'pkey';
}

export interface HiddenParameter extends MakeParameter {
    type: 'hidden';
}

export interface FilterParameter extends MakeParameter {
    type: 'filter';
    options?: { label: string; value: any }[] | string;
}

export interface CollectionParameter extends MakeParameter {
    type: 'collection';
    spec: MakeParameter[];
    sequence?: boolean;
}

export interface TimestampParameter extends MakeParameter {
    type: 'timestamp';
}

export interface UUIDParameter extends MakeParameter {
    type: 'uuid';
}
