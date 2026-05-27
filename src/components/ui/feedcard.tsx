"use client";

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Tag, FileText } from "lucide-react";
import Link from "next/link";

interface Attachment {
  id: string;
  filename: string;
  url: string;
}

interface FeedItem {
  id: string;
  type: "ARTICLE" | "EVENT" | "AD";
  title: string;
  subtitle?: string;
  text?: string; 
  date?: string;
  price?: number;
  attachments?: Attachment[]; 
}

export default function FeedCard(item: FeedItem) {
  const config = {
    ARTICLE: {
      label: "Článek",
      color: "border-t-blue-500",
      badge: "bg-blue-100 text-blue-700 hover:bg-blue-100",
      icon: <FileText className="w-3.5 h-3.5" />,
    },
    EVENT: {
      label: "Akce",
      color: "border-t-emerald-500",
      badge: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100",
      icon: <Calendar className="w-3.5 h-3.5" />,
    },
    AD: {
      label: "Inzerát",
      color: "border-t-amber-500",
      badge: "bg-amber-100 text-amber-700 hover:bg-amber-100",
      icon: <Tag className="w-3.5 h-3.5" />,
    },
  };

  const { label, color, badge, icon } = config[item.type] || config.ARTICLE;

  return (
    <Link href={`/feed/${item.id}`} className="block group">
      <Card className={`overflow-hidden bg-white hover:shadow-md transition-all duration-300 border-t-4 ${color} transform group-hover:-translate-y-0.5`}>
        
        <CardHeader className="p-4 pb-2">
          <div className="flex justify-between items-center mb-2">
            <Badge className={`${badge} border-none flex gap-1 items-center px-2 py-0.5 text-[10px] uppercase tracking-wider font-bold`}>
              {icon}
              {label}
            </Badge>
            {item.price !== undefined && item.price !== null && (
              <span className="font-bold text-amber-600 text-sm">{item.price} Kč</span>
            )}
          </div>
          
          <CardTitle className="text-lg font-bold leading-tight text-slate-900 group-hover:text-blue-600 transition-colors">
            {item.title}
          </CardTitle>
          
          {item.subtitle && (
            <p className="text-sm text-slate-500 font-medium line-clamp-2 mt-1">
              {item.subtitle}
            </p>
          )}
        </CardHeader>

        {item.text && (
          <CardContent className="p-4 pt-0 pb-3">
            <p className="text-sm text-slate-600 line-clamp-4 whitespace-pre-line">
              {item.text}
            </p>
          </CardContent>
        )}

        <CardFooter className="p-4 pt-0 flex justify-between items-center text-[11px] text-slate-400 border-t border-slate-50/50 mt-2">
          <span>{item.date ? new Date(item.date).toLocaleDateString('cs-CZ') : 'Dnes'}</span>
          <span className="text-blue-600 font-semibold group-hover:underline">
            Číst více →
          </span>
        </CardFooter>
      </Card>
    </Link>
  );
}