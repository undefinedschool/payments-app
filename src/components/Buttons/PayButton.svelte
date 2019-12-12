<script>
  export let action;
  export let value;
</script>

<form class="w-2/3" {action}>
  <input
    class="submit-button text-center w-full rounded focus:outline-none focus:shadow-outline shadow-md"
    type="submit"
    {value} />
</form>
