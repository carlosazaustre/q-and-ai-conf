'use client';

import React, { useMemo } from 'react';
import { collection, query, orderBy } from 'firebase/firestore';
import { Loader2, AlertTriangle, Inbox } from 'lucide-react';

import { useCollection, useFirestore } from '@/firebase';
import type { Question } from '@/lib/types';
import QuestionItem from './QuestionItem';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function QuestionList() {
  const firestore = useFirestore();

  const questionsQuery = useMemo(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'questions'), orderBy('timestamp', 'desc'));
  }, [firestore]);

  const { data: questions, isLoading, error } = useCollection<Question>(questionsQuery);

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="shadow-md">
        <AlertTriangle className="h-5 w-5" />
        <AlertTitle>Error Loading Questions</AlertTitle>
        <AlertDescription>
          Could not load questions from the Q&amp;A wall. Please try refreshing the page.
          <p className="mt-2 text-xs">{error.message}</p>
        </AlertDescription>
      </Alert>
    );
  }

  if (!questions || questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center shadow-sm">
        <Inbox className="h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-xl font-semibold">No Questions Yet</h3>
        <p className="mt-1 text-sm text-muted-foreground">Be the first to ask a question!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {questions.map((question) => (
        <QuestionItem key={question.id} question={question} />
      ))}
    </div>
  );
}

function CardSkeleton() {
  return (
    <div className="flex flex-col space-y-3 rounded-lg border bg-card p-6 shadow-md">
      <div className="flex items-center space-x-4">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-[150px]" />
          <Skeleton className="h-3 w-[100px]" />
        </div>
      </div>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-[80%]" />
      <div className="flex justify-start pt-2">
        <Skeleton className="h-8 w-[180px] rounded-md" />
      </div>
    </div>
  );
}
