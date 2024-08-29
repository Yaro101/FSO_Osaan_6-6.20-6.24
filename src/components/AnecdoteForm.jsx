
const AnecdoteForm = ({ onSubmit }) => {
  
  const onCreate = (event) => {
    event.preventDefault();
    const content = event.target.anecdote.value.trim();
    onSubmit(content)
    event.target.anecdote.value = "";
  };

  return (
    <div>
      <h3>create new</h3>
      <form onSubmit={onCreate}>
        <input name="anecdote" />
        <button type="submit">create</button>
      </form>
    </div>
  );
};

export default AnecdoteForm;
