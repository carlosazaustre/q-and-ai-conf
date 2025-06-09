
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { LogIn, LogOut, User as UserIcon, Loader2 } from 'lucide-react';

import { useAuth, useFirestore, useUser } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { UserProfile } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import type { Timestamp } from 'firebase/firestore';


export default function AuthButton() {
  const auth = useAuth();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  const handleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;
      if (firebaseUser) {
        const userRef = doc(firestore, 'users', firebaseUser.uid);
        const userProfile: UserProfile = {
          id: firebaseUser.uid,
          email: firebaseUser.email,
          name: firebaseUser.displayName,
          imageUrl: firebaseUser.photoURL,
          createdAt: serverTimestamp() as Timestamp, // Firestore will convert this
        };
        // Using non-blocking setDoc is fine here for profile creation/update
        setDoc(userRef, userProfile, { merge: true });
        toast({ title: 'Signed in successfully!' });
        router.push('/');
      }
    } catch (error) {
      const firebaseError = error as any; // Cast to access error.code
      if (firebaseError.code === 'auth/popup-closed-by-user') {
        // User closed the popup, this is a common action, not a critical error.
        // console.info('Sign-in popup closed by user.'); // Optional: log as info instead of error
        toast({ 
          title: 'Sign-in Cancelled', 
          description: 'The sign-in window was closed before completion.',
          variant: 'default' 
        });
      } else {
        // Handle other, potentially more critical, sign-in errors
        console.error('Error signing in with Google: ', error);
        toast({ 
          title: 'Sign in Failed', 
          description: firebaseError.message || 'An unexpected error occurred during sign-in.', 
          variant: 'destructive' 
        });
      }
    }
  };

  const handleSignOut = async () => {
    try {
      await firebaseSignOut(auth);
      toast({ title: 'Signed out successfully!' });
      router.push('/login');
    } catch (error) {
      console.error('Error signing out: ', error);
      toast({ title: 'Sign out failed', description: (error as Error).message, variant: 'destructive' });
    }
  };

  if (isUserLoading) {
    return <Button variant="ghost" size="icon" disabled><Loader2 className="h-5 w-5 animate-spin" /></Button>;
  }

  if (!user) {
    return (
      <Button onClick={handleSignIn} variant="outline">
        <LogIn className="mr-2 h-4 w-4" />
        Sign in with Google
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'} />
            <AvatarFallback>
              {user.displayName ? user.displayName.charAt(0).toUpperCase() : <UserIcon className="h-4 w-4" />}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.displayName}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
