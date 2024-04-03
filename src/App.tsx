import './App.css'
import { BuyersTable } from './components/BuyersTable/BuyersTable';
import { TransferForm } from './components/TransferForm/TransferForm';
import { useTransfer } from './Hooks/useTransfer';


function App() {
  const { isFetchingTransfers, fetchTransfers, fetchedTransfers } = useTransfer()

  return (
    <>
      <h1 className='scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl'>Capy Admin</h1>
      <div className="card">
        <TransferForm isFetchingTransfers={isFetchingTransfers} fetchTransfers={fetchTransfers} />
        <hr />
        <br />
        <BuyersTable transfers={fetchedTransfers} />
      </div>
    </>
  )
}

export default App
