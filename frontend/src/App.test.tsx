import type { MockedResponse } from '@apollo/client/testing'
import { MockedProvider } from '@apollo/client/testing/react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { GraphQLError } from 'graphql'
import BookCheckout from './components/BookCheckout.tsx'
import BookReturn from './components/BookReturn.tsx'
import { expect, test } from 'vitest'
import App from './App.tsx'
import {
  CheckOutBookDocument,
  GetAllBooksDocument,
  GetAllPeopleDocument,
  GetBookForIdDocument,
  ReturnBookDocument,
} from './graphql/generated.ts'
import type {
  CheckOutBookMutation,
  CheckOutBookMutationVariables,
  GetAllBooksQuery,
  GetAllBooksQueryVariables,
  GetAllPeopleQuery,
  GetAllPeopleQueryVariables,
  GetBookForIdQuery,
  GetBookForIdQueryVariables,
  ReturnBookMutation,
  ReturnBookMutationVariables,
} from './graphql/generated.ts'

const borrower = {
  id: 'person-1',
  firstName: 'Ada',
  lastName: 'Lovelace',
  emailAddress: 'ada@example.com',
  phoneNumber: '555-0100',
} satisfies NonNullable<GetBookForIdQuery['getBookForId']['checkedOutBy']>

const availableBook = {
  id: 'book-1',
  title: 'Pride and Prejudice',
  author: 'Jane Austen',
  isCheckedOut: false,
} satisfies GetAllBooksQuery['getAllBooks'][number]

const checkedOutBook = {
  ...availableBook,
  id: 'book-2',
  title: 'Sense and Sensibility',
  isCheckedOut: true,
} satisfies GetAllBooksQuery['getAllBooks'][number]

const otherBook = {
  ...availableBook,
  id: 'book-3',
  title: 'The Hobbit',
  author: 'J. R. R. Tolkien',
} satisfies GetAllBooksQuery['getAllBooks'][number]

const availableBookDetails = {
  ...availableBook,
  checkedOutBy: null,
} satisfies GetBookForIdQuery['getBookForId']

const checkedOutBookDetails = {
  ...checkedOutBook,
  checkedOutBy: borrower,
} satisfies GetBookForIdQuery['getBookForId']

test('searches by author or title and combines search with the availability filter', async () => {
  const user = userEvent.setup()
  const booksMock: MockedResponse<GetAllBooksQuery, GetAllBooksQueryVariables> = {
    request: { query: GetAllBooksDocument },
    result: { data: { getAllBooks: [availableBook, checkedOutBook, otherBook] } },
  }

  render(
    <MockedProvider mocks={[booksMock]}>
      <MemoryRouter initialEntries={['/books']}>
        <App />
      </MemoryRouter>
    </MockedProvider>,
  )

  expect(await screen.findByRole('link', { name: otherBook.title })).toBeInTheDocument()
  const search = screen.getByRole('searchbox', { name: 'Search by title or author' })
  await user.type(search, '  aUsTeN  ')
  expect(screen.getByRole('link', { name: availableBook.title })).toBeInTheDocument()
  expect(screen.getByRole('link', { name: checkedOutBook.title })).toBeInTheDocument()
  expect(screen.queryByRole('link', { name: otherBook.title })).not.toBeInTheDocument()

  await user.click(screen.getByRole('combobox', { name: 'Availability' }))
  await user.click(screen.getByRole('option', { name: 'Checked out' }))
  expect(screen.getByRole('link', { name: checkedOutBook.title })).toBeInTheDocument()
  expect(screen.queryByRole('link', { name: availableBook.title })).not.toBeInTheDocument()
  expect(screen.queryByRole('link', { name: otherBook.title })).not.toBeInTheDocument()

  await user.click(screen.getByRole('combobox', { name: 'Availability' }))
  await user.click(screen.getByRole('option', { name: 'Available' }))
  expect(screen.getByRole('link', { name: availableBook.title })).toBeInTheDocument()
  expect(screen.queryByRole('link', { name: checkedOutBook.title })).not.toBeInTheDocument()
  expect(screen.queryByRole('link', { name: otherBook.title })).not.toBeInTheDocument()

  await user.clear(search)
  await user.type(search, 'SENSE')
  expect(screen.getByRole('status')).toHaveTextContent('No matching books.')
  expect(screen.queryByRole('link', { name: availableBook.title })).not.toBeInTheDocument()

  await user.click(screen.getByRole('combobox', { name: 'Availability' }))
  await user.click(screen.getByRole('option', { name: 'All' }))
  expect(screen.getByRole('link', { name: checkedOutBook.title })).toBeInTheDocument()
  expect(screen.queryByRole('link', { name: availableBook.title })).not.toBeInTheDocument()
  expect(screen.queryByRole('link', { name: otherBook.title })).not.toBeInTheDocument()
  await user.clear(search)
  expect(screen.getAllByRole('listitem')).toHaveLength(3)
})

