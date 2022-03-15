import PriceChart from '../PriceChart';
import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client';

const client = new ApolloClient({
  uri: 'https://api.thegraph.com/subgraphs/name/blueberrynetwork/blueberry-network',
  cache: new InMemoryCache(),
});

export const PriceChartContainer = () => {
  return (
    <ApolloProvider client={client}>
      <PriceChart />
    </ApolloProvider>
  );
};
