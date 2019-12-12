<script>
  export let name;
  export let email;
</script>

<div>
  <div class="mb-4">
    <label class="form-input-title opacity-70" for="username">Nombre</label>
    <input
      class="form-input focus:outline-none focus:shadow-outline student-info-input"
      aria-label="Nombre"
      type="text"
      name="name"
      id="username"
      placeholder="{name}"
      disabled />
  </div>
  <div class="mb-6">
    <label class="form-input-title opacity-70" for="email">E-mail</label>
    <input
      class="form-input focus:outline-none focus:shadow-outline student-info-input"
      aria-label="Nombre"
      type="text"
      name="email"
      id="email"
      placeholder="{email}"
      disabled />
  </div>
</div>
