import { useState } from 'react'
import './App.css'
import { ethers } from 'ethers'

function App() {
  // const web3test = new Web3('https://go.getblock.io/cff88efce70347b2b8c66113eecefdd0'); // Use a BSC node


  const [fromDate, setFromDate] = useState()
  const [fromHour, setFromHour] = useState("00")
  const [fromMinutes, setFromMinutes] = useState("00")
  const [toDate, setToDate] = useState()
  const [toHour, setToHour] = useState("00")
  const [toMinutes, setToMinutes] = useState("00")
  const [isFetching, setIsFetching] = useState(false)
  const [fromAddress, setFromAddress] = useState()
  const [tokenAddress, setTokenAddress] = useState()

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

  const logValues = async (isTest: boolean) => {
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

    let grouped = allres.result.reduce(
      (result: any, currentValue: any) => {
        (result[currentValue['to']] = result[currentValue['to']] || []).push(currentValue);
        return result;
      }, {});

    let recieversWithAmount: any[] = []
    Object.entries(grouped).forEach(([a, b]) => {
      const values: [] = (b as any).map((ba: any) => ethers.formatUnits(ba.value, 18))
      let amount = 0
      values.forEach(val => amount += +val)
      recieversWithAmount.push({ reviever: a, amount })
    })
    console.log(recieversWithAmount);
    exportToCsv(recieversWithAmount)

    setIsFetching(false)
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
      <h1>Capy Admin</h1>
      <div className="card">
        <label htmlFor="#fromDate">Date from: </label>
        <input id="fromDate" type='date' placeholder='Från' onChange={(e) => setFromDate(e.target.value as any)} />
        <label htmlFor="#fromTime"> Time from: </label>
        <select onChange={(e) => setFromHour(e.target.value)}>
          {
            hours().map((h, key) =>
              <option key={key} value={h}>{h}</option>)
          }
        </select>
        <select onChange={(e) => setFromMinutes(e.target.value)}>
          {
            minutes().map((h, key) =>
              <option key={key} value={h}>{h}</option>)
          }
        </select>
        <br />
        <br />

        <label htmlFor="#toDate">Date to: </label>
        <input id="toDate" type='date' placeholder='Till' onChange={(e) => setToDate(e.target.value as any)} />
        <label htmlFor="#toTime"> Time to: </label>
        <select onChange={(e) => setToHour(e.target.value)}>
          {
            hours().map((h, key) =>
              <option key={key} value={h}>{h}</option>)
          }
        </select>
        <select onChange={(e) => setToMinutes(e.target.value)}>
          {
            minutes().map((h, key) =>
              <option key={key} value={h}>{h}</option>)
          }
        </select>
        <br />
        <br />
        <br />

        <label htmlFor="#tokenAddress">Token address: </label>
        <input id="tokenAddress" placeholder='Token address' value={tokenAddress} onChange={(e) => setTokenAddress(e.target.value as any)} />
        <br />
        <label htmlFor="#fromAddress">From address (Has to be a liquidity pool): </label>
        <input id="fromAddress" placeholder='From address' value={fromAddress} onChange={(e) => setFromAddress(e.target.value as any)} />
        <br />

        <button onClick={() => logValues(false)}>
          {isFetching ? "Loading..." : "Find buyers (Mainnet)"}
        </button>
        <br />

        <button onClick={() => logValues(true)}>
          {isFetching ? "Loading..." : "Find buyers (Testnet)"}
        </button>
      </div>
    </>
  )
}

export default App
