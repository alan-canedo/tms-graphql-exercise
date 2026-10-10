/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
};

export type Book = {
  __typename?: 'Book';
  author: Scalars['String']['output'];
  checkedOutBy?: Maybe<Person>;
  id: Scalars['ID']['output'];
  isCheckedOut: Scalars['Boolean']['output'];
  title: Scalars['String']['output'];
};

export type Mutation = {
  __typename?: 'Mutation';
  checkOutBook: Book;
  returnBook: Book;
};


export type MutationCheckOutBookArgs = {
  bookId: Scalars['ID']['input'];
  personId: Scalars['ID']['input'];
};


export type MutationReturnBookArgs = {
  bookId: Scalars['ID']['input'];
};

export type Person = {
  __typename?: 'Person';
  emailAddress: Scalars['String']['output'];
  firstName: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  lastName: Scalars['String']['output'];
  phoneNumber?: Maybe<Scalars['String']['output']>;
};

export type Query = {
  __typename?: 'Query';
  getAllBooks: Array<Book>;
  getAllPeople: Array<Person>;
  getBookForId: Book;
};


export type QueryGetBookForIdArgs = {
  bookId: Scalars['ID']['input'];
};

export type GetAllBooksQueryVariables = Exact<{ [key: string]: never; }>;


export type GetAllBooksQuery = { getAllBooks: Array<{ id: string, title: string, author: string, isCheckedOut: boolean }> };


export const GetAllBooksDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetAllBooks"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getAllBooks"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"author"}},{"kind":"Field","name":{"kind":"Name","value":"isCheckedOut"}}]}}]}}]} as unknown as DocumentNode<GetAllBooksQuery, GetAllBooksQueryVariables>;