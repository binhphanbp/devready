'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Brain, Loader2, Plus, Check, FolderPlus } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

interface AddToFlashcardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  questionTitle: string;
  answerContent: string;
}

type Deck = {
  id: string;
  title: string;
  card_count: number;
};

export function AddToFlashcardDialog({
  open,
  onOpenChange,
  questionTitle,
  answerContent,
}: AddToFlashcardDialogProps) {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [selectedDeckId, setSelectedDeckId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingDecks, setLoadingDecks] = useState(true);
  const [showNewDeck, setShowNewDeck] = useState(false);
  const [newDeckTitle, setNewDeckTitle] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!open) return;
    // Reset form state when dialog opens — intentional synchronization
    setSuccess(false); // eslint-disable-line react-hooks/set-state-in-effect -- intentional form reset on dialog open
    setSelectedDeckId(null);
    setShowNewDeck(false);
    setNewDeckTitle('');

    const fetchDecks = async () => {
      setLoadingDecks(true);
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('flashcard_decks')
        .select('id, title, card_count')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      setDecks((data as Deck[]) ?? []);
      setLoadingDecks(false);
    };
    fetchDecks();
  }, [open]);

  const handleAdd = async () => {
    if (!selectedDeckId) return;
    setLoading(true);

    const supabase = createClient();

    // Truncate answer for flashcard back (keep first 500 chars of markdown)
    const truncatedAnswer =
      answerContent.length > 500
        ? answerContent.slice(0, 500) + '\n\n...'
        : answerContent;

    const { error } = await supabase.from('flashcards').insert({
      deck_id: selectedDeckId,
      front: questionTitle,
      back: truncatedAnswer,
    });

    if (!error) {
      // Update card count
      const deck = decks.find((d) => d.id === selectedDeckId);
      if (deck) {
        await supabase
          .from('flashcard_decks')
          .update({ card_count: (deck.card_count || 0) + 1 })
          .eq('id', selectedDeckId);
      }
      setSuccess(true);
      setTimeout(() => onOpenChange(false), 1200);
    }
    setLoading(false);
  };

  const handleCreateDeck = async () => {
    if (!newDeckTitle.trim()) return;
    setLoading(true);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('flashcard_decks')
      .insert({
        user_id: user.id,
        title: newDeckTitle.trim(),
      })
      .select('id, title, card_count')
      .single();

    if (!error && data) {
      setDecks((prev) => [data as Deck, ...prev]);
      setSelectedDeckId((data as Deck).id);
      setShowNewDeck(false);
      setNewDeckTitle('');
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-500" />
            Thêm vào Flashcard
          </DialogTitle>
          <DialogDescription>
            Chọn bộ flashcard để thêm câu hỏi này hoặc tạo bộ mới.
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="flex flex-col items-center py-8 gap-3 animate-in fade-in">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10">
              <Check className="h-7 w-7 text-emerald-500" />
            </div>
            <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
              Đã thêm vào Flashcard!
            </p>
          </div>
        ) : (
          <div className="space-y-4 mt-2">
            {/* Preview */}
            <div className="rounded-lg border border-border/50 bg-muted/30 px-4 py-3">
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1 font-medium">
                Câu hỏi sẽ thêm
              </p>
              <p className="text-sm font-medium line-clamp-2">
                {questionTitle}
              </p>
            </div>

            {/* Deck list */}
            <div>
              <p className="text-sm font-medium mb-2">Chọn bộ Flashcard</p>
              {loadingDecks ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {decks.map((deck) => (
                    <button
                      key={deck.id}
                      onClick={() => setSelectedDeckId(deck.id)}
                      className={cn(
                        'w-full flex items-center justify-between rounded-lg border px-3.5 py-2.5 text-left transition-all',
                        selectedDeckId === deck.id
                          ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                          : 'border-border/50 hover:border-primary/30 hover:bg-muted/30',
                      )}
                    >
                      <div className="flex items-center gap-2.5">
                        <Brain
                          className={cn(
                            'h-4 w-4 shrink-0',
                            selectedDeckId === deck.id
                              ? 'text-primary'
                              : 'text-muted-foreground',
                          )}
                        />
                        <div>
                          <p className="text-sm font-medium">{deck.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {deck.card_count || 0} thẻ
                          </p>
                        </div>
                      </div>
                      {selectedDeckId === deck.id && (
                        <Check className="h-4 w-4 text-primary shrink-0" />
                      )}
                    </button>
                  ))}

                  {decks.length === 0 && !showNewDeck && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Chưa có bộ flashcard nào. Tạo bộ mới bên dưới!
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Create new deck */}
            {showNewDeck ? (
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Tên bộ flashcard mới..."
                  value={newDeckTitle}
                  onChange={(e) => setNewDeckTitle(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateDeck()}
                  autoFocus
                  className="h-9"
                />
                <Button
                  size="sm"
                  onClick={handleCreateDeck}
                  disabled={!newDeckTitle.trim() || loading}
                  className="shrink-0 h-9"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Tạo'
                  )}
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowNewDeck(true)}
                className="w-full"
              >
                <FolderPlus className="h-4 w-4 mr-1.5" />
                Tạo bộ Flashcard mới
              </Button>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-2 border-t border-border/50">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onOpenChange(false)}
              >
                Hủy
              </Button>
              <Button
                size="sm"
                onClick={handleAdd}
                disabled={!selectedDeckId || loading}
                className="glow-blue bg-gradient-to-r from-[#0066FF] to-[#0055DD] text-white border-0"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                ) : (
                  <Plus className="h-4 w-4 mr-1.5" />
                )}
                Thêm vào Flashcard
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
