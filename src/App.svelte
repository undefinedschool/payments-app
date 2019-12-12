<script>
  import { Router, Route, navigate } from "svelte-routing";
  import { capitalize, getCurrentMonth } from "./components/utils.svelte";
  import Cash from "./routes/Cash.svelte";
  import Card from "./routes/Card.svelte";
  import QR from "./routes/QR.svelte";
  import HomePageLink from "./components/HomePageLink.svelte";
  import ContinueButton from "./components/Buttons/ContinueButton.svelte";
  import SelectPaymentMethodTitle from "./components/Payments/SelectPaymentMethodTitle.svelte";
  import StudentInfo from "./components/StudentInfo.svelte";

  export let name;
  export let email;
  export let url = "";

  const selected = [0, 0, 0, 0, 0, 0];
  const routes = {
    0: "/type=bankTransfer",
    1: "/type=cash",
    2: "/type=debitCard",
    3: "/type=creditCard",
    4: "/type=QR",
    5: "/type=BTC"
  };

  function updateSelected(paymentCode) {
    selected.fill(0);
    selected[paymentCode] = 1;
  }

  function onSubmit() {
    navigate(routes[selected.indexOf(1)], { replace: true });
    selected.fill(0);
  }

  const currentMonth = getCurrentMonth();
</script>

<Router {url}>
  <div>
    <Route path="/">
      <main class="p-5">
        <div class="max-w-xl flex flex-col h-screen justify-center m-auto">

          <HomePageLink />

          <form on:submit|preventDefault={onSubmit}>
            <SelectPaymentMethodTitle />

            <StudentInfo {name} {email} />

            <div class="sm:mb-3 mb-10">
              <span class="form-input-title opacity-70">Medio de pago</span>

              <div class="mt-2 sm:h-40 h-48 overflow-scroll">
                <label
                  class="{selected[0] ? 'border-cyan-us bg-cyan-us-alpha' : 'border-blue-us'}
                  flex items-center justify-between border-solid border-1
                  rounded p-4 h-16 mb-2">
                  <span
                    class="{selected[0] ? 'text-cyan-us' : 'text-white-us'}
                    form-payment-type">
                    Transferencia bancaria/depósito
                  </span>
                  <input
                    type="radio"
                    class="transition-ease-02 form-radio h-5 w-5 text-white-us"
                    name="type"
                    value="bankTransfer"
                    on:click={() => updateSelected(0)}
                    required />
                </label>

                <label
                  class="{selected[1] ? 'border-cyan-us bg-cyan-us-alpha' : 'border-blue-us'}
                  flex items-center justify-between border-solid border-1
                  rounded p-4 h-16 mb-2">
                  <span
                    class="{selected[1] ? 'text-cyan-us' : 'text-white-us'}
                    form-payment-type">
                    Efectivo
                  </span>
                  <input
                    type="radio"
                    class="transition-ease-02 form-radio h-5 w-5 text-white-us"
                    name="type"
                    value="cash"
                    on:click={() => updateSelected(1)} />
                </label>

                <label
                  class="{selected[2] ? 'border-cyan-us bg-cyan-us-alpha' : 'border-blue-us'}
                  flex items-center justify-between border-solid border-1
                  rounded p-4 h-16 mb-2">
                  <span
                    class="{selected[2] ? 'text-cyan-us' : 'text-white-us'}
                    form-payment-type">
                    Tarjeta de Débito
                  </span>
                  <input
                    type="radio"
                    class="transition-ease-02 form-radio h-5 w-5 text-white-us"
                    name="type"
                    value="debitCard"
                    on:click={() => updateSelected(2)} />
                </label>

                <label
                  class="{selected[3] ? 'border-cyan-us bg-cyan-us-alpha' : 'border-blue-us'}
                  flex items-center justify-between border-solid border-1
                  rounded p-4 h-16 mb-2">
                  <span
                    class="{selected[3] ? 'text-cyan-us' : 'text-white-us'}
                    form-payment-type">
                    Tarjeta de Crédito
                  </span>
                  <input
                    type="radio"
                    class="transition-ease-02 form-radio h-5 w-5 text-white-us"
                    name="type"
                    value="creditCard"
                    on:click={() => updateSelected(3)} />
                </label>

                <label
                  class="{selected[4] ? 'border-cyan-us bg-cyan-us-alpha' : 'border-blue-us'}
                  flex items-center justify-between border-solid border-1
                  rounded p-4 h-16 mb-2">
                  <span
                    class="{selected[4] ? 'text-cyan-us' : 'text-white-us'}
                    form-payment-type">
                    Código QR
                    <span class="text-gray-us">(MercadoPago)</span>
                  </span>
                  <input
                    type="radio"
                    class="transition-ease-02 form-radio h-5 w-5 text-white-us"
                    name="type"
                    value="QR"
                    on:click={() => updateSelected(4)} />
                </label>

                <label
                  class="{selected[5] ? 'border-cyan-us bg-cyan-us-alpha' : 'border-blue-us'}
                  flex items-center justify-between border-solid border-1
                  rounded p-4 h-16 mb-2">
                  <span
                    class="{selected[5] ? 'text-cyan-us' : 'text-white-us'}
                    form-payment-type">
                    Bitcoin
                    <span class="text-gray-us">(BTC)</span>
                  </span>
                  <input
                    type="radio"
                    class="transition-ease-02 form-radio h-5 w-5 text-white-us"
                    name="type"
                    value="BTC"
                    on:click={() => updateSelected(5)} />
                </label>
              </div>
            </div>

            <ContinueButton />

          </form>
        </div>
      </main>
    </Route>
    <Route path="/type=cash">
      <Cash
        amount={4800}
        course={'Full Stack JavaScript'}
        type={'Efectivo'}
        {currentMonth} />
    </Route>
    <Route path="/type=debitCard">
      <Card
        amount={4800}
        course={'Full Stack JavaScript'}
        type={'Tarjeta de Débito'}
        {currentMonth} />
    </Route>
    <Route path="/type=creditCard">
      <Card
        amount={'5184*'}
        course={'Full Stack JavaScript'}
        type={'Tarjeta de Crédito'}
        {currentMonth} />
    </Route>
    <Route path="/type=QR">
      <QR
        amount={4800}
        course={'Full Stack JavaScript'}
        type={'Código QR'}
        {currentMonth} />
    </Route>
  </div>
</Router>
