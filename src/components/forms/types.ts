/**
 * Co-located field option types for form field components.
 *
 * These types describe the schema-level constraints that PocketBase
 * returns for text, number, and boolean fields. Each field component
 * imports its own options type from this file.
 */

/**
 * Options for text fields — mirrors PocketBase text field schema options
 */
export interface TextFieldOptions {
	min?: number;
	max?: number;
	pattern?: string;
}

/**
 * Options for number fields — mirrors PocketBase number field schema options
 */
export interface NumberFieldOptions {
	min?: number;
	max?: number;
	noDecimal?: boolean;
}

/**
 * Options for boolean fields — reserved for future schema constraints.
 * Currently empty as PocketBase bool fields have no configurable options.
 */
export interface BoolFieldOptions {
	/* No options defined by PocketBase for bool fields at present */
}

/**
 * Options for date fields — mirrors PocketBase date field schema options.
 * Currently empty as PocketBase date fields have no configurable options
 * beyond min/max which are handled as direct props on the field component.
 */
export interface DateFieldOptions {
	/* No options defined by PocketBase for date fields at present */
}

/**
 * Options for select and multi-select fields — mirrors PocketBase select field schema options
 */
export interface SelectFieldOptions {
	maxSelect?: number;
	values: string[];
}

/**
 * Options for multi-select fields — identical shape to SelectFieldOptions.
 * Aliased for semantic clarity in form field components.
 */
export type MultiSelectFieldOptions = SelectFieldOptions;

/**
 * Options for JSON fields — reserved for future schema constraints.
 * Currently empty as PocketBase JSON fields have no configurable options.
 */
export interface JsonFieldOptions {
	/* No options defined by PocketBase for JSON fields at present */
}
