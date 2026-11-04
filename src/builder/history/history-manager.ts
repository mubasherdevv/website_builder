import { PageDocument } from "@/types/builder";

/**
 * Bounded history manager for undo/redo operations in the visual builder
 * STACK.md Section 8: Use undo/redo history with bounded memory and checkpointing
 */
export class HistoryManager {
  private history: PageDocument[] = [];
  private index = -1;
  private readonly maxLimit: number;

  constructor(initialDocument: PageDocument, maxLimit = 30) {
    this.maxLimit = maxLimit;
    this.history = [structuredClone(initialDocument)];
    this.index = 0;
  }

  public get current(): PageDocument {
    return structuredClone(this.history[this.index]);
  }

  public get canUndo(): boolean {
    return this.index > 0;
  }

  public get canRedo(): boolean {
    return this.index < this.history.length - 1;
  }

  public get length(): number {
    return this.history.length;
  }

  public push(newDoc: PageDocument): PageDocument {
    // Drop any redo history beyond current index
    this.history = this.history.slice(0, this.index + 1);

    // Append new snapshot
    this.history.push(structuredClone(newDoc));

    // Enforce max boundary limit
    if (this.history.length > this.maxLimit) {
      this.history.shift();
    } else {
      this.index++;
    }

    return this.current;
  }

  public undo(): PageDocument | null {
    if (!this.canUndo) return null;
    this.index--;
    return this.current;
  }

  public redo(): PageDocument | null {
    if (!this.canRedo) return null;
    this.index++;
    return this.current;
  }

  public reset(initialDoc: PageDocument): void {
    this.history = [structuredClone(initialDoc)];
    this.index = 0;
  }
}

