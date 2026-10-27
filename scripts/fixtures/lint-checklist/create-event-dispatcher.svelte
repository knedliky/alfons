<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();
</script>

<button type="button" onclick={() => dispatch('press')}>Press</button>
