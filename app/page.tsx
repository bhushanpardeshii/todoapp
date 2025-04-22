"use client"
import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import crublibrary from "@/lib/crud";
import TodoItem from "@/components/TodoItem";
import { Todo } from "@/types/todo";

export default function Home() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [value, setValue] = useState("");
  const [txHash, setTxHash] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Redirect to sign-in if not authenticated
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/sign-in");
    }
  }, [isLoaded, isSignedIn, router]);

  const fetchTodos = async () => {
    const stored = localStorage.getItem("myTodos");
    const ids = stored ? JSON.parse(stored) : [];
    console.log('Fetching todos with IDs:', ids);
    const result = [];
    let hasErrors = false;

    for (const id of ids) {
      if (!id) continue; // Skip null/undefined IDs
      try {
        const todo = await crublibrary.get(id);
        if (todo.error) {
          console.error(`Error fetching todo ${id}:`, todo.error);
          hasErrors = true;
          continue;
        }
        console.log('Fetched todo:', { id, ...todo });
        // Ensure value is a number and handle any conversion issues
        const numericValue = parseFloat(todo.value);
        if (isNaN(numericValue)) {
          console.error(`Invalid value for todo ${id}:`, todo.value);
          hasErrors = true;
          continue;
        }
        result.push({
          id,
          value: numericValue,
          txHash: todo.txHash
        });
      } catch (err) {
        console.error("Error fetching todo:", err);
        hasErrors = true;
      }
    }

    // If we encountered any errors, clear localStorage and start fresh
    if (hasErrors) {
      console.log('Clearing localStorage due to errors');
      localStorage.removeItem("myTodos");
      setTodos([]);
      return;
    }

    console.log('Setting todos:', result);
    setTodos(result);
  };

  const handleCreate = async () => {
    if (!value || !txHash) return;

    try {
      setLoading(true);
      setErrorMsg("");

      // Validate that the value is a number
      const numericValue = parseFloat(value);
      if (isNaN(numericValue)) {
        setErrorMsg("Value must be a number");
        return;
      }

      const res = await crublibrary.create({ value: numericValue, txHash });
      console.log('Created todo response:', res);

      if (res.error) {
        if (res.error.includes("Cannot recharge again")) {
          setErrorMsg("Credits exhausted. Cannot recharge again.");
        } else {
          setErrorMsg(res.error);
        }
        return;
      }

      if (!res.id) {
        setErrorMsg("Failed to create todo: No ID returned");
        return;
      }

      const stored = localStorage.getItem("myTodos");
      const ids = stored ? JSON.parse(stored) : [];
      localStorage.setItem("myTodos", JSON.stringify([...ids, res.id]));
      await fetchTodos();
      setValue("");
      setTxHash("");
    } catch (err: unknown) {
      console.error(err);
      setErrorMsg("An error occurred. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isSignedIn) {
      fetchTodos();
    }
  }, [isSignedIn]);

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  if (!isSignedIn) {
    return null; // Will be redirected by useEffect
  }

  return (
    <div className="max-w-xl mx-auto mt-10 px-4">
      <h1 className="text-2xl font-bold mb-4">📋 My Todos</h1>

      <div className="mb-4 space-y-2">
        <input
          className="w-full border p-2 rounded"
          placeholder="Value (e.g. 0.5)"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <input
          className="w-full border p-2 rounded"
          placeholder="TxHash (e.g. 0x123...)"
          value={txHash}
          onChange={(e) => setTxHash(e.target.value)}
        />
        <button
          onClick={handleCreate}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {loading ? "Creating..." : "Add Todo"}
        </button>
      </div>

      {errorMsg && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{errorMsg}</span>
        </div>
      )}

      <div className="space-y-3">
        {todos.map((todo) => (
          <TodoItem key={todo.id} todo={todo} refresh={fetchTodos} />
        ))}
      </div>
    </div>
  );
}
