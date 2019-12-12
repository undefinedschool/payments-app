<script>
  import { navigate } from 'svelte-routing';
</script>

<input
  class="focus:outline-none focus:shadow-outline cancel-button text-center text-light-gray-us w-1/3 mr-2 rounded"
  type="submit"
  value="Cancelar"
  on:click="{() => navigate('/', { replace: true })}" />
