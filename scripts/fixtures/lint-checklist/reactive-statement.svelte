<script lang="ts">
	let count = 0;
	let doubled = 0;
	$: doubled = count * 2;
</script>

<span>{doubled}</span>
