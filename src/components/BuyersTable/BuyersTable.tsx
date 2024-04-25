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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Sheet,
    FileJson,
    Upload,
    ChevronDown
} from "lucide-react"
import { Button } from "../ui/button"
import { Transfer } from "@/Models/Transfer"
import { useEffect, useMemo, useState } from "react"
import "./BuyersTable.scss"
import { Input } from "@/components/ui/input"
import { useBuyersTable } from "@/Hooks/useBuyersTable"
import { Pagination } from "../Pagination/Pagination"
import { useWeb3Context } from "@/Contexts/Web3Context"

interface Props {
    groupedTransfers: Record<string, Transfer[]>
}

export const BuyersTable = ({ groupedTransfers }: Props) => {
    const { web3 } = useWeb3Context()
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
        paginatedBuyers,
        exportToPaymentSplitterArguments,
        deployPaymentSplitter } = useBuyersTable(groupedTransfers, page, pageSize, airdropAmount, web3)

    useEffect(() => {
        mapBuyers()
    }, [groupedTransfers])

    const getTableCaption = useMemo((): string => {
        let startBuyer = (page * pageSize) + 1
        if (startBuyer === 0) {
            startBuyer = 1
        }
        let endBuyer = (startBuyer + pageSize) - 1
        if (endBuyer > buyers.length) {
            endBuyer = buyers.length
        }
        return `Showing ${startBuyer}-${endBuyer} out of ${buyers.length} buyers.`
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
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline">Actions <ChevronDown className="mr-2 h-4 w-4" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56">
                                <DropdownMenuItem className="menuitem" onClick={exportToCsv}>
                                    <Sheet className="mr-2 h-5 w-5" />
                                    <span>Export to csv</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="menuitem" onClick={exportToPaymentSplitterArguments}>
                                    <FileJson className="mr-2 h-5 w-5" />
                                    <span>Export paymentsplitter arguments</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="menuitem" onClick={deployPaymentSplitter}>
                                    <Upload className="mr-2 h-5 w-5" />
                                    <span>Deploy paymentsplitter contract</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                    <Table>
                        <TableCaption>{getTableCaption}</TableCaption>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Wallet address</TableHead>
                                {/* <TableHead></TableHead> */}
                                <TableHead>Amount</TableHead>
                                <TableHead>Number of buys</TableHead>
                                <TableHead className="text-right">Airdrop</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {
                                paginatedBuyers.map((buyer, key) =>
                                    <TableRow key={key}>
                                        <TableCell >{buyer.walletAddress}</TableCell>
                                        {/* <TableCell >{buyer.numberOfBuys > 2 && <Badge variant="destructive">Många köp</Badge>}</TableCell> */}
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
                                {/* <TableCell></TableCell> */}
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