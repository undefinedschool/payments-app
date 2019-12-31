<script>
  import { navigate } from 'svelte-routing';
  import PaymentSummary from '../components/Payments/PaymentSummary.svelte';
  import GoBackButton from '../components/Buttons/GoBackButton.svelte';
  import PayButton from '../components/Buttons/PayButton.svelte';
  import { fade } from 'svelte/transition';

  export let amount;
  export let course;
  export let type;
  export let currentMonth;

  const accountNumber = '4031454-4 159-8';
  const CBU = '00701590 30004031454484';
  const CBUAlias = 'nhquiroz-galicia';

  const bankData = {
    accountNumber,
    CBU,
    CBUAlias,
  };
</script>

<main class="p-5" in:fade>
  <div class="max-w-xl flex flex-col h-screen justify-center m-auto">
    <form>
      <PaymentSummary {type} {course} {currentMonth} {amount} {bankData} />

      <div class="flex">
        <GoBackButton />

        <PayButton action="{'https://undefinedschool.io'}" value="{'¡Ok!'}" />
      </div>
    </form>
  </div>
</main>
