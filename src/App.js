import React, { useState } from "react";
import Header from "./components/Header";
import Section from "./components/Section";
import Sidebar from "./components/Sidebar";
import Footer from "./components/Footer";

function App() {
  const [count, setCount] = useState(0);
  const addToCart =() => {
    setCount(count + 1);
  }
  return (
    <div>
      <Header cartCount={count} />
      <div style={{ display: "flex" }}>
        <Sidebar />
        <Section addToCart={addToCart}/>
      </div>
      <Footer />
    </div>
  );
}

export default App;