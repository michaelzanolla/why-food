import React, { useState, useEffect } from 'react';
import { connect, useDispatch } from 'react-redux';
import {
  // MdAddShoppingCart,
  MdAddCircleOutline,
  MdRemoveCircleOutline,
} from 'react-icons/md';

import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Badge,
  Label,
  CustomInput,
  Button,
} from 'reactstrap';

import { formatPrice } from '../../util/format';

import api from '../../services/api';

import { addToCartRequest } from '../../store/modules/cart/actions';

import { ProductList } from './styles';

function Products({ amount }) {
  const dispatch = useDispatch();
  const [show, setShow] = useState(false);
  const [products, setProducts] = useState([]);
  const [productView, setProductView] = useState({});
  const [valueMultiple, setValueMultiple] = useState(0);
  const [valueSpanMultiple, setValueSpanMultiple] = useState([]);
  const [valueList, setValueList] = useState([]);
  const [valueSpanList, setValueSpanList] = useState([]);
  const [productValues, setProductValues] = useState([]);
  const [valorTotal, setValorTotal] = useState(0);
  const [priceProduct, setPriceProduct] = useState(0);
  const [isDisabled, setIsDisabled] = useState(true);
  const [optionsRequired, setOptionsRequired] = useState(0);
  const [optionsRequiredSelect, setOptionsRequiredSelect] = useState(0);

  useEffect(() => {
    async function loadProducts() {
      const response = await api.get('products');

      const data = response.data.map(product => ({
        ...product,
        priceFormatted: formatPrice(product.price),
      }));

      setProducts(data);
    }

    loadProducts();
  }, []);

  function handleAddProduct() {
    const productToCart = {
      ...productView,
      amount: 1,
      productValues,
      valorFinal: productValues.reduce((valorFinal, item) => {
        valorFinal +=
          item.type === 'list' ? item.price * item.count : item.price;

        return valorFinal;
      }, 0),
    };

    dispatch(addToCartRequest(productToCart));

    setShow(false);
  }

  const handleShow = async (id, price) => {
    const response = await api.get(`products/${id}`);

    const countRequired = response.data.options.reduce(
      (totalRequired, option) => {
        if (option.required || option.min > 0) {
          totalRequired += 1;
        }

        return totalRequired;
      },
      0
    );

    setOptionsRequired(countRequired);

    setValorTotal(formatPrice(price));
    setPriceProduct(price);

    setProductView(response.data);
    setShow(true);

    setValueMultiple(0);
    setValueSpanMultiple([]);
    setValueList([]);
    setValueSpanList([]);
    setProductValues([]);
    setIsDisabled(true);
  };

  const handleToggle = () => setShow(!show);

  function handleRefreshValue(idOpcao, idRespOpcao, price, required) {
    const indexProduct = productValues.findIndex(p => p.id === idOpcao);

    if (indexProduct >= 0) {
      productValues.splice(indexProduct, 1);
    }

    productValues.push({
      id: idOpcao,
      idresp: idRespOpcao,
      type: 'single',
      price,
      required,
    });

    setProductValues(productValues);

    const valorFinal = productValues.reduce((valueTotal, item) => {
      valueTotal += item.type === 'list' ? item.price * item.count : item.price;

      return valueTotal;
    }, 0);

    setValorTotal(formatPrice(valorFinal + priceProduct));

    let countRequired = 0;
    productValues.map(option => {
      if (option.type === 'multiple' && countRequired === 0) {
        countRequired += 1;
      }
    });

    let countRequiredList = 0;
    productValues.map(option => {
      if (option.type === 'list' && countRequiredList === 0) {
        countRequiredList += 1;
      }
    });

    productValues.map(option => {
      if (option.required) {
        countRequired += 1;
      }
    });

    countRequired += countRequiredList;

    setOptionsRequiredSelect(countRequired);

    if (optionsRequired <= countRequired) {
      setIsDisabled(false);
    }
  }

  function handleAddValue(type, idOpcao, idRespOpcao, price, max, min) {
    if (type === 'multiple') {
      if (valueMultiple < max) {
        if (valueSpanMultiple[idRespOpcao]) {
          if (valueSpanMultiple[idRespOpcao] < min) {
            valueSpanMultiple[idRespOpcao] += 1;

            setValueMultiple(valueMultiple + 1);
            setValueSpanMultiple(valueSpanMultiple);
          }
        } else {
          valueSpanMultiple[idRespOpcao] = 1;

          setValueMultiple(valueMultiple + 1);
          setValueSpanMultiple(valueSpanMultiple);
        }

        const indexProduct = productValues.findIndex(
          p => p.id === idOpcao && p.idresp === idRespOpcao
        );

        if (indexProduct >= 0) {
          productValues.splice(indexProduct, 1);
        }

        productValues.push({
          id: idOpcao,
          idresp: idRespOpcao,
          type,
          price,
        });

        setProductValues(productValues);

        const valorFinal = productValues.reduce((valueTotal, item) => {
          valueTotal +=
            item.type === 'list' ? item.price * item.count : item.price;

          return valueTotal;
        }, 0);

        setValorTotal(formatPrice(valorFinal + priceProduct));

        if (min > 0) {
          let countRequired = 0;
          productValues.map(option => {
            if (option.type === 'multiple' && countRequired === 0) {
              countRequired += 1;
            }
          });

          productValues.map(option => {
            if (option.required) {
              countRequired += 1;
            }
          });

          setOptionsRequiredSelect(countRequired);

          if (optionsRequired <= countRequired) {
            setIsDisabled(false);
          }
        }
      }
    }

    if (type === 'list') {
      if (valueList[idOpcao] < max || !valueList[idOpcao]) {
        const stringNumber = productView.id + idOpcao + idRespOpcao;
        if (valueSpanList[Number(stringNumber)]) {
          valueSpanList[Number(stringNumber)] += 1;

          setValueSpanList(valueSpanList);
        } else {
          valueSpanList[Number(stringNumber)] = 1;

          setValueSpanList(valueSpanList);
        }

        if (valueList[idOpcao]) {
          valueList[idOpcao] += 1;

          setValueList(valueList);
        } else {
          valueList[idOpcao] = 1;

          setValueList(valueList);
        }

        const indexProduct = productValues.findIndex(
          p => p.id === idOpcao && p.idresp === idRespOpcao
        );

        if (indexProduct < 0) {
          productValues.push({
            id: idOpcao,
            idresp: idRespOpcao,
            type,
            count: 1,
            price,
          });
        } else {
          productValues[indexProduct].count += 1;
        }

        setProductValues(productValues);

        const valorFinal = productValues.reduce((valueTotal, item) => {
          valueTotal +=
            item.type === 'list' ? item.price * item.count : item.price;

          return valueTotal;
        }, 0);

        setValorTotal(formatPrice(valorFinal + priceProduct));

        if (min > 0) {
          let countRequired = 0;
          productValues.map(option => {
            if (option.type === 'list' && countRequired === 0) {
              countRequired += 1;
            }
          });

          productValues.map(option => {
            if (option.required) {
              countRequired += 1;
            }
          });

          setOptionsRequiredSelect(countRequired);

          if (optionsRequired <= countRequired) {
            setIsDisabled(false);
          }
        }
      }
    }
  }

  function handleRemoveValue(type, idOpcao, idRespOpcao, min) {
    if (type === 'multiple') {
      if (valueSpanMultiple[idRespOpcao] > 0) {
        valueSpanMultiple[idRespOpcao] -= 1;

        setValueSpanMultiple(valueSpanMultiple);
        setValueMultiple(valueMultiple - 1);

        const indexProduct = productValues.findIndex(
          p => p.id === idOpcao && p.idresp === idRespOpcao
        );

        if (indexProduct >= 0) {
          productValues.splice(indexProduct, 1);
        }

        setProductValues(productValues);

        const valorFinal = productValues.reduce((valueTotal, item) => {
          valueTotal += item.price;

          return valueTotal;
        }, 0);

        setValorTotal(formatPrice(valorFinal + priceProduct));

        if (min > 0) {
          let countRequired = 0;
          productValues.map(option => {
            if (option.type === 'multiple' && countRequired === 0) {
              countRequired += 1;
            }
          }, 0);

          productValues.map(option => {
            if (option.required) {
              countRequired += 1;
            }
          }, 0);

          setOptionsRequiredSelect(countRequired);

          if (optionsRequired > countRequired) {
            setIsDisabled(true);
          }
        }
      }
    }

    if (type === 'list') {
      const stringNumber = productView.id + idOpcao + idRespOpcao;
      if (valueSpanList[Number(stringNumber)] > 0) {
        valueSpanList[Number(stringNumber)] -= 1;

        setValueSpanList(valueSpanList);

        valueList[idOpcao] -= 1;
        setValueList(valueList);

        const indexProduct = productValues.findIndex(
          p => p.id === idOpcao && p.idresp === idRespOpcao
        );

        if (indexProduct >= 0) {
          if (productValues[indexProduct].count > 1) {
            productValues[indexProduct].count -= 1;
          } else {
            productValues.splice(indexProduct, 1);
          }
        }

        setProductValues(productValues);

        const valorFinal = productValues.reduce((valueTotal, item) => {
          valueTotal +=
            item.type === 'list' ? item.price * item.count : item.price;

          return valueTotal;
        }, 0);

        setValorTotal(formatPrice(valorFinal + priceProduct));

        if (min > 0) {
          let countRequired = 0;
          productValues.map(option => {
            if (option.type === 'list' && countRequired === 0) {
              countRequired += 1;
            }
          }, 0);

          productValues.map(option => {
            if (option.required) {
              countRequired += 1;
            }
          }, 0);

          setOptionsRequiredSelect(countRequired);

          if (optionsRequired > countRequired) {
            setIsDisabled(true);
          }
        }
      }
    }
  }

  return (
    <>
      <ProductList>
        {products.map(product => (
          <li
            key={product.id}
            onClick={() => {
              handleShow(product.id, product.price);
            }}
          >
            <strong>{product.name}</strong>
            <span>{product.priceFormatted}</span>
          </li>
        ))}
      </ProductList>

      <Modal isOpen={show} toggle={handleToggle} centered>
        <ModalHeader>{productView.name}</ModalHeader>
        {productView.options
          ? productView.options.map(option => {
              switch (option.type) {
                case 'single':
                  return (
                    <div key={option.id}>
                      <ModalBody Style="background: #f2f2f2;">
                        <div Style="display:flex; align-items:center; justify-content:space-between;">
                          <div>
                            <strong>{option.title}</strong>
                            {option.required ? (
                              <span Style="display:block; font-size:12px; font-weight:normal; color:#999">
                                Escolha 1 opção
                              </span>
                            ) : null}
                          </div>
                          {option.required ? (
                            <Badge
                              Style="font-size:12px; font-weight:normal"
                              variant="secondary"
                            >
                              Obrigatório
                            </Badge>
                          ) : null}
                        </div>
                      </ModalBody>
                      <ModalBody Style="background: #fff;">
                        {option.values.map(value => (
                          <div key={value.id}>
                            <div Style="display:flex; align-items:center; justify-content:space-between;">
                              <div>
                                <Label Style="text-transform: uppercase;">
                                  {value.name}
                                </Label>
                                {value.price ? (
                                  <span Style="display:block; font-weight:bold">
                                    {formatPrice(value.price)}
                                  </span>
                                ) : null}
                              </div>
                              <CustomInput
                                type="radio"
                                id={`valueRadio-${productView.options.indexOf(
                                  option
                                )}${value.id}`}
                                name={`valueRadio${productView.options.indexOf(
                                  option
                                )}`}
                                onClick={() => {
                                  handleRefreshValue(
                                    option.id,
                                    value.id,
                                    value.price,
                                    option.required
                                  );
                                }}
                              />
                            </div>
                            <hr />
                          </div>
                        ))}
                      </ModalBody>
                    </div>
                  );
                case 'multiple':
                  return (
                    <div key={option.id}>
                      <ModalBody Style="background: #f2f2f2;">
                        <div Style="display:flex; align-items:center; justify-content:space-between;">
                          <div>
                            <strong>{option.title}</strong>
                            <span Style="display:block; font-size:12px; font-weight:normal; color:#999">
                              Escolha 1 ou {option.max} opções
                            </span>
                          </div>
                          {option.min > 0 ? (
                            <div>
                              <Badge
                                Style="font-size:12px; font-weight:normal; margin-right: 5px;"
                                variant="secondary"
                              >
                                {`${valueMultiple}/${option.max}`}
                              </Badge>
                              <Badge
                                Style="font-size:12px; font-weight:normal"
                                variant="secondary"
                              >
                                Obrigatório
                              </Badge>
                            </div>
                          ) : null}
                        </div>
                      </ModalBody>
                      <ModalBody Style="background: #fff;">
                        {option.values.map(value => (
                          <div key={value.id}>
                            <div Style="display:flex; align-items:center; justify-content:space-between;">
                              <div>
                                <Label Style="text-transform: uppercase;">
                                  {value.name}
                                </Label>
                                {value.price ? (
                                  <span Style="display:block; font-weight:bold">
                                    {formatPrice(value.price)}
                                  </span>
                                ) : null}
                              </div>
                              <div Style="display: flex; align-items: center;">
                                {valueSpanMultiple[value.id] > 0 ? (
                                  <>
                                    <MdRemoveCircleOutline
                                      size={22}
                                      color="#7159c1"
                                      cursor="pointer"
                                      onClick={() => {
                                        handleRemoveValue(
                                          option.type,
                                          option.id,
                                          value.id,
                                          option.min
                                        );
                                      }}
                                    />
                                    <span Style="margin: 5px;">
                                      {valueSpanMultiple[value.id]}
                                    </span>
                                  </>
                                ) : null}
                                <MdAddCircleOutline
                                  size={22}
                                  color="#7159c1"
                                  cursor="pointer"
                                  onClick={() => {
                                    handleAddValue(
                                      option.type,
                                      option.id,
                                      value.id,
                                      value.price,
                                      option.max,
                                      option.min
                                    );
                                  }}
                                />
                              </div>
                            </div>
                            <hr />
                          </div>
                        ))}
                      </ModalBody>
                    </div>
                  );
                case 'list':
                  return (
                    <div key={option.id}>
                      <ModalBody Style="background: #f2f2f2;">
                        <div Style="display:flex; align-items:center; justify-content:space-between;">
                          <div>
                            <strong>{option.title}</strong>
                            {option.min > 0 ? (
                              <span Style="display:block; font-size:12px; font-weight:normal; color:#999">
                                Escolha 1 ou {option.max} opções
                              </span>
                            ) : null}
                          </div>
                          {option.min > 0 ? (
                            <div>
                              <Badge
                                Style="font-size:12px; font-weight:normal; margin-right: 5px;"
                                variant="secondary"
                              >
                                {`${
                                  valueList[option.id]
                                    ? valueList[option.id]
                                    : '0'
                                }/${option.max}`}
                              </Badge>
                              <Badge
                                Style="font-size:12px; font-weight:normal"
                                variant="secondary"
                              >
                                Obrigatório
                              </Badge>
                            </div>
                          ) : (
                            <Badge
                              Style="font-size:12px; font-weight:normal; margin-right: 5px;"
                              variant="secondary"
                            >
                              {`${
                                valueList[option.id]
                                  ? valueList[option.id]
                                  : '0'
                              }/${option.max}`}
                            </Badge>
                          )}
                        </div>
                      </ModalBody>
                      <ModalBody Style="background: #fff;">
                        {option.values.map(value => (
                          <div key={value.id}>
                            <div Style="display:flex; align-items:center; justify-content:space-between;">
                              <div>
                                <Label Style="text-transform: uppercase;">
                                  {value.name}
                                </Label>
                                {value.price ? (
                                  <span Style="display:block; font-weight:bold">
                                    {formatPrice(value.price)}
                                  </span>
                                ) : null}
                              </div>
                              <div Style="display: flex; align-items: center;">
                                {valueSpanList[
                                  Number(
                                    String(
                                      productView.id + option.id + value.id
                                    )
                                  )
                                ] > 0 && valueList[option.id] ? (
                                  <>
                                    <MdRemoveCircleOutline
                                      size={22}
                                      color="#7159c1"
                                      cursor="pointer"
                                      onClick={() => {
                                        handleRemoveValue(
                                          option.type,
                                          option.id,
                                          value.id,
                                          option.min
                                        );
                                      }}
                                    />
                                    <span Style="margin: 5px;">
                                      {
                                        valueSpanList[
                                          Number(
                                            String(
                                              productView.id +
                                                option.id +
                                                value.id
                                            )
                                          )
                                        ]
                                      }
                                    </span>
                                  </>
                                ) : null}
                                <MdAddCircleOutline
                                  size={22}
                                  color="#7159c1"
                                  cursor="pointer"
                                  onClick={() => {
                                    handleAddValue(
                                      option.type,
                                      option.id,
                                      value.id,
                                      value.price,
                                      option.max,
                                      option.min
                                    );
                                  }}
                                />
                              </div>
                            </div>
                            <hr />
                          </div>
                        ))}
                      </ModalBody>
                    </div>
                  );
                default:
                  return <div />;
              }
            })
          : ''}
        <ModalFooter>
          <Button
            type="button"
            Style={
              isDisabled
                ? 'background: #7159c1; cursor: auto;'
                : 'background: #7159c1;'
            }
            disabled={isDisabled}
            onClick={() => {
              handleAddProduct();
            }}
          >
            <div Style="display: flex; align-items: center; width: 200px; justify-content: space-between;">
              <span>Adicionar</span>
              <strong>{valorTotal}</strong>
            </div>
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
}

const mapStateToProps = state => ({
  amount: state.cart.reduce((amount, product) => {
    amount[product.id] = product.amount;

    return amount;
  }, {}),
});

export default connect(mapStateToProps)(Products);
