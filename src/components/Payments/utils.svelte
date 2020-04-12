<script context="module">
  const { PAYMENTS_SERVICE_URL } = process.env;

  export const getPaymentData = ({ course, currentMonth, amount }) => ({
    id: 'FSJS',
    title: `${course} (${currentMonth})`,
    unit_price: parseInt(amount),
  });

  export function makePayment({ data, type }) {
    const PAYMENT_DATA = getPaymentData(data);

    fetch(`${PAYMENTS_SERVICE_URL}?paymentType=${type}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(PAYMENT_DATA),
    })
      .then(res => res.json())
      .then(res => window.location.replace(res.CHECKOUT_URL))
      .catch(console.error);
  }
</script>
