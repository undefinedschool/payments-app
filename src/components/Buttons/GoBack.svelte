<script>
  import { navigate } from 'svelte-routing';
</script>

<button
  class="focus:outline-none focus:shadow-outline cancel-button text-center text-light-gray-us w-1/3 mr-2 rounded"
  type="reset"
  on:click="{() => navigate('/', { replace: true })}">
  Cancelar
</button>
