import { useState, useEffect } from 'react';
import type { Item, WeightLog } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Beef, Fish, Bird, PiggyBank, Pencil, ListTodo, ChartLine } from 'lucide-react';
import { DynamicIcon, dynamicIconImports } from 'lucide-react/dynamic';
import type { IconName } from 'lucide-react/dynamic';
import { supabase } from '@/lib/supabase';

// Composant pour charger l'icône avec skeleton
function LazyIcon({ name, className }: { name: IconName; className?: string }) {
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        // Précharger l'icône
        if (name && name in dynamicIconImports) {
            dynamicIconImports[name]().then(() => {
                setIsLoaded(true);
            });
        }
    }, [name]);

    return (
        <div className="relative h-5 w-5">
            {!isLoaded && (
                <Skeleton className="absolute inset-0 rounded" />
            )}
            <DynamicIcon 
                name={name} 
                className={`${className} ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-150`} 
            />
        </div>
    );
}

interface ItemCardProps {
    item: Item;
    onEdit: (item: Item) => void;
    onProcess: (item: Item) => void;
    onTracking: (item: Item) => void;
}

const statusLabels: Record<Item['status'], string> = {
    prep: 'Préparation',
    curing: 'Salaison',
    rinsing: 'Rinçage',
    drying: 'Séchage',
    smoking: 'Fumage',
    aging: 'Affinage',
    done: 'Terminé',
};

const statusColors: Record<Item['status'], string> = {
    prep: 'bg-gray-500 hover:bg-gray-500',
    curing: 'bg-blue-500 hover:bg-blue-500',
    rinsing: 'bg-cyan-500 hover:bg-cyan-500',
    drying: 'bg-yellow-500 hover:bg-yellow-500',
    smoking: 'bg-orange-500 hover:bg-orange-500',
    aging: 'bg-purple-500 hover:bg-purple-500',
    done: 'bg-green-500 hover:bg-green-500',
};

// Animal type labels and categories
const animalLabels: Record<string, string> = {
    porc: 'Porc',
    canard: 'Canard',
    boeuf: 'Bœuf',
    poulet: 'Poulet',
    agneau: 'Agneau',
    cerf: 'Cerf',
    sanglier: 'Sanglier',
    saumon: 'Saumon',
    truite: 'Truite',
    maquereau: 'Maquereau',
    autre: 'Autre',
    // Legacy values
    meat: 'Viande',
    fish: 'Poisson',
};

const fishTypes = ['saumon', 'truite', 'maquereau', 'fish'];
const birdTypes = ['canard', 'poulet'];
const porkTypes = ['porc'];

function getAnimalIcon(type: string) {
    if (fishTypes.includes(type)) return Fish;
    if (birdTypes.includes(type)) return Bird;
    if (porkTypes.includes(type)) return PiggyBank;
    return Beef;
}

export function ItemCard({ item, onEdit, onProcess, onTracking }: ItemCardProps) {
    const DefaultIcon = getAnimalIcon(item.type);
    const hasCustomIcon = !!item.icon;
    const [lastWeightLog, setLastWeightLog] = useState<WeightLog | null>(null);

    // Calculate weight loss percentage if we have both initial weight and last weight
    const calculateWeightLoss = () => {
        if (!item.initial_weight || !lastWeightLog) return null;
        const loss = ((item.initial_weight - lastWeightLog.weight) / item.initial_weight) * 100;
        return loss.toFixed(1);
    };

    const weightLoss = calculateWeightLoss();

    useEffect(() => {
        async function loadLastWeightLog() {
            const { data, error } = await supabase
                .from('weight_logs')
                .select('*')
                .eq('item_id', item.id)
                .order('date', { ascending: false })
                .limit(1);

            if (error) {
                console.error('Error loading last weight log:', error);
                return;
            }

            if (data && data.length > 0) {
                setLastWeightLog(data[0]);
            }
        }
        loadLastWeightLog();
    }, [item.id]);

    return (
        <Card className="hover:shadow-lg transition-all duration-300 bg-card/50 backdrop-blur group overflow-hidden">
            <CardHeader className="pb-2 p-3 sm:p-6 sm:pb-3">
                <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                        <div className="p-1.5 sm:p-2 rounded-lg bg-primary/10 dark:bg-muted shrink-0">
                            {hasCustomIcon ? (
                                <LazyIcon name={item.icon as IconName} className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                            ) : (
                                <DefaultIcon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                            )}
                        </div>
                        <div className="min-w-0">
                            <CardTitle className="text-base sm:text-lg font-semibold truncate">
                                {item.name}
                            </CardTitle>
                            <p className="text-xs sm:text-sm text-muted-foreground truncate">
                                {animalLabels[item.type] || item.type}
                                {item.cut && ` • ${item.cut}`}
                            </p>
                        </div>
                    </div>
                    <Badge className={`${statusColors[item.status]} text-white cursor-default select-none text-xs shrink-0`}>
                        {statusLabels[item.status]}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4 p-3 pt-0 sm:p-6 sm:pt-0">
                {/* Infos */}
                <div className="grid grid-cols-2 gap-1.5 sm:gap-2 text-xs sm:text-sm">
                    {item.initial_weight && (
                        <div>
                            <span className="text-muted-foreground">Poids initial:</span>
                            <span className="ml-1 font-medium">{item.initial_weight}g</span>
                        </div>
                    )}
                    {item.target_weight && (
                        <div>
                            <span className="text-muted-foreground">Poids cible:</span>
                            <span className="ml-1 font-medium">{item.target_weight}g</span>
                        </div>
                    )}
                    {item.curing_method && (
                        <div className="col-span-2">
                            <span className="text-muted-foreground">Salaison:</span>
                            <span className="ml-1 font-medium">
                                {item.curing_method === 'vacuum' ? 'Sous vide' : 'Traditionnelle'}
                            </span>
                        </div>
                    )}
                    {lastWeightLog && (
                        <div className="col-span-2">
                            <span className="text-muted-foreground">Dernière pesée:</span>
                            <span className="ml-1 font-medium">
                                {lastWeightLog.weight}g
                                {weightLoss && (
                                    <span className="text-muted-foreground"> (-{weightLoss}%)</span>
                                )}
                            </span>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex gap-1.5 sm:gap-2 pt-2 border-t border-border/50">
                    <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 min-w-0 h-8 text-xs sm:text-sm px-2 sm:px-3"
                        onClick={() => onEdit(item)}
                    >
                        <Pencil className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-2 shrink-0" />
                        <span className="truncate">Modifier</span>
                    </Button>
                    <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 min-w-0 h-8 text-xs sm:text-sm px-2 sm:px-3"
                        onClick={() => onProcess(item)}
                    >
                        <ListTodo className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-2 shrink-0" />
                        <span className="truncate">Étapes</span>
                    </Button>
                    <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 min-w-0 h-8 text-xs sm:text-sm px-2 sm:px-3"
                        onClick={() => onTracking(item)}
                    >
                        <ChartLine className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-2 shrink-0" />
                        <span className="truncate">Suivi</span>
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
