import type { MockedResponse } from '@apollo/client/testing'
import { MockedProvider } from '@apollo/client/testing/react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { expect, test } from 'vitest'
import App from './App.tsx'
import {
  CheckOutBookDocument,
  GetAllBooksDocument,
  GetAllPeopleDocument,
  GetBookForIdDocument,
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
} from './graphql/generated.ts'

const borrower = {
  __typename: 'Person',
  id: 'person-1',
  firstName: 'Ada',
  lastName: 'Lovelace',
  emailAddress: 'ada@example.com',
  phoneNumber: '555-0100',
} satisfies NonNullable<CheckOutBookMutation['checkOutBook']['checkedOutBy']>

const availableBook = {
  __typename: 'Book',
  id: 'book-1',
  title: 'Pride and Prejudice',
  author: 'Jane Austen',
  isCheckedOut: false,
  checkedOutBy: null,
} satisfies CheckOutBookMutation['checkOutBook']

const checkedOutBook = {
  ...availableBook,
  id: 'book-2',
  title: 'Sense and Sensibility',
  isCheckedOut: true,
  checkedOutBy: borrower,
} satisfies CheckOutBookMutation['checkOutBook']

const otherBook = {
  ...availableBook,
  id: 'book-3',
  title: 'The Hobbit',
  author: 'J. R. R. Tolkien',
} satisfies CheckOutBookMutation['checkOutBook']

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
    result: { data: { getBookForId: checkedOutBook } },
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
    result: { data: { getBookForId: availableBook } },
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
      data: { checkOutBook: { ...availableBook, isCheckedOut: true, checkedOutBy: borrower } },
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
