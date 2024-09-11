import { ref, watch } from 'vue';

/**
 * @param {string} key LocalStorage key.
 * @param {function(string)} initFunc Function call on the retrieved LocalStorage value at init.
 * @returns Vue value ref.
 */
export function bindStorage(key, initFunc) {
    const initialValue = initFunc(localStorage.getItem(key));
    const r = ref(initialValue);
    watch(r, (newValue) => {
        localStorage.setItem(key, newValue);
    });
    return r;
}
