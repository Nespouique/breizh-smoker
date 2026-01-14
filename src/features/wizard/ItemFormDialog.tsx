"use client";

import { useState, useEffect } from 'react';
import { useForm, useFormContext } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Item } from '@/types';
import { createItem, updateItem, deleteItem } from '@/lib/api';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { NumberInput } from '@/components/ui/number-input';
import { IconPicker, type IconData } from '@/components/ui/icon-picker';
import { defineStepper } from '@/components/ui/stepper';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
} from '@/components/ui/form';
import { Flame, ShoppingBag, Mountain, Trash2, Info, ChevronLeft, ChevronRight, Check, Scale, CloudSnow, Plus, X } from 'lucide-react';
import type { IconName } from 'lucide-react/dynamic';

// === UNIFIED SCHEMA ===
const spiceSchema = z.object({
    name: z.string(),
    amount: z.number(),
});

// Custom validation for spices: either both filled or both empty
const spicesValidation = z.array(spiceSchema).optional().superRefine((spices, ctx) => {
    if (!spices) return;
    spices.forEach((spice, index) => {
        const hasName = spice.name && spice.name.trim().length > 0;
        const hasAmount = spice.amount && spice.amount > 0;
        // If one is filled but not the other, it's an error
        if (hasName && !hasAmount) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Le poids est requis",
                path: [index, 'amount'],
            });
        }
        if (hasAmount && !hasName) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Le nom est requis",
                path: [index, 'name'],
            });
        }
    });
});

const formSchema = z.object({
    // Info step
    type: z.string().min(1, "L'animal est requis"),
    cut: z.string().min(1, "Le morceau est requis"),
    name: z.string().min(1, "Le nom est requis"),
    icon: z.string().optional(),
    // Measures step
    initial_weight: z.number().min(1, "Le poids est requis"),
    diameter: z.number().min(0.1, "Le diamètre est requis"),
    target_weight_percent: z.number().min(20).max(50),
    // Curing step
    curing_method: z.union([z.literal('vacuum'), z.literal('traditional'), z.null()]),
    salt_amount: z.number().optional(),
    sugar_amount: z.number().optional(),
    pepper_amount: z.number().optional(),
    spices: spicesValidation,
});

type FormValues = z.infer<typeof formSchema>;

// Fields per step for validation
const stepFields: Record<string, (keyof FormValues)[]> = {
    info: ['type', 'cut', 'name'],
    measures: ['initial_weight', 'diameter'],
    curing: ['curing_method', 'spices'],
};

// Define stepper with icons
const { Stepper, useStepper } = defineStepper(
    { id: 'info', title: 'Informations', description: 'Détails du morceau', icon: Info },
    { id: 'measures', title: 'Mesures', description: 'Poids, diamètre...', icon: Scale },
    { id: 'curing', title: 'Salaison', description: 'Mode de salaison', icon: CloudSnow }
);

// Custom icons list for smoking items
const smokerIcons: IconData[] = [
    { name: "beef", tags: ["viande", "boeuf", "steak"], categories: ["meat"] },
    { name: "ham", tags: ["jambon", "porc", "cochon"], categories: ["meat"] },
    { name: "drumstick", tags: ["cuisse", "poulet", "volaille"], categories: ["meat"] },
    { name: "bone", tags: ["os", "viande", "côte"], categories: ["meat"] },
    { name: "bird", tags: ["oiseau", "canard", "poulet", "volaille"], categories: ["poultry"] },
    { name: "egg", tags: ["oeuf"], categories: ["poultry"] },
    { name: "fish", tags: ["poisson", "saumon", "truite"], categories: ["fish"] },
    { name: "fish-symbol", tags: ["poisson", "symbole"], categories: ["fish"] },
    { name: "shrimp", tags: ["crevette", "crustacé"], categories: ["fish"] },
    { name: "shell", tags: ["coquillage", "fruit de mer"], categories: ["fish"] },
    { name: "piggy-bank", tags: ["cochon", "porc"], categories: ["animals"] },
    { name: "rabbit", tags: ["lapin", "gibier"], categories: ["animals"] },
    { name: "squirrel", tags: ["écureuil", "gibier"], categories: ["animals"] },
    { name: "paw-print", tags: ["patte", "animal", "gibier"], categories: ["animals"] },
    { name: "trees", tags: ["forêt", "sauvage", "gibier", "cerf", "sanglier"], categories: ["nature"] },
    { name: "leaf", tags: ["feuille", "nature"], categories: ["nature"] },
    { name: "mountain", tags: ["montagne", "alpin"], categories: ["nature"] },
    { name: "cooking-pot", tags: ["marmite", "cuisine"], categories: ["cooking"] },
    { name: "utensils", tags: ["couverts", "fourchette", "couteau"], categories: ["cooking"] },
    { name: "flame", tags: ["feu", "fumage", "chaleur"], categories: ["cooking"] },
];

