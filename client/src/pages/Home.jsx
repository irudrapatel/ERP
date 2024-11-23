import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to /dashboard/adminpanel when Home is loaded
    navigate("/dashboard/adminpanel");
  }, [navigate]);

  return null; // No UI needed for redirection
};

export default Home;
