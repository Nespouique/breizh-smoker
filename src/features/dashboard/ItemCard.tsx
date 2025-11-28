import { useState, useEffect } from 'react';
import type { Item } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Beef, Fish, Bird, PiggyBank, Pencil, ListTodo, ChartLine } from 'lucide-react';
import { DynamicIcon, dynamicIconImports } from 'lucide-react/dynamic';
import type { IconName } from 'lucide-react/dynamic';

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

    return (
        <Card className="hover:shadow-lg transition-all duration-300 bg-card/50 backdrop-blur group">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10 dark:bg-muted">
                            {hasCustomIcon ? (
                                <LazyIcon name={item.icon as IconName} className="h-5 w-5 text-primary" />
                            ) : (
                                <DefaultIcon className="h-5 w-5 text-primary" />
                            )}
                        </div>
                        <div>
                            <CardTitle className="text-lg font-semibold">
                                {item.name}
                            </CardTitle>
                            <p className="text-sm text-muted-foreground">
                                {animalLabels[item.type] || item.type}
                                {item.cut && ` • ${item.cut}`}
                            </p>
                        </div>
                    </div>
                    <Badge className={`${statusColors[item.status]} text-white cursor-default select-none`}>
                        {statusLabels[item.status]}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Infos */}
                <div className="grid grid-cols-2 gap-2 text-sm">
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
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2 border-t border-border/50">
                    <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => onEdit(item)}
                    >
                        <Pencil className="h-4 w-4 mr-2" />
                        Modifier
                    </Button>
                    <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => onProcess(item)}
                    >
                        <ListTodo className="h-4 w-4 mr-2" />
                        Étapes
                    </Button>
                    <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => onTracking(item)}
                    >
                        <ChartLine className="h-4 w-4 mr-2" />
                        Suivi
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
