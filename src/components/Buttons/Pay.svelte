<script>
  export let action;
  export let url;
  export let value;
</script>

<div class="w-2/3">
  <a href="{url ? url : ''}" class="text-s">
    <button
      on:click="{() => action()}"
      class="submit-button text-center w-full rounded focus:outline-none focus:shadow-outline shadow-md"
      type="button">
      {value}
    </button>
  </a>
</div>
