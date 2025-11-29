import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import type { Smoke } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import {
    Flame,
    CloudSnow,
    Timer,
    Leaf,
    Fish,
    Droplets,
    Wind,
    ThermometerSnowflake,
    Scale,
    Plus,
    Sparkles,
    ChevronRight
} from 'lucide-react';

const processSteps = [
    {
        icon: Sparkles,
        title: "Préparation",
        description: "Nettoyage du morceau : retirer le gras, les fibres et les nerfs pour une salaison optimale.",
        color: "text-amber-500"
    },
    {
        icon: Scale,
        title: "Mesures",
        description: "Pesée et mesure du diamètre. Calcul du poids final attendu (30-40% de perte).",
        color: "text-blue-500"
    },
    {
        icon: CloudSnow,
        title: "Salaison",
        description: "Sous vide (sel 4%, sucre 2%, poivre 1%) ou traditionnelle par enfouissement dans le gros sel.",
        color: "text-orange-500"
    },
    {
        icon: Droplets,
        title: "Rinçage",
        description: "Rincer abondamment à l'eau claire sans immerger le morceau.",
        color: "text-cyan-500"
    },
    {
        icon: Wind,
        title: "Séchage",
        description: "Sécher au papier absorbant puis laisser reposer au frigo 24 à 48h.",
        color: "text-slate-400"
    },
    {
        icon: Flame,
        title: "Fumage",
        description: "Fumage à froid dans le barbecue avec un tube et demi de sciure de bois.",
        color: "text-red-500"
    },
    {
        icon: ThermometerSnowflake,
        title: "Affinage",
        description: "Repos au frigo avec contrôle hebdomadaire jusqu'à atteindre le poids cible.",
        color: "text-indigo-500"
    }
];

const tips = [
    { icon: Timer, text: "Ajuster la durée d'affinage en fonction de la texture souhaitée" },
    { icon: Fish, text: "Ajouter un peu plus de fumage pour le saumon qui est moins réceptif" },
    { icon: Leaf, text: "Couvrir les morceaux avec des épices pendant l'affinage pour plus de goût" },
];

