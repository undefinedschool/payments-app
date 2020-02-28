import App from './App.svelte';

const app = new App({
  target: document.body,
  props: {
    student: {
      name: 'Jane Doe',
      email: 'jane@undefinedstudent.com',
    },
    amount: {
      ARS: 5200,
      creditCard: 5720,
      BTCa: 0.0097,
    },
  },
});

export default app;
