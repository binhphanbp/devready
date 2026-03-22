import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, PenLine, MessageSquare } from "lucide-react";

export default function CommunityPage() {
  return (
    <div className="space-y-6 pt-8 lg:pt-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Dev<span className="text-gradient">Community</span>
          </h1>
          <p className="mt-1 text-muted-foreground">
            Chia sẻ và đọc trải nghiệm phỏng vấn từ cộng đồng IT Việt Nam.
          </p>
        </div>
        <Button size="sm" className="glow-blue">
          <PenLine className="mr-1 h-4 w-4" />
          Viết review
        </Button>
      </div>

      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-500/10 mb-4">
          <MessageSquare className="h-8 w-8 text-orange-400" />
        </div>
        <h2 className="text-lg font-semibold">Chưa có review nào</h2>
        <p className="mt-2 text-sm text-muted-foreground max-w-sm">
          Hãy là người đầu tiên chia sẻ trải nghiệm phỏng vấn của bạn. Giúp
          cộng đồng chuẩn bị tốt hơn!
        </p>
        <Button variant="outline" className="mt-6" size="sm">
          <PenLine className="mr-1 h-4 w-4" />
          Viết review đầu tiên
        </Button>
      </div>
    </div>
  );
}
