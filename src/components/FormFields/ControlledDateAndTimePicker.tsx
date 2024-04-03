import { useMemo, useState } from "react"
import { Controller, useFormContext } from "react-hook-form"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import "./ControlledDateAndTimePicker.scss"

interface Props {
    name: string
    label: string
    required?: boolean
}

interface DateTime {
    date?: Date
    hour?: string
    minute?: string
}

export const ControlledDateAndTimePicker = ({ name, required, label }: Props) => {
    const { control } = useFormContext()
    const [dateTime, setDateTime] = useState<DateTime>({})

    const hours = useMemo(() => {
        let allHours = []
        for (let index = 0; index < 24; index++) {
            allHours.push(index.toString().padStart(2, "0"))
        }
        return allHours
    }, [])

    const minutes = useMemo(() => {
        let allMinutes = []
        for (let index = 0; index <= 55; index += 5) {
            allMinutes.push(index.toString().padStart(2, "0"))
        }
        return allMinutes
    }, [])

    const getConvertedDate = (key: keyof DateTime, value: Date | string): Date | undefined => {
        const newDateTime = { ...dateTime, [key]: value }
        setDateTime(newDateTime)

        if (!newDateTime.date || !newDateTime.hour || !newDateTime.minute) {
            return undefined
        }

        const convertedDate = new Date(`${newDateTime.date} ${newDateTime.hour}:${newDateTime.minute}`)
        return convertedDate
    }

    return (
        <Controller
            control={control}
            name={name}
            rules={{
                required: required
            }}
            render={({ field: { onChange }, fieldState: { error } }) => {
                return (
                    <div className='form-controlled-date-and-time-picker'>
                        <Label htmlFor="#fromDate">{label}</Label >
                        <div className='form-controlled-date-and-time-picker__inputs'>
                            <Input id="fromDate"
                                type='date'
                                placeholder='Day'
                                onChange={(e) => onChange(getConvertedDate("date", e.target.value as any))} />
                            <Select onValueChange={(e) => onChange(getConvertedDate("hour", e))}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Hour" />
                                </SelectTrigger>
                                <SelectContent>
                                    {
                                        hours.map((h, key) =>
                                            <SelectItem key={key} value={h}>{h}</SelectItem>)
                                    }
                                </SelectContent>
                            </Select>
                            <Select onValueChange={(e) => onChange(getConvertedDate("minute", e))}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Minute" />
                                </SelectTrigger>
                                <SelectContent>
                                    {
                                        minutes.map((h, key) =>
                                            <SelectItem key={key} value={h}>{h}</SelectItem>)
                                    }
                                </SelectContent>
                            </Select>
                        </div>
                        {error && <span style={{ color: "red" }}>Missing or invalid date</span>}
                    </div>
                )
            }}>

        </Controller >
    )
}