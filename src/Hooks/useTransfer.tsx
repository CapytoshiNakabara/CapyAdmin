import { groupBy } from "@/Helpers/arrayHelpers";
import { Transfer } from "@/Models/Transfer"
import { TransferFormData } from "@/Models/TransferFormData"
import { useCallback, useState } from "react"
import Web3 from 'web3';

export const useTransfer = (web3: Web3) => {
    const [fetchedTransfers, setFetchedTransfers] = useState<Record<string, Transfer[]>>({})
    const [isFetchingTransfers, setIsFetchingTransfers] = useState(false)
    const [isFetchingBlocks, setIsFetchingBlocks] = useState(false)
    const [isCalculatingBuyersOfAllContracts, setIsCalculatingBuyersOfAllContracts] = useState(false)
    const controller = new AbortController();
    const signal = controller.signal;

    const fetchTransfers = useCallback(async (data: TransferFormData) => {
        setIsFetchingBlocks(true)

        const fromAsDate = new Date(data.from!)
        const toAsDate = new Date(data.to!)
        fromAsDate.setMinutes(fromAsDate.getMinutes() - fromAsDate.getTimezoneOffset())
        toAsDate.setMinutes(toAsDate.getMinutes() - toAsDate.getTimezoneOffset())

        const fromSeconds = Math.floor(fromAsDate.getTime() / 1000)
        const toSeconds = Math.floor(toAsDate.getTime() / 1000)

        const fromBlockResponse = await fetch(`https://api.bscscan.com/api?module=block&action=getblocknobytime&timestamp=${fromSeconds}&closest=before&apikey=7EYHFFCBKGK7TBDYXV8X4NH9Y8EBXA2CHX`, { signal })
        const fromBlock = await fromBlockResponse.json()

        const toBlockResponse = await fetch(`https://api.bscscan.com/api?module=block&action=getblocknobytime&timestamp=${toSeconds}&closest=after&apikey=7EYHFFCBKGK7TBDYXV8X4NH9Y8EBXA2CHX`, { signal })
        const toBlock = await toBlockResponse.json()
        setIsFetchingBlocks(false)

        const transfersCollection: Transfer[][] = []

        setIsFetchingTransfers(true)
        for (let index = 0; index < data.addresses.length; index++) {
            const address = data.addresses[index];
            const response = await fetch(`https://api.bscscan.com/api?module=account&action=tokentx${address.fromAddress ? `&address=${address.fromAddress}` : ""}&contractaddress=${address.contractAddress}&startblock=${fromBlock.result}&endblock=${toBlock.result}&sort=asc&apikey=7EYHFFCBKGK7TBDYXV8X4NH9Y8EBXA2CHX`, { signal })
            let resultAsJson = await response.json()
            let transfers = resultAsJson.result as Transfer[]
            if (address.ignoredReceivers.length > 0) {
                transfers = transfers.filter(transfer => !address.ignoredReceivers.some(r => r.toLowerCase() === transfer.to.toLowerCase()))
                // transfers = transfers.filter(transfer => !address.ignoredReceivers.includes(transfer.to))
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

        const groupedTransfers = groupBy(buyersOfAllContractAddresses, "to")

        // Find and delete contract addresses
        const checks = Object.entries(groupedTransfers).filter(g => g[1].length >= 10).map(async (g) => {
            await web3.eth.getCode(g[0])
                .then(code => {
                    if (code !== "0x") {
                        delete groupedTransfers[g[0]]
                    }
                })
                .catch((ex) => console.log("Blev fel: ", ex))
        })
        await Promise.all(checks);

        setFetchedTransfers(groupedTransfers)
        setIsCalculatingBuyersOfAllContracts(false)
    }, [])

    const cancelFetchTransfers = () => {
        controller.abort()
    }

    return { fetchedTransfers, isFetchingTransfers, fetchTransfers, isFetchingBlocks, isCalculatingBuyersOfAllContracts, cancelFetchTransfers }
}