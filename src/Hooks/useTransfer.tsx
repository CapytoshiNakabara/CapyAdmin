import { Transfer } from "@/Models/Transfer"
import { TransferFormData } from "@/Models/TransferFormData"
import { useCallback, useState } from "react"

export const useTransfer = () => {
    const [fetchedTransfers, setFetchedTransfers] = useState<Transfer[]>([])
    const [isFetchingTransfers, setIsFetchingTransfers] = useState(false)
    const [isFetchingBlocks, setIsFetchingBlocks] = useState(false)
    const [isCalculatingBuyersOfAllContracts, setIsCalculatingBuyersOfAllContracts] = useState(false)
    const controller = new AbortController();
    const signal = controller.signal;

    const fetchTransfers = useCallback(async (data: TransferFormData) => {
        setIsFetchingBlocks(true)
        const fromSeconds = Math.floor(new Date(data.from!).getTime() / 1000)
        const toSeconds = Math.floor(new Date(data.to!).getTime() / 1000)

        const fromBlockResponse = await fetch(`https://api.bscscan.com/api?module=block&action=getblocknobytime&timestamp=${fromSeconds}&closest=before&apikey=7EYHFFCBKGK7TBDYXV8X4NH9Y8EBXA2CHX`, { signal })
        const fromBlock = await fromBlockResponse.json()

        const toBlockResponse = await fetch(`https://api.bscscan.com/api?module=block&action=getblocknobytime&timestamp=${toSeconds}&closest=after&apikey=7EYHFFCBKGK7TBDYXV8X4NH9Y8EBXA2CHX`, { signal })
        const toBlock = await toBlockResponse.json()
        setIsFetchingBlocks(false)

        const transfersCollection: Transfer[][] = []

        setIsFetchingTransfers(true)
        for (let index = 0; index < data.addresses.length; index++) {
            const address = data.addresses[index];
            const result = await fetch(`https://api.bscscan.com/api?module=account&action=tokentx${address.fromAddress ? `&address=${address.fromAddress}` : ""}&contractaddress=${address.contractAddress}&startblock=${fromBlock.result}&endblock=${toBlock.result}&sort=asc&apikey=7EYHFFCBKGK7TBDYXV8X4NH9Y8EBXA2CHX`, { signal })
            let resultAsJson = await result.json()
            let transfers = resultAsJson.result as Transfer[]
            if (address.ignoredReceivers.length > 0) {
                transfers = transfers.filter(transfer => !address.ignoredReceivers.includes(transfer.to))
            }
            transfersCollection[index] = transfers
        }

        setIsFetchingTransfers(false)

        setIsCalculatingBuyersOfAllContracts(true)
        const occurrenceMap = new Map();

        const addOrIncrementTo = (transfer: Transfer, index: number) => {
            if (occurrenceMap.has(transfer.to)) {
                let count = occurrenceMap.get(transfer.to)
                if (count === index) {
                    occurrenceMap.set(transfer.to, count + 1)
                }
            } else if (index === 0) {
                occurrenceMap.set(transfer.to, 1)
            }
        }

        transfersCollection.forEach((transfers, index) => {
            transfers.forEach(transfer => addOrIncrementTo(transfer, index))
        })

        const buyersOfAllContractAddresses = transfersCollection[0].filter(transfer => occurrenceMap.get(transfer.to) === transfersCollection.length)

        setFetchedTransfers(buyersOfAllContractAddresses)
        setIsCalculatingBuyersOfAllContracts(false)
    }, [])

    const cancelFetchTransfers = () => {
        controller.abort()
    }

    return { fetchedTransfers, isFetchingTransfers, fetchTransfers, isFetchingBlocks, isCalculatingBuyersOfAllContracts, cancelFetchTransfers }
}