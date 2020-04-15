<script>
  import PaymentSummary from '../components/Payments/PaymentSummary.svelte';
  import GoBack from '../components/Buttons/GoBack.svelte';
  import Pay from '../components/Buttons/Pay.svelte';
  import { fade } from 'svelte/transition';
  import { getPaymentData, makePayment, notifyPayment } from '../components/Payments/utils.svelte';

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

      <button
        on:click="{() => {
          makePayment(PAYMENT_DATA);
          notifyPayment();
        }}"
        class="submit-button text-center w-full rounded focus:outline-none focus:shadow-outline shadow-md"
        type="button">
        Realizar el Pago
      </button>
    </div>
  </div>
</main>
