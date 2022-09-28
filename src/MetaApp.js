import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import TxList from "./TxList";
import Web3 from "web3";
const RPC_ENDPOINT = "https://eth-rpc.gateway.pokt.network/";
const web3 = new Web3(RPC_ENDPOINT);
function MetaApp() {
  const [errorMessage, setErrorMessage] = useState(null);
  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState(null);
  const [receiverBalance, setReceiverBalance] = useState(null);

  const [button, setButton] = useState("connect wallet");
  const [txs, setTxs] = useState([]);
  const [error, setError] = useState();
  const [receiverAddress, setReceiverAddress] = useState();
  const [receiverAmount, setReceiverAmount] = useState();

  const connectWallethandler = () => {
    if (window.ethereum) {
      window.ethereum
        .request({ method: "eth_requestAccounts" })
        .then((result) => {
          accountchangeHandler(result[0]);
        });
    } else {
      setErrorMessage("Install Metamask");
    }
  };
useState(()=>{
  connectWallethandler()
},[])
  const accountchangeHandler = (newAccount) => {
    setAccount(newAccount);
    getUserBalance(newAccount.toString());
  };
  const getUserBalance = (address) => {
    window.ethereum
      .request({ method: "eth_getBalance", params: [address, "latest"] })
      .then((res) => setBalance(ethers.utils.formatEther(res)));
  };

  const getReceiverBalance = (receiverAddress) => {
    console.log();
    window.ethereum
      .request({
        method: "eth_getBalance",
        params: [receiverAddress, "latest"],
      })
      .then((res) => setReceiverBalance(ethers.utils.formatEther(res)));
  };

  useEffect(() => {
    console.log("receiverBalance", receiverBalance);
    console.log(
      "receiverBalancePreviousBalance",
      parseFloat(receiverBalance + receiverAmount)
    );

    console.log("receiverAddress", receiverAddress);
  }, [receiverBalance]);

  const chainChangedhandler = () => {
    window.location.reload();
  };
  window.ethereum.on("accountsChanged", accountchangeHandler);
  window.ethereum.on("chainChanged", chainChangedhandler);

  const startPayment = async ({ setError, setTxs, ether, addr }) => {
    try {
      if (!window.ethereum)
        throw new Error("No crypto wallet found. Please install it.");

      await window.ethereum.request("eth_requestAccounts");
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      console.log("provider", provider);
      const signer = provider.getSigner();
      console.log("Signer", signer);
      ethers.utils.getAddress(addr);
      const tx = await signer.sendTransaction({
        to: addr,
        value: ethers.utils.parseEther(ether),
      });
      console.log({ ether, addr });
      debugger;
      console.log("tx", tx);
      setTxs([tx]);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    getReceiverBalance(receiverAddress);
    // getGasAmount();
    const data = new FormData(e.target);
    await startPayment({
      setError,
      setTxs,
      ether: data.get("ether"),
      addr: data.get("addr"),
      //   gasfees: data.get("addr"),
    });
    const lastBlock = await web3.eth.getBlockNumber();
    console.log("last block num", lastBlock);
    web3.eth
      .getBlock(lastBlock)
      .then((blockResults) =>
        console.log("block results", blockResults, blockResults.gasUsed)
      );
    // console.log("Gas Used",blockResults.gasUsed)
  };
  // console.log("tx", txs);
  // const getGasAmount = async (account, receiverAddress, receiverAmount) => {
  //   const gasAmount = await web3.eth.getGasPrice({
  //     to: receiverAddress,
  //     from: account,
  //     value: web3.utils.toWei(`${receiverAmount}`, "ether"),
  //   });
  // //   console.log("gassvalue", value);
  //   return gasAmount;
  // };
  //   const getGasAmount = async () => {
  //     window.ethereum
  //       .request({
  //         method: "eth_sendTransaction",
  //         params: [
  //           {
  //             from: window.ethereum.selectedAddress,
  //             to: receiverAddress,
  //             // value: receiverAmount,
  //             value: ethers.utils.parseUnits(`${receiverAmount}`, "ether"),
  //             //gasPrice: "0x09184e72a000",
  //             gas: "0x2710", // If I don't use it, the gas fee goes up.
  //             //data: "0x7f7465737432000000000000000000000000000000000000000000000000000000600057",
  //             chainId: window.ethereum.networkVersion,
  //           },
  //         ],
  //       })
  //       .then((txHash) => console.log("txhashh",txHash))
  //       .catch((error) => console.error);
  //   };
  const previousBalance = parseFloat(balance + receiverAmount);

  return (
    <div>
      <h2>connection of metamask using etherium</h2>
      <button onClick={connectWallethandler}>{button}</button>
      {errorMessage}
      <span
        style={{
          display: "flex",
          justifyContent: "space-around",
          backgroundColor: "lightcoral",
        }}
      >
        <div>
          <h3>Your Address:</h3>
          {account}
        </div>
        <div>
          <h3>Your Balance:</h3>
          {balance}
        </div>
        <div>
          <h3>Your Previous Balance:</h3>
          {previousBalance}
        </div>
      </span>
      <form onSubmit={handleSubmit}>
        <div>
          <main>
            <h1>Send ETH payment</h1>
            <div>
              <div>
                <input
                  type="text"
                  onChange={(e) => setReceiverAddress(e.target.value)}
                  name="addr"
                  placeholder="Recipient Address"
                />
              </div>
              <div className="my-3">
                <input
                  onChange={(e) => setReceiverAmount(e.target.value)}
                  name="ether"
                  type="text"
                  placeholder="Amount in ETH"
                />
              </div>
            </div>
          </main>
          <span className="p-4">
            <button type="submit">Pay now</button>
            <TxList txs={txs} />
          </span>
        </div>
      </form>
      {/* <span>
        <div>
          <h3>Receiver Balance:</h3>
          {receiverBalance}
        </div>
        <div>
          <h3>Receiver Previous Balance:</h3>
          {parseFloat(receiverBalance + receiverAmount)}
        </div>
      </span> */}
    </div>
  );
}

export default MetaApp;
