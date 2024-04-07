import { Controller, useFormContext } from "react-hook-form"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

interface Props {
    name: string
    label: string
    required?: boolean
    defaultValue?: string
    inputButton?: React.ReactNode
}

export const ControlledTextField = ({ name, label, required, defaultValue, inputButton }: Props) => {
    const { control } = useFormContext()

    return (
        <Controller
            control={control}
            name={name}
            defaultValue={defaultValue}
            rules={{
                required: required
            }}
            render={({ field: { onChange, value }, fieldState: { error } }) => {
                return (
                    <div>
                        <Label htmlFor="#name">{label}</Label >
                        <div className="flex w-full items-center space-x-2">
                            <Input id="name" onChange={(e) => onChange(e.target.value)} value={typeof value === 'string' ? value ?? "" : ""} />
                            {inputButton}
                        </div>
                        {error && <span style={{ color: "red" }}>Missing or invalid input</span>}
                    </div>
                )
            }}>

        </Controller >
    )
}