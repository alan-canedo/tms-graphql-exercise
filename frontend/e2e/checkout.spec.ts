import { expect, test } from '@playwright/test'

test('checks out a seeded book to the selected borrower', async ({ page }) => {
  await page.goto('/books')
  await page.getByRole('link', { name: 'The Lord of the Rings', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'The Lord of the Rings', exact: true })).toBeVisible()
  await expect(page.getByText('Available', { exact: true })).toBeVisible()

  const borrower = page.getByRole('combobox', { name: 'Borrower' })
  await expect(borrower).toBeEnabled()
  await borrower.click()
  await page.getByRole('option', { name: 'luigi bruh (luigi@example.com)', exact: true }).click()

  const returnBook = page.getByRole('button', { name: 'Return Book', exact: true })
  try {
    await page.getByRole('button', { name: 'Check Out', exact: true }).click()
    await expect(page.getByText('Checked out', { exact: true })).toBeVisible()
    await expect(returnBook).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Borrower', exact: true })).toBeVisible()
    await expect(page.getByText('luigi bruh', { exact: true })).toBeVisible()
    await expect(page.getByRole('link', { name: 'luigi@example.com', exact: true })).toBeVisible()
    await expect(page.getByText('Phone: 555-555-5556', { exact: true })).toBeVisible()
  } finally {
    // Restore the seed through the UI, including if a borrower assertion fails.
    if (await returnBook.isVisible()) {
      await returnBook.click()
      await page.getByRole('dialog', { name: 'Return Book', exact: true })
        .getByRole('button', { name: 'Confirm', exact: true }).click()
      await expect(page.getByText('Available', { exact: true })).toBeVisible()
      await expect(page.getByRole('heading', { name: 'Borrower', exact: true })).toBeHidden()
    }
  }
})
