import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { typeDefs } from './schema.js';
import db, {type Book} from './data/_db.js';

const resolvers = {
    Book: {
        checkedOutBy(parent: Book) {
            return db.persons.find(p => p.id === parent.person_id)
        }
    },
    Query: {
        getAllBooks() {
            return db.books
        },
        getBookForId(_parent: unknown, args: { bookId: string }) {
            return db.books.find(e => e.id === args.bookId)
        },
    },
    Mutation: {
        checkOutBook(_parent: unknown, args: {bookId: string, personId: string}) {
            const book = db.books.find(e => e.id === args.bookId && !e.isCheckedOut)
            const person = db.persons.find(e => e.id === args.personId)

            if(!book || !person) {
                return db.books.find(e => e.id === args.bookId)
            }

            db.books = db.books.map(e => {
                if(e.id === args.bookId){
                    return {...e, isCheckedOut: true, person_id: args.personId}
                }

                return e
            })

            return db.books.find(e => e.id === args.bookId)
        },
        returnBook(_parent: unknown, args: { bookId: string }) {
            const book = db.books.find(e => e.id === args.bookId && e.isCheckedOut)
            if(!book) {
                return db.books.find(e => e.id === args.bookId)
            }

            db.books = db.books.map(e => {
                if(e.id === args.bookId){
                    return {...e, isCheckedOut: false, person_id: null}
                }

                return e
            })

            return db.books.find(e => e.id === args.bookId)
        }
    }
}

const server = new ApolloServer({
    typeDefs,
    resolvers,
});

const { url } = await startStandaloneServer(server, {
    listen: { port: 4000}
})

console.log('Server ready at port: ', 4000)
