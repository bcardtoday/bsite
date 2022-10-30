import "./pastEvents.css";
import { ethers } from "ethers";
import { useState, useEffect } from "react";
import abi from "../abi/abi.json";
import bpaperabi from "../abi/bpaperabi.json";
import data from "../data/data.json";
import Popup from "./popup";
import { id } from "ethers/lib/utils";

export function GetPastEvents() {
  const [account, setAccount] = useState("");
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [boxIsOpen, setBoxOpen] = useState(false);
  const [eventLogs, setEventLogs] = useState([]);

  //set networks
  const bpaperContract = new ethers.Contract(
    "0xAEdc4773262c9036BDD3B0c9e4A53F39672A9f26",
    abi,
    provider
  );

  const polyConnection = async () => {
    const chainId = await window.ethereum.request({ method: "eth_chainId" });
    if (chainId !== "0x89") {
      togglePopup();
      window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: "0x89",
            rpcUrls: ["https://polygon-rpc.com/"],
            chainName: "Matic Mainnet",
            nativeCurrency: {
              name: "MATIC",
              symbol: "MATIC",
              decimals: 18,
            },
            blockExplorerUrls: ["https://explorer.matic.network"],
          },
        ],
      });
    }
  };

  const initConnection = async () => {
    if (typeof window.ethereum !== "undefined") {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      polyConnection();
      let tempProvider = null;
      tempProvider = new ethers.providers.Web3Provider(window.ethereum);
      setProvider(tempProvider);
      setAccount(accounts[0]);
      let tempSigner = tempProvider.getSigner();
      setSigner(tempSigner);
    } else {
      console.log("Please install metamask");
    }
  };

  const findTimeLapsed = (tempTimeStamp) => {
    const tempDate = new Date(tempTimeStamp * 1000).toLocaleDateString("en-US");
    const currentTimeStamp = Math.floor(Date.now() / 1000);
    const timeLapsed = currentTimeStamp - tempTimeStamp;
    var h = Math.floor(timeLapsed / 3600);
    var m = Math.floor((timeLapsed % 3600) / 60);
    var s = Math.floor((timeLapsed % 3600) % 60);
    var hDisplay = h > 0 ? h + (h == 1 ? " hr, " : " hr, ") : "";
    var mDisplay = m > 0 ? m + (m == 1 ? " min, " : " min, ") : "";
    var sDisplay = s > 0 ? s + (s == 1 ? " sec" : " sec") : "";
    return hDisplay + mDisplay + sDisplay + " ago";
  };

  const addressToBcardID = async (address) => {
    const bcardContract = new ethers.Contract(
      "0xc6Dd0F44910eC78DAEa928C4d855A1a854752964",
      abi,
      provider
    );
    var bcardIDBigNumber = await bcardContract
      .AddressToTokenID(address)
      .then(async function (bcardIDBigNumber) {
        let bCardID = parseInt(bcardIDBigNumber._hex, 16);
        if (bCardID != 0) {
          return bCardID;
        } else {
          return "non Bcard Holder";
        }
      });
  };

  const initialState = [];

  const clearState = () => {
    setEventLogs({ ...initialState });
  };

  const pastEvents = async () => {
    clearState();
    setEventLogs([]);
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const bcardContract = new ethers.Contract(
      "0xc6Dd0F44910eC78DAEa928C4d855A1a854752964",
      abi,
      provider
    );
    var latestBlockNum = 0;
    provider.getBlockNumber().then(async function (blockNumber) {
      const filter = bcardContract.filters.TransferSingle(null, null, null);
      var data = await bcardContract
        .queryFilter(filter, blockNumber - 10000, blockNumber)
        .then(async function (data) {
          console.log(data);
          for (let i = 1; i <= 10; i++) {
            if (i <= data.length) {
              const tempTimeStamp = (
                await provider.getBlock(data[data.length - i].blockNumber)
              ).timestamp;
              var formattedLapsed = findTimeLapsed(tempTimeStamp);
              var idFrom = await bcardContract.AddressToTokenID(
                data[data.length - i].args[1]
              );
              var idFrom2 = parseInt(idFrom._hex, 16);
              var idTo = await bcardContract.AddressToTokenID(
                data[data.length - i].args[2]
              );
              var sentBcardID = parseInt(
                data[data.length - i].args[3]._hex,
                16
              );
              var idTo2 = parseInt(idTo._hex, 16);
              // let transferInfor =
              //   "Bcard ID " +
              //   sentBcardID +
              //   " was sent from Bcard ID " +
              //   idFrom2 +
              //   " (address " +
              //   data[data.length - i].args[1] +
              //   ") to Bcard ID " +
              //   idTo2 +
              //   " (address " +
              //   data[data.length - i].args[2] +
              //   ") at " +
              //   formattedLapsed;

              let transferInfor =
                "ID " +
                sentBcardID +
                " sent to ID " +
                idTo2 +
                " at " +
                formattedLapsed;

              setEventLogs((oldArray) => [...oldArray, transferInfor]);
            }
          }
        });
    });
  };

  useEffect(() => {
    initConnection();
    pastEvents();
  }, []);

  const togglePopup = () => {
    setBoxOpen(!boxIsOpen);
  };

  return (
    <div>
      <div className="pastEventsHeader">
        <p> View latest Bcard transfers: </p>
        {boxIsOpen && (
          <Popup
            content={
              <div>
                <p>Please switch to Polygon network and retry</p>
              </div>
            }
            handleClose={togglePopup}
          />
        )}
      </div>
      <ol className="containerList">
        {eventLogs.map((index) => (
          <li key={index}>{index}</li>
        ))}
      </ol>
    </div>
  );
}
