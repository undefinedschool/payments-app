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

  const debitCardLink =
    'https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=243772354-20f59e93-36e7-43fe-9fed-11b4c51ee5ef';
  const creditCardLink =
    'https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=243772354-61356159-d0a4-4a07-9380-1f657c41bbbc';
</script>

<main in:fade>
  <div class="max-w-2xl flex flex-col h-screen justify-center m-auto">
    <PaymentSummary {type} {course} {currentMonth} {amount} />

    <div class="flex">
      <GoBackButton />

      <PayButton action="{type === 'debitCard' ? debitCardLink : creditCardLink}" value="{'Ir a MercadoPago'}" />
    </div>
  </div>
</main>
