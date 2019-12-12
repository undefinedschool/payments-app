<script>
  import { navigate } from "svelte-routing";
  import PaymentSummary from "../components/Payments/PaymentSummary.svelte";
  import HomePageLink from "../components/HomePageLink.svelte";
  import GoBackButton from "../components/Buttons/GoBackButton.svelte";
  import PayButton from "../components/Buttons/PayButton.svelte";

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

        <PayButton
          action={'https://www.mercadopago.com/instore/merchant/qr/64876/template_062de856f8184465a26eec99708e54fbd4786dd413b442a580d3cf01e0138a43.pdf'}
          value={'Escanear código QR'} />
      </div>
    </form>
  </div>
</main>
