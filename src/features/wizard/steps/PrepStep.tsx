import { useState } from 'react';
import type { Item } from '@/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface PrepStepProps {
    data: Partial<Item>;
    onSave: (updates: Partial<Item>) => Promise<boolean>;
    onNext: () => void;
}

export function PrepStep({ data, onSave, onNext }: PrepStepProps) {
    const [formData, setFormData] = useState({
        name: data.name || '',
        type: data.type || 'meat' as 'meat' | 'fish',
        cut: data.cut || '',
        initial_weight: data.initial_weight || 0,
        diameter: data.diameter || 0,
    });

    const [targetWeightPercent, setTargetWeightPercent] = useState(30);

    const targetWeight = formData.initial_weight * (1 - targetWeightPercent / 100);

    async function handleSave() {
        const success = await onSave({
            ...formData,
            target_weight: Math.round(targetWeight),
            status: 'prep',
        });

        if (success) {
            onNext();
        }
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Informations de base</CardTitle>
                    <CardDescription>
                        Renseignez les informations principales du morceau
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="type">Type</Label>
                            <Select
                                value={formData.type}
                                onValueChange={(value) => setFormData({ ...formData, type: value as 'meat' | 'fish' })}
                            >
                                <SelectTrigger id="type">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="meat">Viande</SelectItem>
                                    <SelectItem value="fish">Poisson</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="cut">Morceau</Label>
                            <Input
                                id="cut"
                                value={formData.cut}
                                onChange={(e) => setFormData({ ...formData, cut: e.target.value })}
                                placeholder="ex: Filet mignon, Magret, Saumon..."
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="name">Nom du morceau</Label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="ex: Porc - Filet mignon 1"
                        />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Mesures</CardTitle>
                    <CardDescription>
                        Prenez les mesures initiales du morceau
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="weight">Poids initial (grammes)</Label>
                            <Input
                                id="weight"
                                type="number"
                                value={formData.initial_weight || ''}
                                onChange={(e) => setFormData({ ...formData, initial_weight: parseFloat(e.target.value) || 0 })}
                                placeholder="ex: 291"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="diameter">Diamètre (cm)</Label>
                            <Input
                                id="diameter"
                                type="number"
                                step="0.1"
                                value={formData.diameter || ''}
                                onChange={(e) => setFormData({ ...formData, diameter: parseFloat(e.target.value) || 0 })}
                                placeholder="ex: 6"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="loss">Perte attendue (%)</Label>
                        <Input
                            id="loss"
                            type="number"
                            value={targetWeightPercent}
                            onChange={(e) => setTargetWeightPercent(parseFloat(e.target.value) || 30)}
                            min="20"
                            max="50"
                        />
                        <p className="text-sm text-muted-foreground">
                            Perte typique: 30-40%
                        </p>
                    </div>

                    {formData.initial_weight > 0 && (
                        <div className="p-4 bg-secondary rounded-lg">
                            <p className="text-sm font-medium">Poids final attendu</p>
                            <p className="text-2xl font-bold">{Math.round(targetWeight)}g</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="flex justify-end">
                <Button onClick={handleSave} size="lg" disabled={!formData.name || !formData.initial_weight}>
                    Suivant: Salaison
                </Button>
            </div>
        </div>
    );
}
