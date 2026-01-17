"use client";

import { motion } from "framer-motion";
import { Home, BookOpen, ExternalLink } from "lucide-react";
import Link from "next/link";
import ConnectionStatus from "./ConnectionStatus";

export default function Header() {
  const navItems = [
    { label: "Home", href: "/", icon: Home, external: false },
    { label: "Docs", href: "https://docs.0g.ai/", icon: BookOpen, external: true },
  ];

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="absolute top-0 left-0 right-0 z-50 backdrop-blur-md bg-black/30 border-b border-[#00D9A5]/10"
    >
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer"
            >
              <img 
              src="/zerog-logo.png" 
              alt="Zerix Logo" 
              className="w-10 h-10 rounded-full object-cover ring-2 ring-[#00D9A5]/30"
            />
              <div>
                <h1 className="text-xl font-bold text-white">Zerix</h1>
                <p className="text-xs text-zinc-400">0G Network</p>
              </div>
            </motion.div>
          </Link>

          <div className="flex items-center gap-4">
            <ConnectionStatus />
            
            <nav className="flex items-center gap-2">
              {navItems.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 + idx * 0.1 }}
                  >
                    {item.external ? (
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-zinc-300 hover:text-white hover:bg-white/5 transition-all duration-200 group"
                      >
                        <Icon className="w-4 h-4 group-hover:text-[#00D9A5] transition-colors" />
                        <span>{item.label}</span>
                        <ExternalLink className="w-3 h-3 opacity-50" />
                      </a>
                    ) : (
                      <Link
                        href={item.href}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-zinc-300 hover:text-white hover:bg-white/5 transition-all duration-200 group"
                      >
                        <Icon className="w-4 h-4 group-hover:text-[#00D9A5] transition-colors" />
                        <span>{item.label}</span>
                      </Link>
                    )}
                  </motion.div>
                );
              })}
            </nav>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
