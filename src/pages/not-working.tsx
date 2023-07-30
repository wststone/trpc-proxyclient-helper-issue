import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";
import { createServerSideHelpers } from "@trpc/react-query/server";
import superjson from 'superjson';
import { appRouter } from "~/server/routers/_app";
import { getBaseUrl, trpc } from "~/utils/trpc";


const correctedUrl = getBaseUrl() + '/api/trpc'

console.log(correctedUrl)

const proxyClient = createTRPCProxyClient<typeof appRouter>({
	transformer: superjson,
	links: [
		httpBatchLink({
			url: correctedUrl
		}),
	],
});

const helpers = createServerSideHelpers({
	client: proxyClient,
});

/**
 * This page will be served statically
 * @link https://trpc.io/docs/ssg
 */
export const getStaticProps = async () => {
	// helpers

	await helpers.greeting.prefetch({ name: "client" });

	const data = helpers.dehydrate();

	// console.log(data, data.queries[0]?.state);

	return {
		props: {
			trpcState: data,
		},
		revalidate: 1,
	};
};

export default function IndexPage() {
	const result = trpc.greeting.useQuery({ name: "client" });

	if (!result.data) {
		console.log("this should not happen")
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
	width: "100vw",
	height: "100vh",
	display: "flex",
	justifyContent: "center",
	alignItems: "center",
};
