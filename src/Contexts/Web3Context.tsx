import React, { useContext } from "react"
import Web3 from "web3"

type Web3State = {
    web3: Web3
}

export const Web3Context = React.createContext<Web3State>({} as Web3State)
export const useWeb3Context = () => useContext(Web3Context)