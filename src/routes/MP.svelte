<script>
  import PaymentSummary from '../components/Payments/PaymentSummary.svelte';
  import GoBack from '../components/Buttons/GoBack.svelte';
  import Pay from '../components/Buttons/Pay.svelte';
  import { fade } from 'svelte/transition';
  import { getPaymentData, makePayment } from '../components/Payments/utils.svelte';

  export let type;
  export let course;
  export let currentMonth;
  export let amount;

  const PAYMENT_DATA = {
    data: { course, currentMonth, amount },
    type: 'MP',
  };
</script>

<main in:fade>
  <div class="max-w-2xl flex flex-col h-screen justify-center m-auto">
    <PaymentSummary {type} {course} {currentMonth} {amount} />

    <div class="flex">
      <GoBack />

      <!-- <Pay action="{makePayment}" value="{'Pagar con Mercado Pago'}" /> -->

      <button on:click="{() => makePayment(PAYMENT_DATA)}">Realizar el Pago</button>
    </div>
  </div>
</main>
