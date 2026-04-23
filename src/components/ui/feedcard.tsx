"use client";

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Tag, FileText } from "lucide-react"; // Pokud používáš lucide-react ikony
import Link from "next/link";
interface FeedItem {
  id: string;
  type: "ARTICLE" | "EVENT" | "AD";
  title: string;
  subtitle?: string;
  content?: string;
  cover_image?: string;
  date?: string;
  price?: number;
}

export default function FeedCard(item: FeedItem) {
  // Definice barev a ikon podle typu příspěvku
  const config = {
    ARTICLE: {
      label: "Článek",
      color: "border-t-blue-500",
      badge: "bg-blue-100 text-blue-700",
      icon: <FileText className="w-4 h-4" />,
    },
    EVENT: {
      label: "Akce",
      color: "border-t-emerald-500",
      badge: "bg-emerald-100 text-emerald-700",
      icon: <Calendar className="w-4 h-4" />,
    },
    AD: {
      label: "Inzerát",
      color: "border-t-amber-500",
      badge: "bg-amber-100 text-amber-700",
      icon: <Tag className="w-4 h-4" />,
    },
  };

  const { label, color, badge, icon } = config[item.type] || config.ARTICLE;

  return (
    <Link href={`/feed/${item.id}`} className="block">
    <Card className={`overflow-hidden hover:shadow-md transition-shadow duration-300 border-t-4 ${color}`}>
      {/* Obrázek - h-auto zajistí Masonry efekt */}
      {item.cover_image && (
        /* Změny zde: 
           1. Přidána pevná výška (h-48 na mobilu, h-60 od sm výš). Uprav si podle vkusu (např. h-52, h-64).
           2. Přidán relativní positioning pro případné overlay prvky.
        */
        <div className="w-full h-48 sm:h-60 overflow-hidden relative group">
          <img
            src={item.cover_image}
            alt={item.title}
            /* Klíčové vlastnosti pro crop:
               - h-full: Vyplní celou výšku kontejneru (h-48/h-60).
               - object-cover: Ořízne obrázek tak, aby vyplnil prostor bez deformace.
               - object-center: Vycentruje ořez (střed obrázku bude vidět).
            */
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          />
          {/* Volitelné: Jemný overlay při hoveru pro lepší čitelnost textu, pokud bys ho dávala přes obrázek */}
          <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors duration-300" />
        </div>
      )}

      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-start mb-2">
          <Badge variant="secondary" className={`${badge} border-none flex gap-1 items-center px-2 py-0.5 text-[10px] uppercase tracking-wider font-bold`}>
            {icon}
            {label}
          </Badge>
          {item.price !== undefined && (
            <span className="font-bold text-amber-600 text-sm">{item.price} Kč</span>
          )}
        </div>
        <CardTitle className="text-lg font-bold leading-tight text-slate-900">
          {item.title}
        </CardTitle>
        {item.subtitle && (
          <p className="text-sm text-slate-500 font-medium line-clamp-2">
            {item.subtitle}
          </p>
        )}
      </CardHeader>

      <CardContent className="p-4 pt-0">
        <p className="text-sm text-slate-600 line-clamp-3">
          {item.content}
        </p>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex justify-between items-center text-[11px] text-slate-400">
        <span>{item.date ? new Date(item.date).toLocaleDateString('cs-CZ') : 'Dnes'}</span>
        <button className="text-blue-600 font-semibold hover:underline">
          Číst více
        </button>
      </CardFooter>
    </Card>
    </Link>
  );
}