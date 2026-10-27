<script lang="ts">
	let count = 0;
	$: doubled = count * 2;

	function reset() {
		doubled = 0;
	}
</script>

<button type="button" on:click={reset}>{doubled}</button>
