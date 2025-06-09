'use client';
    
import {
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  CollectionReference,
  DocumentReference,
  SetOptions,
} from 'firebase/firestore';

/**
 * Initiates a setDoc operation for a document reference.
 * Does NOT await the write operation internally.
 */
export function setDocumentNonBlocking(docRef: DocumentReference, data: any, options: SetOptions) {
  // CRITICAL: Call setDoc directly. Do NOT use 'await setDoc(...)'.
  setDoc(docRef, data, options)
    .catch(error => console.error(`Set error for ${docRef.path}:`, error)); // Basic error logging
  // Execution continues immediately after setDoc is called.
}


/**
 * Initiates an addDoc operation for a collection reference.
 * Does NOT await the write operation internally.
 * Returns the Promise for the new doc ref, but typically not awaited by caller.
 */
export function addDocumentNonBlocking(colRef: CollectionReference, data: any) {
  // CRITICAL: Call addDoc directly. Do NOT use 'await addDoc(...)'.
  const promise = addDoc(colRef, data)
    .catch(error => console.error(`Add error for ${colRef.path}:`, error)); // Basic error logging
  // Execution continues immediately after addDoc is called.
  return promise; // Returns promise resolving with new doc ref (locally)
}


/**
 * Initiates an updateDoc operation for a document reference.
 * Does NOT await the write operation internally.
 */
export function updateDocumentNonBlocking(docRef: DocumentReference, data: any) {
  // CRITICAL: Call updateDoc directly. Do NOT use 'await updateDoc(...)'.
  updateDoc(docRef, data)
    .catch(error => console.error(`Update error for ${docRef.path}:`, error)); // Basic error logging
  // Execution continues immediately after updateDoc is called.
}


/**
 * Initiates a deleteDoc operation for a document reference.
 * Does NOT await the write operation internally.
 */
export function deleteDocumentNonBlocking(docRef: DocumentReference) {
  // CRITICAL: Call deleteDoc directly. Do NOT use 'await deleteDoc(...)'.
  deleteDoc(docRef)
    .catch(error => console.error(`Delete error for ${docRef.path}:`, error)); // Basic error logging
  // Execution continues immediately after deleteDoc is called.
}