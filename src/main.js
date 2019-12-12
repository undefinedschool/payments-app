import App from './App.svelte';

const app = new App({
  target: document.body,
  props: {
    name: 'Jane Doe',
    email: 'faketestingemail@fakemail.com'
  }
});

export default app;
