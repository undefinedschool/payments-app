<script>
  import { Router, Route, navigate } from 'svelte-routing';
  import { capitalize, getCurrentMonth } from './components/utils.svelte';
  import BankTransfer from './routes/BankTransfer.svelte';
  import Cash from './routes/Cash.svelte';
  import Card from './routes/Card.svelte';
  import QR from './routes/QR.svelte';
  import BTC from './routes/BTC.svelte';
  import Navbar from './components/Navbar.svelte';
  import SelectPaymentMethodTitle from './components/Payments/SelectPaymentMethodTitle.svelte';
  import Clipboard from 'clipboard';

  export let student;
  export let amount;

  const { name, email } = student;
  const { ARS, creditCard, BTCa } = amount;

  const selected = [0, 0, 0, 0, 0, 0];
  const routes = {
    0: '/type=bankTransfer',
    1: '/type=cash',
    2: '/type=debitCard',
    3: '/type=creditCard',
    4: '/type=QR',
    5: '/type=BTC',
  };

  function updateSelected(paymentCode) {
    selected.fill(0);
    selected[paymentCode] = 1;
  }

  function getPaymentType() {
    const paymentTypes = document.getElementsByName('type');

    for (const type of paymentTypes) {
      if (type.checked) return type.value;
    }
  }

  function onSubmit() {
    // const paymentType = getPaymentType();

    // console.log(`Student: ${event.target.name.value}`);
    // console.log(`Email: ${event.target.email.value}`);
    // console.log(`Payment type: ${paymentType}`);

    navigate(routes[selected.indexOf(1)], { replace: true });
    selected.fill(0);
  }

  const currentMonth = getCurrentMonth();

  // clipboard copy
  const clipboard = new Clipboard('.btn');

  clipboard.on('success', e => {
    console.info('Copied!');

    e.clearSelection();
  });

  clipboard.on('error', e => console.error('Oops, something went wrong while copying...'));
</script>

