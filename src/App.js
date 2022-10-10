import './App.css';
import {ethers} from "ethers";
import {useState, useEffect} from "react";
import { GiCandyCanes } from "react-icons/gi";
import abi from "./abi/abi.json";
import data from "./data/data.json";
import { hexConcat } from 'ethers/lib/utils';


function App() {
  const [account,setAccount]=useState("");
  const [provider,setProvider]=useState(null);
  const [signer, setSigner] = useState(null);
  const [nfts,setNfts]= useState(data);
  const [tempURL,setURL]=useState(null);
  const [bcardIDofAddress,setbcardIDofAddress]=useState(null);
  const [addressOfENS,setaddressOfENS]=useState(null);

  //set networks
  const bcardContract = new ethers.Contract("0xc6Dd0F44910eC78DAEa928C4d855A1a854752964",abi,provider);
  const Web3 = require('web3')
  const ensInfura = new Web3(new Web3.providers.HttpProvider("https://mainnet.infura.io/v3/5f4ad9f5a7af44cf9b263703076aefd7")) 

  const balance = async(nft)=>{
    const contract = new ethers.Contract(nft.address,abi,provider);
    const tempBalance = await contract.balanceOf(account,nft.id);
    const tempNfts = [...nfts.list];
    const tempNft = tempNfts[tempNfts.findIndex((obj)=>obj.id===nft.id)];
    tempNft.owner = tempBalance >0;
    tempNft.count = tempBalance.toString();
    setNfts({
      list:tempNfts,
    })
  }

  const checkCollection = () => {
    data.list.forEach(nft => {
      balance(nft);
    });
  }

  const initConnection = async () => {
    if (typeof window.ethereum !=="undefined"){
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      let tempProvider = new ethers.providers.Web3Provider(window.ethereum);
      setProvider(tempProvider);
      setAccount(accounts[0]);
      let tempSigner = tempProvider.getSigner();
  		setSigner(tempSigner);
    } else {
      console.log("Please install metamask");
    }
  };
  
  const viewBcardHandler = async(event) => {
		event.preventDefault();
		const tempURL = await bcardContract.uri(event.target.BcardID.value);
    const jsonURL = JSON.parse(atob(tempURL.substring(29)));
    setURL(jsonURL.image);
	}

  const ENSToBcardIDHandler = async(event) => {
		event.preventDefault();
    ensInfura.eth.ens.getOwner(event.target.address.value+'.eth').then(async function (address) {
      setaddressOfENS(address);
      var bcardIDBigNumber = await bcardContract.AddressToTokenID(address);
      let bCardID = parseInt(bcardIDBigNumber._hex, 16);
      setbcardIDofAddress(bCardID);
	  });
  }

  const transferToENSHandler = async(event) => {
		event.preventDefault();
    

    ensInfura.eth.ens.getOwner(event.target.ens.value+'.eth').then(async function (address) {
      const sendTo = address.toString();
      
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const nftContract = new ethers.Contract("0xc6Dd0F44910eC78DAEa928C4d855A1a854752964", abi, signer);
      const accounts = await window.ethereum.request({method: "eth_requestAccounts",});
      const currentAccount = accounts[0].toString();
      
      // var bcardIDBigNumber = await bcardContract.AddressToTokenID(currentAccount);
      // let bCardID = parseInt(bcardIDBigNumber._hex, 16);
      let nftTransfer = await nftContract["safeTransferFrom(address,address,uint256,uint256,bytes)"](currentAccount, sendTo , event.target.bcardID.value , 1 , "0x");
	  });
  }

  useEffect(() => {
    initConnection();
  },[]);

  useEffect(() => {
    checkCollection();
  },[account]);

  return (
    <div className="page">
      <div className="header">
        <img src={require(`./assets/images/logo.png`)} alt="Logo" className="BcardLogo"/>
        <p>
          Bcard Transfer
          </p>
        {account ===""?(
            <button onClick={initConnection} className="button">
              Connect
            </button>
          ) : (
            <p>...{account.substring(account.length-7)}</p>
          )}
      </div>
      
      <div className="viewBcard">
        <form onSubmit={viewBcardHandler}>
          <input id="BcardID" type="number"/>
          <button type={"submit"}> View Bcard ID </button>
          <p>
               
          </p>
          <img
            src = {tempURL}
            className="" alt=""
          />
        </form>
      </div>

      <div className="ENSToBcardID">
        <form onSubmit={ENSToBcardIDHandler}>
          <input id="address" type="text"/>
          <button type={"submit"}> Get address & Bcard ID of this ENS </button>
          <p>
            {addressOfENS}
          </p>
          <p>
            {bcardIDofAddress}
          </p>
        </form>
      </div>

      <div className="transfer">
        <form onSubmit={transferToENSHandler}>
          <input id="bcardID" type="number"/>
          <input id="ens" type="text"/>
          <button type={"submit"}> Send Bcard ID ? to ENS ? </button>
          <p>
            
          </p>
        </form>
      </div>

      {/* <div className="main">
        {nfts.list.map((nft,index) =>{
          return(
            <div key={index} className="card">
              <div style={{position: "relative"}}>
                <a target={"_blank"} rel="noreferrer" href={`http://opensea.io/assets/matic/0xc6dd0f44910ec78daea928c4d855a1a854752964/${nft.id}`}>
                  <img
                    src={require(`./assets/images/opensea.png`)}
                    className="cardImage" alt=""
                  />
                </a>
                <GiCandyCanes 
                  className="cardImage"
                  style={{opacity:nft.owner? 1:0.2}}
                />
                <p className="counter">{nft.count}</p>
              </div>
              <img 
                src={require(`./assets/images/${nft.id}.${nft.type}`)} 
                className="nftImage" alt=""
                style={{opacity:nft.owner? 1:0.2}}
              />
              <p className="nftText">{nft.name}</p>
            </div>
          )
        })}

      </div> */}
      
    </div>
  );
}

export default App;
