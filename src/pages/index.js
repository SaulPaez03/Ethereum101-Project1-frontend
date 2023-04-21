import { Inter } from "next/font/google";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import abi from "../contracts/DApp.json";
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";

export const Home = () => {
  const [isWallectConnected, setisWallectConnected] = useState(false);
  const [userWallet, setUserWallet] = useState(null);
  const [ownerWallet, setOwnerWallet] = useState(null);
  const [isOwnerWallet, setIsOwnerWallet] = useState(false);
  const [appName, setAppName] = useState(null);
  const [currentThreshold, setCurrentThreshold] = useState(null);
  const [currentBalance, setCurrentBalance] = useState(null);
  const [inputValue, setInputValue] = useState({
    name: "",
    threshold: null,
    deposit: null,
    withdraw: null,
  });
  const [error, setError] = useState("");

  const contractAdress = "0x318b5216e1e9ee0da877a4da54f0ea3bd0682737";
  const contractAbi = abi.abi;

  const checkIsWalletConnected = async () => {
    try {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });

        const account = accounts[0];
        setisWallectConnected(true);
        setUserWallet(account);
      } else {
        setError(
          "Could not find Metamask, please install the extension and try again."
        );
        console.log("Metamask not found");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getOwnerWallet = async () => {
    try {
      if (window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(
          contractAdress,
          contractAbi,
          signer
        );

        let DAOOwner = await contract.owner();
        setOwnerWallet(DAOOwner);

        const [account] = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        if (account.toLowerCase() === DAOOwner.toLowerCase())
          setIsOwnerWallet(true);
      } else {
        setError(
          "Could not find Metamask, please install the extension and try again."
        );
        console.log("Metamask not found");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getCurrentBalance = async () => {
    try {
      if (window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(
          contractAdress,
          contractAbi,
          signer
        );
        const currentBalance = await contract.getCurrentBalance();
        setCurrentBalance(ethers.formatEther(currentBalance));
      } else {
        setError(
          "Could not find Metamask, please install the extension and try again."
        );
        console.log("Metamask not found");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getCurrentThreshold = async () => {
    try {
      if (window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(
          contractAdress,
          contractAbi,
          signer
        );
        let currentThreshold = await contract.getCurrentThreshold();
        currentThreshold = ethers.formatEther(currentThreshold);
        console.log("threshold", currentThreshold);
        setCurrentThreshold(currentThreshold);
      } else {
        setError(
          "Could not find Metamask, please install the extension and try again."
        );
        console.log("Metamask not found");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const setTargetThresholdHandler = async (event) => {
    event.preventDefault();
    try {
      if (window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(
          contractAdress,
          contractAbi,
          signer
        );

        if (currentBalance < currentThreshold) {
          setError(
            "you cannot modify your threshold if your balance is less than the current threshold"
          );

          return;
        }
        if (currentThreshold === inputValue.threshold) {
          return setError(
            "Please use a value different to you current threshold"
          );
        }

        const txn = await contract.setThreshold(
          ethers.parseEther(inputValue.threshold)
        );

        await txn.wait();

        console.log(
          "Threshold set to: ",
          inputValue.deposit,
          ". TXN - ",
          txn.hash
        );
        getCurrentThreshold();
        setInputValue((prevValue) => ({ ...prevValue, threshold: null }));
      } else {
        setError(
          "Could not find Metamask, please install the extension and try again."
        );
        console.log("Metamask not found");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getDaoName = async () => {
    try {
      if (window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(
          contractAdress,
          contractAbi,
          signer
        );

        let DAOName = await contract.DAOName();
        DAOName = ethers.decodeBytes32String(DAOName);
        setAppName(DAOName);
      } else {
        setError(
          "Could not find Metamask, please install the extension and try again."
        );
        console.log("Metamask not found");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const changeDAPPNameHandler = async (event) => {
    event.preventDefault();

    try {
      if (window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(
          contractAdress,
          contractAbi,
          signer
        );

        const txn = await contract.setDAOName(
          ethers.encodeBytes32String(inputValue.name)
        );

        await txn.wait();

        console.log("DAOName set to: ", inputValue.name, ". TXN - ", txn.hash);

        getDaoName();
        setInputValue((prevValue) => ({ ...prevValue, name: "" }));
      } else {
        setError(
          "Could not find Metamask, please install the extension and try again."
        );
        console.log("Metamask not found");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const depositBalanceHandler = async (event) => {
    event.preventDefault();
    try {
      if (window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(
          contractAdress,
          contractAbi,
          signer
        );

        const txn = await contract.depositBalance({
          value: ethers.parseEther(inputValue.deposit),
        });

        console.log("Depositing money....");

        await txn.wait();
        console.log(
          "Deposited ",
          inputValue.deposit,
          "ether. TXN - ",
          txn.hash
        );
        getCurrentBalance();
        setInputValue((prevValue) => ({ ...prevValue, deposit: null }));
      } else {
        setError(
          "Could not find Metamask, please install the extension and try again."
        );
        console.log("Metamask not found");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const withdrawFundsHandler = async (event) => {
    event.preventDefault();

    try {
      if (window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(
          contractAdress,
          contractAbi,
          signer
        );

        if (inputValue.withdraw > currentBalance) {
          return setError(
            "You cannot withdraw an ammount greater than your current balance"
          );
        }

        const myAddress = await signer.getAddress();

        const txn = await contract.withdrawBalancea(
          myAddress,
          ethers.parseEther(inputValue.withdraw)
        );

        console.log("Withdrawing funds");

        await txn.wait();
        console.log(
          `Withdrawed ${inputValue.withdraw} to ${myAddress}. TXN - ${txn.hash}`
        );
      } else {
        setError(
          "Could not find Metamask, please install the extension and try again."
        );
        console.log("Metamask not found");
      }
      getCurrentBalance();
      setInputValue((prevValue) => ({ ...prevValue, withdraw: null }));
    } catch (error) {
      console.log(error);
    }
  };

  const handleInputChange = (e) => {
    if (e.target.name !== "name" && e.target.value < 0) {
      return setError("You can only enter positive amounts or zero");
    }
    setError("");
    setInputValue((prevValue) => ({
      ...prevValue,
      [e.target.name]: e.target.value,
    }));
  };
  useEffect(() => {
    checkIsWalletConnected();
    getOwnerWallet();
    getCurrentBalance();
    getCurrentThreshold();
    getDaoName();
  }, [isWallectConnected]);
  function clearError() {
    setError("");
  }
  const theme = useTheme();
  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        height: "100vh",
        justifyContent: "center",
        alignItems: "center",
        bgcolor: theme.palette.background.default,
        py: 3,
      }}
    >
      <Card
        elevation={3}
        sx={{
          width: "100%",
          maxWidth: "800px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          p: 3,
        }}
      >
        <CardContent
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Typography variant="h5">
            Welcome to {appName || " Project1 for Ethereum 101"}!
          </Typography>
          {!isWallectConnected && (
            <Typography variant="body1">
              Please log in to use this app!{" "}
            </Typography>
          )}
          <Button
            variant="contained"
            onClick={() => {
              checkIsWalletConnected();
            }}
          >
            {isWallectConnected
              ? "Connected to Metamask 🦊"
              : "Connect to Metamask 🔑"}
          </Button>
          {isWallectConnected && (
            <Typography variant="body1">Your address: {userWallet}</Typography>
          )}
          {error && (
            <Typography variant="error" color="error">
              {error}{" "}
              <Button
                onClick={() => {
                  clearError();
                }}
              >
                ❌
              </Button>
            </Typography>
          )}
          {isWallectConnected && (
            <Box
              component={"form"}
              onSubmit={setTargetThresholdHandler}
              sx={{
                width: "100%",
                display: "flex",
                flexDirection: "column",
                gap: 1,
              }}
            >
              <Typography>
                Your current withdraw threshold is {currentThreshold} ETH
              </Typography>

              {currentThreshold < currentBalance && (
                <Typography variant="caption" color={"error"}>
                  In order to change your threshold, your balance should be
                  equal or grater to it
                </Typography>
              )}
              <TextField
                label="Update your threshold"
                placeholder="Enter a new Threshold"
                type="number"
                inputProps={{
                  step: 0.001,
                }}
                value={inputValue.threshold}
                name="threshold"
                onChange={handleInputChange}
              ></TextField>
              <Button type="submit" disabled={inputValue.threshold <= 0}>
                Update
              </Button>
            </Box>
          )}
          {isWallectConnected && (
            <Box
              component={"form"}
              onSubmit={depositBalanceHandler}
              sx={{
                width: "100%",
                display: "flex",
                flexDirection: "column",
                gap: 1,
              }}
            >
              <Typography>
                Your current balance is {currentBalance} ETH
              </Typography>
              {currentThreshold == 0.0 && (
                <Typography variant="caption" color={"error"}>
                  In order to deposit your balance, you have to set a threshold
                  first
                </Typography>
              )}

              <TextField
                label="Deposit more balance"
                placeholder="Ammount to deposit"
                type="number"
                inputProps={{
                  step: 0.001,
                }}
                value={inputValue.deposit}
                name="deposit"
                onChange={handleInputChange}
                disabled={currentThreshold == 0}
              ></TextField>
              <Button
                type="submit"
                disabled={inputValue.deposit <= 0 || currentThreshold == 0}
              >
                Deposit
              </Button>
            </Box>
          )}
          {isWallectConnected && (
            <Box
              component={"form"}
              onSubmit={withdrawFundsHandler}
              sx={{
                width: "100%",
                display: "flex",
                flexDirection: "column",
                gap: 1,
              }}
            >
              <TextField
                label="Withdraw your balance"
                placeholder="Ammount to withdraw"
                type="number"
                inputProps={{
                  step: 0.001,
                  max: Number(currentBalance),
                }}
                value={inputValue.withdraw}
                name="withdraw"
                onChange={handleInputChange}
                disabled={
                  currentBalance == 0 || currentBalance < currentThreshold
                }
              ></TextField>
              <Button
                type="submit"
                disabled={
                  inputValue.withdraw <= 0 ||
                  inputValue.withdraw > currentBalance ||
                  currentBalance < currentThreshold
                }
              >
                Withdraw
              </Button>
            </Box>
          )}
          {isWallectConnected && (
            <Typography variant="body1">Owner wallet: {ownerWallet}</Typography>
          )}
          {isWallectConnected && isOwnerWallet && (
            <Box
              component={"form"}
              onSubmit={changeDAPPNameHandler}
              sx={{
                width: "100%",
                display: "flex",
                flexDirection: "column",
                gap: 1,
              }}
            >
              <TextField
                label="Change your DAPP's name"
                placeholder="Type a new name!"
                type="text"
                value={inputValue.name}
                defaultValue={appName}
                name="name"
                onChange={handleInputChange}
              ></TextField>
              <Button type="submit" disabled={inputValue.name === ""}>
                Save
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default Home;
