let books = [
  { id: '1', title: 'Harry Potter', author: 'J. K. Rowling', isCheckedOut: true, person_id: '1' },
  { id: '2', title: 'The Lord of the Rings', author: 'J. R. R. Tolkien', isCheckedOut: false, person_id: null },
  { id: '3', title: 'Dune', author: 'Frank Herbert', isCheckedOut: true, person_id: '3' },
  { id: '4', title: 'Foundation', author: 'Isaac Asimov', isCheckedOut: true, person_id: '2' },
  { id: '5', title: 'Neuromancer', author: 'William Gibson', isCheckedOut: true, person_id: '1' }
];
let persons = [
  { id: '1', firstName: 'mario', lastName: 'bro', emailAddress: 'mario@example.com', phoneNumber: null },
  { id: '2', firstName: 'luigi', lastName: 'bruh', emailAddress: 'luigi@example.com', phoneNumber: '555-555-5556' },
  { id: '3', firstName: 'bowser', lastName: 'koopa', emailAddress: 'bowser@example.com', phoneNumber: '555-555-5558' },
];

export default { books, persons }