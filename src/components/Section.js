import React from "react";

const Section = ({ addToCart }) => {
  return (
    <main style={styles.section}>
      <h2>Welcome to the Section</h2>
          <p>This is the main content area.</p>
          <button style={styles.button} onClick={addToCart}>Add to Cart</button>
    </main>
  );
};

const styles = {
  section: {
    marginLeft: "220px", // To avoid overlap with Sidebar
    padding: "20px",
    },
    button: {
      backgroundColor: "blue",
      color: "white",
      padding: "10px 20px",
      border: "none",
      borderRadius: "5px",
      cursor: "pointer",
    },
};

export default Section;
