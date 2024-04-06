import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "../ui/button"
import { Transfer } from "@/Models/Transfer"
import { useEffect, useMemo, useState } from "react"
import "./BuyersTable.scss"
import { Input } from "@/components/ui/input"
import { useBuyersTable } from "@/Hooks/useBuyersTable"
import { Pagination } from "../Pagination/Pagination"

interface Props {
    transfers: Transfer[]
}

export const BuyersTable = ({ transfers }: Props) => {
    const [airdropAmount, setAirdropAmount] = useState<number>(0)
    const [page, setPage] = useState<number>(0)
    const pageSize = 15
    const {
        buyers,
        mapBuyers,
        exportToCsv,
        totalAmount,
        totalNumberOfBuys,
        totalAmountToBeAirdroped,
        paginatedBuyers } = useBuyersTable(transfers, page, pageSize, airdropAmount)

    useEffect(() => {
        mapBuyers()
    }, [transfers])

    const getTableCaption = useMemo((): string => {
        if (page === 0) {
            return `Showing 1-${pageSize} out of ${buyers.length} buyers.`
        }
        else {
            const startBuyer = (page * pageSize) + 1
            let endBuyer = (startBuyer + pageSize) - 1
            if (endBuyer > buyers.length) {
                console.log("jaha");
                endBuyer = buyers.length
            }
            return `Showing ${startBuyer}-${endBuyer} out of ${buyers.length} buyers.`
        }
    }, [pageSize, page, buyers])

    return (
        <div className="buyers-table">
            {buyers &&
                <>
                    <div className="buyers-table__actions">
                        <div className="flex w-full max-w-sm items-center space-x-2">
                            <Input placeholder="Total amount to be airdroped"
                                value={Intl.NumberFormat("sv-SE").format(airdropAmount)}
                                onChange={(e) => {
                                    const formatedValue = e.target.value.replace(/\s+/g, "")
                                    setAirdropAmount(!formatedValue ? 0 : parseInt(formatedValue))
                                }} />
                            <Button variant="outline" onClick={() => mapBuyers()}>Calculate airdrops</Button>
                        </div>
                        <Button onClick={() => exportToCsv()}>Exportera till csv</Button>
                    </div>
                    <Table>
                        <TableCaption>{getTableCaption}</TableCaption>
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
                                paginatedBuyers.map((buyer, key) =>
                                    <TableRow key={key}>
                                        <TableCell>{buyer.walletAddress}</TableCell>
                                        <TableCell>{Intl.NumberFormat("sv-SE").format(buyer.amount)} ({buyer.sharePercentage.toFixed(10)}%)</TableCell>
                                        <TableCell>{buyer.numberOfBuys}</TableCell>
                                        <TableCell className="text-right">{Intl.NumberFormat("sv-SE").format(buyer.amountToBeAirdroped)}</TableCell>
                                    </TableRow>
                                )
                            }
                        </TableBody>
                        <TableFooter>
                            <TableRow>
                                <TableCell>Total</TableCell>
                                <TableCell>{Intl.NumberFormat("sv-SE").format(totalAmount)}</TableCell>
                                <TableCell>{totalNumberOfBuys}</TableCell>
                                <TableCell className="text-right">{Intl.NumberFormat("sv-SE").format(totalAmountToBeAirdroped)}</TableCell>
                            </TableRow>
                        </TableFooter>
                    </Table>
                    {buyers.length > 0 && <Pagination currentPage={page} onChange={(newPage) => setPage(newPage)} pageSize={pageSize} totalCount={buyers.length} />}
                </>
            }
        </div>
    )
}