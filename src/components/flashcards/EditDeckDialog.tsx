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
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const TITLE_MAX = 60;
const DESC_MAX = 150;

interface EditDeckDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deck: { id: string; title: string; description: string | null };
  onUpdated?: (updated: { id: string; title: string; description: string | null }) => void;
}

// Inner form — receives deck as initial values, avoids useEffect with setState
function EditDeckForm({
  deck,
  onUpdated,
  onClose,
}: {
  deck: EditDeckDialogProps["deck"];
  onUpdated: EditDeckDialogProps["onUpdated"];
  onClose: () => void;
}) {
  // Slice existing values to max length so counter and isDirty work correctly
  const initialTitle = deck.title.slice(0, TITLE_MAX);
  const initialDesc = (deck.description ?? "").slice(0, DESC_MAX);

  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDesc);
  const [loading, setLoading] = useState(false);

  const isDirty =
    title.trim() !== initialTitle.trim() ||
    description.trim() !== initialDesc.trim();

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !isDirty) return;

    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("flashcard_decks")
      .update({
        title: title.trim().slice(0, TITLE_MAX),
        description: description.trim().slice(0, DESC_MAX) || null,
      })
      .eq("id", deck.id);

    if (!error) {
      onUpdated?.({
        id: deck.id,
        title: title.trim().slice(0, TITLE_MAX),
        description: description.trim().slice(0, DESC_MAX) || null,
      });
      onClose();
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSave} className="space-y-4 mt-2">
      {/* Title */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium" htmlFor="edit-deck-title">
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
          id="edit-deck-title"
          placeholder="VD: JavaScript Fundamentals"
          value={title}
          maxLength={TITLE_MAX}
          onChange={(e) => setTitle(e.target.value)}
          required
          autoFocus
        />
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium" htmlFor="edit-deck-desc">
            Mô tả{" "}
            <span className="text-muted-foreground font-normal">(tùy chọn)</span>
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
          id="edit-deck-desc"
          placeholder="Mô tả ngắn về nội dung bộ flashcard..."
          value={description}
          maxLength={DESC_MAX}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="resize-none break-all overflow-x-hidden"
        />
      </div>

      <div className="flex justify-end gap-2 pt-1">
        <Button type="button" variant="ghost" onClick={onClose}>
          Hủy
        </Button>
        <Button
          type="submit"
          disabled={loading || !title.trim() || !isDirty}
          className="bg-gradient-to-r from-[#0066FF] to-[#0055DD] text-white border-0"
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Lưu thay đổi
        </Button>
      </div>
    </form>
  );
}

export function EditDeckDialog({
  open,
  onOpenChange,
  deck,
  onUpdated,
}: EditDeckDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa bộ Flashcard</DialogTitle>
          <DialogDescription>
            Cập nhật tên và mô tả cho bộ flashcard của bạn.
          </DialogDescription>
        </DialogHeader>
        {/* key resets the form state whenever the target deck changes */}
        <EditDeckForm
          key={deck.id}
          deck={deck}
          onUpdated={onUpdated}
          onClose={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