export function LandingPage() {
    const navigate = useNavigate();
    const [smokes, setSmokes] = useState<Smoke[]>([]);
    const [showNewSmokeDialog, setShowNewSmokeDialog] = useState(false);
    const [showAllSessionsDialog, setShowAllSessionsDialog] = useState(false);
    const [newSmokeName, setNewSmokeName] = useState('');
    const [isCreating, setIsCreating] = useState(false);

    // Sessions affichées dans le hero (les 2 premières)
    const recentSmokes = smokes.slice(0, 2);
    // Sessions plus anciennes (à partir de la 3ème)
    const olderSmokes = smokes.slice(2);

    useEffect(() => {
        loadSmokes();
    }, []);

    async function loadSmokes() {
        const { data, error } = await supabase
            .from('smokes')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error loading smokes:', error);
            return;
        }

        setSmokes(data || []);
    }

    async function handleCreateSmoke() {
        if (!newSmokeName.trim()) return;

        setIsCreating(true);
        const { data, error } = await supabase
            .from('smokes')
            .insert({ name: newSmokeName.trim(), notes: '' })
            .select()
            .single();

        if (error) {
            console.error('Error creating smoke:', error);
            setIsCreating(false);
            return;
        }

        setShowNewSmokeDialog(false);
        setNewSmokeName('');
        setIsCreating(false);
        navigate(`/smoke/${data.id}`);
    }

    return (
        <div className="min-h-screen">
            {/* Header avec bouton theme */}
            <header className="fixed top-0 left-0 right-0 z-50">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-end">
                        <ThemeToggle />
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="relative overflow-hidden min-h-screen flex flex-col">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-red-500/10" />
                <div className="absolute top-20 left-10 w-72 h-72 bg-orange-500/20 rounded-full blur-3xl" />
                <div className="absolute bottom-10 right-10 w-96 h-96 bg-red-500/10 rounded-full blur-3xl" />
                
                <div className="container mx-auto px-6 py-[8vh] md:py-16 relative flex-1 flex flex-col">
                    <div className="max-w-4xl mx-auto text-center flex-1 flex flex-col justify-center">
                        {/* Logo et titre */}
                        <div>
                            <div className="flex justify-center mb-[3vh] md:mb-6">
                                <div className="p-3 md:p-4 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl shadow-lg shadow-orange-500/25">
                                    <Flame className="w-10 h-10 md:w-12 md:h-12 text-white" />
                                </div>
                            </div>
                            <h1 className="text-4xl md:text-7xl font-bold mb-[3vh] md:mb-6 bg-gradient-to-r from-orange-400 via-red-500 to-orange-600 bg-clip-text text-transparent">
                                Breizh Smoker
                            </h1>
                            <p className="text-lg md:text-2xl text-muted-foreground mb-[10vh] md:mb-12 max-w-2xl mx-auto">
                                Votre assistant pour maîtriser l'art de la fumaison artisanale. 
                                Suivez chaque étape, de la préparation à l'affinage.
                            </p>
                        </div>

                        {/* Sessions - Layout vertical sur mobile, horizontal sur desktop */}
                        <div className="flex flex-col lg:flex-row items-center justify-center gap-[2vh] lg:gap-4 w-full overflow-hidden">
                            {/* Espace pour équilibrer le chevron + séparateur à droite (desktop only) */}
                            {olderSmokes.length > 0 && (
                                <div className="hidden lg:block w-[72px] flex-shrink-0" />
                            )}

                            {/* Carte Nouvelle session - visible sur mobile et desktop */}
                            <Card 
                                className="flex-shrink-0 cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-card/50 backdrop-blur w-full max-w-[200px] lg:w-48"
                                onClick={() => setShowNewSmokeDialog(true)}
                            >
                                <CardHeader className="pb-2 text-center py-[1.5vh] lg:py-3">
                                    <CardTitle className="text-base">Nouvelle session</CardTitle>
                                </CardHeader>
                                <CardContent className="pt-0 pb-[1.5vh] lg:pb-3 flex justify-center">
                                    <div className="p-2 rounded-full border-2 border-dashed border-muted-foreground/50">
                                        <Plus className="w-5 h-5 text-muted-foreground" />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Séparateur vertical sur mobile, horizontal sur desktop */}
                            {recentSmokes.length > 0 && (
                                <>
                                    <div className="lg:hidden w-px h-[2vh] border-l-2 border-dashed border-muted-foreground" />
                                    <span className="hidden lg:inline text-muted-foreground text-2xl">···</span>
                                </>
                            )}

                            {/* Session la plus récente (carte principale) */}
                            {recentSmokes[0] && (
                                <Card 
                                    className="flex-shrink-0 cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-card/50 backdrop-blur w-full max-w-[280px] lg:w-56"
                                    onClick={() => navigate(`/smoke/${recentSmokes[0].id}`)}
                                >
                                    <CardHeader className="pb-2 text-center py-[1.5vh] lg:py-4">
                                        <CardTitle className="text-lg lg:text-xl">{recentSmokes[0].name}</CardTitle>
                                        <CardDescription>
                                            {new Date(recentSmokes[0].created_at).toLocaleDateString('fr-FR')}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="pt-0 pb-[1.5vh] lg:pb-4">
                                        <p className="text-sm text-muted-foreground text-center flex items-center justify-center gap-1">
                                            Accéder à la session <ChevronRight className="w-4 h-4" />
                                        </p>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Séparateur + 2ème session (desktop only) */}
                            {recentSmokes[1] && (
                                <>
                                    <span className="hidden lg:inline text-muted-foreground text-2xl">···</span>
                                    <Card 
                                        className="hidden lg:block flex-shrink-0 cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-card/50 backdrop-blur w-48"
                                        onClick={() => navigate(`/smoke/${recentSmokes[1].id}`)}
                                    >
                                        <CardHeader className="pb-2 text-center py-3">
                                            <CardTitle className="text-base">{recentSmokes[1].name}</CardTitle>
                                            <CardDescription className="text-xs">
                                                {new Date(recentSmokes[1].created_at).toLocaleDateString('fr-FR')}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="pt-0 pb-3">
                                            <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1">
                                                Accéder à la session <ChevronRight className="w-3 h-3" />
                                            </p>
                                        </CardContent>
                                    </Card>
                                </>
                            )}

                            {/* Chevron pour voir plus de sessions (desktop only) */}
                            {olderSmokes.length > 0 && (
                                <button
                                    onClick={() => setShowAllSessionsDialog(true)}
                                    className="hidden lg:flex w-14 flex-shrink-0 items-center justify-center p-3 rounded-full bg-muted/50 hover:bg-muted transition-colors"
                                    aria-label="Voir les sessions plus anciennes"
                                >
                                    <ChevronRight className="w-8 h-8 text-muted-foreground" />
                                </button>
                            )}

                            {/* Bouton Voir plus (mobile/tablette only - quand il y a plus d'1 session) */}
                            {smokes.length > 1 && (
                                <div className="flex lg:hidden flex-col items-center gap-[1.5vh]">
                                    <div className="w-px h-[2vh] border-l-2 border-dashed border-muted-foreground" />
                                    <button
                                        onClick={() => setShowAllSessionsDialog(true)}
                                        className="flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-muted/50 hover:bg-muted transition-colors"
                                    >
                                        <span className="text-sm text-muted-foreground">Voir plus</span>
                                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Process Section */}
            <section className="py-16 bg-muted/30">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">La fumaison en 7 étapes</h2>
                        <p className="text-muted-foreground max-w-3xl mx-auto">
                            Un savoir-faire ancestral pour transformer vos viandes et poissons en délicieuses préparations fumées.
                        </p>
                    </div>

                    <div className="flex flex-wrap justify-center gap-6">
                        {processSteps.map((step, index) => (
                            <Card key={index} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-card/50 backdrop-blur w-full md:w-[calc(50%-12px)] lg:w-[calc(25%-18px)]">
                                <CardHeader className="pb-3">
                                    <div className="flex flex-col md:flex-row items-center gap-3">
                                        <div className={`p-2 rounded-lg bg-muted ${step.color}`}>
                                            <step.icon className="w-5 h-5" />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium text-muted-foreground">
                                                Étape {index + 1}
                                            </span>
                                        </div>
                                    </div>
                                    <CardTitle className="text-lg text-center md:text-left">{step.title}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <CardDescription className="text-sm leading-relaxed text-center md:text-left">
                                        {step.description}
                                    </CardDescription>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Tips Section */}
            <section className="py-16">
                <div className="container mx-auto px-6">
                    <div className="max-w-4xl mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-bold mb-4">Les astuces du chef</h2>
                            <p className="text-muted-foreground max-w-3xl mx-auto">
                                Quelques idées pour pousser votre expérience de fumaison encore plus loin.
                            </p>
                        </div>
                        <div className="grid gap-4 md:grid-cols-3">
                            {tips.map((tip, index) => (
                                <div 
                                    key={index}
                                    className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 border border-border/50"
                                >
                                    <tip.icon className="w-8 h-8 text-orange-500 flex-shrink-0" />
                                    <p className="text-sm text-muted-foreground">{tip.text}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-8 border-t border-border/50">
                <div className="container mx-auto px-6 text-center text-sm text-muted-foreground">
                    <p>Fait avec 🔥 pour les amateurs de fumaison artisanale</p>
                </div>
            </footer>

            {/* New Smoke Dialog */}
            <Dialog open={showNewSmokeDialog} onOpenChange={setShowNewSmokeDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Nouvelle session de fumaison</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <Label htmlFor="smoke-name">Nom de la session</Label>
                        <Input
                            id="smoke-name"
                            value={newSmokeName}
                            onChange={(e) => setNewSmokeName(e.target.value)}
                            placeholder="ex: Fumaisons 2025"
                            className="mt-2"
                            onKeyDown={(e) => e.key === 'Enter' && handleCreateSmoke()}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowNewSmokeDialog(false)}>
                            Annuler
                        </Button>
                        <Button 
                            onClick={handleCreateSmoke}
                            disabled={!newSmokeName.trim() || isCreating}
                            className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
                        >
                            {isCreating ? 'Création...' : 'Créer la session'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* All Sessions Dialog */}
            <Dialog open={showAllSessionsDialog} onOpenChange={setShowAllSessionsDialog}>
                <DialogContent className="max-w-3xl" onOpenAutoFocus={(e) => e.preventDefault()}>
                    <DialogHeader>
                        <DialogTitle>Toutes les sessions</DialogTitle>
                        <DialogDescription>
                            Retrouvez l'historique de vos sessions de fumaison
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <div className="grid gap-4 md:grid-cols-3">
                            {/* Sur mobile/tablette: afficher toutes les sessions sauf la 1ère (slice(1)) */}
                            {/* Sur desktop (lg:): afficher seulement olderSmokes (à partir de la 3ème) */}
                            {smokes.slice(1).map((smoke, index) => (
                                <Card 
                                    key={smoke.id}
                                    tabIndex={0}
                                    className={`cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-card focus:outline-none focus:ring-2 focus:ring-orange-500 ${index === 0 ? 'lg:hidden' : ''}`}
                                    onClick={() => {
                                        setShowAllSessionsDialog(false);
                                        navigate(`/smoke/${smoke.id}`);
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            setShowAllSessionsDialog(false);
                                            navigate(`/smoke/${smoke.id}`);
                                        }
                                    }}
                                >
                                    <CardHeader className="pb-2 text-center">
                                        <CardTitle className="text-base">{smoke.name}</CardTitle>
                                        <CardDescription className="text-sm">
                                            {new Date(smoke.created_at).toLocaleDateString('fr-FR')}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="pt-0">
                                        <p className="text-sm text-muted-foreground text-center flex items-center justify-center gap-1">
                                            Accéder à la session <ChevronRight className="w-4 h-4" />
                                        </p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
