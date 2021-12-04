import { Item } from "./types";
import { formatDate, uniqId } from "./utils";

class Queue {
  private readonly TIMEOUT = 5000;

  private queued: Item[] = [];
  private consumed: Item[] = [];

  produce(msg: string): Item {
    const item = { id: uniqId(), msg, timeout: null };
    this.queued.push(item);
    return item;
  }

  consume(): Item | undefined {
    const item = this.queued.find((item) => !item.timeout);

    if (item) {
      setTimeout(() => (item.timeout = null), this.TIMEOUT);
      item.timeout = formatDate(new Date(new Date().getTime() + this.TIMEOUT));
    }

    return item;
  }

  confirm(id: string): Item | undefined {
    const itemIdx = this.queued.findIndex((item) => item.id === id);
    if (itemIdx < 0) {
      return;
    }

    const item = this.queued.splice(itemIdx, 1)[0];
    item.timeout = null;
    this.consumed.push(item);
    return item;
  }

  getQueued(): Item[] {
    return this.queued;
  }

  getConsumed(): Item[] {
    return this.consumed;
  }
}

export default function queue(): Queue {
  return new Queue();
}
