# ✅ TaskForge - Todo List Application

A modern, fully-featured todo list application with local storage persistence.

## Features

✨ **Core Functionality**
- ➕ Create new tasks with title, priority, category, and due date
- ✏️ Edit existing tasks inline
- ✅ Mark tasks as complete/incomplete
- 🗑️ Delete tasks permanently
- 💾 Automatic local storage persistence

🎯 **Filtering & Organization**
- 📋 View all tasks
- ⏳ View only active (incomplete) tasks
- ✅ View only completed tasks
- 🔍 Search tasks by title or category

📊 **Sorting Options**
- 📅 Sort by newest first (creation date)
- 🔥 Sort by priority (high → medium → low)
- 🔤 Sort alphabetically by title

🏆 **Priority Levels**
- 🔥 High Priority (urgent tasks)
- ⚡ Medium Priority (standard tasks)
- ✓ Low Priority (less urgent tasks)

📈 **Statistics**
- Total tasks count
- Completed tasks count
- Active (incomplete) tasks count
- High-priority tasks count

## Installation

```bash
cd artifacts/todo-app
npm install
```

## Development

```bash
npm run dev
```

The app will run at `http://localhost:5173`

## Build

```bash
npm run build
```

## Project Structure

```
src/
├── components/
│   ├── TodoForm.tsx        # Task creation form
│   ├── TodoFilter.tsx      # Filter, search, sort controls
│   ├── TodoList.tsx        # Task list display
│   └── TodoItem.tsx        # Individual task component
├── hooks/
│   ├── useLocalStorage.ts  # LocalStorage hook
│   └── useTodos.ts         # Todo state management
├── types/
│   └── index.ts            # TypeScript interfaces
├── App.tsx                 # Main app component
└── main.tsx                # Entry point
```

## Data Persistence

All tasks are automatically saved to browser's `localStorage` under the key `todos`. Data persists across:
- Page reloads
- Browser closing and reopening
- Window/tab navigation

## Technologies

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Vite** - Build tool
- **UUID** - Unique task IDs

## Usage Tips

1. **Quick Add**: Type task title and click "Add Task"
2. **Set Priority**: Choose priority level before adding (defaults to Medium)
3. **Add Category**: Organize tasks with custom categories
4. **Set Due Date**: Optional due date for task tracking
5. **Search**: Use search to find tasks by name or category
6. **Edit Inline**: Click edit (✏️) button to modify task text
7. **Quick Complete**: Click checkbox to mark task as done
8. **Cleanup**: Clear all completed tasks with one click

## Color Scheme

- **🔥 High**: Red (#ef4444)
- **⚡ Medium**: Yellow (#eab308)
- **✓ Low**: Green (#22c55e)
- **Accent**: Cyan (#06b6d4)
- **Background**: Dark Slate (#0f172a)

## License

MIT
