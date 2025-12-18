"use client";

import {
    Command,
    CommandEmpty,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { useEffect, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { v4 as uuidv4 } from "uuid";

export default function PlaceSearchBar() {
    const [open, setOpen] = useState(false);
    const [inputText, setInputText] = useState("");
    const [sessionToken, setSessionToken] = useState(uuidv4());

    const fetchSuggestions = useDebouncedCallback(async (input: string) => {
        if (!input.trim()) {
            return;
        }
        try {
            const response = await fetch(
                `/api/restaurant/autocomplete?input=${input}&sessionToken=${sessionToken}`
            );
            //TODO:ここのレスポンスを使ってサジェストを更新処理を実装していく
            console.log("input:", input);
            console.log("response status:", response.status);
        } catch (error) {
            console.error("Error fetching suggestions:", error);
        }
    }, 500);

    const handleBlur = () => {
        setOpen(false);
    };
    const handleFocus = () => {
        if (inputText.trim()) {
            setOpen(true);
        }
    };

    useEffect(() => {
        if (!inputText.trim()) {
            setOpen(false);
            return;
        }
        setOpen(true);
        fetchSuggestions(inputText);
    }, [inputText, fetchSuggestions]);

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
