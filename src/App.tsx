import { useState } from 'react'
import './App.css'
import { ethers } from 'ethers'
// import Web3 from 'web3';
import { Transfer } from './Models/Transfer';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Buyer } from './Models/Buyer';
import { BuyersTable } from './components/BuyersTable/BuyersTable';


function App() {
  // const web3 = new Web3('https://go.getblock.io/a4d8d0664ef540cea820fc5a2e5ef237'); // Use a BSC node
  const [fromDate, setFromDate] = useState()
  const [fromHour, setFromHour] = useState("00")
  const [fromMinutes, setFromMinutes] = useState("00")
  const [toDate, setToDate] = useState()
  const [toHour, setToHour] = useState("00")
  const [toMinutes, setToMinutes] = useState("00")
  const [isFetching, setIsFetching] = useState(false)
  const [fromAddress, setFromAddress] = useState()
  const [tokenAddress, setTokenAddress] = useState("0xc748673057861a797275CD8A068AbB95A902e8de")
  const [buyers, setBuyers] = useState<Buyer[]>([])
  const [airdropAmount, setAirdropAmount] = useState<number>(0)

  const hours = () => {
    let allHours = []
    for (let index = 0; index < 24; index++) {
      allHours.push(index.toString().padStart(2, "0"))
    }
    return allHours
  }

  const minutes = () => {
    let allMinutes = []
    for (let index = 0; index <= 55; index += 5) {
      allMinutes.push(index.toString().padStart(2, "0"))
    }
    return allMinutes
  }

  const fetchWallets = async (isTest: boolean) => {
    try {

      setIsFetching(true)

      const fromDateAndTime = new Date(`${fromDate} ${fromHour}:${fromMinutes}`)
      const toDateAndTime = new Date(`${toDate} ${toHour}:${toMinutes}`)

      const fromSeconds = Math.floor(fromDateAndTime.getTime() / 1000)
      const toSeconds = Math.floor(toDateAndTime.getTime() / 1000)

      const fromBlockResponse = await fetch(`https://api${isTest ? "-testnet" : ""}.bscscan.com/api?module=block&action=getblocknobytime&timestamp=${fromSeconds}&closest=before&apikey=7EYHFFCBKGK7TBDYXV8X4NH9Y8EBXA2CHX`)
      const fromBlock = await fromBlockResponse.json()

      const toBlockResponse = await fetch(`https://api${isTest ? "-testnet" : ""}.bscscan.com/api?module=block&action=getblocknobytime&timestamp=${toSeconds}&closest=after&apikey=7EYHFFCBKGK7TBDYXV8X4NH9Y8EBXA2CHX`)
      const toBlock = await toBlockResponse.json()

      const resullt = await fetch(`https://api${isTest ? "-testnet" : ""}.bscscan.com/api?module=account&action=tokentx${fromAddress ? `&address=${fromAddress}` : ""}&contractaddress=${tokenAddress}&startblock=${fromBlock.result}&endblock=${toBlock.result}&sort=asc&apikey=7EYHFFCBKGK7TBDYXV8X4NH9Y8EBXA2CHX`)
      const allres = await resullt.json()
      const transfers = allres.result as Transfer[]
      console.log(transfers.map((t) => {
        return { ...t, actualDate: new Date(+t.timeStamp * 1000) }
      }));

      let groupedTransfers = transfers.reduce(
        (result: any, currentValue) => {
          (result[currentValue.to] = result[currentValue.to] || []).push(currentValue);
          return result;
        }, {});

      let newBuyers: Buyer[] = []
      Object.entries(groupedTransfers).forEach(([recieverAddress, b]) => {
        const transfers = (b as Transfer[])
        const tokenDecimal = transfers[0].tokenDecimal

        const values = transfers.map((ba) => ethers.formatUnits(ba.value, +tokenDecimal))
        let amount = 0
        values.forEach(val => amount += +val)
        newBuyers.push({ walletAddress: recieverAddress, amount, numberOfBuys: transfers.length, amountToBeAirdroped: 0, sharePercentage: 0 })
      })

      const totalAmountBought = newBuyers.reduce((accumulator, currentValue) => accumulator + currentValue.amount, 0)

      for (let index = 0; index < newBuyers.length; index++) {
        const sharePercentage = calculatePercentage(newBuyers[index].amount, totalAmountBought)
        const amountToBeAirdroped = (sharePercentage / 100) * airdropAmount

        newBuyers[index].sharePercentage = sharePercentage
        newBuyers[index].amountToBeAirdroped = amountToBeAirdroped
      }

      setBuyers(newBuyers)
      console.log(newBuyers);
      exportToCsv(newBuyers)

    }
    catch (ex) {
      console.error(ex);
    }
    finally {
      setIsFetching(false)

    }
  }

  const calculatePercentage = (value: number, totalAmount: number) => {
    return (100 * value) / totalAmount
    // return ((value - totalAmount) / value * 100).toFixed(3)
  }

  const exportToCsv = (arrayToCsv: any[]) => {

    let CsvString = "Reciever,Amount,";
    CsvString += "\r\n";
    arrayToCsv.forEach((item, _index) => {
      CsvString += `${item.reviever},`
      CsvString += `${item.amount},`
      CsvString += "\r\n";
    })

    CsvString = "data:application/csv," + encodeURIComponent(CsvString);
    var x = document.createElement("A");
    x.setAttribute("href", CsvString);
    x.setAttribute("download", "token_buyers.csv");
    document.body.appendChild(x);
    x.click();

  }

  return (
    <>
      <h1 className='scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl'>Capy Admin</h1>
      <div className="card">
        <div className='stack'>
          <div className='flex-1'>
            <Label htmlFor="#fromDate">Date from: </Label >
            <div className='date-group'>
              <Input id="fromDate" type='date' placeholder='Från' onChange={(e) => setFromDate(e.target.value as any)} />
              <Select onValueChange={(e) => setFromHour(e)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Hour" />
                </SelectTrigger>
                <SelectContent>
                  {
                    hours().map((h, key) =>
                      <SelectItem key={key} value={h}>{h}</SelectItem>)
                  }
                </SelectContent>
              </Select>
              <Select onValueChange={(e) => setFromMinutes(e)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Minute" />
                </SelectTrigger>
                <SelectContent>
                  {
                    minutes().map((h, key) =>
                      <SelectItem key={key} value={h}>{h}</SelectItem>)
                  }
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className='flex-1'>
            <Label htmlFor="#toDate">Date to: </Label >
            <div className='date-group'>
              <Input id="toDate" type='date' placeholder='Till' onChange={(e) => setToDate(e.target.value as any)} />
              <Select onValueChange={(e) => setToHour(e)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Hour" />
                </SelectTrigger>
                <SelectContent>
                  {
                    minutes().map((h, key) =>
                      <SelectItem key={key} value={h}>{h}</SelectItem>)
                  }
                </SelectContent>
              </Select>
              <Select onValueChange={(e) => setToMinutes(e)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Minute" />
                </SelectTrigger>
                <SelectContent>
                  {
                    minutes().map((h, key) =>
                      <SelectItem key={key} value={h}>{h}</SelectItem>)
                  }
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <div className='stack'>
          <div className='flex-1'>
            <Label htmlFor="#tokenAddress">Token address</Label >
            <Input id="tokenAddress" placeholder='Token address' value={tokenAddress} onChange={(e) => setTokenAddress(e.target.value as any)} />
          </div>
          <div className='flex-1'>
            <Label htmlFor="#fromAddress">From address (Has to be a liquidity pool)</Label >
            <Input id="fromAddress" placeholder='From address' value={fromAddress} onChange={(e) => setFromAddress(e.target.value as any)} />
          </div>
        </div>
        <Label htmlFor="#airdropAmount">Amount to be airdropped</Label >
        <Input id="airdropAmount" placeholder='Airdrop' value={airdropAmount} onChange={(e) => setAirdropAmount(e.target.value as any)} />


        <Button onClick={() => fetchWallets(false)} className='custom-button'>
          {isFetching ? "Loading..." : "Find buyers (Mainnet)"}
        </Button>
        <Button onClick={() => fetchWallets(true)} variant="outline" className='custom-button'>
          {isFetching ? "Loading..." : "Find buyers (Testnet)"}
        </Button>
        <BuyersTable buyers={buyers}  />
      </div>
    </>
  )
}

export default App
