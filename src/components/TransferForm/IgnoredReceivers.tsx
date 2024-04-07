import { useFormContext, useFieldArray } from "react-hook-form";
import { ControlledTextField } from "../FormFields/ControlledTextField";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";

interface IgnoredReceiversProps {
    nestedIndex: number
}

export const IgnoredReceivers = ({ nestedIndex }: IgnoredReceiversProps) => {
    const { control } = useFormContext()
    const { fields: ignoredAddresses, remove, append } = useFieldArray({
        control,
        name: `addresses.${nestedIndex}.ignoredReceivers`
    });

    return (
        <Dialog>
            <DialogTrigger asChild><Button variant="outline">Add ignored wallet addresses</Button></DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Ignored wallet addresses for contract #{nestedIndex + 1}</DialogTitle>
                    <DialogDescription>These wallet addresses will not be included in the airdrop.</DialogDescription>
                </DialogHeader>
                {
                    ignoredAddresses.map((field, index) =>
                        <ControlledTextField
                            key={field.id}
                            name={`addresses.${nestedIndex}.ignoredReceivers.${index}`}
                            required
                            label="Wallet address"
                            inputButton={<Button variant="destructive" onClick={() => remove(index)}>X</Button>} />
                    )
                }
                <Button variant="outline" onClick={() => append({})}>Add ignored wallet address</Button>
            </DialogContent>
        </Dialog>
    )
}