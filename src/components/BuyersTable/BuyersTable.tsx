import { Buyer } from "@/Models/Buyer"
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

interface Props {
    buyers: Buyer[]
}

export const BuyersTable = ({ buyers }: Props) => {

    // const calculatePercentage = (value: number, totalAmount: number) => {
    //     return ((100 * value) / totalAmount).toFixed(3)
    //     // return ((value - totalAmount) / value * 100).toFixed(3)
    //   }

    return (
        <Table>
            <TableCaption>All buyers</TableCaption>
            <TableHeader>
                <TableRow>
                    <TableHead>Wallet address</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Number of buys</TableHead>
                    <TableHead className="text-right">Airdrop</TableHead>
                    {/* <TableHead className="text-right">Amount</TableHead> */}
                </TableRow>
            </TableHeader>
            <TableBody>
                {
                    buyers.map((buyer, key) =>
                        <TableRow key={key}>
                            <TableCell>{buyer.walletAddress}</TableCell>
                            <TableCell>{buyer.amount} ({buyer.sharePercentage.toFixed(2)})</TableCell>
                            <TableCell>{buyer.numberOfBuys}</TableCell>
                            <TableCell>{buyer.amountToBeAirdroped}</TableCell>
                        </TableRow>
                    )
                }
            </TableBody>
            <TableFooter>
                <TableRow>
                    <TableCell>Total</TableCell>
                    <TableCell>{buyers.reduce((accumulator, currentValue) => accumulator + currentValue.amount, 0)}</TableCell>
                    <TableCell>{buyers.reduce((accumulator, currentValue) => accumulator + currentValue.numberOfBuys, 0)}</TableCell>
                    <TableCell>{buyers.reduce((accumulator, currentValue) => accumulator + currentValue.amountToBeAirdroped, 0)}</TableCell>
                </TableRow>
            </TableFooter>
        </Table>
    )
}