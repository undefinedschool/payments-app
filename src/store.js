import { writable } from 'svelte/store';

export const paymentData = writable({
  course: '',
  type: '',
  student: {
    name: '',
    email: '',
  },
});
