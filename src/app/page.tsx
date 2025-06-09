'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

import { useUser } from '@/firebase';
import QuestionForm from '@/components/QuestionForm';
import QuestionList from '@/components/QuestionList';

export default function QnaPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.replace('/login');
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading session...</p>
      </div>
    );
  }

  if (!user) {
    // This will be briefly visible before redirect or if redirect fails
    return (
      <div className="flex flex-1 flex-col items-center justify-center">
        <p className="text-lg text-muted-foreground">Redirecting to login...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-4xl font-bold tracking-tight text-center mb-12 font-headline">
        Conference Q&amp;A Wall
      </h1>
      <QuestionForm />
      <QuestionList />
    </div>
  );
}
