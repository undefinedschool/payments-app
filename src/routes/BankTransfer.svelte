<script>
  import PaymentSummary from '../components/Payments/PaymentSummary.svelte';
  import GoBack from '../components/Buttons/GoBack.svelte';
  import Pay from '../components/Buttons/Pay.svelte';
  import { fade } from 'svelte/transition';

  export let amount;
  export let course;
  export let type;
  export let currentMonth;

  const { CBU, CBU_ALIAS } = process.env;

  const bankData = {
    CBU,
    CBU_ALIAS,
  };
</script>

<main in:fade>
  <div class="max-w-2xl flex flex-col h-screen justify-center m-auto">
    <PaymentSummary {type} {course} {currentMonth} {amount} {bankData} />

    <div class="flex">
      <GoBack />

      <Pay url="{'https://undefinedschool.io'}" value="{'¡Ok!'}" />
    </div>
  </div>
</main>
