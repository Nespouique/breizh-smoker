import { useState, useEffect } from 'react';
import type { Item, WeightLog } from '@/types';
import { supabase } from '@/lib/supabase';
import confetti from 'canvas-confetti';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Clock, CalendarPlus, ListChecks } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ProcessDialogProps {
    item: Item;
    onClose: () => void;
    onUpdated: () => void;
}

const processSteps = [
    { key: 'curing', label: 'Salaison', description: 'Saler le morceau pour la conservation' },
    { key: 'rinsing', label: 'Rinçage', description: 'Rincer à l\'eau claire abondamment, sans immerger' },
    { key: 'drying', label: 'Séchage', description: 'Sécher avec du papier absorbant puis laisser au frigo' },
    { key: 'smoking', label: 'Fumage', description: 'Fumer à froid avec 1.5 tubes de fumée' },
    { key: 'aging', label: 'Affinage', description: 'Affiner au frigo, contrôler et retourner chaque semaine' },
    { key: 'done', label: 'C\'est prêt !', description: 'Déguster cette fumaison artisanale !' },
] as const;

export function ProcessDialog({ item, onClose, onUpdated }: ProcessDialogProps) {
    const [isUpdating, setIsUpdating] = useState(false);
    const [lastWeightLog, setLastWeightLog] = useState<WeightLog | null>(null);

    // Charger le dernier weight_log pour l'affinage
    useEffect(() => {
        async function fetchLastWeightLog() {
            if (item.status === 'aging') {
                const { data } = await supabase
                    .from('weight_logs')
                    .select('*')
                    .eq('item_id', item.id)
                    .order('date', { ascending: false })
                    .limit(1)
                    .single();
                
                setLastWeightLog(data);
            }
        }
        fetchLastWeightLog();
    }, [item.id, item.status]);

    // Use item.status directly instead of local state to stay in sync with parent
    const currentStatus = item.status;
    const isDone = currentStatus === 'done';

    const currentStepIndex = processSteps.findIndex(s => s.key === currentStatus);

    function getCuringEndDate() {
        if (item.curing_end_date) {
            const endDate = new Date(item.curing_end_date);
            const now = new Date();
            const isComplete = now >= endDate;

            return {
                formatted: format(endDate, 'PPp', { locale: fr }),
                distance: formatDistanceToNow(endDate, { locale: fr, addSuffix: true }),
                isComplete,
            };
        }
        return null;
    }

    function getDryingEndDate() {
        if (item.drying_start_date) {
            const startDate = new Date(item.drying_start_date);
            const endDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000); // +24h minimum
            const now = new Date();
            const isComplete = now >= endDate;

            return {
                formatted: format(endDate, 'PPp', { locale: fr }),
                distance: formatDistanceToNow(endDate, { locale: fr, addSuffix: true }),
                isComplete,
            };
        }
        return null;
    }

    function getNextAgingCheck() {
        // Si on a un weight_log, le prochain contrôle est 7 jours après
        // Sinon, on se base sur aging_start_date
        const referenceDate = lastWeightLog 
            ? new Date(lastWeightLog.date) 
            : item.aging_start_date 
                ? new Date(item.aging_start_date) 
                : null;
        
        if (referenceDate) {
            const nextCheckDate = new Date(referenceDate.getTime() + 7 * 24 * 60 * 60 * 1000);
            const now = new Date();
            const isLate = now > nextCheckDate;
            
            return {
                formatted: format(nextCheckDate, 'PPp', { locale: fr }),
                distance: formatDistanceToNow(nextCheckDate, { locale: fr, addSuffix: true }),
                isLate,
            };
        }
        return null;
    }

    // Formater une date en format iCalendar (YYYYMMDDTHHMMSSZ)
    function formatICSDate(date: Date): string {
        return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    }

    // Générer et ouvrir un fichier .ics (déclenche l'app calendrier sur mobile)
    function openICS(content: string, filename: string) {
        const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        
        // Sur mobile, window.open déclenche l'app calendrier
        // Sur desktop, cela ouvre aussi l'app par défaut pour les .ics
        const opened = window.open(url, '_blank');
        
        // Fallback: si window.open est bloqué, on télécharge
        if (!opened) {
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
        
        // Nettoyer l'URL après un délai
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    }

    // Ajouter rappel pour la fin de salaison
    function addCuringReminder() {
        if (!item.curing_end_date) return;
        
        const endDate = new Date(item.curing_end_date);
        const startDate = new Date(endDate.getTime() - 30 * 60 * 1000); // 30 min avant
        
        const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Smoker App//FR
BEGIN:VEVENT
UID:curing-${item.id}@smoker
DTSTAMP:${formatICSDate(new Date())}
DTSTART:${formatICSDate(startDate)}
DTEND:${formatICSDate(endDate)}
SUMMARY:🥩 Fin salaison - ${item.name}
DESCRIPTION:La salaison de ${item.name} est terminée. Il est temps de passer au rinçage !
BEGIN:VALARM
TRIGGER:-PT30M
ACTION:DISPLAY
DESCRIPTION:Fin de salaison dans 30 minutes
END:VALARM
END:VEVENT
END:VCALENDAR`;
        
        openICS(icsContent, `salaison-${item.name.replace(/\s+/g, '-')}.ics`);
    }

    // Ajouter rappel pour la fin de séchage
    function addDryingReminder() {
        if (!item.drying_start_date) return;
        
        const startDate = new Date(item.drying_start_date);
        const endDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000); // +24h
        const eventStart = new Date(endDate.getTime() - 30 * 60 * 1000); // 30 min avant
        
        const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Smoker App//FR
BEGIN:VEVENT
UID:drying-${item.id}@smoker
DTSTAMP:${formatICSDate(new Date())}
DTSTART:${formatICSDate(eventStart)}
DTEND:${formatICSDate(endDate)}
SUMMARY:🥩 Fin séchage - ${item.name}
DESCRIPTION:Le séchage minimum de ${item.name} est atteint. Vous pouvez passer au fumage !
BEGIN:VALARM
TRIGGER:-PT30M
ACTION:DISPLAY
DESCRIPTION:Fin de séchage dans 30 minutes
END:VALARM
END:VEVENT
END:VCALENDAR`;
        
        openICS(icsContent, `sechage-${item.name.replace(/\s+/g, '-')}.ics`);
    }

    // Ajouter rappels récurrents pour les contrôles d'affinage (5 semaines)
    function addAgingReminders() {
        const referenceDate = lastWeightLog 
            ? new Date(lastWeightLog.date) 
            : item.aging_start_date 
                ? new Date(item.aging_start_date) 
                : null;
        
        if (!referenceDate) return;
        
        // Premier contrôle = référence + 7 jours, puis répétition hebdomadaire pendant 5 semaines
        const firstCheck = new Date(referenceDate.getTime() + 7 * 24 * 60 * 60 * 1000);
        const eventEnd = new Date(firstCheck.getTime() + 30 * 60 * 1000); // Durée 30 min
        
        const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Smoker App//FR
BEGIN:VEVENT
UID:aging-${item.id}@smoker
DTSTAMP:${formatICSDate(new Date())}
DTSTART:${formatICSDate(firstCheck)}
DTEND:${formatICSDate(eventEnd)}
RRULE:FREQ=WEEKLY;COUNT=5
SUMMARY:🥩 Contrôle affinage - ${item.name}
DESCRIPTION:Contrôler et retourner ${item.name}. Peser et vérifier l'évolution.
BEGIN:VALARM
TRIGGER:-PT1H
ACTION:DISPLAY
DESCRIPTION:Contrôle d'affinage dans 1 heure
END:VALARM
END:VEVENT
END:VCALENDAR`;
        
        openICS(icsContent, `affinage-${item.name.replace(/\s+/g, '-')}.ics`);
    }

    function fireConfetti() {
        const colors = ['#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3', '#54a0ff'];
        
        // Gauche - tire vers le milieu
        setTimeout(() => {
            confetti({
                particleCount: 80,
                angle: 60,
                spread: 60,
                origin: { x: 0, y: 0.7 },
                colors,
                startVelocity: 45,
                gravity: 0.8,
            });
        }, 0);

        // Milieu - tire vers le haut avec variations
        setTimeout(() => {
            confetti({
                particleCount: 70,
                angle: 90,
                spread: 80,
                origin: { x: 0.5, y: 0.8 },
                colors,
                startVelocity: 55,
                gravity: 0.9,
            });
        }, 150);

        // Droite - tire vers le milieu
        setTimeout(() => {
            confetti({
                particleCount: 80,
                angle: 120,
                spread: 60,
                origin: { x: 1, y: 0.7 },
                colors,
                startVelocity: 45,
                gravity: 0.8,
            });
        }, 300);

        // Deuxième salve
        setTimeout(() => {
            confetti({
                particleCount: 60,
                angle: 55,
                spread: 50,
                origin: { x: 0.1, y: 0.6 },
                colors,
                startVelocity: 50,
                gravity: 0.8,
            });
        }, 500);

        setTimeout(() => {
            confetti({
                particleCount: 65,
                angle: 100,
                spread: 100,
                origin: { x: 0.5, y: 0.9 },
                colors,
                startVelocity: 60,
                gravity: 0.85,
            });
        }, 650);

        setTimeout(() => {
            confetti({
                particleCount: 60,
                angle: 125,
                spread: 50,
                origin: { x: 0.9, y: 0.6 },
                colors,
                startVelocity: 50,
                gravity: 0.8,
            });
        }, 800);
    }

    async function handleStepChange(stepKey: string) {
        const stepIndex = processSteps.findIndex(s => s.key === stepKey);
        if (stepIndex <= currentStepIndex) return; // Can't go back

        setIsUpdating(true);

        const now = new Date().toISOString();
        const updates: Partial<Item> = {
            status: stepKey as Item['status'],
        };

        // Set appropriate date fields
        switch (stepKey) {
            case 'rinsing':
                updates.rinsing_date = now;
                break;
            case 'drying':
                updates.drying_start_date = now;
                break;
            case 'smoking':
                updates.smoking_date = now;
                break;
            case 'aging':
                updates.aging_start_date = now;
                break;
        }

        const { error } = await supabase
            .from('items')
            .update(updates)
            .eq('id', item.id);

        setIsUpdating(false);

        if (error) {
            console.error('Error updating item:', error);
            return;
        }

        // Fire confetti when marking as done
        if (stepKey === 'done') {
            fireConfetti();
        }

        onUpdated();
    }

    const curingInfo = getCuringEndDate();
    const dryingInfo = getDryingEndDate();
    const agingCheckInfo = getNextAgingCheck();

    return (
        <Dialog open onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <ListChecks className="h-5 w-5 text-orange-500" />
                        Étapes du processus
                    </DialogTitle>
                </DialogHeader>

                <div className="pt-4 space-y-3">
                    {processSteps.map((step, index) => {
                        const isCompleted = index < currentStepIndex;
                        const isCurrent = index === currentStepIndex;
                        const isLastStep = step.key === 'done';
                        const isLastStepCompleted = isLastStep && isDone;

                        return (
                            <div
                                key={step.key}
                                className={(isLastStepCompleted || (isLastStep && isCurrent))
                                    ? "relative p-[2px] rounded-lg bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500"
                                    : ""
                                }
                            >
                                <div
                                    className={`p-4 rounded-lg border-2 ${
                                        isLastStepCompleted || (isLastStep && isCurrent)
                                            ? 'border-transparent bg-background'
                                            : isCurrent 
                                                ? 'border-orange-500 bg-orange-500/5' 
                                                : isCompleted 
                                                    ? 'border-green-500 bg-green-500/5' 
                                                    : 'border-border bg-muted/30'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`rounded-full p-1.5 ${
                                            isLastStepCompleted || (isLastStep && isCurrent)
                                                ? 'bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white'
                                                : isCompleted 
                                                    ? 'bg-green-500 text-white' 
                                                    : isCurrent 
                                                        ? 'bg-orange-500 text-white' 
                                                        : 'bg-muted text-muted-foreground'
                                        }`}>
                                            {isCompleted || isLastStepCompleted ? (
                                                <Check className="h-4 w-4" />
                                            ) : (
                                                <Clock className="h-4 w-4" />
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <h4 className={`font-medium ${(isLastStepCompleted || (isLastStep && isCurrent)) ? 'bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent' : ''}`}>
                                                    {step.label}
                                                </h4>
                                                {!isLastStep && (
                                                    <Badge 
                                                        className={`text-xs ${
                                                            isCurrent 
                                                                ? 'bg-orange-500 text-white' 
                                                                : isCompleted 
                                                                    ? 'bg-green-500 text-white' 
                                                                    : 'bg-muted text-muted-foreground'
                                                        }`}
                                                    >
                                                        {isCompleted ? 'Fait' : isCurrent ? 'En cours' : 'À faire'}
                                                    </Badge>
                                                )}
                                            </div>
                                            <p className="text-sm text-muted-foreground">{step.description}</p>

                                            {step.key === 'curing' && curingInfo && isCurrent && (
                                                <div className="mt-2 text-sm">
                                                    <p className="text-muted-foreground">
                                                        Fin prévue : {curingInfo.formatted}
                                                    </p>
                                                    <p className={curingInfo.isComplete ? 'text-green-500 font-medium' : 'text-orange-500'}>
                                                        {curingInfo.isComplete ? 'Salaison terminée' : curingInfo.distance}
                                                    </p>
                                                </div>
                                            )}

                                            {step.key === 'drying' && dryingInfo && isCurrent && (
                                                <div className="mt-2 text-sm">
                                                    <p className="text-muted-foreground">
                                                        Fin prévue : {dryingInfo.formatted} minimum
                                                    </p>
                                                    <p className={dryingInfo.isComplete ? 'text-green-500 font-medium' : 'text-orange-500'}>
                                                        {dryingInfo.isComplete ? 'Séchage minimum atteint' : dryingInfo.distance}
                                                    </p>
                                                </div>
                                            )}

                                            {step.key === 'aging' && agingCheckInfo && isCurrent && (
                                                <div className="mt-2 text-sm">
                                                    <p className="text-muted-foreground">
                                                        Prochain contrôle : {agingCheckInfo.formatted}
                                                    </p>
                                                    <p className={agingCheckInfo.isLate ? 'text-red-500 font-medium' : 'text-orange-500'}>
                                                        {agingCheckInfo.distance}
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        {isCurrent && !isDone ? (
                                            <div className="flex flex-col gap-1 shrink-0">
                                                {step.key === 'curing' && curingInfo && !curingInfo.isComplete && (
                                                    <Button
                                                        variant="secondary"
                                                        size="sm"
                                                        className="h-8 w-8 p-0"
                                                        onClick={addCuringReminder}
                                                        title="Ajouter au calendrier"
                                                    >
                                                        <CalendarPlus className="h-4 w-4" />
                                                    </Button>
                                                )}
                                                {step.key === 'drying' && dryingInfo && !dryingInfo.isComplete && (
                                                    <Button
                                                        variant="secondary"
                                                        size="sm"
                                                        className="h-8 w-8 p-0"
                                                        onClick={addDryingReminder}
                                                        title="Ajouter au calendrier"
                                                    >
                                                        <CalendarPlus className="h-4 w-4" />
                                                    </Button>
                                                )}
                                                {step.key === 'aging' && (
                                                    <Button
                                                        variant="secondary"
                                                        size="sm"
                                                        className="h-8 w-8 p-0"
                                                        onClick={addAgingReminders}
                                                        title="Ajouter 5 rappels hebdomadaires"
                                                    >
                                                        <CalendarPlus className="h-4 w-4" />
                                                    </Button>
                                                )}
                                                <Button
                                                    size="sm"
                                                    onClick={() => {
                                                        const nextStep = processSteps[index + 1];
                                                        if (nextStep) handleStepChange(nextStep.key);
                                                    }}
                                                    disabled={isUpdating}
                                                    className="h-8 w-8 p-0 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
                                                >
                                                    <Check className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="w-8 shrink-0" />
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </DialogContent>
        </Dialog>
    );
}
