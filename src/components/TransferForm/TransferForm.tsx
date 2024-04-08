import { FormProvider, useFieldArray, useForm, useWatch } from "react-hook-form"
import { ControlledDateAndTimePicker } from "../FormFields/ControlledDateAndTimePicker"
import { Button } from "../ui/button"
import "./TransferForm.scss"
import { ControlledTextField } from "../FormFields/ControlledTextField"
import { TransferFormData } from "../../Models/TransferFormData"
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { IgnoredReceivers } from "./IgnoredReceivers"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '../../components/ui/dialog';
import { Progress } from "@/components/ui/progress"
import { useEffect, useState } from "react"

interface Props {
    isFetchingTransfers: boolean
    fetchTransfers: (data: TransferFormData) => Promise<void>
    isFetchingBlocks: boolean
    isCalculatingBuyersOfAllContracts: boolean
    cancelFetchTransfers: () => void
}

export const TransferForm = ({ isFetchingTransfers, fetchTransfers, isFetchingBlocks, isCalculatingBuyersOfAllContracts, cancelFetchTransfers }: Props) => {
    const methods = useForm(
        {
            defaultValues: {
                addresses: [{ contractAddress: "", fromAddress: "", ignoredReceivers: [] }],
                to: undefined,
                from: undefined
            }
        })
    const { fields: addressFields, append, remove } = useFieldArray({
        control: methods.control,
        name: "addresses",
        rules: { minLength: 1 }
    })

    const [progress, setProgress] = useState<number>(0)
    const [dialogDescription, setDialogDescription] = useState<string>()
    const progressSteps = 3
    const dialogCloseId = "progress-dialog-close"
    const toValue = useWatch({ name: "to", control: methods.control }) as Date | undefined
    const fromValue = useWatch({ name: "from", control: methods.control }) as Date | undefined

    useEffect(() => {
        const percentagePerStep = 100 / progressSteps
        if (isFetchingBlocks) {
            setProgress(percentagePerStep)
            setDialogDescription("Fetching blocks.")
        }
        else if (isFetchingTransfers) {
            setProgress(percentagePerStep * 2)
            setDialogDescription("Fetching BEP-20 transfers.")
        }
        else if (isCalculatingBuyersOfAllContracts) {
            setProgress(percentagePerStep * 3)
            setDialogDescription("Filtering buyers of all contract addresses.")
        }
        else {
            setProgress(0)
            setDialogDescription(undefined)
            document.getElementById(dialogCloseId)?.click()
        }
    }, [isFetchingBlocks, isFetchingTransfers, isCalculatingBuyersOfAllContracts])

    const onSubmit = async (data: TransferFormData) => {
        await fetchTransfers(data)
    }

    return (
        <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit((data) => onSubmit(data))}>
                <Card>
                    <CardContent>
                        <div className="transfer-form">
                            <div className="transfer-form__fields">
                                <ControlledDateAndTimePicker
                                    label="From (UTC)"
                                    name="from"
                                    max={toValue}
                                    required />
                                <ControlledDateAndTimePicker
                                    label="To (UTC)"
                                    name="to"
                                    min={fromValue}
                                    required />
                                {
                                    addressFields.map((field, index) =>
                                        <Card key={field.id}>
                                            <CardHeader>
                                                <CardTitle>Contract #{index + 1}
                                                    <Button variant="destructive" style={{ float: "right" }} onClick={() => remove(index)}>X</Button>
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <ControlledTextField name={`addresses.${index}.contractAddress`} required label="Contract address" />
                                                <ControlledTextField name={`addresses.${index}.fromAddress`} label="From address" />
                                            </CardContent>
                                            <CardFooter>
                                                <IgnoredReceivers nestedIndex={index} />
                                            </CardFooter>
                                        </Card>
                                    )
                                }
                                <Button variant="outline" onClick={() => append({ contractAddress: "", fromAddress: "", ignoredReceivers: [] })}>Add contract +</Button>
                            </div>
                            <div className="transfer-form__actions">
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button className='custom-button' type="submit">
                                            Find buyers (Mainnet)
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Finding buyers...</DialogTitle>
                                            <DialogDescription>{dialogDescription}</DialogDescription>
                                        </DialogHeader>
                                        <Progress value={progress} />
                                        <DialogFooter className="sm:justify-start">
                                            <DialogClose asChild>
                                                <Button id={dialogCloseId} variant="outline" onClick={() => cancelFetchTransfers()}>Cancel (might not work)</Button>
                                            </DialogClose>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </form>

        </FormProvider>
    )
}

