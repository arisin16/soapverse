import logo from './logo.svg';
import './App.css';
import React, { useState, useEffect } from "react";
import Unity, { UnityContext } from "react-unity-webgl";


function App() {
  const WALLET = {
  "public": "z+1CQKs6w9eQVDzBuJADhx2wDZTWjAQ6mYWJhnQp+qpaDrMxK6tsZj6C+lo022VK6XbE7pecFDUJAfvAJT3nqw==",
  "private": "gVs/kdRiu85pYNpOX3QEe9rvz/Zy5FRd9LIG+rUwt2Q=",
  "address": "0x8f80744afb707f09bfd3453263c6f4dde4966176"
}

const unityContext = new UnityContext({
  loaderUrl: "build/Web1.loader.js",
  dataUrl: "build/Web1.data",
  frameworkUrl: "build/Web1.framework.js",
  codeUrl: "build/Web1.wasm",
});
const [progression, setProgression] = useState(0);

useEffect(function () {
  unityContext.on("progress", function (progression) {
    setProgression(progression);
  });
}, []);

  const [balance, setBalance] = useState('');


  async function getBalance(token, wallet) {
    const balance = await fetch('http://testnet.newrl.net:8182/get-balances?balance_type=TOKEN_IN_WALLET&token_code=${token}&wallet_address=${wallet}')
    .then((res) => res.json())

    console.log(balance)
    setBalance(balance['balance'])
  }

  async function transferToken(destWallet, amountToSend) {
    const unsignedTransaction = await fetch('http://testnet.newrl.net:8182/add-transfer', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(
      {
        "transfer_type": 5,
        "asset1_code": "SOAP",
        "asset2_code": "",
        "wallet1_address": WALLET['address'],
        "wallet2_address": destWallet,
        "asset1_qty": amountToSend,
        "asset2_qty": 0
      }
    )}).then((res) => res.json());
    
    const signedTransaction = await fetch('http://testnet.newrl.net:8182/sign-transaction', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(
      {
        "wallet_data": WALLET,
        "transaction_data": unsignedTransaction
      }
    )}).then((res) => res.json());
    
    const validationResult = await fetch('http://testnet.newrl.net:8182/submit-transaction', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(
      signedTransaction
    )}).then((res) => res.json());
    
    console.log(validationResult)

  }

  return (
    <div className="App">
      <header className="App-header">
        Balance: {balance}
        <button onClick = {() => getBalance(WALLET['address'], 'SOAP')}>Get Balance</button>
      
        <button onClick = {() => transferToken('0x7930939f1e79c4cb9d38569273d13665a68b6378', 5000)}>Send Tokens</button>
      
      </header>
      <p>Loading {progression * 100} percent...</p>
      <Unity style={{width: "80%",

          justifySelf: "right",


          alignSelf: "right",
          }}
            unityContext={unityContext} 
        />
    </div>
  );
}

export default App;
