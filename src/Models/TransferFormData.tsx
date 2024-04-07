export interface TransferFormData {
    from?: Date
    to?: Date
    addresses: TransferAddress[]
}

export interface TransferAddress {
    contractAddress: string
    fromAddress: string
    ignoredReceivers: string[]
}