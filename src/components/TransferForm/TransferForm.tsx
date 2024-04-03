import { FormProvider, useForm } from "react-hook-form"
import { ControlledDateAndTimePicker } from "../FormFields/ControlledDateAndTimePicker"
import { Button } from "../ui/button"
import "./TransferForm.scss"
import { ControlledTextField } from "../FormFields/ControlledTextField"
import { TransferFilter } from "@/Hooks/useTransfer"

interface Props {
    isFetchingTransfers: boolean
    fetchTransfers: (data: TransferFilter) => Promise<void>
}

export const TransferForm = ({ isFetchingTransfers, fetchTransfers }: Props) => {
    const methods = useForm()

    const onSubmit = async (data: any) => {
        await fetchTransfers(data)
    }

    return (
        <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit((data) => onSubmit(data))}>
                <div className="transfer-form">
                    <div className="transfer-form__fields">
                        <ControlledDateAndTimePicker
                            label="From"
                            name="from"
                            required />
                        <ControlledDateAndTimePicker
                            label="To"
                            name="to"
                            required />
                        <ControlledTextField name="contractAddress" required label="Contract address" />
                        <ControlledTextField name="fromAddress" label="From address" />
                    </div>
                    <div className="transfer-form__actions">
                        <Button disabled={isFetchingTransfers} className='custom-button' type="submit">
                            {isFetchingTransfers ? "Loading..." : "Find buyers (Mainnet)"}
                        </Button>
                    </div>
                </div>
            </form>
        </FormProvider>
    )
}