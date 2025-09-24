import { useEffect, useState } from "react";
const API_BASE = "http://localhost:4002";
export default function Products() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch(API_BASE + "/products")
      .then((r) => r.json())
      .then(setProducts)
      .catch((err) => console.error(err));
  }, []);

  return (
    <div>
      <h2>Products</h2>
      {products.map((p) => (
        <div key={p.id}>
          <h3>{p.name}</h3>
          <p>{p.price}</p>
        </div>
      ))}
    </div>
  );
}
