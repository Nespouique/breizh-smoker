import type { Item } from '@/types';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { WeightTracking } from '../tracking/WeightTracking';
import { ChartLine } from 'lucide-react';

interface WeightTrackingDialogProps {
    item: Item;
    onClose: () => void;
}

export function WeightTrackingDialog({ item, onClose }: WeightTrackingDialogProps) {
    return (
        <Dialog open onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <ChartLine className="h-5 w-5 text-orange-500" />
                        Suivi du poids - {item.name}
                    </DialogTitle>
                </DialogHeader>

                <div className="py-4">
                    <WeightTracking item={item} />
                </div>
            </DialogContent>
        </Dialog>
    );
}
