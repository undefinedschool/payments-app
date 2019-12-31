import App from './App.svelte';

const app = new App({
  target: document.body,
  props: {
    name: 'Jane Doe',
    email: 'jane@undefinedstudent.com',
    amount: 5000,
    creditCardAmount: 5400,
    BTCAmount: 0.012,
  },
});

export default app;
