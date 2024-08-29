import { useReducer } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AnecdoteForm from "./components/AnecdoteForm";
import Notification from "./components/Notification";
import { getAnecdotes, createAnecdote, updateAnecdote } from "./requests";

const notificationReducer = (state, action) => {
  switch (action.type) {
    case "SHOW_NOTIFICATION":
      return {
        message: action.payload.message,
        duration: action.payload.duration,
      };

    case "CLEAR_NOTIFICATION":
      return {
        message: "",
        duration: 0,
      };

    default:
      return state;
  }
};

const App = () => {
  const queryClient = useQueryClient();
  const [notification, notificationDispatch] = useReducer(notificationReducer, {
    message: "",
    duration: 0,
  });
  console.log('App.jsx: Notification state:', notification)

  // Handle notification dispatch
  const showNotification = (message, duration = 5) => {
    notificationDispatch({
      type: "SHOW_NOTIFICATION",
      payload: { message, duration },
    });
    console.log(`Showing notification: ${message}`)
    setTimeout(() => {
      notificationDispatch({ type: "CLEAR_NOTIFICATION" });
      console.log('Notification cleared')
    }, duration * 1000);
  };

  console.log(`Notification state: ${notification}`)

  // Handle the creation of new anecdote
  const newAnecdoteMutation = useMutation({
    mutationFn: createAnecdote,
    onSuccess: (newAnecdote) => {
      const anecdotes = queryClient.getQueryData(["anecdotes"]) || [];
      queryClient.setQueryData(["anecdotes"], [...anecdotes, newAnecdote]);
      showNotification(`New anecdote added: ${newAnecdote.content}`, 5);
    },
    onError: () => {
      showNotification("An error occured while adding the anecdote.", 5);
    },
  });

  const handleCreateAnecdote = (content) => {
    if (content.length < 5) {
      showNotification(
        "too short anecdote, must have length 5 characters or more.",
        5
      );
      return;
    }
    newAnecdoteMutation.mutate({ content, votes: 0 });
  };

  // Handle updating the vote count
  const updateAnecdoteMutation = useMutation({
    mutationFn: updateAnecdote,
    onSuccess: (updateAnecdote) => {
      queryClient.invalidateQueries(["anecdotes"]);
      showNotification(`anecdote '${updateAnecdote.content}' voted!`, 5)
    },
    onError: (error) => {
      console.error("Voting error details: ", error.message || error.response);
      showNotification("An error occured while voting.", 5);
    },
  });

  // Handle vote
  const handleVote = (anecdote) => {
    updateAnecdoteMutation.mutate({
      ...anecdote,
      votes: anecdote.votes + 1,
    });
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
