import React, { useContext } from "react";
import { AuthContext } from "../../contexts/session/AuthContext ";
import Nav from "./nav/nav";
import classes from './header.module.css'
export default function Header() {
  const { isAuthenticated, authState } = useContext(AuthContext);

  return (
    <header className={classes.header}>
      <Nav />
    </header>
  );
}
