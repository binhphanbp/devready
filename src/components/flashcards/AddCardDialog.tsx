"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface AddCardDialogProps {
  deckId: string;
  trigger?: React.ReactNode;
}

export function AddCardDialog({ deckId, trigger }: AddCardDialogProps) {
  const [open, setOpen] = useState(false);
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!front.trim() || !back.trim()) return;

    setLoading(true);
    const supabase = createClient();

    const { error } = await supabase.from("flashcards").insert({
      deck_id: deckId,
      front: front.trim(),
      back: back.trim(),
    });

    if (!error) {
      setFront("");
      setBack("");
      setOpen(false);
      router.refresh();
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          trigger ? <span /> : <Button size="sm" variant="outline" />
        }
      >
        {trigger || (
          <>
            <Plus className="mr-1 h-4 w-4" />
            Thêm thẻ
          </>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Thêm thẻ Flashcard</DialogTitle>
          <DialogDescription>
            Nhập câu hỏi (mặt trước) và câu trả lời (mặt sau).
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleAdd} className="space-y-4 mt-2">
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="card-front">
              Mặt trước (Câu hỏi)
            </label>
            <Textarea
              id="card-front"
              placeholder="VD: Giải thích sự khác nhau giữa let và const?"
              value={front}
              onChange={(e) => setFront(e.target.value)}
              rows={3}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="card-back">
              Mặt sau (Câu trả lời)
            </label>
            <Textarea
              id="card-back"
              placeholder="VD: `let` cho phép reassign, `const` không..."
              value={back}
              onChange={(e) => setBack(e.target.value)}
              rows={4}
              required
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={loading || !front.trim() || !back.trim()}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Thêm thẻ
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
