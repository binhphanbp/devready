import Link from "next/link";
import { Code2, Github, Heart } from "lucide-react";

const footerLinks = {
  "Sản phẩm": [
    { href: "/explore", label: "Câu hỏi phỏng vấn" },
    { href: "/flashcards", label: "Flashcards" },
    { href: "/community", label: "Cộng đồng" },
    { href: "/dashboard", label: "Dashboard" },
  ],
  "Chủ đề": [
    { href: "/explore?category=frontend", label: "Frontend" },
    { href: "/explore?category=backend", label: "Backend" },
    { href: "/explore?category=database", label: "Database" },
    { href: "/explore?category=devops", label: "DevOps" },
  ],
  "Hỗ trợ": [
    { href: "/about", label: "Về chúng tôi" },
    { href: "/contact", label: "Liên hệ" },
    { href: "/privacy", label: "Chính sách bảo mật" },
    { href: "/terms", label: "Điều khoản sử dụng" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-card/50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                <Code2 className="h-5 w-5 text-primary" />
              </div>
              <span className="text-xl font-bold">
                Dev<span className="text-gradient">Ready</span>
              </span>
            </Link>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              Nền tảng luyện phỏng vấn IT dành cho sinh viên và Junior
              Developer Việt Nam.
            </p>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="text-sm font-semibold text-foreground">{title}</h3>
              <ul className="mt-3 space-y-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-border/50 pt-6 sm:flex-row">
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            Được tạo với <Heart className="h-3 w-3 text-destructive fill-destructive" /> bởi DevReady Team © {new Date().getFullYear()}
          </p>
          <div className="flex gap-4">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <Github className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
