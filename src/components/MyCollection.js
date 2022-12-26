import "./MyCollection.css";
import { ethers } from "ethers";
import { useState, useEffect } from "react";
import abi from ".././abi/abi.json";
import bpaperabi from ".././abi/bpaperabi.json";
import data from ".././data/data.json";
import Popup from ".././components/popup";

export function MyCollection() {
  const [account, setAccount] = useState("");
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [boxIsOpen, setBoxOpen] = useState(false);
  const [nfts, setNfts] = useState(data);
  const [tempURL, setURL] = useState(null);
  const [numCardOwned, setNumCardOwned] = useState(null);
  const [paperLogs, setPaperLogs] = useState([]);
  const [cardLogs, setcardLogs] = useState([]);
  const polyAPI =
    "https://polygon-mainnet.infura.io/v3/f323f21ff16a408da14744c8046a3572";
  const ethAPI =
    "https://mainnet.infura.io/v3/5f4ad9f5a7af44cf9b263703076aefd7";
  const network = process.env.POLYGON_NETWORK;
  const polyProvider = new ethers.providers.InfuraProvider(
    network,
    process.env.polyAPI
  );
  let web3UserPoly = null;

  //set networks

  const Web3 = require("web3");
  const ensInfura = new Web3(new Web3.providers.HttpProvider(ethAPI));

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

      // if (tempProvider == null) {
      //   tempProvider = polyProvider;
      //   setProvider(tempProvider);
      // } else {
      setProvider(tempProvider);
      // }

      setAccount(accounts[0]);
      let tempSigner = tempProvider.getSigner();
      setSigner(tempSigner);
    } else {
      console.log("Please install metamask");
    }
  };

  const viewCardCollectionHandler = async (event) => {
    try {
      event.preventDefault();
    } catch (err) {}
    // viewCollectionHandler();
    polyConnection();
    setcardLogs([]);
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const bcardContract = new ethers.Contract(
      "0xc6Dd0F44910eC78DAEa928C4d855A1a854752964",
      abi,
      provider
    );

    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    const currentAccount = accounts[0].toString();
    var thisBcardIDtemp = await bcardContract.AddressToTokenID(currentAccount);
    let thisBcardID = parseInt(thisBcardIDtemp._hex, 16);
    try {
      if (event.target.bcardID.value !== "") {
        thisBcardID = event.target.bcardID.value;
      }
    } catch (err) {}

    await bcardContract.totalSupply().then(async function (bcardSupply) {
      var bcardSupplyNum = parseInt(bcardSupply._hex, 16);
      var hisAddr = await bcardContract.getMinter(thisBcardID);
      for (let i = 0; i < bcardSupplyNum; i++) {
        try {
          const tempNumOwned = await bcardContract.balanceOf(
            hisAddr,
            bcardSupplyNum - i
          );
          let tempNumOwned2 = parseInt(tempNumOwned._hex, 16);

          if (tempNumOwned2 > 0) {
            await bcardContract
              .uri(bcardSupplyNum - i)
              .then(async function (tempURL) {
                const jsonURL = JSON.parse(atob(tempURL.substring(29)));
                setcardLogs((oldArray) => [
                  ...oldArray,
                  { src: jsonURL.image },
                ]);
              });
          } else {
            let card = await bcardContract.cards(bcardSupplyNum - i);
            let cardID = bcardSupplyNum - i;
            let tempSVG =
              '<svg width="600" height="320" xmlns="http://www.w3.org/2000/svg">' +
              '<rect width="600" height="320" fill="hsl(0, 0%, 40%)"/>' +
              '<text x="8%" y="66%" fill="hsl(0, 100%, 0%)" text-anchor="left" ' +
              'font-size="25"' +
              ' font-weight="bold" font-family="Bahnschrift Condensed">' +
              card[0] +
              "</text>" +
              '<text x="50%" y="50%" fill="hsl(0, 0%, 90%)" text-anchor="middle" font-size="40" font-weight="bold" font-family="Bahnschrift Condensed">' +
              "Bcard ID " +
              cardID +
              "</text>" +
              '<text x="8%" y="78%" fill="hsl(0, 100%, 0%)" text-anchor="left" font-size="18" font-weight="bold" font-family="Bahnschrift Condensed">' +
              card[1] +
              "</text>" +
              '<line x1="3%" y1="4%" x2="97%" y2="4%" style="stroke:rgb(130,130,130);stroke-width:2" />' +
              '<line x1="3%" y1="96%" x2="97%" y2="96%" style="stroke:rgb(130,130,130);stroke-width:2" />' +
              '<line x1="3%" y1="4%" x2="3%" y2="96%" style="stroke:rgb(130,130,130);stroke-width:2" />' +
              '<line x1="97%" y1="4%" x2="97%" y2="96%" style="stroke:rgb(130,130,130);stroke-width:2" />' +
              '<line x1="8%" y1="70%" x2="20%" y2="70%" style="stroke:rgb(0,0,0);stroke-width:2" />' +
              "</svg>";

            var encodedData = window.btoa(tempSVG);
            var encodedData2 = "data:image/svg+xml;base64," + encodedData;
            setcardLogs((oldArray) => [...oldArray, { src: encodedData2 }]);
          }
        } catch (err) {}
      }

      console.log(cardLogs.length);
    });
  };

  // const viewCollectionHandler = async (event) => {
  //   try {
  //     event.preventDefault();
  //   } catch (err) {}

  //   polyConnection();
  //   setPaperLogs([]);
  //   const provider = new ethers.providers.Web3Provider(window.ethereum);
  //   const bpaperContract = new ethers.Contract(
  //     "0x3C2309aCB65dE5BEca0aec437147f514C1cAB651",
  //     abi,
  //     provider
  //   );

  //   const bcardContract = new ethers.Contract(
  //     "0xc6Dd0F44910eC78DAEa928C4d855A1a854752964",
  //     abi,
  //     provider
  //   );

  //   const accounts = await window.ethereum.request({
  //     method: "eth_requestAccounts",
  //   });
  //   const currentAccount = accounts[0].toString();
  //   var thisBcardIDtemp = await bcardContract.AddressToTokenID(currentAccount);
  //   let thisBcardID = parseInt(thisBcardIDtemp._hex, 16);
  //   try {
  //     if (event.target.bcardID.value !== "") {
  //       thisBcardID = event.target.bcardID.value;
  //     }
  //   } catch (err) {}
  //   console.log(thisBcardID);

  //   await bpaperContract.totalSupply().then(async function (bpaperSupply) {
  //     var bpaperSupplyNum = parseInt(bpaperSupply._hex, 16);
  //     var hisAddr = await bcardContract.getMinter(thisBcardID);
  //     console.log(hisAddr);
  //     for (let i = 0; i < bpaperSupplyNum; i++) {
  //       try {
  //         const tempNumOwned = await bpaperContract.balanceOf(
  //           hisAddr,
  //           bpaperSupplyNum - i
  //         );
  //         let tempNumOwned2 = parseInt(tempNumOwned._hex, 16);

  //         if (tempNumOwned2 > 0) {
  //           console.log("capture" + i);
  //           await bpaperContract
  //             .uri(bpaperSupplyNum - i)
  //             .then(async function (tempURL) {
  //               const jsonURL = JSON.parse(atob(tempURL.substring(29)));
  //               setPaperLogs((oldArray) => [
  //                 ...oldArray,
  //                 { src: jsonURL.image },
  //               ]);
  //             });
  //         }

  //       } catch (err) {}
  //     }
  //   });
  // };

  const bcardDisplay = () => {
    return (
      <div className="latestBcard">
        {cardLogs.map((imgSrc, index) => (
          <img
            src={imgSrc.src}
            key={index}
            alt=""
            className="BcardReaderImage"
          />
        ))}
      </div>
    );
  };

  // const bpaperDisplay = () => {
  //   return (
  //     <div className="latestBpaper">
  //       {paperLogs.map((imgSrc, index) => (
  //         <img
  //           src={imgSrc.src}
  //           key={index}
  //           alt=""
  //           className="BpaperReaderImage"
  //         />
  //       ))}
  //     </div>
  //   );
  // };

  const transferToBcardHandler = async (event) => {
    event.preventDefault();
    polyConnection();
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const bcardContract = new ethers.Contract(
      "0xc6Dd0F44910eC78DAEa928C4d855A1a854752964",
      abi,
      signer
    );
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    const currentAccount = accounts[0].toString();
    var sendTo = await bcardContract.getMinter(event.target.toBcardID.value);
    var myBcardID = await bcardContract.AddressToTokenID(currentAccount);
    let nftTransfer = await bcardContract[
      "safeTransferFrom(address,address,uint256,uint256,bytes)"
    ](currentAccount, sendTo, myBcardID, 1, "0x");
  };

  useEffect(() => {
    initConnection();
    viewCardCollectionHandler();
  }, []);

  const togglePopup = () => {
    setBoxOpen(!boxIsOpen);
  };

  return (
    <div className="paperPageGallery">
      <div className="viewCollection">
        <p> View Collection of: </p>
      </div>
      <div className="viewCollection">
        <form onSubmit={viewCardCollectionHandler}>
          <label>Bcard ID: </label>
          <input id="bcardID" type="number" />
          <button type={"submit"}> View </button>
        </form>
      </div>

      <div className="transferBcardCollection-title">
        <p> to Bcard ID </p>
      </div>

      <div className="transferBcardCollection">
        <form onSubmit={transferToBcardHandler}>
          <label> Recipient Bcard ID: </label>
          <input id="toBcardID" type="number" />
          <button type={"submit"}> Send my Bcard</button>
          <p></p>
        </form>
      </div>

      {bcardDisplay()}
      <div></div>
      {/* {bpaperDisplay()} */}
    </div>
  );
}
