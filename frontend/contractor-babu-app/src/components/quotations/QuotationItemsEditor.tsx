import type { CreateQuotationItemDto } from '@/types/quotation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';

interface QuotationItemsEditorProps {
    items: CreateQuotationItemDto[];
    onChange: (items: CreateQuotationItemDto[]) => void;
}

export default function QuotationItemsEditor({ items, onChange }: QuotationItemsEditorProps) {
    const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set(items.map((_, i) => i)));

    const toggleItem = (index: number) => {
        const newExpanded = new Set(expandedItems);
        if (newExpanded.has(index)) {
            newExpanded.delete(index);
        } else {
            newExpanded.add(index);
        }
        setExpandedItems(newExpanded);
    };

    const handleAddItem = () => {
        const newItem: CreateQuotationItemDto = {
            description: '',
            quantity: 1,
            area: undefined,
            length: undefined,
            width: undefined,
            height: undefined,
            unit: 'sqft',
            rate: 0,
            amount: 0,
            isWithMaterial: false,
            sequence: items.length + 1
        };
        onChange([...items, newItem]);
        // Auto-expand new item
        setExpandedItems(new Set([...expandedItems, items.length]));
    };

    const handleRemoveItem = (index: number) => {
        const newItems = items.filter((_, i) => i !== index);
        // Re-sequence
        newItems.forEach((item, i) => item.sequence = i + 1);
        onChange(newItems);
        // Remove from expanded set
        const newExpanded = new Set(expandedItems);
        newExpanded.delete(index);
        setExpandedItems(newExpanded);
    };

    const handleItemChange = (index: number, field: keyof CreateQuotationItemDto, value: any) => {
        const newItems = [...items];
        const item = { ...newItems[index], [field]: value };

        // Auto-calculate amount when quantity, rate or area changes
        if (field === 'quantity' || field === 'rate' || field === 'area') {
            const area = item.area || 1;
            const quantity = item.quantity || 1;
            item.amount = area * quantity * item.rate;
        }

        newItems[index] = item;
        onChange(newItems);
    };

    // Helper to update multiple fields on an item atomically to avoid multiple re-renders
    const updateItemFields = (index: number, updates: Partial<CreateQuotationItemDto>) => {
        const newItems = [...items];
        const prev = newItems[index] || ({} as CreateQuotationItemDto);
        const item: any = { ...prev, ...updates };

        // Recalculate amount when relevant
        const recalcNeeded = 'quantity' in updates || 'rate' in updates || 'area' in updates || 'length' in updates || 'width' in updates || 'height' in updates;
        if (recalcNeeded) {
            const area = item.area || 1;
            const quantity = item.quantity || 1;
            item.amount = area * quantity * (item.rate || 0);
        }

        newItems[index] = item;
        onChange(newItems);
    };

    const calculateAmount = (item: CreateQuotationItemDto) => {
        const area = item.area || 1;
        const quantity = item.quantity || 1;
        return area * quantity * item.rate;
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Items</h3>
                <Button type="button" onClick={handleAddItem} size="sm" variant="outline">
                    <Plus size={16} className="mr-2" />
                    Add Item
                </Button>
            </div>

            {items.length === 0 ? (
                <div className="text-center p-4 border border-dashed rounded-md text-gray-500">
                    No items added yet. Click "Add Item" to start.
                </div>
            ) : (
                <div className="space-y-3">
                    {items.map((item, index) => {
                        const isExpanded = expandedItems.has(index);
                        return (
                            <div key={index} className="border rounded-md bg-transparent overflow-hidden transition-all hover:bg-white">
                                {/* Collapsible Header */}
                                <div
                                    className="flex items-center justify-between p-3 bg-gray-50/50 cursor-pointer hover:bg-gray-100/80 transition-colors"
                                    onClick={() => toggleItem(index)}
                                >
                                    <div className="flex items-center gap-3 flex-1 overflow-hidden">
                                        <div className="flex items-center gap-2 min-w-fit">
                                            {isExpanded ? (
                                                <ChevronDown className="h-5 w-5 text-gray-500" />
                                            ) : (
                                                <ChevronRight className="h-5 w-5 text-gray-500" />
                                            )}
                                            <span className="font-semibold text-gray-700 whitespace-nowrap">Item #{index + 1}</span>
                                        </div>

                                        <span className="text-sm text-gray-600 truncate flex-1" title={item.description}>
                                            {item.description || 'No description'}
                                        </span>

                                        {/* Summary Details */}
                                        <div className="hidden sm:flex items-center gap-3 text-sm">
                                            {(item.quantity > 0 || item.rate > 0 || item.area) && (
                                                <div className="flex items-center gap-2 text-gray-500 bg-white px-2 py-1 rounded-lg border shadow-sm">
                                                    {item.area && (
                                                        <>
                                                            <span className="text-purple-600 font-medium">
                                                                Area: {item.area}
                                                            </span>
                                                            <span className="text-gray-300">|</span>
                                                        </>
                                                    )}
                                                    <span className="font-medium text-blue-600">
                                                        Qty: {item.quantity} {item.unit}
                                                    </span>
                                                    <span className="text-gray-300">|</span>
                                                    <span>
                                                        @ ₹{item.rate}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        <span className="text-sm font-bold text-gray-900 min-w-[80px] text-right">
                                            ₹{calculateAmount(item).toLocaleString()}
                                        </span>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghostDestructive"
                                        size="sm"
                                        className="ml-2 rounded-lg"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleRemoveItem(index);
                                        }}
                                    >
                                        <Trash2 size={16} />
                                    </Button>
                                </div>

                                {/* Collapsible Content */}
                                {isExpanded && (
                                    <div className="p-4">
                                        {/* Description with Material Checkbox */}
                                        <div className="mb-4 pr-8 flex gap-4">
                                            <div className="flex-1">
                                                <Label>Description</Label>
                                                <Textarea
                                                    value={item.description || ''}
                                                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleItemChange(index, 'description', e.target.value)}
                                                    placeholder="Item description"
                                                    rows={2}
                                                />
                                            </div>
                                            <div className="w-32">
                                                <Label>Material?</Label>
                                                <div className="flex items-center h-10 mt-2">
                                                    <input
                                                        type="checkbox"
                                                        className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary transition-all"
                                                        checked={item.isWithMaterial}
                                                        onChange={(e) => handleItemChange(index, 'isWithMaterial', e.target.checked)}
                                                    />
                                                    <span className="ml-2 text-sm">{item.isWithMaterial ? 'Yes' : 'No'}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Dimension Calculator */}
                                        <div className="mb-4 pr-8 p-4 bg-transparent rounded-md border border-blue-100">
                                            <div className="flex items-center justify-between mb-3">
                                                <Label className="text-sm font-medium text-blue-900">Dimension Calculator</Label>
                                                <span className="text-xs text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">Length × Width × Height</span>
                                            </div>
                                            <div className="grid grid-cols-4 gap-3">
                                                <div>
                                                    <Label className="text-xs text-gray-500 mb-1 block">Length</Label>
                                                            <Input
                                                                type="number"
                                                                placeholder="L"
                                                                name={`length-${index}`}
                                                                value={item.length ?? ''}
                                                                min="0"
                                                                step="0.01"
                                                                className="h-9 bg-white"
                                                                onChange={(e) => {
                                                                    const val = e.currentTarget.value;
                                                                    const length = val ? parseFloat(val) : undefined;
                                                                    // compute area/volume using current item values
                                                                    const width = items[index]?.width ?? item.width ?? 0;
                                                                    const height = items[index]?.height ?? item.height ?? 0;
                                                                    const l = length ?? 0;
                                                                    const calculatedArea = height > 0 ? l * width * height : l * width;
                                                                    updateItemFields(index, { length: length ?? undefined, area: calculatedArea > 0 ? calculatedArea : item.area });
                                                                }}
                                                            />
                                                </div>
                                                <div>
                                                    <Label className="text-xs text-gray-500 mb-1 block">Width</Label>
                                                    <Input
                                                        type="number"
                                                        placeholder="W"
                                                        name={`width-${index}`}
                                                        value={item.width ?? ''}
                                                        min="0"
                                                        step="0.01"
                                                        className="h-9 bg-white"
                                                        onChange={(e) => {
                                                            const val = e.currentTarget.value;
                                                            const width = val ? parseFloat(val) : undefined;
                                                            const length = items[index]?.length ?? item.length ?? 0;
                                                            const height = items[index]?.height ?? item.height ?? 0;
                                                            const w = width ?? 0;
                                                            const calculatedArea = height > 0 ? length * w * height : length * w;
                                                            updateItemFields(index, { width: width ?? undefined, area: calculatedArea > 0 ? calculatedArea : item.area });
                                                        }}
                                                    />
                                                </div>
                                                <div>
                                                    <Label className="text-xs text-gray-500 mb-1 block">Height</Label>
                                                    <Input
                                                        type="number"
                                                        placeholder="H"
                                                        name={`height-${index}`}
                                                        value={item.height ?? ''}
                                                        min="0"
                                                        step="0.01"
                                                        className="h-9 bg-white"
                                                        onChange={(e) => {
                                                            const val = e.currentTarget.value;
                                                            const height = val ? parseFloat(val) : undefined;
                                                            const length = items[index]?.length ?? item.length ?? 0;
                                                            const width = items[index]?.width ?? item.width ?? 0;
                                                            const h = height ?? 0;
                                                            const calculatedArea = h > 0 ? length * width * h : length * width;
                                                            updateItemFields(index, { height: height ?? undefined, area: calculatedArea > 0 ? calculatedArea : item.area });
                                                        }}
                                                    />
                                                </div>
                                                <div>
                                                    <Label className="text-xs text-gray-500 mb-1 block">Area (auto)</Label>
                                                    <Input
                                                        type="number"
                                                        value={item.area ?? ''}
                                                        readOnly
                                                        disabled
                                                        min="0"
                                                        step="0.01"
                                                        placeholder="Auto-calculated"
                                                        className="h-9 font-medium bg-gray-50 border-gray-200 cursor-not-allowed"
                                                        title="Auto-calculated from Length × Width × Height"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Other Fields - Grid Layout */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pr-8">
                                            <div>
                                                <Label>Quantity</Label>
                                                <Input
                                                    type="number"
                                                    value={item.quantity}
                                                    onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                                                    min="0"
                                                    step="0.01"
                                                />
                                            </div>

                                            <div>
                                                <Label>Unit</Label>
                                                <select
                                                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300 hover:border-primary/50 hover:bg-white focus:bg-white"
                                                    value={item.unit}
                                                    onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
                                                >
                                                    <option value="sqft">Sqft</option>
                                                    <option value="sqm">Sqm</option>
                                                    <option value="rft">Rft</option>
                                                    <option value="rm">Rm</option>
                                                    <option value="cum">Cum</option>
                                                    <option value="kg">Kg</option>
                                                    <option value="ton">Ton</option>
                                                    <option value="piece">Piece</option>
                                                    <option value="nos">Nos</option>
                                                    <option value="day">Day</option>
                                                    <option value="hour">Hour</option>
                                                </select>
                                            </div>

                                            <div>
                                                <Label>Rate</Label>
                                                <Input
                                                    type="number"
                                                    value={item.rate}
                                                    onChange={(e) => handleItemChange(index, 'rate', parseFloat(e.target.value) || 0)}
                                                    min="0"
                                                    step="0.01"
                                                />
                                            </div>

                                            <div>
                                                <Label>Amount</Label>
                                                <div className="flex items-center h-10 font-bold text-lg text-gray-900">
                                                    ₹{calculateAmount(item).toLocaleString()}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    <div className="flex justify-end p-4 bg-transparent rounded-md border border-gray-100">
                        <div className="text-right">
                            <span className="text-gray-600 mr-2">Total Amount:</span>
                            <span className="text-xl font-bold">
                                ₹{items.reduce((sum, item) => sum + calculateAmount(item), 0).toLocaleString()}
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
