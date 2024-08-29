import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AnecdoteForm from "./components/AnecdoteForm";
import Notification from "./components/Notification";
import { getAnecdotes, createAnecdote, updateAnecdote } from "./requests";

const App = () => {
  const queryClient = useQueryClient();
  const [notification, setNotification] = useState({
    message: "",
    duration: 0,
  });

  // Handle notification display
  const showNotification = (message, duration = 5) => {
    setNotification({ message, duration });
    setTimeout(
      () => setNotification({ message: "", duration: 0 }),
      duration * 1000
    );
  };

  // Handle the creation of new anecdote
  const newAnecdoteMutation = useMutation({
    mutationFn: createAnecdote,
    onSuccess: (newAnecdote) => {
      const anecdotes = queryClient.getQueryData(["anecdotes"]) || [];
      queryClient.setQueryData(["anecdotes"], [...anecdotes, newAnecdote]);
      showNotification(`New anecdote added: ${newAnecdote.content}`);
    },
    onError: () => {
      showNotification("An error occured while adding the anecdote.", 5);
    },
  });

  const handleCreateAnecdote = (content) => {
    if (content.length < 5) {
      showNotification(
        "Anecdote is too short. Must be at least 5 characters long.",
        5
      );
      return;
    }
    newAnecdoteMutation.mutate({ content, votes: 0 });
  };

  // Handle updating the vote count
  const updateAnecdoteMutation = useMutation({
    mutationFn: updateAnecdote,
    onSuccess: () => {
      queryClient.invalidateQueries(["anecdotes"]);
    },
    onError: (error) => {
      console.error('Voting error details: ', error.message || error.message)
      showNotification("An error occured while voting.", 5);
    },
  });

  // Handle vote
  const handleVote = (anecdote) => {
    updateAnecdoteMutation.mutate(
      {
        ...anecdote,
        votes: anecdote.votes + 1,
      }
    );
    // Notification message
    console.log(`You voted for: ${anecdote.content}`);
  };

  const result = useQuery({
    queryKey: ["anecdotes"],
    queryFn: getAnecdotes,
    retry: false,
  });
  console.log(JSON.parse(JSON.stringify(result)));

  if (result.isLoading) {
    return <div>loading data...</div>;
  }

  if (result.isError) {
    return <div>anecdote service not available due to problem in server</div>;
  }

  const anecdotes = result.data;

  return (
    <div>
      <h3>Anecdote app</h3>
      <Notification
        message={notification.message}
        duration={notification.duration}
      />
      <AnecdoteForm onSubmit={handleCreateAnecdote} />
      {anecdotes.map((anecdote) => (
        <div key={anecdote.id}>
          <div>{anecdote.content}</div>
          <div>
            has {anecdote.votes}
            <button onClick={() => handleVote(anecdote)}>vote</button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default App;
