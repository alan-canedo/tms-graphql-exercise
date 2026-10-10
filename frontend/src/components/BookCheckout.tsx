import { skipToken, useMutation, useQuery } from "@apollo/client/react"
import { Alert, Button, MenuItem, Stack, TextField } from "@mui/material"
import { useState } from "react"
import { hasGraphQLErrorCode } from "../graphql/errors.ts"
import {
  CheckOutBookDocument,
  GetAllPeopleDocument,
} from "../graphql/generated.ts"

type BookCheckoutProps = {
  bookId: string
  isAvailable: boolean
}

function BookCheckout({ bookId, isAvailable }: BookCheckoutProps) {
  const [personId, setPersonId] = useState("")
  const [checkoutFailure, setCheckoutFailure] = useState<string | null>(null)
  const { data, loading: peopleLoading, error: peopleError } = useQuery(
    GetAllPeopleDocument,
    isAvailable ? {} : skipToken,
  )
  const [checkOutBook, { loading, error }] = useMutation(CheckOutBookDocument)
  const people = data?.getAllPeople ?? []
  const errorMessage = hasGraphQLErrorCode(error, "BOOK_NOT_FOUND")
    ? "Unable to check out book: Book not found. It may no longer be in the library."
    : hasGraphQLErrorCode(error, "PERSON_NOT_FOUND")
      ? "Unable to check out book: The selected borrower could not be found."
      : hasGraphQLErrorCode(error, "BOOK_ALREADY_CHECKED_OUT")
        ? "Unable to check out book: The book is no longer available."
        : error ? `Unable to check out book: ${error.message}` : null
  const canCheckOut =
    isAvailable &&
    !loading &&
    !peopleLoading &&
    !peopleError &&
    people.some((person) => person.id === personId)

  async function handleCheckOut() {
    if (!canCheckOut) return

    setCheckoutFailure(null)
    try {
      const result = await checkOutBook({ variables: { bookId, personId } })
      if (
        !result.data?.checkOutBook.isCheckedOut ||
        result.data.checkOutBook.checkedOutBy?.id !== personId
      ) {
        setCheckoutFailure(
          "Checkout was not completed for the selected borrower. The book may no longer be available or the borrower may no longer exist.",
        )
      }
    } catch {
      // useMutation exposes the GraphQL/network error for the alert below.
    }
  }

  if (!isAvailable && !error && !checkoutFailure) return null

  return (
    <Stack spacing={2}>
      {(error || checkoutFailure) && (
        <Alert severity="error">
          {error ? errorMessage : checkoutFailure}
        </Alert>
      )}
      {isAvailable && (
        <Stack
          component="form"
          spacing={2}
          onSubmit={(event) => {
            event.preventDefault()
            void handleCheckOut()
          }}
        >
          {peopleError && (
            <Alert severity="error">
              Unable to load borrowers: {peopleError.message}
            </Alert>
          )}
          <TextField
            id="checkout-borrower"
            label="Borrower"
            select
            required
            fullWidth
            sx={{
              "& .MuiSelect-select.MuiSelect-select": { whiteSpace: "normal", overflowWrap: "anywhere" },
            }}
            value={personId}
            onChange={(event) => setPersonId(event.target.value)}
            disabled={loading || peopleLoading || !!peopleError || people.length === 0}
            helperText={
              peopleLoading
                ? "Loading borrowers…"
                : !peopleError && people.length === 0
                  ? "No borrowers are available."
                  : "Select the person borrowing this book."
            }
          >
            {people.map((person) => (
              <MenuItem
                key={person.id}
                value={person.id}
                sx={{ whiteSpace: "normal", overflowWrap: "anywhere" }}
              >
                {person.firstName} {person.lastName} ({person.emailAddress})
              </MenuItem>
            ))}
          </TextField>
          <Button
            type="submit"
            variant="contained"
            disabled={!canCheckOut}
            sx={{ alignSelf: "flex-start" }}
          >
            {loading ? "Checking out…" : "Check Out"}
          </Button>
        </Stack>
      )}
    </Stack>
  )
}

export default BookCheckout
