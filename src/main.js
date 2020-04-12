import App from './App.svelte';

const app = new App({
  target: document.body,
  props: {
    student: {
      name: 'Jane Doe',
      email: 'jane@undefinedstudent.com',
    },
  },
});

export default app;
