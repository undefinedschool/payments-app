<script context="module">
  // store
  import { paymentData } from '../../store.js';
  import { get } from 'svelte/store';

  const { PAYMENTS_SERVICE, MAIL_SERVICE } = process.env;

  export const paymentMap = {
    bankTransfer: 'Transferencia Bancaria ó Depósito',
    card: 'Tarjeta de Débito ó Crédito',
    MP: 'Mercado Pago',
    BTC: 'BTC',
  };

  export const getPaymentData = ({ course, currentMonth, amount }) => ({
    id: 'FSJS',
    title: `${course} (${currentMonth})`,
    unit_price: parseInt(amount),
  });

  export function makePayment({ data, type }) {
    const PAYMENT_DATA = getPaymentData(data);

    fetch(`${PAYMENTS_SERVICE}?paymentType=${type}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(PAYMENT_DATA),
    })
      .then(res => res.json())
      .then(res => window.location.replace(res.CHECKOUT_URL))
      .catch(console.error);
  }

  export function notifyPayment() {
    const MAIL_DATA = get(paymentData);

    fetch(`${MAIL_SERVICE}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(MAIL_DATA),
    })
      .then(res => res.json())
      .catch(console.error);
  }
</script>