// Available animals
const animals = [
    { value: 'porc', label: 'Porc', category: 'meat' },
    { value: 'canard', label: 'Canard', category: 'meat' },
    { value: 'boeuf', label: 'Bœuf', category: 'meat' },
    { value: 'poulet', label: 'Poulet', category: 'meat' },
    { value: 'agneau', label: 'Agneau', category: 'meat' },
    { value: 'cerf', label: 'Cerf', category: 'meat' },
    { value: 'sanglier', label: 'Sanglier', category: 'meat' },
    { value: 'saumon', label: 'Saumon', category: 'fish' },
    { value: 'truite', label: 'Truite', category: 'fish' },
    { value: 'maquereau', label: 'Maquereau', category: 'fish' },
    { value: 'autre', label: 'Autre', category: 'other' },
];

interface ItemFormDialogProps {
    smokeId: number;
    item: Item | null;
    onClose: () => void;
    onSaved: () => void;
}

// === STEP 1: INFO FORM ===
function InfoStepContent() {
    const { control, setValue, watch } = useFormContext<FormValues>();
    const type = watch('type');
    const icon = watch('icon');

    // Default icon based on animal type
    const getDefaultIcon = (type: string): IconName => {
        const iconMap: Record<string, IconName> = {
            porc: 'piggy-bank',
            canard: 'bird',
            poulet: 'bird',
            boeuf: 'beef',
            agneau: 'beef',
            cerf: 'trees',
            sanglier: 'trees',
            saumon: 'fish',
            truite: 'fish',
            maquereau: 'fish',
        };
        return iconMap[type] || 'beef';
    };

    const allDefaultIcons = new Set(['piggy-bank', 'bird', 'beef', 'trees', 'fish']);

    useEffect(() => {
        if (type) {
            const currentIconIsDefault = !icon || allDefaultIcons.has(icon);
            if (currentIconIsDefault) {
                setValue('icon', getDefaultIcon(type));
            }
        }
    }, [type, icon, setValue]);

    return (
        <Stepper.Panel className="rounded-lg border p-4 space-y-4">
            {/* Section Header */}
            <div className="space-y-1">
                <h3 className="text-lg font-semibold">Informations de base</h3>
                <p className="text-sm text-muted-foreground">Renseignez les informations principales du morceau</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                <FormField
                    control={control}
                    name="type"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Animal *</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Sélectionner..." />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">Viandes</div>
                                    {animals.filter(a => a.category === 'meat').map(animal => (
                                        <SelectItem key={animal.value} value={animal.value}>{animal.label}</SelectItem>
                                    ))}
                                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground mt-1">Poissons</div>
                                    {animals.filter(a => a.category === 'fish').map(animal => (
                                        <SelectItem key={animal.value} value={animal.value}>{animal.label}</SelectItem>
                                    ))}
                                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground mt-1">Autre</div>
                                    {animals.filter(a => a.category === 'other').map(animal => (
                                        <SelectItem key={animal.value} value={animal.value}>{animal.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </FormItem>
                    )}
                />
                <FormField
                    control={control}
                    name="cut"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Morceau *</FormLabel>
                            <FormControl>
                                <Input {...field} placeholder="Ex : Filet mignon, Magret..." />
                            </FormControl>
                        </FormItem>
                    )}
                />
            </div>
            <div className="grid grid-cols-[1fr_auto] gap-4">
                <FormField
                    control={control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel><span className="sm:hidden">Nom *</span><span className="hidden sm:inline">Nom du morceau *</span></FormLabel>
                            <FormControl>
                                <Input {...field} placeholder="Ex : Porc - Filet mignon 1" />
                            </FormControl>
                        </FormItem>
                    )}
                />
                <FormField
                    control={control}
                    name="icon"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Icône</FormLabel>
                            <FormControl>
                                <IconPicker
                                    value={field.value as IconName | undefined}
                                    onValueChange={field.onChange}
                                    iconsList={smokerIcons}
                                    categorized={false}
                                    triggerPlaceholder="Sélectionner..."
                                    searchPlaceholder="Rechercher..."
                                    allIconsLabel="Icônes"
                                    modal
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />
            </div>
        </Stepper.Panel>
    );
}

