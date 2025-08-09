export type Job = { id: string; type: 'summarize' | 'caption' | 'download'; payload: any };

export class JobRunner {
  private listeners: Array<(s: any) => void> = [];

  enqueue(job: Job) {
    // Placeholder: In future, offload to worker
    setTimeout(() => this.emit({ id: job.id, status: 'done' }), 300);
  }

  onUpdate(cb: (status: any) => void) {
    this.listeners.push(cb);
  }

  private emit(s: any) {
    this.listeners.forEach((l) => l(s));
  }
}
