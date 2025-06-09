'use client';

import React, { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Send } from 'lucide-react';

import { useFirestore, useUser } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import type { Question as QuestionType } from '@/lib/types'; // Renamed to avoid conflict with Lucide icon

const formSchema = z.object({
  content: z.string().min(10, { message: 'Question must be at least 10 characters long.' }).max(500, { message: 'Question must be at most 500 characters long.' }),
});

type FormData = z.infer<typeof formSchema>;

export default function QuestionForm() {
  const firestore = useFirestore();
  const { user } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: '',
    },
  });

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    if (!user) {
      toast({ title: 'Authentication Error', description: 'You must be logged in to submit a question.', variant: 'destructive' });
      return;
    }
    setIsSubmitting(true);
    try {
      const questionsCollection = collection(firestore, 'questions');
      const newQuestion: Omit<QuestionType, 'id'> = {
        userId: user.uid,
        userName: user.displayName || 'Anonymous User',
        userImage: user.photoURL || null,
        content: data.content,
        timestamp: serverTimestamp() as any, // Firestore will convert this
      };
      // Non-blocking addDoc from firebase/index.ts is not directly used here for simplicity,
      // using standard addDoc. Can be refactored if specific non-blocking behavior is critical.
      await addDoc(questionsCollection, newQuestion);
      
      toast({ title: 'Question Submitted!', description: 'Your question has been added to the Q&A wall.' });
      form.reset();
    } catch (error) {
      console.error('Error submitting question: ', error);
      toast({ title: 'Submission Failed', description: (error as Error).message, variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return null; // Don't show form if user is not logged in (main page handles redirect)
  }

  return (
    <Card className="mb-8 shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold">Ask a Question</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="question-content" className="sr-only">Your Question</FormLabel>
                  <FormControl>
                    <Textarea
                      id="question-content"
                      placeholder="Type your question here..."
                      className="min-h-[100px] resize-none text-base"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-accent-foreground" disabled={isSubmitting}>
              <Send className="mr-2 h-4 w-4" />
              {isSubmitting ? 'Submitting...' : 'Submit Question'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
