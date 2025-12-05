import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import type { Smoke, Item } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { ItemFormDialog } from '../wizard/ItemFormDialog';
import { ProcessDialog } from '../wizard/ProcessDialog';
import { WeightTrackingDialog } from '../wizard/WeightTrackingDialog';
import { ItemCard } from './ItemCard';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Plus, Home, Flame, Pencil, Check, X } from 'lucide-react';

type DialogType = 'form' | 'process' | 'tracking' | null;

export function SmokeView() {
    const { smokeId } = useParams<{ smokeId: string }>();
    const navigate = useNavigate();
    const [smoke, setSmoke] = useState<Smoke | null>(null);
    const [items, setItems] = useState<Item[]>([]);
    const [activeDialog, setActiveDialog] = useState<DialogType>(null);
    const [selectedItem, setSelectedItem] = useState<Item | null>(null);
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(true);
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [editedTitle, setEditedTitle] = useState('');

    useEffect(() => {
        loadSmoke();
    }, [smokeId]);

    async function loadSmoke() {
        if (!smokeId) return;

        setLoading(true);

        // Get smoke by ID
        const { data: smokeData, error } = await supabase
            .from('smokes')
            .select('*')
            .eq('id', parseInt(smokeId))
            .single();

        if (error) {
            console.error('Error loading smoke:', error);
            navigate('/');
            return;
        }

        setSmoke(smokeData);
        setNotes(smokeData?.notes || '');

        // Load items for this smoke
        const { data: itemsData, error: itemsError } = await supabase
            .from('items')
            .select('*')
            .eq('smoke_id', smokeData.id)
            .order('name', { ascending: true });

        if (itemsError) {
            console.error('Error loading items:', itemsError);
        } else {
            setItems(itemsData || []);
        }

        setLoading(false);
    }

    async function saveNotes() {
        if (!smoke) return;

        const { error } = await supabase
            .from('smokes')
            .update({ notes })
            .eq('id', smoke.id);

        if (error) {
            console.error('Error saving notes:', error);
        }
    }

    function startEditingTitle() {
        if (smoke) {
            setEditedTitle(smoke.name);
            setIsEditingTitle(true);
        }
    }

    function cancelEditingTitle() {
        setIsEditingTitle(false);
        setEditedTitle('');
    }

    async function saveTitle() {
        if (!smoke || !editedTitle.trim()) return;

        const { error } = await supabase
            .from('smokes')
            .update({ name: editedTitle.trim() })
            .eq('id', smoke.id);

        if (error) {
            console.error('Error saving title:', error);
            return;
        }

        setSmoke({ ...smoke, name: editedTitle.trim() });
        setIsEditingTitle(false);
        setEditedTitle('');
    }

    function handleEditItem(item: Item) {
        setSelectedItem(item);
        setActiveDialog('form');
    }

    function handleProcessItem(item: Item) {
        setSelectedItem(item);
        setActiveDialog('process');
    }

    function handleTrackingItem(item: Item) {
        setSelectedItem(item);
        setActiveDialog('tracking');
    }

    function handleOpenNewItemForm() {
        setSelectedItem(null);
        setActiveDialog('form');
    }

    function handleCloseDialog() {
        setActiveDialog(null);
        setSelectedItem(null);
    }

    async function handleItemSaved() {
        await loadSmoke();
    }

    async function handleItemUpdated() {
        // Reload items and update selectedItem with fresh data
        if (!smoke) return;
        
        const { data: itemsData } = await supabase
            .from('items')
            .select('*')
            .eq('smoke_id', smoke.id)
            .order('name', { ascending: true });

        if (itemsData) {
            setItems(itemsData);
            // Update selectedItem with fresh data
            if (selectedItem) {
                const updatedItem = itemsData.find(i => i.id === selectedItem.id);
                if (updatedItem) {
                    setSelectedItem(updatedItem);
                }
            }
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-pulse flex items-center gap-3">
                    <Flame className="w-8 h-8 text-orange-500" />
                    <span className="text-lg">Chargement...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            {/* Header */}
            <header className="border-b border-border/50 bg-background/80 backdrop-blur sticky top-0 z-50">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        {/* Bouton Home à gauche */}
                        <Button 
                            variant="outline" 
                            size="icon"
                            className="h-9 w-9"
                            onClick={() => navigate('/')}
                        >
                            <Home className="h-4 w-4" />
                        </Button>

                        {/* Titre centré */}
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg">
                                <Flame className="w-5 h-5 text-white" />
                            </div>
                            <div className="text-center">
                                {isEditingTitle ? (
                                    <div className="flex items-center gap-2">
                                        <Input
                                            value={editedTitle}
                                            onChange={(e) => setEditedTitle(e.target.value)}
                                            className="h-8 text-lg font-bold w-[180px] md:w-[250px]"
                                            autoFocus
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') saveTitle();
                                                if (e.key === 'Escape') cancelEditingTitle();
                                            }}
                                        />
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7 text-green-600 hover:text-green-700 hover:bg-green-100"
                                            onClick={saveTitle}
                                        >
                                            <Check className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                            onClick={cancelEditingTitle}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <h1 className="text-xl md:text-2xl font-bold">{smoke?.name}</h1>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7 text-muted-foreground hover:text-foreground"
                                            onClick={startEditingTitle}
                                        >
                                            <Pencil className="h-3.5 w-3.5" />
                                        </Button>
                                    </div>
                                )}
                                <p className="text-xs md:text-sm text-muted-foreground">
                                    {smoke && new Date(smoke.created_at).toLocaleDateString('fr-FR', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </p>
                            </div>
                        </div>

                        {/* Bouton Theme à droite */}
                        <ThemeToggle />
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-3 sm:px-6 py-6 max-w-7xl">
                {/* Items Grid */}
                {items.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 mb-8">
                        {items.map((item) => (
                            <ItemCard 
                                key={item.id} 
                                item={item} 
                                onEdit={handleEditItem}
                                onProcess={handleProcessItem}
                                onTracking={handleTrackingItem}
                            />
                        ))}
                    </div>
                ) : (
                    <Card className="p-12 bg-card/50 backdrop-blur border-dashed mb-8">
                        <div className="text-center">
                            <div className="flex justify-center mb-4">
                                <div className="p-4 bg-muted rounded-full">
                                    <Plus className="w-8 h-8 text-muted-foreground" />
                                </div>
                            </div>
                            <p className="text-lg mb-2 font-medium">Aucun morceau pour cette session</p>
                            <p className="text-sm text-muted-foreground mb-6">
                                Cliquez sur "Ajouter un morceau" pour commencer
                            </p>
                            <Button 
                                onClick={handleOpenNewItemForm}
                                variant="outline"
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                Ajouter un morceau
                            </Button>
                        </div>
                    </Card>
                )}

                {/* Notes Section */}
                <Card className="bg-card/50 backdrop-blur mb-20">
                    <CardHeader>
                        <CardTitle>Notes de la session</CardTitle>
                        <CardDescription>
                            Retours d'expérience et remarques pour les prochaines sessions
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            onBlur={saveNotes}
                            placeholder="Ajoutez vos notes ici..."
                            className="min-h-32 bg-background/50"
                        />
                    </CardContent>
                </Card>
            </main>

            {/* Bouton flottant Ajouter un morceau */}
            <button
                onClick={handleOpenNewItemForm}
                className="fixed bottom-6 right-6 z-50 p-4 rounded-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white shadow-lg shadow-orange-500/25 transition-transform hover:scale-105 active:scale-95"
                aria-label="Ajouter un morceau"
            >
                <Plus className="h-6 w-6" />
            </button>

            {/* Dialogs */}
            {activeDialog === 'form' && smoke && (
                <ItemFormDialog
                    smokeId={smoke.id}
                    item={selectedItem}
                    onClose={handleCloseDialog}
                    onSaved={handleItemSaved}
                />
            )}

            {activeDialog === 'process' && selectedItem && (
                <ProcessDialog
                    item={selectedItem}
                    onClose={handleCloseDialog}
                    onUpdated={handleItemUpdated}
                />
            )}

            {activeDialog === 'tracking' && selectedItem && (
                <WeightTrackingDialog
                    item={selectedItem}
                    onClose={handleCloseDialog}
                />
            )}
        </div>
    );
}
