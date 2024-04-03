import { Transfer } from "@/Models/Transfer"
import { useCallback, useState } from "react"

export interface TransferFilter {
    from: Date
    to: Date
    contractAddress: string
    fromAddress?: string
}

export const useTransfer = () => {
    const [fetchedTransfers, setFetchedTransfers] = useState<Transfer[]>([])
    const [isFetchingTransfers, setIsFetchingTransfers] = useState(false)

    const fetchTransfers = useCallback(async (data: TransferFilter) => {
        setIsFetchingTransfers(true)

        const fromSeconds = Math.floor(data.from.getTime() / 1000)
        const toSeconds = Math.floor(data.to.getTime() / 1000)

        const fromBlockResponse = await fetch(`https://api.bscscan.com/api?module=block&action=getblocknobytime&timestamp=${fromSeconds}&closest=before&apikey=7EYHFFCBKGK7TBDYXV8X4NH9Y8EBXA2CHX`)
        const fromBlock = await fromBlockResponse.json()

        const toBlockResponse = await fetch(`https://api.bscscan.com/api?module=block&action=getblocknobytime&timestamp=${toSeconds}&closest=after&apikey=7EYHFFCBKGK7TBDYXV8X4NH9Y8EBXA2CHX`)
        const toBlock = await toBlockResponse.json()

        const result = await fetch(`https://api.bscscan.com/api?module=account&action=tokentx${data.fromAddress ? `&address=${data.fromAddress}` : ""}&contractaddress=${data.contractAddress}&startblock=${fromBlock.result}&endblock=${toBlock.result}&sort=asc&apikey=7EYHFFCBKGK7TBDYXV8X4NH9Y8EBXA2CHX`)
        const resultJson = await result.json()
        setFetchedTransfers(resultJson.result as Transfer[])

        setIsFetchingTransfers(false)
    }, [])

    return { fetchedTransfers, isFetchingTransfers, fetchTransfers }
}