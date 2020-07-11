import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const prods = await AsyncStorage.getItem('@GoMarketplace:products');

      if (prods) setProducts(JSON.parse(prods));
    }

    loadProducts();
  }, []);

  useEffect(() => {
    async function saveProducts(): Promise<void> {
      if (products && products?.length > 0) {
        await AsyncStorage.setItem(
          '@GoMarketplace:products',
          JSON.stringify(products),
        );
      } else {
        await AsyncStorage.removeItem('@GoMarketplace:products');
      }
    }

    saveProducts();
  }, [products]);

  const addToCart = useCallback(
    async product => {
      const prod = product;

      if (
        products?.length > 0 &&
        products.findIndex(p => p.id === prod.id) > -1
      ) {
        const state = products.map(pro => {
          const p = pro;
          if (p.id === product.id) {
            p.quantity += 1;
          }
          return p;
        });
        setProducts([...state]);
      } else {
        prod.quantity = 1;
        setProducts(state => [...state, prod]);
      }
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      // TODO INCREMENTS A PRODUCT QUANTITY IN THE CART
      const state = products.filter(product => {
        const prod = product;
        if (prod.id === id) {
          prod.quantity += 1;
        }
        return prod;
      });

      setProducts([...state]);
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      // TODO DECREMENTS A PRODUCT QUANTITY IN THE CART
      const state = products.filter(product => {
        const prod = product;
        if (prod.id === id) {
          prod.quantity -= 1;
        }
        return prod;
      });

      setProducts([...state.filter(prod => prod.quantity > 0)]);
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
