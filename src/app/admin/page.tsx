
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore, useCollection } from '@/firebase';
import { collection, query, orderBy, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import type { Question } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Eye, EyeOff, Trash2, Loader2, ShieldAlert, UserCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { formatDistanceToNow } from 'date-fns';
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

const ADMIN_EMAIL = 'cazaustre@gmail.com';

export default function AdminPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});

  const questionsQuery = useMemo(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'questions'), orderBy('timestamp', 'desc'));
  }, [firestore]);

  const { data: questions, isLoading: isLoadingQuestions, error: questionsError } = useCollection<Question>(questionsQuery);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.replace('/login');
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center min-h-[calc(100vh-theme(spacing.14))]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Verifying access...</p>
      </div>
    );
  }

  if (!user) {
     // This state will be brief due to the useEffect redirect
    return (
      <div className="flex flex-1 flex-col items-center justify-center min-h-[calc(100vh-theme(spacing.14))]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Redirecting to login...</p>
      </div>
    );
  }

  if (user.email !== ADMIN_EMAIL) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center text-center min-h-[calc(100vh-theme(spacing.14))] p-4">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="items-center">
            <ShieldAlert className="h-16 w-16 text-destructive mb-4" />
            <CardTitle className="text-2xl font-bold">Access Denied</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground">You do not have permission to view this page.</p>
            <Button onClick={() => router.push('/')} className="mt-6 w-full">Go to Homepage</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleToggleReadStatus = async (questionId: string, currentStatus: boolean | undefined) => {
    setActionLoading(prev => ({ ...prev, [`read-${questionId}`]: true }));
    try {
      const questionRef = doc(firestore, 'questions', questionId);
      await updateDoc(questionRef, { isRead: !currentStatus });
      toast({ title: `Question marked as ${!currentStatus ? 'read' : 'unread'}.` });
    } catch (error) {
      console.error('Error updating read status:', error);
      toast({ title: 'Update Failed', description: (error as Error).message, variant: 'destructive' });
    } finally {
      setActionLoading(prev => ({ ...prev, [`read-${questionId}`]: false }));
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    setActionLoading(prev => ({ ...prev, [`delete-${questionId}`]: true }));
    try {
      const questionRef = doc(firestore, 'questions', questionId);
      await deleteDoc(questionRef);
      toast({ title: 'Question Deleted', description: 'The question has been removed.' });
    } catch (error) {
      console.error('Error deleting question:', error);
      toast({ title: 'Deletion Failed', description: (error as Error).message, variant: 'destructive' });
    } finally {
      setActionLoading(prev => ({ ...prev, [`delete-${questionId}`]: false }));
    }
  };

  return (
    <div className="container mx-auto py-8">
      <Card className="shadow-xl border-none">
        <CardHeader>
          <CardTitle className="text-3xl font-bold tracking-tight">Admin Dashboard</CardTitle>
          <CardDescription>Manage and review all submitted questions.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingQuestions && (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="ml-2 text-muted-foreground">Loading questions...</p>
            </div>
          )}
          {questionsError && (
             <Alert variant="destructive" className="my-4">
             <AlertTriangle className="h-4 w-4" />
             <AlertTitle>Error loading questions</AlertTitle>
             <AlertDescription>
               {questionsError.message || "An unexpected error occurred."}
             </AlertDescription>
           </Alert>
          )}
          {!isLoadingQuestions && !questionsError && questions && questions.length === 0 && (
            <div className="text-center py-10 border border-dashed rounded-lg">
                <UserCircle size={48} className="mx-auto text-muted-foreground opacity-50" />
                <p className="mt-4 text-lg font-medium text-muted-foreground">No questions submitted yet.</p>
                <p className="text-sm text-muted-foreground">Come back later to see new submissions.</p>
            </div>
          )}
          {!isLoadingQuestions && !questionsError && questions && questions.length > 0 && (
            <div className="overflow-x-auto rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[180px] px-4 py-3">Author</TableHead>
                    <TableHead className="px-4 py-3">Question</TableHead>
                    <TableHead className="w-[120px] text-center px-4 py-3">Status</TableHead>
                    <TableHead className="w-[170px] text-center px-4 py-3">Submitted</TableHead>
                    <TableHead className="w-[150px] text-right px-4 py-3">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {questions.map((q) => (
                    <TableRow key={q.id} className={q.isRead ? 'bg-muted/50 hover:bg-muted/60' : 'hover:bg-muted/20'}>
                      <TableCell className="px-4 py-3">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-9 w-9">
                            <AvatarImage src={q.userImage || undefined} alt={q.userName} />
                            <AvatarFallback className="text-xs">
                              {q.userName ? q.userName.split(' ').map(n => n[0]).join('').toUpperCase() : <UserCircle size={16}/>}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium text-sm truncate" title={q.userName}>{q.userName}</span>
                        </div>
                      </TableCell>
                      <TableCell className="whitespace-pre-wrap min-w-[250px] text-sm px-4 py-3">{q.content}</TableCell>
                      <TableCell className="text-center px-4 py-3">
                        {q.isRead ? (
                          <Badge variant="secondary" className="text-xs py-1 px-2">Read</Badge>
                        ) : (
                          <Badge className="bg-accent text-accent-foreground hover:bg-accent/90 text-xs py-1 px-2">Unread</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-center text-xs text-muted-foreground px-4 py-3">
                        {q.timestamp ? formatDistanceToNow(q.timestamp.toDate(), { addSuffix: true }) : 'N/A'}
                      </TableCell>
                      <TableCell className="text-right space-x-1.5 px-4 py-3">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleToggleReadStatus(q.id, q.isRead)}
                          disabled={actionLoading[`read-${q.id}`]}
                          title={q.isRead ? 'Mark as Unread' : 'Mark as Read'}
                        >
                          {actionLoading[`read-${q.id}`] ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : q.isRead ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Eye className="h-4 w-4 text-primary" />
                          )}
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10" disabled={actionLoading[`delete-${q.id}`]} title="Delete Question">
                              {actionLoading[`delete-${q.id}`] ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this question? This action cannot be undone and will permanently remove the question data.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel disabled={actionLoading[`delete-${q.id}`]}>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteQuestion(q.id)}
                                disabled={actionLoading[`delete-${q.id}`]}
                                className="bg-destructive hover:bg-destructive/90"
                              >
                                {actionLoading[`delete-${q.id}`] ? 'Deleting...' : 'Delete'}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

