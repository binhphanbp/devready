import Link from 'next/link';
import { Code2, Heart } from 'lucide-react';
import { TeamAvatarImg } from './TeamAvatarImg';

const footerLinks = {
  'Sản phẩm': [
    { href: '/explore', label: 'Câu hỏi phỏng vấn' },
    { href: '/flashcards', label: 'Flashcards' },
    { href: '/community', label: 'Cộng đồng' },
    { href: '/dashboard', label: 'Dashboard' },
  ],
  'Chủ đề': [
    { href: '/explore?category=frontend', label: 'Frontend' },
    { href: '/explore?category=backend', label: 'Backend' },
    { href: '/explore?category=database', label: 'Database' },
    { href: '/explore?category=devops', label: 'DevOps' },
  ],
  'Hỗ trợ': [
    { href: '/about', label: 'Về chúng tôi' },
    { href: '/contact', label: 'Liên hệ' },
    { href: '/privacy', label: 'Chính sách bảo mật' },
    { href: '/terms', label: 'Điều khoản sử dụng' },
  ],
};

const teamMembers = [
  { name: 'Phan Đức Bình', initials: 'PB', avatar: '/team/member1.jpg', link: '#' },
  { name: 'Đỗ Minh Đăng', initials: 'ĐĐ', avatar: '/team/member2.jpg', link: '#' },
  { name: 'Lê Duy', initials: 'LD', avatar: '/team/member3.jpg', link: '#' },
  { name: 'Nguyễn Văn Quốc Tỉnh', initials: 'QT', avatar: '/team/member4.jpg', link: '#' },
  { name: 'Trương Thanh Sáng', initials: 'TS', avatar: '/team/member5.jpg', link: '#' },
  { name: 'Hoàng Văn Hoàng Anh', initials: 'HA', avatar: '/team/member6.jpg', link: '#' },
];

const gradients = [
  'from-blue-500 to-cyan-500',
  'from-violet-500 to-purple-500',
  'from-emerald-500 to-teal-500',
  'from-orange-500 to-amber-500',
  'from-pink-500 to-rose-500',
  'from-indigo-500 to-blue-500',
];

function TeamAvatar({ member, index }: { member: typeof teamMembers[0]; index: number }) {
  return (
    <a
      href={member.link}
      target={member.link !== '#' ? '_blank' : undefined}
      rel="noopener noreferrer"
      className="group relative"
      title={member.name}
    >
      <div
        className="relative h-9 w-9 rounded-full ring-2 ring-background transition-all duration-300 group-hover:scale-110 group-hover:ring-primary/40 group-hover:-translate-y-1 overflow-hidden"
        style={{ marginLeft: index === 0 ? 0 : '-6px', zIndex: teamMembers.length - index }}
      >
        <TeamAvatarImg
          src={member.avatar}
          alt={member.name}
          initials={member.initials}
          gradient={gradients[index]}
        />
      </div>

      {/* Tooltip */}
      <div className="absolute -top-9 left-1/2 -translate-x-1/2 pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap z-50">
        <div className="px-2.5 py-1 rounded-md bg-foreground text-background text-[11px] font-medium shadow-lg">
          {member.name}
        </div>
        <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-[4px] border-r-[4px] border-t-[4px] border-transparent border-t-foreground" />
      </div>
    </a>
  );
}

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
              Nền tảng luyện phỏng vấn IT dành cho sinh viên và Junior Developer
              Việt Nam.
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
        <div className="mt-10 flex flex-col items-center justify-between gap-5 border-t border-border/50 pt-6 sm:flex-row">
          <div className="flex items-center gap-3">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              DevReady được tạo bởi
            </p>
            <div className="flex items-center pl-1.5">
              {teamMembers.map((member, i) => (
                <TeamAvatar key={member.name} member={member} index={i} />
              ))}
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} DevReady. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