<Router>
  <div class="p-5 bg-black-us">
    <Navbar />
    <Route path="/">
      <main>
        <div class="max-w-xl flex flex-col h-screen justify-center m-auto">

          <form name="payments" method="POST" data-netlify="true" on:submit|preventDefault="{onSubmit}">

            <input type="hidden" name="payments" value="contact" />

            <SelectPaymentMethodTitle />
            <!-- student info -->
            <section>
              <div class="mb-3">
                <label class="form-input-title font-raleway opacity-70" for="name">Nombre</label>
                <input
                  class="form-input focus:outline-none focus:shadow-outline student-info-input"
                  aria-label="Nombre"
                  type="text"
                  name="name"
                  id="name"
                  placeholder="{name}"
                  required />
              </div>
              <div class="mb-8">
                <label class="form-input-title font-raleway opacity-70" for="email">E-mail</label>
                <input
                  class="form-input focus:outline-none focus:shadow-outline student-info-input"
                  aria-label="Nombre"
                  type="email"
                  name="email"
                  id="email"
                  placeholder="{email}"
                  required />
              </div>
            </section>

            <section class="sm:mb-3 mb-10">
              <span class="form-input-title font-raleway opacity-70">Medio de pago</span>

              <div class="mt-2 sm:h-40 h-48 overflow-scroll">
                <label
                  class="{selected[0] ? 'border-cyan-us bg-cyan-us-alpha' : 'border-blue-us'} flex items-center
                  justify-between border-solid border-1 rounded p-4 h-16 mb-2">
                  <span class="{selected[0] ? 'text-cyan-us' : 'text-white-us'} ml-2 font-raleway">
                    Transferencia bancaria/depósito
                  </span>
                  <input
                    type="radio"
                    class="transition-ease-02 form-radio h-5 w-5 text-white-us"
                    name="type"
                    value="bankTransfer"
                    on:click="{() => updateSelected(0)}"
                    required />
                </label>

                <label
                  class="{selected[1] ? 'border-cyan-us bg-cyan-us-alpha' : 'border-blue-us'} flex items-center
                  justify-between border-solid border-1 rounded p-4 h-16 mb-2">
                  <span class="{selected[1] ? 'text-cyan-us' : 'text-white-us'} ml-2 font-raleway">Efectivo</span>
                  <input
                    type="radio"
                    class="transition-ease-02 form-radio h-5 w-5 text-white-us"
                    name="type"
                    value="cash"
                    on:click="{() => updateSelected(1)}" />
                </label>

                <label
                  class="{selected[2] ? 'border-cyan-us bg-cyan-us-alpha' : 'border-blue-us'} flex items-center
                  justify-between border-solid border-1 rounded p-4 h-16 mb-2">
                  <span class="{selected[2] ? 'text-cyan-us' : 'text-white-us'} ml-2 font-raleway">
                    Tarjeta de Débito
                  </span>
                  <input
                    type="radio"
                    class="transition-ease-02 form-radio h-5 w-5 text-white-us"
                    name="type"
                    value="debitCard"
                    on:click="{() => updateSelected(2)}" />
                </label>

                <label
                  class="{selected[3] ? 'border-cyan-us bg-cyan-us-alpha' : 'border-blue-us'} flex items-center
                  justify-between border-solid border-1 rounded p-4 h-16 mb-2">
                  <span class="{selected[3] ? 'text-cyan-us' : 'text-white-us'} ml-2 font-raleway">
                    Tarjeta de Crédito
                  </span>
                  <input
                    type="radio"
                    class="transition-ease-02 form-radio h-5 w-5 text-white-us"
                    name="type"
                    value="creditCard"
                    on:click="{() => updateSelected(3)}" />
                </label>

                <label
                  class="{selected[4] ? 'border-cyan-us bg-cyan-us-alpha' : 'border-blue-us'} flex items-center
                  justify-between border-solid border-1 rounded p-4 h-16 mb-2">
                  <span class="{selected[4] ? 'text-cyan-us' : 'text-white-us'} ml-2 font-raleway">
                    Código QR
                    <span class="text-gray-us">(MercadoPago)</span>
                  </span>
                  <input
                    type="radio"
                    class="transition-ease-02 form-radio h-5 w-5 text-white-us"
                    name="type"
                    value="QR"
                    on:click="{() => updateSelected(4)}" />
                </label>

                <label
                  class="{selected[5] ? 'border-cyan-us bg-cyan-us-alpha' : 'border-blue-us'} flex items-center
                  justify-between border-solid border-1 rounded p-4 h-16 mb-2">
                  <span class="{selected[5] ? 'text-cyan-us' : 'text-white-us'} ml-2 font-raleway">
                    Bitcoin
                    <span class="text-gray-us">(BTC)</span>
                  </span>
                  <input
                    type="radio"
                    class="transition-ease-02 form-radio h-5 w-5 text-white-us"
                    name="type"
                    value="BTC"
                    on:click="{() => updateSelected(5)}" />
                </label>
              </div>
            </section>

            <button
              class="submit-button text-center w-full rounded focus:outline-none focus:shadow-outline shadow-md"
              type="submit">
              Continuar
            </button>
          </form>

        </div>
      </main>
    </Route>
    <Route path="/type=bankTransfer">
      <BankTransfer
        amount="{ARS}"
        course="{'Full Stack JavaScript'}"
        type="{'Transferencia Bancaria'}"
        {currentMonth} />
    </Route>
    <Route path="/type=cash">
      <Cash amount="{ARS}" course="{'Full Stack JavaScript'}" type="{'Efectivo'}" {currentMonth} />
    </Route>
    <Route path="/type=debitCard">
      <Card amount="{ARS}" course="{'Full Stack JavaScript'}" type="{'Tarjeta de Débito'}" {currentMonth} />
    </Route>
    <Route path="/type=creditCard">
      <Card amount="{creditCard}" course="{'Full Stack JavaScript'}" type="{'Tarjeta de Crédito'}" {currentMonth} />
    </Route>
    <Route path="/type=QR">
      <QR amount="{ARS}" course="{'Full Stack JavaScript'}" type="{'Código QR'}" {currentMonth} />
    </Route>
    <Route path="/type=BTC">
      <BTC amount="{BTCa}" course="{'Full Stack JavaScript'}" type="{'BTC'}" {currentMonth} />
    </Route>
  </div>
</Router>
