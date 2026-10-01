export const typeDefs = `#graphql
  type Book {
    id: ID!
    title: String!
    author: String!
    isCheckedOut: Boolean!
    checkedOutBy: Person
  }
  type Person {
    id: ID!
    firstName: String!
    lastName: String!
    emailAddress: String!
    phoneNumber: String
  }
  type Query {
    getAllBooks: [Book!]!
    getBookForId(bookId: ID!): Book!
  }
  type Mutation {
    checkOutBook(bookId: ID!, personId: ID!): Book!
    returnBook(bookId: ID!): Book!
  }
`;

// int, float, string, boolean, ID