import React from "react";

const Sidebar = () => {
  return (
    <aside style={styles.sidebar}>
      <ul>
        <li>Home</li>
        <li>About</li>
        <li>Services</li>
        <li>Contact</li>
      </ul>
    </aside>
  );
};

const styles = {
  sidebar: {
    width: "200px",
    background: "#f4f4f4",
    padding: "20px",
    height: "100vh",
    position: "fixed",
  },
};

export default Sidebar;
