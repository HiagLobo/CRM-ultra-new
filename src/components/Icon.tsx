import * as React from "react";
import {
  AlarmClock, AlertTriangle, ArrowLeft, ArrowRight, ArrowUpDown, ArrowUpRight,
  ArrowDownRight, BadgeCheck, Banknote, BarChart3, Bath, BedDouble, Bell,
  BellRing, Bookmark, BookmarkCheck, Briefcase, Building, Building2, Calculator,
  Calendar, CalendarOff, Check, CheckCircle2, ChevronDown, ChevronLeft,
  ChevronRight, ChevronUp, ChevronsLeft, ChevronsRight, ClipboardCheck, Clock,
  Download, Eye, EyeOff, FileCheck, FileCheck2, FileText, Flag, Gem, GitCompare,
  Globe, GraduationCap, Hammer, HandCoins, Handshake, Heart, HeartOff,
  HelpCircle, Home, Image, Inbox, Infinity as InfinityIcon, KanbanSquare,
  KeyRound, Landmark, Layers, LayoutDashboard, LayoutGrid, List, ListChecks,
  Loader, Lock, LogIn, LogOut, Mail, MapPin, Megaphone, Menu, MessageCircle,
  Minus, MoreHorizontal, Navigation, Newspaper, Paperclip, PenLine, PenTool,
  Percent, Phone, Plus, Repeat, Rocket, Rows3, Ruler, Scale, Search, SearchX,
  Send, Settings, Shield, ShieldCheck, SlidersHorizontal, Smartphone, Sparkles, Star, Tag,
  Target, TrendingDown, TrendingUp, UploadCloud, User, UserPlus, UserRound,
  UserX, Users, Wallet, X, Zap,
  type LucideIcon,
} from "lucide-react";

/**
 * Drop-in replacement for the prototype's `Ic`/`AIc`/`DIc`/`RIc`/`SbIc`/`BIc`/`MIc`
 * helpers. Same API: <Icon n="shield-check" s={20} c="#fff" sw={1.75} style={...} />.
 * Renders a real <svg> (Lucide), so existing DOM queries (querySelector('svg'))
 * keep working. Names map 1:1 with the original `data-lucide` kebab-case names.
 */
const MAP: Record<string, LucideIcon> = {
  "alarm-clock": AlarmClock,
  "alert-triangle": AlertTriangle,
  "arrow-left": ArrowLeft,
  "arrow-right": ArrowRight,
  "arrow-up-down": ArrowUpDown,
  "arrow-up-right": ArrowUpRight,
  "arrow-down-right": ArrowDownRight,
  "badge-check": BadgeCheck,
  banknote: Banknote,
  "bar-chart-3": BarChart3,
  bath: Bath,
  "bed-double": BedDouble,
  bell: Bell,
  "bell-ring": BellRing,
  bookmark: Bookmark,
  "bookmark-check": BookmarkCheck,
  briefcase: Briefcase,
  building: Building,
  "building-2": Building2,
  calculator: Calculator,
  calendar: Calendar,
  "calendar-off": CalendarOff,
  check: Check,
  "check-circle-2": CheckCircle2,
  "chevron-down": ChevronDown,
  "chevron-left": ChevronLeft,
  "chevron-right": ChevronRight,
  "chevron-up": ChevronUp,
  "chevrons-left": ChevronsLeft,
  "chevrons-right": ChevronsRight,
  "clipboard-check": ClipboardCheck,
  clock: Clock,
  download: Download,
  eye: Eye,
  "eye-off": EyeOff,
  "file-check": FileCheck,
  "file-check-2": FileCheck2,
  "file-text": FileText,
  flag: Flag,
  gem: Gem,
  "git-compare": GitCompare,
  globe: Globe,
  "graduation-cap": GraduationCap,
  hammer: Hammer,
  "hand-coins": HandCoins,
  handshake: Handshake,
  heart: Heart,
  "heart-off": HeartOff,
  "help-circle": HelpCircle,
  home: Home,
  image: Image,
  inbox: Inbox,
  infinity: InfinityIcon,
  "kanban-square": KanbanSquare,
  "key-round": KeyRound,
  landmark: Landmark,
  layers: Layers,
  "layout-dashboard": LayoutDashboard,
  "layout-grid": LayoutGrid,
  list: List,
  "list-checks": ListChecks,
  loader: Loader,
  lock: Lock,
  "log-in": LogIn,
  "log-out": LogOut,
  mail: Mail,
  "map-pin": MapPin,
  megaphone: Megaphone,
  menu: Menu,
  "message-circle": MessageCircle,
  minus: Minus,
  "more-horizontal": MoreHorizontal,
  navigation: Navigation,
  newspaper: Newspaper,
  paperclip: Paperclip,
  "pen-line": PenLine,
  "pen-tool": PenTool,
  percent: Percent,
  phone: Phone,
  plus: Plus,
  repeat: Repeat,
  rocket: Rocket,
  "rows-3": Rows3,
  ruler: Ruler,
  scale: Scale,
  search: Search,
  "search-x": SearchX,
  send: Send,
  settings: Settings,
  shield: Shield,
  "shield-check": ShieldCheck,
  "sliders-horizontal": SlidersHorizontal,
  smartphone: Smartphone,
  sparkles: Sparkles,
  star: Star,
  tag: Tag,
  target: Target,
  "trending-down": TrendingDown,
  "trending-up": TrendingUp,
  "upload-cloud": UploadCloud,
  user: User,
  "user-plus": UserPlus,
  "user-round": UserRound,
  "user-x": UserX,
  users: Users,
  wallet: Wallet,
  x: X,
  zap: Zap,
};

export interface IconProps {
  n: string;
  s?: number;
  c?: string;
  sw?: number;
  style?: React.CSSProperties;
  className?: string;
}

export function Icon({ n, s = 20, c = "currentColor", sw = 1.75, style, className }: IconProps) {
  const Cmp = MAP[n] || HelpCircle;
  return (
    <Cmp
      size={s}
      color={c}
      strokeWidth={sw}
      className={className}
      style={{ flexShrink: 0, ...style }}
    />
  );
}

export default Icon;

/* Faithful aliases so ported code reads exactly like the prototype. */
export const Ic = Icon;
export const AIc = Icon;
export const DIc = Icon;
export const RIc = Icon;
export const SbIc = Icon;
export const BIc = Icon;
export const MIc = Icon;
