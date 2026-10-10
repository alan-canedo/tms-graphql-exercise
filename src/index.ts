import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { GraphQLError } from 'graphql';
import { pathToFileURL } from 'node:url';
import { typeDefs } from './schema.js';
import db, { type Book } from './data/_db.js';

export const resolvers = {
    Book: {
        checkedOutBy(parent: Book) {
            return db.persons.find(person => person.id === parent.person_id);
        }
    },
    Query: {
        getAllBooks() {
            return db.books;
        },
        getBookForId(_parent: unknown, args: { bookId: string }) {
            const book = db.books.find(book => book.id === args.bookId);
            if (!book) {
                throw new GraphQLError('Book not found.', { extensions: { code: 'BOOK_NOT_FOUND' } });
            }
            return book;
        },
        getAllPeople() {
            return db.persons;
        }
    },
    Mutation: {
        checkOutBook(_parent: unknown, args: {bookId: string, personId: string}) {
            const book = db.books.find(book => book.id === args.bookId);
            if (!book) {
                throw new GraphQLError('Book not found.', { extensions: { code: 'BOOK_NOT_FOUND' } });
            }
            const person = db.persons.find(person => person.id === args.personId);
            if (!person) {
                throw new GraphQLError('Person not found.', { extensions: { code: 'PERSON_NOT_FOUND' } });
            }
            if (book.isCheckedOut) {
                throw new GraphQLError('Book is already checked out.', { extensions: { code: 'BOOK_ALREADY_CHECKED_OUT' } });
            }

            db.books = db.books.map(book => {
                if(book.id === args.bookId){
                    return {...book, isCheckedOut: true, person_id: args.personId};
                }

                return book;
            });

            return db.books.find(book => book.id === args.bookId);
        },
        returnBook(_parent: unknown, args: { bookId: string }) {
            const book = db.books.find(book => book.id === args.bookId);
            if (!book) {
                throw new GraphQLError('Book not found.', { extensions: { code: 'BOOK_NOT_FOUND' } });
            }
            if (!book.isCheckedOut) {
                throw new GraphQLError('Book is not checked out.', { extensions: { code: 'BOOK_NOT_CHECKED_OUT' } });
            }

            db.books = db.books.map(book => {
                if(book.id === args.bookId){
                    return {...book, isCheckedOut: false, person_id: null};
                }

                return book;
            });

            return db.books.find(book => book.id === args.bookId);
        }
    }
};

// Importing the resolvers for tests must not start an HTTP listener.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
    const server = new ApolloServer({
        typeDefs,
        resolvers,
    });

    const { url } = await startStandaloneServer(server, {
        listen: { port: 4000}
    });

    console.log('Graphql server ready at:', url);
}