// === STEP 2: MEASURES FORM ===
function MeasuresStepContent() {
    const { control, watch } = useFormContext<FormValues>();
    const initialWeight = watch('initial_weight') || 0;
    const targetPercent = watch('target_weight_percent') || 30;
    const targetWeight = initialWeight * (1 - targetPercent / 100);

    return (
        <Stepper.Panel className="rounded-lg border p-4 space-y-4">
            {/* Section Header */}
            <div className="space-y-1">
                <h3 className="text-lg font-semibold">Mesures</h3>
                <p className="text-sm text-muted-foreground">Prenez les mesures initiales du morceau</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <FormField
                    control={control}
                    name="initial_weight"
                    render={({ field, fieldState }) => (
                        <FormItem>
                            <NumberInput
                                label="Poids initial (g)"
                                value={field.value || undefined}
                                onChange={field.onChange}
                                minValue={0}
                                step={10}
                                suffix="g"
                                error={!!fieldState.error}
                            />
                        </FormItem>
                    )}
                />
                <FormField
                    control={control}
                    name="diameter"
                    render={({ field, fieldState }) => (
                        <FormItem>
                            <NumberInput
                                label="Diamètre (cm)"
                                value={field.value || undefined}
                                onChange={field.onChange}
                                minValue={0}
                                step={0.5}
                                suffix="cm"
                                error={!!fieldState.error}
                            />
                        </FormItem>
                    )}
                />
                <FormField
                    control={control}
                    name="target_weight_percent"
                    render={({ field }) => (
                        <FormItem>
                            <NumberInput
                                label="Perte attendue (%)"
                                value={field.value}
                                onChange={field.onChange}
                                minValue={20}
                                maxValue={50}
                                step={5}
                                suffix="%"
                            />
                        </FormItem>
                    )}
                />
            </div>
            <div className="p-4 bg-muted rounded-lg text-center">
                <p className="text-sm text-muted-foreground">Poids final attendu</p>
                <p className="text-2xl font-bold">
                    {initialWeight > 0 ? `${Math.round(targetWeight)}g` : '...g'}
                </p>
            </div>
        </Stepper.Panel>
    );
}

