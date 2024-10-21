import { component$, useSignal, useTask$ } from "@builder.io/qwik";
import {
  routeLoader$,
  Form,
  routeAction$,
  server$,
} from "@builder.io/qwik-city";

export const useDadJoke = routeLoader$(async () => {
  const response = await fetch("https://icanhazdadjoke.com/", {
    headers: { Accept: "application/json" },
  });

  return (await response.json()) as {
    id: string;
    joke: string;
    status: number;
  };
});

export const useJokeVoteAction = routeAction$((props) => {
  console.log("VOTE", props);
});

export default component$(() => {
  const isFavoriteSignal = useSignal(false);
  // Calling our `useDadJoke` hook, will return a reactive signal to the loaded data.
  const dadJokeSignal = useDadJoke();
  const favouriteJokeAction = useJokeVoteAction();
  useTask$(({ track }) => {
    track(() => isFavoriteSignal.value);
    console.log("FAVOURITE (isomorphic)", isFavoriteSignal.value);
    server$(() => {
      console.log("FAVOURITE (server)", isFavoriteSignal.value);
    })();
  });

  return (
    <section class="section bright">
      <p>{dadJokeSignal.value.joke}</p>
      <Form action={favouriteJokeAction}>
        <input type="hidden" name="jokeId" value={dadJokeSignal.value.id} />
        <button name="vote" value="up">
          👍
        </button>
        <button name="vote" value="down">
          👎
        </button>
      </Form>
      <button
        onClick$={() => (isFavoriteSignal.value = !isFavoriteSignal.value)}
      >
        {isFavoriteSignal.value ? "❤️" : "🤍"}
      </button>
    </section>
  );
});
