<script context="module">
  export function capitalize(s) {
    if (typeof s !== "string") return "";

    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  export function getCurrentMonth() {
    const options = { month: "long", year: "numeric" };

    return capitalize(new Date().toLocaleDateString("es-ES", options));
  }
</script>