// === SPICES EDITOR COMPONENT ===
function SpicesEditor() {
    const { watch, setValue, formState } = useFormContext<FormValues>();
    const spices = watch('spices') || [];
    const spicesErrors = formState.errors.spices;

    const addSpice = () => {
        setValue('spices', [...spices, { name: '', amount: 0 }]);
    };

    const removeSpice = (index: number) => {
        setValue('spices', spices.filter((_, i) => i !== index));
    };

    const updateSpice = (index: number, field: 'name' | 'amount', value: string | number) => {
        const updated = [...spices];
        updated[index] = { ...updated[index], [field]: value };
        setValue('spices', updated, { shouldValidate: true });
    };

    // Check if a specific field has an error
    const hasError = (index: number, field: 'name' | 'amount'): boolean => {
        if (!spicesErrors || !Array.isArray(spicesErrors)) return false;
        const spiceError = spicesErrors[index] as Record<string, unknown> | undefined;
        return !!(spiceError && spiceError[field]);
    };

    return (
        <div className="space-y-3 border-t pt-4">
            <div className="flex items-center justify-between">
                <FormLabel>Épices (optionnel)</FormLabel>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addSpice}
                >
                    <Plus className="h-4 w-4" />
                    Ajouter
                </Button>
            </div>
            {spices.length > 0 && (
                <div className="space-y-2">
                    {spices.map((spice, index) => (
                        <div key={index} className="flex items-center gap-2">
                            <Input
                                placeholder="Nom"
                                value={spice.name}
                                onChange={(e) => updateSpice(index, 'name', e.target.value)}
                                className={`flex-1 ${hasError(index, 'name') ? 'border-destructive' : ''}`}
                            />
                            <NumberInput
                                value={spice.amount || undefined}
                                onChange={(value) => updateSpice(index, 'amount', value)}
                                minValue={0}
                                step={1}
                                suffix="g"
                                className="w-24"
                                error={hasError(index, 'amount')}
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeSpice(index)}
                                className="shrink-0 text-muted-foreground hover:text-destructive"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                </div>
            )}
            {spices.length === 0 && (
                <p className="text-sm text-muted-foreground italic">
                    Aucune épice ajoutée
                </p>
            )}
        </div>
    );
}

// === STEP 3: CURING FORM ===
function CuringStepContent({ 
    curingDaysVacuum, 
    curingHoursTraditional,
    saltAmount,
    sugarAmount,
    pepperAmount
}: { 
    curingDaysVacuum: number; 
    curingHoursTraditional: number;
    saltAmount: number;
    sugarAmount: number;
    pepperAmount: number;
}) {
    const { control, watch, setValue } = useFormContext<FormValues>();
    const curingMethod = watch('curing_method');
    const diameter = watch('diameter') || 0;

    const handleSelectMethod = (method: 'vacuum' | 'traditional') => {
        setValue('curing_method', method);
        if (method === 'vacuum') {
            setValue('salt_amount', saltAmount);
            setValue('sugar_amount', sugarAmount);
            setValue('pepper_amount', pepperAmount);
        } else {
            setValue('salt_amount', 0);
            setValue('sugar_amount', 0);
            setValue('pepper_amount', 0);
        }
    };

    return (
        <Stepper.Panel className="rounded-lg border p-4 space-y-4">
            {/* Section Header */}
            <div className="space-y-1">
                <h3 className="text-lg font-semibold">Salaison</h3>
                <p className="text-sm text-muted-foreground">Choisissez la méthode de salaison</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                    type="button"
                    onClick={() => handleSelectMethod('vacuum')}
                    className={`p-3 rounded-lg border-2 text-left transition-all ${
                        curingMethod === 'vacuum'
                            ? 'border-blue-500 bg-blue-500/10'
                            : 'border-border hover:border-blue-500/50 hover:bg-blue-500/5'
                    }`}
                >
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                            curingMethod === 'vacuum' 
                                ? 'bg-blue-500 text-white' 
                                : 'bg-muted text-muted-foreground'
                        }`}>
                            <ShoppingBag className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="font-medium">Sous vide</p>
                            <p className="text-xs text-muted-foreground">Salaison au sel fin</p>
                        </div>
                    </div>
                </button>
                <button
                    type="button"
                    onClick={() => handleSelectMethod('traditional')}
                    className={`p-3 rounded-lg border-2 text-left transition-all ${
                        curingMethod === 'traditional'
                            ? 'border-amber-500 bg-amber-500/10'
                            : 'border-border hover:border-amber-500/50 hover:bg-amber-500/5'
                    }`}
                >
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                            curingMethod === 'traditional' 
                                ? 'bg-amber-500 text-white' 
                                : 'bg-muted text-muted-foreground'
                        }`}>
                            <Mountain className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="font-medium">Traditionnelle</p>
                            <p className="text-xs text-muted-foreground">Enfouissement au gros sel</p>
                        </div>
                    </div>
                </button>
            </div>

            {curingMethod === 'vacuum' && (
                <div className="space-y-4 pt-2 animate-in slide-in-from-top-2 duration-200">
                    <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                        <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                            Durée calculée : {curingDaysVacuum} jours
                        </p>
                        <p className="text-xs text-muted-foreground">
                            (diamètre {diameter}cm ÷ 2 + 24h)
                        </p>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                        <FormField
                            control={control}
                            name="salt_amount"
                            render={({ field }) => (
                                <FormItem>
                                    <NumberInput
                                        label="Sel (g)"
                                        value={field.value || undefined}
                                        onChange={field.onChange}
                                        minValue={0}
                                        step={1}
                                        suffix="g"
                                    />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={control}
                            name="sugar_amount"
                            render={({ field }) => (
                                <FormItem>
                                    <NumberInput
                                        label="Sucre (g)"
                                        value={field.value || undefined}
                                        onChange={field.onChange}
                                        minValue={0}
                                        step={1}
                                        suffix="g"
                                    />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={control}
                            name="pepper_amount"
                            render={({ field }) => (
                                <FormItem>
                                    <NumberInput
                                        label="Poivre (g)"
                                        value={field.value || undefined}
                                        onChange={field.onChange}
                                        minValue={0}
                                        step={1}
                                        suffix="g"
                                    />
                                </FormItem>
                            )}
                        />
                    </div>
                    <SpicesEditor />
                </div>
            )}

            {curingMethod === 'traditional' && (
                <div className="space-y-4 pt-2 animate-in slide-in-from-top-2 duration-200">
                    <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                        <p className="text-sm font-medium text-amber-600 dark:text-amber-400">
                            Durée recommandée : {curingHoursTraditional}h
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Recouvrir le morceau de gros sel alimentaire
                        </p>
                    </div>
                    <SpicesEditor />
                </div>
            )}
        </Stepper.Panel>
    );
}

// === MAIN COMPONENT ===
function FormStepperComponent({ 
    smokeId, 
    item, 
    onClose, 
    onSaved 
}: ItemFormDialogProps) {
    const methods = useStepper();
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Combined form for all steps
    const form = useForm<FormValues>({
        mode: 'onChange',
        resolver: zodResolver(formSchema),
        defaultValues: {
            // Info
            type: item?.type || '',
            cut: item?.cut || '',
            name: item?.name || '',
            icon: item?.icon || '',
            // Measures
            initial_weight: item?.initial_weight || 0,
            diameter: item?.diameter || 0,
            target_weight_percent: 30,
            // Curing
            curing_method: item?.curing_method || null,
            salt_amount: item?.salt_amount || 0,
            sugar_amount: item?.sugar_amount || 0,
            pepper_amount: item?.pepper_amount || 0,
            spices: item?.spices ? (() => {
                try {
                    return JSON.parse(item.spices);
                } catch {
                    // Si ce n'est pas du JSON valide, c'est une ancienne valeur texte
                    return item.spices ? [item.spices] : [];
                }
            })() : [],
        },
    });

    // Calculated values
    const initialWeight = form.watch('initial_weight') || 0;
    const diameter = form.watch('diameter') || 0;
    const targetPercent = form.watch('target_weight_percent') || 30;
    const targetWeight = initialWeight * (1 - targetPercent / 100);
    const curingDaysVacuum = Math.ceil(diameter / 2) + 1;
    const curingHoursTraditional = 10;
    const saltAmount = Math.ceil(initialWeight * 0.04);
    const sugarAmount = Math.ceil(initialWeight * 0.02);
    const pepperAmount = Math.ceil(initialWeight * 0.01);

    // Validate current step fields only
    const validateCurrentStep = async (): Promise<boolean> => {
        const currentStepId = methods.current.id;
        const fieldsToValidate = stepFields[currentStepId];
        if (!fieldsToValidate) return true;
        
        const result = await form.trigger(fieldsToValidate);
        return result;
    };

    // Clear errors for a specific step
    const clearStepErrors = (stepId: string) => {
        const fields = stepFields[stepId];
        if (fields) {
            fields.forEach(field => form.clearErrors(field));
        }
    };

    // Filter out empty spice rows and serialize to JSON
    const serializeSpices = (spices: FormValues['spices']): string | null => {
        if (!spices) return null;
        const validSpices = spices.filter(s => s.name && s.name.trim().length > 0 && s.amount > 0);
        return validSpices.length > 0 ? JSON.stringify(validSpices) : null;
    };

    async function handleFinalSubmit() {
        const formData = form.getValues();
        if (!formData.name || !formData.initial_weight || !formData.curing_method) return;

        setIsSubmitting(true);
        let error;

        if (item?.id) {
            const updateData: Partial<Omit<Item, 'id' | 'created_at' | 'smoke_id'>> = {
                name: formData.name,
                type: formData.type,
                icon: formData.icon || null,
                cut: formData.cut,
                initial_weight: formData.initial_weight,
                diameter: formData.diameter,
                target_weight: Math.round(targetWeight),
                spices: serializeSpices(formData.spices),
            };

            if (formData.curing_method !== item.curing_method) {
                updateData.curing_method = formData.curing_method;
                updateData.salt_amount = formData.curing_method === 'vacuum' ? formData.salt_amount : null;
                updateData.sugar_amount = formData.curing_method === 'vacuum' ? formData.sugar_amount : null;
                updateData.pepper_amount = formData.curing_method === 'vacuum' ? formData.pepper_amount : null;

                const now = new Date().toISOString();
                const endDate = new Date();
                if (formData.curing_method === 'vacuum') {
                    endDate.setDate(endDate.getDate() + curingDaysVacuum);
                } else {
                    endDate.setHours(endDate.getHours() + curingHoursTraditional);
                }
                updateData.status = 'curing';
                updateData.curing_start_date = now;
                updateData.curing_end_date = endDate.toISOString();
            } else {
                if (formData.salt_amount !== item.salt_amount) updateData.salt_amount = formData.salt_amount;
                if (formData.sugar_amount !== item.sugar_amount) updateData.sugar_amount = formData.sugar_amount;
                if (formData.pepper_amount !== item.pepper_amount) updateData.pepper_amount = formData.pepper_amount;
            }

            const result = await updateItem(item.id, updateData);
            error = result.error;
        } else {
            const now = new Date().toISOString();
            const endDate = new Date();
            if (formData.curing_method === 'vacuum') {
                endDate.setDate(endDate.getDate() + curingDaysVacuum);
            } else {
                endDate.setHours(endDate.getHours() + curingHoursTraditional);
            }

            const itemData: Omit<Item, 'id' | 'created_at'> = {
                smoke_id: smokeId,
                name: formData.name,
                type: formData.type,
                icon: formData.icon || null,
                cut: formData.cut || null,
                initial_weight: formData.initial_weight,
                diameter: formData.diameter,
                target_weight: Math.round(targetWeight),
                curing_method: formData.curing_method,
                salt_amount: formData.curing_method === 'vacuum' ? (formData.salt_amount ?? null) : null,
                sugar_amount: formData.curing_method === 'vacuum' ? (formData.sugar_amount ?? null) : null,
                pepper_amount: formData.curing_method === 'vacuum' ? (formData.pepper_amount ?? null) : null,
                spices: serializeSpices(formData.spices),
                status: 'curing',
                curing_start_date: now,
                curing_end_date: endDate.toISOString(),
                rinsing_date: null,
                drying_start_date: null,
                smoking_date: null,
                aging_start_date: null,
            };

            const result = await createItem(itemData);
            error = result.error;
        }

        setIsSubmitting(false);

        if (error) {
            console.error('Error saving item:', error);
            return;
        }

        onSaved();
        onClose();
    }

    return (
        <Form {...form}>
            <form className="space-y-10">
                {/* Navigation */}
                <Stepper.Navigation>
                    {methods.all.map((step, index) => {
                        const StepIcon = step.icon;
                        const currentIndex = methods.all.findIndex(s => s.id === methods.current.id);
                        const isGoingForward = index > currentIndex;
                        
                        return (
                            <Stepper.Step
                                key={step.id}
                                of={step.id}
                                icon={StepIcon ? <StepIcon className="h-4 w-4" /> : undefined}
                                onClick={async () => {
                                    // Only validate when going forward
                                    if (isGoingForward) {
                                        const valid = await validateCurrentStep();
                                        if (!valid) return;
                                    }
                                    // Clear errors on the target step before navigating
                                    clearStepErrors(step.id);
                                    methods.goTo(step.id);
                                }}
                            >
                                <Stepper.Title>{step.title}</Stepper.Title>
                                <Stepper.Description>{step.description}</Stepper.Description>
                            </Stepper.Step>
                        );
                    })}
                </Stepper.Navigation>

                {/* Content */}
                <div>
                    {methods.switch({
                        'info': () => <InfoStepContent />,
                        'measures': () => <MeasuresStepContent />,
                        'curing': () => (
                            <CuringStepContent 
                                curingDaysVacuum={curingDaysVacuum}
                                curingHoursTraditional={curingHoursTraditional}
                                saltAmount={saltAmount}
                                sugarAmount={sugarAmount}
                                pepperAmount={pepperAmount}
                            />
                        ),
                    })}
                </div>

                {/* Controls */}
                <Stepper.Controls className="flex items-center justify-between border-t pt-4">
                    {/* Left: Previous or Delete */}
                    <div className="flex-1">
                        {!methods.isFirst ? (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={methods.prev}
                            >
                                <ChevronLeft />
                                <span>Précédent</span>
                            </Button>
                        ) : item ? (
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive">
                                        <Trash2 />
                                        Supprimer
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Supprimer ce morceau ?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Cette action est irréversible. Le morceau "{item.name}" sera définitivement supprimé.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                                        <AlertDialogAction
                                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                            onClick={async () => {
                                                await deleteItem(item.id);
                                                onSaved();
                                                onClose();
                                            }}
                                        >
                                            Supprimer
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        ) : null}
                    </div>

                    {/* Right: Next or Submit */}
                    <div className="flex gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            className={methods.isLast ? "bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white border-0" : ""}
                            onClick={async () => {
                                if (methods.isLast) {
                                    // Final submit
                                    const valid = await validateCurrentStep();
                                    if (valid) {
                                        handleFinalSubmit();
                                    }
                                } else {
                                    // Validate before next
                                    const valid = await validateCurrentStep();
                                    if (valid) {
                                        // Clear errors on the next step before navigating
                                        const nextStepIndex = methods.all.findIndex(s => s.id === methods.current.id) + 1;
                                        if (nextStepIndex < methods.all.length) {
                                            clearStepErrors(methods.all[nextStepIndex].id);
                                        }
                                        methods.next();
                                    }
                                }
                            }}
                            disabled={isSubmitting}
                        >
                            {methods.isLast ? (
                                <>
                                    <Check />
                                    {isSubmitting ? "..." : "Terminer"}
                                </>
                            ) : (
                                <>
                                    Suivant
                                    <ChevronRight />
                                </>
                            )}
                        </Button>
                    </div>
                </Stepper.Controls>
            </form>
        </Form>
    );
}

export function ItemFormDialog({ smokeId, item, onClose, onSaved }: ItemFormDialogProps) {
    return (
        <Dialog open onOpenChange={onClose}>
            <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
                <DialogHeader className="mb-8">
                    <DialogTitle className="flex items-center gap-2">
                        <Flame className="h-5 w-5 text-orange-500" />
                        {item ? 'Modifier le morceau' : 'Nouveau morceau'}
                    </DialogTitle>
                </DialogHeader>

                <Stepper.Provider variant="horizontal" labelOrientation="vertical">
                    <FormStepperComponent 
                        smokeId={smokeId} 
                        item={item} 
                        onClose={onClose} 
                        onSaved={onSaved} 
                    />
                </Stepper.Provider>
            </DialogContent>
        </Dialog>
    );
}
