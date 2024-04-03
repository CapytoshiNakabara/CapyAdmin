import { Buyer } from "@/Models/Buyer"
import {
    Table,
    TableBody,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "../ui/button"
import { Transfer } from "@/Models/Transfer"
import { useEffect, useMemo, useState } from "react"
import { ethers } from 'ethers'
import "./BuyersTable.scss"
import { Input } from "@/components/ui/input"

interface Props {
    transfers: Transfer[]
}

export const BuyersTable = ({ transfers }: Props) => {

    const [buyers, setBuyers] = useState<Buyer[]>()
    const [airdropAmount, setAirdropAmount] = useState<number>(0)

    useEffect(() => {
        mapTransfers()
    }, [transfers])

    const mapTransfers = () => {
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

            setBuyers(newBuyers)
        }
        else {
            setBuyers([])
        }
    }

    const calculatePercentage = (value: number, totalAmount: number) => {
        return (100 * value) / totalAmount
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

    const totalAmount = useMemo(() => {
        if (buyers) {
            return buyers.reduce((accumulator, currentValue) => accumulator + currentValue.amount, 0)
        }
    }, [buyers])

    const totalNumberOfBuys = useMemo(() => {
        if (buyers) {
            return buyers.reduce((accumulator, currentValue) => accumulator + currentValue.numberOfBuys, 0)
        }
    }, [buyers])

    const totalAmountToBeAirdroped = useMemo(() => {
        if (buyers) {
            return buyers.reduce((accumulator, currentValue) => accumulator + currentValue.amountToBeAirdroped, 0)
        }
    }, [buyers])

    return (
        <div className="buyers-table">
            {buyers &&
                <>
                    <div className="buyers-table__actions">
                        <div className="flex w-full max-w-sm items-center space-x-2">
                            <Input placeholder="Total amount to be airdroped"
                                // value={airdropAmount?.toLocaleString() ?? 0}
                                onChange={(e) => setAirdropAmount(parseInt(e.target.value))} />
                            <Button variant="outline" onClick={() => mapTransfers()}>Calculate airdrops</Button>
                        </div>
                        <Button onClick={() => exportToCsv()}>Exportera till csv</Button>
                    </div>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Wallet address</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Number of buys</TableHead>
                                <TableHead className="text-right">Airdrop</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {
                                buyers.map((buyer, key) =>
                                    <TableRow key={key}>
                                        <TableCell>{buyer.walletAddress}</TableCell>
                                        <TableCell>{buyer.amount} ({buyer.sharePercentage.toFixed(2)}%)</TableCell>
                                        <TableCell>{buyer.numberOfBuys}</TableCell>
                                        <TableCell className="text-right">{buyer.amountToBeAirdroped}</TableCell>
                                    </TableRow>
                                )
                            }
                        </TableBody>
                        <TableFooter>
                            <TableRow>
                                <TableCell>Total</TableCell>
                                <TableCell>{totalAmount}</TableCell>
                                <TableCell>{totalNumberOfBuys}</TableCell>
                                <TableCell className="text-right">{totalAmountToBeAirdroped}</TableCell>
                            </TableRow>
                        </TableFooter>
                    </Table>
                </>
            }
        </div>
    )
}