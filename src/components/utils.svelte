<script context="module">
  const currentDate = new Date();
  const nextMonth = `0${currentDate.getMonth() + 1}`;
  const currentYear = currentDate.getFullYear();
  const paymentDate = `${nextMonth}/01/${currentYear}`;

  export function capitalize(s) {
    if (typeof s !== 'string') return '';

    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  export function getCurrentMonth() {
    const options = { month: 'long', year: 'numeric' };

    return capitalize(new Date(paymentDate).toLocaleDateString('es-ES', options));
  }
</script>
