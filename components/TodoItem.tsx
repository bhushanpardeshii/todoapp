// components/TodoItem.tsx
import { useState, useEffect } from "react";
import crublibrary from "@/lib/crud";

export default function TodoItem({
    todo,
    refresh,
}: {
    todo: any;
    refresh: () => void;
}) {
    console.log('TodoItem received todo:', todo);


    const [editValue, setEditValue] = useState(todo?.value || 0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [isEditing, setIsEditing] = useState(false);

    // Update editValue when todo changes
    useEffect(() => {
        console.log('Todo value changed:', todo?.value);
        if (typeof todo?.value === 'number') {
            setEditValue(todo.value);
        }
    }, [todo?.value]);

    const handleUpdate = async () => {
        try {
            setLoading(true);
            setError("");

            if (typeof editValue !== 'number') {
                setError("Value must be a number");
                return;
            }

            const res = await crublibrary.update(todo.id, { value: editValue });
            if (res.error) {
                setError(res.error);
                return;
            }
            setIsEditing(false);
            refresh();
        } catch (err) {
            console.error("Update error", err);
            setError("An error occurred while updating.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        try {
            setLoading(true);
            setError("");
            const res = await crublibrary.delete(todo.id);
            if (res.error) {
                if (res.error.includes("Cannot recharge again")) {
                    setError("Credits exhausted. You have already used your recharge option.");
                } else if (res.error.includes("Not found")) {
                    // If todo is not found, clear localStorage and refresh
                    localStorage.removeItem("myTodos");
                    refresh();
                    return;
                } else {
                    setError(res.error);
                }
                return;
            }
            const stored = localStorage.getItem("myTodos");
            const ids = stored ? JSON.parse(stored) : [];
            localStorage.setItem("myTodos", JSON.stringify(ids.filter((i: string) => i !== todo.id)));
            refresh();
        } catch (err) {
            console.error("Delete error", err);
            setError("An error occurred while deleting.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="border p-3 rounded flex justify-between items-center">
            {isEditing ? (
                <input
                    type="number"
                    step="0.01"
                    className="border px-2 py-1 rounded w-1/3"
                    value={editValue.toString()}
                    onChange={(e) => {
                        const num = parseFloat(e.target.value);
                        setEditValue(isNaN(num) ? 0 : num);
                    }}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') handleUpdate();
                        if (e.key === 'Escape') setIsEditing(false);
                    }}
                />
            ) : (
                <span className="text-gray-300">
                    {typeof todo?.value === 'number' ? todo.value.toFixed(2) : 'N/A'}
                </span>
            )}
            <div className="flex gap-2">
                {isEditing ? (
                    <>
                        <button
                            onClick={handleUpdate}
                            disabled={loading}
                            className="bg-green-500 text-white px-2 py-1 rounded text-sm"
                        >
                            {loading ? "Saving..." : "Save"}
                        </button>
                        <button
                            onClick={() => setIsEditing(false)}
                            disabled={loading}
                            className="bg-gray-500 text-white px-2 py-1 rounded text-sm"
                        >
                            Cancel
                        </button>
                    </>
                ) : (
                    <>
                        <button
                            onClick={() => setIsEditing(true)}
                            className="bg-blue-500 text-white px-2 py-1 rounded text-sm"
                        >
                            Edit
                        </button>
                        <button
                            onClick={handleDelete}
                            disabled={loading}
                            className="bg-red-500 text-white px-2 py-1 rounded text-sm"
                        >
                            {loading ? "Deleting..." : "Delete"}
                        </button>
                    </>
                )}
            </div>
            {error && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                    <span className="block sm:inline">{error}</span>
                </div>
            )}
        </div>
    );
}
