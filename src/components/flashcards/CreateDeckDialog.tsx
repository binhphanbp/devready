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

export function CreateDeckDialog() {
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

    const { error } = await supabase.from("flashcard_decks").insert({
      user_id: user.id,
      title: title.trim(),
      description: description.trim() || null,
    });

    if (!error) {
      setTitle("");
      setDescription("");
      setOpen(false);
      router.refresh();
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button size="sm" className="glow-blue bg-gradient-to-r from-[#0066FF] to-[#0055DD] text-white border-0" />
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
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="deck-title">
              Tên bộ flashcard
            </label>
            <Input
              id="deck-title"
              placeholder="VD: JavaScript Fundamentals"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="deck-desc">
              Mô tả (tùy chọn)
            </label>
            <Textarea
              id="deck-desc"
              placeholder="Mô tả ngắn về nội dung bộ flashcard..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
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
