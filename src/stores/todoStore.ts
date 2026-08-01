/**
 * Pre-trip checklist items, scoped by trip. Includes a toggleComplete helper
 * since flipping is_complete is the most common interaction.
 */

import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import type { Todo, TodoInsert, TodoUpdate } from "@/types/models";

export type NewTodoInput = Omit<TodoInsert, "trip_id">;

interface TodoState {
  todos: Todo[];
  loading: boolean;
  error: string | null;

  fetchByTrip: (tripId: string) => Promise<void>;
  createTodo: (tripId: string, input: NewTodoInput) => Promise<Todo | null>;
  updateTodo: (id: string, patch: TodoUpdate) => Promise<void>;
  toggleComplete: (id: string) => Promise<void>;
  deleteTodo: (id: string) => Promise<void>;
  clear: () => void;
}

export const useTodoStore = create<TodoState>((set, get) => ({
  todos: [],
  loading: false,
  error: null,

  fetchByTrip: async (tripId) => {
    set({ loading: true, error: null });
    const { data, error } = await supabase
      .from("todos")
      .select("*")
      .eq("trip_id", tripId)
      .order("due_date", { ascending: true });
    if (error) set({ error: error.message });
    else set({ todos: data ?? [] });
    set({ loading: false });
  },

  createTodo: async (tripId, input) => {
    const payload: TodoInsert = { ...input, trip_id: tripId };
    const { data, error } = await supabase
      .from("todos")
      .insert(payload)
      .select()
      .single();
    if (error) {
      set({ error: error.message });
      throw error;
    }
    set((state) => ({ todos: [...state.todos, data] }));
    return data;
  },

  updateTodo: async (id, patch) => {
    const { data, error } = await supabase
      .from("todos")
      .update(patch)
      .eq("id", id)
      .select()
      .single();
    if (error) {
      set({ error: error.message });
      throw error;
    }
    set((state) => ({
      todos: state.todos.map((t) => (t.id === id ? data : t)),
    }));
  },

  toggleComplete: async (id) => {
    const current = get().todos.find((t) => t.id === id);
    if (!current) return;
    await get().updateTodo(id, { is_complete: !current.is_complete });
  },

  deleteTodo: async (id) => {
    const { error } = await supabase.from("todos").delete().eq("id", id);
    if (error) {
      set({ error: error.message });
      throw error;
    }
    set((state) => ({ todos: state.todos.filter((t) => t.id !== id) }));
  },

  clear: () => set({ todos: [] }),
}));
