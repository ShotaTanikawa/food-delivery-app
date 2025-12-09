"use client";

import {
    Command,
    CommandEmpty,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { useEffect, useState } from "react";

export default function PlaceSearchBar() {
    const [open, setOpen] = useState(false);
    const [inputText, setInputText] = useState("");
    const fetchSuggestions = async () => {
        try {
            //APIを呼び出す
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        if (!inputText.trim()) {
            setOpen(false);
            return;
        }
        setOpen(true);
        fetchSuggestions();
    }, [inputText]);

    const handleBlur = () => {
        setOpen(false);
    };
    const handleFocus = () => {
        if (!inputText.trim()) {
            setOpen(true);
        }
    };
    return (
        <Command className="overflow-visible bg-muted" shouldFilter={false}>
            <CommandInput
                value={inputText}
                placeholder="Type a command or search..."
                onValueChange={setInputText}
                onBlur={handleBlur}
                onFocus={handleFocus}
            />
            {open && (
                <div className="relative">
                    <CommandList className="absolute bg-background w-full shadow-md rounded-lg">
                        <CommandEmpty>No results found.</CommandEmpty>
                        <CommandItem>Calendar</CommandItem>
                        <CommandItem>Search Emoji</CommandItem>
                        <CommandItem>Calculator</CommandItem>
                    </CommandList>
                </div>
            )}
        </Command>
    );
}
