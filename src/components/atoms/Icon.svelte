<script lang="ts" module>
	/**
	 * Union type of all available icon names.
	 *
	 * Categories:
	 * - Navigation: arrow-left, arrow-right, chevron-down, chevron-right, chevron-up, external-link, menu
	 * - Actions: close, search, plus, minus, edit, trash, copy
	 * - Status: check, warning, info, error
	 * - Visibility: eye, eye-off
	 */
	export type IconName =
		| 'arrow-left'
		| 'arrow-right'
		| 'chevron-down'
		| 'chevron-right'
		| 'chevron-up'
		| 'external-link'
		| 'menu'
		| 'close'
		| 'search'
		| 'plus'
		| 'minus'
		| 'edit'
		| 'trash'
		| 'copy'
		| 'check'
		| 'warning'
		| 'info'
		| 'error'
		| 'eye'
		| 'eye-off';

	export interface IconProps {
		/** The icon to render — must be one of the registered IconName values */
		name: IconName;
		/** Display size: sm (16px), md (20px, default), lg (24px), xl (32px) */
		size?: 'sm' | 'md' | 'lg' | 'xl';
		/** Override colour — defaults to currentColor (inherits from parent) */
		colour?: string;
		/** Additional CSS class names */
		class?: string;
	}
</script>

<script lang="ts">
	/**
	 * Icon — inline SVG icon atom with size and colour support.
	 *
	 * Usage:
	 *   <Icon name="arrow-left" />
	 *   <Icon name="check" size="lg" colour="var(--colour-success)" />
	 *   <Icon name="close" size="sm" />
	 *
	 * Features:
	 * - ~20 inline SVG icons across navigation, action, status, and visibility categories
	 * - Four size variants: sm (16px), md (20px), lg (24px), xl (32px)
	 * - Default colour inherits from parent via currentColor
	 * - Stroke width uses --stroke-normal design token (1.5)
	 * - aria-hidden="true" by default (decorative; pair with text for accessibility)
	 * - data-size attribute for external styling hooks
	 */

	let { name, size = 'md', colour, class: className }: IconProps = $props();

	/** Map size prop to pixel dimensions for the SVG viewBox rendering */
	const sizeMap: Record<string, number> = {
		sm: 16,
		md: 20,
		lg: 24,
		xl: 32
	};

	const pixels = $derived(sizeMap[size]);

	/**
	 * SVG path data for each icon.
	 *
	 * All paths are drawn against a 24x24 viewBox using stroke-based rendering.
	 * The SVG scales to the requested pixel size via width/height attributes.
	 */
	const iconPaths: Record<IconName, string> = {
		// Navigation
		'arrow-left': 'M19 12H5m0 0l7 7m-7-7l7-7',
		'arrow-right': 'M5 12h14m0 0l-7-7m7 7l-7 7',
		'chevron-down': 'M6 9l6 6 6-6',
		'chevron-right': 'M9 6l6 6-6 6',
		'chevron-up': 'M18 15l-6-6-6 6',
		'external-link': 'M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6m4-3h6v6m-11 5L21 3',
		menu: 'M4 6h16M4 12h16M4 18h16',

		// Actions
		close: 'M18 6L6 18M6 6l12 12',
		search: 'M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803a7.5 7.5 0 0010.607 0z',
		plus: 'M12 5v14m-7-7h14',
		minus: 'M5 12h14',
		edit: 'M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125',
		trash:
			'M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0',
		copy: 'M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184',

		// Status
		check: 'M4.5 12.75l6 6 9-13.5',
		warning:
			'M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z',
		info: 'M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z',
		error: 'M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z',

		// Visibility
		eye: 'M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178zM15 12a3 3 0 11-6 0 3 3 0 016 0z',
		'eye-off':
			'M3.98 8.223A10.477 10.477 0 001.934 12c1.292 4.338 5.31 7.5 10.066 7.5.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88'
	};

	const pathData = $derived(iconPaths[name]);
</script>

<svg
	class="icon {className ?? ''}"
	data-size={size}
	width={pixels}
	height={pixels}
	viewBox="0 0 24 24"
	fill="none"
	stroke={colour ?? 'currentColor'}
	stroke-width="var(--stroke-normal, 1.5)"
	stroke-linecap="round"
	stroke-linejoin="round"
	aria-hidden="true"
>
	<path d={pathData} />
</svg>

<style>
	.icon {
		display: inline-block;
		flex-shrink: 0;
		vertical-align: middle;
	}
</style>
