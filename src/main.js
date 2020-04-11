import App from './App.svelte';

const app = new App({
  target: document.body,
  props: {
    student: {
      name: 'Jane Doe',
      email: 'jane@undefinedstudent.com',
    },
    amount: {
      ARS: process.env.COURSE_AMOUNT,
      BTCa: 0.012,
    },
  },
});

export default app;
