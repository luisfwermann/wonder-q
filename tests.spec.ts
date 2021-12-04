import { formatDate } from "./src/utils";
import { queue, server } from "./index";
import supertest from "supertest";
import { Item } from "./src/types";

const request = supertest(server);
const qTimeout = (queue as any).TIMEOUT;

jest.useFakeTimers();
jest.spyOn(global, "setTimeout");

describe("Wonder-Q", (): void => {
  beforeEach(() => {
    // Reset private values
    jest.runOnlyPendingTimers();
    (queue as any).queued = [];
    (queue as any).consumed = [];
  });

  afterAll(() => {
    server.close();
  });

  describe("produce", (): void => {
    it("should be able to produce sequential messages", async (): Promise<void> => {
      await doProduce("MESSAGE A");

      const onQueue = queue.getQueued();
      expect(onQueue.length).toBe(1);
      expect(onQueue[0].msg).toEqual("MESSAGE A");

      await doProduce("MESSAGE B");
      expect(onQueue.length).toBe(2);
      expect(onQueue[1].msg).toEqual("MESSAGE B");
    });
  });

  describe("consume", (): void => {
    it("should be able to consume the available messages and set them a timeout", async (): Promise<void> => {
      await doProduce("MESSAGE A");
      await doProduce("MESSAGE B");
      await doConsume("MESSAGE A");
      await doConsume("MESSAGE B");

      const onQueue = queue.getQueued();
      expect(onQueue.length).toBe(2);
      expect(onQueue[0].timeout).toBeTruthy();
      expect(onQueue[1].timeout).toBeTruthy();
    });

    it("should not be able to consume messages with setted timeout", async (): Promise<void> => {
      await doProduce("MESSAGE A");
      await doConsume("MESSAGE A");

      // Extra consumes that do not expect a message in return
      await doConsume(null);
      await doConsume(null);

      const onQueue = queue.getQueued();
      expect(onQueue.length).toBe(1);
      expect(onQueue[0].timeout).toBeTruthy();
    });

    it("should clear timeout from message after it expires and be able to consumed it again in the original order", async (): Promise<void> => {
      await doProduce("MESSAGE A");
      await doProduce("MESSAGE B");
      await doConsume("MESSAGE A");
      jest.runOnlyPendingTimers(); // Expire timeouts

      await doConsume("MESSAGE A");
      await doConsume("MESSAGE B");
      jest.runOnlyPendingTimers(); // Expire timeouts

      await doConsume("MESSAGE A");

      const onQueue = queue.getQueued();
      expect(onQueue.length).toBe(2);
      expect(onQueue[0].timeout).toBeTruthy();
      expect(onQueue[1].timeout).toBeFalsy();
    });
  });

  describe("confirm", () => {
    it("should be able to confirm finishing consuming a message", async (): Promise<void> => {
      const item = await doProduce("MESSAGE A");
      await doProduce("MESSAGE B");
      await doConsume(item.msg);
      await doConfirm(item.id);

      const onQueue = queue.getQueued();
      expect(onQueue.length).toBe(1);
      expect(onQueue[0].msg).toBe("MESSAGE B");

      const consumed = queue.getConsumed();
      expect(consumed.length).toBe(1);
      expect(consumed[0].msg).toBe("MESSAGE A");
    });

    it("should not be able to consume a confirmed message", async (): Promise<void> => {
      const item = await doProduce("MESSAGE A");
      await doConsume(item.msg);
      await doConfirm(item.id);

      await doConsume(null);

      const onQueue = queue.getQueued();
      expect(onQueue.length).toBe(0);

      const consumed = queue.getConsumed();
      expect(consumed.length).toBe(1);
    });
  });

  async function doProduce(msg: string): Promise<Item> {
    const res = await request.post("/produce").type("text").send(msg);
    expect(res.body.id).toBeTruthy();
    expect(res.body.msg).toEqual(msg);
    return res.body;
  }

  async function doConsume(expectedMsg: string | null): Promise<Item> {
    const res = await request.post("/consume");

    if (expectedMsg) {
      const expectedTimeout = formatDate(
        new Date(new Date().getTime() + qTimeout)
      );

      expect(res.body.id).toBeTruthy();
      expect(res.body.msg).toEqual(expectedMsg);
      expect(res.body.timeout).toEqual(expectedTimeout);
      return res.body;
    } else {
      // Should not get a message to consume
      expect(res.body).toEqual({});
      return {} as any;
    }
  }

  async function doConfirm(msgId: string): Promise<Item> {
    const res = await request.post("/confirm").type("text").send(msgId);
    return res.body;
  }
});
