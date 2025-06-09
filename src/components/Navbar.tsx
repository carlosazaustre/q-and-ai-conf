'use client';

import Link from 'next/link';
import AuthButton from './AuthButton';
import { MessageSquareQuote } from 'lucide-react';

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <MessageSquareQuote className="h-6 w-6 text-primary" />
          <span className="font-bold sm:inline-block">
            Conf Q&amp;AI
          </span>
        </Link>
        <div className="flex flex-1 items-center justify-end space-x-2">
          <AuthButton />
        </div>
      </div>
    </header>
  );
}
