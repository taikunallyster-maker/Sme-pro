import React, { useState, useEffect } from "react";
import { auth, db } from "./firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "firebase/auth";

import {
  collection,
  addDoc,
  getDocs
} from "firebase/firestore";

import { jsPDF } from "jspdf";
import { translations } from "./i18n";
import "./styles.css";

export default function App() {
  const [user, setUser] = useState(null);
  const [lang, setLang] = useState("en");
  const t = translations[lang];

  const [sales, setSales] = useState([]);
  const [expenses, setExpenses] = useState([]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [item, setItem] = useState("");
  const [amount, setAmount] = useState("");

  useEffect(() => {
    onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u) loadData();
    });
  }, []);

  const login = async () => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const register = async () => {
    await createUserWithEmailAndPassword(auth, email, password);
  };

  const logout = () => signOut(auth);

  const loadData = async () => {
    const salesSnap = await getDocs(collection(db, "sales"));
    const expSnap = await getDocs(collection(db, "expenses"));

    setSales(salesSnap.docs.map(d => d.data()));
    setExpenses(expSnap.docs.map(d => d.data()));
  };

  const addSale = async () => {
    const data = { item, amount: Number(amount) };
    await addDoc(collection(db, "sales"), data);
    setSales([...sales, data]);
  };

  const addExpense = async () => {
    const data = { item, amount: Number(amount) };
    await addDoc(collection(db, "expenses"), data);
    setExpenses([...expenses, data]);
  };

  const totalSales = sales.reduce((a, b) => a + b.amount, 0);
  const totalExpenses = expenses.reduce((a, b) => a + b.amount, 0);
  const profit = totalSales - totalExpenses;

  const generateInvoice = () => {
    const doc = new jsPDF();
    doc.text("SME Invoice", 10, 10);
    doc.text(`Sales: ${totalSales}`, 10, 20);
    doc.text(`Expenses: ${totalExpenses}`, 10, 30);
    doc.text(`Profit: ${profit}`, 10, 40);
    doc.save("invoice.pdf");
  };

  if (!user) {
    return (
      <div className="container">
        <h2>Login</h2>
        <input placeholder="Email" onChange={e => setEmail(e.target.value)} />
        <input placeholder="Password" type="password" onChange={e => setPassword(e.target.value)} />
        <button onClick={login}>Login</button>
        <button onClick={register}>Register</button>
      </div>
    );
  }

  return (
    <div className="container">

      <div className="topbar">
        <button onClick={() => setLang(lang === "en" ? "sw" : "en")}>
          🌍 Switch Language
        </button>
        <button onClick={logout}>Logout</button>
      </div>

      <h1>SME PRO</h1>

      <div className="summary">
        <div>{t.sales}: {totalSales}</div>
        <div>{t.expenses}: {totalExpenses}</div>
        <div>{t.profit}: {profit}</div>
      </div>

      <div className="section">
        <h3>{t.addSale}</h3>
        <input placeholder="Item" onChange={e => setItem(e.target.value)} />
        <input placeholder="Amount" type="number" onChange={e => setAmount(e.target.value)} />
        <button onClick={addSale}>{t.addSale}</button>
      </div>

      <div className="section">
        <h3>{t.addExpense}</h3>
        <input placeholder="Item" onChange={e => setItem(e.target.value)} />
        <input placeholder="Amount" type="number" onChange={e => setAmount(e.target.value)} />
        <button onClick={addExpense}>{t.addExpense}</button>
      </div>

      <button onClick={generateInvoice}>{t.invoice}</button>

    </div>
  );
                  }
