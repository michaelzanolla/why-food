import { select, put, all, takeLatest } from 'redux-saga/effects';

import history from '../../../services/history';

import { addToCartSuccess, updateAmount } from './actions';

function* addToCart({ product }) {
  const productExists = yield select(state =>
    state.cart.find(p => p.id === product.id)
  );

  if (productExists) {
    const amount = productExists.amount + 1;
    yield put(updateAmount(product.id, amount));
  } else {
    yield put(addToCartSuccess(product));

    history.push('/cart');
  }
}

export default all([takeLatest('@cart/ADD_REQUEST', addToCart)]);
