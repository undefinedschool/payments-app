<script>
  import { paymentMap } from './utils.svelte';
  // props
  export let type;
  export let course;
  export let currentMonth;
  export let amount;
  export let BTC_WALLET = '';
  export let bankData = '';
  // local state
  const { CBU, CBU_ALIAS } = bankData;
  const paymentType = paymentMap[type];
  // udpate store
  import { paymentData } from '../../store.js';
  paymentData.update(prevState => ({ ...prevState, type: paymentType }));
</script>

<div class="sm:mb-12 mb-20">
  <div class="mb-10">
    <h1
      class="leading-tight sm:{type === 'BTC' ? 'mb-8' : 'mb-12'} mb-24 sm:text-2xl text-4xl text-white-us font-raleway
      text-center sm:text-left">
      Pago
      {#if type === 'BTC'}en{:else if type === 'bankTransfer'}por{:else}con{/if}
      <span class="font-semibold text-cyan-us">{paymentType}</span>
    </h1>

    <div class="shadow-md bg-blue-us border-1 border-blue-us rounded p-2">
      <p class="mb-1 text-summary-details sm:text-sm text-lg">
        <span class="font-light">Curso:</span>
        <span class="font-medium text-light-gray-us">{course} ({currentMonth})</span>
      </p>

      {#if type === 'bankTransfer'}
        <div class="mt-1 mb-4">
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
              <button title="¡Copiar!" type="button" class="inline link btn" data-clipboard-text="{CBU_ALIAS}">
                {CBU_ALIAS}
              </button>
            </span>
          </p>
        </div>
      {/if}

      <p class="mt-2 text-summary-details text-lg">
        <span class="font-normal">Total:</span>
        {#if type === 'BTC'}
          <span class="font-bold text-cyan-us">{amount} BTC</span>
        {:else}
          <span class="font-bold text-cyan-us">${amount} ARS</span>
        {/if}
      </p>
    </div>

    {#if type === 'BTC'}
      <div
        class="mt-1 border-solid border-white border-2 w-auto h-auto flex flex-col items-center"
        style="background-color: #fafafa; border-radius: 4px;">
        <span class="block">
          <svg shape-rendering="crispEdges" height="150" width="150" viewBox="0 0 37 37">
            <path fill="#ffffff" d="M0,0 h37v37H0z"></path>
            <path
              fill="#000000"
              d="M4 4h7v1H4zM14 4h1v1H14zM16 4h4v1H16zM23 4h1v1H23zM26,4 h7v1H26zM4 5h1v1H4zM10 5h1v1H10zM12
              5h1v1H12zM14 5h1v1H14zM17 5h4v1H17zM24 5h1v1H24zM26 5h1v1H26zM32,5 h1v1H32zM4 6h1v1H4zM6 6h3v1H6zM10
              6h1v1H10zM16 6h2v1H16zM19 6h1v1H19zM26 6h1v1H26zM28 6h3v1H28zM32,6 h1v1H32zM4 7h1v1H4zM6 7h3v1H6zM10
              7h1v1H10zM12 7h3v1H12zM16 7h1v1H16zM18 7h2v1H18zM21 7h4v1H21zM26 7h1v1H26zM28 7h3v1H28zM32,7 h1v1H32zM4
              8h1v1H4zM6 8h3v1H6zM10 8h1v1H10zM13 8h1v1H13zM19 8h3v1H19zM24 8h1v1H24zM26 8h1v1H26zM28 8h3v1H28zM32,8
              h1v1H32zM4 9h1v1H4zM10 9h1v1H10zM12 9h2v1H12zM15 9h2v1H15zM22 9h1v1H22zM24 9h1v1H24zM26 9h1v1H26zM32,9
              h1v1H32zM4 10h7v1H4zM12 10h1v1H12zM14 10h1v1H14zM16 10h1v1H16zM18 10h1v1H18zM20 10h1v1H20zM22
              10h1v1H22zM24 10h1v1H24zM26,10 h7v1H26zM13 11h3v1H13zM18 11h1v1H18zM20 11h1v1H20zM22 11h3v1H22zM4
              12h5v1H4zM10 12h4v1H10zM15 12h1v1H15zM21 12h1v1H21zM25 12h1v1H25zM27 12h1v1H27zM29 12h1v1H29zM31
              12h1v1H31zM4 13h1v1H4zM6 13h2v1H6zM9 13h1v1H9zM11 13h1v1H11zM14 13h1v1H14zM16 13h4v1H16zM23 13h6v1H23zM30
              13h2v1H30zM4 14h3v1H4zM8 14h4v1H8zM14 14h1v1H14zM17 14h4v1H17zM25 14h6v1H25zM4 15h1v1H4zM9 15h1v1H9zM11
              15h1v1H11zM16 15h2v1H16zM19 15h2v1H19zM22 15h1v1H22zM27 15h1v1H27zM29 15h1v1H29zM31,15 h2v1H31zM5
              16h2v1H5zM9 16h6v1H9zM16 16h1v1H16zM18 16h1v1H18zM23 16h1v1H23zM25 16h1v1H25zM31 16h1v1H31zM5 17h2v1H5zM8
              17h1v1H8zM11 17h1v1H11zM13 17h1v1H13zM20 17h1v1H20zM24 17h1v1H24zM26 17h4v1H26zM32,17 h1v1H32zM4
              18h1v1H4zM6 18h1v1H6zM8 18h3v1H8zM15 18h2v1H15zM19 18h3v1H19zM24 18h4v1H24zM29 18h1v1H29zM31 18h1v1H31zM4
              19h1v1H4zM8 19h1v1H8zM13 19h3v1H13zM18 19h1v1H18zM24 19h1v1H24zM28 19h2v1H28zM32,19 h1v1H32zM4 20h2v1H4zM7
              20h1v1H7zM10 20h4v1H10zM15 20h1v1H15zM19 20h2v1H19zM23 20h1v1H23zM29 20h2v1H29zM4 21h1v1H4zM7 21h2v1H7zM12
              21h1v1H12zM14 21h1v1H14zM16 21h3v1H16zM20 21h2v1H20zM24 21h2v1H24zM27 21h2v1H27zM32,21 h1v1H32zM4
              22h1v1H4zM7 22h4v1H7zM14 22h1v1H14zM17 22h4v1H17zM22 22h1v1H22zM25 22h2v1H25zM28 22h2v1H28zM31
              22h1v1H31zM4 23h1v1H4zM6 23h4v1H6zM11 23h2v1H11zM14 23h1v1H14zM16 23h2v1H16zM22 23h2v1H22zM26
              23h1v1H26zM29 23h1v1H29zM4 24h1v1H4zM8 24h5v1H8zM14 24h1v1H14zM16 24h1v1H16zM18 24h1v1H18zM21
              24h2v1H21zM24 24h5v1H24zM30 24h2v1H30zM12 25h2v1H12zM20 25h1v1H20zM23 25h2v1H23zM28 25h2v1H28zM32,25
              h1v1H32zM4 26h7v1H4zM12 26h1v1H12zM15 26h2v1H15zM19 26h3v1H19zM23 26h2v1H23zM26 26h1v1H26zM28
              26h1v1H28zM30 26h2v1H30zM4 27h1v1H4zM10 27h1v1H10zM15 27h1v1H15zM18 27h2v1H18zM22 27h1v1H22zM24
              27h1v1H24zM28 27h1v1H28zM31,27 h2v1H31zM4 28h1v1H4zM6 28h3v1H6zM10 28h1v1H10zM12 28h1v1H12zM15
              28h1v1H15zM20 28h2v1H20zM24 28h8v1H24zM4 29h1v1H4zM6 29h3v1H6zM10 29h1v1H10zM12 29h3v1H12zM16
              29h3v1H16zM20 29h4v1H20zM25 29h1v1H25zM27 29h1v1H27zM31,29 h2v1H31zM4 30h1v1H4zM6 30h3v1H6zM10
              30h1v1H10zM12 30h1v1H12zM17 30h4v1H17zM22 30h1v1H22zM24 30h1v1H24zM26 30h1v1H26zM28 30h4v1H28zM4
              31h1v1H4zM10 31h1v1H10zM12 31h1v1H12zM14 31h1v1H14zM16 31h2v1H16zM20 31h1v1H20zM23 31h4v1H23zM29
              31h1v1H29zM31 31h1v1H31zM4 32h7v1H4zM12 32h2v1H12zM16 32h1v1H16zM18 32h3v1H18zM23 32h1v1H23zM27
              32h1v1H27zM30 32h1v1H30z"></path>
          </svg>
        </span>

        <p class="font-medium text-black-us" style="margin-top: -6px; padding-bottom: 4px; font-size: .7rem;">
          <button title="¡Copiar!" type="button" class="bg-white link btn" data-clipboard-text="{BTC_WALLET}">
            {BTC_WALLET}
          </button>
        </p>
      </div>
    {/if}
  </div>

  {#if type === 'bankTransfer'}
    <p class="text-xs text-left -mt-8 mb-12 font-payment-summary">📋 Copiá los datos bancarios haciéndoles click</p>
    <p class="pl-2 text-xs text-left -mt-8 mb-12">
      <span class="font-light text-white-us font-worksans">Una vez realizada la operación, enviá el comprobante a</span>
      <a href="mailto:contacto@undefinedschool.io?subject=Comprobante de Pago">
        <strong class="link text-white-us font-worksans">contacto@undefinedschool.io</strong>
      </a>
    </p>
  {/if}

  {#if type === 'BTC'}
    <p class="text-xs text-left -mt-8 mb-12 font-payment-summary">
      📋 Copiá la dirección de la Wallet haciéndole click
    </p>
    <p class="pl-2 text-xs text-left -mt-8 mb-6">
      <span class="font-light text-white-us font-worksans">
        Una vez realizada la transacción, enviá el comprobante a
      </span>
      <a href="mailto:contacto@undefinedschool.io?subject=Comprobante de Pago">
        <strong class="link text-white-us font-worksans">contacto@undefinedschool.io</strong>
      </a>
    </p>
  {/if}
</div>
