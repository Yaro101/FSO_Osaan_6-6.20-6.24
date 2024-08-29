import PropTypes from "prop-types";
import { useState, useEffect } from "react";

const Notification = ({ message, duration }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    console.log(`Notification props in component: message=${message}, duration=${duration}`);
    if (message) {
      console.log(`Notification message from Notification Component: ${message}`)
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false)
        console.log('Notification hidden Notification Component' )
      }, duration * 1000);
      return () => clearTimeout(timer);
    } else {
      setVisible(false)
    }
  }, [message, duration]);

  if (!visible) return null;

  const style = {
    display: visible ? "block" : "none",
    border: "solid",
    padding: 10,
    borderWidth: 1,
    marginBottom: 5,
    backgroundColor: "#f8f9fa",
  };

  return <div style={style}>{message}</div>;
};

Notification.propTypes = {
  message: PropTypes.string.isRequired,
  duration: PropTypes.number.isRequired,
};

export default Notification;
