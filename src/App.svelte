<script>
  // imports
  import { Router, Route, navigate } from 'svelte-routing';
  import { capitalize, getCurrentMonth } from './components/utils.svelte';
  import BankTransfer from './routes/BankTransfer.svelte';
  import { onMount } from 'svelte';
  const { PAYMENTS_SERVICE, MAIL_SERVICE } = process.env;
  // store
  import { paymentData } from './store.js';
  // import  from './routes/.svelte';
  import Card from './routes/Card.svelte';
  import MP from './routes/MP.svelte';
  import BTC from './routes/BTC.svelte';
  import Navbar from './components/Navbar.svelte';
  import SelectPaymentMethodTitle from './components/Payments/SelectPaymentMethodTitle.svelte';
  import Clipboard from 'clipboard';
  // exports
  export let course;
  export let placeholder;
  // update store
  paymentData.update(prevState => ({ ...prevState, course }));
  // local state
  const { name, email } = placeholder;
  const { COURSE_AMOUNT } = process.env;
  let studentName = '';
  let studentEmail = '';

  const selected = [0, 0, 0, 0];
  const routes = {
    0: '/type=bankTransfer',
    1: '/type=card',
    2: '/type=MP',
    3: '/type=BTC',
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

  // warm up serverless functions
  onMount(() => {
    fetch(PAYMENTS_SERVICE, { method: 'HEAD' });
    fetch(MAIL_SERVICE, { method: 'HEAD' });
  });
</script>

<Router>
  <div class="p-4 bg-black-us">
    <Navbar />
    <Route path="/">
      <main>
        <div class="max-w-2xl flex flex-col h-screen justify-center m-auto">

          <form name="payments" method="POST" data-netlify="true" on:submit|preventDefault="{onSubmit}">

            <input type="hidden" name="payments" value="contact" />

            <SelectPaymentMethodTitle />
            <!-- student info -->
            <section>
              <div class="mb-3">
                <label class="form-input-title font-raleway opacity-70" for="name">Nombre</label>
                <input
                  bind:value="{studentName}"
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
                  bind:value="{studentEmail}"
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

              <div class="mt-2 sm:h-40 h-48 overflow-auto">
                <label
                  class="{selected[0] ? 'border-cyan-us bg-cyan-us-alpha' : 'border-blue-us'} flex items-center
                  justify-between border-solid border-1 rounded p-4 h-16 mb-2">
                  <span class="{selected[0] ? 'text-cyan-us' : 'text-white-us'} ml-2 font-raleway">
                    Transferencia bancaria ó Depósito
                  </span>
                  <input
                    type="radio"
                    class="transition-all-4 form-radio h-5 w-5 text-white-us"
                    name="type"
                    value="bankTransfer"
                    on:click="{() => updateSelected(0)}"
                    required />
                </label>

                <label
                  class="{selected[1] ? 'border-cyan-us bg-cyan-us-alpha' : 'border-blue-us'} flex items-center
                  justify-between border-solid border-1 rounded p-4 h-16 mb-2">
                  <span class="{selected[1] ? 'text-cyan-us' : 'text-white-us'} ml-2 font-raleway">
                    Tarjeta (Débito ó Crédito)
                  </span>
                  <input
                    type="radio"
                    class="transition-all-4 form-radio h-5 w-5 text-white-us"
                    name="type"
                    value="card"
                    on:click="{() => updateSelected(1)}" />
                </label>

                <label
                  class="{selected[2] ? 'border-cyan-us bg-cyan-us-alpha' : 'border-blue-us'} flex items-center
                  justify-between border-solid border-1 rounded p-4 h-16 mb-2">
                  <span class="{selected[2] ? 'text-cyan-us' : 'text-white-us'} ml-2 font-raleway">
                    Dinero en cuenta de
                    <span class="font-semibold">Mercado Pago</span>
                  </span>
                  <input
                    type="radio"
                    class="transition-all-4 form-radio h-5 w-5 text-white-us"
                    name="type"
                    value="MP"
                    on:click="{() => updateSelected(2)}" />
                </label>

                <label
                  class="{selected[3] ? 'border-cyan-us bg-cyan-us-alpha' : 'border-blue-us'} flex items-center
                  justify-between border-solid border-1 rounded p-4 h-16 mb-2">
                  <span class="{selected[3] ? 'text-cyan-us' : 'text-white-us'} ml-2 font-raleway">
                    Bitcoin
                    <span class="font-semibold">(BTC)</span>
                  </span>
                  <input
                    type="radio"
                    class="transition-all-4 form-radio h-5 w-5 text-white-us"
                    name="type"
                    value="BTC"
                    on:click="{() => updateSelected(3)}" />
                </label>
              </div>
            </section>

            <button
              on:click="{() => paymentData.update(prevState => ({
                  ...prevState,
                  student: { name: studentName, email: studentEmail },
                }))}"
              class="submit-button text-center w-full rounded focus:outline-none focus:shadow-outline shadow-md"
              type="submit">
              Continuar
            </button>
          </form>

        </div>
      </main>
    </Route>
    <Route path="/type=bankTransfer">
      <BankTransfer amount="{COURSE_AMOUNT}" {course} type="{'bankTransfer'}" {currentMonth} />
    </Route>

    <Route path="/type=card">
      <Card amount="{COURSE_AMOUNT}" {course} type="{'card'}" {currentMonth} />
    </Route>

    <Route path="/type=MP">
      <MP amount="{COURSE_AMOUNT}" {course} type="{'MP'}" {currentMonth} />
    </Route>

    <Route path="/type=BTC">
      <BTC amount="{0.012}" {course} type="{'BTC'}" {currentMonth} />
    </Route>
  </div>
</Router>
