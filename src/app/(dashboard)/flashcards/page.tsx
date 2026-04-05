'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Brain,
  Sparkles,
  PlayCircle,
  Layers,
  ArrowLeft,
  Trash2,
  Plus,
  Edit2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { CreateDeckDialog } from '@/components/flashcards/CreateDeckDialog';
import { AddCardDialog } from '@/components/flashcards/AddCardDialog';
import { EditDeckDialog } from '@/components/flashcards/EditDeckDialog';
import { StudyMode } from '@/components/flashcards/StudyMode';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';


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
  question_id?: string | null;
};

type ViewMode = 'list' | 'detail' | 'study';

export default function FlashcardsPage() {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [selectedDeck, setSelectedDeck] = useState<Deck | null>(null);
  const [cards, setCards] = useState<FlashcardData[]>([]);
  const [dueCards, setDueCards] = useState<FlashcardData[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [loading, setLoading] = useState(true);

  const [deckToDelete, setDeckToDelete] = useState<Deck | null>(null);
  const [cardToDelete, setCardToDelete] = useState<FlashcardData | null>(null);

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

  const executeDeleteDeck = async () => {
    if (!deckToDelete) return;
    const supabase = createClient();
    await supabase.from('flashcard_decks').delete().eq('id', deckToDelete.id);
    setDecks(decks.filter((d) => d.id !== deckToDelete.id));
    if (selectedDeck?.id === deckToDelete.id) {
      setSelectedDeck(null);
      setViewMode('list');
    }
    setDeckToDelete(null);
    toast.success('Đã xóa bộ flashcard thành công');
  };

  const executeDeleteCard = async () => {
    if (!cardToDelete) return;
    const supabase = createClient();
    await supabase.from('flashcards').delete().eq('id', cardToDelete.id);
    
    // Decrement card_count in DB
    if (selectedDeck) {
      const { data: deckData } = await supabase.from('flashcard_decks').select('card_count').eq('id', selectedDeck.id).single();
      if (deckData) {
        await supabase.from('flashcard_decks').update({ card_count: Math.max(0, (deckData.card_count || 0) - 1) }).eq('id', selectedDeck.id);
      }
    }

    setCards(cards.filter((c) => c.id !== cardToDelete.id));
    setDueCards(dueCards.filter((c) => c.id !== cardToDelete.id));
    
    // Update local state
    if (selectedDeck) {
      const newCardCount = Math.max(0, (selectedDeck.card_count || 0) - 1);
      setSelectedDeck({ ...selectedDeck, card_count: newCardCount });
      setDecks(decks.map(d => d.id === selectedDeck.id ? { ...d, card_count: newCardCount } : d));
    }

    setCardToDelete(null);
    toast.success('Đã xóa thẻ thành công');
  };

  // ============ LIST VIEW ============
  if (viewMode === 'list') {
    return (
      <div className="space-y-4 sm:space-y-6 pt-6 sm:pt-8 lg:pt-0">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
              <span className="text-gradient mb-1">Flashcards</span>
            </h1>
            <p className="mt-1.5 text-sm md:text-base text-muted-foreground w-full max-w-lg">
              Ôn tập với hệ thống Spaced Repetition thông minh. Ghi nhớ lâu dài hơn gấp 3 lần.
            </p>
          </div>
          <CreateDeckDialog onCreated={(newDeck) => setDecks([newDeck, ...decks])} />
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-28 rounded-2xl border border-border/50 bg-card/50 animate-pulse"
              />
            ))}
          </div>
        ) : decks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-purple-500/10 mb-6 shadow-inner ring-1 ring-inset ring-purple-500/20">
              <Brain className="h-10 w-10 text-purple-500" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight">Chưa có bộ flashcard nào</h2>
            <p className="mt-3 text-base text-muted-foreground max-w-md">
              Tạo bộ flashcard đầu tiên để bắt đầu hành trình ghi nhớ kiến thức mới theo cách khoa học nhất.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {decks.map((deck) => (
              <Card
                key={deck.id}
                className="group relative cursor-pointer border-border/40 bg-card/40 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10 hover:border-primary/40 active:scale-[0.98] rounded-[24px] overflow-hidden flex flex-col h-full"
                onClick={() => openDeck(deck)}
              >
                {/* Decorative blob gradient */}
                <div className="absolute -inset-x-0 -top-20 h-32 bg-gradient-to-b from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                
                <CardContent className="p-5 sm:p-6 flex flex-col h-full relative z-10 transition-all duration-300">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="text-lg font-bold tracking-tight group-hover:text-primary transition-colors line-clamp-2 pr-2">
                      {deck.title}
                    </h3>
                    <div className="flex items-center gap-1 shrink-0 -mt-1 -mr-2">
                       <div onClick={(e) => e.stopPropagation()}>
                         <EditDeckDialog 
                          deck={deck} 
                          onUpdated={(updatedDeck) => {
                            setDecks(decks.map(d => d.id === updatedDeck.id ? updatedDeck : d));
                            if (selectedDeck?.id === deck.id) setSelectedDeck(updatedDeck);
                          }}
                          trigger={
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 rounded-full text-muted-foreground hover:bg-primary/10 hover:text-primary opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all duration-200"
                            >
                              <Edit2 className="h-4 w-4" /> 
                            </Button>
                          }
                        />
                       </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all duration-200"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeckToDelete(deck);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex-1 flex flex-col min-w-0">
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">
                      {deck.description || <span className="italic opacity-50">Không có mô tả</span>}
                    </p>
                    
                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/40">
                      <Badge variant="secondary" className="text-xs font-semibold bg-primary/10 text-primary border-primary/20 px-2 py-0.5 rounded-md">
                        <Layers className="h-3.5 w-3.5 mr-1.5 opacity-80" />
                        {deck.card_count} thẻ
                      </Badge>
                      <span className="text-[11px] text-muted-foreground font-medium flex items-center">
                        <span className="w-1.5 h-1.5 rounded-full bg-border mr-1.5" />
                        {new Date(deck.created_at).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={!!deckToDelete} onOpenChange={(open) => !open && setDeckToDelete(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Xóa bộ flashcard này?</DialogTitle>
              <DialogDescription>
                Bạn có chắc chắn muốn xóa bộ &quot;{deckToDelete?.title}&quot;? Tất cả thẻ bên trong sẽ bị xóa và không thể khôi phục.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 sm:gap-0 mt-4">
              <Button variant="ghost" onClick={() => setDeckToDelete(null)}>Hủy</Button>
              <Button variant="destructive" onClick={executeDeleteDeck}>Xóa bộ thẻ</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // ============ STUDY MODE ============
  if (viewMode === 'study' && selectedDeck) {
    return (
      <div className="space-y-4 sm:space-y-6 pt-6 sm:pt-8 lg:pt-0 max-w-2xl mx-auto">
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
      <div className="space-y-6 sm:space-y-8 pt-6 sm:pt-8 lg:pt-0 max-w-5xl mx-auto pb-20">
        
        {/* === Hero Header Section === */}
        <div className="relative overflow-hidden rounded-[2rem] border border-border/50 bg-card/40 p-6 sm:p-10 backdrop-blur-xl shadow-sm">
          {/* Decorative background blobs */}
          <div className="absolute top-[-20%] right-[-10%] h-96 w-96 rounded-full bg-primary/10 blur-[80px] pointer-events-none" />
          <div className="absolute bottom-[-20%] left-[-10%] h-96 w-96 rounded-full bg-purple-500/10 blur-[80px] pointer-events-none" />
          
          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center gap-8 justify-between">
            <div className="flex items-start gap-4 sm:gap-6 flex-1">
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => setViewMode('list')}
                className="shrink-0 h-10 w-10 sm:h-12 sm:w-12 rounded-full hover:bg-background/80 shadow-sm border-border/50"
              >
                <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                  <Badge variant="outline" className="bg-background/50 backdrop-blur-md border-primary/20 text-primary uppercase tracking-wider text-[10px] sm:text-[11px] font-bold px-2 sm:px-3 py-0.5 sm:py-1">
                    <Brain className="h-3 w-3 mr-1.5" />
                    Bộ Flashcard
                  </Badge>
                  <span className="text-xs sm:text-sm text-foreground/60 font-medium flex gap-1.5 items-center">
                    <span className="w-1 h-1 rounded-full bg-border" />
                    {cards.length} thẻ
                  </span>
                </div>
                <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight mb-3 sm:mb-4 text-foreground/90 leading-tight">
                  {selectedDeck.title}
                </h1>
                {selectedDeck.description && (
                  <p className="text-sm sm:text-base text-muted-foreground w-full max-w-2xl leading-relaxed">
                    {selectedDeck.description}
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row w-full lg:w-auto gap-3 sm:gap-4 shrink-0 mt-2 lg:mt-0 pt-6 lg:pt-0 border-t border-border/40 lg:border-t-0">
               <Button
                size="lg"
                className={cn(
                  "relative overflow-hidden transition-all duration-300 font-bold shadow-lg hover:shadow-primary/25 h-12 px-6 sm:px-8",
                  dueCards.length > 0
                    ? "bg-gradient-to-r from-primary to-purple-600 text-white border-0 hover:scale-[1.02] hover:-translate-y-0.5"
                    : "bg-muted hover:bg-muted text-muted-foreground shadow-none"
                )}
                disabled={dueCards.length === 0}
                onClick={startStudy}
              >
                <PlayCircle className="mr-2 h-5 w-5" />
                Ôn tập ngay ({dueCards.length})
              </Button>
              
              <AddCardDialog 
                deckId={selectedDeck.id} 
                trigger={
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-12 px-6 sm:px-8 border-primary/20 hover:bg-primary/5 font-semibold transition-all duration-300 bg-background/50 backdrop-blur-sm"
                  >
                    <Plus className="mr-2 h-5 w-5" />
                    Thêm thẻ mới
                  </Button>
                }
                onCreated={(newCard) => {
                  setCards([...cards, newCard]);
                  setDueCards([...dueCards, newCard]);
                  
                  const newCardCount = (selectedDeck.card_count || 0) + 1;
                  setSelectedDeck({ ...selectedDeck, card_count: newCardCount });
                  setDecks(decks.map(d => d.id === selectedDeck.id ? { ...d, card_count: newCardCount } : d));
                }} 
              />
            </div>
          </div>
        </div>

        {/* Cards list */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-lg sm:text-xl font-bold tracking-tight flex items-center gap-2">
              <Layers className="h-5 w-5 text-primary opacity-80" />
              Danh sách thẻ
            </h3>
          </div>

          {cards.length === 0 ? (
            <Card className="border-dashed border-2 border-border/60 bg-transparent rounded-[2rem]">
              <CardContent className="flex flex-col items-center justify-center p-12 sm:p-20 text-center">
                <div className="h-20 w-20 rounded-3xl bg-primary/10 flex items-center justify-center mb-6 ring-1 ring-inset ring-primary/20">
                  <Sparkles className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-2xl font-bold tracking-tight mb-3">Bộ thẻ đang trống</h3>
                <p className="text-base text-muted-foreground max-w-md mx-auto leading-relaxed">
                  Bạn chưa tạo thẻ flashcard nào trong bộ này. Nhấn nút &quot;Thêm thẻ mới&quot; bên trên để bắt đầu thêm các câu hỏi trắc nghiệm hoặc kiến thức ngắn!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {cards.map((card, idx) => (
                <div
                  key={card.id}
                  className="group relative flex flex-col rounded-[24px] border border-border/50 bg-card/40 backdrop-blur-sm overflow-hidden transition-all duration-300 hover:bg-card/80 hover:shadow-xl hover:shadow-primary/5 hover:border-primary/30 hover:-translate-y-1"
                >
                  <div className="flex-1 p-5 sm:p-6 lg:p-7 flex flex-col">
                    <div className="flex items-start justify-between gap-3 mb-5">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="font-mono text-xs bg-muted/80 text-muted-foreground px-2.5">
                          #{idx + 1}
                        </Badge>
                        {new Date(card.next_review) <= new Date() && (
                          <Badge
                            variant="outline"
                            className="bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5"
                          >
                            Đến hạn ôn
                          </Badge>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-200 -mr-2 -mt-2"
                        onClick={() => setCardToDelete(card)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="flex flex-col gap-5 flex-1 justify-between">
                      {/* Front (Question) */}
                      <div>
                        <p className="text-[10px] sm:text-[11px] font-bold tracking-widest text-muted-foreground uppercase mb-2 flex items-center gap-1.5 opacity-80">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                          Mặt trước (Câu hỏi)
                        </p>
                        <p className="text-sm sm:text-base font-medium leading-relaxed text-foreground transition-colors group-hover:text-primary">
                          {card.front}
                        </p>
                      </div>
                      
                      {/* Divider with cute dot */}
                      <div className="relative h-px w-full bg-gradient-to-r from-transparent via-border to-transparent opacity-60 my-2">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-3 bg-card/80 group-hover:bg-card flex justify-center items-center transition-colors">
                           <span className="w-1 h-1 rounded-full bg-border" />
                        </div>
                      </div>
                      
                      {/* Back (Answer) */}
                      <div>
                        <p className="text-[10px] sm:text-[11px] font-bold tracking-widest text-muted-foreground uppercase mb-2 flex items-center gap-1.5 opacity-80">
                          <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                          Mặt sau (Đáp án)
                        </p>
                        <p className="text-sm text-foreground/70 leading-relaxed whitespace-pre-wrap line-clamp-3 sm:line-clamp-4 group-hover:text-foreground transition-colors">
                          {card.back}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <Dialog open={!!cardToDelete} onOpenChange={(open) => !open && setCardToDelete(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Xóa thẻ này?</DialogTitle>
              <DialogDescription>
                Bạn có chắc chắn muốn xóa thẻ này khỏi bộ flashcard? Thao tác này không thể hoàn tác.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 sm:gap-0 mt-4">
              <Button variant="ghost" onClick={() => setCardToDelete(null)}>Hủy</Button>
              <Button variant="destructive" onClick={executeDeleteCard}>Xóa thẻ</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return null;
}
