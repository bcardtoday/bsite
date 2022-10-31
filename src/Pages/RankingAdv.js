import "./RankingAdv.css";
import { ethers } from "ethers";
import { useState, useEffect } from "react";
import abi from ".././abi/abi.json";
import bmapAbi from ".././abi/bmapAbi.json";
import data from ".././data/data.json";
import Popup from ".././components/popup";

export function RankingAdv() {
  const [account, setAccount] = useState("");
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [boxIsOpen, setBoxOpen] = useState(false);
  const BcardContractAddr = "0xc6Dd0F44910eC78DAEa928C4d855A1a854752964";

  const polyConnection = async () => {
    const chainId = await window.ethereum.request({ method: "eth_chainId" });
    if (chainId != "0x89") {
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

  const Card = (
    BcardID,
    numBcardCollected,
    ensName,
    subText,
    address,
    owns,
    owned
  ) => {
    return {
      BcardID: BcardID,
      numBcardCollected: numBcardCollected,
      ensName: ensName,
      subText: subText,
      address: address,
      owns: owns,
      owned: owned,
    };
  };
  const initialCard = [
    {
      BcardID: "-",
      numBcardCollected: 0,
      ensName: "-",
      subText: "-",
      address: "-",
      owns: "-",
      owned: "-",
    },
  ];
  const [bcardInforArray, setbcardInforArray] = useState(initialCard);

  const viewRankingWithOwnershipHandler = async (event) => {
    event.preventDefault();
    polyConnection();
    setbcardInforArray(initialCard);
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    var BcardContract = new ethers.Contract(BcardContractAddr, abi, provider);
    let tempBigNumber = await BcardContract["totalSupply()"]();
    let BcardTotalSupply = parseInt(tempBigNumber._hex, 16);
    let IDfrom = BcardTotalSupply;
    let IDto = 1;
    if (event.target.IDfrom.value != "") {
      if (event.target.IDfrom.value > event.target.IDto.value) {
        IDfrom = event.target.IDfrom.value;
        IDto = event.target.IDto.value;
      } else {
        IDfrom = event.target.IDto.value;
        IDto = event.target.IDfrom.value;
      }
    }

    for (let i = IDfrom; i >= IDto; i--) {
      var individualBcardInforArray = await BcardContract.cards(i);
      let tempCountBigNumber = await BcardContract[
        "checkTotalCardCollected(uint256)"
      ](i);
      let CountBigNumber = parseInt(tempCountBigNumber._hex, 16);

      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      var currentAccount = accounts[0].toString();
      if (event.target.bcardID.value != "") {
        var byBcard = event.target.bcardID.value;
        currentAccount = await BcardContract.getMinter(
          event.target.bcardID.value
        );
      } else {
        var tempbyBcard = await BcardContract.AddressToTokenID(currentAccount);
        var byBcard = parseInt(tempbyBcard._hex, 16);
      }

      //Sent: Num of your Bcards he collected:
      const tempNumHeOwns = await BcardContract.balanceOf(
        individualBcardInforArray[2],
        byBcard
      );
      let tempNumHeOwns2 = parseInt(tempNumHeOwns._hex, 16);

      //Received: Num of this Bcard that you own:
      var matchedMinterAddress = await BcardContract.getMinter(byBcard);
      const tempNumYouOwned = await BcardContract.balanceOf(
        matchedMinterAddress,
        i
      );
      let tempNumYouOwned2 = parseInt(tempNumYouOwned._hex, 16);

      try {
        var newObject = Card(
          i,
          CountBigNumber,
          individualBcardInforArray[0],
          individualBcardInforArray[1],
          individualBcardInforArray[2],
          tempNumHeOwns2,
          tempNumYouOwned2
        );
      } catch (err) {
        var newObject = Card(
          i,
          CountBigNumber,
          "unsupported charater in text",
          "unsupported charater in text",
          0,
          tempNumHeOwns2,
          tempNumYouOwned2
        );
      }
      setbcardInforArray((oldArray) => [...oldArray, newObject]);
    }
  };

  useEffect(() => {
    initConnection();
  }, []);

  const togglePopup = () => {
    setBoxOpen(!boxIsOpen);
  };

  return (
    <div className="rankingPage">
      <div className="viewRankingHeader">
        <p> View Bcard Ranking: </p>
      </div>

      <div className="viewRanking">
        <form onSubmit={viewRankingWithOwnershipHandler}>
          <label> View ranking with ownership as Bcard ID: </label>
          <input id="bcardID" type="number" />
          <label> range from ID: </label>
          <input id="IDfrom" type="number" />
          <label> to ID: </label>
          <input id="IDto" type="number" />
          <button type={"submit"}> View Ranking </button>
          <p> </p>
          <label>
            {" "}
            Please only click once, refresh the page if you want to load new
            list{" "}
          </label>
          <ol className="rankingList">
            {bcardInforArray
              .sort((a, b) =>
                a.numBcardCollected > b.numBcardCollected ? 1 : -1
              )
              .reverse()
              .map((index) => (
                <li key={index.BcardID}>
                  ID: {index.BcardID} | Collected:
                  {index.numBcardCollected} | {index.ensName} | {index.subText}|
                  Sent: {index.owns}| Received:{index.owned}
                </li>
              ))}
          </ol>
        </form>
      </div>
    </div>
  );
}
