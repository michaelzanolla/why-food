import React from 'react';
import { connect } from 'react-redux';

import { MdShoppingBasket } from 'react-icons/md';
import { FaHamburger } from 'react-icons/fa';

import { Container, Logo, Cart } from './styles';

function Header({ cartSize }) {
  return (
    <Container>
      <Logo to="/">
        <strong>WHY FOOD</strong>
        <FaHamburger size={36} color="#fff" />
      </Logo>
      <Cart to="cart">
        <div>
          <strong>Meu carrinho</strong>
          <span>{cartSize} itens</span>
        </div>
        <MdShoppingBasket size={36} color="#FFF" />
      </Cart>
    </Container>
  );
}

export default connect(state => ({
  cartSize: state.cart.length,
}))(Header);
