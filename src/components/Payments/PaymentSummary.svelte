<script>
  export let type;
  export let course;
  export let currentMonth;
  export let amount;
</script>

<div class="sm:mb-12 mb-20">
  <div class="mb-10">
    <h1
      class="leading-tight sm:mb-12 mb-24 sm:text-3xl text-4xl text-white-us
      font-raleway text-center sm:text-left">
      Pago
      {#if type === 'Efectivo'}en{:else}con{/if}
      <span class="font-semibold text-cyan-us">{type}.</span>
    </h1>

    <div class="shadow-md bg-blue-us border-1 border-blue-us rounded p-2">
      <p class="mb-1 text-summary-details">
        <span class="font-light">Curso:</span>
        <span class="font-medium text-light-gray-us">{course}</span>
      </p>
      <p class="sm:mb-3 mb-4 text-summary-details">
        <span class="font-light">Mes:</span>
        <span class="text-light-gray-us">{currentMonth}</span>
      </p>
      <p class="text-summary-details">
        <span class="font-light">Total:</span>
        <span class="font-bold text-cyan-us">${amount} ARS</span>
      </p>
    </div>
  </div>

  {#if type === 'Tarjeta de Crédito'}
    <p class="text-sm text-left -mt-8 mb-12 font-payment-summary">
      *Los pagos con tarjeta de crédito tienen un
      {@html `<span class="font-medium">recargo del 8%.</span>`}
    </p>
  {/if}

  {#if type === 'Efectivo'}
    <p class="text-xl font-payment-summary">
      Podés realizar el pago en
      {@html `<span class="font-semibold">la próxima clase</span>. 😁`}
    </p>
  {:else if ['Tarjeta de Débito', 'Tarjeta de Crédito', 'Código QR'].includes(type)}
    <p class="text-xl font-payment-summary">
      El pago se va a completar a través de
      {@html `<span class="font-semibold">MercadoPago</span>. 😁`}
    </p>
  {/if}
</div>
