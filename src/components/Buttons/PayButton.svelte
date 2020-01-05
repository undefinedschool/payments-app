<script>
  export let action;
  export let value;
</script>

<div class="w-2/3">
  <a href="{action}" class="text-s">
    <button
      class="submit-button text-center w-full rounded focus:outline-none focus:shadow-outline shadow-md"
      type="button">
      {value}
    </button>
  </a>
</div>
