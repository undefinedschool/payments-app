<script>
  export let type;
  export let course;
  export let currentMonth;
  export let amount;
  export let BTCWallet = '';
  export let bankData = '';

  const { accountNumber, CBU, CBUAlias } = bankData;
</script>

<div class="sm:mb-12 mb-20">
  <div class="mb-10">
    <h1 class="leading-tight sm:mb-12 mb-24 sm:text-3xl text-4xl text-white-us font-raleway text-center sm:text-left">
      Pago
      {#if type === 'Efectivo' || type === 'BTC'}en{:else if type === 'Transferencia Bancaria'}por{:else}con{/if}
      <span class="font-semibold text-cyan-us">{type}</span>
    </h1>

    <div class="shadow-md bg-blue-us border-1 border-blue-us rounded p-2">
      <p class="mb-1 text-summary-details sm:text-sm text-lg">
        <span class="font-light">Curso:</span>
        <span class="font-medium text-light-gray-us">{course}</span>
      </p>
      <p class="{type === 'BTC' ? 'mb-1' : 'sm:mb-3 mb-4'} text-summary-details sm:text-sm text-lg">
        <span class="font-light">Mes:</span>
        <span class="text-light-gray-us">{currentMonth}</span>
      </p>

      {#if type === 'Transferencia Bancaria'}
        <div class="mt-1 mb-4">
          <p class="mb-1 text-summary-details sm:text-sm text-lg">
            <span class="font-light">Número de cuenta:</span>
            <span class="font-medium text-light-gray-us">
              <button title="¡Copiar!" type="button" class="inline link btn" data-clipboard-text="{accountNumber}">
                {accountNumber}
              </button>
            </span>
          </p>
          <p class="mb-1 text-summary-details sm:text-sm text-lg">
            <span class="font-light">CBU:</span>
            <span class="font-medium text-light-gray-us">
              <span class="font-medium text-light-gray-us">
                <button title="¡Copiar!" type="button" class="inline link btn" data-clipboard-text="{CBU}">
                  {CBU}
                </button>
              </span>
            </span>
          </p>
          <p class="text-summary-details sm:text-sm text-lg">
            <span class="font-light">Alias de CBU:</span>
            <span class="font-medium text-light-gray-us">
              <button title="¡Copiar!" type="button" class="inline link btn" data-clipboard-text="{CBUAlias}">
                {CBUAlias}
              </button>
            </span>
          </p>
        </div>
      {/if}
      {#if type === 'BTC'}
        <p class="sm:mb-3 mb-4 text-summary-details sm:text-sm text-lg">
          <span class="font-light">Wallet:</span>
          <span class="font-medium text-light-gray-us">
            <button title="¡Copiar!" type="button" class="inline link btn" data-clipboard-text="{BTCWallet}">
              {BTCWallet}
            </button>
          </span>
        </p>
      {/if}

      <p class="text-summary-details text-lg">
        <span class="font-normal">Total:</span>
        {#if type === 'BTC'}
          <span class="font-bold text-cyan-us">{amount} BTC</span>
        {:else}
          <span class="font-bold text-cyan-us">${amount} ARS{type === 'Tarjeta de Crédito' ? '*' : ''}</span>
        {/if}
      </p>
    </div>
  </div>

  {#if type === 'Transferencia Bancaria'}
    <p class="text-sm text-left -mt-8 mb-12 font-payment-summary">
      📋 Podés copiar los datos bancarios haciéndoles click
    </p>
  {/if}

  {#if type === 'BTC'}
    <p class="text-sm text-left -mt-8 mb-12 font-payment-summary">
      📋 Podés copiar la dirección de la Wallet haciéndole click
    </p>
  {/if}

  {#if type === 'Tarjeta de Crédito'}
    <p class="text-sm text-left -mt-8 mb-12 font-payment-summary">
      *Los pagos con tarjeta de crédito tienen un
      {@html `<span class="font-medium">recargo del 8%.</span>`}
    </p>
  {/if}

  {#if type === 'Efectivo'}
    <p class="text-lg font-payment-summary">
      Podés realizar el pago en
      {@html `<span class="font-semibold">la próxima clase</span>. 😁`}
    </p>
  {:else if ['Tarjeta de Débito', 'Tarjeta de Crédito', 'Código QR'].includes(type)}
    <p class="text-lg font-payment-summary">
      El pago se va a completar a través de
      {@html `<span class="font-semibold">MercadoPago</span>. 😁`}
    </p>
  {/if}
</div>
