<script lang="ts">
	let { message = '', show = false }: { message: string; show: boolean } = $props();
</script>

{#if show}
	<div class="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-gray-900 px-4 py-2 text-xs font-medium text-white shadow-lg dark:bg-white dark:text-neutral-900">
		{message}
	</div>
{/if}
