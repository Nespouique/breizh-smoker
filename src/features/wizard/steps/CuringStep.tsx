import { useState, useEffect } from 'react';
import type { Item } from '@/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface CuringStepProps {
    data: Partial<Item>;
    onSave: (updates: Partial<Item>) => Promise<boolean>;
    onNext: () => void;
}

export function CuringStep({ data, onSave, onNext }: CuringStepProps) {
    const [curingMethod, setCuringMethod] = useState<'vacuum' | 'traditional'>(
        data.curing_method || 'vacuum'
    );

    const initialWeight = data.initial_weight || 0;
    const diameter = data.diameter || 0;

    // Auto-calculate amounts for vacuum method
    const saltAmount = Math.round(initialWeight * 0.04 * 10) / 10; // 4%
    const sugarAmount = Math.round(initialWeight * 0.02 * 10) / 10; // 2%
    const pepperAmount = Math.round(initialWeight * 0.01 * 10) / 10; // 1%

    // Auto-calculate duration based on diameter
    const curingDaysVacuum = Math.ceil(diameter / 2) + 1; // diameter/2 + 24h
    const curingHoursTraditional = 10; // 8-12h, moyenne à 10h

    const [formData, setFormData] = useState({
        salt_amount: data.salt_amount || saltAmount,
        sugar_amount: data.sugar_amount || sugarAmount,
        pepper_amount: data.pepper_amount || pepperAmount,
        spices: data.spices || '',
    });

    useEffect(() => {
        if (curingMethod === 'vacuum') {
            setFormData({
                salt_amount: saltAmount,
                sugar_amount: sugarAmount,
                pepper_amount: pepperAmount,
                spices: formData.spices,
            });
        } else {
            setFormData({
                salt_amount: 0,
                sugar_amount: 0,
                pepper_amount: 0,
                spices: formData.spices,
            });
        }
    }, [curingMethod]);

    async function handleSave() {
        const now = new Date().toISOString();
        let curingEndDate: string;

        if (curingMethod === 'vacuum') {
            const endDate = new Date();
            endDate.setDate(endDate.getDate() + curingDaysVacuum);
            curingEndDate = endDate.toISOString();
        } else {
            const endDate = new Date();
            endDate.setHours(endDate.getHours() + curingHoursTraditional);
            curingEndDate = endDate.toISOString();
        }

        const success = await onSave({
            curing_method: curingMethod,
            ...formData,
            curing_start_date: now,
            curing_end_date: curingEndDate,
            status: 'curing',
        });

        if (success) {
            onNext();
        }
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Méthode de salaison</CardTitle>
                    <CardDescription>
                        Choisissez la méthode de salaison adaptée au morceau
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs value={curingMethod} onValueChange={(v) => setCuringMethod(v as 'vacuum' | 'traditional')}>
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="vacuum">Sous vide</TabsTrigger>
                            <TabsTrigger value="traditional">Traditionnelle</TabsTrigger>
                        </TabsList>

                        <TabsContent value="vacuum" className="space-y-4 mt-4">
                            <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg space-y-2">
                                <h4 className="font-semibold">Salaison sous vide</h4>
                                <p className="text-sm text-muted-foreground">
                                    Les épices et le sel sont mélangés puis appliqués sur le morceau, qui est ensuite mis sous vide.
                                </p>
                                <p className="text-sm font-medium">
                                    Durée calculée : {curingDaysVacuum} jours (diamètre {diameter}cm ÷ 2 + 24h)
                                </p>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="salt">Sel (g)</Label>
                                    <Input
                                        id="salt"
                                        type="number"
                                        step="0.1"
                                        value={formData.salt_amount}
                                        onChange={(e) => setFormData({ ...formData, salt_amount: parseFloat(e.target.value) })}
                                    />
                                    <p className="text-xs text-muted-foreground">4% du poids</p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="sugar">Sucre (g)</Label>
                                    <Input
                                        id="sugar"
                                        type="number"
                                        step="0.1"
                                        value={formData.sugar_amount}
                                        onChange={(e) => setFormData({ ...formData, sugar_amount: parseFloat(e.target.value) })}
                                    />
                                    <p className="text-xs text-muted-foreground">2% du poids</p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="pepper">Poivre (g)</Label>
                                    <Input
                                        id="pepper"
                                        type="number"
                                        step="0.1"
                                        value={formData.pepper_amount}
                                        onChange={(e) => setFormData({ ...formData, pepper_amount: parseFloat(e.target.value) })}
                                    />
                                    <p className="text-xs text-muted-foreground">1% du poids</p>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="traditional" className="space-y-4 mt-4">
                            <div className="bg-amber-50 dark:bg-amber-950 p-4 rounded-lg space-y-2">
                                <h4 className="font-semibold">Salaison traditionnelle par enfouissement</h4>
                                <p className="text-sm text-muted-foreground">
                                    Recouvrir le morceau de gros sel alimentaire en dessous et au-dessus.
                                </p>
                                <p className="text-sm font-medium">
                                    Durée recommandée: {curingHoursTraditional}h (8-12h selon la taille)
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Les épices peuvent être ajoutées avant ou après fumage.
                                </p>
                            </div>
                        </TabsContent>
                    </Tabs>

                    <div className="space-y-2 mt-4">
                        <Label htmlFor="spices">Épices (optionnel)</Label>
                        <Textarea
                            id="spices"
                            value={formData.spices}
                            onChange={(e) => setFormData({ ...formData, spices: e.target.value })}
                            placeholder="ex: Herbes de provence 3g, Piment d'espelette 1g, Paprika fumé 3g"
                            className="min-h-20"
                        />
                        <p className="text-xs text-muted-foreground">
                            Épices recommandées: Herbes de provence, Piment d'espelette, Paprika fumé, Céleri
                        </p>
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-end">
                <Button onClick={handleSave} size="lg">
                    Démarrer la salaison
                </Button>
            </div>
        </div>
    );
}
