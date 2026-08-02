<script lang="ts" module>
	export interface JsonFieldProps {
		name: string;
		label: string;
		value: unknown;
		required?: boolean;
		error?: string;
		disabled?: boolean;
		placeholder?: string;
		onchange?: (value: unknown) => void;
	}
</script>

<script lang="ts">
	/**
	 * JsonField — syntax-editable JSON textarea for JSON fields.
	 * Usage: `<JsonField name="meta" label="Metadata" bind:value={meta} />`
	 * Features: JSON validation on blur, format/prettify, minify, copy to clipboard,
	 * line numbers, tab-key indentation support, error display.
	 */

	let {
		name,
		label,
		value = null,
		required = false,
		error,
		disabled = false,
		placeholder = '{\n  \n}',
		onchange
	}: JsonFieldProps = $props();

	let internalError = $state<string | null>(null);
	let isCopied = $state(false);

	function valueToString(val: unknown): string {
		if (val === null || val === undefined) return '';
		if (typeof val === 'string') return val;
		try {
			return JSON.stringify(val, null, 2);
		} catch {
			return '';
		}
	}

	// eslint-disable-next-line svelte/prefer-writable-derived
	let textContent = $state('');

	const lineCount = $derived(Math.max(textContent.split('\n').length, 5));

	function handleInput(event: Event) {
		const target = event.target as HTMLTextAreaElement;
		textContent = target.value;
		internalError = null;

		if (target.value.trim() === '') {
			onchange?.(null);
			return;
		}

		try {
			const parsed = JSON.parse(target.value);
			onchange?.(parsed);
		} catch {
			// Defer error display to blur — don't interrupt mid-typing
		}
	}

	function handleBlur() {
		if (textContent.trim() === '') {
			internalError = null;
			return;
		}

		try {
			JSON.parse(textContent);
			internalError = null;
		} catch (err) {
			if (err instanceof Error) {
				internalError = `Invalid JSON: ${err.message}`;
			} else {
				internalError = 'Invalid JSON format';
			}
		}
	}

	function formatJson() {
		if (disabled) return;

		try {
			const parsed = JSON.parse(textContent);
			textContent = JSON.stringify(parsed, null, 2);
			onchange?.(parsed);
			internalError = null;
		} catch (err) {
			if (err instanceof Error) {
				internalError = `Cannot format: ${err.message}`;
			}
		}
	}

	function minifyJson() {
		if (disabled) return;

		try {
			const parsed = JSON.parse(textContent);
			textContent = JSON.stringify(parsed);
			onchange?.(parsed);
			internalError = null;
		} catch (err) {
			if (err instanceof Error) {
				internalError = `Cannot minify: ${err.message}`;
			}
		}
	}

	async function copyToClipboard() {
		try {
			await navigator.clipboard.writeText(textContent);
			isCopied = true;
			setTimeout(() => {
				isCopied = false;
			}, 2000);
		} catch (err) {
			console.error('Failed to copy:', err);
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Tab') {
			event.preventDefault();
			const target = event.target as HTMLTextAreaElement;
			const start = target.selectionStart;
			const end = target.selectionEnd;

			textContent = textContent.substring(0, start) + '  ' + textContent.substring(end);

			requestAnimationFrame(() => {
				target.selectionStart = target.selectionEnd = start + 2;
			});
		}
	}

	$effect(() => {
		textContent = valueToString(value);
	});

	const displayError = $derived(error || internalError);
</script>

