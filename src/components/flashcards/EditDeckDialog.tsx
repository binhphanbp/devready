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
import { Loader2, Edit2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface EditDeckDialogProps {
  deck: {
    id: string;
    title: string;
    description: string | null;
  };
  onUpdated?: (deck: any) => void;
  trigger?: React.ReactElement;
}

export function EditDeckDialog({ deck, onUpdated, trigger }: EditDeckDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(deck.title);
  const [description, setDescription] = useState(deck.description || "");
  const [loading, setLoading] = useState(false);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    const supabase = createClient();
    
    const { data: updatedDeck, error } = await supabase
      .from("flashcard_decks")
      .update({
        title: title.trim(),
        description: description.trim() || null,
      })
      .eq("id", deck.id)
      .select()
      .single();

    if (!error && updatedDeck) {
      setOpen(false);
      onUpdated?.(updatedDeck);
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          trigger || (
            <Button variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-full" />
          )
        }
      >
        {!trigger && <Edit2 className="h-4 w-4" />}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md w-full min-w-0 max-h-[90vh] overflow-y-auto overflow-x-hidden" onClick={(e) => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle>Chỉnh sửa Bộ Flashcard</DialogTitle>
          <DialogDescription>
            Thay đổi tên hoặc mô tả của bộ flashcard.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleUpdate} className="space-y-4 mt-2 w-full min-w-0">
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="edit-deck-title">
              Tên bộ flashcard
            </label>
            <Input
              id="edit-deck-title"
              placeholder="VD: JavaScript Fundamentals"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="edit-deck-desc">
              Mô tả (tùy chọn)
            </label>
            <Textarea
              id="edit-deck-desc"
              placeholder="Mô tả ngắn về nội dung bộ flashcard..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="break-all"
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
            <Button type="submit" disabled={loading || !title.trim()}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Lưu thay đổi
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
