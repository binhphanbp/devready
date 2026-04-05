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

const TITLE_MAX = 60;
const DESC_MAX = 150;

export function CreateDeckDialog({ onCreated }: { onCreated?: (deck: Record<string, unknown>) => void }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data: newDeck, error } = await supabase
      .from("flashcard_decks")
      .insert({
        user_id: user.id,
        title: title.trim().slice(0, TITLE_MAX),
        description: description.trim().slice(0, DESC_MAX) || null,
      })
      .select()
      .single();

    if (!error && newDeck) {
      setTitle("");
      setDescription("");
      setOpen(false);
      onCreated?.(newDeck as Record<string, unknown>);
      router.refresh();
    }
    setLoading(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) {
          setTitle("");
          setDescription("");
        }
      }}
    >
      <DialogTrigger
        render={
          <Button
            size="sm"
            className="glow-blue bg-gradient-to-r from-[#0066FF] to-[#0055DD] text-white border-0"
          />
        }
      >
        <Plus className="mr-1 h-4 w-4" />
        Tạo bộ mới
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Tạo bộ Flashcard mới</DialogTitle>
          <DialogDescription>
            Tạo bộ flashcard để ôn tập theo hệ thống Spaced Repetition.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleCreate} className="space-y-4 mt-2">
          {/* Title */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium" htmlFor="deck-title">
                Tên bộ flashcard
              </label>
              <span
                className={`text-xs transition-colors ${
                  title.length > TITLE_MAX * 0.9
                    ? "text-amber-500"
                    : "text-muted-foreground"
                }`}
              >
                {title.length}/{TITLE_MAX}
              </span>
            </div>
            <Input
              id="deck-title"
              placeholder="VD: JavaScript Fundamentals"
              value={title}
              maxLength={TITLE_MAX}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium" htmlFor="deck-desc">
                Mô tả{" "}
                <span className="text-muted-foreground font-normal">
                  (tùy chọn)
                </span>
              </label>
              <span
                className={`text-xs transition-colors ${
                  description.length > DESC_MAX * 0.9
                    ? "text-amber-500"
                    : "text-muted-foreground"
                }`}
              >
                {description.length}/{DESC_MAX}
              </span>
            </div>
            <Textarea
              id="deck-desc"
              placeholder="Mô tả ngắn về nội dung bộ flashcard..."
              value={description}
              maxLength={DESC_MAX}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="resize-none"
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
              Tạo bộ flashcard
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
