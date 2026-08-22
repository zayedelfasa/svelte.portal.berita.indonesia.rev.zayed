<script lang="ts">
	import SourceSection from '$lib/components/SourceSection.svelte';
	let { data } = $props();
</script>

<div class="space-y-6 px-0 py-4">
	{#each data.results as result (result.sourceId)}
		<SourceSection {result} />
	{/each}
</div>
