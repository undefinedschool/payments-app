import App from './App.svelte';

const app = new App({
  target: document.body,
  props: {
    student: {
      name: 'Jane Doe',
      email: 'jane@undefinedstudent.com',
    },
    amount: {
      ARS: 5000,
      creditCard: 5400,
      BTCa: 0.0111,
    },
  },
});

export default app;
