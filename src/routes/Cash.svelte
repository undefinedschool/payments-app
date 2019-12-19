<script>
  import { navigate } from 'svelte-routing';
  import PaymentSummary from '../components/Payments/PaymentSummary.svelte';
  import GoBackButton from '../components/Buttons/GoBackButton.svelte';
  import PayButton from '../components/Buttons/PayButton.svelte';
  import { fade } from 'svelte/transition';

  export let type;
  export let course;
  export let currentMonth;
  export let amount;
</script>

<main class="p-5" in:fade>
  <div class="max-w-xl flex flex-col h-screen justify-center m-auto">
    <form>
      <PaymentSummary {type} {course} {currentMonth} {amount} />

      <div class="flex">
        <GoBackButton />

        <PayButton action="{'https://undefinedschool.io'}" value="{'¡Ok!'}" />
      </div>
    </form>
  </div>
</main>
