import { ApolloClient, InMemoryCache } from "@apollo/client";

const client = new ApolloClient({
    uri: "https://gql-technical-assignment.herokuapp.com/graphql",
    cache: new InMemoryCache(),
    headers: {
        'Content-Type' : 'application/json'
    }
});

export default client;