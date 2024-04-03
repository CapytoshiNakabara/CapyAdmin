import { Controller, useFormContext } from "react-hook-form"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

interface Props {
    name: string
    label: string
    required?: boolean
}

export const ControlledTextField = ({ name, label, required }: Props) => {
    const { control } = useFormContext()

    return (
        <Controller
            control={control}
            name={name}
            rules={{
                required: required
            }}
            render={({ field: { onChange }, fieldState: { error } }) => {
                return (
                    <div className='form-controlled-text-field'>
                        <Label htmlFor="#name">{label}</Label >
                        <div className='form-controlled-text-field__inputs'>
                            <Input id="name" onChange={(e) => onChange(e.target.value)} />
                        </div>
                        {error && <span style={{ color: "red" }}>Missing or invalid input</span>}
                    </div>
                )
            }}>

        </Controller >
    )
}