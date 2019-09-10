import React from 'react';
import { Switch } from 'react-router-dom';
import Route from './Routes';

import Products from '../pages/Products';
import Cart from '../pages/Cart';

export default function Routes() {
  return (
    <Switch>
      <Route path="/" exact component={Products} />
      <Route path="/cart" component={Cart} />
    </Switch>
  );
}
