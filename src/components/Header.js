import React from "react";

const Header = ({ cartCount }) => {
  return (
    <header style={styles.header}>
          <h1>My React App</h1>
          <div style={styles.cart}>
            <span style={styles.cartCount}>{cartCount}</span>              
          </div>
    </header>
  );
};

const styles = {
  header: {
    backgroundColor: "#333",
    color: "white",
    padding: "15px",
    textAlign: "center",
    },
    cart: {
      position: "relative",
      display: "inline-block",
    },
    cartCount: {
      position: "absolute",
      top: "-5px",
      right: "-5px",
      backgroundColor: "red",
      color: "white",
      borderRadius: "50%",
      width: "20px",
      height: "20px",
      textAlign: "center",
      fontSize: "12px",
    },
};

export default Header;