test('shows the current borrower and contact information for a checked-out book', async () => {
  const bookMock: MockedResponse<GetBookForIdQuery, GetBookForIdQueryVariables> = {
    request: { query: GetBookForIdDocument, variables: { bookId: checkedOutBook.id } },
    result: { data: { getBookForId: checkedOutBookDetails } },
  }

  render(
    <MockedProvider mocks={[bookMock]}>
      <MemoryRouter initialEntries={[`/books/${checkedOutBook.id}`]}>
        <App />
      </MemoryRouter>
    </MockedProvider>,
  )

  expect(await screen.findByRole('heading', { name: checkedOutBook.title })).toBeInTheDocument()
  expect(screen.getByText('Checked out')).toBeInTheDocument()
  expect(screen.getByRole('heading', { name: 'Borrower' })).toBeInTheDocument()
  expect(screen.getByText('Ada Lovelace')).toBeInTheDocument()
  expect(screen.getByRole('link', { name: borrower.emailAddress }))
    .toHaveAttribute('href', `mailto:${borrower.emailAddress}`)
  expect(screen.getByText(`Phone: ${borrower.phoneNumber}`)).toBeInTheDocument()
  expect(screen.queryByText('Borrower details are unavailable.')).not.toBeInTheDocument()
})

test('requires a borrower before checkout and disables checkout controls while submitting', async () => {
  const user = userEvent.setup()
  const bookMock: MockedResponse<GetBookForIdQuery, GetBookForIdQueryVariables> = {
    request: { query: GetBookForIdDocument, variables: { bookId: availableBook.id } },
    result: { data: { getBookForId: availableBookDetails } },
  }
  const peopleMock: MockedResponse<GetAllPeopleQuery, GetAllPeopleQueryVariables> = {
    request: { query: GetAllPeopleDocument },
    result: { data: { getAllPeople: [borrower] } },
  }
  const checkoutMock: MockedResponse<CheckOutBookMutation, CheckOutBookMutationVariables> = {
    request: {
      query: CheckOutBookDocument,
      variables: { bookId: availableBook.id, personId: borrower.id },
    },
    // Keep the request pending so the submitting state has no timing race.
    delay: Infinity,
    result: {
      data: {
        checkOutBook: {
          ...availableBook,
          __typename: 'Book',
          isCheckedOut: true,
          checkedOutBy: { ...borrower, __typename: 'Person' },
        } satisfies CheckOutBookMutation['checkOutBook'],
      },
    },
  }

  render(
    <MockedProvider mocks={[bookMock, peopleMock, checkoutMock]}>
      <MemoryRouter initialEntries={[`/books/${availableBook.id}`]}>
        <App />
      </MemoryRouter>
    </MockedProvider>,
  )

  const borrowerSelect = await screen.findByRole('combobox', { name: /Borrower/ })
  await waitFor(() => expect(borrowerSelect).not.toHaveAttribute('aria-disabled', 'true'))
  const checkoutButton = screen.getByRole('button', { name: 'Check Out' })
  expect(checkoutButton).toBeDisabled()

  await user.click(borrowerSelect)
  await user.click(await screen.findByRole('option', { name: 'Ada Lovelace (ada@example.com)' }))
  expect(checkoutButton).toBeEnabled()
  await user.click(checkoutButton)

  expect(await screen.findByRole('button', { name: 'Checking out…' })).toBeDisabled()
  expect(borrowerSelect).toHaveAttribute('aria-disabled', 'true')
})


