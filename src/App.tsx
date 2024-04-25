import Web3 from 'web3';
import './App.css'
import { BuyersTable } from './components/BuyersTable/BuyersTable';
import { TransferForm } from './components/TransferForm/TransferForm';
import { useTransfer } from './Hooks/useTransfer';
import { Web3Context } from './Contexts/Web3Context';
import { useCallback, useMemo, useState } from 'react';
import { RegisteredSubscription } from 'node_modules/web3/lib/types/eth.exports';
import { Button } from './components/ui/button';

function App() {
  const [web3, setWeb3] = useState<Web3<RegisteredSubscription>>(new Web3("https://go.getblock.io/cff88efce70347b2b8c66113eecefdd0"))
  const { isFetchingTransfers, fetchTransfers, fetchedTransfers, isCalculatingBuyersOfAllContracts, isFetchingBlocks, cancelFetchTransfers } = useTransfer(web3)

  const connectWallet = useCallback(async () => {
    await (window as any).ethereum.request({ method: 'eth_requestAccounts' })
    const newWeb3 = new Web3((window as any).ethereum)
    setWeb3(new Web3(newWeb3))
  }, [])

  const isWalletConnected = useMemo(() => {
    if ((web3.provider as any).clientUrl && ((web3.provider as any).clientUrl as string).includes("go.getblock.io")) {
      return false
    }
    return true
  }, [web3])

  return (
    <>
      <Web3Context.Provider value={{ web3 }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <h1 className='scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl'>Capy Admin</h1>
          <Button onClick={() => connectWallet()} disabled={isWalletConnected}>{isWalletConnected ? "Connected!" : "Connect wallet"}</Button>
        </div>
        <div className="card">
          <TransferForm
            isFetchingTransfers={isFetchingTransfers}
            fetchTransfers={fetchTransfers}
            isCalculatingBuyersOfAllContracts={isCalculatingBuyersOfAllContracts}
            isFetchingBlocks={isFetchingBlocks}
            cancelFetchTransfers={cancelFetchTransfers} />
          <hr />
          <br />
          <BuyersTable groupedTransfers={fetchedTransfers} />
        </div>
      </Web3Context.Provider>
    </>
  )
}

export default App
