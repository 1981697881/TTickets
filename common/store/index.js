import { createStore } from 'vuex';
import init from './modules/init.js';
import user from './modules/user.js';
import cart from './modules/cart.js';
import theme from './modules/theme.js';

export default createStore({
  strict: false,
  modules: {
    init,
    user,
    cart,
    theme
  }
});
