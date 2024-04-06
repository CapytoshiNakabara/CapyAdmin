import { Buyer } from "@/Models/Buyer"
import { Transfer } from "@/Models/Transfer"
import { useMemo, useState } from "react"
import { ethers } from 'ethers'

export const useBuyersTable = (transfers: Transfer[], page: number, amountPerPage: number, airdropAmount: number) => {

    const [buyers, setBuyers] = useState<Buyer[]>([])

    const mapBuyers = () => {
        if (transfers.length > 0) {
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

            setBuyers(newBuyers.sort((a, b) => b.amount - a.amount))
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

    return { buyers, mapBuyers, totalAmount, totalNumberOfBuys, totalAmountToBeAirdroped, paginatedBuyers, exportToCsv }

}