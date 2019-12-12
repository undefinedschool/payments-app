<script>
  import { navigate } from 'svelte-routing';
  import PaymentSummary from '../components/Payments/PaymentSummary.svelte';
  import HomePageLink from '../components/HomePageLink.svelte';
  import GoBackButton from '../components/Buttons/GoBackButton.svelte';
  import PayButton from '../components/Buttons/PayButton.svelte';

  export let type;
  export let course;
  export let currentMonth;
  export let amount;
</script>

<main class="p-5">
  <div class="max-w-xl flex flex-col h-screen justify-center m-auto">

    <HomePageLink />

    <form>

      <PaymentSummary {type} {course} {currentMonth} {amount} />

      <div class="flex">
        <GoBackButton />

        <PayButton action="{'https://undefinedschool.io'}" value="{'¡Ok!'}" />
      </div>
    </form>
  </div>
</main>
