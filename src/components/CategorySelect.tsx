import { useState, useRef, useEffect } from 'react';
import { useFinanceStore } from '../store/useFinanceStore';
import { Input } from './ui/Input';
import { Plus, Check, ChevronDown } from 'lucide-react';
import { cn } from '../lib/utils';
import { Card } from './ui/Card';

interface CategorySelectProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    onKeyDown?: (e: React.KeyboardEvent) => void;
}

export function CategorySelect({ value, onChange, placeholder, className, onKeyDown }: CategorySelectProps) {
    const { categories, addCategory } = useFinanceStore();
    const [inputValue, setInputValue] = useState(value);
    const [isOpen, setIsOpen] = useState(false);
    const [filteredCategories, setFilteredCategories] = useState<string[]>([]);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Sync input with value prop (if controlled externally)
    useEffect(() => {
        setInputValue(value);
    }, [value]);

    useEffect(() => {
        const filtered = categories.filter(c =>
            c.toLowerCase().includes(inputValue.toLowerCase())
        );
        setFilteredCategories(filtered);
    }, [inputValue, categories]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                // On blur, if valid category, keep it. 
                // If invalid... maybe revert? Or leave as is?
                // Ideally we want to force selection or creation.
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (category: string) => {
        setInputValue(category);
        onChange(category);
        setIsOpen(false);
        inputRef.current?.blur();
    };

    const handleCreate = () => {
        // Create new category
        // Capitalize first letter?
        const newCategory = inputValue.trim();
        if (!newCategory) return;

        addCategory(newCategory);
        handleSelect(newCategory);
    };

    const isExactMatch = categories.some(
        c => c.toLowerCase() === inputValue.toLowerCase()
    );

    return (
        <div className="relative w-full" ref={wrapperRef}>
            <div className="relative">
                <Input
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => {
                        setInputValue(e.target.value);
                        setIsOpen(true);
                        // Optional: clear selection if user types? 
                        // onChange(e.target.value); // Maybe propagate changes immediately? 
                        // The parent expects a valid category usually. But for typing, let's propagate.
                        onChange(e.target.value);
                    }}
                    onFocus={() => setIsOpen(true)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            if (filteredCategories.length > 0 && inputValue === '') {
                                handleSelect(filteredCategories[0]);
                            } else if (isExactMatch) {
                                handleSelect(categories.find(c => c.toLowerCase() === inputValue.toLowerCase()) || inputValue);
                            } else if (inputValue.trim()) {
                                handleCreate();
                            }
                            if (onKeyDown) onKeyDown(e);
                        }
                    }}
                    placeholder={placeholder}
                    className={cn("pr-8", className)}
                />
                <button
                    type="button"
                    onClick={() => {
                        if (isOpen) setIsOpen(false);
                        else {
                            setIsOpen(true);
                            inputRef.current?.focus();
                        }
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                >
                    <ChevronDown className="w-4 h-4" />
                </button>
            </div>

            {isOpen && (
                <Card className="absolute z-50 w-full mt-1 max-h-60 overflow-y-auto bg-zinc-900 border-zinc-800 shadow-xl">
                    <div className="p-1 space-y-0.5">
                        {filteredCategories.map(cat => (
                            <button
                                key={cat}
                                className={cn(
                                    "w-full text-left px-3 py-2 text-sm rounded-sm hover:bg-zinc-800 transition-colors flex items-center justify-between",
                                    cat === value && "bg-zinc-800 font-medium text-primary"
                                )}
                                onClick={() => handleSelect(cat)}
                            >
                                {cat}
                                {cat === value && <Check className="w-3 h-3" />}
                            </button>
                        ))}

                        {!isExactMatch && inputValue.trim() !== '' && (
                            <button
                                className="w-full text-left px-3 py-2 text-sm rounded-sm hover:bg-primary/20 text-primary transition-colors flex items-center gap-2 border-t border-zinc-800 mt-1"
                                onClick={handleCreate}
                            >
                                <Plus className="w-3 h-3" />
                                Criar "{inputValue}"
                            </button>
                        )}

                        {filteredCategories.length === 0 && inputValue.trim() === '' && (
                            <div className="px-3 py-4 text-center text-xs text-zinc-500">
                                Digite para buscar...
                            </div>
                        )}
                    </div>
                </Card>
            )}
        </div>
    );
}
