
'use client';

import React, { useState, useMemo } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Bot, Edit3, Loader2, Trash2, Sparkles, User as UserIcon } from 'lucide-react';
import { doc, serverTimestamp, deleteDoc, Timestamp } from 'firebase/firestore';

import type { Question, AiSummary as AiSummaryType } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useFirestore, useUser, useDoc, setDocumentNonBlocking } from '@/firebase';
import { summarizeQA } from '@/ai/flows/summarize-qa';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";


interface QuestionItemProps {
  question: Question;
}

export default function QuestionItem({ question }: QuestionItemProps) {
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const summaryDocRef = useMemo(() => {
    if (!firestore || !question.id) return null;
    return doc(firestore, 'questions', question.id, 'aiSummary', 'latest');
  }, [firestore, question.id]);

  const { data: summary, isLoading: isSummaryLoading, error: summaryError } = useDoc<AiSummaryType>(summaryDocRef);

  const handleGenerateSummary = async () => {
    setIsSummarizing(true);
    try {
      const result = await summarizeQA({ qaContent: question.content });
      if (result.summary && summaryDocRef) {
        const newSummary: AiSummaryType = {
          id: 'latest',
          questionId: question.id,
          summaryText: result.summary,
          generationTimestamp: serverTimestamp() as Timestamp,
        };
        setDocumentNonBlocking(summaryDocRef, newSummary, { merge: true });
        toast({ title: 'Summary Generated!', description: 'AI summary has been created for this question.' });
      } else {
        throw new Error('AI did not return a summary.');
      }
    } catch (error) {
      console.error('Error generating summary: ', error);
      toast({ title: 'Summary Generation Failed', description: (error as Error).message, variant: 'destructive' });
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleDeleteQuestion = async () => {
    if (!user || user.uid !== question.userId) {
      toast({ title: 'Unauthorized', description: 'You can only delete your own questions.', variant: 'destructive' });
      return;
    }
    setIsDeleting(true);
    try {
      const questionRef = doc(firestore, 'questions', question.id);
      await deleteDoc(questionRef);
      toast({ title: 'Question Deleted', description: 'The question has been removed.' });
      // The list will update automatically due to useCollection listener
    } catch (error) {
      console.error('Error deleting question:', error);
      toast({ title: 'Deletion Failed', description: (error as Error).message, variant: 'destructive' });
    } finally {
      setIsDeleting(false);
    }
  };
  
  const canModify = user && user.uid === question.userId;

  const formattedGenerationTimestamp = useMemo(() => {
    if (summary?.generationTimestamp && typeof summary.generationTimestamp.toDate === 'function') {
      return formatDistanceToNow(summary.generationTimestamp.toDate(), { addSuffix: true });
    }
    return 'a moment ago'; // Fallback if timestamp is not yet a valid Date object
  }, [summary?.generationTimestamp]);

  const formattedQuestionTimestamp = useMemo(() => {
    if (question.timestamp && typeof question.timestamp.toDate === 'function') {
      return formatDistanceToNow(question.timestamp.toDate(), { addSuffix: true });
    }
    return 'Just now';
  }, [question.timestamp]);

  return (
    <Card className="mb-6 shadow-md transition-all duration-300 ease-in-out hover:shadow-lg animate-in fade-in-0 slide-in-from-bottom-5">
      <CardHeader className="flex flex-row items-start space-x-4 pb-3">
        <Avatar className="h-10 w-10 border">
          <AvatarImage src={question.userImage || undefined} alt={question.userName} />
          <AvatarFallback>
            {question.userName ? question.userName.charAt(0).toUpperCase() : <UserIcon />}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <CardTitle className="text-lg font-medium">{question.userName}</CardTitle>
          <p className="text-xs text-muted-foreground">
            {formattedQuestionTimestamp}
          </p>
        </div>
        {canModify && (
           <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" disabled={isDeleting}>
                {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                <span className="sr-only">Delete question</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete this question.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteQuestion} className="bg-destructive hover:bg-destructive/90">
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </CardHeader>
      <CardContent>
        <p className="text-foreground/90 whitespace-pre-wrap">{question.content}</p>
      </CardContent>
      <CardFooter className="flex flex-col items-start space-y-4 pt-4 border-t">
        {isSummaryLoading && (
          <div className="flex items-center text-sm text-muted-foreground">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            <span>Loading summary...</span>
          </div>
        )}
        {summaryError && (
          <Alert variant="destructive" className="w-full">
            <AlertTitle>Error loading summary</AlertTitle>
            <AlertDescription>{summaryError.message}</AlertDescription>
          </Alert>
        )}
        {!isSummaryLoading && summary && (
          <Alert variant="default" className="w-full bg-primary/5 border-primary/20">
            <Sparkles className="h-5 w-5 text-primary" />
            <AlertTitle className="font-semibold text-primary">AI Summary</AlertTitle>
            <AlertDescription className="text-foreground/80">{summary.summaryText}</AlertDescription>
            <p className="text-xs text-muted-foreground mt-2">
              Generated: {formattedGenerationTimestamp}
            </p>
          </Alert>
        )}
        {!isSummaryLoading && !summary && user && (
          <Button
            onClick={handleGenerateSummary}
            variant="outline"
            size="sm"
            className="text-primary border-primary hover:bg-primary/10 hover:text-primary"
            disabled={isSummarizing}
          >
            {isSummarizing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Bot className="mr-2 h-4 w-4" />
            )}
            {isSummarizing ? 'Generating...' : 'Generate AI Summary'}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
