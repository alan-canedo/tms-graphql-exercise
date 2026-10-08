import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { typeDefs } from './schema.js';
import db, { type Book } from './data/_db.js';

const resolvers = {
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
            return db.books.find(book => book.id === args.bookId);
        },
        getAllPeople() {
            return db.persons;
        }
    },
    Mutation: {
        checkOutBook(_parent: unknown, args: {bookId: string, personId: string}) {
            const book = db.books.find(book => book.id === args.bookId && !book.isCheckedOut);
            const person = db.persons.find(person => person.id === args.personId);

            if(!book || !person) {
                return db.books.find(book => book.id === args.bookId);
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
            const book = db.books.find(book => book.id === args.bookId && book.isCheckedOut);
            if(!book) {
                return db.books.find(book => book.id === args.bookId);
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

const server = new ApolloServer({
    typeDefs,
    resolvers,
});

const { url } = await startStandaloneServer(server, {
    listen: { port: 4000}
});

console.log('Graphql server ready at:', url);
