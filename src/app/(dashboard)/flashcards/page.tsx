'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Brain,
  Plus,
  Sparkles,
  PlayCircle,
  Layers,
  ArrowLeft,
  Trash2,
  MoreVertical,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { CreateDeckDialog } from '@/components/flashcards/CreateDeckDialog';
import { AddCardDialog } from '@/components/flashcards/AddCardDialog';
import { StudyMode } from '@/components/flashcards/StudyMode';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

type Deck = {
  id: string;
  title: string;
  description: string | null;
  card_count: number;
  created_at: string;
};

type FlashcardData = {
  id: string;
  front: string;
  back: string;
  difficulty: number;
  interval: number;
  repetitions: number;
  next_review: string;
};

type ViewMode = 'list' | 'detail' | 'study';

export default function FlashcardsPage() {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [selectedDeck, setSelectedDeck] = useState<Deck | null>(null);
  const [cards, setCards] = useState<FlashcardData[]>([]);
  const [dueCards, setDueCards] = useState<FlashcardData[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  // Fetch decks
  useEffect(() => {
    const fetchDecks = async () => {
      const supabase = createClient();
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('flashcard_decks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      setDecks(data ?? []);
      setLoading(false);
    };
    fetchDecks();
  }, []);

  // Fetch cards when a deck is selected
  const openDeck = async (deck: Deck) => {
    setSelectedDeck(deck);
    setViewMode('detail');

    const supabase = createClient();

    const { data } = await supabase
      .from('flashcards')
      .select('*')
      .eq('deck_id', deck.id)
      .order('created_at', { ascending: true });

    const allCards = (data ?? []) as FlashcardData[];
    setCards(allCards);

    // Filter due cards
    const now = new Date().toISOString();
    setDueCards(allCards.filter((c) => c.next_review <= now));
  };

  const startStudy = () => {
    if (dueCards.length > 0) {
      setViewMode('study');
    }
  };

  const handleDeleteDeck = async (deckId: string) => {
    if (!confirm('Xóa bộ flashcard này? Tất cả thẻ sẽ bị xóa.')) return;
    const supabase = createClient();
    await supabase.from('flashcard_decks').delete().eq('id', deckId);
    setDecks(decks.filter((d) => d.id !== deckId));
    if (selectedDeck?.id === deckId) {
      setSelectedDeck(null);
      setViewMode('list');
    }
  };

  const handleDeleteCard = async (cardId: string) => {
    const supabase = createClient();
    await supabase.from('flashcards').delete().eq('id', cardId);
    setCards(cards.filter((c) => c.id !== cardId));
    setDueCards(dueCards.filter((c) => c.id !== cardId));
  };

  // ============ LIST VIEW ============
  if (viewMode === 'list') {
    return (
      <div className="space-y-6 pt-8 lg:pt-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              <span className="text-gradient">Flashcards</span>
            </h1>
            <p className="mt-1 text-muted-foreground">
              Ôn tập với hệ thống Spaced Repetition thông minh.
            </p>
          </div>
          <CreateDeckDialog />
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-24 rounded-2xl border border-border/50 bg-card/50 animate-pulse"
              />
            ))}
          </div>
        ) : decks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-500/10 mb-4">
              <Brain className="h-8 w-8 text-purple-400" />
            </div>
            <h2 className="text-lg font-semibold">Chưa có bộ flashcard nào</h2>
            <p className="mt-2 text-sm text-muted-foreground max-w-sm">
              Tạo bộ flashcard đầu tiên để bắt đầu ôn tập với hệ thống Spaced
              Repetition. Giúp ghi nhớ lâu dài hơn gấp 3 lần.
            </p>
          </div>
        ) : (
          <div className="grid gap-3">
            {decks.map((deck) => (
              <Card
                key={deck.id}
                className="group cursor-pointer border-border/50 bg-card/50 transition-all hover:border-primary/30 hover:shadow-md hover:shadow-primary/5"
                onClick={() => openDeck(deck)}
              >
                <CardContent className="p-5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-500/10 shrink-0">
                      <Layers className="h-5 w-5 text-purple-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold group-hover:text-primary transition-colors">
                        {deck.title}
                      </h3>
                      {deck.description && (
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                          {deck.description}
                        </p>
                      )}
                      <div className="flex items-center gap-3 mt-1.5">
                        <Badge variant="secondary" className="text-xs">
                          {deck.card_count} thẻ
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(deck.created_at).toLocaleDateString(
                            'vi-VN',
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteDeck(deck.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ============ STUDY MODE ============
  if (viewMode === 'study' && selectedDeck) {
    return (
      <div className="space-y-6 pt-8 lg:pt-0 max-w-2xl mx-auto">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setViewMode('detail');
            openDeck(selectedDeck);
          }}
          className="gap-1"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại
        </Button>
        <StudyMode
          cards={dueCards}
          deckTitle={selectedDeck.title}
          onComplete={() => {
            setViewMode('detail');
            openDeck(selectedDeck);
          }}
        />
      </div>
    );
  }

  // ============ DETAIL VIEW ============
  if (viewMode === 'detail' && selectedDeck) {
    return (
      <div className="space-y-6 pt-8 lg:pt-0">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => setViewMode('list')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold tracking-tight">
              {selectedDeck.title}
            </h1>
            {selectedDeck.description && (
              <p className="text-sm text-muted-foreground mt-0.5">
                {selectedDeck.description}
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3">
          <Button
            size="sm"
            className="glow-blue bg-gradient-to-r from-[#0066FF] to-[#0055DD] text-white border-0"
            disabled={dueCards.length === 0}
            onClick={startStudy}
          >
            <PlayCircle className="mr-1 h-4 w-4" />
            Ôn tập ({dueCards.length} thẻ đến hạn)
          </Button>
          <AddCardDialog deckId={selectedDeck.id} />
        </div>

        {/* Cards list */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">
            Tất cả thẻ ({cards.length})
          </h3>
          {cards.length === 0 ? (
            <Card className="border-border/50 bg-card/50">
              <CardContent className="p-8 text-center">
                <Sparkles className="h-8 w-8 text-muted-foreground/40 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">
                  Chưa có thẻ nào. Thêm thẻ đầu tiên!
                </p>
              </CardContent>
            </Card>
          ) : (
            cards.map((card, idx) => (
              <Card
                key={card.id}
                className="border-border/50 bg-card/50 hover:border-border transition-colors"
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-muted-foreground font-mono">
                          #{idx + 1}
                        </span>
                        {new Date(card.next_review) <= new Date() && (
                          <Badge
                            variant="outline"
                            className="text-[10px] bg-orange-500/10 text-orange-400 border-orange-500/20"
                          >
                            Đến hạn
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm font-medium line-clamp-2">
                        {card.front}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                        → {card.back}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="shrink-0 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDeleteCard(card.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    );
  }

  return null;
}
