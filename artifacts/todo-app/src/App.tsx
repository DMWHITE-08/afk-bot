import TodoForm from './components/TodoForm';
import TodoFilter from './components/TodoFilter';
import TodoList from './components/TodoList';
import { useTodos } from './hooks/useTodos';

export default function App() {
  const {
    todos,
    filter,
    setFilter,
    sort,
    setSort,
    searchQuery,
    setSearchQuery,
    addTodo,
    deleteTodo,
    toggleTodo,
    updateTodo,
    clearCompleted,
    filteredTodos,
    stats,
  } = useTodos();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 text-white">
      <header className="bg-gradient-to-r from-slate-900 to-slate-800 border-b border-cyan-500/30 px-6 py-8">
        <h1 className="text-4xl font-bold font-mono text-cyan-400 mb-2">✅ TaskForge</h1>
        <p className="text-gray-400">Stay organized with local storage persistence</p>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Form */}
        <TodoForm onAdd={addTodo} />

        {/* Filter & Stats */}
        <TodoFilter
          filter={filter}
          onFilterChange={setFilter}
          sort={sort}
          onSortChange={setSort}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          stats={stats}
        />

        {/* Todo List */}
        <TodoList
          todos={filteredTodos}
          onToggle={toggleTodo}
          onDelete={deleteTodo}
          onUpdate={updateTodo}
        />

        {/* Clear Completed Button */}
        {stats.completed > 0 && (
          <div className="flex justify-center">
            <button
              onClick={clearCompleted}
              className="bg-red-600/20 hover:bg-red-600/30 text-red-400 hover:text-red-300 font-bold py-2 px-6 rounded border border-red-500/30 transition uppercase tracking-wide text-sm"
            >
              🗑️ Clear {stats.completed} Completed {stats.completed === 1 ? 'Task' : 'Tasks'}
            </button>
          </div>
        )}
      </main>

      <footer className="bg-slate-900/50 border-t border-cyan-500/20 px-6 py-4 mt-12">
        <p className="text-center text-gray-500 text-sm">
          💾 All tasks are automatically saved to local storage
        </p>
      </footer>
    </div>
  );
}