<div class="json-field">
	<div class="field-header">
		<label class="field-label" for={name}>
			<span class="label-text">{label}</span>
			{#if required}
				<span class="required-indicator">*</span>
			{/if}
		</label>

		<div class="toolbar">
			<button
				type="button"
				class="toolbar-button"
				onclick={formatJson}
				{disabled}
				title="Format JSON"
			>
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="1.5"
						d="M4 6h16M4 12h8m-8 6h16"
					/>
				</svg>
				<span>Format</span>
			</button>

			<button
				type="button"
				class="toolbar-button"
				onclick={minifyJson}
				{disabled}
				title="Minify JSON"
			>
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="1.5"
						d="M4 6h16M4 12h16M4 18h16"
					/>
				</svg>
				<span>Minify</span>
			</button>

			<button
				type="button"
				class="toolbar-button"
				onclick={copyToClipboard}
				title="Copy to clipboard"
			>
				{#if isCopied}
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M5 13l4 4L19 7"
						/>
					</svg>
					<span>Copied!</span>
				{:else}
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
						<rect x="9" y="9" width="13" height="13" rx="2" stroke-width="1.5" />
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="1.5"
							d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"
						/>
					</svg>
					<span>Copy</span>
				{/if}
			</button>
		</div>
	</div>

	<div class="editor-wrapper" class:has-error={!!displayError}>
		<div class="line-numbers">
			{#each Array.from({ length: lineCount }, (_, i) => i) as i (i)}
				<span class="line-number">{i + 1}</span>
			{/each}
		</div>

		<textarea
			id={name}
			{name}
			class="editor-textarea"
			{disabled}
			{placeholder}
			spellcheck="false"
			autocomplete="off"
			bind:value={textContent}
			oninput={handleInput}
			onblur={handleBlur}
			onkeydown={handleKeydown}
			aria-invalid={!!displayError}
			aria-describedby={displayError ? `${name}-error` : undefined}></textarea>
	</div>

	{#if displayError}
		<span id={`${name}-error`} class="error-message">{displayError}</span>
	{/if}
</div>

<style>
	.json-field {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.field-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-4);
	}

	.field-label {
		display: flex;
		align-items: center;
		gap: var(--space-1);
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--admin-text);
	}

	.label-text {
		line-height: 1.4;
	}

	.required-indicator {
		color: var(--colour-error);
		font-weight: 600;
	}

	.toolbar {
		display: flex;
		gap: var(--space-1);
	}

	.toolbar-button {
		display: flex;
		align-items: center;
		gap: var(--space-1);
		padding: var(--space-1) var(--space-2);
		font-size: 0.75rem;
		font-family: inherit;
		color: var(--admin-text-secondary);
		background: transparent;
		border: 1px solid var(--admin-border);
		border-radius: 0;
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.toolbar-button:hover:not(:disabled) {
		background-color: var(--admin-bg-elevated);
		color: var(--admin-text);
		border-color: var(--admin-text-muted);
	}

	.toolbar-button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.toolbar-button svg {
		width: 14px;
		height: 14px;
	}

	.editor-wrapper {
		display: flex;
		border: 1px solid var(--admin-border);
		border-radius: 0;
		overflow: hidden;
		background-color: var(--admin-bg);
		transition: all 0.15s ease;
	}

	.editor-wrapper:hover:not(:has(:disabled)) {
		border-color: var(--admin-text-muted);
	}

	.editor-wrapper:focus-within {
		border-color: var(--accent);
		box-shadow: 0 0 0 3px rgba(var(--accent-rgb), 0.15);
	}

	.editor-wrapper.has-error {
		border-color: var(--colour-error);
	}

	.editor-wrapper.has-error:focus-within {
		box-shadow: 0 0 0 3px var(--colour-error-bg);
	}

	.line-numbers {
		display: flex;
		flex-direction: column;
		padding: var(--space-4) var(--space-2);
		background-color: var(--admin-bg-elevated);
		border-right: 1px solid var(--admin-border);
		user-select: none;
	}

	.line-number {
		font-size: 0.75rem;
		font-family: var(--font-mono);
		color: var(--admin-text-muted);
		line-height: 1.6;
		text-align: right;
		min-width: 24px;
	}

	.editor-textarea {
		flex: 1;
		min-height: 200px;
		padding: var(--space-4);
		font-size: 0.8125rem;
		font-family: var(--font-mono);
		line-height: 1.6;
		color: var(--admin-text);
		background-color: transparent;
		border: none;
		resize: vertical;
		white-space: pre;
		overflow-wrap: normal;
		overflow-x: auto;
	}

	.editor-textarea:focus {
		outline: none;
	}

	.editor-textarea::placeholder {
		color: var(--admin-text-muted);
	}

	.editor-textarea:disabled {
		opacity: 0.5;
		cursor: not-allowed;
		background-color: var(--admin-bg-elevated);
	}

	.error-message {
		font-size: 0.75rem;
		color: var(--colour-error);
	}
</style>
