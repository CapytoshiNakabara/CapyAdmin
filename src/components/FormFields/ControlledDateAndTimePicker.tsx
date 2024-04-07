import { Controller, useFormContext } from "react-hook-form"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import "./ControlledDateAndTimePicker.scss"

interface Props {
    name: string
    label: string
    required?: boolean
    max?: Date
    min?: Date
}

export const ControlledDateAndTimePicker = ({ name, required, label, max, min }: Props) => {
    const { control } = useFormContext()

    return (
        <Controller
            control={control}
            name={name}
            rules={{
                required: required && "Missing or invalid date",
                max: max?.toString()
            }}
            render={({ field: { onChange }, fieldState: { error } }) => {
                return (
                    <div>
                        <Label htmlFor="#fromDate">{label}</Label >
                        <Input id="fromDate"
                            min={min?.toString()}
                            max={max?.toString()}
                            type='datetime-local'
                            placeholder='Day'
                            onChange={(e) => onChange(e.target.value as any)} />
                        {error && <span style={{ color: "red" }}>{error.message}</span>}
                    </div>
                )
            }}>
        </Controller>
    )
}