test.each([
  {
    name: 'BOOK_NOT_FOUND with unrelated human-readable wording',
    error: new GraphQLError('The requested record is unavailable.', { extensions: { code: 'BOOK_NOT_FOUND' } }),
    expected: 'Book not found. It may no longer be in the library.',
  },
  {
    name: 'another GraphQL code with the old nullability message',
    error: new GraphQLError('Cannot return null for non-nullable field Query.getBookForId.', { extensions: { code: 'INTERNAL_SERVER_ERROR' } }),
    expected: 'Unable to load book details: Cannot return null for non-nullable field Query.getBookForId.',
  },
  {
    name: 'a GraphQL error without a code with the old nullability message',
    error: new GraphQLError('Cannot return null for non-nullable field Query.getBookForId.'),
    expected: 'Unable to load book details: Cannot return null for non-nullable field Query.getBookForId.',
  },
  {
    name: 'a network failure whose message says book not found',
    error: new Error('Book not found.'),
    expected: 'Unable to load book details: Book not found.',
  },
])('book details handles $name by error type and code', async ({ error, expected }) => {
  const bookMock: MockedResponse<GetBookForIdQuery, GetBookForIdQueryVariables> = {
    request: { query: GetBookForIdDocument, variables: { bookId: 'missing' } },
    ...(error instanceof GraphQLError ? { result: { errors: [error] } } : { error }),
  }

  render(
    <MockedProvider mocks={[bookMock]}>
      <MemoryRouter initialEntries={['/books/missing']}>
        <App />
      </MemoryRouter>
    </MockedProvider>,
  )

  expect((await screen.findByRole('alert')).textContent).toBe(expected)
})

test.each([
  ['BOOK_NOT_FOUND', 'Unable to check out book: Book not found. It may no longer be in the library.'],
  ['PERSON_NOT_FOUND', 'Unable to check out book: The selected borrower could not be found.'],
  ['BOOK_ALREADY_CHECKED_OUT', 'Unable to check out book: The book is no longer available.'],
  ['INTERNAL_SERVER_ERROR', 'Unable to check out book: Opaque checkout failure.'],
])('checkout handles %s without parsing the message', async (code, expected) => {
  const user = userEvent.setup()
  const peopleMock: MockedResponse<GetAllPeopleQuery, GetAllPeopleQueryVariables> = {
    request: { query: GetAllPeopleDocument },
    result: { data: { getAllPeople: [borrower] } },
  }
  const checkoutMock: MockedResponse<CheckOutBookMutation, CheckOutBookMutationVariables> = {
    request: {
      query: CheckOutBookDocument,
      variables: { bookId: availableBook.id, personId: borrower.id },
    },
    result: { errors: [new GraphQLError('Opaque checkout failure.', { extensions: { code } })] },
  }

  render(
    <MockedProvider mocks={[peopleMock, checkoutMock]}>
      <BookCheckout bookId={availableBook.id} isAvailable />
    </MockedProvider>,
  )

  const borrowerSelect = screen.getByRole('combobox', { name: /Borrower/ })
  await waitFor(() => expect(borrowerSelect).not.toHaveAttribute('aria-disabled', 'true'))
  await user.click(borrowerSelect)
  await user.click(await screen.findByRole('option', { name: 'Ada Lovelace (ada@example.com)' }))
  await user.click(screen.getByRole('button', { name: 'Check Out' }))
  expect((await screen.findByRole('alert')).textContent).toBe(expected)
})

test.each([
  ['BOOK_NOT_FOUND', 'Unable to return book: Book not found. It may no longer be in the library.'],
  ['BOOK_NOT_CHECKED_OUT', 'Unable to return book: The book is already available and cannot be returned.'],
  ['INTERNAL_SERVER_ERROR', 'Unable to return book: Opaque return failure.'],
])('return handles %s without parsing the message', async (code, expected) => {
  const user = userEvent.setup()
  const returnMock: MockedResponse<ReturnBookMutation, ReturnBookMutationVariables> = {
    request: { query: ReturnBookDocument, variables: { bookId: checkedOutBook.id } },
    result: { errors: [new GraphQLError('Opaque return failure.', { extensions: { code } })] },
  }

  render(
    <MockedProvider mocks={[returnMock]}>
      <BookReturn
        bookId={checkedOutBook.id}
        bookTitle={checkedOutBook.title}
        isCheckedOut
        focusAfterReturn={() => {}}
      />
    </MockedProvider>,
  )

  await user.click(screen.getByRole('button', { name: 'Return Book' }))
  await user.click(await screen.findByRole('button', { name: 'Confirm' }))
  expect((await screen.findByRole('alert')).textContent).toBe(expected)
  expect(screen.getByRole('dialog')).toBeInTheDocument()
})
