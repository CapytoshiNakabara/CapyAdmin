import { Buyer } from "@/Models/Buyer"
import { Transfer } from "@/Models/Transfer"
import { useMemo, useState } from "react"
import { ethers } from 'ethers'
import Web3 from "web3"
import splitContractABI from "../Contracts/SplitIt.json"


export const useBuyersTable = (groupedTransfers: Record<string, Transfer[]>, page: number, amountPerPage: number, airdropAmount: number, web3: Web3) => {

    const [buyers, setBuyers] = useState<Buyer[]>([])

    const mapBuyers = () => {
        if (Object.entries(groupedTransfers).length > 0) {
            let newBuyers: Buyer[] = []
            Object.entries(groupedTransfers).forEach(([recieverAddress, transfers]) => {
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

            newBuyers = newBuyers.sort((a, b) => b.amount - a.amount)
            setBuyers(newBuyers)
        }
        else {
            setBuyers([])
        }
    }

    const calculatePercentage = (value: number, totalAmount: number) => {
        return (100 * value) / totalAmount
    }

    const totalAmount = useMemo(() => {
        return buyers.reduce((accumulator, currentValue) => accumulator + currentValue.amount, 0)
    }, [buyers])

    const totalNumberOfBuys = useMemo(() => {
        return buyers.reduce((accumulator, currentValue) => accumulator + currentValue.numberOfBuys, 0)
    }, [buyers])

    const totalAmountToBeAirdroped = useMemo(() => {
        return buyers.reduce((accumulator, currentValue) => accumulator + currentValue.amountToBeAirdroped, 0)
    }, [buyers])

    const paginatedBuyers = useMemo(() => {
        const startIndex = page * amountPerPage
        const endIndex = startIndex + amountPerPage
        return buyers.slice(startIndex, endIndex)
    }, [page, buyers])

    const deployPaymentSplitter = async () => {
        if (buyers) {
            const splitContract = new web3.eth.Contract(splitContractABI.abi)
            const accountAddresses = await web3.eth.getAccounts()
            console.log(accountAddresses);

            const buyerAddresses = buyers.map(b => b.walletAddress)
            const sharePercentagesAsWei = buyers.map(b => web3.utils.toWei(b.sharePercentage.toFixed(20), "ether"))

            await splitContract.deploy({ arguments: [buyerAddresses, sharePercentagesAsWei], data: splitContractABI.bytecode },)
                .send({
                    from: accountAddresses[0],
                    gas: "1500000",
                    gasPrice: '30000000000'
                })
                .on('error', (error) => { console.log(error) })
                .on('transactionHash', (transactionHash) => { console.log(transactionHash) })
                .on('receipt', (receipt) => {
                    console.log(receipt) // contains the new contract address
                })
                // .on('confirmation', (confirmationNumber, receipt) => console.log(confirmationNumber, receipt))
                .then(function (newContractInstance) {
                    console.log(newContractInstance) // instance with the new contract address
                });

        }
    }

    const exportToCsv = () => {
        if (buyers) {
            let CsvString = "Wallet address,Airdrop";
            CsvString += "\r\n";
            buyers.forEach((item, _index) => {
                CsvString += `${item.walletAddress},`
                CsvString += `${item.amountToBeAirdroped},`
                CsvString += "\r\n";
            })

            CsvString = "data:application/csv," + encodeURIComponent(CsvString);
            var x = document.createElement("A");
            x.setAttribute("href", CsvString);
            x.setAttribute("download", "token_buyers.csv");
            document.body.appendChild(x);
            x.click();
        }
    }

    const exportToPaymentSplitterArguments = () => {
        if (buyers) {
            let textString = "module.exports = [\n"
            textString += "["
            let addressess: string[] = []
            buyers.forEach((buyer) => {
                addressess.push(`"${buyer.walletAddress}"`)
            })
            textString += addressess.join(",")
            textString += "],\n"

            textString += "["
            let percentages: string[] = []
            buyers.forEach((buyer) => {
                const sharePercentageToWei = web3.utils.toWei(buyer.sharePercentage.toFixed(20), "ether")
                percentages.push(`"${sharePercentageToWei}"`)
            })
            textString += percentages.join(",")
            textString += "]\n"
            textString += "];"

            textString = "data:application/txt," + encodeURIComponent(textString);
            var x = document.createElement("A");
            x.setAttribute("href", textString);
            x.setAttribute("download", "paymentSplitterArguments.js");
            document.body.appendChild(x);
            x.click();

        }
    }

    return { buyers, mapBuyers, totalAmount, totalNumberOfBuys, totalAmountToBeAirdroped, paginatedBuyers, exportToCsv, exportToPaymentSplitterArguments, deployPaymentSplitter }

}