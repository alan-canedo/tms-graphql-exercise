import { useMutation } from "@apollo/client/react"
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material"
import { useId, useRef, useState } from "react"
import { ReturnBookDocument } from "../graphql/generated.ts"

type BookReturnProps = {
  bookId: string
  bookTitle: string
  isCheckedOut: boolean
  focusAfterReturn: () => void
}

function BookReturn({ bookId, bookTitle, isCheckedOut, focusAfterReturn }: BookReturnProps) {
  const [open, setOpen] = useState(false)
  const [failure, setFailure] = useState<string | null>(null)
  const inFlight = useRef(false)
  const returned = useRef(false)
  const titleId = useId()
  const descriptionId = useId()
  const [returnBook, { loading }] = useMutation(ReturnBookDocument)

  function handleClose() {
    if (inFlight.current) return
    setOpen(false)
  }

  async function handleConfirm() {
    if (!open || !isCheckedOut || loading || inFlight.current) return

    // Lock synchronously, before Apollo's loading state causes a render.
    inFlight.current = true
    setFailure(null)
    try {
      const result = await returnBook({ variables: { bookId } })
      const book = result.data?.returnBook
      if (!book || book.id !== bookId || book.isCheckedOut || book.checkedOutBy !== null) {
        setFailure("The return was not completed. Please try again.")
        return
      }

      returned.current = true
      setOpen(false)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Please try again."
      setFailure(`Unable to return book: ${message}`)
    } finally {
      inFlight.current = false
    }
  }

  return (
    <>
      {isCheckedOut && (
        <Button
          variant="contained"
          disabled={loading}
          sx={{ alignSelf: "flex-start" }}
          onClick={() => {
            if (inFlight.current) return
            returned.current = false
            setFailure(null)
            setOpen(true)
          }}
        >
          Return Book
        </Button>
      )}
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        aria-busy={loading}
        slotProps={{
          transition: {
            onExited: () => {
              // A successful return removes the trigger; focus the book title instead.
              if (returned.current) focusAfterReturn()
            },
          },
        }}
      >
        <DialogTitle id={titleId}>Return Book</DialogTitle>
        <DialogContent>
          <DialogContentText id={descriptionId}>
            Return “{bookTitle}” to the library? This will mark the book as available
            and clear its current borrower.
          </DialogContentText>
          {failure && <Alert severity="error" sx={{ mt: 2 }}>{failure}</Alert>}
        </DialogContent>
        <DialogActions>
          <Button autoFocus onClick={handleClose} disabled={loading}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => { void handleConfirm() }}
            disabled={loading || !isCheckedOut}
          >
            {loading ? "Returning…" : "Confirm"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default BookReturn
