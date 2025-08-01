
import React, { useRef, useEffect } from 'react';
import flatpickr from 'flatpickr';
import { Instance } from 'flatpickr/dist/types/instance';
import { CalendarIcon } from './icons';

interface DatePickerProps {
    onDateChange: (dates: Date[]) => void;
}

export const DatePicker: React.FC<DatePickerProps> = ({ onDateChange }) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const fpInstanceRef = useRef<Instance | null>(null);

    useEffect(() => {
        if (inputRef.current) {
            fpInstanceRef.current = flatpickr(inputRef.current, {
                mode: "range",
                dateFormat: "d M Y",
                defaultDate: [new Date(new Date().setDate(new Date().getDate() - 30)), new Date()],
                locale: "id",
                onClose: (selectedDates) => {
                    // When the calendar closes, update the date range.
                    // This reliably handles both single-date and range selections.
                    if (selectedDates.length === 1) {
                        onDateChange([selectedDates[0], selectedDates[0]]);
                    } else if (selectedDates.length === 2) {
                        onDateChange(selectedDates);
                    }
                },
            });
        }

        return () => {
            fpInstanceRef.current?.destroy();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="relative">
            <input 
                ref={inputRef}
                className="flex items-center w-full bg-white border border-gray-300 pl-10 pr-4 py-2 rounded-lg text-gray-700 hover:bg-gray-50 transition-all cursor-pointer" 
                placeholder="Pilih Tanggal"
            />
            <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
    );
};
