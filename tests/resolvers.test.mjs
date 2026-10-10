import assert from 'node:assert/strict';
import { test } from 'node:test';
import { GraphQLError } from 'graphql';
import db from '../dist/data/_db.js';
import { resolvers } from '../dist/index.js';

const rejectedOperations = [
    ['unknown book query', () => resolvers.Query.getBookForId(null, { bookId: 'missing' }), 'BOOK_NOT_FOUND'],
    ['checkout of an unknown book', () => resolvers.Mutation.checkOutBook(null, { bookId: 'missing', personId: '1' }), 'BOOK_NOT_FOUND'],
    ['checkout by an unknown person', () => resolvers.Mutation.checkOutBook(null, { bookId: '2', personId: 'missing' }), 'PERSON_NOT_FOUND'],
    ['checkout of a checked-out book', () => resolvers.Mutation.checkOutBook(null, { bookId: '1', personId: '1' }), 'BOOK_ALREADY_CHECKED_OUT'],
    ['return of an unknown book', () => resolvers.Mutation.returnBook(null, { bookId: 'missing' }), 'BOOK_NOT_FOUND'],
    ['return of an available book', () => resolvers.Mutation.returnBook(null, { bookId: '2' }), 'BOOK_NOT_CHECKED_OUT'],
];

for (const [name, operation, code] of rejectedOperations) {
    test(`${name} throws ${code} without changing books`, () => {
        const booksBefore = structuredClone(db.books);
        assert.throws(operation, (error) => {
            assert.ok(error instanceof GraphQLError);
            assert.equal(error.extensions.code, code);
            assert.ok(error.message.length > 0);
            return true;
        });
        assert.deepEqual(db.books, booksBefore);
    });
}

test('an existing book is returned normally', () => {
    assert.equal(resolvers.Query.getBookForId(null, { bookId: '2' }), db.books.find(book => book.id === '2'));
});

test('valid checkout and return preserve their existing state changes', () => {
    const booksBefore = structuredClone(db.books);
    try {
        const checkedOut = resolvers.Mutation.checkOutBook(null, { bookId: '2', personId: '1' });
        assert.equal(checkedOut.isCheckedOut, true);
        assert.equal(checkedOut.person_id, '1');
        assert.equal(resolvers.Book.checkedOutBy(checkedOut), db.persons.find(person => person.id === '1'));

        const returned = resolvers.Mutation.returnBook(null, { bookId: '2' });
        assert.equal(returned.isCheckedOut, false);
        assert.equal(returned.person_id, null);
        assert.deepEqual(db.books, booksBefore);
    } finally {
        db.books = booksBefore;
    }
});
