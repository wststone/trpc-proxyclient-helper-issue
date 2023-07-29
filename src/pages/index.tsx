import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import { createServerSideHelpers } from '@trpc/react-query/server';
import superjson from 'superjson';
import { appRouter } from '~/server/routers/_app';
import { getBaseUrl, trpc } from '~/utils/trpc';

const proxyClient = createTRPCProxyClient<typeof appRouter>({
  transformer: superjson,
  links: [
    httpBatchLink({
      url: getBaseUrl(),
    }),
  ],
});

const helpers = createServerSideHelpers({
  router: appRouter,
  ctx:{},
  transformer: superjson,
});

// const createProxySSGHelpers = cr({

/**
 * This page will be served statically
 * @link https://trpc.io/docs/ssg
 */
export const getStaticProps = async () => {
  // helpers

  await helpers.greeting.prefetch({ name: 'client' });

  return {
    props: {
      trpcState: helpers.dehydrate(),
    },
    revalidate: 1,
  };
};

export default function IndexPage() {
  const result = trpc.greeting.useQuery({ name: 'client' });

  if (!result.data) {
    /* unreachable, page is served statically */
    return (
      <div style={styles}>
        <h1>Loading...</h1>
      </div>
    );
  }

  return (
    <div style={styles}>
      <h1>{result.data.text}</h1>
      <p>{result.data.date.toDateString()}</p>
    </div>
  );
}

const styles = {
  width: '100vw',
  height: '100vh',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
};
