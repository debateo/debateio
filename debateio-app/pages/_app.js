import { ChakraProvider } from "@chakra-ui/react";
import Header from "../components/Header";
import { Container } from "@chakra-ui/react";

function MyApp({ Component, pageProps }) {
  return (
    <ChakraProvider>
      <Container maxW="container.lg" padding="5">
        <Header />
        <Component {...pageProps} />
      </Container>
    </ChakraProvider>
  );
}

export default MyApp;
