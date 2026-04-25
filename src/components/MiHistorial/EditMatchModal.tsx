import { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { DatePicker } from './DatePicker';
import type { MatchResult } from '@/services/apifootball';

interface EditMatchModalProps {
  match: MatchResult;
  initialNote?: string | null;
  onSave: (updatedData: Partial<MatchResult>, note: string | null) => Promise<void>;
  onClose: () => void;
}

export const EditMatchModal = ({ match, initialNote, onSave, onClose }: EditMatchModalProps) => {
  const [date, setDate] = useState(match.date.slice(0, 10));
  const [rival, setRival] = useState(match.homeTeam.id === 451 ? match.awayTeam.name : match.homeTeam.name);
  const [competition, setCompetition] = useState(match.competition || '');
  const [note, setNote] = useState(initialNote ?? '');
  const [goalsBoca, setGoalsBoca] = useState<string>(
    (match.homeTeam.id === 451 ? match.goalsHome : match.goalsAway)?.toString() || '0'
  );
  const [goalsRival, setGoalsRival] = useState<string>(
    (match.homeTeam.id === 451 ? match.goalsAway : match.goalsHome)?.toString() || '0'
  );
  const [loading, setLoading] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const isBocaHome = match.homeTeam.id === 451;
    
    await onSave({
      date,
      competition,
      homeTeam: { 
        ...match.homeTeam, 
        name: isBocaHome ? match.homeTeam.name : rival 
      },
      awayTeam: { 
        ...match.awayTeam, 
        name: isBocaHome ? rival : match.awayTeam.name 
      },
      goalsHome: isBocaHome ? parseInt(goalsBoca) : parseInt(goalsRival),
      goalsAway: isBocaHome ? parseInt(goalsRival) : parseInt(goalsBoca),
    }, note.trim() || null);
    
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-overlay flex items-center justify-center px-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-md bg-boca-blue-light border border-boca-border rounded-sm shadow-2xl animate-fade-in">
        <div className="flex items-center justify-between px-6 py-4 border-b border-boca-border/60">
          <h2 className="type-card-title text-boca-gold text-lg">Editar datos del partido</h2>
          <button onClick={onClose} className="text-text-muted hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-5 text-left">
          <DatePicker 
            label="Fecha"
            value={date}
            onChange={setDate}
          />

          <Input 
            label="Rival"
            value={rival}
            onChange={e => setRival(e.target.value)}
            required
          />

          <Input 
            label="Competencia"
            value={competition}
            onChange={e => setCompetition(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Goles Boca"
              type="number"
              min="0"
              value={goalsBoca}
              onChange={e => setGoalsBoca(e.target.value)}
            />
            <Input 
              label="Goles Rival"
              type="number"
              min="0"
              value={goalsRival}
              onChange={e => setGoalsRival(e.target.value)}
            />
          </div>

          <div>
            <label className="block type-caption text-text-muted mb-1.5 tracking-wider pl-1">Nota personal</label>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value.slice(0, 200))}
              rows={3}
              className="w-full bg-black/20 border border-boca-border rounded-sm px-3 py-2 text-white outline-none focus:border-boca-gold/50 transition-colors resize-none type-body"
              placeholder="¿Algún recuerdo de este partido?"
            />
          </div>

          <div className="pt-4 flex justify-end gap-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose} 
              className="px-6 font-medium"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              variant="primary" 
              disabled={loading} 
              className="px-8 justify-center py-2.5 font-bold"
            >
              {loading ? 'Guardando...' : 'Guardar cambios'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
